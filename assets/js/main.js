class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.leftPressed = false;
    this.rightPressed = false;
  }

  preload() { }

  create() {
    // === JUGADOR ===
    this.player = this.physics.add.sprite(180, 500, null)
      .setOrigin(0.5)
      .setDisplaySize(40, 40)
      .setBounce(0);

    this.player.setTint(0x0000aa);

    // === PLATAFORMAS ===
    this.platforms = this.physics.add.staticGroup();

    // Generamos varias plataformas unidireccionales en posiciones aleatorias
    for (let i = 0; i < 10; i++) {
      const y = 600 - i * 100;
      const platform = this.platforms.create(Phaser.Math.Between(60, 300), y, null)
        .setOrigin(0.5)
        .setDisplaySize(100, 20)
        .refreshBody();

      platform.setTint(0x00aa00);
      platform.isOneWay = true;
    }

    // === CONTROLES TECLADO ===
    this.cursors = this.input.keyboard.createCursorKeys();

    // === BOTONES TÁCTILES ===
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');

    leftBtn.addEventListener('pointerdown', () => this.leftPressed = true);
    leftBtn.addEventListener('pointerup', () => this.leftPressed = false);
    leftBtn.addEventListener('pointerout', () => this.leftPressed = false);
    leftBtn.addEventListener('pointercancel', () => this.leftPressed = false);

    rightBtn.addEventListener('pointerdown', () => this.rightPressed = true);
    rightBtn.addEventListener('pointerup', () => this.rightPressed = false);
    rightBtn.addEventListener('pointerout', () => this.rightPressed = false);
    rightBtn.addEventListener('pointercancel', () => this.rightPressed = false);
  }

  update() {
    const moveSpeed = 200;
    const screenWidth = this.scale.width;

    // === Movimiento lateral ===
    if (this.cursors.left.isDown || this.leftPressed) {
      this.player.setVelocityX(-moveSpeed);
    } else if (this.cursors.right.isDown || this.rightPressed) {
      this.player.setVelocityX(moveSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    // === Envolvimiento horizontal ===
    const halfWidth = this.player.displayWidth / 2;
    if (this.player.x < -halfWidth) {
      this.player.x = screenWidth + halfWidth;
    } else if (this.player.x > screenWidth + halfWidth) {
      this.player.x = -halfWidth;
    }

    // === Colisión condicional con plataformas unidireccionales ===
    this.physics.overlap(this.player, this.platforms, (player, platform) => {
      const isFalling = player.body.velocity.y > 0;
      const playerBottom = player.body.bottom;
      const platformTop = platform.body.top;
      const verticalOverlap = Math.abs(playerBottom - platformTop) < 10;

      if (platform.isOneWay && isFalling && verticalOverlap) {
        player.setVelocityY(-550); // rebote solo si cae desde arriba
      }
    }, null, this);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: true
    }
  },
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  parent: 'game-container'
};

new Phaser.Game(config);

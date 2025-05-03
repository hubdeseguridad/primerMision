class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.leftPressed = false;
    this.rightPressed = false;
  }

  preload() {
    // Nada que cargar aún
  }

  create() {
    // === JUGADOR ===
    this.player = this.physics.add.sprite(180, 500, null) // posición inicial
      .setOrigin(0.5)
      .setDisplaySize(40, 40) // tamaño visible
      .setBounce(0)           // sin rebote automático
      .setCollideWorldBounds(true); // no salirse por arriba/abajo

    // Colorear placeholder como cuadrado azul oscuro
    this.player.setTint(0x0000aa);

    // === PLATAFORMA ===
    this.platforms = this.physics.add.staticGroup(); // no se mueven
    const ground = this.platforms.create(180, 600, null)
      .setOrigin(0.5)
      .setDisplaySize(100, 20) // tamaño visible
      .refreshBody();

    ground.setTint(0x00aa00); // verde

    // === COLISIONES ===
    this.physics.add.collider(this.player, this.platforms, this.handlePlatformLanding, null, this);

    // === CONTROLES ===
    this.cursors = this.input.keyboard.createCursorKeys();


    // Botones móviles
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
    // === Movimiento lateral ===
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // === Combinar teclado y botones ===
    const cursors = this.input.keyboard.createCursorKeys();

    const moveSpeed = 200;
    if (cursors.left.isDown || this.leftPressed) {
      this.player.setVelocityX(-moveSpeed);
    } else if (cursors.right.isDown || this.rightPressed) {
      this.player.setVelocityX(moveSpeed);
    } else {
      this.player.setVelocityX(0);
    }

  }

  handlePlatformLanding(player, platform) {
    const isFalling = player.body.velocity.y > 0;

    // Calculamos si el jugador realmente cae sobre la plataforma
    const playerBottom = player.body.bottom;
    const platformTop = platform.body.top;

    const overlapThreshold = 5;

    if (player.body.touching.down && platform.body.touching.up) {
      player.setVelocityY(-550);
    }
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
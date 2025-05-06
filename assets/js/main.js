class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.leftPressed = false;
    this.rightPressed = false;
    this.gameStarted = false;

    this.score = 0;
    this.lastTouchedPlatformY = Infinity;
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
  }

  create() {
    // === FONDO PARALLAX ===
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height * 2, 'sky')
      .setOrigin(0, 1)
      .setScrollFactor(0);

    // === TEXTO DE INICIO ===
    this.startText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Presiona espacio o toca para comenzar', {
      fontSize: '15px',
      fill: '#000',
      padding: { x: 10, y: 6 },
      align: 'center'
    }).setOrigin(0.5);

    // === SISTEMA DE PUNTOS ===
    this.scoreText = this.add.text(10, 10, 'Puntos: 0', {
      fontSize: '18px',
      fill: '#000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0).setDepth(10);

    // === PLATAFORMAS ===
    this.platforms = this.physics.add.staticGroup();
    this.platformSpacing = 100;

    for (let i = 0; i < 10; i++) {
      this.createPlatform(Phaser.Math.Between(30, this.scale.width - 30), 600 - i * this.platformSpacing);
    }

    // === JUGADOR ===
    const bottomPlatform = this.platforms.getChildren()[0];
    this.player = this.physics.add.existing(
      this.add.rectangle(bottomPlatform.x, bottomPlatform.y - 40, 30, 30, 0x0000aa)
    );
    this.player.body.setCollideWorldBounds(false).setBounce(0).allowGravity = false;

    // === CÁMARA ===
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setDeadzone(100, 200).setBounds(0, -Infinity, this.scale.width, Infinity);

    // === TRACKING ===
    this.maxPlayerY = this.player.y;
    this.lastGeneratedPlatformY = this.getHighestPlatformY();

    // === CONTROLES ===
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    this.input.on('pointerdown', () => this.startGame());

    this.setupTouchControls();
  }

  setupTouchControls() {
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    if (leftBtn && rightBtn) {
      const setButtonState = (btn, state) => {
        btn.addEventListener('pointerdown', () => this[state] = true);
        btn.addEventListener('pointerup', () => this[state] = false);
        btn.addEventListener('pointerout', () => this[state] = false);
        btn.addEventListener('pointercancel', () => this[state] = false);
      };
      setButtonState(leftBtn, 'leftPressed');
      setButtonState(rightBtn, 'rightPressed');
    }
  }

  startGame() {
    if (this.gameStarted) return;
    this.gameStarted = true;
    this.startText.destroy();
    this.player.body.allowGravity = true;
    this.player.body.setVelocityY(-550);
  }

  createPlatform(x, y) {
    const platform = this.platforms.create(x, y, null)
      .setOrigin(0.5)
      .setDisplaySize(60, 20)
      .refreshBody();
    platform.gfx = this.add.rectangle(x, y, 60, 20, 0x00aa00);
    platform.isOneWay = true;
  }

  spawnPlatform(y) {
    this.createPlatform(Phaser.Math.Between(30, this.scale.width - 30), y);
  }

  getHighestPlatformY() {
    return Math.min(...this.platforms.getChildren().map(platform => platform.y));
  }

  update() {
    if (!this.gameStarted) return;

    const moveSpeed = 200;
    const screenWidth = this.scale.width;

    // === MOVIMIENTO HORIZONTAL ===
    this.player.body.setVelocityX(
      (this.cursors.left.isDown || this.leftPressed) ? -moveSpeed :
      (this.cursors.right.isDown || this.rightPressed) ? moveSpeed : 0
    );

    // === ENVOLVIMIENTO ===
    const halfWidth = this.player.width / 2;
    if (this.player.x < -halfWidth) this.player.x = screenWidth + halfWidth;
    else if (this.player.x > screenWidth + halfWidth) this.player.x = -halfWidth;

    // === COLISIONES UNIDIRECCIONALES + SCORE ===
    this.physics.overlap(this.player, this.platforms, (player, platform) => {
      if (platform.isOneWay && player.body.velocity.y > 0 && Math.abs(player.body.bottom - platform.body.top) < 10) {
        player.body.setVelocityY(-550);
        if (platform.y < this.lastTouchedPlatformY) {
          this.lastTouchedPlatformY = platform.y;
          this.scoreText.setText('Puntos: ' + (++this.score));
        }
      }
    });

    // === TRACK ALTURA MÁXIMA ===
    this.maxPlayerY = Math.min(this.maxPlayerY, this.player.y);

    // === GENERACIÓN CON BUFFER DE 6 PLATAFORMAS ===
    const bufferHeight = 6 * this.platformSpacing;
    while (this.lastGeneratedPlatformY > this.player.y - bufferHeight) {
      this.spawnPlatform(this.lastGeneratedPlatformY -= this.platformSpacing);
    }

    // === LIMPIEZA ===
    const cameraBottom = this.cameras.main.scrollY + this.scale.height;
    this.platforms.getChildren().forEach(platform => {
      if (platform.y > cameraBottom + 200) {
        platform.gfx?.destroy();
        platform.destroy();
      }
    });

    // === PARALLAX ===
    this.bg.tilePositionY = this.cameras.main.scrollY;
  }
}

// === CONFIGURACIÓN ===
const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
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

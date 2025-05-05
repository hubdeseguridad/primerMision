class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.leftPressed = false;
    this.rightPressed = false;
    this.gameStarted = false;
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
  }

  create() {
    // === FONDO PARALLAX ===
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height * 2, 'sky')
      .setOrigin(0, 1)
      .setScrollFactor(0); // Parallax manual

    // === TEXTO DE INICIO ===
    this.startText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Presiona espacio o toca para comenzar', {
      fontSize: '15px',
      fill: '#000',
      padding: { x: 10, y: 6 },
      align: 'center'
    }).setOrigin(0.5);

    // === PLATAFORMAS ===
    this.platforms = this.physics.add.staticGroup();

    for (let i = 0; i < 10; i++) {
      const y = 600 - i * 100;
      const x = Phaser.Math.Between(60, 100);

      const gfx = this.add.rectangle(x, y, 70, 20, 0x00aa00);
      const platform = this.platforms.create(x, y, null)
        .setOrigin(0.5)
        .setDisplaySize(60, 20)
        .refreshBody();

      platform.gfx = gfx;
      platform.isOneWay = true;
    }

    // === JUGADOR ===
    const bottomPlatform = this.platforms.getChildren()[0];
    const px = bottomPlatform.x;
    const py = bottomPlatform.y - 40;

    const playerRect = this.add.rectangle(px, py, 30, 30, 0x0000aa);
    this.player = this.physics.add.existing(playerRect);
    this.player.body.setCollideWorldBounds(false);
    this.player.body.setBounce(0);
    this.player.body.allowGravity = false;
    this.player.body.setVelocity(0, 0);
    this.player.setOrigin(0.5);

    // === CÁMARA ===
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setDeadzone(100, 200);
    this.cameras.main.setBounds(0, -Infinity, this.scale.width, Infinity);

    // === TRACKING ALTURA ===
    this.maxPlayerY = this.player.y;
    this.lastGeneratedPlatformY = this.getHighestPlatformY();
    this.platformSpacing = 100;

    // === CONTROLES ===
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    this.input.on('pointerdown', () => this.startGame());

    // === CONTROLES TÁCTILES ===
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');

    if (leftBtn && rightBtn) {
      leftBtn.addEventListener('pointerdown', () => this.leftPressed = true);
      leftBtn.addEventListener('pointerup', () => this.leftPressed = false);
      leftBtn.addEventListener('pointerout', () => this.leftPressed = false);
      leftBtn.addEventListener('pointercancel', () => this.leftPressed = false);

      rightBtn.addEventListener('pointerdown', () => this.rightPressed = true);
      rightBtn.addEventListener('pointerup', () => this.rightPressed = false);
      rightBtn.addEventListener('pointerout', () => this.rightPressed = false);
      rightBtn.addEventListener('pointercancel', () => this.rightPressed = false);
    }
  }

  startGame() {
    if (this.gameStarted) return;

    this.gameStarted = true;
    this.startText.destroy();
    this.player.body.allowGravity = true;
    this.player.body.setVelocityY(-550);
  }

  spawnPlatform(y) {
    const x = Phaser.Math.Between(60, 300);
    const gfx = this.add.rectangle(x, y, 60, 20, 0x00aa00);
    const platform = this.platforms.create(x, y, null)
      .setOrigin(0.5)
      .setDisplaySize(100, 20)
      .refreshBody();

    platform.gfx = gfx;
    platform.isOneWay = true;
  }

  getHighestPlatformY() {
    let minY = Infinity;
    this.platforms.getChildren().forEach(platform => {
      if (platform.y < minY) minY = platform.y;
    });
    return minY;
  }

  update() {
    if (!this.gameStarted) return;

    const moveSpeed = 200;
    const screenWidth = this.scale.width;

    // === MOVIMIENTO HORIZONTAL ===
    if (this.cursors.left.isDown || this.leftPressed) {
      this.player.body.setVelocityX(-moveSpeed);
    } else if (this.cursors.right.isDown || this.rightPressed) {
      this.player.body.setVelocityX(moveSpeed);
    } else {
      this.player.body.setVelocityX(0);
    }

    // === ENVOLVIMIENTO HORIZONTAL ===
    const halfWidth = this.player.width / 2;
    if (this.player.x < -halfWidth) {
      this.player.x = screenWidth + halfWidth;
    } else if (this.player.x > screenWidth + halfWidth) {
      this.player.x = -halfWidth;
    }

    // === COLISIONES UNIDIRECCIONALES ===
    this.physics.overlap(this.player, this.platforms, (player, platform) => {
      const isFalling = player.body.velocity.y > 0;
      const playerBottom = player.body.bottom;
      const platformTop = platform.body.top;
      const verticalOverlap = Math.abs(playerBottom - platformTop) < 10;

      if (platform.isOneWay && isFalling && verticalOverlap) {
        player.body.setVelocityY(-550);
      }
    });

    // === GENERACIÓN SEGURA DE PLATAFORMAS ===
    if (this.player.y < this.maxPlayerY) {
      this.maxPlayerY = this.player.y;

      const newPlatformY = this.lastGeneratedPlatformY - this.platformSpacing;

      if (this.maxPlayerY < newPlatformY) {
        this.spawnPlatform(newPlatformY);
        this.lastGeneratedPlatformY = newPlatformY;
      }
    }

    // === GENERACIÓN ANTICIPADA DE PLATAFORMAS (BUFFER DE 5) ===
    const bufferPlatforms = 3;
    const bufferHeight = bufferPlatforms * this.platformSpacing;
    const platformGenerationThreshold = this.player.y - bufferHeight;

    while (this.lastGeneratedPlatformY > platformGenerationThreshold) {
      const newPlatformY = this.lastGeneratedPlatformY - this.platformSpacing;
      this.spawnPlatform(newPlatformY);
      this.lastGeneratedPlatformY = newPlatformY;
    }

    // === LIMPIEZA DE PLATAFORMAS FUERA DE PANTALLA ===
    const cameraBottom = this.cameras.main.scrollY + this.scale.height;

    this.platforms.getChildren().forEach(platform => {
      if (platform.y > cameraBottom + 200) {
        platform.gfx?.destroy();
        platform.destroy();
      }
    });

    // === PARALLAX FONDO ===
    this.bg.tilePositionY = this.cameras.main.scrollY;
  }
}

// === CONFIGURACIÓN DEL JUEGO ===
const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false // Puedes cambiarlo a true para testeo
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

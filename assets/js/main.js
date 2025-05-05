class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.leftPressed = false;
    this.rightPressed = false;
    this.gameStarted = false;

    this.score = 0;
    this.scoreText = null;
    this.lastTouchedPlatformY = Infinity; // Track de la última plataforma tocada
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
    }).setScrollFactor(0).setDepth(10); // Fijo en pantalla y sobre todo

    // === PLATAFORMAS ===
    this.platforms = this.physics.add.staticGroup();
    this.platformSpacing = 100;

    // Generar plataformas iniciales
    for (let i = 0; i < 10; i++) {
      const y = 600 - i * this.platformSpacing;
      const x = Phaser.Math.Between(30, this.scale.width - 30);
      this.createPlatform(x, y);
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

    // === TRACKING ===
    this.maxPlayerY = this.player.y;
    this.lastGeneratedPlatformY = this.getHighestPlatformY();

    // === CONTROLES ===
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    this.input.on('pointerdown', () => this.startGame());

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

  createPlatform(x, y) {
    const gfx = this.add.rectangle(x, y, 60, 20, 0x00aa00);
    const platform = this.platforms.create(x, y, null)
      .setOrigin(0.5)
      .setDisplaySize(60, 20)
      .refreshBody();

    platform.gfx = gfx;
    platform.isOneWay = true;
  }

  spawnPlatform(y) {
    const x = Phaser.Math.Between(30, this.scale.width - 30); 
    const gfx = this.add.rectangle(x, y, 60, 20, 0x00aa00);

    const platform = this.platforms.create(x, y, null)
      .setOrigin(0.5)
      .setDisplaySize(60, 20)
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

    // === ENVOLVIMIENTO ===
    const halfWidth = this.player.width / 2;
    if (this.player.x < -halfWidth) {
      this.player.x = screenWidth + halfWidth;
    } else if (this.player.x > screenWidth + halfWidth) {
      this.player.x = -halfWidth;
    }

    // === COLISIONES UNIDIRECCIONALES + SCORE ===
    this.physics.overlap(this.player, this.platforms, (player, platform) => {
      const isFalling = player.body.velocity.y > 0;
      const verticalOverlap = Math.abs(player.body.bottom - platform.body.top) < 10;
      if (platform.isOneWay && isFalling && verticalOverlap) {
        player.body.setVelocityY(-550);

        // SCORE: Si esta plataforma está más arriba que la última tocada
        if (platform.y < this.lastTouchedPlatformY) {
          this.lastTouchedPlatformY = platform.y;
          this.score++;
          this.scoreText.setText('Puntos: ' + this.score);
        }
      }
    });

    // === TRACK ALTURA MÁXIMA ===
    if (this.player.y < this.maxPlayerY) {
      this.maxPlayerY = this.player.y;
    }

    // === GENERACIÓN CON BUFFER DE 6 PLATAFORMAS ===
    const bufferPlatforms = 6;
    const bufferHeight = bufferPlatforms * this.platformSpacing;
    const platformThreshold = this.player.y - bufferHeight;

    while (this.lastGeneratedPlatformY > platformThreshold) {
      const newY = this.lastGeneratedPlatformY - this.platformSpacing;
      this.spawnPlatform(newY);
      this.lastGeneratedPlatformY = newY;
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

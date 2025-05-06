// === ESCENA PRINCIPAL OPTIMIZADA ===
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.leftPressed = false;
    this.rightPressed = false;
    this.gameStarted = false;

    this.score = 0;
    this.scoreText = null;
    this.lastTouchedPlatformY = Infinity;
    this.platformPool = []; // Pool de plataformas reutilizables
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
      fontSize: '15px', fill: '#000', padding: { x: 10, y: 6 }, align: 'center'
    }).setOrigin(0.5);

    // === SISTEMA DE PUNTOS ===
    this.scoreText = this.add.text(10, 10, 'Puntos: 0', {
      fontSize: '18px', fill: '#000', padding: { x: 10, y: 5 }
    }).setScrollFactor(0).setDepth(10);

    // === GRUPO DE PLATAFORMAS ===
    this.platforms = this.add.group();
    this.platformSpacing = 100;

    for (let i = 0; i < 10; i++) {
      const y = 600 - i * this.platformSpacing;
      const x = Phaser.Math.Between(30, this.scale.width - 30);
      this.createPlatform(x, y);
    }

    // === JUGADOR ===
    const base = this.platforms.getChildren()[0];
    const px = base.x;
    const py = base.y - 40;
    this.player = this.add.rectangle(px, py, 30, 30, 0x0000aa);
    this.physics.add.existing(this.player);
    this.player.body.setBounce(0).setCollideWorldBounds(false);
    this.player.body.allowGravity = false;

    // === CÁMARA ===
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setDeadzone(100, 200);
    this.cameras.main.setBounds(0, -2000, this.scale.width, 5000);

    // === TRACKING ===
    this.maxPlayerY = this.player.y;
    this.lastGeneratedPlatformY = this.getHighestPlatformY();

    // === CONTROLES ===
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    this.input.once('pointerdown', () => this.startGame());

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
    const platform = this.add.rectangle(x, y, 60, 20, 0x00aa00);
    this.physics.add.existing(platform, true);
    platform.body.checkCollision.down = false;
    platform.setData('isOneWay', true);
    this.platforms.add(platform);
  }

  getPlatformFromPool(x, y) {
    const platform = this.platformPool.find(p => !p.active);
    if (platform) {
      platform.setPosition(x, y);
      platform.setActive(true).setVisible(true);
      platform.body.enable = true;
    } else {
      const newPlat = this.add.rectangle(x, y, 60, 20, 0x00aa00);
      this.physics.add.existing(newPlat, true);
      newPlat.body.checkCollision.down = false;
      newPlat.setData('isOneWay', true);
      this.platforms.add(newPlat);
      this.platformPool.push(newPlat);
      return newPlat;
    }
    return platform;
  }

  getHighestPlatformY() {
    let minY = Infinity;
    this.platforms.getChildren().forEach(p => { if (p.y < minY) minY = p.y; });
    return minY;
  }

  update() {
    if (!this.gameStarted) return;

    const moveSpeed = 200;
    const halfW = this.player.width / 2;
    const screenWidth = this.scale.width;

    // === MOVIMIENTO ===
    if (this.cursors.left.isDown || this.leftPressed) {
      this.player.body.setVelocityX(-moveSpeed);
    } else if (this.cursors.right.isDown || this.rightPressed) {
      this.player.body.setVelocityX(moveSpeed);
    } else {
      this.player.body.setVelocityX(0);
    }

    // === ENVOLVIMIENTO HORIZONTAL ===
    if (this.player.x < -halfW) this.player.x = screenWidth + halfW;
    if (this.player.x > screenWidth + halfW) this.player.x = -halfW;

    // === COLISIONES ===
    this.physics.overlap(this.player, this.platforms, (player, platform) => {
      const isFalling = player.body.velocity.y > 0;
      const overlap = Math.abs(player.body.bottom - platform.body.top) < 10;
      if (platform.getData('isOneWay') && isFalling && overlap) {
        player.body.setVelocityY(-550);
        if (platform.y < this.lastTouchedPlatformY) {
          this.lastTouchedPlatformY = platform.y;
          this.score++;
          this.scoreText.setText('Puntos: ' + this.score);
        }
      }
    });

    // === ALTURA MÁXIMA ===
    if (this.player.y < this.maxPlayerY) {
      this.maxPlayerY = this.player.y;
    }

    // === GENERACIÓN DE PLATAFORMAS ===
    const threshold = this.player.y - (6 * this.platformSpacing);
    while (this.lastGeneratedPlatformY > threshold) {
      const newY = this.lastGeneratedPlatformY - this.platformSpacing;
      const newX = Phaser.Math.Between(30, this.scale.width - 30);
      this.getPlatformFromPool(newX, newY);
      this.lastGeneratedPlatformY = newY;
    }

    // === LIMPIEZA DE PLATAFORMAS FUERA DE CÁMARA ===
    const cameraBottom = this.cameras.main.scrollY + this.scale.height;
    this.platforms.getChildren().forEach(platform => {
      if (platform.y > cameraBottom + 200) {
        platform.setActive(false).setVisible(false);
        platform.body.enable = false;
      }
    });

    // === PARALLAX ===
    this.bg.tilePositionY = this.cameras.main.scrollY;

    // === LIMITE DE CAÍDA ===
    if (this.player.y > cameraBottom + 100) {
      this.scene.restart();
    }
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
    arcade: { gravity: { y: 1000 }, debug: false }
  },
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  parent: 'game-container'
};

new Phaser.Game(config);

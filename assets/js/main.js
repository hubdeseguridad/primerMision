class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.initGameState();
  }

  initGameState() {
    this.leftPressed = false;
    this.rightPressed = false;
    this.gameStarted = false;
    this.score = 0;
    this.lastTouchedPlatformY = Infinity;
    this.timers = {
      damageObject: { elapsed: 0, interval: Phaser.Math.Between(5000, 10000) },
      scoreBonus: { elapsed: 0, interval: Phaser.Math.Between(10000, 15000) }
    };
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
  }

  create() {
    this.setupScene();
    this.setupControls();
  }

  setupScene() {
    this.setupBackground();
    this.setupText();
    this.setupPlatforms();
    this.setupPlayer();
    this.setupFallingObjects();
    this.setupCamera();
    this.setupCollisions();
  }

  setupBackground() {
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height * 2, 'sky')
      .setOrigin(0, 1)
      .setScrollFactor(0);
  }

  setupText() {
    this.startText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Presiona espacio o toca para comenzar', {
      fontSize: '15px',
      fill: '#000',
      padding: { x: 10, y: 6 },
      align: 'center'
    }).setOrigin(0.5);

    this.scoreText = this.add.text(10, 10, 'Puntos: 0', {
      fontSize: '18px',
      fill: '#000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0).setDepth(10);
  }

  setupPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    this.platformSpacing = 100;

    for (let i = 0; i < 10; i++) {
      this.createPlatform(Phaser.Math.Between(30, this.scale.width - 30), 600 - i * this.platformSpacing);
    }

    this.lastGeneratedPlatformY = this.getHighestPlatformY();
  }

  setupPlayer() {
    const bottomPlatform = this.platforms.getChildren()[0];
    this.player = this.physics.add.existing(
      this.add.rectangle(bottomPlatform.x, bottomPlatform.y - 40, 30, 30, 0x0000aa)
    );
    this.player.body.setCollideWorldBounds(false).setBounce(0).allowGravity = false;
    this.player.setData('isAlive', true);
    this.maxPlayerY = this.player.y;
  }

  setupFallingObjects() {
    this.fallingObjects = this.physics.add.group();
  }

  setupCamera() {
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setDeadzone(100, 200).setBounds(0, -Infinity, this.scale.width, Infinity);
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    this.input.on('pointerdown', () => this.startGame());
    this.setupTouchControls();
  }

  setupTouchControls() {
    const setButtonState = (btn, state) => {
      ['pointerdown', 'pointerup', 'pointerout', 'pointercancel'].forEach(event =>
        btn.addEventListener(event, () => this[state] = event === 'pointerdown')
      );
    };

    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    if (leftBtn && rightBtn) {
      setButtonState(leftBtn, 'leftPressed');
      setButtonState(rightBtn, 'rightPressed');
    }
  }

  setupCollisions() {
    this.physics.add.overlap(this.player, this.fallingObjects, this.handleFallingObjectCollision, null, this);
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

  spawnFallingObject(type, color, velocityRange) {
    if (!this.gameStarted || !this.player.getData('isAlive')) return;
    const x = Phaser.Math.Between(30, this.scale.width - 30);
    const y = this.cameras.main.scrollY - 140;
    const object = this.add.rectangle(x, y, 20, 20, color);
    this.physics.add.existing(object);
    object.body.setCircle(10);
    object.body.setVelocityY(Phaser.Math.Between(...velocityRange));
    object.setData('type', type);
    this.fallingObjects.add(object);
    return object;
  }

  spawnFallingDamageObject() {
    const damage = this.spawnFallingObject('damage', 0xff0000, [200, 400]);
    if (damage) damage.body.gravity.y = 300;
  }

  spawnScoreBonusObject() {
    const score = this.spawnFallingObject('score', 0x0000ff, [150, 300]);
    if (score) score.body.gravity.y = 100;
  }

  handleFallingObjectCollision(player, fallingObject) {
    if (!player.getData('isAlive')) return;

    const type = fallingObject.getData('type');
    if (type === 'damage') {
      this.endGame();
    } else if (type === 'score') {
      this.score += 10;
      this.scoreText.setText('Puntos: ' + this.score);
    }

    fallingObject.destroy();
  }

  endGame() {
    this.player.setData('isAlive', false);
    this.player.body.setVelocityY(0);
    this.player.body.allowGravity = false;
    this.physics.pause();
    this.add.text(this.scale.width / 2, this.scale.height / 2, '¡Game Over!', {
      fontSize: '32px',
      fill: '#fff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (!this.gameStarted || !this.player.getData('isAlive')) return;

    this.handlePlayerMovement();
    this.handlePlatformCollisions();
    this.handlePlatformGeneration();
    this.handleFallingObjects(delta);
    this.bg.tilePositionY = this.cameras.main.scrollY;
  }

  handlePlayerMovement() {
    const moveSpeed = 200;
    const screenWidth = this.scale.width;

    this.player.body.setVelocityX(
      (this.cursors.left.isDown || this.leftPressed) ? -moveSpeed :
      (this.cursors.right.isDown || this.rightPressed) ? moveSpeed : 0
    );

    const halfWidth = this.player.width / 2;
    if (this.player.x < -halfWidth) this.player.x = screenWidth + halfWidth;
    else if (this.player.x > screenWidth + halfWidth) this.player.x = -halfWidth;
  }

  handlePlatformCollisions() {
    this.physics.overlap(this.player, this.platforms, (player, platform) => {
      if (platform.isOneWay && player.body.velocity.y > 0 && Math.abs(player.body.bottom - platform.body.top) < 10) {
        player.body.setVelocityY(-550);
        if (platform.y < this.lastTouchedPlatformY) {
          this.lastTouchedPlatformY = platform.y;
          this.scoreText.setText('Puntos: ' + (++this.score));
        }
      }
    });
  }

  handlePlatformGeneration() {
    const bufferHeight = 3 * this.platformSpacing;
    while (this.lastGeneratedPlatformY > this.player.y - bufferHeight) {
      this.spawnPlatform(this.lastGeneratedPlatformY -= this.platformSpacing);
    }

    const cameraBottom = this.cameras.main.scrollY + this.scale.height;
    this.platforms.getChildren().forEach(platform => {
      if (platform.y > cameraBottom + 200) {
        platform.gfx?.destroy();
        platform.destroy();
      }
    });
  }

  handleFallingObjects(delta) {
    this.timers.damageObject.elapsed += delta;
    this.timers.scoreBonus.elapsed += delta;

    if (this.timers.damageObject.elapsed >= this.timers.damageObject.interval) {
      this.spawnFallingDamageObject();
      this.timers.damageObject.elapsed = 0;
      this.timers.damageObject.interval = Phaser.Math.Between(5000, 10000);
    }

    if (this.timers.scoreBonus.elapsed >= this.timers.scoreBonus.interval) {
      this.spawnScoreBonusObject();
      this.timers.scoreBonus.elapsed = 0;
      this.timers.scoreBonus.interval = Phaser.Math.Between(10000, 15000);
    }

    const cameraBottom = this.cameras.main.scrollY + this.scale.height;
    this.fallingObjects.getChildren().forEach(object => {
      if (object.y > cameraBottom + 50) {
        object.destroy(); // Destruye el objeto completo
      }
    });
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
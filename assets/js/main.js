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
    this.hasShield = false;
    this.hasBoots = false;
    this.originalPlayerJumpSpeed = -550;
    this.timers = {
      damageObject: { elapsed: 0, interval: Phaser.Math.Between(5000, 10000) },
      scoreBonus: { elapsed: 0, interval: Phaser.Math.Between(10000, 15000) },
      shieldObject: { elapsed: 0, interval: 13000 },
      bootsObject: { elapsed: 0, interval: Phaser.Math.Between(8000, 12000) },
      bootsEffect: { elapsed: 0, duration: 5000 }
    };
    this.shieldObject = null;
    this.bootsObject = null;
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
    this.setupShieldObjects();
    this.setupBootsObjects();
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
    this.playerColor = 0x0000aa;
    this.originalPlayerJumpSpeed = -550;
  }

  setupFallingObjects() {
    this.fallingObjects = this.physics.add.group();
  }

  setupShieldObjects() {
    this.shieldObjects = this.physics.add.group();
  }

  setupBootsObjects() {
    this.bootsObjects = this.physics.add.group();
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
    this.physics.add.overlap(this.player, this.shieldObjects, this.handleShieldCollision, null, this);
    this.physics.add.overlap(this.player, this.bootsObjects, this.handleBootsCollision, null, this);
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
    // Cambiar la posición de spawn para que sea mucho más arriba
    const y = this.cameras.main.scrollY - this.scale.height * 1.5; // 1.5 veces la altura de la pantalla
    const object = this.add.rectangle(x, y, 20, 20, color);
    this.physics.add.existing(object);
    object.body.setCircle(10);

    // Calcular la velocidad inicial para que tarde 4 segundos en caer
    const fallTime = 8000; // 4 segundos en milisegundos
    const distance = this.scale.height * 1.5; // Distancia que recorre el objeto (1.5 veces la altura de la pantalla)
    const gravity = 20;
    const initialVelocity = (distance - 0.5 * gravity * (fallTime * fallTime) / 1000000) / (fallTime / 1000); 

    // Ajustar la velocidad para que sea más lenta (cámara lenta)
    const slowMotionFactor = 0.8; // ajustar este valor para controlar la velocidad de la cámara lenta
    object.body.setVelocityY(initialVelocity * slowMotionFactor);

    object.setData('type', type);
    this.fallingObjects.add(object);
    if (type === 'damage') {
      object.alias = 'Ladrillo';
    } else if (type === 'score') {
      object.alias = 'DC3';
    }
    return object;
  }

  spawnFallingDamageObject() {
    const damage = this.spawnFallingObject('damage', 0xff0000, [0, 0]); // Velocidad inicial calculada en spawnFallingObject
    if (damage) damage.body.gravity.y = 20;
  }

  spawnScoreBonusObject() {
    const score = this.spawnFallingObject('score', 0x0000ff, [0, 0]); // Velocidad inicial calculada en spawnFallingObject
    if (score) score.body.gravity.y = 20;
  }

  spawnShieldObject() {
    if (!this.gameStarted || !this.player.getData('isAlive') || this.hasShield) return;
    const spawnY = this.cameras.main.scrollY - this.scale.height * 1.5;
    const x = Phaser.Math.Between(30, this.scale.width - 30);
    const y = spawnY;
    const shield = this.add.rectangle(x, y, 20, 20, 0xffff00);
    this.physics.add.existing(shield);
    shield.body.setImmovable(true);
    shield.body.gravity.y = 50;
    console.log('Spawning shield at:', x, y, 'Gravity enabled:', shield.body.allowGravity);
    this.shieldObjects.add(shield);
    this.shieldObject = shield;
    shield.alias = 'Casco';
  }

  spawnBootsObject() {
    if (!this.gameStarted || !this.player.getData('isAlive') || this.hasBoots) return;
    const spawnY = this.cameras.main.scrollY - this.scale.height * 1.5;
    const x = Phaser.Math.Between(30, this.scale.width - 30);
    const y = spawnY;
    const boots = this.add.rectangle(x, y, 20, 20, 0x00ff00);
    this.physics.add.existing(boots);
    boots.body.setImmovable(true);
    boots.body.gravity.y = 50;
    this.bootsObjects.add(boots);
    boots.alias = 'Botas';
    this.bootsObject = boots;
  }

  handleFallingObjectCollision(player, fallingObject) {
    if (!player.getData('isAlive')) return;

    const type = fallingObject.getData('type');
    if (type === 'damage') {
      if (this.hasShield) {
        this.hasShield = false;
        this.player.fillColor = this.playerColor;
        if (this.shieldObject) {
          this.shieldObject.destroy();
          this.shieldObject = null;
        }
      } else {
        this.endGame();
      }
    } else if (type === 'score') {
      this.score += 10;
      this.scoreText.setText('Puntos: ' + this.score);
    }

    fallingObject.destroy();
  }

  handleShieldCollision(player, shield) {
    if (!this.hasShield) {
      this.hasShield = true;
      this.player.fillColor = 0xffff00;
      shield.destroy();
      this.shieldObject = null;
    }
  }

  handleBootsCollision(player, boots) {
    if (!this.hasBoots) {
      this.hasBoots = true;
      this.originalPlayerJumpSpeed = this.player.body.velocity.y;
      this.player.body.setVelocityY(-1000);
      this.timers.bootsEffect.elapsed = 0;
      this.timers.bootsEffect.duration = 5000; // Duración de 5 segundos
      this.bootsObject.destroy();
      this.bootsObject = null;
    }
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
    this.handleShieldSpawning(delta);
    this.handleBootsSpawning(delta);
    this.handleBootsEffect(delta);
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
        object.destroy();
      }
    });
  }

  handleShieldSpawning(delta) {
    this.timers.shieldObject.elapsed += delta;
    if (this.timers.shieldObject.elapsed >= this.timers.shieldObject.interval) {
      this.spawnShieldObject();
      this.timers.shieldObject.elapsed = 0;
    }
  }

  handleBootsSpawning(delta) {
    this.timers.bootsObject.elapsed += delta;
    if (this.timers.bootsObject.elapsed >= this.timers.bootsObject.interval) {
      this.spawnBootsObject();
      this.timers.bootsObject.elapsed = 0;
    }
  }

  handleBootsEffect(delta) {
    if (this.hasBoots) {
      this.timers.bootsEffect.elapsed += delta;
      if (this.timers.bootsEffect.elapsed >= this.timers.bootsEffect.duration) {
        this.hasBoots = false;
        this.player.fillColor = this.playerColor;
        this.player.body.setVelocityY(this.originalPlayerJumpSpeed);
      }
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

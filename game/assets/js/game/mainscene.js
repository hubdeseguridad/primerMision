class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    initGameState() {
        this.leftPressed = false;
        this.rightPressed = false;
        this.gameStarted = false;
        this.score = 0;
        this.isPaused = false;
        this.originalPlayerJumpSpeed = -550;
        this.lastTouchedPlatformY = Infinity;
        this.platformTypes = ['static', 'bomb'];
        this.platforms = null;
        this.bombPlatformPercentage = 0.10;
        this.shieldObject = null;
        this.bootsObject = null;
        this.hasShield = false;
        this.hasBoots = false;
        this.specialObjectsGravity = 10;
        this.shieldGlowEffect = null;
        this.fallingWarningIndicator = null;
        this.pickupWarningIndicator = null;

        this.timers = {
            damageObject: { elapsed: 0, interval: Phaser.Math.Between(8000, 12000), warningDuration: 1000 },
            scoreBonus: { elapsed: 0, interval: 10000, warningDuration: 800 },
            shieldObject: { elapsed: 0, interval: 18000, warningDuration: 800 },
            bootsObject: { elapsed: 0, interval: 15000, warningDuration: 800 },
            bootsEffect: { elapsed: 0, duration: 5000 }
        };
        this.jumpSound = null;
        this.starSound = null;
        this.hitSound = null;
        this.pickupSound = null;
        this.musicSound = null;

        if (this.scoreIndicators) {
            this.scoreIndicators.forEach(indicator => {
                if (indicator && indicator.destroy) {
                    indicator.destroy();
                }
            });
            this.scoreIndicators = [];
        }
        this.indicatorsChanged = [false, false, false];
    }

    preload() {
        this.load.image('background', './assets/img/background.png');
        this.load.image('endgame', './assets/img/end.svg');
        this.load.image('platform01', './assets/img/viga.png');
        this.load.image('platform02', './assets/img/viga02.png');

        this.load.image('hubito', './assets/img/hubito01.png');
        this.load.image('hubito2', './assets/img/hubito02.png');
        this.load.image('hubitojump', './assets/img/hubitojump.png');
        this.load.image('hubitojump2', './assets/img/hubitojump2.png');

        this.load.image('brick', './assets/img/brick.png');
        this.load.image('boots', './assets/img/botita.png');
        this.load.image('helmet', './assets/img/casco.png');
        this.load.image('dc3', './assets/img/DC3.png');

        this.load.image('coin', './assets/img/award01.png');
        this.load.image('cupon', './assets/img/award02.png');
        this.load.image('book', './assets/img/award03.png');

        this.load.svg('award01_GO', './assets/img/Index/LIBRO.svg', { width: 100, height: 100 });
        this.load.svg('award02_GO', './assets/img/Index/CUPÓN.svg', { width: 100, height: 100 });
        this.load.svg('award03_GO', './assets/img/Index/MONEDA.svg', { width: 100, height: 100 });

        this.load.audio('jump', './assets/sounds/jump.wav');
        this.load.audio('star', './assets/sounds/Cortinilla.wav');
        this.load.audio('hit', './assets/sounds/hitHurt.wav');
        this.load.audio('pickup', './assets/sounds/pickup.wav');

        this.load.audio('music', './assets/sounds/soundtrack.mp3');
        this.load.audio('end', './assets/sounds/gameover.mp3');
    }

    create() {
        this.initGameState();

        const pauseButton = document.querySelector('.pause-btn');
        if (pauseButton) {
            pauseButton.classList.remove('hidden');
        }

        this.setupScene();
        this.setupControls();
        this.setupSounds();
        this.setupScoreIndicators();
        this.gameOverImage = this.add.image(this.scale.width / 2, this.scale.height / 2, 'endgame').setOrigin(0.5).setDepth(100).setScale(0.5).setVisible(false);
        this.setupPausePopup();
        this.addStartGameListeners();
    }

    setupScene() {
        this.setupBackground();
        this.setupText();
        this.setupPlatforms();
        this.setupPlayer();
        this.setupFallingObjects(); // Contendrá Ladrillos
        this.setupDc3Objects();     // Contendrá DC3
        this.setupShieldObjects();  // Contendrá Cascos
        this.setupBootsObjects();   // Contendrá Botas
        this.setupCamera();
        this.setupCollisions();
        this.setupPauseButton();
    }

    setupBackground() {
        this.bg = this.add.image(0, 0, 'background')
            .setOrigin(0)
            .setDisplaySize(this.scale.width, this.scale.height)
            .setScrollFactor(0);
    }

    setupSounds() {
        this.jumpSound = this.sound.add('jump', { volume: 0.35 });
        this.hitSound = this.sound.add('hit');
        this.pickupSound = this.sound.add('pickup');

        this.starSound = this.sound.add('star', {
            loop: false,
            volume: 0.20,
        });

        this.musicSound = this.sound.add('music', {
            loop: true,
            volume: 0.50,
        });

        this.endSound = this.sound.add('end', {
            loop: false,
            volume: 0.75,
        });
    }

    setupText() {
        const startTextContent = 'Presiona la tecla “Espacio” o da clic en la pantalla para comenzar.';
        const maxWidth = this.scale.width * 0.9;
        this.startText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            startTextContent,
            {
                fontSize: '12px',
                fontFamily: '"Press Start 2P", monospace',
                fill: '#000',
                padding: { x: 10, y: 6 },
                align: 'center',
                wordWrap: { width: maxWidth, useAdvancedWrap: true }
            }
        ).setOrigin(0.5).setDepth(1000);

        this.scoreLabel = this.add.text(10, 10, 'Puntos:', {
            fontSize: '13px',
            fontFamily: '"Press Start 2P", monospace',
            fontStyle: 'bold',
            fontWeight: '400',
            fill: '#fff',
            backgroundColor: '#2A67FB',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0).setDepth(10);

        this.scoreText = this.add.text(this.scoreLabel.x + this.scoreLabel.width, 10, '0', {
            fontSize: '13px',
            fontFamily: '"Press Start 2P", monospace',
            fontStyle: 'bold',
            fontWeight: '400',
            fill: '#2A67FB',
            backgroundColor: '#fff',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0).setDepth(10);
    }

    setupScoreIndicators() {
        const squareSize = 20;
        const padding = 5;
        const startX = this.scale.width - (3 * squareSize + 2 * padding) - 10;
        const startY = 10;

        this.scoreIndicators = [
            this.add.rectangle(startX, startY, squareSize, squareSize, 0x808080).setOrigin(0, 0).setScrollFactor(0).setDepth(10).setVisible(false),
            this.add.rectangle(startX + squareSize + padding, startY, squareSize, squareSize, 0x808080).setOrigin(0, 0).setScrollFactor(0).setDepth(10).setVisible(false),
            this.add.rectangle(startX + 2 * (squareSize + padding), startY, squareSize, squareSize, 0x808080).setOrigin(0, 0).setScrollFactor(0).setDepth(10).setVisible(false)
        ];

        this.scoreThresholds = [25, 50, 100];
        this.indicatorKeys = ['book', 'cupon', 'coin'];
        this.indicatorsChanged = [false, false, false];
    }

    /* -----------------------
                Game State
        -----------------------
    */
    setupCamera() {
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        this.cameras.main.setDeadzone(100, 200).setBounds(0, -Infinity, this.scale.width, Infinity);
    }

    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.setupTouchControls();
        this.input.keyboard.on('keydown-P', () => this.togglePause());
    }

      addStartGameListeners() {
        this.spaceKeyListener = this.input.keyboard.on('keydown-SPACE', this.startGame, this);
        this.pointerDownListener = this.input.on('pointerdown', this.startGame, this);
    }

    setupTouchControls() {
        if (this.isMobileDevice()) {
            this.input.on('pointerdown', (pointer) => {
                const mid = this.scale.width / 2;
                if (pointer.x < mid) {
                    this.leftPressed = true;
                    this.rightPressed = false;
                } else {
                    this.leftPressed = false;
                    this.rightPressed = true;
                }
            });

            this.input.on('pointermove', (pointer) => {
                const mid = this.scale.width / 2;
                if (pointer.isDown) {
                    if (pointer.x < mid) {
                        this.leftPressed = true;
                        this.rightPressed = false;
                    } else {
                        this.leftPressed = false;
                        this.rightPressed = true;
                    }
                }
            });

            this.input.on('pointerup', () => {
                this.leftPressed = false;
                this.rightPressed = false;
            });
        } else {
            const setButtonState = (btn, state) => {
                ['pointerdown', 'pointerup', 'pointerout', 'pointercancel'].forEach(event =>
                    btn?.addEventListener(event, () => this[state] = event === 'pointerdown')
                );
            };

            const leftBtn = document.getElementById('left-btn');
            const rightBtn = document.getElementById('right-btn');
            if (leftBtn && rightBtn) {
                setButtonState(leftBtn, 'leftPressed');
                setButtonState(rightBtn, 'rightPressed');
            }
        }
    }

    setupCollisions() {
        // Colisión de jugador con objetos de daño (ladrillo)
        // Usamos overlap para detectar la colisión y activar el efecto.
        this.physics.add.overlap(this.player, this.fallingObjects, this.handleFallingObjectCollision, null, this);

        // MODIFICADO: Nueva colisión para que el jugador recoja los DC3 (score)
        this.physics.add.overlap(this.player, this.dc3Objects, this.handleFallingObjectCollision, null, this);

        // Recolección de objetos especiales (casco y botas) con el jugador
        this.physics.add.overlap(this.player, this.shieldObjects, this.handleShieldCollision, null, this);
        this.physics.add.overlap(this.player, this.bootsObjects, this.handleBootsCollision, null, this);

        // Colisión de objetos especiales (casco y botas) con plataformas para que se queden en ellas.
        this.physics.add.collider(this.shieldObjects, this.platforms);
        this.physics.add.collider(this.bootsObjects, this.platforms);
        
        // Colisión de los DC3 (type 'score') con las plataformas para que se queden en ellas.
        this.physics.add.collider(this.dc3Objects, this.platforms, (obj, plat) => {
            obj.body.setVelocityY(0);
            obj.body.allowGravity = false;
            obj.body.setImmovable(true); 
        });
    }

    setupPauseButton() {
        this.pauseBtn = document.getElementById('pause-btn');
        this.pauseBtn.addEventListener('click', () => this.togglePause());
    }

    setupPausePopup() {
        this.pausePopup = document.getElementById('pause-popup');
        this.popupScoreValue = document.getElementById('popup-score-value');
        this.resumeButton = document.getElementById('resume-btn');
        this.resumeButton.addEventListener('click', () => this.togglePause());
    }

    togglePause() {
        if (!this.gameStarted || !this.player.getData('isAlive')) {
            return;
        }

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.physics.pause();
            if (this.musicSound && this.musicSound.isPlaying) {
                this.musicSound.pause();
            }
            if (this.starSound && this.starSound.isPlaying) {
                this.starSound.pause();
            }
            this.pausePopup.classList.remove('hidden');
            this.popupScoreValue.textContent = this.score;
        } else {
            this.physics.resume();
            if (this.musicSound && this.musicSound.isPaused) {
                this.musicSound.resume();
            }
            if (this.starSound && this.starSound.isPaused) {
                this.starSound.resume();
            }
            this.pausePopup.classList.add('hidden');
        }
    }

    startGame() {
        if (this.gameStarted) return;

        this.gameStarted = true;

        this.startText.destroy();
        this.player.body.allowGravity = true;
        this.player.body.setVelocityY(this.originalPlayerJumpSpeed);
        this.player.setTexture('hubitojump');

        if (this.starSound && !this.starSound.isPlaying) {
            this.starSound.play();
            this.starSound.on('complete', () => {
                if (this.musicSound && !this.musicSound.isPlaying) {
                    this.musicSound.play();
                }
            });
        } else if (this.musicSound && !this.musicSound.isPlaying) {
            this.musicSound.play();
        }

        this.input.keyboard.off('keydown-SPACE', this.startGame, this);
        this.input.off('pointerdown', this.startGame, this);
    }

    endGame() {
        this.player.setData('isAlive', false);
        this.physics.pause();
        this.player.body.setVelocityY(0);
        this.player.body.allowGravity = false;

        if (this.musicSound && this.musicSound.isPlaying) {
            this.musicSound.stop();
        }
        if (this.starSound && this.starSound.isPlaying) {
            this.starSound.stop();
        }

        if (this.endSound && !this.endSound.isPlaying) {
            this.endSound.play();
        }

        this.pausePopup.classList.add('hidden');

        const pauseButton = document.querySelector('.pause-btn');
        if (pauseButton) {
            pauseButton.classList.add('hidden');
        }

        // Retrasamos un poco el cambio de escena para que el sonido termine de reproducirse
        this.time.delayedCall(2000, () => { // 2000 ms = 2 segundos, ajusta si es necesario
            this.scene.start('GameOverScene', { score: this.score });
        }, [], this);
    }

    isMobileDevice() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }

    /* -----------------------
                Player
        -----------------------
    */

    setupPlayer() {
        const bottomPlatform = this.platforms.getChildren()[0];
        this.player = this.physics.add.sprite(
            bottomPlatform.x,
            bottomPlatform.y - 40,
            'hubito'
        );

        this.player.setCollideWorldBounds(false);
        this.player.setBounce(0);
        this.player.body.allowGravity = false;

        this.player.setData('isAlive', true);
        this.maxPlayerY = this.player.y;

        this.originalPlayerJumpSpeed = -550;

        this.player.scale = 1;
    }

    handlePlayerMovement() {
        const moveSpeed = 200;
        const screenWidth = this.scale.width;
        const deathThreshold = this.cameras.main.scrollY + this.scale.height * 0.8;

        let velocityX = 0;

        if (this.isMobileDevice()) {
            if (this.leftPressed) {
                velocityX = -moveSpeed;
            } else if (this.rightPressed) {
                velocityX = moveSpeed;
            }
        } else {
            if (this.cursors.left.isDown) {
                velocityX = -moveSpeed;
            } else if (this.cursors.right.isDown) {
                velocityX = moveSpeed;
            }
        }

        this.player.body.setVelocityX(velocityX);

        const isFallingToDeath = this.player.y > deathThreshold && this.player.body.velocity.y > 0;

        if (this.player.body.velocity.y < 0) {
            if (this.player.body.velocity.x > 0) {
                this.player.setTexture('hubitojump2');
            } else {
                this.player.setTexture('hubitojump');
            }
        } else if (this.player.body.velocity.y > 0) {
            if (isFallingToDeath) {
                this.player.setTexture('hubito2');
            } else {
                this.player.setTexture('hubito');
            }
        } else {
            if (velocityX < 0) {
                this.player.setTexture('hubito2');
                this.player.setScale(1.3, 1.3);
            } else if (velocityX > 0) {
                this.player.setTexture('hubito2');
                this.player.setScale(-1.3, 1.3);
            } else {
                this.player.setTexture('hubito');
                this.player.setScale(1.3, 1.3);
            }
        }

        const halfWidth = this.player.width / 2;
        if (this.player.x < -halfWidth) this.player.x = screenWidth + halfWidth;
        else if (this.player.x > screenWidth + halfWidth) this.player.x = -halfWidth;
    }

    /* -----------------------
                Platforms
        -----------------------
    */

    setupPlatforms() {
        this.platforms = this.physics.add.staticGroup();
        this.platformSpacing = 100;
        this.maxPlatforms = 15;

        const initialPlatformY = this.scale.height - 30;

        for (let i = 0; i < 10; i++) {
            // Asegura que las plataformas iniciales sean estáticas para una base sólida
            this.createPlatform(Phaser.Math.Between(30, this.scale.width - 30), initialPlatformY - i * this.platformSpacing, 'static');
        }

        this.lastGeneratedPlatformY = this.getHighestPlatformY();
    }

    createPlatform(x, y, type = 'static') {
        let platform;
        const width = 80;
        const height = 16;

        if (type === 'static') {
            platform = this.platforms.create(x, y, 'platform01')
                .setOrigin(0.5)
                .setDisplaySize(width, height)
                .refreshBody();
        } else if (type === 'bomb') {
            platform = this.platforms.create(x, y, 'platform02')
                .setOrigin(0.5)
                .setDisplaySize(width, height)
                .refreshBody();
        } else {
            platform = this.platforms.create(x, y, null)
                .setOrigin(0.5)
                .setDisplaySize(width, height)
                .refreshBody();

            const gfx = this.add.rectangle(x, y, width, height, this.getPlatformColor(type));
            gfx.setDepth(1);

            platform.gfx = gfx;
            platform.update = () => {
                gfx.setPosition(platform.x, platform.y);
            };
        }

        platform.type = type;
        platform.isOneWay = true;

        if (type === 'bomb') {
            platform.timer = null;
        }

        return platform;
    }

   /* getPlatformColor(type) { // Esta función está comentada, no es usada actualmente para los tipos 'platform01' o 'platform02'
        switch (type) {
            case 'static': return 0x00aa00;
            case 'bomb': return 0x8b0000;
            default: return 0x00aa00;
        }
    } */

    spawnPlatform(y) {
        const platformType = this.platformTypes[Phaser.Math.Between(0, this.platformTypes.length - 1)];
        this.createPlatform(Phaser.Math.Between(30, this.scale.width - 30), y, platformType);
    }

    getHighestPlatformY() {
        return Math.min(...this.platforms.getChildren().map(platform => platform.y));
    }

    handlePlatformCollisions() {
        this.physics.overlap(this.player, this.platforms, (player, platform) => {
            if (platform.isOneWay && player.body.velocity.y > 0 && Math.abs(player.body.bottom - platform.body.top) < 10) {
                player.body.setVelocityY(this.originalPlayerJumpSpeed);
                player.setTexture('hubitojump');
                this.jumpSound.play();
                if (platform.y < this.lastTouchedPlatformY) {
                    this.lastTouchedPlatformY = platform.y;
                    this.scoreText.setText('' + (++this.score));
                }

                if (platform.type === 'bomb') {
                    if (!platform.timer) {
                        platform.timer = this.time.delayedCall(1500, () => {
                            platform.gfx?.destroy();
                            platform.destroy();
                            platform.timer = null;
                        });
                    }
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

    /* -----------------------
                Objects
        -----------------------
    */
    setupFallingObjects() {
        this.fallingObjects = this.physics.add.group(); // Este grupo contendrá Ladrillos.
    }
    setupDc3Objects() { // MODIFICADO: Inicialización del nuevo grupo para DC3
        this.dc3Objects = this.physics.add.group();
    }

    setupShieldObjects() {
        this.shieldObjects = this.physics.add.group();
    }

    setupBootsObjects() {
        this.bootsObjects = this.physics.add.group();
    }

    spawnFallingObject(type, color, velocityRange) { // Original (brick, etc)
        if (!this.gameStarted || !this.player.getData('isAlive')) return;
        const x = Phaser.Math.Between(30, this.scale.width - 30);
        const y = this.cameras.main.scrollY - this.scale.height * 1.5;
        const object = this.add.rectangle(x, y, 20, 20, color);
        this.physics.add.existing(object);
        object.body.setCircle(10);

        const fallTime = 50000;
        const distance = this.scale.height * 1.5;
        const initialVelocity = (distance - 0.5 * 1000 * (fallTime * fallTime) / 1000000) / (fallTime / 1000);
        const slowMotionFactor = 0.2;
        object.body.setVelocityY(initialVelocity * slowMotionFactor);
        object.setData('type', type);
        this.fallingObjects.add(object);
        object.alias = type === 'damage' ? 'Ladrillo' : 'DC3';
        return object;
    }

    spawnFallingDamageObject() {
        if (!this.gameStarted || !this.player.getData('isAlive')) return;
        const xPos = Phaser.Math.Between(30, this.scale.width - 30);
        const yNotif = this.cameras.main.scrollY + 50;

        this.showDangerIndicator(xPos, yNotif);

        this.time.delayedCall(this.timers.damageObject.warningDuration, () => {
            if (!this.player.getData('isAlive')) return;

            const ySpawn = this.cameras.main.scrollY - 50;
            const brick = this.physics.add.sprite(xPos, ySpawn, 'brick');
            brick.setScale(1.3);
            brick.body.setCircle((brick.width * 2) / 20);
            brick.body.gravity.y = 1;
            brick.setData('type', 'damage'); 
            this.fallingObjects.add(brick); // Se añade al grupo 'fallingObjects' (solo para ladrillos)
            brick.alias = 'Ladrillo';
        });
    }

    showDangerIndicator(x, y) {
        if (this.fallingWarningIndicator) {
            this.fallingWarningIndicator.destroy();
        }

        this.fallingWarningIndicator = this.add.graphics();
        this.fallingWarningIndicator.fillStyle(0xFF0000, 0.8);
        this.fallingWarningIndicator.fillCircle(x, y, 10);

        this.tweens.add({
            targets: this.fallingWarningIndicator,
            alpha: { from: 0.8, to: 0.2 },
            duration: 200,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: Math.ceil(this.timers.damageObject.warningDuration / 400),
            onComplete: () => {
                this.fallingWarningIndicator?.destroy();
                this.fallingWarningIndicator = null;
            }
        });
    }

    showPickupIndicator(x, y, warningDuration) {
        if (this.pickupWarningIndicator) {
            this.pickupWarningIndicator.destroy();
        }
        this.pickupWarningIndicator = this.add.graphics();
        this.pickupWarningIndicator.fillStyle(0x00FF00, 0.8);
        this.pickupWarningIndicator.fillCircle(x, y, 10);

        this.tweens.add({
            targets: this.pickupWarningIndicator,
            alpha: { from: 0.8, to: 0.2 },
            duration: 200,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: Math.ceil(warningDuration / 400),
            onComplete: () => {
                this.pickupWarningIndicator?.destroy();
                this.pickupWarningIndicator = null;
            }
        });
    }

    spawnScoreBonusObject() {
        if (!this.gameStarted || !this.player.getData('isAlive')) return;

        const visiblePlatforms = this.platforms.getChildren().filter(p =>
            p.y > this.cameras.main.scrollY && p.y < this.cameras.main.scrollY + this.scale.height * 0.7
        );

        if (visiblePlatforms.length > 0) {
            const targetPlatform = Phaser.Utils.Array.GetRandom(visiblePlatforms);
            const xPos = targetPlatform.x;
            const yPos = targetPlatform.y - (targetPlatform.displayHeight / 2) - 20;

            this.showPickupIndicator(xPos, yPos, this.timers.scoreBonus.warningDuration);

            this.time.delayedCall(this.timers.scoreBonus.warningDuration, () => {
                if (!this.player.getData('isAlive')) return;
                const scoreBonus = this.physics.add.sprite(xPos, yPos, 'dc3');
                scoreBonus.setScale(0.5);
                scoreBonus.body.setCircle((scoreBonus.width * 0.8) / 2);
                scoreBonus.body.allowGravity = false;
                scoreBonus.body.setImmovable(true);
                scoreBonus.setData('type', 'score'); 
                this.dc3Objects.add(scoreBonus); // MODIFICADO: Se añade al nuevo grupo 'dc3Objects'
                scoreBonus.alias = 'DC3';
            });
        }
    }

    spawnShieldObject() {
        if (!this.gameStarted || !this.player.getData('isAlive') || this.hasShield) return;

        const xPos = Phaser.Math.Between(30, this.scale.width - 30);
        const yNotif = this.cameras.main.scrollY + 50;

        this.showPickupIndicator(xPos, yNotif, this.timers.shieldObject.warningDuration);

        this.time.delayedCall(this.timers.shieldObject.warningDuration, () => {
            if (!this.player.getData('isAlive') || this.hasShield) return;

            const ySpawn = this.cameras.main.scrollY - 50;
            const shield = this.physics.add.sprite(xPos, ySpawn, 'helmet');
            shield.setScale(0.5);
            shield.body.setSize(shield.width, shield.height);
            shield.body.gravity.y = this.specialObjectsGravity;
            this.shieldObjects.add(shield);
            this.shieldObject = shield;
            shield.alias = 'Casco';
        });
    }

    spawnBootsObject() {
        if (!this.gameStarted || !this.player.getData('isAlive') || this.hasBoots) return;

        const visiblePlatforms = this.platforms.getChildren().filter(p =>
            p.y > this.cameras.main.scrollY && p.y < this.cameras.main.scrollY + this.scale.height * 0.7
        );

        if (visiblePlatforms.length > 0) {
            const targetPlatform = Phaser.Utils.Array.GetRandom(visiblePlatforms);
            const xPos = targetPlatform.x;
            const yPos = targetPlatform.y - (targetPlatform.displayHeight / 2) - 20;

            this.showPickupIndicator(xPos, yPos, this.timers.bootsObject.warningDuration);

            this.time.delayedCall(this.timers.bootsObject.warningDuration, () => {
                if (!this.player.getData('isAlive') || this.hasBoots) return;
                const boots = this.physics.add.sprite(xPos, yPos, 'boots');
                boots.setScale(0.5);
                boots.body.setSize(boots.width, boots.height);
                boots.body.allowGravity = false;
                boots.body.setImmovable(true);
                this.bootsObjects.add(boots);
                this.bootsObject = boots;
                boots.alias = 'Botas';
            });
        }
    }

    handleFallingObjectCollision(player, object) { // Renombrado de 'fallingObject' a 'object' para ser más general
        if (!player.getData('isAlive')) return;

        const type = object.getData('type');
        if (type === 'damage') { // Ladrillo
            this.hitSound.play();

            if (this.hasShield) {
                this.hasShield = false;
                this.deactivateShieldGlow();
                if (this.shieldObject) {
                    this.shieldObject.destroy();
                    this.shieldObject = null;
                }
                object.destroy(); 
            } else {
                this.player.setData('isAlive', false);
                object.destroy();

                this.endGame();

                this.tweens.add({
                    targets: player,
                    y: player.y - 10,
                    duration: 200,
                    ease: 'Sine.out',
                    onComplete: () => {
                        player.body.setVelocityY(0);
                        player.body.allowGravity = false;
                        player.setTexture('hubito2');
                    }
                });
            }
        } else if (type === 'score') { // DC3
            this.score += 10;
            this.scoreText.setText('' + this.score);
            this.pickupSound.play();
            object.destroy();
        }
    }

    handleShieldCollision(player, shield) {
        if (!this.hasShield) {
            this.hasShield = true;
            this.activateShieldGlow();
            shield.destroy();
            this.shieldObject = null;
            this.pickupSound.play();
        }
    }

    activateShieldGlow() {
        this.shieldGlowEffect = this.player.postFX.addGlow(0xffffff, 2, 0, false, 0.1, 32);
    }

    deactivateShieldGlow() {
        if (this.shieldGlowEffect) {
            this.player.postFX.remove(this.shieldGlowEffect);
            this.shieldGlowEffect = null;
        }
    }

    handleBootsCollision(player, boots) {
        if (!this.hasBoots) {
            this.hasBoots = true;
            this.originalPlayerJumpSpeed = -1000;
            boots.destroy();
            this.bootsObject = null;
            this.score += 3;
            this.scoreText.setText('' + this.score);
            this.pickupSound.play();
            this.timers.bootsEffect.elapsed = 0;
            this.timers.bootsEffect.duration = 5000;
        }
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
        // Limpiar objetos que caen fuera de la pantalla
        this.fallingObjects.getChildren().forEach(object => {
            if (object.y > cameraBottom + 50) {
                object.destroy();
            }
        });

        // Limpiar también los DC3 si caen muy abajo (aunque deberían quedarse en plataformas)
        this.dc3Objects.getChildren().forEach(object => {
            if (object.y > cameraBottom + 50) {
                object.destroy();
            }
        });
        this.shieldObjects.getChildren().forEach(object => {
            if (object.y > cameraBottom + 50) {
                object.destroy();
            }
        });
        this.bootsObjects.getChildren().forEach(object => {
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
            this.timers.shieldObject.interval = Phaser.Math.Between(18000, 25000);
        }
    }

    handleBootsSpawning(delta) {
        this.timers.bootsObject.elapsed += delta;
        if (this.timers.bootsObject.elapsed >= this.timers.bootsObject.interval) {
            this.spawnBootsObject();
            this.timers.bootsObject.elapsed = 0;
            this.timers.bootsObject.interval = Phaser.Math.Between(15000, 20000);
        }
    }

    handleBootsEffect(delta) {
        if (this.hasBoots) {
            this.timers.bootsEffect.elapsed += delta;
            if (this.timers.bootsEffect.elapsed >= this.timers.bootsEffect.duration) {
                this.hasBoots = false;
                this.player.body.setVelocityY(this.originalPlayerJumpSpeed);
                this.originalPlayerJumpSpeed = -550;
            }
        }
    }

    updateScoreIndicators() {
        const squareSize = 20;
        const padding = 5;
        const startX = this.scale.width - (3 * squareSize + 2 * padding) - 10;
        const startY = 10;

        const positions = [
            { x: startX + squareSize / 2, y: startY + squareSize / 2 },
            { x: startX + squareSize + padding + squareSize / 2, y: startY + squareSize / 2 },
            { x: startX + 2 * (squareSize + padding) + squareSize / 2, y: startY + squareSize / 2 }
        ];

        for (let i = 0; i < this.scoreThresholds.length; i++) {
            if (this.score >= this.scoreThresholds[i] && !this.indicatorsChanged[i]) {
                this.scoreIndicators[i].destroy();

                const newIndicator = this.add.sprite(positions[i].x, positions[i].y, this.indicatorKeys[i])
                    .setOrigin(0.5, 0.5)
                    .setScale(0.8)
                    .setScrollFactor(0)
                    .setDepth(10);

                this.scoreIndicators[i] = newIndicator;
                this.indicatorsChanged[i] = true;
            }
        }
    }

    update(time, delta) {
        if (!this.gameStarted || !this.player.getData('isAlive') || this.isPaused) {
            this.bg.tilePositionY = this.cameras.main.scrollY;
            this.updateScoreIndicators();
            return;
        }

        this.handlePlayerMovement();
        this.handlePlatformCollisions();
        this.handlePlatformGeneration();
        this.handleFallingObjects(delta); // Aquí se manejan los ladrillos y la aparición de DC3
        this.handleShieldSpawning(delta);
        this.handleBootsSpawning(delta);
        this.handleBootsEffect(delta);

        this.updateScoreIndicators();

        if (this.player.y > this.cameras.main.scrollY + this.scale.height * 0.9 && this.player.getData('isAlive')) {
            this.endGame();
        }
    }
}
export default MainScene;
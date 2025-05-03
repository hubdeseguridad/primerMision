// assets/js/main.js

class MainScene extends Phaser.Scene {
    constructor() {
      super('MainScene');
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
  
      // === Salto automático ===
      // (Nada aquí: se controla en el callback de colisión)
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
  
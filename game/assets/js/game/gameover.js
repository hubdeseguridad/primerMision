class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.finalScore = data.score;
    }

    preload() {
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.classList.add('hidden');
            pauseBtn.style.visibility = 'hidden';
            pauseBtn.style.display = 'none';
        }
    }

    create() {
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff, 0.1).setOrigin(0);

        this.add.text(this.scale.width / 2, this.scale.height * 0.15, `Puntaje Final: ${this.finalScore}`, {
            fontSize: '18px',
            fontFamily: '"Press Start 2P", monospace',
            fill: '#2A67FB',
            align: 'center'
        }).setOrigin(0.5);

        let message = '';
        if (this.finalScore >= 100) {
            message = "¡Haz obtenido la máxima puntuación. ¡Ya eres reconocido como HÉROE!";
        } else if (this.finalScore >= 50) {
            message = "¡Ups! Estuviste a nada de obtener el primer lugar. ¿Deseas seguir intentando o prefieres reclamar tus premios?";
        } else if (this.finalScore >= 25) {
            message = "¡Pudiste hacerlo mejor! ¿Quieres volver a intentar para ganar más premios? ¿O reclamas tus premios actuales?";
        } else {
            message = "¡Pudiste hacerlo mejor! ¿Quieres volver a intentar para ganar más premios?";
        }

        this.add.text(this.scale.width / 2, this.scale.height * 0.3, message, {
            fontSize: '12px',
            fontFamily: '"Press Start 2P", monospace',
            fill: '#2A67FB',
            align: 'center',
            wordWrap: { width: this.scale.width * 0.8, useAdvancedWrap: true }
        }).setOrigin(0.5);

        if (this.finalScore >= 25) {
            this.add.text(this.scale.width / 2, this.scale.height * 0.45, 'Premios:', {
                fontSize: '18px',
                fontFamily: '"Press Start 2P", monospace',
                fill: '#2A67FB',
                align: 'center'
            }).setOrigin(0.5);

            let prizeY = this.scale.height * 0.52;
            const prizeSpacing = 40;

            if (this.finalScore >= 25) {
                this.add.image(this.scale.width * 0.10, prizeY, 'award01_GO').setScale(0.30).setOrigin(0.5, 0.5);
                this.add.text(this.scale.width * 0.20, prizeY, 'Manual + Curso de Primeros Auxilios Básicos', {
                    fontSize: '12px',
                    fontFamily: '"Fira Mono", monospace',
                    fill: '#FFF',
                    align: 'left'
                }).setOrigin(0, 0.5);
                prizeY += prizeSpacing;
            }

            if (this.finalScore >= 50) {
                this.add.image(this.scale.width * 0.10, prizeY, 'award02_GO').setScale(0.30).setOrigin(0.5, 0.5);
                this.add.text(this.scale.width * 0.20, prizeY, 'Brigadistas: 4 cursos por el precio de 3', {
                    fontSize: '12px',
                    fontFamily: '"Fira Mono", monospace',
                    fill: '#FFF',
                    align: 'left'
                }).setOrigin(0, 0.5);
                prizeY += prizeSpacing;
            }

            if (this.finalScore >= 100) {
                this.add.image(this.scale.width * 0.10, prizeY, 'award03_GO').setScale(0.30).setOrigin(0.5, 0.5);
                this.add.text(this.scale.width * 0.20, prizeY, '10% descuento en cualquier otro curso', {
                    fontSize: '12px',
                    fontFamily: '"Fira Mono", monospace',
                    fill: '#FFF',
                    align: 'left'
                }).setOrigin(0, 0.5);
            }
        }

        const buttonY = this.scale.height * 0.8;
        const buttonSpacing = 20;

        const restartButton = this.add.text(this.scale.width / 2, buttonY, 'JUGAR DE NUEVO', {
            fontSize: '14px',
            fontFamily: '"Press Start 2P", monospace',
            fill: '#2A67FB',
            backgroundColor: '',
            padding: { x: 10, y: 8 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.restartGame());

        const claimButton = this.add.text(
            this.scale.width / 2,
            restartButton.y + restartButton.height + buttonSpacing,
            'RECLAMAR PREMIOS',
            {
                fontSize: '13px',
                fontFamily: '"Press Start 2P", monospace',
                fill: '#FFF',
                backgroundColor: '#0E4DF1',
                padding: { x: 15, y: 8 }
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.claimPrizes());

        const radius = 12;
        const rectWidth = claimButton.width + 10;
        const rectHeight = claimButton.height + 6;
        const rect = this.add.graphics();
        rect.fillStyle(0x0E4DF1, 1);
        rect.fillRoundedRect(
            claimButton.x - rectWidth / 2,
            claimButton.y - rectHeight / 2,
            rectWidth,
            rectHeight,
            radius
        );
        rect.setDepth(claimButton.depth - 1);
        claimButton.setDepth(rect.depth + 1);
    }

    restartGame() {
        this.scene.start('MainScene');
    }

    claimPrizes() {
        window.location.href = 'premios.html';
        const pauseButton = document.querySelector('.pause-btn');
        if (pauseButton) {
            pauseButton.classList.add('hidden');
        }
    }
}

export default GameOverScene; 

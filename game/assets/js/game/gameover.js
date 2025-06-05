class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
        this.shareScorePopup = null;
        this.screenshotPreview = null;
        this.sharePopupScoreValue = null;
        this.downloadScreenshotBtn = null;
        this.shareWebBtn = null;
        this.closeSharePopupBtn = null;
        this.currentScreenshotDataURL = null;
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
        // ... (Tu código actual para dibujar la escena, incluyendo fondos, cuadros, textos y botones) ...
        // No necesitas cambiar nada de tu lógica de renderizado visual aquí.

        // Fondo con la imagen "background"
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'background')
            .setDisplaySize(this.scale.width, this.scale.height)
            .setOrigin(0.5);

        // Dimensiones del cuadro central
        const boxWidth = 340;
        const boxHeight = 370;
        const boxX = (this.scale.width - boxWidth) / 2;
        const boxY = (this.scale.height - boxHeight) / 2;

        // Cuadro central blanco con borde
        const box = this.add.graphics();
        box.lineStyle(4, 0x282D58, 1);
        box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 24);
        box.fillStyle(0xFFFFFF, 0.97);
        box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 24);

        // --- Sección de Puntos ---
        const pointsLabelWidth = 120;
        const pointsLabelHeight = 42;
        const pointsValueWidth = 56;
        const pointsValueHeight = 42;
        const sectionY = boxY + 30;
        const centerX = this.scale.width / 2;

        // Cuadro azul para "Puntos"
        const labelBg = this.add.graphics();
        labelBg.fillStyle(0x2A67FB, 1);
        labelBg.fillRoundedRect(centerX - pointsLabelWidth - 5, sectionY, pointsLabelWidth, pointsLabelHeight, 8);

        // Texto "Puntos"
        this.add.text(centerX - pointsLabelWidth / 2 - 5, sectionY + pointsLabelHeight / 2, 'Puntos', {
            fontSize: '18px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#F2F4FB',
            align: 'center'
        }).setOrigin(0.5);

        // Cuadro claro para valor de puntos con borde
        const valueBg = this.add.graphics();
        valueBg.lineStyle(3, 0x282D58, 1);
        valueBg.strokeRoundedRect(centerX + 5, sectionY, pointsValueWidth, pointsValueHeight, 8);
        valueBg.fillStyle(0xF2F4FB, 1);
        valueBg.fillRoundedRect(centerX + 5, sectionY, pointsValueWidth, pointsValueHeight, 8);

        // Texto valor de puntos
        this.add.text(centerX + pointsValueWidth / 2 + 5, sectionY + pointsValueHeight / 2, `${this.finalScore}`, {
            fontSize: '15px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#282D58',
            align: 'center'
        }).setOrigin(0.5);

        // --- Hubito arriba y "Reclama tus premios" debajo ---
        const hubitoY = sectionY + pointsLabelHeight + 30;
        const hubitoImg = this.add.image(centerX, hubitoY, 'hubito2')
            .setOrigin(0.5, -0.2)
            .setDisplaySize(60, 60);

        // Calcula la posición Y justo debajo de la imagen de Hubito
        const hubitoBottomY = hubitoImg.y + hubitoImg.displayHeight * (1 - 0.1) + 10;

        this.add.text(centerX, hubitoBottomY, '¡Reclama tus premios! :)', {
            fontSize: '14px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#282D58',
            align: 'center'
        }).setOrigin(0.5, -0.9);

        // --- Botones ---
        const buttonYStart = boxY + boxHeight - 120;
        const buttonSpacing = 20;

        // Fondo y borde para el botón "JUGAR DE NUEVO"
        const restartBtnWidth = 170;
        const restartBtnHeight = 38;
        const restartBtnRadius = 12;
        const restartBtnBg = this.add.graphics();
        restartBtnBg.lineStyle(3, 0x282D58, 1);
        restartBtnBg.strokeRoundedRect(
            centerX - restartBtnWidth / 2,
            buttonYStart - restartBtnHeight / 2,
            restartBtnWidth,
            restartBtnHeight,
            restartBtnRadius
        );
        restartBtnBg.fillStyle(0xE6EAF9, 1);
        restartBtnBg.fillRoundedRect(
            centerX - restartBtnWidth / 2,
            buttonYStart - restartBtnHeight / 2,
            restartBtnWidth,
            restartBtnHeight,
            restartBtnRadius
        );

        const restartButton = this.add.text(centerX, buttonYStart, 'JUGAR DE NUEVO', {
            fontSize: '16px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#384271',
            align: 'center',
            padding: { x: 10, y: 8 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.restartGame());

        // Asegura que el texto esté sobre el fondo
        restartBtnBg.setDepth(restartButton.depth - 1);
        restartButton.setDepth(restartBtnBg.depth + 1);

        const claimButton = this.add.text(
            centerX,
            restartButton.y + restartButton.height + buttonSpacing,
            'RECLAMAR PREMIOS',
            {
                fontSize: '14px',
                fontFamily: '"Press Start 2P", monospace',
                fill: '#FFF',
                backgroundColor: '#5F8DFC',
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

        // Nuevo: Botón para Compartir Puntaje
        const shareScoreButton = this.add.text(
            centerX,
            claimButton.y + claimButton.height + buttonSpacing,
            'COMPARTIR PUNTAJE',
            {
                fontSize: '14px',
                fontFamily: '"Press Start 2P", monospace',
                fill: '#FFF',
                backgroundColor: '#282D58',
                padding: { x: 15, y: 8 }
            }
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.showShareScorePopup());

        // Fondo y borde para el botón "COMPARTIR PUNTAJE"
        const shareBtnWidth = shareScoreButton.width + 10;
        const shareBtnHeight = shareScoreButton.height + 6;
        const shareBtnRadius = 12;
        const shareBtnBg = this.add.graphics();
        shareBtnBg.fillStyle(0x1a213e, 1);
        shareBtnBg.fillRoundedRect(
            shareScoreButton.x - shareBtnWidth / 2,
            shareScoreButton.y - shareBtnHeight / 2,
            shareBtnWidth,
            shareBtnHeight,
            shareBtnRadius
        );
        shareBtnBg.setDepth(shareScoreButton.depth - 1);
        shareScoreButton.setDepth(shareBtnBg.depth + 1);


        // Inicializar referencias a elementos del DOM para el popup de compartir
        this.shareScorePopup = document.getElementById('share-score-popup');
        this.screenshotPreview = document.getElementById('screenshot-preview');
        this.sharePopupScoreValue = document.getElementById('share-popup-score-value');
        this.downloadScreenshotBtn = document.getElementById('download-screenshot-btn');
        this.shareWebBtn = document.getElementById('share-web-btn');
        this.closeSharePopupBtn = document.getElementById('close-share-popup');

        // Asignar listeners a los botones del popup
        if (this.downloadScreenshotBtn) {
            this.downloadScreenshotBtn.onclick = () => this.downloadScreenshot();
        }
        if (this.shareWebBtn) {
            this.shareWebBtn.onclick = () => this.shareScreenshot();
        }
        if (this.closeSharePopupBtn) {
            this.closeSharePopupBtn.onclick = () => this.hideShareScorePopup();
        }
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

    showShareScorePopup() {
        if (this.shareScorePopup && this.screenshotPreview && this.sharePopupScoreValue) {
            this.time.delayedCall(200, () => {
                const gameCanvas = this.game.canvas;
                this.currentScreenshotDataURL = gameCanvas.toDataURL('image/png');

                this.screenshotPreview.src = this.currentScreenshotDataURL;
                this.sharePopupScoreValue.textContent = this.finalScore;
                this.shareScorePopup.classList.remove('hidden');
            }, [], this);
        }
    }

    hideShareScorePopup() {
        if (this.shareScorePopup) {
            this.shareScorePopup.classList.add('hidden');
            this.currentScreenshotDataURL = null;
        }
    }

    downloadScreenshot() {
        if (!this.currentScreenshotDataURL) {
            console.error('No hay una captura de pantalla disponible para descargar.');
            alert('Por favor, espera a que la captura se genere. Inténtalo de nuevo.');
            return;
        }

        const a = document.createElement('a');
        a.href = this.currentScreenshotDataURL;
        a.download = `MiPuntajeHubito_${this.finalScore}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    async shareScreenshot() {
        if (!this.currentScreenshotDataURL) {
            console.error('No hay una captura de pantalla disponible para compartir.');
            alert('Por favor, espera a que la captura se genere. Inténtalo de nuevo.');
            return;
        }

        try {
            const response = await fetch(this.currentScreenshotDataURL);
            const blob = await response.blob();
            const file = new File([blob], `MiPuntajeHubito_${this.finalScore}.png`, { type: 'image/png' });

            // Define la URL del juego aquí
            const gameUrl = 'https://pages.elhubdeseguridad.com/primerMision/game/'; // <--- NUEVO: Define la URL del juego

            if (navigator.share && navigator.canShare({ files: [file], url: gameUrl })) { // <--- MODIFICADO AQUÍ para incluir 'url'
                await navigator.share({
                    files: [file],
                    title: '¡Mi nuevo puntaje en Hubito!',
                    text: `¡Logré ${this.finalScore} puntos en Hubito! ¿Puedes superarlo?`,
                    url: gameUrl, // <--- NUEVO: Pasa la URL aquí
                });
                console.log('Contenido compartido con éxito.');
            } else {
                console.warn('Web Share API no soporta compartir archivos o URLs en este navegador o contexto.');
                // Fallback si la API no soporta files Y URLs
                alert('Tu navegador no soporta compartir imágenes y enlaces directamente. Puedes descargar la imagen y copiar el enlace para compartir manualmente:\n' + gameUrl);
            }
        } catch (error) {
            console.error('Error al preparar o compartir la captura:', error);
            alert('Hubo un error al intentar compartir la imagen. Por favor, inténtalo de nuevo.');
        }
    }
}

export default GameOverScene;
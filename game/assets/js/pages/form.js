document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mc-embedded-subscribe-form');
    const loadingOverlay = document.getElementById('loading-overlay');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const redirectDelay = 1500; // 1.5 segundos en milisegundos

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            loadingOverlay.style.display = 'flex';
            progressBarFill.style.width = '0%';

            let progress = 0;
            const intervalTime = 350;
            const increment = (100 / (redirectDelay / intervalTime)); // Cuánto porcentaje debe avanzar en cada intervalo

            const progressInterval = setInterval(function () {
                progress += increment;
                if (progress > 100) {
                    progress = 100;
                }
                progressBarFill.style.width = progress + '%';

                if (progress >= 100) {
                    clearInterval(progressInterval); // Detiene la actualización de la barra
                }
            }, intervalTime);

            // Temporizador para la redirección
            setTimeout(function () {
                clearInterval(progressInterval);
                window.location.href = 'game.html';
            }, redirectDelay);
        });
    }
});
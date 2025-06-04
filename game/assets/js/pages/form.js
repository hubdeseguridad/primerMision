// Solo permite números en los campos de teléfono
function onlyNumbers(e) {
    const key = e.key;
    if (!/[0-9]/.test(key) && key !== "Backspace" && key !== "Tab" && key !== "ArrowLeft" && key !== "ArrowRight") {
        e.preventDefault();
    }
}

function isValidEmail(email) {
    return /^[^@]+@[^@]+\.[^@]+$/.test(email);
}

document.addEventListener('DOMContentLoaded', function () {
    const phoneInputs = [
        document.getElementById('mce-PHONE-area'),
        document.getElementById('mce-PHONE-detail1'),
        document.getElementById('mce-PHONE-detail2')
    ];
    phoneInputs.forEach(input => {
        input.addEventListener('keypress', onlyNumbers);
        input.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    });

    function validateInputs() {
        const name = document.getElementById('mce-FNAME').value.trim();
        const email = document.getElementById('mce-EMAIL').value.trim();
        const phoneArea = document.getElementById('mce-PHONE-area').value.trim();
        const phoneDetail1 = document.getElementById('mce-PHONE-detail1').value.trim();
        const phoneDetail2 = document.getElementById('mce-PHONE-detail2').value.trim();
        const submitBtn = document.getElementById('mc-embedded-subscribe');

        const phoneValid = phoneArea.length === 3 && phoneDetail1.length === 3 && phoneDetail2.length === 4;
        const emailValid = isValidEmail(email);

        if (name && emailValid && phoneValid) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }

    document.getElementById('mce-FNAME').addEventListener('input', validateInputs);
    document.getElementById('mce-EMAIL').addEventListener('input', validateInputs);
    document.getElementById('mce-PHONE-area').addEventListener('input', validateInputs);
    document.getElementById('mce-PHONE-detail1').addEventListener('input', validateInputs);
    document.getElementById('mce-PHONE-detail2').addEventListener('input', validateInputs);

    // Mensaje de advertencia si intenta enviar con campos vacíos o email inválido
    const form = document.getElementById('mc-embedded-subscribe-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            const name = document.getElementById('mce-FNAME').value.trim();
            const email = document.getElementById('mce-EMAIL').value.trim();
            const phoneArea = document.getElementById('mce-PHONE-area').value.trim();
            const phoneDetail1 = document.getElementById('mce-PHONE-detail1').value.trim();
            const phoneDetail2 = document.getElementById('mce-PHONE-detail2').value.trim();
            const phoneValid = phoneArea.length === 3 && phoneDetail1.length === 3 && phoneDetail2.length === 4;
            const emailValid = isValidEmail(email);
            if (!(name && emailValid && phoneValid)) {
                e.preventDefault();
                const warning = document.getElementById('form-warning');
                if (warning) {
                    warning.style.display = 'flex';
                }
            }
        });
    }
});

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
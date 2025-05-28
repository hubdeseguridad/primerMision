const gif = document.getElementById('star_img');
const audio = new Audio('assets/sounds/logo.mp3');

const interval = 10000;

function playGifAndSound() {
    const currentSrc = gif.src;
    gif.src = '';
    gif.src = currentSrc + '?' + new Date().getTime();
    audio.currentTime = 0;
    audio.play();
}

setInterval(playGifAndSound, interval);

// Reproducir sonido y gif la primera vez al cargar la página
window.addEventListener('DOMContentLoaded', playGifAndSound);

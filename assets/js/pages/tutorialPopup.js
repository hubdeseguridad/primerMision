
document.addEventListener('DOMContentLoaded', () => {
    const openTutorialBtn = document.getElementById('openTutorial');
    const tutorialPopup = document.getElementById('tutorialPopup');
    const closeTutorialBtn = document.getElementById('closeTutorial');

    // Función para mostrar el popup
    function openPopup() {
        tutorialPopup.style.display = 'flex'; // Usamos 'flex' para mantener el centrado CSS
    }

    // Función para cerrar el popup
    function closePopup() {
        tutorialPopup.style.display = 'none';
    }

    // Event listener para abrir el popup al hacer clic en "Ver Tutorial"
    if (openTutorialBtn) {
        openTutorialBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Evita que el enlace recargue la página
            openPopup();
        });
    }

    // Event listener para cerrar el popup al hacer clic en la "X"
    if (closeTutorialBtn) {
        closeTutorialBtn.addEventListener('click', () => {
            closePopup();
        });
    }

    // Event listener para cerrar el popup si se hace clic fuera del contenido del popup
    if (tutorialPopup) {
        tutorialPopup.addEventListener('click', (event) => {
            // Si el clic fue directamente en el fondo oscuro y no en el contenido del popup
            if (event.target === tutorialPopup) {
                closePopup();
            }
        });
    }
});
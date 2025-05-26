// Guarda una clave/valor en sessionStorage
function guardarDato(clave, valor) {
    if (valor && typeof clave === 'string') {
        sessionStorage.setItem(clave, valor);
    }
}

// Recupera un valor de sessionStorage
function obtenerDato(clave) {
    return sessionStorage.getItem(clave) || '';
}

// Limpia todos los datos (opcional al terminar)
function limpiarDatos() {
    sessionStorage.clear();
}

const CACHE_NAME = 'primera-mision-cache-v1.0.0';


const urlsToCache = [
    // Archivos HTML 
    '/',          
    'index.html', 
    'game.html',  

    // Archivos CSS
    'assets/styles/index.css',
    'assets/styles/game.css', 

    // Archivos JavaScript 
    'assets/js/game/game.js',
    'assets/js/game/gameover.js',
    'assets/js/game/mainscene.js',

    'assets/js/pages/form.js',
    'assets/js/pages/logo.js',
    'assets/js/pages/tutorialPopup.js',
    'assets/js/pages/var.js',

    // Recursos de Imágenes 
    'assets/img/award01.png',     
    'assets/img/award02.png',     
    'assets/img/award03.png',     
    'assets/img/background.png',     
    'assets/img/banner.png',     
    'assets/img/botita.png',     
    'assets/img/brick.png',     
    'assets/img/casco.png',     
    'assets/img/DC3.png',     
    'assets/img/end.svg',     
    'assets/img/Hubito.gif',     
    'assets/img/hubito01.png',     
    'assets/img/hubito02.png',     
    'assets/img/hubitojump.png',     
    'assets/img/hubitojump2.png',     
    'assets/img/pause.png',     
    'assets/img/user.svg',     
    'assets/img/viga.png',     
    'assets/img/viga02.png', 
    
       
    'assets/img/Index/BOTITA.svg',
    'assets/img/Index/CASCO.svg',
    'assets/img/Index/CUPÓN.svg',
    'assets/img/Index/DC3.svg',
    'assets/img/Index/FELIZ.svg',
    'assets/img/Index/FONDO.svg',
    'assets/img/Index/LADRILLO.svg',
    'assets/img/Index/LIBRO.svg',
    'assets/img/Index/Logo.gif',
    'assets/img/Index/Logo.png',
    'assets/img/Index/MONEDA.svg',
    'assets/img/Index/SALTANDO.svg',
    'assets/img/Index/TRISTE.svg',

];


self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Cache abierta:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[Service Worker] Todos los recursos han sido cacheados.');
                self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Fallo al cachear los recursos:', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activando...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activado y cachés antiguas limpiadas.');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method === 'GET' && !event.request.url.startsWith('chrome-extension://')) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        console.log(`[Service Worker] Sirviendo desde caché: ${event.request.url}`);
                        return response;
                    }
                    console.log(`[Service Worker] Obteniendo de la red: ${event.request.url}`);
                    return fetch(event.request)
                        .then((networkResponse) => {
                            if (networkResponse.ok && event.request.url.startsWith(self.location.origin)) {
                                const responseToCache = networkResponse.clone();
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                            }
                            return networkResponse;
                        })
                        .catch(() => {
                            console.error('[Service Worker] Fallo al obtener de red y no en caché:', event.request.url);
                        });
                })
        );
    }
});
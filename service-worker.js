const CACHE_NAME = "wordbook-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon-32.png",
    "./icon-180.png",
    "./icon-192.png",
    "./icon-512.png"
];


// Установка
self.addEventListener("install", function(event) {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(function(cache) {

                return cache.addAll(APP_FILES);

            })

    );

    self.skipWaiting();

});


// Активация
self.addEventListener("activate", function(event) {

    event.waitUntil(

        caches.keys()
            .then(function(cacheNames) {

                return Promise.all(

                    cacheNames.map(function(cacheName) {

                        if (cacheName !== CACHE_NAME) {

                            return caches.delete(cacheName);

                        }

                    })

                );

            })

    );

    self.clients.claim();

});


// Запросы
self.addEventListener("fetch", function(event) {

    // Работаем только с GET
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request)
            .then(function(cachedResponse) {

                if (cachedResponse) {

                    return cachedResponse;

                }

                return fetch(event.request)
                    .then(function(networkResponse) {

                        // Кэшируем успешные ответы
                        if (
                            networkResponse &&
                            networkResponse.status === 200
                        ) {

                            const responseClone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(function(cache) {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                });

                        }

                        return networkResponse;

                    });

            })
            .catch(function() {

                // Если нет сети и файла нет в кэше

                if (
                    event.request.mode === "navigate"
                ) {

                    return caches.match(
                        "./index.html"
                    );

                }

            })

    );

});


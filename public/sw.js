/**
 * Service Worker para EBN Financial Reports
 * Implementación simple siguiendo la documentación oficial de Next.js 16
 */

const CACHE_NAME = 'ebn-financial-reports-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/upload',
  '/expenses',
  '/settings',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Cache abierto');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antiguo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia: Network First, Fallback to Cache
self.addEventListener('fetch', (event) => {
  // Solo cachear solicitudes GET
  if (event.request.method !== 'GET') {
    return;
  }

  // No cachear en desarrollo (localhost) - dejar que pase directamente
  const isDevelopment = event.request.url.includes('localhost') || event.request.url.includes('127.0.0.1');
  if (isDevelopment) {
    // En desarrollo, no interceptar (pasar directamente a la red)
    return;
  }

  // No cachear solicitudes a la API, recursos externos, o archivos estáticos de Next.js
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('chrome-extension://') ||
    event.request.url.includes('_next/static') ||
    event.request.url.includes('_next/data') ||
    event.request.url.includes('hot-update') ||
    event.request.url.includes('webpack-hmr')
  ) {
    return;
  }

  // Estrategia: Network First con fallback a cache (solo en producción)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Verificar si la respuesta es válida
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clonar la respuesta
        const responseToCache = response.clone();

        // Agregar al cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde el cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Si no hay en cache y es un documento, devolver la página principal
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Notificaciones push (para uso futuro)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nueva notificación',
      icon: data.icon || '/icon-192x192.png',
      badge: '/icon-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || '1',
      },
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'EBN Financial Reports', options)
    );
  }
});

// Click en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notificación click recibida');
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

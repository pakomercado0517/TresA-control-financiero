'use client';

import { useEffect } from 'react';

/**
 * Componente para registrar el Service Worker
 * Según la documentación oficial de Next.js 16
 * Solo registra en producción para evitar conflictos con hot-reload
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // Solo registrar en el cliente
    if (typeof window === 'undefined') {
      return;
    }

    // Verificar si el navegador soporta Service Workers
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker no soportado en este navegador');
      return;
    }

    // Verificar si estamos en desarrollo (localhost)
    const isDevelopment =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';

    // En desarrollo, desregistrar cualquier Service Worker existente
    if (isDevelopment) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              console.log('Service Worker desregistrado en desarrollo:', registration.scope);
            }
          });
        }
      });
      // No registrar Service Worker en desarrollo
      return;
    }

    // Variables para limpieza
    let updateInterval: NodeJS.Timeout | null = null;
    let handleMessage: ((event: MessageEvent) => void) | null = null;

    // Registrar Service Worker solo en producción
    navigator.serviceWorker
      .register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // No cachear la actualización del Service Worker
      })
      .then((registration) => {
        console.log('✅ Service Worker registrado correctamente:', registration.scope);

        // Verificar actualizaciones periódicamente (cada hora)
        updateInterval = setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Escuchar actualizaciones del Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nuevo Service Worker disponible');
                // Opcional: Mostrar notificación al usuario para recargar
              }
            });
          }
        });

        // Escuchar mensajes del Service Worker
        handleMessage = (event: MessageEvent) => {
          console.log('📨 Mensaje del Service Worker:', event.data);
        };

        navigator.serviceWorker.addEventListener('message', handleMessage);
      })
      .catch((error) => {
        console.error('❌ Error al registrar Service Worker:', error);
      });

    // Cleanup: limpiar intervalo y listeners al desmontar
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
      if (handleMessage) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, []);

  return null;
}

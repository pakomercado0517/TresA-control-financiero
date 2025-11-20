import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TresA Control Financiero',
    short_name: 'TresA Control',
    description: 'Sistema de control financiero mediante procesamiento de facturas XML (CFDI México). Controla tus ingresos y gastos de forma simple y profesional.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0047AB', // Azul cobalto corporativo
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Ver reportes financieros',
        url: '/dashboard',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
          },
        ],
      },
      {
        name: 'Ingresos',
        short_name: 'Ingresos',
        description: 'Cargar facturas de ingreso',
        url: '/upload',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
          },
        ],
      },
      {
        name: 'Gastos',
        short_name: 'Gastos',
        description: 'Registrar gastos',
        url: '/expenses',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
          },
        ],
      },
    ],
    categories: ['finance', 'business', 'productivity'],
  };
}


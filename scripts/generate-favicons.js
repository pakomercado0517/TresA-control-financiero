const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../../logo-transparente.png');
const PUBLIC_DIR = path.join(__dirname, '../public');
const APP_DIR = path.join(__dirname, '../app');

// Tamaños para favicons web
const WEB_FAVICONS = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 96, name: 'favicon-96x96.png' },
];

// Tamaños para PWA (iconos)
const PWA_ICONS = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

// Apple Touch Icon
const APPLE_TOUCH_ICON = { size: 180, name: 'apple-touch-icon.png' };

async function generateFavicon() {
  try {
    // Verificar que el logo existe
    if (!fs.existsSync(LOGO_PATH)) {
      throw new Error(`Logo no encontrado en: ${LOGO_PATH}`);
    }

    console.log('🎨 Generando favicons desde logo-transparente.png...\n');

    // Generar favicons web
    console.log('📱 Generando favicons web...');
    for (const favicon of WEB_FAVICONS) {
      const outputPath = path.join(PUBLIC_DIR, favicon.name);
      await sharp(LOGO_PATH)
        .resize(favicon.size, favicon.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Fondo transparente
        })
        .png()
        .toFile(outputPath);
      console.log(`  ✅ ${favicon.name} (${favicon.size}x${favicon.size})`);
    }

    // Generar iconos PWA
    console.log('\n📲 Generando iconos PWA...');
    for (const icon of PWA_ICONS) {
      const outputPath = path.join(PUBLIC_DIR, icon.name);
      await sharp(LOGO_PATH)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Fondo transparente
        })
        .png()
        .toFile(outputPath);
      console.log(`  ✅ ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Generar Apple Touch Icon
    console.log('\n🍎 Generando Apple Touch Icon...');
    const appleOutputPath = path.join(PUBLIC_DIR, APPLE_TOUCH_ICON.name);
    await sharp(LOGO_PATH)
      .resize(APPLE_TOUCH_ICON.size, APPLE_TOUCH_ICON.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Fondo transparente
      })
      .png()
      .toFile(appleOutputPath);
    console.log(`  ✅ ${APPLE_TOUCH_ICON.name} (${APPLE_TOUCH_ICON.size}x${APPLE_TOUCH_ICON.size})`);

    // Generar favicon.ico (múltiples tamaños en un solo archivo)
    console.log('\n🔷 Generando favicon.ico...');
    const faviconIcoPath = path.join(PUBLIC_DIR, 'favicon.ico');
    const faviconAppPath = path.join(APP_DIR, 'favicon.ico');
    
    // Para favicon.ico, necesitamos generar múltiples tamaños
    // Sharp no soporta ICO directamente, así que generamos PNGs y los convertimos
    // Por ahora, generamos un PNG de 32x32 como favicon.ico
    // Nota: Para un verdadero .ico con múltiples tamaños, necesitarías una librería adicional
    // Pero Next.js acepta PNG como favicon.ico también
    await sharp(LOGO_PATH)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(faviconIcoPath);
    
    // También copiar a app/ para Next.js 13+ App Router
    await sharp(LOGO_PATH)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(faviconAppPath);
    
    console.log('  ✅ favicon.ico (32x32) generado en public/ y app/');

    console.log('\n✨ ¡Todos los favicons han sido generados exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`  - Favicons web: ${WEB_FAVICONS.length} archivos`);
    console.log(`  - Iconos PWA: ${PWA_ICONS.length} archivos`);
    console.log(`  - Apple Touch Icon: 1 archivo`);
    console.log(`  - favicon.ico: 2 archivos (public/ y app/)`);
    console.log(`  - Total: ${WEB_FAVICONS.length + PWA_ICONS.length + 3} archivos generados`);

  } catch (error) {
    console.error('❌ Error al generar favicons:', error);
    process.exit(1);
  }
}

generateFavicon();


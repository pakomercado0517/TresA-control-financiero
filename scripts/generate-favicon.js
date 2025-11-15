/**
 * Script para generar favicon desde el logo
 * Genera favicon.ico y apple-touch-icon.png
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'app');
const logoPath = path.join(publicDir, 'logo_ebn_fr.png');

// Verificar que el logo existe
if (!fs.existsSync(logoPath)) {
  console.error('❌ Error: No se encontró logo_ebn_fr.png en public/');
  process.exit(1);
}

console.log('🎨 Generando favicon desde logo_ebn_fr.png...\n');

// Generar favicon
async function generateFavicon() {
  try {
    // Leer el logo original
    const logoBuffer = await sharp(logoPath)
      .ensureAlpha()
      .toBuffer();

    // Tamaños para favicon
    const sizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 96, name: 'favicon-96x96.png' },
      { size: 192, name: 'favicon-192x192.png' }, // Para Android
      { size: 512, name: 'favicon-512x512.png' }, // Para Android
      { size: 180, name: 'apple-touch-icon.png' }, // Para iOS
    ];

    console.log('📐 Generando favicons...');

    // Generar cada tamaño
    for (const { size, name } of sizes) {
      const outputPath = path.join(publicDir, name);

      try {
        await sharp(logoBuffer)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .png()
          .toFile(outputPath);

        console.log(`✅ Creado: ${name} (${size}x${size})`);
      } catch (error) {
        console.error(`❌ Error creando ${name}:`, error.message);
      }
    }

    // Generar favicon.ico (ICO multi-size)
    // Nota: sharp no soporta ICO directamente, así que usamos PNG de 32x32 como favicon.ico
    // Next.js acepta PNG como favicon.ico
    const faviconPath = path.join(appDir, 'favicon.ico');
    await sharp(logoBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(faviconPath);

    console.log(`✅ Creado: app/favicon.ico (32x32 PNG)`);

    // También crear favicon.ico en public para compatibilidad
    const publicFaviconPath = path.join(publicDir, 'favicon.ico');
    await sharp(logoBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(publicFaviconPath);

    console.log(`✅ Creado: public/favicon.ico (32x32 PNG)`);

    console.log('\n✨ Favicons generados correctamente!');
    console.log('\n📝 Archivos creados:');
    sizes.forEach(({ name }) => {
      console.log(`   - public/${name}`);
    });
    console.log('   - app/favicon.ico');
    console.log('   - public/favicon.ico');

  } catch (error) {
    console.error('❌ Error procesando logo:', error.message);
    process.exit(1);
  }
}

// Ejecutar
generateFavicon().catch(console.error);


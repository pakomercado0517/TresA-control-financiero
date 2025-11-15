/**
 * Script para generar iconos PWA a partir del logo original
 * Genera todos los tamaños requeridos desde logo_ebn_fr.png
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tamaños requeridos para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo_ebn_fr.png');

// Verificar que el logo existe
if (!fs.existsSync(logoPath)) {
  console.error('❌ Error: No se encontró logo_ebn_fr.png en public/');
  process.exit(1);
}

console.log('🎨 Generando iconos PWA desde logo_ebn_fr.png...\n');

// Generar todos los iconos
async function generateIcons() {
  try {
    // Leer el logo original
    const logoBuffer = await sharp(logoPath)
      .ensureAlpha() // Asegurar canal alpha para transparencia
      .toBuffer();

    console.log('📐 Procesando logo original...');

    // Generar cada tamaño
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);

      try {
        // Redimensionar manteniendo aspecto y agregando padding si es necesario
        await sharp(logoBuffer)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }, // Fondo transparente
          })
          .png()
          .toFile(outputPath);

        console.log(`✅ Creado: icon-${size}x${size}.png (${size}x${size})`);
      } catch (error) {
        console.error(`❌ Error creando icon-${size}x${size}.png:`, error.message);
      }
    }

    console.log('\n✅ Todos los iconos generados correctamente!');
    console.log('\n📝 Archivos creados:');
    sizes.forEach(size => {
      console.log(`   - icon-${size}x${size}.png`);
    });

    // Verificar dimensiones del logo original
    const metadata = await sharp(logoPath).metadata();
    console.log(`\n📊 Logo original: ${metadata.width}x${metadata.height}px`);

  } catch (error) {
    console.error('❌ Error procesando logo:', error.message);
    process.exit(1);
  }
}

// Ejecutar
generateIcons().catch(console.error);


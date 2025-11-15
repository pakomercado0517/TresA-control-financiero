/**
 * Script para generar iconos PWA PNG reales
 * Usa sharp para crear iconos PNG desde SVG o colores sólidos
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuración del icono
const iconConfig = {
  backgroundColor: '#3b82f6', // Azul del tema
  textColor: '#ffffff', // Blanco
  size: 512, // Tamaño base
};

// Crear un icono PNG sólido con texto
async function createPNGIcon(size, outputPath) {
  try {
    // Crear un SVG con el texto
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${iconConfig.backgroundColor}" rx="${size * 0.2}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="${iconConfig.textColor}" text-anchor="middle" dominant-baseline="middle">CI</text>
      </svg>
    `;

    // Convertir SVG a PNG usando sharp
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✅ Creado: ${path.basename(outputPath)} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Error creando ${outputPath}:`, error.message);
  }
}

// Tamaños requeridos
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');

console.log('🎨 Generando iconos PWA PNG...\n');

// Crear todos los iconos
async function generateAllIcons() {
  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
    await createPNGIcon(size, outputPath);
  }

  // Actualizar manifest.json para usar PNG
  const manifestPath = path.join(publicDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    
    // Actualizar iconos para usar PNG
    manifest.icons = sizes.map(size => ({
      src: `/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: 'any maskable'
    }));

    // Actualizar shortcuts para usar PNG
    manifest.shortcuts = manifest.shortcuts.map(shortcut => ({
      ...shortcut,
      icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
    }));
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('\n✅ Manifest.json actualizado para usar iconos PNG\n');
  }

  console.log('✨ Iconos PNG generados correctamente!');
  console.log('\n📝 Nota: Estos son iconos placeholder básicos.');
  console.log('   Para producción, reemplaza con iconos PNG personalizados.');
  console.log('   Usa: https://www.pwabuilder.com/imageGenerator\n');
}

// Ejecutar
generateAllIcons().catch(console.error);


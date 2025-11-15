/**
 * Script para generar iconos PWA placeholder básicos
 * Estos iconos son temporales hasta que se creen los iconos finales
 */

const fs = require('fs');
const path = require('path');

// Crear un icono SVG básico
function createSVGIcon(size, text) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`;
}

// Convertir SVG a base64 PNG (usando data URI)
// Nota: Esto crea iconos SVG, que algunos navegadores aceptan
function createSVGIconFile(size, outputPath) {
  const svg = createSVGIcon(size, 'CI');
  fs.writeFileSync(outputPath, svg);
  console.log(`✅ Creado: ${path.basename(outputPath)} (${size}x${size})`);
}

// Tamaños requeridos
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');

console.log('🎨 Generando iconos PWA placeholder...\n');

// Crear iconos SVG (temporales)
sizes.forEach(size => {
  const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
  // Crear como SVG primero (mejor compatibilidad que PNG placeholder)
  const svgPath = path.join(publicDir, `icon-${size}x${size}.svg`);
  createSVGIconFile(size, svgPath);
});

console.log('\n⚠️  Nota: Estos son iconos SVG placeholder.');
console.log('   Para producción, reemplaza con iconos PNG reales.');
console.log('   Usa: https://www.pwabuilder.com/imageGenerator\n');

// Actualizar manifest para aceptar SVG temporalmente
const manifestPath = path.join(publicDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  
  // Actualizar iconos para usar SVG temporalmente
  manifest.icons = sizes.map(size => ({
    src: `/icon-${size}x${size}.svg`,
    sizes: `${size}x${size}`,
    type: 'image/svg+xml',
    purpose: 'any maskable'
  }));
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Manifest.json actualizado para usar iconos SVG\n');
}

console.log('✨ Iconos placeholder generados correctamente!');


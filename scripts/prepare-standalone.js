/**
 * Script para preparar el build standalone copiando archivos estáticos
 * Ejecutar después de `pnpm build`
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const staticDir = path.join(rootDir, '.next', 'static');
const publicDir = path.join(rootDir, 'public');

/**
 * Copiar directorio recursivamente
 */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  ${src} no existe, omitiendo...`);
    return;
  }

  // Crear directorio destino si no existe
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Copiar archivos
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('🚀 Preparando build standalone...\n');

// 1. Copiar .next/static a .next/standalone/.next/static
// Nota: Verificar si la estructura tiene una subcarpeta (finance-reports)
const financeReportsDir = path.join(standaloneDir, 'finance-reports');
const hasSubFolder = fs.existsSync(financeReportsDir);

// Si existe la subcarpeta, copiar allí, sino en la raíz de standalone
const targetDir = hasSubFolder ? financeReportsDir : standaloneDir;

console.log('📁 Copiando archivos estáticos (.next/static)...');
const standaloneStaticDir = path.join(targetDir, '.next', 'static');
copyDir(staticDir, standaloneStaticDir);
console.log('✅ Archivos estáticos copiados\n');

// 2. Copiar public a .next/standalone/public (o finance-reports/public si existe)
console.log('📁 Copiando carpeta public...');
const standalonePublicDir = path.join(targetDir, 'public');
copyDir(publicDir, standalonePublicDir);
console.log('✅ Carpeta public copiada\n');

// También copiar public en la raíz de standalone si hay subcarpeta
if (hasSubFolder) {
  const rootPublicDir = path.join(standaloneDir, 'public');
  if (!fs.existsSync(rootPublicDir)) {
    copyDir(publicDir, rootPublicDir);
    console.log('✅ Carpeta public copiada también en raíz de standalone\n');
  }
}

// 3. Verificar archivos PWA
console.log('🔍 Verificando archivos PWA...');
const swPath = path.join(standalonePublicDir, 'sw.js');
const hasSW = fs.existsSync(swPath);

if (hasSW) {
  console.log('✅ Service worker (sw.js) encontrado');
} else {
  console.warn('⚠️  Service worker (sw.js) no encontrado');
}

// Nota: El manifest ahora se genera automáticamente desde app/manifest.ts
console.log('✅ Manifest generado automáticamente desde app/manifest.ts');

// 4. Limpiar node_modules innecesario en la raíz de standalone (si existe)
console.log('\n🧹 Limpiando archivos innecesarios...');
const rootNodeModules = path.join(standaloneDir, 'node_modules');
if (fs.existsSync(rootNodeModules)) {
  try {
    fs.rmSync(rootNodeModules, { recursive: true, force: true });
    console.log('✅ node_modules eliminado de la raíz de standalone (innecesario)');
  } catch (err) {
    console.warn('⚠️  No se pudo eliminar node_modules de la raíz:', err.message);
  }
} else {
  console.log('✅ No hay node_modules en la raíz (correcto)');
}

// Verificar estructura
if (hasSubFolder) {
  console.log('\n📁 Estructura detectada: .next/standalone/finance-reports/');
  console.log('   Servidor: .next/standalone/finance-reports/server.js');
  console.log('   node_modules: .next/standalone/finance-reports/node_modules/ ✅');
} else {
  console.log('\n📁 Estructura detectada: .next/standalone/');
  console.log('   Servidor: .next/standalone/server.js');
  console.log('   node_modules: .next/standalone/node_modules/ ✅');
}
console.log('');

console.log('✨ Build standalone preparado correctamente!');
console.log('\n📝 Archivos necesarios para distribución:');
console.log('   - .next/standalone/ (carpeta completa)');
console.log('   - start.bat (Windows)');
console.log('   - start.sh (Mac/Linux)');


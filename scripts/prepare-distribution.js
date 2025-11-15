/**
 * Script para preparar el paquete de distribución para el cliente
 * Crea una carpeta lista para entregar con todos los archivos necesarios
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const distDir = path.join(rootDir, 'distribucion');
const version = '0.1.0';
const distName = `ebn-financial-reports-v${version}`;
const distPath = path.join(distDir, distName);

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  ${src} no existe, omitiendo...`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Omitir archivos innecesarios
    if (entry.name === 'nul' || entry.name === '.DS_Store') {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

console.log('📦 Preparando paquete de distribución...\n');

// 1. Crear carpeta de distribución
if (fs.existsSync(distPath)) {
  console.log('🧹 Limpiando carpeta de distribución existente...');
  fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath, { recursive: true });
console.log(`✅ Carpeta creada: ${distName}\n`);

// 2. Copiar standalone
console.log('📁 Copiando build standalone...');
const standaloneDest = path.join(distPath, 'standalone');
copyDir(standaloneDir, standaloneDest);
console.log('✅ Build standalone copiado\n');

// 3. Copiar scripts de inicio
console.log('📄 Copiando scripts de inicio...');
copyFile(path.join(rootDir, 'start.bat'), path.join(distPath, 'start.bat'));
copyFile(path.join(rootDir, 'start.sh'), path.join(distPath, 'start.sh'));
console.log('✅ Scripts copiados\n');

// 4. Copiar documentación
console.log('📚 Copiando documentación...');
copyFile(
  path.join(rootDir, 'README_CLIENTE.md'),
  path.join(distPath, 'README_CLIENTE.md')
);
copyFile(
  path.join(rootDir, 'GUIA_DISTRIBUCION.md'),
  path.join(distPath, 'GUIA_DISTRIBUCION.md')
);
console.log('✅ Documentación copiada\n');

// 5. Verificar archivos críticos
console.log('🔍 Verificando archivos críticos...');
const serverJs = path.join(distPath, 'standalone', 'finance-reports', 'server.js');
const staticDir = path.join(distPath, 'standalone', 'finance-reports', '.next', 'static');
const publicDir = path.join(distPath, 'standalone', 'finance-reports', 'public');
const swJs = path.join(distPath, 'standalone', 'finance-reports', 'public', 'sw.js');

const checks = [
  { name: 'server.js', path: serverJs },
  { name: '.next/static', path: staticDir },
  { name: 'public', path: publicDir },
  { name: 'sw.js', path: swJs },
  { name: 'start.bat', path: path.join(distPath, 'start.bat') },
  { name: 'start.sh', path: path.join(distPath, 'start.sh') },
  { name: 'README_CLIENTE.md', path: path.join(distPath, 'README_CLIENTE.md') },
];

let allOk = true;
for (const check of checks) {
  if (fs.existsSync(check.path)) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`❌ ${check.name} - NO ENCONTRADO`);
    allOk = false;
  }
}

if (!allOk) {
  console.log('\n⚠️  Algunos archivos críticos no se encontraron');
  process.exit(1);
}

console.log('\n✨ Paquete de distribución preparado correctamente!');
console.log(`\n📁 Ubicación: ${distPath}`);
console.log('\n📝 Contenido del paquete:');
console.log(`   - standalone/ (build completo)`);
console.log(`   - start.bat (Windows)`);
console.log(`   - start.sh (Mac/Linux)`);
console.log(`   - README_CLIENTE.md (guía de instalación)`);
console.log(`   - GUIA_DISTRIBUCION.md (guía técnica)`);
console.log('\n💡 Siguiente paso: Comprimir la carpeta en ZIP para entregar al cliente');
console.log(`   Carpeta a comprimir: ${distName}`);


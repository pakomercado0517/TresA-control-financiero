/**
 * Script para verificar que el build standalone tiene todos los archivos necesarios
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const financeReportsDir = path.join(standaloneDir, 'finance-reports');

console.log('🔍 Verificando build standalone...\n');

// Verificar que existe standalone
if (!fs.existsSync(standaloneDir)) {
  console.error('❌ Error: .next/standalone no existe');
  console.error('💡 Ejecuta: pnpm build:standalone');
  process.exit(1);
}

// Determinar la estructura
const hasSubFolder = fs.existsSync(financeReportsDir);
const targetDir = hasSubFolder ? financeReportsDir : standaloneDir;

console.log(`📁 Estructura detectada: ${hasSubFolder ? '.next/standalone/finance-reports/' : '.next/standalone/'}\n`);

// Verificar si node_modules existe en alguna ubicación
const nodeModulesInRoot = path.join(standaloneDir, 'node_modules');
const nodeModulesInSub = path.join(financeReportsDir, 'node_modules');

if (!fs.existsSync(nodeModulesInRoot) && !fs.existsSync(nodeModulesInSub)) {
  console.error('❌ CRÍTICO: node_modules NO existe en ninguna ubicación del standalone');
  console.error('💡 Esto indica que el build de Next.js no se completó correctamente');
  console.error('\n🔧 Soluciones:');
  console.error('   1. Verificar que el build se completó sin errores');
  console.error('   2. Eliminar .next completamente: rm -rf .next (o rmdir /s .next en Windows)');
  console.error('   3. Reinstalar dependencias: pnpm install');
  console.error('   4. Reconstruir: pnpm build:standalone');
  console.error('\n⚠️  Si el problema persiste, puede ser un problema con pnpm y symlinks en Windows');
  console.error('   Considera usar npm para el build: npm run build');
  process.exit(1);
}

// Verificar archivos críticos
const criticalFiles = [
  'server.js',
  'package.json',
  'node_modules',
  '.next',
];

let allOk = true;

criticalFiles.forEach(file => {
  const filePath = path.join(targetDir, file);
  if (fs.existsSync(filePath)) {
    if (file === 'node_modules') {
      // Verificar que node_modules tiene 'next'
      const nextPath = path.join(filePath, 'next');
      if (fs.existsSync(nextPath)) {
        console.log(`✅ ${file}/ existe y contiene 'next'`);
      } else {
        console.error(`❌ ${file}/ existe pero NO contiene 'next'`);
        allOk = false;
      }
    } else {
      console.log(`✅ ${file} existe`);
    }
  } else {
    console.error(`❌ ${file} NO existe`);
    allOk = false;
  }
});

// Verificar node_modules/next específicamente
const nextModulePath = path.join(targetDir, 'node_modules', 'next');
if (fs.existsSync(nextModulePath)) {
  console.log(`✅ node_modules/next/ existe`);
  
  // Verificar package.json de next
  const nextPackagePath = path.join(nextModulePath, 'package.json');
  if (fs.existsSync(nextPackagePath)) {
    const nextPackage = JSON.parse(fs.readFileSync(nextPackagePath, 'utf8'));
    console.log(`   Versión: ${nextPackage.version}`);
  }
} else {
  console.error(`❌ node_modules/next/ NO existe`);
  allOk = false;
}

// Verificar .next/static
const staticDir = path.join(targetDir, '.next', 'static');
if (fs.existsSync(staticDir)) {
  console.log(`✅ .next/static/ existe`);
} else {
  console.warn(`⚠️  .next/static/ NO existe (se copiará con prepare-standalone.js)`);
}

// Verificar public
const publicDir = path.join(targetDir, 'public');
if (fs.existsSync(publicDir)) {
  console.log(`✅ public/ existe`);
} else {
  console.warn(`⚠️  public/ NO existe (se copiará con prepare-standalone.js)`);
}

console.log('');

if (allOk) {
  console.log('✨ Build standalone verificado correctamente!');
  process.exit(0);
} else {
  console.error('❌ El build standalone está incompleto');
  console.error('\n💡 Soluciones:');
  console.error('   1. Eliminar .next: rm -rf .next (o rmdir /s .next en Windows)');
  console.error('   2. Reconstruir: pnpm build:standalone');
  process.exit(1);
}


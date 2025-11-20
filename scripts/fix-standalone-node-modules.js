/**
 * Script para copiar node_modules al standalone si no se generaron automáticamente
 * Esto es un workaround para problemas con pnpm y symlinks en Windows
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const financeReportsDir = path.join(standaloneDir, 'finance-reports');
const rootNodeModules = path.join(rootDir, 'node_modules');

console.log('🔧 Verificando y corrigiendo node_modules en standalone...\n');

// Determinar la estructura
const hasSubFolder = fs.existsSync(financeReportsDir);
const targetDir = hasSubFolder ? financeReportsDir : standaloneDir;
const targetNodeModules = path.join(targetDir, 'node_modules');

console.log(`📁 Estructura detectada: ${hasSubFolder ? '.next/standalone/finance-reports/' : '.next/standalone/'}\n`);

// Verificar si node_modules ya existe en el standalone
if (fs.existsSync(targetNodeModules)) {
  const nextModule = path.join(targetNodeModules, 'next');
  if (fs.existsSync(nextModule)) {
    console.log('✅ node_modules ya existe en standalone y contiene next');
    console.log('   No es necesario copiar\n');
    process.exit(0);
  } else {
    console.log('⚠️  node_modules existe pero no contiene next');
    console.log('   Eliminando para recrear...\n');
    fs.rmSync(targetNodeModules, { recursive: true, force: true });
  }
}

// Verificar que existe node_modules en la raíz
if (!fs.existsSync(rootNodeModules)) {
  console.error('❌ Error: No se encontró node_modules en la raíz del proyecto');
  console.error('💡 Ejecuta primero: pnpm install');
  process.exit(1);
}

console.log('📦 Copiando node_modules al standalone...');
console.log('   Esto puede tardar varios minutos...\n');

// Función para copiar directorio (maneja symlinks)
function copyDir(src, dest, depth = 0) {
  if (depth > 10) return; // Prevenir recursión infinita
  
  if (!fs.existsSync(src)) {
    return;
  }

  const stat = fs.lstatSync(src);
  
  if (stat.isSymbolicLink()) {
    // Para symlinks, copiar el destino real
    try {
      const realPath = fs.realpathSync(src);
      if (fs.existsSync(realPath)) {
        if (fs.statSync(realPath).isDirectory()) {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          // Copiar contenido del symlink
          const entries = fs.readdirSync(realPath);
          for (const entry of entries) {
            copyDir(path.join(realPath, entry), path.join(dest, entry), depth + 1);
          }
        } else {
          fs.copyFileSync(realPath, dest);
        }
      }
    } catch (err) {
      console.warn(`⚠️  No se pudo copiar symlink: ${src}`);
    }
  } else if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      // Omitir algunos directorios innecesarios
      if (entry === '.cache' || entry === '.git' || entry.startsWith('.')) {
        continue;
      }
      copyDir(path.join(src, entry), path.join(dest, entry), depth + 1);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copiar solo las dependencias de producción necesarias
const packageJson = JSON.parse(fs.readFileSync(path.join(targetDir, 'package.json'), 'utf8'));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

console.log('📋 Copiando dependencias necesarias...\n');

let copied = 0;
let skipped = 0;

for (const [depName, depVersion] of Object.entries(dependencies)) {
  const srcPath = path.join(rootNodeModules, depName);
  const destPath = path.join(targetNodeModules, depName);
  
  if (fs.existsSync(srcPath)) {
    try {
      copyDir(srcPath, destPath);
      copied++;
      if (copied % 10 === 0) {
        process.stdout.write(`   Copiadas ${copied} dependencias...\r`);
      }
    } catch (err) {
      console.warn(`⚠️  Error copiando ${depName}: ${err.message}`);
      skipped++;
    }
  } else {
    skipped++;
  }
}

console.log(`\n✅ Copiadas ${copied} dependencias`);
if (skipped > 0) {
  console.log(`⚠️  Omitidas ${skipped} dependencias (no encontradas)`);
}

// Verificar que next está presente
const nextPath = path.join(targetNodeModules, 'next');
if (fs.existsSync(nextPath)) {
  console.log('\n✅ node_modules copiado correctamente');
  console.log('✅ next está presente\n');
} else {
  console.error('\n❌ Error: next no se copió correctamente');
  console.error('💡 Intenta ejecutar: pnpm install && pnpm build:standalone');
  process.exit(1);
}

console.log('✨ node_modules corregido en standalone!');


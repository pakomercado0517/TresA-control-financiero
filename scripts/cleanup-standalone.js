/**
 * Script para limpiar la carpeta .next/standalone antes del build
 * Resuelve el error EBUSY en Windows
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');

function cleanupStandalone() {
  console.log('🧹 Limpiando carpeta .next/standalone...\n');

  if (!fs.existsSync(standaloneDir)) {
    console.log('✅ La carpeta .next/standalone no existe, no hay nada que limpiar\n');
    return;
  }

  try {
    // Intentar eliminar archivos individualmente primero
    console.log('📁 Eliminando archivos...');
    const entries = fs.readdirSync(standaloneDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(standaloneDir, entry.name);
      try {
        if (entry.isDirectory()) {
          fs.rmSync(entryPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 1000 });
        } else {
          fs.unlinkSync(entryPath);
        }
      } catch (err) {
        console.warn(`⚠️  No se pudo eliminar: ${entry.name}`, err.message);
      }
    }

    // Intentar eliminar la carpeta
    try {
      fs.rmSync(standaloneDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 1000 });
      console.log('✅ Carpeta .next/standalone eliminada correctamente\n');
    } catch (err) {
      console.warn('⚠️  No se pudo eliminar la carpeta completa:', err.message);
      console.log('💡 Intenta cerrar el explorador de archivos o cualquier proceso que use esta carpeta\n');
    }
  } catch (error) {
    console.error('❌ Error al limpiar:', error.message);
    console.log('\n💡 Soluciones:');
    console.log('   1. Cierra el explorador de archivos si está abierto en .next/standalone');
    console.log('   2. Cierra cualquier servidor Node.js que esté corriendo');
    console.log('   3. Espera unos segundos y vuelve a intentar');
    console.log('   4. Reinicia el terminal y vuelve a intentar\n');
  }
}

cleanupStandalone();


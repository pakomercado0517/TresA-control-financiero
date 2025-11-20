/**
 * Script completo para preparar la carpeta de distribución
 * Copia standalone y scripts a la ubicación correcta
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const standaloneSource = path.join(rootDir, '.next', 'standalone');
const distDir = path.join(rootDir, 'distribucion', 'ebn-financial-reports-v0.1.0');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`❌ Error: ${src} no existe`);
    console.error('💡 Ejecuta primero: pnpm build:standalone');
    process.exit(1);
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

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

console.log('📦 Preparando carpeta de distribución completa...\n');

// 1. Verificar que existe .next/standalone
if (!fs.existsSync(standaloneSource)) {
  console.error('❌ Error: .next/standalone no existe');
  console.error('💡 Ejecuta primero: pnpm build:standalone');
  process.exit(1);
}

// 2. Crear carpeta de distribución
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✅ Carpeta de distribución creada');
}

// 3. Copiar standalone
console.log('📁 Copiando standalone...');
const standaloneDest = path.join(distDir, 'standalone');
if (fs.existsSync(standaloneDest)) {
  console.log('⚠️  La carpeta standalone ya existe, eliminando...');
  fs.rmSync(standaloneDest, { recursive: true, force: true });
}
copyDir(standaloneSource, standaloneDest);
console.log('✅ Standalone copiado\n');

// 4. Crear scripts de distribución
console.log('📝 Creando scripts de inicio...');
const scriptsWindows = {
  'start.bat': `@echo off
title EBN Financial Reports
echo ========================================
echo   EBN Financial Reports
echo ========================================
echo.
echo Iniciando servidor...
echo.
echo La aplicacion estara disponible en:
echo http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
cd standalone\\finance-reports
node server.js
pause
`,

  'start-minimized.bat': `@echo off
REM Ejecutar servidor minimizado en segundo plano
cd /d %~dp0
start /min cmd /c "cd /d ""%~dp0standalone\\finance-reports"" && node server.js"
exit
`,

  'start-hidden.vbs': `' Ejecutar servidor sin ventana visible (completamente oculto)
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "cmd /c cd /d """ & WshShell.CurrentDirectory & "\\standalone\\finance-reports"" && node server.js", 0, False
Set WshShell = Nothing
`,

  'stop-server.bat': `@echo off
REM Detener el servidor Node.js
echo Deteniendo servidor...
taskkill /F /IM node.exe 2>nul
if %errorlevel%==0 (
    echo Servidor detenido correctamente
) else (
    echo No se encontro el servidor corriendo
)
pause
`,
};

const scriptsUnix = {
  'start.sh': `#!/bin/bash
echo "========================================"
echo "  EBN Financial Reports"
echo "========================================"
echo ""
echo "Iniciando servidor..."
echo ""
echo "La aplicacion estara disponible en:"
echo "http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""
cd standalone/finance-reports
node server.js
`,

  'start-minimized.sh': `#!/bin/bash
# Ejecutar servidor en segundo plano (minimizado)
cd "$(dirname "$0")/standalone/finance-reports"
nohup node server.js > server.log 2>&1 &
echo $! > server.pid
echo "Servidor iniciado en segundo plano"
echo "Para ver logs: tail -f standalone/finance-reports/server.log"
echo "Para detener: ./stop-server.sh"
`,

  'start-hidden.sh': `#!/bin/bash
# Ejecutar servidor completamente en segundo plano
cd "$(dirname "$0")/standalone/finance-reports"
nohup node server.js > /dev/null 2>&1 &
echo $! > server.pid
exit 0
`,

  'stop-server.sh': `#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/standalone/finance-reports/server.pid"
if [ -f "$PID_FILE" ]; then
    kill $(cat "$PID_FILE") 2>/dev/null
    rm -f "$PID_FILE"
fi
pkill -f "node.*server.js" 2>/dev/null
lsof -ti:3000 | xargs kill 2>/dev/null
echo "Servidor detenido"
`,
};

Object.entries(scriptsWindows).forEach(([filename, content]) => {
  const filePath = path.join(distDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Creado: ${filename}`);
});

Object.entries(scriptsUnix).forEach(([filename, content]) => {
  const filePath = path.join(distDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  if (process.platform !== 'win32') {
    fs.chmodSync(filePath, '755');
  }
  console.log(`✅ Creado: ${filename}`);
});

// 5. Copiar README si existe
const readmeSource = path.join(rootDir, 'README_CLIENTE.md');
if (fs.existsSync(readmeSource)) {
  const readmeDest = path.join(distDir, 'README_CLIENTE.md');
  fs.copyFileSync(readmeSource, readmeDest);
  console.log('✅ README_CLIENTE.md copiado');
}

console.log('\n✨ Distribución preparada correctamente!');
console.log(`\n📁 Ubicación: ${distDir}`);
console.log('\n📝 Estructura creada:');
console.log('   - standalone/ (carpeta completa)');
console.log('   - start.bat, start.sh (y variantes)');
console.log('   - README_CLIENTE.md');
console.log('\n🚀 Para probar:');
console.log(`   cd ${distDir}`);
console.log('   start.bat (Windows) o ./start.sh (Mac/Linux)');



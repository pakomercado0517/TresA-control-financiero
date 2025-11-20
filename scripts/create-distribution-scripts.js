/**
 * Script para crear versiones de los scripts de inicio
 * adaptadas para la carpeta de distribución
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'distribucion', 'ebn-financial-reports-v0.1.0');

// Crear directorio de distribución si no existe
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Scripts Windows para distribución
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

// Scripts Mac/Linux para distribución
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
# El servidor corre en background pero puedes ver los logs

cd "$(dirname "$0")/standalone/finance-reports"

# Ejecutar en background
nohup node server.js > server.log 2>&1 &

# Guardar el PID para poder detenerlo después
echo $! > server.pid

echo "========================================"
echo "  Servidor iniciado en segundo plano"
echo "========================================"
echo ""
echo "La aplicación está disponible en:"
echo "http://localhost:3000"
echo ""
echo "Para ver los logs:"
echo "  tail -f standalone/finance-reports/server.log"
echo ""
echo "Para detener el servidor:"
echo "  ./stop-server.sh"
echo ""
echo "O ejecutar:"
echo "  kill \$(cat standalone/finance-reports/server.pid)"
echo ""
`,

  'start-hidden.sh': `#!/bin/bash
# Ejecutar servidor completamente en segundo plano (sin terminal visible)
# El servidor corre en background sin mostrar nada

cd "$(dirname "$0")/standalone/finance-reports"

# Ejecutar en background completamente silencioso
nohup node server.js > /dev/null 2>&1 &

# Guardar el PID para poder detenerlo después
echo $! > server.pid

# No mostrar nada (completamente silencioso)
exit 0
`,

  'stop-server.sh': `#!/bin/bash
# Detener el servidor Node.js

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/standalone/finance-reports/server.pid"

echo "Deteniendo servidor..."

# Intentar detener usando el PID guardado
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        kill "$PID" 2>/dev/null
        echo "✅ Servidor detenido (PID: $PID)"
        rm -f "$PID_FILE"
    else
        echo "⚠️  El proceso ya no está corriendo"
        rm -f "$PID_FILE"
    fi
else
    echo "⚠️  No se encontró el archivo PID"
fi

# También intentar detener cualquier proceso node que esté usando el puerto 3000
if command -v lsof > /dev/null 2>&1; then
    PORT_PID=$(lsof -ti:3000)
    if [ ! -z "$PORT_PID" ]; then
        kill "$PORT_PID" 2>/dev/null
        echo "✅ Proceso en puerto 3000 detenido (PID: $PORT_PID)"
    fi
fi

# Detener todos los procesos node relacionados (último recurso)
pkill -f "node.*server.js" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Todos los procesos del servidor detenidos"
fi

echo ""
echo "Servidor detenido correctamente"
`,
};

console.log('📝 Creando scripts de inicio para distribución...\n');

// Crear scripts Windows
Object.entries(scriptsWindows).forEach(([filename, content]) => {
  const filePath = path.join(distDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Creado: ${filename}`);
});

// Crear scripts Unix
Object.entries(scriptsUnix).forEach(([filename, content]) => {
  const filePath = path.join(distDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  // Dar permisos de ejecución (solo en sistemas Unix)
  if (process.platform !== 'win32') {
    fs.chmodSync(filePath, '755');
  }
  console.log(`✅ Creado: ${filename}`);
});

console.log('\n✨ Scripts de distribución creados correctamente!');
console.log(`\n📁 Ubicación: ${distDir}`);
console.log('\n📝 Scripts creados:');
console.log('   Windows:');
Object.keys(scriptsWindows).forEach(name => console.log(`     - ${name}`));
console.log('   Mac/Linux:');
Object.keys(scriptsUnix).forEach(name => console.log(`     - ${name}`));



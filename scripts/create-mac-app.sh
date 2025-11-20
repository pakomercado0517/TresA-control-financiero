#!/bin/bash
# Script para crear una aplicación .app para Mac desde la carpeta de distribución

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$ROOT_DIR/distribucion/ebn-financial-reports-v0.1.0"
APP_NAME="EBN Financial Reports.app"
APP_DIR="$DIST_DIR/$APP_NAME"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"

echo "🍎 Creando aplicación Mac (.app)..."
echo ""

# Verificar que existe la carpeta de distribución
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Error: No se encontró la carpeta de distribución: $DIST_DIR"
    echo "💡 Ejecuta primero: pnpm prepare:distribution-complete"
    exit 1
fi

# Crear estructura de la aplicación
echo "📁 Creando estructura de la aplicación..."
mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

# Crear el script principal que se ejecutará
cat > "$MACOS_DIR/EBNFinancialReports" << 'EOF'
#!/bin/bash
# Script principal de la aplicación Mac

# Configurar PATH para incluir ubicaciones comunes de Node.js en Mac
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$HOME/.nvm/versions/node/$(nvm version 2>/dev/null)/bin:$PATH"

# Intentar encontrar Node.js en ubicaciones comunes
NODE_PATH=""
if command -v node > /dev/null 2>&1; then
    NODE_PATH=$(which node)
elif [ -f "/usr/local/bin/node" ]; then
    NODE_PATH="/usr/local/bin/node"
elif [ -f "/opt/homebrew/bin/node" ]; then
    NODE_PATH="/opt/homebrew/bin/node"
elif [ -f "/usr/bin/node" ]; then
    NODE_PATH="/usr/bin/node"
else
    # Buscar en el sistema
    NODE_PATH=$(find /usr/local /opt/homebrew "$HOME" -name "node" -type f 2>/dev/null | head -1)
fi

# Si aún no se encuentra, intentar con nvm
if [ -z "$NODE_PATH" ] || [ ! -f "$NODE_PATH" ]; then
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        source "$HOME/.nvm/nvm.sh"
        NODE_PATH=$(which node 2>/dev/null)
    fi
fi

# Verificar que Node.js está instalado
if [ -z "$NODE_PATH" ] || [ ! -f "$NODE_PATH" ]; then
    osascript -e 'display dialog "Error: No se pudo encontrar Node.js.\n\nPor favor, asegúrate de que Node.js está instalado y accesible desde la Terminal.\n\nPuedes instalarlo desde: https://nodejs.org/" buttons {"OK"} default button "OK"'
    exit 1
fi

# Obtener la ruta de la aplicación
APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
STANDALONE_DIR="$APP_DIR/Contents/Resources/standalone/finance-reports"

# Verificar si el servidor ya está corriendo
if lsof -ti:3000 > /dev/null 2>&1; then
    osascript -e 'display dialog "El servidor ya está corriendo. ¿Deseas abrir la aplicación en el navegador?" buttons {"Abrir", "Cancelar"} default button "Abrir"' -e 'if button returned of result is "Abrir" then open location "http://localhost:3000"'
    exit 0
fi

# Cambiar al directorio del servidor
cd "$STANDALONE_DIR" || exit 1

# Iniciar el servidor en segundo plano usando la ruta completa de Node.js
nohup "$NODE_PATH" server.js > "$APP_DIR/Contents/Resources/server.log" 2>&1 &
SERVER_PID=$!

# Guardar el PID para poder detenerlo después
echo $SERVER_PID > "$APP_DIR/Contents/Resources/server.pid"

# Esperar un momento para que el servidor inicie
sleep 3

# Verificar que el servidor está corriendo
if lsof -ti:3000 > /dev/null 2>&1; then
    # Abrir el navegador automáticamente
    open http://localhost:3000
    
    # Mostrar notificación
    osascript -e 'display notification "EBN Financial Reports está corriendo en http://localhost:3000" with title "EBN Financial Reports"'
else
    # Leer los logs para mostrar el error
    LOG_FILE="$APP_DIR/Contents/Resources/server.log"
    ERROR_MSG="Error: No se pudo iniciar el servidor."
    
    if [ -f "$LOG_FILE" ]; then
        LAST_ERROR=$(tail -5 "$LOG_FILE" 2>/dev/null)
        ERROR_MSG="$ERROR_MSG\n\nÚltimos logs:\n$LAST_ERROR\n\nLog completo en: $LOG_FILE"
    fi
    
    osascript -e "display dialog \"$ERROR_MSG\" buttons {\"Ver Logs\", \"OK\"} default button \"OK\"" -e 'if button returned of result is "Ver Logs" then open location "file://'$LOG_FILE'"'
    exit 1
fi

# Mantener el script corriendo
wait $SERVER_PID
EOF

# Dar permisos de ejecución
chmod +x "$MACOS_DIR/EBNFinancialReports"

# Copiar la carpeta standalone a Resources
echo "📦 Copiando archivos de la aplicación..."
if [ -d "$DIST_DIR/standalone" ]; then
    cp -R "$DIST_DIR/standalone" "$RESOURCES_DIR/"
else
    echo "❌ Error: No se encontró la carpeta standalone"
    exit 1
fi

# Crear el Info.plist (metadatos de la aplicación)
cat > "$CONTENTS_DIR/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>EBNFinancialReports</string>
    <key>CFBundleIdentifier</key>
    <string>com.ebn.financial-reports</string>
    <key>CFBundleName</key>
    <string>EBN Financial Reports</string>
    <key>CFBundleVersion</key>
    <string>0.1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>0.1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSUIElement</key>
    <false/>
</dict>
</plist>
EOF

# Crear script para detener el servidor
cat > "$MACOS_DIR/StopServer" << 'EOF'
#!/bin/bash
# Script para detener el servidor

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
PID_FILE="$APP_DIR/Contents/Resources/server.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        kill "$PID" 2>/dev/null
        rm -f "$PID_FILE"
        osascript -e 'display notification "Servidor detenido" with title "EBN Financial Reports"'
    fi
fi

# También intentar detener cualquier proceso en el puerto 3000
if command -v lsof > /dev/null 2>&1; then
    PORT_PID=$(lsof -ti:3000)
    if [ ! -z "$PORT_PID" ]; then
        kill "$PORT_PID" 2>/dev/null
    fi
fi
EOF

chmod +x "$MACOS_DIR/StopServer"

echo ""
echo "✅ Aplicación Mac creada exitosamente!"
echo ""
echo "📁 Ubicación: $APP_DIR"
echo ""
echo "🚀 Para usar la aplicación:"
echo "   1. Hacer doble clic en '$APP_NAME'"
echo "   2. La aplicación iniciará el servidor automáticamente"
echo "   3. Se abrirá el navegador en http://localhost:3000"
echo ""
echo "🛑 Para detener el servidor:"
echo "   Ejecutar: $APP_DIR/Contents/MacOS/StopServer"
echo "   O usar Activity Monitor para encontrar y detener el proceso node"
echo ""


#!/bin/bash
# Detener el servidor Node.js

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/.next/standalone/finance-reports/server.pid"

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


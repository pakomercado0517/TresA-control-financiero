#!/bin/bash
# Ejecutar servidor completamente en segundo plano (sin terminal visible)
# El servidor corre en background sin mostrar nada

cd "$(dirname "$0")/.next/standalone/finance-reports"

# Ejecutar en background completamente silencioso
nohup node server.js > /dev/null 2>&1 &

# Guardar el PID para poder detenerlo después
echo $! > server.pid

# No mostrar nada (completamente silencioso)
exit 0


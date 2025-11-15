#!/bin/bash
# Ejecutar servidor en segundo plano (minimizado)
# El servidor corre en background pero puedes ver los logs

cd "$(dirname "$0")/.next/standalone/finance-reports"

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
echo "  tail -f .next/standalone/finance-reports/server.log"
echo ""
echo "Para detener el servidor:"
echo "  ./stop-server.sh"
echo ""
echo "O ejecutar:"
echo "  kill \$(cat .next/standalone/finance-reports/server.pid)"
echo ""


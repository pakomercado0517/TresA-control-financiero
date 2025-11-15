@echo off
title Control de Ingresos y Gastos
echo ========================================
echo   Control de Ingresos y Gastos - MVP
echo ========================================
echo.
echo Iniciando servidor...
echo.
echo La aplicacion estara disponible en:
echo http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
cd .next\standalone\finance-reports
node server.js
pause


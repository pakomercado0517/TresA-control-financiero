@echo off
REM Ejecutar servidor en segundo plano sin ventana visible
if "%1"=="hidden" goto hidden
start "" /min "%~f0" hidden
exit

:hidden
cd /d %~dp0.next\standalone\finance-reports
node server.js
exit


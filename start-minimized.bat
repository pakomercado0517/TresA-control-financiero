@echo off
REM Ejecutar servidor minimizado en segundo plano
cd /d %~dp0
start /min cmd /c "cd /d ""%~dp0.next\standalone\finance-reports"" && node server.js"
exit


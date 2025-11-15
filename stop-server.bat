@echo off
REM Detener el servidor Node.js
echo Deteniendo servidor...
taskkill /F /IM node.exe 2>nul
if %errorlevel%==0 (
    echo Servidor detenido correctamente
) else (
    echo No se encontro el servidor corriendo
)
pause


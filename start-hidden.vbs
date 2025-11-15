' Ejecutar servidor sin ventana visible (completamente oculto)
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "cmd /c cd /d """ & WshShell.CurrentDirectory & "\.next\standalone\finance-reports"" && node server.js", 0, False
Set WshShell = Nothing


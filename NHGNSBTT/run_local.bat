@echo off
setlocal enabledelayedexpansion

echo Checking for Node.js environment...

rem Check if node is available globally
where node >nul 2>nul
if !errorlevel! equ 0 (
    set "NODE_PATH=node"
) else (
    rem Fallback to DEPTH node.exe
    if exist "D:\d2\nodejs\node.exe" (
        set "NODE_PATH=D:\d2\nodejs\node.exe"
    ) else (
        echo Node.js not found in PATH or in the default folder.
        echo Please make sure Node.js is installed or run with your local Node.js.
        echo.
        echo If you have node installed elsewhere, drag its path here:
        set /p NODE_INPUT="Path: "
        if exist "!NODE_INPUT!" (
            set "NODE_PATH=!NODE_INPUT!"
        ) else (
            echo Invalid path. Exiting...
            pause
            exit /b 1
        )
    )
)

echo Starting local server using: !NODE_PATH!
"!NODE_PATH!" server.js
pause

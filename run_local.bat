@echo off
title Khoi dong Local Server - Ngon ngu Sub-vung Bac Trung Bo
cls

echo ================================================================
echo   HE THONG TRA CUU ^& DICH THUAT PHUONG NGU BAC TRUNG BO (LOCAL)
echo ================================================================
echo.

cd /d "%~dp0"

echo [*] Dang kiem tra moi truong Node.js...

set NODE_EXEC=

rem 1. Kiem tra Node.js trong system PATH
where node >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_EXEC=node"
)

rem 2. Kiem tra node.exe trong thu muc nodejs
if "%NODE_EXEC%"=="" (
    if exist "%~dp0nodejs\node.exe" (
        set "NODE_EXEC=%~dp0nodejs\node.exe"
    ) else if exist "D:\d2\nodejs\node.exe" (
        set "NODE_EXEC=D:\d2\nodejs\node.exe"
    )
)

if "%NODE_EXEC%"=="" (
    echo [!] Khong tim thay Node.js tu dong.
    echo Vui long keo va tha tep node.exe vao day va nhan Enter:
    set /p NODE_EXEC="Duong dan node.exe: "
)

echo [*] Dang khoi chay Server voi: %NODE_EXEC%
echo [*] Dia chi Web Local: http://localhost:3000
echo.
echo ================================================================
echo   Trinh duyet se tu dong mo trang web.
echo   Nhan Ctrl + C de dung Server khi khong su dung nua.
echo ================================================================
echo.

if exist "%~dp0NHGNSBTT\server.js" (
    cd /d "%~dp0NHGNSBTT"
)

"%NODE_EXEC%" server.js

pause

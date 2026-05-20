@echo off
setlocal
title Switcher - Dev tools
chcp 65001 > nul

:menu
cls
echo.
echo   ======================================
echo      Switcher - Outils developpeur
echo   ======================================
echo.
echo   [1] Lancer en mode dev (tauri dev)
echo   [2] Build production (tauri build)
echo   [3] Build frontend seul (bun run build)
echo   [4] Installer les dependances (bun install)
echo   [5] Verifier compilation Rust (cargo check)
echo   [6] Quitter
echo.
set /p choice="   Choix : "

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto build
if "%choice%"=="3" goto buildfront
if "%choice%"=="4" goto install
if "%choice%"=="5" goto check
if "%choice%"=="6" goto end
goto menu

:dev
cls
echo   Lancement en mode dev...
echo.
call bun run tauri dev
echo.
pause
goto menu

:build
cls
echo   Build production...
echo.
call bun run tauri build
echo.
pause
goto menu

:buildfront
cls
echo   Build frontend...
echo.
call bun run build
echo.
pause
goto menu

:install
cls
echo   Installation des dependances bun...
echo.
call bun install
echo.
pause
goto menu

:check
cls
echo   Verification Rust (cargo check)...
echo.
pushd src-tauri
call cargo check
popd
echo.
pause
goto menu

:end
endlocal
exit /b 0

@echo off
setlocal
title Upload Proyek SIDISIPLIN ke GitHub
echo ===================================================
echo     UPLOAD PROYEK SIDISIPLIN KE GITHUB
echo     Target: https://github.com/developercerdas/sidisiplin.git
echo ===================================================
echo.

:: Cari lokasi Git (System PATH atau Laragon)
set "GIT_CMD=git"
where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\laragon\bin\git\cmd\git.exe" (
        set "GIT_CMD=C:\laragon\bin\git\cmd\git.exe"
    ) else (
        echo [ERROR] Git tidak ditemukan di komputer!
        pause
        exit /b 1
    )
)

echo [1/4] Memeriksa remote origin GitHub...
"%GIT_CMD%" remote remove origin >nul 2>nul
"%GIT_CMD%" remote add origin https://github.com/developercerdas/sidisiplin.git

echo [2/4] Mengemas perubahan file terbaru...
"%GIT_CMD%" add .

echo [3/4] Membuat commit...
"%GIT_CMD%" commit -m "update: sync latest sidisiplin files" >nul 2>nul

echo [4/4] Mengunggah (push) ke GitHub repository...
"%GIT_CMD%" branch -M main
"%GIT_CMD%" push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo   BERHASIL! Proyek berhasil diunggah ke GitHub!
    echo   Cek di: https://github.com/developercerdas/sidisiplin
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo   [PERHATIAN] Jika diminta login, silakan login di
    echo   jendela popup GitHub yang muncul di layar.
    echo ===================================================
)

echo.
pause

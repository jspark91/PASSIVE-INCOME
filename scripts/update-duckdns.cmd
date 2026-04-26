@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-duckdns.ps1" %*

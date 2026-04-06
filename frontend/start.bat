@echo off
cd /d "%~dp0"
call pnpm build
call pnpm start

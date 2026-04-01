@echo off
cd /d D:\AI\Nao_u_BOT
git add -A
git commit -m "Manual sync from Win"
git pull --rebase --autostash
git push
pause

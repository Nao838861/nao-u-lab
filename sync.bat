@echo off
echo Syncing memory and tweets to GitHub...

:: メモリファイルをリポジトリにコピー
xcopy /E /Y "C:\Users\owner\.claude\projects\D--AI-Nao-u-BOT\memory\*" "D:\AI\Nao_u_BOT\memory\"

:: git push
cd /d D:\AI\Nao_u_BOT
git add memory/ log/tweets.log
git diff --cached --quiet && echo "No changes to sync." || git commit -m "Auto sync: memory and tweets log" && git push

echo Done.

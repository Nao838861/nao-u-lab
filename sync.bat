@echo off
echo Syncing memory and tweets to GitHub...

set REPO_DIR=D:\AI\Nao_u_BOT
set CLAUDE_MEMORY=%USERPROFILE%\.claude\projects\D--AI-Nao-u-BOT\memory

cd /d %REPO_DIR%

:: GitHubから最新を取得
git pull origin master

:: リポジトリのmemoryをClaudeのローカルメモリに反映
if exist "%REPO_DIR%\memory\" (
    xcopy /E /Y "%REPO_DIR%\memory\*" "%CLAUDE_MEMORY%\"
)

:: Claudeのローカルメモリをリポジトリに上書き
if exist "%CLAUDE_MEMORY%\" (
    xcopy /E /Y "%CLAUDE_MEMORY%\*" "%REPO_DIR%\memory\"
)

:: git push
git add memory/ log/tweets.log log/tweets_win.log log/tweets_mac.log CLAUDE.md
git diff --cached --quiet && echo "No changes to sync." || (
    git commit -m "Auto sync: tweets and memory %DATE% %TIME:~0,5%"
    git push origin master
)

echo Done.

@echo off
REM auto_git_sync.bat — Claudeセッション非依存のgit同期
REM タスクスケジューラから30分ごとに呼ぶ
REM Claudeが死んでいても同期は止まらない

cd /d "C:\AI\nao-u-lab"

REM Pull
git pull origin master --rebase 2>nul

REM 変更があればcommit+push
git add memory/ log/ CLAUDE.md 2>nul
git diff --cached --quiet 2>nul
if errorlevel 1 (
    git commit -m "Auto sync from Win2"
    git push origin master
    echo %date% %time%: Synced.
) else (
    echo %date% %time%: No changes.
)

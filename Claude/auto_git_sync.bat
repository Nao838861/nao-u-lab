@echo off
REM auto_git_sync.bat — Claudeセッション非依存のgit同期
REM タスクスケジューラから30分ごとに呼ぶ
REM Claudeが死んでいても同期は止まらない

cd /d "C:\AI\nao-u-lab\Claude"

REM Rebase 検出ガード — rebase 中の commit/push は意図履歴を分岐させる
REM (knowledge/20260513_auto_sync_rebase_trap.md)
REM 本リポは .git が親ディレクトリ (C:\AI\nao-u-lab\.git) にあるため git rev-parse で実体解決する
for /f "delims=" %%G in ('git rev-parse --git-dir 2^>nul') do set "GIT_DIR_REAL=%%G"
if defined GIT_DIR_REAL (
    if exist "%GIT_DIR_REAL%\rebase-merge" (
        echo %date% %time%: SKIP rebase in progress %GIT_DIR_REAL%
        exit /b 0
    )
    if exist "%GIT_DIR_REAL%\rebase-apply" (
        echo %date% %time%: SKIP rebase in progress %GIT_DIR_REAL%
        exit /b 0
    )
)

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

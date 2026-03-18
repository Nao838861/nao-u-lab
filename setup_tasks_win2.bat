@echo off
chcp 932 >nul
cd /d "C:\AI\nao-u-lab"

echo === Win2(Ash) Task Scheduler Setup ===

schtasks /delete /tn "NaoBot_SlackCheck" /f 2>nul
schtasks /delete /tn "NaoBot_CheckInbox_Win2" /f 2>nul
schtasks /delete /tn "NaoBot_QuickCheck" /f 2>nul
schtasks /delete /tn "NaoBot_GitSync" /f 2>nul
schtasks /delete /tn "NaoBot_AutoDiary" /f 2>nul
schtasks /delete /tn "NaoBot_Watchdog" /f 2>nul

schtasks /create /tn "NaoBot_SlackCheck" /tr "\"C:\Program Files\Python311\pythonw.exe\" C:\AI\nao-u-lab\check_slack.py" /sc minute /mo 1 /f
echo [OK] SlackCheck (1min)

schtasks /create /tn "NaoBot_CheckInbox_Win2" /tr "\"C:\Program Files\Python311\pythonw.exe\" C:\AI\nao-u-lab\check_inbox.py --box win2" /sc minute /mo 10 /f
echo [OK] CheckInbox (10min)

schtasks /create /tn "NaoBot_QuickCheck" /tr "\"C:\Program Files\Python311\pythonw.exe\" C:\AI\nao-u-lab\quick_check.py" /sc minute /mo 5 /f
echo [OK] QuickCheck (5min)

schtasks /create /tn "NaoBot_GitSync" /tr "\"C:\Program Files\Python311\pythonw.exe\" C:\AI\nao-u-lab\git_sync.py" /sc minute /mo 30 /f
echo [OK] GitSync (30min)

schtasks /create /tn "NaoBot_AutoDiary" /tr "\"C:\Program Files\Python311\pythonw.exe\" C:\AI\nao-u-lab\auto_diary.py" /sc minute /mo 180 /f
echo [OK] AutoDiary (3h)

schtasks /create /tn "NaoBot_Watchdog" /tr "C:\AI\nao-u-lab\watchdog_win2.bat" /sc minute /mo 5 /f
echo [OK] Watchdog (5min)

echo.
echo === Done. All tasks registered (pythonw, silent). ===
pause

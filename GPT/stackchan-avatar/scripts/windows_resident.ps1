param(
    [ValidateSet('Install', 'Start', 'Stop', 'Restart', 'Open', 'Status', 'Uninstall')]
    [string]$Action = 'Status'
)
$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$python = Join-Path $project '.stackchan-venv\Scripts\python.exe'
$pythonw = Join-Path $project '.stackchan-venv\Scripts\pythonw.exe'
$runner = Join-Path $PSScriptRoot 'run_resident.py'
$taskName = 'StackChan Avatar'
Set-Location -LiteralPath $project
if (!(Test-Path -LiteralPath $pythonw)) {
    throw 'Run Start StackChan.bat once to install Python dependencies.'
}
$port = & $python -X utf8 -c 'from stackchan_avatar.config import Settings; print(Settings().port)'
if ($LASTEXITCODE -ne 0) { throw 'Cannot read StackChan settings.' }
$url = "http://127.0.0.1:$port"
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($task -and $task.Actions.Execute -ne $pythonw) {
    throw "The task '$taskName' belongs to another installation. No changes were made."
}

function Wait-Ready {
    $deadline = (Get-Date).AddSeconds(30)
    do {
        try {
            $status = Invoke-RestMethod "$url/api/status" -TimeoutSec 2
            if ($status.ok -and $null -ne $status.connected_devices) { return $status }
        } catch { }
        Start-Sleep -Milliseconds 300
    } while ((Get-Date) -lt $deadline)
    throw "StackChan did not start. See $project\logs\server.log"
}

function Stop-Server {
    try {
        $status = Invoke-RestMethod "$url/api/status" -TimeoutSec 2
    } catch { return }
    if (!$status.ok -or $null -eq $status.connected_devices) {
        throw 'Another application is using the configured port.'
    }
    Invoke-RestMethod "$url/api/app/stop" -Method Post -TimeoutSec 5 | Out-Null
    $deadline = (Get-Date).AddSeconds(20)
    do {
        Start-Sleep -Milliseconds 300
        try { Invoke-RestMethod "$url/api/status" -TimeoutSec 1 | Out-Null }
        catch { return }
    } while ((Get-Date) -lt $deadline)
    throw 'Server is still stopping; wait for the current conversation to finish.'
}

function Stop-Resident {
    Stop-Server
    # Also cancel a supervisor that is waiting between crash retries.
    if ($task) {
        $deadline = (Get-Date).AddSeconds(3)
        while ((Get-ScheduledTask -TaskName $taskName).State -eq 'Running') {
            if ((Get-Date) -ge $deadline) {
                Stop-ScheduledTask -TaskName $taskName
                break
            }
            Start-Sleep -Milliseconds 300
        }
    }
}

switch ($Action) {
    'Install' {
        # Switch an existing manually launched server to Task Scheduler ownership.
        Stop-Resident
        $user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        $taskAction = New-ScheduledTaskAction -Execute $pythonw -Argument "-X utf8 `"$runner`"" -WorkingDirectory $project
        $trigger = New-ScheduledTaskTrigger -AtLogOn -User $user
        $trigger.Delay = 'PT15S'
        $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
        $settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
        Register-ScheduledTask -TaskName $taskName -Action $taskAction -Trigger $trigger -Principal $principal -Settings $settings -Description 'StackChan companion server: hidden at logon; restart on failure.' -Force | Out-Null
        $shell = New-Object -ComObject WScript.Shell
        $desktop = [Environment]::GetFolderPath('Desktop')
        $shortcut = $shell.CreateShortcut((Join-Path $desktop 'StackChan.lnk'))
        $shortcut.TargetPath = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
        $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$PSCommandPath`" -Action Open"
        $shortcut.WorkingDirectory = $project
        $shortcut.Description = 'Open StackChan controls (start server if needed)'
        $shortcut.Save()
        Start-ScheduledTask -TaskName $taskName
        Wait-Ready
    }
    'Start' {
        if (!$task) { throw 'Install the resident task first.' }
        Start-ScheduledTask -TaskName $taskName
        Wait-Ready
    }
    'Open' {
        if (!$task) { throw 'Install the resident task first.' }
        Start-ScheduledTask -TaskName $taskName
        Wait-Ready | Out-Null
        Start-Process $url
    }
    'Stop' { Stop-Resident }
    'Restart' {
        if (!$task) { throw 'Install the resident task first.' }
        Stop-Resident
        $deadline = (Get-Date).AddSeconds(10)
        while ((Get-ScheduledTask -TaskName $taskName).State -eq 'Running') {
            if ((Get-Date) -gt $deadline) { throw 'Previous task has not exited yet.' }
            Start-Sleep -Milliseconds 300
        }
        Start-ScheduledTask -TaskName $taskName
        Wait-Ready
    }
    'Status' {
        if ($task) {
            $task | Select-Object TaskName, State
            Get-ScheduledTaskInfo -TaskName $taskName | Select-Object LastRunTime, LastTaskResult
        }
        Invoke-RestMethod "$url/api/status" -TimeoutSec 3
    }
    'Uninstall' {
        Stop-Resident
        if ($task) { Unregister-ScheduledTask -TaskName $taskName -Confirm:$false }
        $link = Join-Path ([Environment]::GetFolderPath('Desktop')) 'StackChan.lnk'
        if (Test-Path -LiteralPath $link) {
            $shell = New-Object -ComObject WScript.Shell
            $shortcut = $shell.CreateShortcut($link)
            if ($shortcut.Arguments.Contains($PSCommandPath)) { Remove-Item -LiteralPath $link }
        }
        Write-Output 'StackChan autostart removed. Application files and settings are preserved.'
    }
}

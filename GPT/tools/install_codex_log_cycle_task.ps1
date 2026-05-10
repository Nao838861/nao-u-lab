param(
  [string]$TaskName = "NaoBot_Codex_Log_Cycle",
  [int]$EveryMinutes = 15
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Cmd = Join-Path $Root "run_codex_log_cycle.cmd"

if (-not (Test-Path -LiteralPath $Cmd)) {
  throw "Missing runner: $Cmd"
}

$Action = New-ScheduledTaskAction -Execute $Cmd
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes $EveryMinutes) `
  -RepetitionDuration (New-TimeSpan -Days 3650)
$Settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $Action `
  -Trigger $Trigger `
  -Settings $Settings `
  -Description "Runs Codex shared-reads memory maintenance and posts to Slack #log with a 90-minute elapsed-time gate." `
  -Force | Out-Null

Write-Host "Registered task $TaskName -> $Cmd every $EveryMinutes minutes (script gates to 90 minutes)."

param(
  [string]$TaskName = "NaoBot_Codex_Phases_Cycle",
  [int]$EveryMinutes = 15
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Cmd = Join-Path $Root "run_codex_phases_cycle.cmd"

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
  -Description "Runs the Codex LLM-driven phased diary cycle. The script gates to roughly 90 minutes and posts diary output in Phase 5." `
  -Force | Out-Null

Write-Host "Registered task $TaskName -> $Cmd every $EveryMinutes minutes (script gates to 90 minutes)."

param(
  [string]$TaskName = "NaoBot_Codex_Phases_Cycle",
  [int]$EveryMinutes = 15
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Cmd = Join-Path $Root "run_codex_phases_cycle.cmd"
$Launcher = Join-Path $Root "tools\run_hidden.vbs"
$Wscript = Join-Path $env:WINDIR "System32\wscript.exe"

if (-not (Test-Path -LiteralPath $Cmd)) {
  throw "Missing runner: $Cmd"
}
if (-not (Test-Path -LiteralPath $Launcher)) {
  throw "Missing hidden launcher: $Launcher"
}
if (-not (Test-Path -LiteralPath $Wscript)) {
  throw "Missing Windows Script Host: $Wscript"
}

$ActionArguments = '//B //NoLogo "' + $Launcher + '" "' + $Cmd + '"'
$Action = New-ScheduledTaskAction `
  -Execute $Wscript `
  -Argument $ActionArguments `
  -WorkingDirectory $Root
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

Write-Host "Registered hidden task $TaskName -> $Cmd every $EveryMinutes minutes (script gates to 90 minutes)."

param([switch]$Remove)
$ErrorActionPreference = 'Stop'
$ruleName = 'StackChan-Avatar-LAN'
$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (!$admin) { throw 'Run this script in an Administrator PowerShell to change Windows Firewall.' }
if ($Remove) {
    Get-NetFirewallRule -Name $ruleName -ErrorAction SilentlyContinue | Remove-NetFirewallRule
    return
}
$project = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $project
$python = Join-Path $project '.stackchan-venv\Scripts\python.exe'
$info = @'
import json
import sys
from pathlib import Path
from stackchan_avatar.config import Settings
from stackchan_avatar.system_setup import detect_lan_ip
print(json.dumps(dict(
    ip=detect_lan_ip(), port=Settings().port,
    program=str(Path(sys._base_executable).with_name("pythonw.exe").resolve()),
)))
'@ | & $python -X utf8 -
if ($LASTEXITCODE -ne 0) { throw 'Cannot read StackChan settings.' }
$info = $info | ConvertFrom-Json
if ($info.ip -eq '127.0.0.1') { throw 'Connect this PC to the home LAN first.' }
$interface = Get-NetIPAddress -AddressFamily IPv4 -IPAddress $info.ip
if (Get-NetFirewallRule -Name $ruleName -ErrorAction SilentlyContinue) {
    throw 'Rule already exists. Use -Remove first if the PC address or Python has changed.'
}
New-NetFirewallRule -Name $ruleName -DisplayName 'StackChan Avatar (home LAN)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort $info.port -LocalAddress $info.ip -RemoteAddress LocalSubnet -InterfaceAlias $interface.InterfaceAlias -Program $info.program -Profile Any | Out-Null
Get-NetFirewallRule -Name $ruleName | Select-Object Name, Enabled, Direction, Action

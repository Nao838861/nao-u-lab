param(
  [Parameter(Mandatory = $true)]
  [string]$Message,

  [string[]]$Paths = @("GPT"),

  [switch]$NoPush
)

$ErrorActionPreference = "Stop"

$GptRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$RepoRoot = Split-Path -Parent $GptRoot
Set-Location $RepoRoot

git -c safe.directory=D:/AI/Nao_u_BOT status --short

foreach ($Path in $Paths) {
  git -c safe.directory=D:/AI/Nao_u_BOT add -- $Path
}

$staged = git -c safe.directory=D:/AI/Nao_u_BOT diff --cached --name-only
if (-not $staged) {
  Write-Host "No staged changes. Nothing to commit."
  exit 0
}

git -c safe.directory=D:/AI/Nao_u_BOT commit -m $Message

if (-not $NoPush) {
  git -c safe.directory=D:/AI/Nao_u_BOT push --no-verify
}

param(
    [Parameter(Mandatory = $true)]
    [string]$PreviousVideo,

    [Parameter(Mandatory = $true)]
    [string]$DayOneVideo
)

$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$publicDir = Join-Path $projectRoot 'public'
$treeDir = Join-Path $publicDir 'tree'

New-Item -ItemType Directory -Force $publicDir | Out-Null
New-Item -ItemType Directory -Force $treeDir | Out-Null

$ffmpegCommand = Get-Command ffmpeg -ErrorAction SilentlyContinue
if ($null -ne $ffmpegCommand) {
    $ffmpegPath = $ffmpegCommand.Source
} else {
    $ffmpegPath = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffmpeg.exe |
        Select-Object -First 1 -ExpandProperty FullName
}

if (-not $ffmpegPath) {
    throw 'ffmpeg.exe was not found.'
}

$comparison = Get-ChildItem 'D:\HomeBrew\MonoSH\tmp' -Filter 'nes_vs_*_30fps.mkv' |
    Select-Object -First 1 -ExpandProperty FullName
$treeSource = 'D:\HomeBrew\MonoSH\png\Tree0'

if (-not $comparison) {
    throw 'The comparison movie was not found.'
}

0..15 | ForEach-Object {
    $name = 'Tree0_{0:D2}.png' -f $_
    Copy-Item -LiteralPath (Join-Path $treeSource $name) -Destination $treeDir -Force
}

& $ffmpegPath -y -hide_banner -loglevel error -ss 45 -t 8 -i $comparison -filter:v crop=320:240:0:0 -an -c:v libx264 -crf 18 -pix_fmt yuv420p (Join-Path $publicDir 'current_demo.mp4')
& $ffmpegPath -y -hide_banner -loglevel error -ss 0 -t 7 -i $PreviousVideo -an -c:v libx264 -crf 20 -pix_fmt yuv420p (Join-Path $publicDir 'previous_video.mp4')
& $ffmpegPath -y -hide_banner -loglevel error -ss 0.8 -t 6 -i $DayOneVideo -an -c:v libx264 -crf 18 -pix_fmt yuv420p (Join-Path $publicDir 'day1.mp4')
& $ffmpegPath -y -hide_banner -loglevel error -ss 35 -t 6 -i $comparison -filter:v crop=320:240:0:0 -an -c:v libx264 -crf 18 -pix_fmt yuv420p (Join-Path $publicDir 'current_tree.mp4')

Write-Host "Assets generated: $publicDir"

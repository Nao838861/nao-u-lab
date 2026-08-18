param(
    [string]$PreviousVideo = '',

    [string]$DayOneVideo = '',

    [string]$DayTwoVideo = '',

    [string]$DayThreeVideo = ''
)

$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$publicDir = Join-Path $projectRoot 'public'
$treeDir = Join-Path $publicDir 'tree'
$manifestPath = Join-Path $projectRoot 'narration\prototype-cuts.json'
$developmentManifestPath = Join-Path $projectRoot 'narration\development-cuts.json'
$assetReportPath = Join-Path $publicDir 'video-asset-report.json'
$sourceSettingsPath = Join-Path $projectRoot 'tools\source-assets.json'

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

$ffprobePath = Join-Path (Split-Path $ffmpegPath -Parent) 'ffprobe.exe'
if (-not (Test-Path $ffprobePath)) {
    throw 'ffprobe.exe was not found.'
}

$invariantCulture = [System.Globalization.CultureInfo]::InvariantCulture
$narrationManifest = Get-Content -Raw -Encoding UTF8 $manifestPath | ConvertFrom-Json
$developmentManifest = Get-Content -Raw -Encoding UTF8 $developmentManifestPath | ConvertFrom-Json
$sourceSettings = Get-Content -Raw -Encoding UTF8 $sourceSettingsPath | ConvertFrom-Json
if (-not $PreviousVideo) {
    $PreviousVideo = $sourceSettings.previousVideo
}
if (-not $DayOneVideo) {
    $DayOneVideo = $sourceSettings.dayOneVideo
}
if (-not $DayTwoVideo) {
    $DayTwoVideo = $sourceSettings.dayTwoVideo
}
if (-not $DayThreeVideo) {
    $DayThreeVideo = $sourceSettings.dayThreeVideo
}

function Get-NarrationCutDuration {
    param(
        [string]$CutId,
        [double]$FallbackSeconds,
        [object]$Manifest = $narrationManifest
    )

    $cut = $Manifest.cuts | Where-Object { $_.id -eq $CutId } | Select-Object -First 1
    if ($null -eq $cut) {
        return $FallbackSeconds
    }
    return [double]$cut.durationFrames / [double]$Manifest.fps
}

function Get-MediaDurationSeconds {
    param([string]$InputPath)

    $rawDuration = & $ffprobePath -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $InputPath
    if ($LASTEXITCODE -ne 0 -or -not $rawDuration) {
        throw "Could not read media duration: $InputPath"
    }
    return [double]::Parse($rawDuration.Trim(), $invariantCulture)
}

function Export-VideoClip {
    param(
        [string]$Name,
        [string]$InputPath,
        [string]$OutputPath,
        [double]$StartSeconds,
        [double]$DurationSeconds,
        [string]$VideoFilter,
        [int]$Crf
    )

    if (-not (Test-Path $InputPath)) {
        throw "Source video was not found: $InputPath"
    }

    $sourceDurationSeconds = Get-MediaDurationSeconds $InputPath
    $availableSeconds = [Math]::Max(0.0, $sourceDurationSeconds - $StartSeconds)
    $looped = $availableSeconds + 0.02 -lt $DurationSeconds
    $startArgument = $StartSeconds.ToString('0.###', $invariantCulture)
    $durationArgument = $DurationSeconds.ToString('0.###', $invariantCulture)
    $arguments = @('-y', '-hide_banner', '-loglevel', 'error')
    if ($looped) {
        $arguments += @('-stream_loop', '-1')
    }
    $arguments += @('-ss', $startArgument, '-i', $InputPath, '-t', $durationArgument)
    if ($VideoFilter) {
        $arguments += @('-filter:v', $VideoFilter)
    }
    $arguments += @('-an', '-c:v', 'libx264', '-crf', $Crf, '-pix_fmt', 'yuv420p', $OutputPath)

    & $ffmpegPath @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Asset generation failed: $Name"
    }

    $outputDurationSeconds = Get-MediaDurationSeconds $OutputPath
    $mode = if ($looped) { 'loop-fallback' } else { 'continuous' }
    Write-Host ("Asset {0}: {1:F3}s / requested {2:F3}s / {3}" -f $Name, $outputDurationSeconds, $DurationSeconds, $mode)
    return [pscustomobject]@{
        name = $Name
        source = $InputPath
        sourceDurationSeconds = [Math]::Round($sourceDurationSeconds, 3)
        startSeconds = $StartSeconds
        requestedDurationSeconds = [Math]::Round($DurationSeconds, 3)
        outputDurationSeconds = [Math]::Round($outputDurationSeconds, 3)
        mode = $mode
    }
}

$comparison = $sourceSettings.comparisonVideo
$treeSource = 'D:\HomeBrew\MonoSH\png\Tree0'

if (-not $comparison) {
    throw 'The comparison movie was not found.'
}

0..15 | ForEach-Object {
    $name = 'Tree0_{0:D2}.png' -f $_
    Copy-Item -LiteralPath (Join-Path $treeSource $name) -Destination $treeDir -Force
}

$currentDemoDuration = Get-NarrationCutDuration -CutId 'C01' -FallbackSeconds 8
$previousVideoDuration = Get-NarrationCutDuration -CutId 'C02' -FallbackSeconds 7
$developmentDayOneDuration = Get-NarrationCutDuration -CutId 'C04' -FallbackSeconds 15 -Manifest $developmentManifest
$developmentDayTwoDuration = Get-NarrationCutDuration -CutId 'C05' -FallbackSeconds 15 -Manifest $developmentManifest
$developmentDayThreeDuration = Get-NarrationCutDuration -CutId 'C06' -FallbackSeconds 13 -Manifest $developmentManifest
$reports = @()
$reports += Export-VideoClip -Name 'current_demo' -InputPath $comparison -OutputPath (Join-Path $publicDir 'current_demo.mp4') -StartSeconds 45 -DurationSeconds $currentDemoDuration -VideoFilter 'crop=320:240:0:0' -Crf 18
$reports += Export-VideoClip -Name 'previous_video' -InputPath $PreviousVideo -OutputPath (Join-Path $publicDir 'previous_video.mp4') -StartSeconds 0 -DurationSeconds $previousVideoDuration -VideoFilter '' -Crf 20
$reports += Export-VideoClip -Name 'day1' -InputPath $DayOneVideo -OutputPath (Join-Path $publicDir 'day1.mp4') -StartSeconds 0.8 -DurationSeconds 6 -VideoFilter '' -Crf 18
$reports += Export-VideoClip -Name 'current_tree' -InputPath $comparison -OutputPath (Join-Path $publicDir 'current_tree.mp4') -StartSeconds 35 -DurationSeconds 6 -VideoFilter 'crop=320:240:0:0' -Crf 18
$reports += Export-VideoClip -Name 'development_day1' -InputPath $DayOneVideo -OutputPath (Join-Path $publicDir 'dev_day1.mp4') -StartSeconds 0 -DurationSeconds $developmentDayOneDuration -VideoFilter '' -Crf 18
$reports += Export-VideoClip -Name 'development_day2' -InputPath $DayTwoVideo -OutputPath (Join-Path $publicDir 'dev_day2.mp4') -StartSeconds 0 -DurationSeconds $developmentDayTwoDuration -VideoFilter '' -Crf 18
$reports += Export-VideoClip -Name 'development_day3' -InputPath $DayThreeVideo -OutputPath (Join-Path $publicDir 'dev_day3.mp4') -StartSeconds 0 -DurationSeconds $developmentDayThreeDuration -VideoFilter '' -Crf 18

if (-not (Test-Path $sourceSettings.developmentTableImage)) {
    throw "Development table image was not found: $($sourceSettings.developmentTableImage)"
}
Copy-Item -LiteralPath $sourceSettings.developmentTableImage -Destination (Join-Path $publicDir 'development_z_table.png') -Force

$reports | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 $assetReportPath

Write-Host "Assets generated: $publicDir"
Write-Host "Asset report: $assetReportPath"

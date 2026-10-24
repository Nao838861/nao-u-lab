param(
    [switch]$Force,
    [int]$Rate = 2
)
# APIキーが無い時の仮ナレーション。Windows標準の Microsoft Haruka Desktop で public/narration/raw/ にWAVを作る。
# その後 `node tools/generate-narration.mjs --manifest=cuts.json --compact-only` で無音詰めとカット尺の同期を行う。

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $projectRoot "narration\cuts.json"
$rawDir = Join-Path $projectRoot "public\narration\raw"
$manifest = Get-Content -Raw -Encoding UTF8 $manifestPath | ConvertFrom-Json

Add-Type -AssemblyName System.Speech
New-Item -ItemType Directory -Force -Path $rawDir | Out-Null

$readings = [ordered]@{
    "×" = "かける"; "60fps" = "60エフピーエス"; "MMC5" = "エムエムシーファイブ"; "ROM" = "ロム"; "RAM" = "ラム";
    "AI" = "エーアイ"; "CPU" = "シーピーユー"; "GRIP" = "グリップ"; "DRIFT" = "ドリフト"
}

foreach ($cut in $manifest.cuts) {
    if ($cut.silent) { continue }
    $outputPath = Join-Path $rawDir ($cut.id + ".wav")
    if ((Test-Path $outputPath) -and -not $Force) { continue }
    $text = [string]$cut.text
    foreach ($k in $readings.Keys) { $text = $text.Replace($k, $readings[$k]) }
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    try {
        $synth.SelectVoice("Microsoft Haruka Desktop")
        $synth.Rate = $Rate
        $synth.Volume = 100
        $synth.SetOutputToWaveFile($outputPath)
        $synth.Speak($text)
        Write-Output ($cut.id + ": generated")
    }
    finally {
        $synth.Dispose()
    }
}

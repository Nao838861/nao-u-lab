param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $projectRoot "narration\prototype-cuts.json"
$outputDir = Join-Path $projectRoot "public\narration"
$manifest = Get-Content -Raw -Encoding UTF8 $manifestPath | ConvertFrom-Json

Add-Type -AssemblyName System.Speech
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

foreach ($cut in $manifest.cuts) {
    $outputPath = Join-Path $outputDir ($cut.id + ".wav")
    if ((Test-Path $outputPath) -and -not $Force) {
        Write-Output ($cut.id + ": existing")
        continue
    }

    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    try {
        $synth.SelectVoice("Microsoft Haruka Desktop")
        $synth.Rate = [int]$cut.localRate
        $synth.Volume = 95
        $synth.SetOutputToWaveFile($outputPath)
        $synth.Speak([string]$cut.text)
        Write-Output ($cut.id + ": generated with Microsoft Haruka Desktop")
    }
    finally {
        $synth.Dispose()
    }
}

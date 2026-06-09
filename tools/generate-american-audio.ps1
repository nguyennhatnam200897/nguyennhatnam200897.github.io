$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent $PSScriptRoot
$audioDirectory = Join-Path $workspace "assets\audio"
$voiceName = "Microsoft Zira Desktop"
$taskExporter = Join-Path $PSScriptRoot "export-audio-tasks.mjs"

Push-Location $workspace

try {
  $taskJson = & node $taskExporter

  if ($LASTEXITCODE -ne 0) {
    throw "Could not load lesson tasks with Node."
  }

  $tasks = $taskJson | ConvertFrom-Json
  Add-Type -AssemblyName System.Speech

  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

  try {
    $synth.SelectVoice($voiceName)

    if ($synth.Voice.Culture.Name -ne "en-US") {
      throw "Voice $voiceName is not en-US."
    }

    $synth.Rate = -2
    $synth.Volume = 100

    New-Item -ItemType Directory -Path $audioDirectory -Force | Out-Null

    foreach ($task in $tasks) {
      $output = Join-Path $audioDirectory "$($task.id).wav"
      $synth.SetOutputToWaveFile($output)
      $synth.Speak([string]$task.answer)
      $synth.SetOutputToNull()
    }

    Write-Output "$voiceName ($($synth.Voice.Culture.Name)): $($tasks.Count) files"
  }
  finally {
    $synth.Dispose()
  }
}
finally {
  Pop-Location
}

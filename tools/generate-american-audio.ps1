param(
  [string]$CourseDataPath = "data/courses/small-public-garden.json",
  [string]$OutputDirectory = "assets/audio",
  [switch]$PedagogicalOnly
)

$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent $PSScriptRoot
$voiceName = "Microsoft Zira Desktop"
$taskExporter = Join-Path $PSScriptRoot "export-audio-tasks.mjs"
$resolvedCoursePath = Join-Path $workspace $CourseDataPath
$resolvedOutputDirectory = Join-Path $workspace $OutputDirectory

Push-Location $workspace

try {
  $payloadJson = & node $taskExporter $resolvedCoursePath

  if ($LASTEXITCODE -ne 0) {
    throw "Could not load lesson tasks with Node."
  }

  $payload = $payloadJson | ConvertFrom-Json
  $tasks = @($payload.tasks)

  if ($PedagogicalOnly) {
    $tasks = @(
      $tasks | Where-Object {
        $_.stage -ne "sentence" -and $_.stage -ne "paragraph"
      }
    )
  }

  Add-Type -AssemblyName System.Speech
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

  try {
    $synth.SelectVoice($voiceName)

    if ($synth.Voice.Culture.Name -ne "en-US") {
      throw "Voice $voiceName is not en-US."
    }

    $synth.Rate = -2
    $synth.Volume = 100

    New-Item -ItemType Directory -Path $resolvedOutputDirectory -Force | Out-Null

    foreach ($task in $tasks) {
      $output = Join-Path $resolvedOutputDirectory "$($task.audioId).wav"
      $synth.SetOutputToWaveFile($output)
      $synth.Speak([string]$task.answer)
      $synth.SetOutputToNull()
    }

    Write-Output (
      "$voiceName ($($synth.Voice.Culture.Name)): " +
      "$($tasks.Count) files for $($payload.courseId)"
    )
  }
  finally {
    $synth.Dispose()
  }
}
finally {
  Pop-Location
}

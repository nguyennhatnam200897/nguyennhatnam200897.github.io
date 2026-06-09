import argparse
import json
import subprocess
from pathlib import Path

import imageio_ffmpeg
from faster_whisper import WhisperModel


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Luyen-nghe-Tieng-Anh-Thu-dong-Song-ngu.mp3"
TMP_DIR = ROOT / "tmp"
DEFAULT_CLIP = TMP_DIR / "listening-sample-first-180.mp3"
DEFAULT_OUTPUT = TMP_DIR / "listening-sample-transcript.json"


def cut_sample(source: Path, output: Path, seconds: int) -> None:
  output.parent.mkdir(parents=True, exist_ok=True)
  ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
  subprocess.run(
    [
      ffmpeg,
      "-y",
      "-i",
      str(source),
      "-t",
      str(seconds),
      "-vn",
      "-acodec",
      "libmp3lame",
      "-b:a",
      "96k",
      str(output),
    ],
    check=True,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
  )


def transcribe(clip: Path, output: Path, model_size: str) -> None:
  model = WhisperModel(model_size, device="cpu", compute_type="int8")
  segments, info = model.transcribe(
    str(clip),
    beam_size=5,
    vad_filter=True,
    word_timestamps=False,
  )

  payload = {
    "source": str(SOURCE.name),
    "clip": str(clip.relative_to(ROOT)),
    "durationSeconds": info.duration,
    "detectedLanguage": info.language,
    "languageProbability": info.language_probability,
    "modelSize": model_size,
    "segments": [
      {
        "start": round(segment.start, 2),
        "end": round(segment.end, 2),
        "text": segment.text.strip(),
      }
      for segment in segments
    ],
  }

  output.parent.mkdir(parents=True, exist_ok=True)
  output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf8")


def main() -> None:
  parser = argparse.ArgumentParser()
  parser.add_argument("--seconds", type=int, default=180)
  parser.add_argument("--model-size", default="base")
  parser.add_argument("--clip", type=Path, default=DEFAULT_CLIP)
  parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
  args = parser.parse_args()

  cut_sample(SOURCE, args.clip, args.seconds)
  transcribe(args.clip, args.output, args.model_size)
  print(args.output)


if __name__ == "__main__":
  main()

import argparse
import json
import subprocess
from pathlib import Path

import imageio_ffmpeg


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Luyen-nghe-Tieng-Anh-Thu-dong-Song-ngu.mp3"
OUTPUT_DIR = ROOT / "assets" / "audio" / "listening-song-ngu-sample"


def cut_clip(start: float, end: float, output: Path) -> None:
  output.parent.mkdir(parents=True, exist_ok=True)
  ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
  subprocess.run(
    [
      ffmpeg,
      "-y",
      "-ss",
      str(start),
      "-to",
      str(end),
      "-i",
      str(SOURCE),
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


def main() -> None:
  parser = argparse.ArgumentParser()
  parser.add_argument("manifest", type=Path)
  args = parser.parse_args()

  manifest = json.loads(args.manifest.read_text(encoding="utf8"))

  for clip in manifest["clips"]:
    output = OUTPUT_DIR / f"{clip['id']}.mp3"
    cut_clip(float(clip["start"]), float(clip["end"]), output)
    print(output.relative_to(ROOT))


if __name__ == "__main__":
  main()

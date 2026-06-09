import argparse
import json
import subprocess
from pathlib import Path

import imageio_ffmpeg


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "Luyen-nghe-Tieng-Anh-Thu-dong-Song-ngu.mp3"
DEFAULT_COURSE = ROOT / "data" / "courses" / "listening-song-ngu-sample.json"
DEFAULT_CLIPS = ROOT / "tools" / "listening-sample-clips.json"
DEFAULT_OUTPUT = ROOT / "assets" / "audio" / "listening-song-ngu-sample"
DEFAULT_MANIFEST = (
  ROOT / "data" / "audio" / "listening-song-ngu-sample.json"
)


def run_ffmpeg(arguments: list[str]) -> None:
  subprocess.run(
    [imageio_ffmpeg.get_ffmpeg_exe(), "-y", *arguments],
    check=True,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
  )


def cut_original(source: Path, start: float, end: float, output: Path) -> None:
  output.parent.mkdir(parents=True, exist_ok=True)
  run_ffmpeg(
    [
      "-ss",
      str(start),
      "-to",
      str(end),
      "-i",
      str(source),
      "-vn",
      "-ac",
      "1",
      "-ar",
      "22050",
      "-c:a",
      "pcm_s16le",
      str(output),
    ]
  )


def concatenate(inputs: list[Path], output: Path) -> None:
  arguments: list[str] = []

  for input_path in inputs:
    arguments.extend(["-i", str(input_path)])

  streams = "".join(f"[{index}:a]" for index in range(len(inputs)))
  arguments.extend(
    [
      "-filter_complex",
      f"{streams}concat=n={len(inputs)}:v=0:a=1[out]",
      "-map",
      "[out]",
      "-ac",
      "1",
      "-ar",
      "22050",
      "-c:a",
      "pcm_s16le",
      str(output),
    ]
  )
  run_ffmpeg(arguments)


def read_json(path: Path) -> dict:
  return json.loads(path.read_text(encoding="utf8"))


def build_manifest(
  course: dict,
  clip_config: dict,
  source: Path,
  output_dir: Path,
) -> dict:
  sentences = course["sentences"]
  sentence_by_id = {sentence["id"]: sentence for sentence in sentences}
  clip_by_sentence = {
    clip["sentenceId"]: clip for clip in clip_config["clips"]
  }
  assets: list[dict] = []
  answers_by_audio_id: dict[str, str] = {}

  for group in course["taskGroups"]:
    for task in group:
      audio_id = task.get("audioId", task["id"])
      answer = task["answer"]
      existing = answers_by_audio_id.get(audio_id)

      if existing is not None and existing != answer:
        raise ValueError(f"{audio_id} is shared by different answers")

      answers_by_audio_id[audio_id] = answer

      if task["stage"] == "sentence":
        clip = clip_by_sentence[task["sentenceId"]]
        sentence = sentence_by_id[task["sentenceId"]]

        if sentence["english"] != answer:
          raise ValueError(f"{task['id']} does not end with its source sentence")
        if clip["verifiedText"] != answer:
          raise ValueError(f"{task['id']} does not match verified clip text")
        if clip["audioId"] != audio_id:
          raise ValueError(f"{task['id']} does not use its original audio id")

        cut_original(
          source,
          float(clip["start"]),
          float(clip["end"]),
          output_dir / f"{audio_id}.wav",
        )
        assets.append(
          {
            "audioId": audio_id,
            "answer": answer,
            "sourceType": "original",
            "source": source.name,
            "sentenceId": task["sentenceId"],
            "start": float(clip["start"]),
            "end": float(clip["end"]),
          }
        )
      else:
        assets.append(
          {
            "audioId": audio_id,
            "answer": answer,
            "sourceType": "pedagogical",
            "voice": "Microsoft Zira Desktop",
            "locale": "en-US",
          }
        )

  for sentence_count in range(2, len(sentences) + 1):
    selected = sentences[:sentence_count]
    audio_id = f"G{sentence_count}"
    answer = " ".join(sentence["english"] for sentence in selected)
    clip_ids = [
      clip_by_sentence[sentence["id"]]["audioId"] for sentence in selected
    ]
    concatenate(
      [output_dir / f"{clip_id}.wav" for clip_id in clip_ids],
      output_dir / f"{audio_id}.wav",
    )
    assets.append(
      {
        "audioId": audio_id,
        "answer": answer,
        "sourceType": "cumulative",
        "clips": clip_ids,
      }
    )

  if len({asset["audioId"] for asset in assets}) != len(assets):
    raise ValueError("Manifest contains duplicate audioId values")

  return {
    "courseId": course["id"],
    "source": source.name,
    "format": "wav",
    "sampleRate": 22050,
    "channels": 1,
    "assets": assets,
  }


def main() -> None:
  parser = argparse.ArgumentParser()
  parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
  parser.add_argument("--course", type=Path, default=DEFAULT_COURSE)
  parser.add_argument("--clips", type=Path, default=DEFAULT_CLIPS)
  parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
  parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
  args = parser.parse_args()

  course = read_json(args.course)
  clip_config = read_json(args.clips)
  args.output_dir.mkdir(parents=True, exist_ok=True)
  manifest = build_manifest(
    course,
    clip_config,
    args.source,
    args.output_dir,
  )
  args.manifest.parent.mkdir(parents=True, exist_ok=True)
  args.manifest.write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
    encoding="utf8",
  )
  print(
    f"{len(manifest['assets'])} manifest entries; "
    f"{len(clip_config['clips'])} originals; "
    f"{len(course['sentences']) - 1} cumulative files"
  )


if __name__ == "__main__":
  main()

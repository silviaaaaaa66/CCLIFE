import argparse
import json
import os
from datetime import datetime, timezone

from email_sender import send_email
from processor import (
    FAMILY_BGM_PATH,
    classify_audio_task,
    process_audio_normal,
    process_audio_with_bgm,
    process_devotional_audio,
    transcribe_full_audio,
    validate_recommendation,
)


DOWNLOAD_DIR = "downloads"
BATCH_DIR = "batch_jobs"
MANIFEST_PATH = os.path.join(BATCH_DIR, "pending.json")
AUDIO_EXTENSIONS = {".mp3", ".m4a", ".wav", ".wma", ".aac", ".flac", ".ogg"}


def save_manifest(manifest):
    os.makedirs(BATCH_DIR, exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)


def load_manifest():
    if not os.path.exists(MANIFEST_PATH):
        raise RuntimeError("No pending batch. Run: python3 batch_audio.py prepare")

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def audio_files():
    files = []
    for filename in sorted(os.listdir(DOWNLOAD_DIR)):
        path = os.path.join(DOWNLOAD_DIR, filename)
        stem, ext = os.path.splitext(filename)
        if stem.lower().endswith(("-processed", "_processed")):
            continue
        if os.path.isfile(path) and ext.lower() in AUDIO_EXTENSIONS:
            files.append(path)
    return files


def prepare_batch():
    if os.path.exists(MANIFEST_PATH):
        existing = load_manifest()
        unfinished = [
            entry for entry in existing.get("entries", [])
            if entry.get("status") not in {"sent", "excluded"}
        ]
        if unfinished:
            raise RuntimeError(
                "An unfinished batch already exists. Complete it before preparing "
                f"another batch: {MANIFEST_PATH}"
            )

    files = audio_files()
    if not files:
        print("No audio files found.")
        return

    entries = []
    for path in files:
        print(f"Classifying: {path}", flush=True)
        task_type = classify_audio_task(file_path=path)
        entry = {
            "source": path,
            "task_type": task_type,
            "status": "awaiting_selection" if task_type == "devotional" else "ready",
            "transcript_path": None,
            "recommendation": None,
            "error": None,
        }

        if task_type == "devotional":
            transcript_path, _ = transcribe_full_audio(path)
            entry["transcript_path"] = transcript_path
            print(f"Transcribed: {transcript_path}", flush=True)

        entries.append(entry)

    manifest = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "selection_instructions": {
            "prompt": "add_bgm_files/music_profiles/配乐分析提示词.md",
            "catalog": "add_bgm_files/music_profiles/圣乐曲库画像_初版.csv",
            "method": "Codex reads the full prompt, catalog, and every transcript, then fills recommendation.",
        },
        "entries": entries,
    }
    save_manifest(manifest)
    print(f"Prepared {len(entries)} audio file(s): {MANIFEST_PATH}")
    print_status(manifest)


def print_status(manifest=None):
    manifest = manifest or load_manifest()
    for entry in manifest["entries"]:
        selection = entry.get("recommendation") or {}
        track = selection.get("track_id", "-")
        print(
            f"{entry['status']:20} {entry['task_type']:10} "
            f"{track:8} {entry['source']}"
        )


def apply_selections(path):
    manifest = load_manifest()
    with open(path, "r", encoding="utf-8") as f:
        selections = json.load(f)

    if not isinstance(selections, dict):
        raise RuntimeError("Selections must be a JSON object keyed by source path.")

    found = set()
    for entry in manifest["entries"]:
        source = entry["source"]
        if source not in selections:
            continue
        if entry["task_type"] != "devotional":
            raise RuntimeError(f"Selection supplied for non-devotional audio: {source}")
        validate_recommendation(selections[source])
        entry["recommendation"] = selections[source]
        entry["status"] = "ready"
        found.add(source)

    unknown = set(selections) - found
    if unknown:
        raise RuntimeError(f"Selections do not match this batch: {sorted(unknown)}")

    save_manifest(manifest)
    print(f"Applied {len(found)} selection(s).")
    print_status(manifest)


def validate_batch_ready(manifest):
    missing = []
    for entry in manifest["entries"]:
        if entry["status"] in {"sent", "failed", "excluded"}:
            continue
        if entry["task_type"] == "devotional":
            if not entry.get("recommendation"):
                missing.append(entry["source"])
            else:
                validate_recommendation(entry["recommendation"])

    if missing:
        joined = "\n- ".join(missing)
        raise RuntimeError(f"Codex selections are still missing:\n- {joined}")


def run_batch():
    manifest = load_manifest()
    validate_batch_ready(manifest)

    for entry in manifest["entries"]:
        if entry["status"] in {"sent", "excluded"}:
            continue

        source = entry["source"]
        output = None
        try:
            print(f"Processing: {source}", flush=True)
            if entry["task_type"] == "devotional":
                output = process_devotional_audio(source, entry["recommendation"])
            elif entry["task_type"] == "family":
                output = process_audio_with_bgm(
                    source,
                    FAMILY_BGM_PATH,
                    bgm_chinese_title="奇异恩典",
                )
            else:
                output = process_audio_normal(source)

            send_email(output)
            if os.path.exists(source):
                os.remove(source)
            if os.path.exists(output):
                os.remove(output)
            entry["status"] = "sent"
            entry["error"] = None
            print(f"Sent and cleaned: {source}", flush=True)
        except Exception as exc:
            entry["status"] = "failed"
            entry["error"] = str(exc)
            print(f"Failed (files preserved): {source}: {exc}", flush=True)
        finally:
            save_manifest(manifest)

    print_status(manifest)


def main():
    parser = argparse.ArgumentParser(description="Two-stage Codex audio batch workflow")
    parser.add_argument("command", choices=["prepare", "status", "apply", "run"])
    parser.add_argument("path", nargs="?", help="Selections JSON path for the apply command")
    args = parser.parse_args()

    if args.command == "prepare":
        prepare_batch()
    elif args.command == "status":
        print_status()
    elif args.command == "apply":
        if not args.path:
            parser.error("apply requires a selections JSON path")
        apply_selections(args.path)
    else:
        run_batch()


if __name__ == "__main__":
    main()

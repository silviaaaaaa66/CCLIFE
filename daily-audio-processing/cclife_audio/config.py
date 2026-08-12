from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent
RESOURCES_DIR = PROJECT_ROOT / "resources"
RUNTIME_DIR = PROJECT_ROOT / "runtime"

DOWNLOAD_DIR = str(RUNTIME_DIR / "downloads")
PROCESSED_DIR = str(RUNTIME_DIR / "processed")
BATCH_DIR = str(RUNTIME_DIR / "batch_jobs")
TEMP_DIR = str(RUNTIME_DIR / "temp")
TRANSCRIPTS_DIR = str(RUNTIME_DIR / "transcripts")
BGM_DIR = str(RUNTIME_DIR / "bgm")
MODELS_DIR = str(RUNTIME_DIR / "models")

BGM_MAP_PATH = str(RESOURCES_DIR / "bgm_map.json")
MUSIC_ZIP_PATH = str(RUNTIME_DIR / "季刊配乐.zip")
MUSIC_PROFILE_DIR = str(RESOURCES_DIR / "music_profiles")
MUSIC_PROMPT_PATH = str(Path(MUSIC_PROFILE_DIR) / "配乐分析提示词.md")
MUSIC_PROFILE_CSV_PATH = str(Path(MUSIC_PROFILE_DIR) / "圣乐曲库画像_初版.csv")
WHISPER_MODEL_PATH = str(Path(MODELS_DIR) / "ggml-small.bin")

DEVOTIONAL_BGM_PATH = str(Path(BGM_DIR) / "Breathe_on_Me_Breath_of_God.mp3")
FAMILY_BGM_PATH = str(Path(BGM_DIR) / "Amazing_Grace.wma")

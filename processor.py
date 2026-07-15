import subprocess
import os
import re
import json
import zipfile
import urllib.error
import urllib.request
from env_loader import load_dotenv


load_dotenv()


# ============================
# BGM配置
# ============================

DEVOTIONAL_BGM_PATH = "add_bgm_files/bgm/Breathe_on_Me_Breath_of_God.mp3"
FAMILY_BGM_PATH = "add_bgm_files/bgm/Amazing_Grace.wma"
TEMP_DIR = "add_bgm_files/temp"
PROCESSED_DIR = "processed"
WHISPER_MODEL_PATH = "add_bgm_files/models/ggml-small.bin"
INTRO_DETECT_SECONDS = 5
BGM_DIR = "add_bgm_files/bgm"
BGM_MAP_PATH = "add_bgm_files/bgm_map.json"
MUSIC_ZIP_PATH = "add_bgm_files/季刊配乐.zip"
TRANSCRIPTS_DIR = "add_bgm_files/transcripts"
MUSIC_PROFILE_DIR = "add_bgm_files/music_profiles"
MUSIC_PROMPT_PATH = os.path.join(MUSIC_PROFILE_DIR, "配乐分析提示词.md")
MUSIC_PROFILE_CSV_PATH = os.path.join(MUSIC_PROFILE_DIR, "圣乐曲库画像_初版.csv")
OPENAI_RECOMMENDATION_MODEL = os.getenv(
    "OPENAI_RECOMMENDATION_MODEL",
    "gpt-4.1-mini"
)
OPENAI_TIMEOUT_SECONDS = int(os.getenv("OPENAI_TIMEOUT_SECONDS", "120"))


# ============================
# 文件名清理
# ============================

def clean_filename(filename):
    name, ext = os.path.splitext(filename)

    name = name.replace(":", "").replace("?", "")
    name = re.sub(r"\s+", "+", name)
    name = re.sub(r"\++", "+", name)
    name = name.strip("+")

    return name + ext


def safe_stem(filename):
    return clean_filename(os.path.basename(filename)).rsplit(".", 1)[0]


# ============================
# 判断音频类型
# ============================

def require_file(path, label):
    if not os.path.exists(path):
        raise FileNotFoundError(f"{label} not found: {path}")


def read_text_file(path, label):
    require_file(path, label)

    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()


def require_openai_api_key():
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is required for devotional BGM recommendation"
        )

    return api_key


def load_bgm_map():
    if not os.path.exists(BGM_MAP_PATH):
        return {}

    with open(BGM_MAP_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_bgm_map(bgm_map):
    os.makedirs(os.path.dirname(BGM_MAP_PATH), exist_ok=True)

    with open(BGM_MAP_PATH, "w", encoding="utf-8") as f:
        json.dump(bgm_map, f, ensure_ascii=False, indent=2, sort_keys=True)


def make_bgm_filename(source_name):
    filename = os.path.basename(source_name)
    stem, ext = os.path.splitext(filename)
    stem = re.sub(r"^\d+[-\s_]*", "", stem)
    stem = re.sub(r"[^A-Za-z0-9]+", "_", stem).strip("_")

    return f"{stem or 'bgm'}{ext.lower()}"


def find_bgm_in_zip(english_title):
    require_file(MUSIC_ZIP_PATH, "Music zip")
    normalized_title = english_title.lower()

    with zipfile.ZipFile(MUSIC_ZIP_PATH) as z:
        matches = [
            name for name in z.namelist()
            if normalized_title in os.path.basename(name).lower()
        ]

        if not matches:
            raise FileNotFoundError(
                f"BGM not found in zip for title: {english_title}"
            )

        return matches[0]


def resolve_bgm_path(track_id=None, english_title=None):
    bgm_map = load_bgm_map()

    for key in [track_id, english_title]:
        if key and key in bgm_map:
            path = bgm_map[key]
            if os.path.exists(path):
                return path

    if not english_title:
        raise ValueError("english_title is required when BGM is not in bgm_map")

    zip_member = find_bgm_in_zip(english_title)
    output_path = os.path.join(BGM_DIR, make_bgm_filename(zip_member))
    os.makedirs(BGM_DIR, exist_ok=True)

    with zipfile.ZipFile(MUSIC_ZIP_PATH) as z:
        with open(output_path, "wb") as f:
            f.write(z.read(zip_member))

    if track_id:
        bgm_map[track_id] = output_path
    bgm_map[english_title] = output_path
    save_bgm_map(bgm_map)

    return output_path


def transcribe_audio_intro(file_path, seconds=INTRO_DETECT_SECONDS):
    require_file(WHISPER_MODEL_PATH, "Whisper model")

    cmd = [
        "whisper-cli",
        "--no-gpu",
        "-m", WHISPER_MODEL_PATH,
        "-f", file_path,
        "-l", "zh",
        "-d", str(seconds * 1000),
        "-nt",
        "-np",
    ]

    result = subprocess.run(
        cmd,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
    )

    return result.stdout.strip()


def transcribe_full_audio(file_path, output_dir=TRANSCRIPTS_DIR):
    require_file(WHISPER_MODEL_PATH, "Whisper model")
    os.makedirs(output_dir, exist_ok=True)

    output_base = os.path.join(output_dir, f"{safe_stem(file_path)}_raw")
    output_txt = output_base + ".txt"

    cmd = [
        "whisper-cli",
        "--no-gpu",
        "-m", WHISPER_MODEL_PATH,
        "-f", file_path,
        "-l", "zh",
        "-otxt",
        "-nt",
        "-of", output_base,
    ]

    subprocess.run(
        cmd,
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
    )

    with open(output_txt, "r", encoding="utf-8") as f:
        transcript = f.read().strip()

    return output_txt, transcript


def devotional_recommendation_schema():
    return {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "track_id": {
                "type": "string",
                "description": "曲库中的曲目编号，例如 A7-09 或 N-06。"
            },
            "chinese_title": {
                "type": "string",
                "description": "首选配乐中文名称。"
            },
            "english_title": {
                "type": "string",
                "description": "首选配乐英文名称，必须能对应曲库或 zip 文件名。"
            },
            "album_title": {
                "type": "string",
                "description": "专辑名称。"
            },
            "track_number": {
                "type": "string",
                "description": "专辑内曲目序号。"
            },
            "article_core": {
                "type": "string",
                "description": "文章核心，不超过120字。"
            },
            "theological_focus": {
                "type": "string",
                "description": "主要神学重心，不超过80字。"
            },
            "devotional_tone": {
                "type": "string",
                "description": "灵修气质，不超过80字。"
            },
            "reason": {
                "type": "string",
                "description": "选择这首曲目的最终理由，不超过180字。"
            },
            "not_recommended": {
                "type": "array",
                "maxItems": 2,
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "title": {"type": "string"},
                        "reason": {"type": "string"}
                    },
                    "required": ["title", "reason"]
                }
            }
        },
        "required": [
            "track_id",
            "chinese_title",
            "english_title",
            "album_title",
            "track_number",
            "article_core",
            "theological_focus",
            "devotional_tone",
            "reason",
            "not_recommended"
        ]
    }


def extract_openai_response_text(response_data):
    if response_data.get("output_text"):
        return response_data["output_text"]

    for output_item in response_data.get("output", []):
        for content_item in output_item.get("content", []):
            if content_item.get("type") in ["output_text", "text"]:
                text = content_item.get("text")
                if text:
                    return text

    raise RuntimeError("OpenAI response did not include output text")


def call_openai_for_recommendation(system_text, user_text):
    api_key = require_openai_api_key()

    payload = {
        "model": OPENAI_RECOMMENDATION_MODEL,
        "input": [
            {
                "role": "system",
                "content": [
                    {
                        "type": "input_text",
                        "text": system_text
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": user_text
                    }
                ]
            }
        ],
        "text": {
            "format": {
                "type": "json_schema",
                "name": "devotional_bgm_recommendation",
                "strict": True,
                "schema": devotional_recommendation_schema()
            }
        }
    }

    request = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(
            request,
            timeout=OPENAI_TIMEOUT_SECONDS
        ) as response:
            response_data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI recommendation failed: {error_body}") from e

    response_text = extract_openai_response_text(response_data)
    return json.loads(response_text)


def validate_recommendation(recommendation):
    required_fields = [
        "track_id",
        "chinese_title",
        "english_title",
        "album_title",
        "track_number",
        "reason",
    ]

    for field in required_fields:
        if not recommendation.get(field):
            raise RuntimeError(
                f"OpenAI recommendation missing required field: {field}"
            )


def format_recommendation_markdown(recommendation, bgm_path):
    not_recommended = recommendation.get("not_recommended", [])
    not_recommended_lines = "\n".join(
        f"- {item['title']}: {item['reason']}"
        for item in not_recommended
    ) or "- 无"

    return f"""# 今日灵修配乐推荐

## 文章核心
{recommendation["article_core"]}

## 神学重心
{recommendation["theological_focus"]}

## 灵修气质
{recommendation["devotional_tone"]}

## 首选配乐
🎹 {recommendation["chinese_title"]} / {recommendation["english_title"]}

📀 {recommendation["album_title"]} + {recommendation["track_number"]}

BGM 文件：{bgm_path}

## 推荐理由
{recommendation["reason"]}

## 不建议使用
{not_recommended_lines}

## 最终结论
一首即可，无需辅助配乐。
"""


def save_recommendation_files(source_audio_path, recommendation, bgm_path):
    os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)
    base_name = safe_stem(source_audio_path)
    json_path = os.path.join(TRANSCRIPTS_DIR, f"{base_name}_recommendation.json")
    md_path = os.path.join(TRANSCRIPTS_DIR, f"{base_name}_recommendation.md")

    data = {
        **recommendation,
        "bgm_path": bgm_path,
        "model": OPENAI_RECOMMENDATION_MODEL,
    }

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(format_recommendation_markdown(recommendation, bgm_path))

    return json_path, md_path


def recommend_bgm_for_devotional(transcript_text):
    prompt_text = read_text_file(MUSIC_PROMPT_PATH, "BGM prompt")
    profile_csv = read_text_file(MUSIC_PROFILE_CSV_PATH, "Music profile CSV")

    system_text = (
        "你是生命季刊灵修文章配乐分析助手。"
        "你必须只从提供的圣乐曲库画像中选择唯一一首最合适的背景圣乐。"
        "不要按关键词机械匹配；先理解文章核心、神学重心和灵修气质，"
        "再比较曲库。只输出符合 schema 的 JSON。"
    )

    user_text = f"""## 配乐分析提示词
{prompt_text}

## 圣乐曲库画像 CSV
{profile_csv}

## 今日灵修朗读转写文本
{transcript_text}
"""

    recommendation = call_openai_for_recommendation(system_text, user_text)
    validate_recommendation(recommendation)

    return recommendation


def process_devotional_audio(input_path):
    require_openai_api_key()

    transcript_path, transcript = transcribe_full_audio(input_path)
    print(f"Transcribed devotional audio: {transcript_path}")

    recommendation = recommend_bgm_for_devotional(transcript)
    bgm_path = resolve_bgm_path(
        track_id=recommendation["track_id"],
        english_title=recommendation["english_title"],
    )

    json_path, md_path = save_recommendation_files(
        input_path,
        recommendation,
        bgm_path,
    )

    print(f"Recommended BGM: {recommendation['english_title']}")
    print(f"Saved recommendation: {json_path}")
    print(f"Saved recommendation summary: {md_path}")

    return process_audio_with_bgm(input_path, bgm_path)


def classify_audio_task(subject="", file_path=""):
    filename = os.path.basename(file_path)
    text = f"{subject} {filename}"

    if "今日灵修" in text:
        return "devotional"

    if "致我的亲人" in text:
        return "family"

    intro_text = transcribe_audio_intro(file_path)

    if "今日灵修" in intro_text:
        return "devotional"

    if "致我的亲人" in intro_text:
        return "family"

    return "normal"


# ============================
# Peak Normalize
# (更接近Audacity Normalize)
# ============================

def get_peak_normalize_gain(input_path, target_db=-1.0):

    cmd = [
        "ffmpeg",
        "-i", input_path,
        "-af", "volumedetect",
        "-f", "null",
        "-"
    ]

    result = subprocess.run(
        cmd,
        stderr=subprocess.PIPE,
        stdout=subprocess.DEVNULL,
        text=True
    )

    match = re.search(
        r"max_volume:\s*(-?\d+\.?\d*) dB",
        result.stderr
    )

    if not match:
        return 0

    max_volume = float(match.group(1))

    return target_db - max_volume


# ============================
# 普通处理
# ============================

def process_audio_normal(input_path):

    filename = os.path.basename(input_path)
    clean_name = clean_filename(filename)

    os.makedirs("processed", exist_ok=True)

    output_path = os.path.join(
        "processed",
        clean_name.rsplit(".", 1)[0] + "_processed.mp3"
    )

    gain = get_peak_normalize_gain(input_path)

    cmd = [
        "ffmpeg",
        "-y",
        "-i", input_path,
        "-af", f"volume={gain}dB",
        "-ac", "1",
        "-ar", "24000",
        "-b:a", "32k",
        output_path
    ]

    subprocess.run(
        cmd,
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE
    )

    return output_path


# ============================
# BGM版本
# ============================

def process_audio_with_bgm(
    input_path,
    bgm_path=DEVOTIONAL_BGM_PATH,
    temp_dir=TEMP_DIR,
    processed_dir=PROCESSED_DIR,
):

    filename = os.path.basename(input_path)
    clean_name = clean_filename(filename)

    os.makedirs(processed_dir, exist_ok=True)
    os.makedirs(temp_dir, exist_ok=True)

    base_name = clean_name.rsplit(".", 1)[0]

    intro_wav = os.path.join(temp_dir, f"{base_name}_intro.wav")
    middle_wav = os.path.join(temp_dir, f"{base_name}_middle.wav")
    outro_wav = os.path.join(temp_dir, f"{base_name}_outro.wav")
    concat_txt = os.path.join(temp_dir, f"{base_name}_concat.txt")
    temp_files = [intro_wav, middle_wav, outro_wav, concat_txt]

    output_path = os.path.join(
        processed_dir,
        base_name + "_processed.mp3"
    )

    try:
        # ============================
        # Intro
        # ============================

        intro_cmd = [
            "ffmpeg", "-y",
            "-i", bgm_path,
            "-filter_complex",
            "[0:a]atrim=0:10,asetpts=PTS-STARTPTS,volume=-10dB,afade=t=out:st=7:d=3,aformat=sample_rates=44100:channel_layouts=mono[out]",
            "-map", "[out]",
            "-ac", "1",
            "-ar", "44100",
            intro_wav
        ]

        subprocess.run(intro_cmd, check=True)

        # ============================
        # Middle
        # ============================

        gain = get_peak_normalize_gain(input_path)

        middle_cmd = [
            "ffmpeg", "-y",
            "-i", bgm_path,
            "-i", input_path,
            "-filter_complex",
            f"""
[1:a]aresample=44100,asetpts=PTS-STARTPTS,volume={gain}dB,aformat=sample_rates=44100:channel_layouts=mono[voice];
[0:a]atrim=start=10,asetpts=PTS-STARTPTS,volume=-25dB,aformat=sample_rates=44100:channel_layouts=mono[bgm];
[voice][bgm]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[out]
""",
            "-map", "[out]",
            "-ac", "1",
            "-ar", "44100",
            middle_wav
        ]

        subprocess.run(middle_cmd, check=True)

        # ============================
        # Outro
        # ============================

        outro_cmd = [
            "ffmpeg", "-y",
            "-i", bgm_path,
            "-filter_complex",
            "[0:a]asetpts=PTS-STARTPTS,afade=t=in:st=0:d=5,aformat=sample_rates=44100:channel_layouts=mono[out]",
            "-map", "[out]",
            "-ac", "1",
            "-ar", "44100",
            outro_wav
        ]

        subprocess.run(outro_cmd, check=True)

        # ============================
        # Concat
        # ============================

        with open(concat_txt, "w") as f:
            f.write(f"file '{os.path.abspath(intro_wav)}'\n")
            f.write(f"file '{os.path.abspath(middle_wav)}'\n")
            f.write(f"file '{os.path.abspath(outro_wav)}'\n")

        final_cmd = [
            "ffmpeg",
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_txt,
            "-ac", "1",
            "-ar", "24000",
            "-b:a", "32k",
            output_path
        ]

        subprocess.run(
            final_cmd,
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE
        )

        return output_path

    finally:
        # ============================
        # 清理本次生成的临时文件
        # ============================

        for file in temp_files:
            if os.path.exists(file):
                os.remove(file)

    return output_path


# ============================
# 总入口
# ============================

def process_audio(input_path, subject=""):
    task_type = classify_audio_task(subject, input_path)

    if task_type == "devotional":
        print("BGM needed: devotional")
        return process_devotional_audio(input_path)

    if task_type == "family":
        print("BGM needed: family")
        require_file(FAMILY_BGM_PATH, "Family BGM")
        return process_audio_with_bgm(input_path, FAMILY_BGM_PATH)

    print("No BGM needed")
    return process_audio_normal(input_path)


# ============================
# 批量处理
# ============================

def process_all(files):

    results = []

    for item in files:

        try:

            if len(item) == 3:
                file_path, msg_id, subject = item
            else:
                file_path, msg_id = item
                subject = ""

            out = process_audio(
                file_path,
                subject
            )

            results.append(
                (out, msg_id)
            )

            print(
                f"Processed: {file_path} -> {out}"
            )

        except Exception as e:

            print(
                f"Failed processing {item}: {e}"
            )

    return results


# ============================
# Test
# ============================

if __name__ == "__main__":

    test_files = [
        (
            "downloads/test.mp3",
            "test_msg_id",
            "今日灵修 测试"
        )
    ]

    results = process_all(test_files)

    for r in results:
        print(r)

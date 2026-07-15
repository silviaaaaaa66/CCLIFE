# 自动音频处理

这个项目用于处理生命季刊相关朗读音频，并在需要时自动添加背景圣乐。

目前支持三类流程：

- 普通朗读：只做音量规范化、转成单声道低码率 mp3，然后自动邮件发送。
- 今日灵修：识别朗读音频内容，用 OpenAI 自动推荐一首最合适的圣乐，再加 BGM 生成成品。
- 致我的亲人：固定使用 `Amazing Grace` 作为 BGM，按同一套 BGM 流程生成成品。

## 项目结构

```text
.
├── main.py                         # 读取邮箱附件、处理、发送、清理
├── use_when_already_downloaded.py  # 已手动下载到 downloads/ 时使用
├── processor.py                    # 核心音频分类、转写、推荐、混音逻辑
├── email_reader.py                 # Gmail 附件读取
├── email_sender.py                 # 邮件发送
├── downloads/                      # 手动下载或邮箱附件临时保存位置
├── processed/                      # 处理后音频临时输出位置
└── add_bgm_files/
    ├── bgm/                        # 已解压出来、可直接使用的 BGM
    ├── bgm_map.json                # 曲目编号/英文名到本地 BGM 文件的映射
    ├── 季刊配乐.zip                # 完整圣乐压缩包
    ├── models/ggml-small.bin       # whisper.cpp 转写模型
    ├── music_profiles/
    │   ├── 配乐分析提示词.md
    │   ├── 圣乐曲库画像_初版.csv
    │   └── 圣乐曲库画像_初版.md
    ├── temp/                       # BGM 混音临时文件，处理后自动清理
    └── transcripts/                # 转写和推荐记录
```

## 运行前准备

需要本机已安装：

- Python 3
- ffmpeg
- whisper.cpp 的 `whisper-cli`

今日灵修自动推荐还需要设置 OpenAI API key：

```bash
export OPENAI_API_KEY="你的 OpenAI API key"
```

可选：指定推荐模型。

```bash
export OPENAI_RECOMMENDATION_MODEL="gpt-4.1-mini"
```

邮件读取和发送也需要设置环境变量：

```bash
export CCLIFE_EMAIL="你的 Gmail 地址"
export CCLIFE_EMAIL_PASSWORD="你的 Gmail app password"
export CCLIFE_DEFAULT_TO="收件人邮箱"
export CCLIFE_DEFAULT_CC="抄送邮箱，可留空"
```

也可以复制 `.env.example` 成 `.env` 后填写真实值；`.env` 已被 `.gitignore` 忽略。脚本启动时会自动读取项目根目录下的 `.env`。

## 使用方式

### 1. 邮箱附件自动处理

适用于邮件里直接带音频附件的情况。

```bash
python3 main.py
```

流程：

1. 从 Gmail inbox 读取最近 7 天未读邮件里的音频附件。
2. 根据邮件主题、文件名、音频开头 5 秒判断类型。
3. 自动处理音频。
4. 发送处理后的音频邮件。
5. 成功后删除原始音频和处理后音频，避免重复处理。

### 2. 已手动下载的音频

适用于别人发网盘链接，需要你先手动下载音频的情况。

把音频放进：

```text
downloads/
```

然后运行：

```bash
python3 use_when_already_downloaded.py
```

脚本会扫描 `downloads/` 里的文件，逐个处理并发送。

## 自动分类规则

`processor.py` 会先根据邮件主题和文件名判断：

- 包含 `今日灵修`：走今日灵修自动推荐 BGM 流程。
- 包含 `致我的亲人`：固定使用 Amazing Grace。
- 其他：按普通朗读处理。

如果主题和文件名无法判断，会转写音频前 5 秒，再检查开头是否包含 `今日灵修` 或 `致我的亲人`。

## 今日灵修 BGM 自动推荐流程

今日灵修会走完整自动流程：

1. 使用 whisper.cpp 转写整篇朗读音频。
2. 读取 `add_bgm_files/music_profiles/配乐分析提示词.md`。
3. 读取 `add_bgm_files/music_profiles/圣乐曲库画像_初版.csv`。
4. 调用 OpenAI Responses API，要求只推荐一首最合适的圣乐。
5. 根据推荐结果中的曲目编号和英文名查找本地 BGM。
6. 如果 BGM 还没有解压，会从 `add_bgm_files/季刊配乐.zip` 自动解压到 `add_bgm_files/bgm/`。
7. 生成带 BGM 的处理后音频。
8. 保存推荐记录到 `add_bgm_files/transcripts/`。

推荐记录会包含：

- 文章核心
- 神学重心
- 灵修气质
- 首选配乐
- 推荐理由
- 不建议使用的曲目

## 致我的亲人 BGM 流程

`致我的亲人` 不调用 OpenAI 推荐。

它固定使用：

```text
add_bgm_files/bgm/Amazing_Grace.wma
```

然后调用和今日灵修相同的 BGM 混音流程。

## BGM 混音方式

带 BGM 的音频会生成三段后拼接：

- Intro：BGM 前 10 秒，音量降低并淡出。
- Middle：朗读音频加低音量 BGM。
- Outro：完整 BGM 淡入作为结尾。

最终输出格式：

- mp3
- 单声道
- 24000 Hz
- 32k bitrate

处理过程中生成的临时 wav 和 concat 文件会自动删除。

## 输出与清理

处理后的文件会先输出到：

```text
processed/
```

发送邮件成功后，脚本会删除：

- 原始输入音频
- 处理后的输出音频

转写文本和推荐记录默认保留在：

```text
add_bgm_files/transcripts/
```

这些文件已被 `.gitignore` 忽略。

## Git 忽略规则

项目已忽略具体音频、模型和临时产物，包括：

- `downloads/`
- `processed/`
- `add_bgm_files/bgm/`
- `add_bgm_files/temp/`
- `add_bgm_files/transcripts/`
- `add_bgm_files/季刊配乐.zip`
- 常见音频格式文件

这样可以避免把朗读文件、BGM 原文件、转写结果或模型文件提交到 Git。

## 注意事项

- 邮箱、Gmail app password、收件人和 OpenAI API key 都应放在环境变量或本地 `.env` 中，不要写进代码。
- 今日灵修自动推荐必须设置 `OPENAI_API_KEY`。
- 如果 OpenAI key 没有设置，今日灵修流程会停止并提示缺少 `OPENAI_API_KEY`。
- 如果推荐的 BGM 不在 `bgm_map.json` 中，程序会尝试从 `季刊配乐.zip` 中按英文标题查找并解压。
- 如果 zip 文件名和圣诗英文标题差异太大，可能需要手动补充 `bgm_map.json`。

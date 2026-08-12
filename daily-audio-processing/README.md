# 自动音频处理

这个项目用于批量处理生命季刊朗读音频。没有“今日灵修”时会直接处理并发送；只有批次中存在“今日灵修”时才暂停，由 Codex 一次完成整个批次的选曲。项目不使用 OpenAI API，也不需要 `OPENAI_API_KEY`。

## 快速使用

先进入项目目录：

```bash
cd daily-audio-processing
```

从邮箱获取新音频并处理：

```bash
python3 main.py
```

处理本地音频时，先将文件放入 `runtime/downloads/`，然后运行：

```bash
python3 main.py --local
```

如果程序暂停等待“今日灵修”选曲，请在 Codex 中说：

```text
继续处理 pending 批次
```

没有“今日灵修”时，程序会自动处理、发送并清理成功文件。

## 处理流程

无论音频来自邮箱还是 `runtime/downloads/`，后续都会进入同一个批次流程：

1. 扫描所有音频，并根据文件名和开头转写识别类型。
2. 创建 `runtime/batch_jobs/pending.json`，记录整个批次的状态。
3. 按类型处理音频：
   - 普通朗读：规范化音量，转换为单声道低码率 MP3。
   - 致我的亲人：加入固定的 `Amazing Grace` 配乐。
   - 今日灵修：全文转写，然后暂停等待 Codex 选曲。
4. Codex 读取完整选曲提示词、曲库画像和转写文本，为每篇“今日灵修”选择一首 BGM。
5. 选曲完成后，程序统一混音并发送整个批次。
6. 每个文件发送成功后删除对应原文件和成品；处理或发送失败时保留文件并记录错误。

如果批次中没有“今日灵修”，程序会跳过选曲阶段并立即处理和发送。程序不会覆盖尚未完成的 pending 批次，也不会调用 OpenAI API。

## 项目结构

```text
daily-audio-processing/
├── main.py             # 两种日常入口
├── cclife_audio/       # Python 处理代码和集中路径配置
├── resources/          # Git 管理的曲库画像与 BGM 映射
├── runtime/            # 本地音频、模型、ZIP、缓存和批次状态
├── tools/              # 曲库资料维护脚本
└── tests/              # 自动化测试
```

`runtime/` 中的大文件和运行产物不会提交到 Git；具体目录说明见 `runtime/README.md`。

## 环境要求

本机需要：

- Python 3
- ffmpeg
- whisper.cpp 的 `whisper-cli`
- `runtime/models/ggml-small.bin`

邮件收发需要：

```bash
export CCLIFE_EMAIL="Gmail 地址"
export CCLIFE_EMAIL_PASSWORD="Gmail app password"
export CCLIFE_DEFAULT_TO="收件人"
export CCLIFE_DEFAULT_CC="抄送人，可留空"
```

## 输出规格

- MP3
- 单声道
- 24000 Hz
- 32 kbps

带配乐的成品会自动在原文件名后加上配乐中文名，例如：

```text
才艳-必得见神-暖暖-愿主向我吹气_processed.mp3
```

转写和选曲记录保留在 `runtime/transcripts/`，混音临时文件会自动清理。

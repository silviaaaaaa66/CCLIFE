# 自动音频处理

这个项目用于批量处理生命季刊朗读音频。没有“今日灵修”时会直接处理并发送；只有批次中存在“今日灵修”时才暂停，由 Codex 一次完成整个批次的选曲。项目不使用 OpenAI API，也不需要 `OPENAI_API_KEY`。

## 三类处理

- 普通朗读：音量规范化，转为单声道低码率 MP3。
- 今日灵修：先全文转写，再由 Codex 按完整提示词和全部曲库画像选择一首 BGM。
- 致我的亲人：固定使用 `Amazing Grace`。

## 有新邮件时怎么开始

收到新的音频邮件后，先运行：

```bash
python3 main.py
```

它会：

1. 下载新邮件中的音频附件到 `downloads/`。
2. 扫描并分类整个批次。
3. 生成 `batch_jobs/pending.json`。
4. 如果没有“今日灵修”，立即处理并发送整个批次。
5. 如果存在“今日灵修”，批量转写后暂停在选曲阶段，不混音、不发邮件、不删除原文件。

只有程序提示发现“今日灵修”时，才需要在 Codex 中说：

```text
请为 pending 批次的所有今日灵修选曲，然后继续处理并发送。
```

Codex 会为全部“今日灵修”选择配乐，然后统一完成混音、邮件发送和成功文件清理。普通朗读和“致我的亲人”也会留在同一个批次中一起处理。

> 如果 `batch_jobs/pending.json` 中还有未完成的文件，请先完成该批次；程序不会用新批次覆盖未完成的清单。

## 音频已经下载时怎么开始

如果音频文件已经放在 `downloads/` 中，不需要再次从邮箱下载，可运行：

```bash
python3 batch_audio.py process
```

也可以使用原有入口：

```bash
python3 use_when_already_downloaded.py
```

如果程序提示发现“今日灵修”，再在 Codex 中说：

```text
请为 pending 批次的所有今日灵修选曲，然后继续处理并发送。
```

## 完整批量工作流

### 1. 准备整个批次

有新邮件时运行：

```bash
python3 main.py
```

如果音频已经在 `downloads/` 中，则运行：

```bash
python3 batch_audio.py process
```

也可以使用原有入口：

```bash
python3 use_when_already_downloaded.py
```

这一阶段会：

1. 扫描所有音频并分类。
2. 批量转写所有“今日灵修”。
3. 生成 `batch_jobs/pending.json`。
4. 没有“今日灵修”时立即处理并发送；存在“今日灵修”时暂停选曲，不混音、不发邮件、不删除原文件。

### 2. 有“今日灵修”时，让 Codex 一次为全部灵修音频选曲

没有“今日灵修”时跳过本步骤。如果程序提示发现“今日灵修”，在 Codex 中只需说：

```text
请为 pending 批次的所有今日灵修选曲，然后继续处理并发送。
```

Codex 会完整读取：

- `add_bgm_files/music_profiles/配乐分析提示词.md`
- `add_bgm_files/music_profiles/圣乐曲库画像_初版.csv`
- 该批次的所有转写文本

然后为每篇文章写入唯一的选曲结果。可用以下命令查看状态：

```bash
python3 batch_audio.py status
```

### 3. 批量混音和发送

选曲齐全后运行：

```bash
python3 batch_audio.py run
```

运行前会先检查整个批次。只要有一条“今日灵修”缺少选曲，就不会开始发送。

每个文件发送成功后，会删除该原音频和已发送成品；如果失败，文件会保留，错误会写入批次清单。

## 邮箱附件说明

`main.py` 是收到新邮件时的推荐入口。它会先下载邮箱附件，然后执行条件式批次流程：没有“今日灵修”时直接处理发送，存在“今日灵修”时暂停等待选曲。它不会自动请求 AI 接口。

## 环境要求

本机需要：

- Python 3
- ffmpeg
- whisper.cpp 的 `whisper-cli`
- `add_bgm_files/models/ggml-small.bin`

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

转写和选曲记录保留在 `add_bgm_files/transcripts/`，混音临时文件会自动清理。

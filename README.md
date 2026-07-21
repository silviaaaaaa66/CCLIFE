# 自动音频处理

这个项目用于批量处理生命季刊朗读音频。选曲环节由 Codex 一次完成整个批次，项目不使用 OpenAI API，也不需要 `OPENAI_API_KEY`。

## 三类处理

- 普通朗读：音量规范化，转为单声道低码率 MP3。
- 今日灵修：先全文转写，再由 Codex 按完整提示词和全部曲库画像选择一首 BGM。
- 致我的亲人：固定使用 `Amazing Grace`。

## 批量工作流

### 1. 准备整个批次

把所有音频放入 `downloads/`，然后运行：

```bash
python3 batch_audio.py prepare
```

也可以使用原有入口：

```bash
python3 use_when_already_downloaded.py
```

这一阶段会：

1. 扫描所有音频并分类。
2. 批量转写所有“今日灵修”。
3. 生成 `batch_jobs/pending.json`。
4. 暂停在选曲阶段，不混音、不发邮件、不删除原文件。

### 2. 让 Codex 一次为全部音频选曲

在 Codex 中只需说：

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

## 邮箱附件

```bash
python3 main.py
```

`main.py` 会先下载邮箱附件，然后执行同样的批次准备流程。它不再自动请求 AI 接口或立即发送。

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

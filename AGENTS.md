# Audio batch instructions

When the user asks to process one or more audio files, use the two-stage batch workflow. Never call an OpenAI API or add an API-based recommendation fallback.

1. If `batch_jobs/pending.json` does not exist, run `python3 batch_audio.py prepare`.
2. For every pending devotional entry, read the entire `add_bgm_files/music_profiles/配乐分析提示词.md`, the entire `add_bgm_files/music_profiles/圣乐曲库画像_初版.csv`, and its complete transcript. Do not choose from only the already-extracted files in `add_bgm_files/bgm/`; consider the full catalog represented by the ZIP.
3. Select exactly one track for each devotional. Compare the article core, theological focus, devotional tone, music function, contraindications, and closest alternatives. Do not match only on title keywords.
4. Write a selections JSON object keyed by the exact `source` path from the manifest. Each value must contain: `track_id`, `chinese_title`, `english_title`, `album_title`, `track_number`, `article_core`, `theological_focus`, `devotional_tone`, `reason`, and `not_recommended`.
5. Apply all selections together with `python3 batch_audio.py apply <selections.json>`.
6. Run `python3 batch_audio.py run`. This performs mixing, email delivery, and success-only cleanup for the whole batch.
7. Report each selected track and whether every file was sent. If processing fails, preserve source/output files and report the manifest error.

Do not overwrite an unfinished manifest. Normal and family audio do not need Codex selection, but they remain in the same batch so the user can initiate the whole set with one request.

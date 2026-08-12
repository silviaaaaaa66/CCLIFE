# Audio batch instructions

When the user asks to process one or more audio files, use the conditional batch workflow. Never call an OpenAI API or add an API-based recommendation fallback.

1. If `runtime/batch_jobs/pending.json` does not exist, run `python3 main.py --local`.
2. If the prepared batch contains no devotional entries, `process` immediately mixes, sends, and performs success-only cleanup for the whole batch. No Codex selection step is needed; report whether every file was sent.
3. Only if the batch contains pending devotional entries, read the entire `resources/music_profiles/配乐分析提示词.md`, the entire `resources/music_profiles/圣乐曲库画像_初版.csv`, and each complete transcript. Do not choose from only the already-extracted files in `runtime/bgm/`; consider the full catalog represented by the ZIP.
4. Select exactly one track for each devotional. Compare the article core, theological focus, devotional tone, music function, contraindications, and closest alternatives. Do not match only on title keywords.
5. Write a selections JSON object keyed by the exact `source` path from the manifest. Each value must contain: `track_id`, `chinese_title`, `english_title`, `album_title`, `track_number`, `article_core`, `theological_focus`, `devotional_tone`, `reason`, and `not_recommended`.
6. Apply all selections together with `python3 -m cclife_audio.batch apply <selections.json>`.
7. Run `python3 -m cclife_audio.batch run`. This performs mixing, email delivery, and success-only cleanup for the whole batch.
8. Report each selected track and whether every file was sent. If processing fails, preserve source/output files and report the manifest error.

Do not overwrite an unfinished manifest. Normal and family audio do not need Codex selection, but they remain in the same batch so the user can initiate the whole set with one request.

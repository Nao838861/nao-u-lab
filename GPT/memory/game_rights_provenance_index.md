---
name: game_rights_provenance_index
type: derived_index
status: active
generated_by: tools/build_game_rights_provenance_index.py
source: memory/atoms.jsonl + memory/raw/slack_api/game-rights.jsonl
---

# game-rights provenance index

`memory/game_rights_provenance_index.jsonl` は、`game-rights` / `nao-u-feedback` atom から Slack 原文へ戻るための派生 index。
atom 本体の `links` は更新せず、`source_ts` をキーに `memory/raw/slack_api/game-rights.jsonl` と突合して、Slack permalink と raw 保存場所を記録する。

## 生成

```powershell
python tools\build_game_rights_provenance_index.py
```

検証だけ行う場合:

```powershell
python tools\build_game_rights_provenance_index.py --check
```

## フィールド

- `atom_id`: 対象 atom の id
- `source_ts`: Slack message ts。raw との突合キー
- `channel` / `channel_name` / `channel_id`: Slack チャンネル情報
- `raw_path`: 原文保存先
- `permalink`: `channel_id` と `source_ts` から生成した Slack URL
- `context_status`: `permalink_generated` / `missing_raw` / `missing_channel_id`
- `generated_at`: index 生成時刻

## 運用メモ

この index は Phase 4b `ISS-20260528-GR-LINKS` の最小導入。recall 表示への接続や atom `links` への昇格は、別サイクルで効果を確認してから判断する。

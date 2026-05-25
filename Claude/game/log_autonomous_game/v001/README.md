# log_autonomous_game v001

Nao_u 2026-05-25 06:23 #human-steering 指示「各自の名前を付けた新しいプロジェクトとして自律的にこのようなゲームを生成して、どのくらいのものが作れるかを試してほしい。このプロジェクトは、どれだけ時間がかかってもよいから精度高く指示に従ってゲームを完成までもっていってほしい」を受領した Log の応答プロジェクト第一バージョン。ジャンルは (C) 1秒先予測型 回避ゲーム を選択する（候補 A 反射系 / B 推理系 / C 予測型回避 のうち、`game/avoid_log/v04` まで作って Nao_u から「単調」評を受けた経験を Pulse Relay v003 教師差分の 70-90 秒カーブで対比実験する意図）。Pulse Relay v003 が `Space だけ` を厳守したのに対し、Log は「中心入力 + 副入力 1 つまで許容」を採用して意図的に原則から少し離れる（log_mystery v01-v03 でテキスト選択のみに絞った結果のスカスカ感を回避するため）。完成基準は Nao_u 自身が遊んで「精度高く指示に従っている」と判定すること。本 v001 は design_log + brainstorm までで一旦区切り、実装は次サイクル以降に分割する。

## Trace logger (C239 追加)

1 プレイの全 frame を jsonl で記録し、LLM playtester (Lap 応答 ts=1779748594 / 1779748624 整合) の教師資料化と将来の自動プレイ評価の入力にする。

- **形式**: 1 行 = 1 JSON object。先頭 1 行は `frame: -1` の header (play_id / started_at / FPS / W / H など)。以降は frame=0,1,2... の各 frame snapshot
- **フィールド** (frame 行): `frame / state / actions_available / action_taken / action_source / event`
  - `state`: `player {x,y,r}` / `enemies[]` / `bullets[]` (位置・速度) / `trail_len` / `echo {startFrame,elapsed}|null` / `wave` / `relay {hit,miss,idle}`
  - `actions_available`: 再演中は `["auto_replay"]`、足跡 1 秒未満は `[left,right,up,down,noop]`、それ以上は `[left,right,up,down,space,noop]`
  - `action_taken`: `left / right / up / down / space / noop / auto_replay / 斜めは "left+up" など連結`
  - `action_source`: 現段階は `"human"` 固定。LLM プレイヤー連結時に `"llm"` / `"script"` を入れる枠
  - `event`: `null / {name, ...} / 複数同frameは配列`。発火種: `echo_cast / echo_resolve / wave_spawn / wave_clear / death / lock_idle_warning`
- **保存方法**: ブラウザは fs 直書き不可のため、Save Trace ボタン → Blob ダウンロード → `memory/raw/playtrace/` に手動配置 (自動 sync は別タスク = next_tasks 登録済)
- **発火タイミング**: ゲーム開始 (TITLE→PLAYING) で trace 開始、PLAYING 中は毎 frame buffer、GAMEOVER 直前の death frame も含めて保存
- **window API**: `window.__logAutonomousV001.{downloadTrace, getTrace, getMeta}` で外部 (例 puppeteer / LLM 自動プレイ層) から取得可能

format_version=1。LLM プレイヤー実装時にフィールド追加した場合は version を上げる。

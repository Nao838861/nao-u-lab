# log_autonomous_game v002 — Echo-Path (v001 ベース)

## 状態
**骨格のみ (Phase 3 着地)**。Phase 4 大作業で wave カーブ実装 + audit scripts v002 対応 + self_judgment.md v002 採点を予定。

## v001 からの差分 (Phase 3 = 2026-05-27 C247 着地分)
1. **タイトル画面の "未来ゴースト" 描画削除** (`game.js` `drawTitle()` 内)
   - v001 では tile に「キャラ + 1 秒先未来位置の薄い円 + 結線」を描画していた
   - v002 では「キャラ本体」のみ静止描画
   - 理由: `memory/feedback_inside_to_outside_leak.md` (内側→外側流出禁則) の徹底適用。Nao_u 2026-05-26 06:10 #human-steering「予測軌跡+×印が逆によけにくい」の 1 原則がタイトル画面に残存していたため
2. **UI 用語洗浄** (`index.html`)
   - `<title>`: `log_autonomous_game v001 — Echo-Path (パイロットごっこ)` → `Echo-Path`
   - `.note`: 内部用語 (`Trace logger` / `LLM playtester` / `memory/raw/playtrace/` 等) を削除、操作説明 2 行のみに圧縮
   - 理由: Nao_u 5/26 06:06 「ごっこ乱用」指摘 + 内部識別子の UI 流出禁則
3. **タイトル副題 "— 1 秒先の自分に賭けるパイロットごっこ —" 削除**
   - "あなたの足跡が、これから歩く道になる" のみ残す
   - 理由: 同上 (ごっこ乱用)

## v002 で残された大作業 (Phase 4 = 2026-05-27 C247 で着手予定)
1. **wave 2 開始遅延 + 弾密度カーブ調整** (`game.js`)
   - v001 は wave 1 = 5 敵 (A 直進) で始まり即弾、Nao_u「展開なし反復で明確につまらない」指摘の核
   - Pulse Relay v003 70-90 秒カーブ (`design_log.md` 参照) を本格的に適用: 0-12s 学習 / 12-25s 基本混合 (A+D) / 25-50s 価値提示 / 50-70s 中盤圧力 / 70-85s 終盤の山 / 85-90s 終端
2. **audit scripts (verify / bullet_origin / enemy_behavior / agent_difficulty_proxy) の v002 対応**
   - Phase 3 では v001 path がハードコードされた audit scripts を v002 に持ち込まず削除
   - Phase 4 で各 audit を `target: 'game/log_autonomous_game/v002/game.js'` に書き換え、v002 カーブ調整後の数値で改めて走らせる
3. **self_judgment.md v002 (新規作成)**
   - v001 暫定採点 20/25 (Q-A 5 / Q-導入 4 / Q-成功FB 状態3=3 / Q-D 3 / Q-E 5) を起点に、v002 で「Q-導入: tile ghost 削除 → 4 → 5 (完全に内部に閉じた)」「展開なし反復の解消度」を追加採点

## 過去ファイル参照
v001 = `game/log_autonomous_game/v001/` 以下。design_log.md / brainstorm.md / user_directives_raw.md / self_judgment.md は v001 共有 (Phase 4 で v002 用に分岐するか判断)。

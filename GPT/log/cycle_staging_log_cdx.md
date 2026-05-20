# log_cdx Cycle Staging — 2026-05-20 13:58

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
(Phase 1 が書き込む)

## Phase Game Start: ゲーム制作着手

- 対象 directive: `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` (`status: active`)。Slack game pending は今回対象なし。
- 対象版: `game/graze_log_cdx/v05_1_cdx_v16/`
- 判断: v15 は clear-capable で Active DEF focused probe も通ったが、simple bot は `activeDefCount: 0` のままだった。今回は数値バランスを動かさず、DEF ready 中に「いま押すと効く」瞬間を読ませる cue を追加する。
- 実装: `DEF_PROMPT_FRAMES=72` / `DEF_PROMPT_WINDOW=2` と `defPromptReady()` を追加。DEF ready かつ graze window 内に弾が2発以上ある状態が続くと `DEF WINDOW` popup、Active DEF 半径 preview ring、HUD の `DEF n` を出す。Active DEF 使用時に cue timer をリセットする。
- 検証: `node tools\headless_graze_log_cdx_v05_2_v16_check.js` 成功。finite stage / boss final cue / final BOMB / clear を維持。focused probe は `DEF WINDOW`、`defReadyT: 72`、DEF 後 `defReadyT: 0`、`defPromptMakesDefMomentReadable: true`。
- 実行方法: `game/graze_log_cdx/v05_1_cdx_v16/index.html` をブラウザで開く。可視自動検証は `game/graze_log_cdx/v05_1_cdx_v16/auto_verify.html`。
- 残課題: 実プレイで cue が強すぎないか、`WINDOW n` + `DEF n` が HUD の情報過多にならないかを確認する。

## Phase 2: 分析
(Phase 2 が書き込む)

## Phase 3: Shared-reads 投稿
(Phase 3 が書き込む)

## Phase 3b: Shared-reads 自己フィードバック
(Phase 3b が書き込む)

## Phase 4a: 整理 + 問題抽出
(Phase 4a が書き込む)

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)

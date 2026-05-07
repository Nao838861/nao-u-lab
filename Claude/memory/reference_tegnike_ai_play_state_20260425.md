---
name: tegnike「AIにゲームを遊ばせる、状態をどう取るか」3案（2026-04-25）
description: tegnike記事の状態取得3案分類と我々のreplay_infra/スクショ評価ループへの接続点
type: reference
---

# tegnike「AIにゲームを遊ばせるなら状態をどう取るか」（2026-04-25）

## 起点

2026-04-25 09:50-09:51 Nao_u が #nao-u に3件投下:
1. vista8 (中国語) — GPT5.5 codex client + ChatGPT web image generation でブラウザ2Dゲーム
2. tegnike — 「AIにゲームを遊ばせるなら、まず『状態をどう取るか』を考えよう」
3. nikechan.com/dev_blog/ai-game-play-methods — tegnike記事本体

vista8 は chongdashu / super_bonochin と同類のショーケース言説（体験の主=観客）。reference_ai_gamedev_criticalpoint_20260424.md の流れに連続。

tegnike記事は方法論。**目的は逆方向だが方法は転用可能**な分離評価対象。

## tegnike 状態取得3案

| 案 | 方法 | 利点 | 課題 |
|---|---|---|---|
| 1 | ローカルLLM画面解析+映像を応答時間分遅延 | API課金なし | リアルタイム性を捨てる |
| 2 | 高速マルチモーダルに画面キャプチャ直入力 | 最短試作・高速 | モデル依存・課金 |
| 3 | テキスト/構造化プロトコルで状態取得（ポケモンShowdown型） | 超高速・低コスト・安定 | ゲーム選択が限定 |

引用「マルチモーダルに頼らず高速・低コスト・安定動作を狙うなら、テキストや構造化データとして状態を取得できるゲームを選ぶのが現実的」

## 「体験の主は誰か」軸での評価

tegnikeの**目的**＝AI実況＝体験の主は観客/視聴者で、Nao_u20年日記の方向（体験の主＝作り手）とは**逆方向**。

ただし**方法論レイヤー**は目的を選ばない:
- 我々の avoid_log headless replay / role_split_playtest = **案3そのもの**
- スクショ自己評価ループ（未構築、feedback_ai_agent_gamedev_bottleneck.md記載）= **案2の処方箋**
- ローカルLLM用途分離案（reference_local_llm_usecase_splitting_20260424.md）= **案1のインフラ**

→3案がうちの3つの既存/未構築インフラと**1対1対応**している。tegnikeは観客向けの目的で、我々は作り手向けの目的で、同じ3案を組み合わせていることになる。

## 我々への含意

1. **案3の確信補強**: 既に取っている方向が外部で同じく「現実的」と評価されている。avoid_log の seeded PRNG + 入力記録 + headless 方針は継続。
2. **案2＝未構築の優先度上げ**: スクショ自己評価ループは「最短で試作できる」。Qwen-VL ローカル用途分離案と組めば API 課金も回避。次の kaizen 候補。
3. **案1の役割明確化**: ローカルLLM用途分離は「リアルタイム性を捨てて課金回避」のレイヤーで、本筋（ゲーム判断）には案2/案3を使う。

## 同調罠チェック

「3案がうちのインフラと1対1対応」は気持ちよすぎる発見。

- tegnikeの**目的**（AI実況=観客向け）は我々と逆 → 同調しない
- ただし方法は中立資産 → 転用してよい
- 「すごい一致」ではなく「方法論レイヤーで一致、目的レイヤーで逆」と分離して読む

feedback_no_sympathy_goal_first.md に従い、同調せず目的（AIが人間より上手くゲームを作る）との対で機能させる。

## vista8 の扱い

vista8 = chongdashu / super_bonochin / Rosebud_AI と同類、体験の主＝観客の量産言説。
→ reference_ai_gamedev_criticalpoint_20260424.md に追記のみ（独立ファイル不要）。

## 関連記憶

- `feedback_ai_agent_gamedev_bottleneck.md` — V-GameGym/GameDevBench、フィードバックループの質
- `feedback_game_replay_infra.md` — seeded PRNG + 入力記録 + headless（案3に該当）
- `feedback_role_split_playtest.md` — Nao_u感想/我々ヘッドレス自己評価
- `reference_local_llm_usecase_splitting_20260424.md` — ローカルLLM用途分離（案1のインフラ）
- `reference_ai_gamedev_criticalpoint_20260424.md` — 48時間臨界点（vista8追記先）
- `feedback_no_sympathy_goal_first.md` — 同調せず目的達成

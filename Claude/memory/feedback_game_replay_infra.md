---
name: feedback_game_replay_infra
description: 全ゲームにリプレイ再現を標準装備。seeded PRNG + 入力記録 + headless replay。Math.random()禁止。AI自己計装プロトコル層（2026-04-24追加）
type: feedback
---

# 全ゲームにリプレイ再現を標準装備

## 原則
- **seeded PRNG**: シード値からの決定的乱数。`Math.random()` 直接呼び出し禁止
- **入力記録**: フレーム単位で `{frame, input}` を JSON/配列に記録
- **headless replay**: レンダラなしで `game.step(input)` を再生して state が一致
- **Math.random() 禁止**: 一度でも生 `Math.random()` を挿むとリプレイ再現が壊れる
- **AIリプレイと humanリプレイ は別ディレクトリ**: 後々の分析時に系統を混ぜない

**Why:** Pot / avoid_log / study_platformer 3シリーズを跨いだ経験から。リプレイ再現が無いと「AIの失敗がどのフレームで何を見て起きたか」が再現できず、プレイテスト→改修のループが閉じない。core.py/renderer.py 分離（game_lessons_log.md S-01）とセットで機能するインフラ層。

**How to apply:** 新ゲーム着手時のテンプレ必須項目。`game.step(input) -> state` のインターフェース定義と同時に、(i) seeded PRNG クラスを入れる (ii) `replay.jsonl` に `{frame, input}` を記録する (iii) `headless_replay.py` で state 再生が一致することを着手時点で確認する。

関連:
- `memory/game_lessons_log.md` S-02: 固定小数点(ONE=256)で物理ドリフト防止
- `memory/feedback_role_split_playtest.md`: Nao_u=感想/我々=判断実装+ヘッドレス自己評価
- Ash 提案（2026-04-22 #game-rights）の `pow(random(), 100/(stage+1))` 型パラメータ割当は必ず seeded PRNG 経由で実装する（Math.random() 直呼び出ししない）

---

## AI自己計装プロトコル層（2026-04-24 Log C115 追加）

### 由来
masafumi (@masafumi) 2026-04-24 13:23 #nao-u 投下: Codex に meshletカリングのデバッグ描画を色分けで自己可視化させた事例。`https://x.com/masafumi/status/2047474577551524085`

### ルール
- **判断点の自己計装**: frame 単位で `{frame, decision, reason, alternatives_rejected}` を JSON に記録する
  - `decision`: 実際に選んだ行動
  - `reason`: なぜそれを選んだか（AI の内部観測）
  - `alternatives_rejected`: 検討したが選ばなかった候補
- **`--visualize` モード**: 判断点を画面オーバーレイとして焼き込む（色分け / ラベル / 確率分布バー）
- **replay.jsonl とは別ファイル**: `decision_log.jsonl` に分離。入力記録（物理再現用）と判断記録（思考可視化用）は目的が違う

### なぜこれが必要か（構造論）
`memory/feedback_ai_agent_gamedev_bottleneck.md` の核: AI エージェント×ゲーム開発のボトルネックは**構文正確性 70-90 点 vs 画面評価 0-20 点の乖離**（V-GameGym 由来）。これを埋めるのは「AI がコードを読む力」ではなく「AI が画面を見る力 + 自分の判断を可視化する力」。

自己計装プロトコル = headless replay（物理再現）の上に積む**思考再現層**。判断のトレースを残さないと、失敗時に「何が間違っていたか」を AI 自身が後から読めない。

### 実装タイミング
- 今すぐの実装は未着手、**layering の名指しのみ**
- 次の新作着手時（game_templates_design.md の avoid 系 v01 テンプレ起こし時）に組み込む候補
- 実装時は `game/<game_id>/v01/decision_log.jsonl` + `game/<game_id>/v01/visualize.py` の2点セット

### 関連
- `memory/feedback_ai_agent_gamedev_bottleneck.md`: 画面評価の弱さ（上位層）
- `memory/feedback_game_center_of_mass.md`: 重心審問（設計層）
- `memory/cross_instance_feedback_cycle.md`: Guide スロット（レビュー層）
- 本ファイル: 自己計装（インフラ層）

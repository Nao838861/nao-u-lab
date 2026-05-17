# graze_log_cdx — log_cdx 宛タスク（Nao_u 指示）

**起源**: 2026-05-17 18:06 Nao_u から #all-nao-u-lab 経由で Log (Claude/Win) に指示。Log が GPT 側へコピーした。
**ベース**: `v05_1_base/` (Claude 側 `Claude/game/graze_log/v05.1/` を 2026-05-17 時点でコピー)
**作業先**: `v05_1_cdx_v01/`（新規ディレクトリを作って改修版を置く。`v05_1_base/` には触らない）

## Nao_u の指摘（#game-rights 議論より、Mir 投稿の構造分析を踏襲）

graze_log v05.1 には以下の構造問題がある:

### 問題1: BOMB の使い道が薄くなりすぎている

- gauge MAX で発火する BOMB（全画面消去）と、graze 連続 5 回で発火する Active DEF（半径 80 の局所消去 + iframe 60F）が並立している
- **Active DEF が手軽すぎる**: graze 5 連はゲームの中心動作で頻繁に発生 → Active DEF が常時利用可能になり、BOMB を貯める意味が薄い
- 「いざという時の最終手段」としての BOMB の重みが、Active DEF に食われている

### 問題2: BOMB を連続で打てない仕組みが必要

- 現状、gauge MAX に達すると即 BOMB 発火可能 → 状況によっては短時間で連発できてしまう
- クールダウン等で「連射不能」「価値を守る」仕組みを入れたい

## 修正方向（Mir が #game-rights に投稿した3案 — log_cdx は自由に取捨選択 / 別案を出してよい）

1. **Active DEF の発火条件を重くする**: graze 連続 5 回 → 8〜10 回に引き上げ、または gauge を別途消費する形式に変更（BOMB と Active DEF で gauge を奪い合う）
2. **BOMB に明確な強みを残す**: BOMB 後に短時間の「弾速半減」「scoring boost」など、Active DEF にはない後効果を付与
3. **BOMB クールダウン**: BOMB 発火後 N 秒は再発火禁止（gauge が満タンでも撃てない）。表示で「COOLDOWN」と出す

## 実装上の制約（重要）

- **v05.1 → v05.2_cdx_v01 への改変は「削除可能 1 個刻み」の運用**: 戻し手順を devlog に明文化する（Claude 側 `feedback_clone_strategy.md` t:5 相当）
- **playable diff を出す**: README.md / devlog.md / index.html を `v05_1_cdx_v01/` に揃える。`v05_1_base/` には触らない
- **judgment は自己判定で1段落書く**: headless 数値（生存秒など）は判定の主根拠にしない（Claude 側 `feedback_headless_unfit_for_unfinished_eval.md` 同等扱い）
- **Mir / Log とは独立に判定する**: 観点が同じになりがちな指摘群（"Active DEF が強すぎる" の根拠付け、BOMB の機能割当）について、log_cdx 視点で深掘りする — 同調や引き写しを避ける

## 完了条件

1. `v05_1_cdx_v01/index.html` が動作する（ブラウザで開いて 30 秒プレイ可能）
2. `v05_1_cdx_v01/devlog.md` に: 採用案 / 改変箇所 / 戻し手順 / Mental Sim / 自己判定（1段落） を記載
3. `v05_1_cdx_v01/README.md` に: 採択 1 案の概要 / v05.1 base との差分要約
4. git commit + push（GPT リポジトリ側）
5. #game-rights に「v05_1_cdx_v01 完了」報告（Slack 投稿）

## 参照

- Claude 側 base: `D:\AI\Nao_u_BOT\Claude\game\graze_log\v05.1\`
- Claude 側 v04 → v05 までの設計議論: `D:\AI\Nao_u_BOT\Claude\game\graze_log\v05\devlog.md` 系
- Mir #game-rights 投稿（構造分析と修正方向3案）: Slack permalink を Phase 1 で取得して devlog に貼ること
- Nao_u 元投稿: `#all-nao-u-lab` 2026-05-17 18:06 周辺

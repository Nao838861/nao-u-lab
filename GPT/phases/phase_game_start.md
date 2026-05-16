---
phase: game-start
name: ゲーム制作着手
focus: pending のゲーム制作指示を通常収集に流さず、何を作るか決めて実装を始める
estimated_time: 60-120 min
inputs: [memory/slack_directives.jsonl, memory/game_design_rules.md, memory/game_memory_task_lens_index.md, game/]
outputs: [新規または更新ゲームプロトタイプ, design_log.md, headless check, staging Game Start セクション]
---

# Phase Game Start: ゲーム制作着手

`memory/slack_directives.jsonl` に `domain: game` かつ `status: pending` の直接指示がある時、このフェーズを通常の Phase 1 より優先して実行する。

## このフェーズで集中すること

**pending を記録して終わらせない。何を作るかを決め、最小 playable diff を作る。**

## 必ず読むもの

1. `memory/game_design_rules.md`
2. `memory/game_memory_task_lens_index.md` があれば読む
3. 対象指示の原文 (`memory/slack_directives.jsonl`)
4. 既存ゲームから流用する場合は、その `design_log.md` / README / headless check

## やること

1. pending game directive を 1 件選ぶ。古い未完了指示と新しい補足指示が同じ目的なら、まとめて扱う。
2. 何を作るかを Codex 自身で決める。決定理由には、過去知見のどれを使うかを書く。
3. 新規プロトタイプなら `game/<slug>/v001/` を作る。既存改修なら対象 version を明示する。
4. `design_log.md` に、実装前判断、設計サイクル、採用案、懸念、検証方法を日本語で残す。
5. playable な `index.html` と必要な `.js` / `.css` を作る。
6. focused headless check を `tools/headless_<slug>_v001_check.js` などに作り、実行する。
7. 完了した pending directive は `handled` に更新し、`handled_at / handled_by / handling_note` を追記する。
8. staging に、対象 directive、作ったもの、実行方法、検証結果、残課題を記録する。
9. 変更を commit / push する。

## やらないこと

- ゲーム制作指示を Phase 1 の外部研究収集へ送って終わること
- 「次サイクルでやる」とだけ書くこと
- 内省文書だけを増やして playable diff を作らないこと
- Claude 側フォルダのゲームを直接書き換えること
- Nao_u の原文指示を要約だけで処理すること

## 出力チェック

- ブラウザで開けるゲームファイルがある
- `design_log.md` に指示原文と判断理由がある
- headless check が通っている
- `slack_directives.jsonl` の対象が `handled` になっている
- staging に permalink / path / commit / verification が残っている

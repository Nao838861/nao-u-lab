---
title: "AutoBG: A Board Game Design Assistant with Interactive Ideation, Iterative Rulebook Generation, and Individualized Feedback"
url: https://arxiv.org/html/2606.01976v1
collected_at: 2026-06-25T13:29:30+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, board-game, llm, playtesting, iterative-design, persona-feedback]
evaluated_at: "2026-06-25T13:32:13+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-25T13:32:13+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-25T13:32:13+09:00"
next_action: keep_for_reference
stale_after: "2026-07-25"
supersedes: []
gate_reason: |-
  手法要素とゲーム制作への適用性は十分あるが、AutoBG は既に 2026-06-03 と 2026-06-18 の shared-reads 投稿で CoopEval 水準の概要として記録済み。
  今回の candidate は verifier-gated iteration や persona feedback の新規差分を出しておらず、Phase 3 で再投稿すると重複記憶になるため fail とする。
---

## raw_excerpt
AutoBG は、ボードゲーム制作を「曖昧な初期アイデア」から「構造化された設計案」「ルールブック生成」「批評による改稿」「プレイヤー層ごとの反応予測」まで一続きに扱う設計支援システム。論文上の構成は BG-Ideator、BG-Realizer、BG-Critic、BG-Persona の4モジュールで、BG-Critic は MDA framework に沿って flaws を診断し、BG-Realizer はその診断を使ってルールブックを改稿する。改稿は単なる自己反省ではなく、比較と No_Flaw 判定を使う verifier-gated iteration として説明されている。

データ面では、約2.2Kの構造化ルールブックと180Kのプレイヤーレビューを土台にし、192 mechanics と190 themes を含むとされる。実験は207の held-out games で行われ、BG-Critic の診断品質、flaw-free rate、BG-Persona の within-player ordering accuracy、30人ユーザースタディなどが示されている。短い原文フレーズとしては "structured design draft"、"Verifier-Gated Iteration"、"150 real player profiles" が中核。

## why_relevant_to_games
Nao_u_BOT のプロトタイプ制作で、思いつきメカニクスを playable loop に落とす前段の質問設計、MDAベースの欠陥診断、ユーザータイプ別フィードバック予測の型として使えそう。

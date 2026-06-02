---
title: "AI Playtesting - When Your Board Game Tests Itself"
url: "https://bennycheung.github.io/ai-playtesting-when-your-game-tests-itself"
collected_at: "2026-06-02T11:59:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, ai-agent, board-game, mcts, telemetry]
evaluated_at: "2026-06-02T12:02:26+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-02T12:02:26+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-02T12:02:26+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-02"
supersedes: []
gate_reason: |
  問題設定、GameGrammar/Nova の役割、random/MCTS/LLM agent の使い分け、LLM 失敗を rules clarity signal に転用する着想まで抽出できる。
  Nao_u_BOT の headless 評価やルール明瞭性検査へ具体的に接続でき、~4000字の概要でも手法・評価・限界を展開できる。
suggested_post_outline:
  overview_angle: "board game の自動 playtest を、勝敗最適化ではなく rule clarity と設計介入候補の検出ループとして読む"
  analysis_axis: "GameGrammar/Nova の構造化、random/MCTS/LLM agent の役割分担、LLM failure を confusion pattern として扱う点"
  application_target: "headless 評価、dead action / dominant strategy / rule ambiguity の検出、playtest 前の設計レビュー"
  pros_cons: "利点は反復速度と失敗ログの構造化。弱点は LLM agent のゲーム能力を勝敗評価に使い過ぎると誤読しやすい点"
  verdict_pre: "部分採用"
---

## raw_excerpt

著作権配慮のため長文引用ではなく、記事本文の要点メモとして保存する。記事は GameGrammar / Nova 系列の Part 9 で、board game の構造化 ontology を自動 playtesting に接続する話。問題設定は、紙の prototype、参加者募集、説明、記録、再調整を毎回回すため、board game の反復 playtest が週単位で詰まりやすいこと。提案されている loop は、designer が自然言語で balance playtesting を依頼し、Nova が rules を parse し、random agents で多数ゲームを回し、結果を structured critique と intervention options として返すもの。さらに MCTS、random、LLM agent を役割分離している。MCTS は strategic play が成立するか、random は統計的公平性、LLM agent は勝つためではなく rules clarity の信号として使う。記事中では、LLM agent が random より悪い結果になる失敗を、mechanism avoidance / confusion pattern として rule clarity analyzer に転用した点が中核として扱われている。

Source lines: 15-19, 29-34, 56-72, 77-99, 101-145, 176-194.

## why_relevant_to_games

Nao_u_BOT の headless 評価で、AI を「上手く遊ばせる」だけでなく、失敗 policy を clarity / dead action / dominant strategy 検出器として使う候補になる。

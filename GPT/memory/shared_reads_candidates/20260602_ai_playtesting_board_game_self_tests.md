---
title: "AI Playtesting - When Your Board Game Tests Itself"
url: "https://bennycheung.github.io/ai-playtesting-when-your-game-tests-itself"
collected_at: "2026-06-02T11:59:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, ai-agent, board-game, mcts, telemetry]
---

## raw_excerpt

著作権配慮のため長文引用ではなく、記事本文の要点メモとして保存する。記事は GameGrammar / Nova 系列の Part 9 で、board game の構造化 ontology を自動 playtesting に接続する話。問題設定は、紙の prototype、参加者募集、説明、記録、再調整を毎回回すため、board game の反復 playtest が週単位で詰まりやすいこと。提案されている loop は、designer が自然言語で balance playtesting を依頼し、Nova が rules を parse し、random agents で多数ゲームを回し、結果を structured critique と intervention options として返すもの。さらに MCTS、random、LLM agent を役割分離している。MCTS は strategic play が成立するか、random は統計的公平性、LLM agent は勝つためではなく rules clarity の信号として使う。記事中では、LLM agent が random より悪い結果になる失敗を、mechanism avoidance / confusion pattern として rule clarity analyzer に転用した点が中核として扱われている。

Source lines: 15-19, 29-34, 56-72, 77-99, 101-145, 176-194.

## why_relevant_to_games

Nao_u_BOT の headless 評価で、AI を「上手く遊ばせる」だけでなく、失敗 policy を clarity / dead action / dominant strategy 検出器として使う候補になる。

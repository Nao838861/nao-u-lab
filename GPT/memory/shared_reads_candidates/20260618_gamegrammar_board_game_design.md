---
title: "Introducing GameGrammar: AI-Powered Board Game Design"
url: "https://bennycheung.github.io/introducing-gamegrammar-ai-powered-board-game-design"
collected_at: "2026-06-18T05:44:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, board-games, co-design, design-tools, ai-assisted-design]
evaluated_at: "2026-06-18T05:47:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-18T05:47:05+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-18T05:47:05+09:00"
next_action: revise_or_research
stale_after: "2026-07-18"
supersedes: []
gate_reason: "mechanics / components / scoring / critique に分解する設計補助の軸は有用。ただし AutoBG が既に posted で、同じ board game design assistant 領域を扱っているため、Phase 3 投稿前に差分軸を明確化する必要がある。GameGrammar 固有の価値を小型プローブへ落とせるか追加確認してから再判定する。"
---

## raw_excerpt

著作権配慮のため長文引用ではなく要点メモとして保存する。Benny Cheung による 2026-02-03 の Game Architecture シリーズ Part 5。GameGrammar は、短いテーマと制約から、mechanics、components、scoring、turn structure、balance critique を含む構造化された board game draft を生成する設計ツールとして紹介されている。短い原文断片: "six specialized design agents"。記事では、通常の LLM に「ボードゲームを作って」と頼む出力と異なり、35 種の mechanism taxonomy、2,000+ BoardGameGeek games の参照、Multi-Agent / RAG-Enhanced / Quick の生成モード、BalanceCritic と FunFactorJudge による自己批評を組み合わせる点が説明される。作者は、GameGrammar を完成品生成ではなく Stages 1 and 2、つまり concept / early design / iterative playtesting の前段を圧縮する道具として位置づけ、playtesting、taste judgment、publishing は人間側に残ると述べている。

## why_relevant_to_games

Nao_u_BOT のゲーム制作で、LLM に漠然と案を出させるのではなく、mechanics / components / scoring / critique を分けて構造化 draft に落とす候補。Phase 2 では既存 AutoBG / AI playtesting 候補との重複と、実装可能な小型プローブへの落とし込みを確認する。

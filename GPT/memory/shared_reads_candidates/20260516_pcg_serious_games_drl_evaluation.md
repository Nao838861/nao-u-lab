---
title: "A modular framework for automated evaluation of procedural content generation in serious games with deep reinforcement learning agents"
url: "https://arxiv.org/abs/2505.16801"
collected_at: "2026-05-16T09:29:08+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, automated-testing, reinforcement-learning, serious-games]
evaluated_at: "2026-05-16T09:44:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-21T11:08:04+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-a1428d3078960c36; terminal:memory/shared_reads_candidates/20260516_pcg_serious_games_drl_evaluation.md: https://arxiv.org/abs/2505.16801 same work abstract-level evidence; memory/shared_reads_candidates/20260719_pcg_evaluation_drl_agents.md: https://arxiv.org/abs/2505.16801 same work adds 94 percent versus 97 percent only; reason:2件は同じ arXiv 2505.16801 の同じ serious-game PCG 評価を扱い 後発候補も数値を補っただけで独立 work ではない。どちらも本文条件不足で pass できないため重複候補として閉じる。"
stale_after: "2026-06-15"
supersedes: []
gate_reason: "DRL game testing agents で PCG 差分を win rate / training time として見る着想は有用だが、現候補の情報量では framework の構成や評価設計を4000字水準で十分に展開しにくい。serious game / card mechanics への依存も強く、Nao_u側への適用は追加確認後に判断したい。"
next_action: none

---

## raw_excerpt

arXiv 要旨では、serious games に PCG を入れた時の影響を評価するため、deep reinforcement learning game testing agents を組み込む modular framework を提案している。検証対象はカードゲーム mechanics を持つ serious game で、NPC 生成を random 版と genetic algorithm 版に分けて比較する。通常プレイを模したテストでは、GA 版で訓練された agent が win rate と training time の面で優位になり、PCG の違いがプレイ可能性やテスト結果に現れることを示している。

短い原文断片: "automated evaluation", "DRL game testing agents", "win rate".

## why_relevant_to_games

LLM/PCG で作ったゲーム要素を、人間の印象だけでなく自動プレイ agent の挙動差として収集する候補になる。

---
title: "GARL: Game-Theoretic Reinforcement Learning for Multi-Agent Strategic Prioritisation"
url: "https://arxiv.org/abs/2606.05002"
collected_at: "2026-06-19T16:29:59+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, reinforcement-learning, game-theory, agent-policy, evaluation]
evaluated_at: "2026-06-19T16:33:03+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-19T16:33:03+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-19T16:33:03+09:00"
next_action: revise_or_research
stale_after: "2026-07-19"
supersedes: []
gate_reason: |-
  問題設定と二段階ゲーム化の着想は明確で、NPC/勢力/AI designer の優先順位決定へ接続できる。
  ただし現候補では role-specific reinforcement signals の具体、比較条件、評価指標が薄く、CoopEval 水準の概要を書くには追加読解が必要。
---

## raw_excerpt
arXiv:2606.05002。2026-06-03 submitted。LLM-based multi-agent systems では、個々の model capability だけでなく、agents がどう相互作用し、どう適応するかの policy が performance を左右する、という問題設定。GARL は multi-agent strategic prioritisation を二段階ゲームとして形式化する。まず competing agents が shared candidate set に strategic resources を割り当て、次に higher-level arbiter が final ranking を作る。この interaction structure から role-specific reinforcement signals を作り、policy optimisation を task-specific reward の手設計だけに寄せず、game-theoretic utility に接地させる。実験対象は legal proceedings の issues-in-dispute ranking で、small open-source LLM を同じ candidate-ranking setting 内で強い closed-source LLM に近づける結果が報告されている。

## why_relevant_to_games
複数 NPC / faction / AI designer が同じ候補資源を奪い合う設計や、ゲーム内勢力の優先順位決定を、単なる prompt voting ではなく role-specific reward と arbiter で構成する時の素材になる。

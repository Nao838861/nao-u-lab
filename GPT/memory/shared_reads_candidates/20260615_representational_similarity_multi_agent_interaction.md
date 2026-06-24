---
title: "Representational Similarity and Model Behavior in Multi-Agent Interaction"
url: "https://arxiv.org/html/2606.07818v1"
collected_at: "2026-06-15T03:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, creativity, cooperation, llm-agent]
evaluated_at: "2026-06-15T04:06:42+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-15T04:06:42+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-15T04:06:42+09:00"
next_action: revise_or_research
stale_after: "2026-07-15"
supersedes: []
gate_reason: "協力性能と novelty/creativity の tradeoff という着想はゲーム制作に関係するが、現候補の情報だけだと model pair 選定の一般論に寄りやすい。投稿水準にするには、各 task の評価指標、CKA と layer 別 similarity の解釈、ゲーム内 AI チーム設計へ落とす時の制約を本文から補う必要がある。"
---

## raw_excerpt

arXiv:2606.07818v1。Yujin Potter ほか。人間では neural similarity が social closeness や協力成功と関係し、逆に異質な相手との相互作用が innovation を生みやすい、という知見を LLM の multi-agent interaction に持ち込む研究。実験では、open-weight LLM の model pairs を、協力系 4 games (word guessing、public good、divide-a-dollar、Keynesian Beauty Contest) と novelty/creativity 系 4 tasks (story writing、fictional biography、haiku、vacation benefit brainstorming) で比較する。representational similarity は CKA で測り、performance disparity や model size などを統制する。結果は、表現空間が似ている model pair ほど協力成績は上がる一方、novelty と creativity は下がる傾向を示す。特に early layers の similarity が協力・新規性との関連を強く持ち、lexical/semantic grounding の共有度が効いている可能性があるとされる。

## why_relevant_to_games

複数 AI に企画、レビュー、テストプレイ、NPC 協調をさせる時、同型 agent を並べると協力は安定しても発想が狭くなる可能性がある。multi-agent 制作や NPC チーム設計で「同質性と多様性の配分」を考える材料になる。

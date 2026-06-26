---
title: "Generative AI for Dynamic NPC Behavior and Procedural Content Generation in Games: Architecture, Implementation, and Production Deployment"
url: "https://ijetcsit.org/index.php/ijetcsit/article/view/743"
collected_at: "2026-06-27T05:59:57+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, npc, pcg, production, architecture, genai]
evaluated_at: "2026-06-27T06:02:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-27T06:02:19+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-27T06:02:19+09:00"
next_action: keep_for_reference
stale_after: "2026-07-27"
supersedes: []
gate_reason: >-
  LLM、diffusion、RL、GOAP、StateTree、memory、safety などのキーワードは多いが、candidate 内で抽出できる手法の中核、評価設計、結果、production deployment の実証が薄い。
  Nao_u_BOT の NPC / PCG architecture の参考語彙にはなるが、CoopEval 水準の ~4000 字概要を書くには論拠が広く浅く、shared-reads 投稿として残す品質に届かない。
---

## raw_excerpt
IJETCSIT Vol. 7 No. 2 (2026) の記事。abstract では、commercial game environments における dynamic NPC behavior systems と procedural content generation への generative AI architecture 適用を、LLM、diffusion-based generative models、reinforcement learning agents、hybrid rule-based frameworks の統合として扱う。対象 stack は perception、reasoning、dialogue、memory、action execution をまたぐ multi-layered technical stack とされる。記事ページは NVIDIA ACE、Inworld AI、Ubisoft NEO NPC などの production deployment に触れ、game balance disruption、emergent behavior containment、voice actor rights、ethical implications も実装課題として挙げている。出典リストには GOAP、StateTree、PCG、NPC memory、real-time inference、safety などが並ぶ。

## why_relevant_to_games
NPC / PCG / memory / action を一つの production architecture として見る候補。Phase 2 以降で、実装例や数値主張の信頼性も含めて確認する素材。

---
title: "Empowering NPC Dialogue with Environmental Context Using LLMs and Panoramic Images"
url: https://arxiv.org/abs/2604.19192
collected_at: 2026-05-15T15:15:12+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-npc, spatial-context, dialogue, playtesting]
evaluated_at: 2026-05-15T15:19:33+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-15T15:19:33+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-15T15:19:33+09:00"
stale_after: "2026-06-14"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  panoramic image、semantic segmentation、scene graph JSON による環境文脈注入という着想は明確で、
  小型ゲームの状態構造化にも転用できる。ただし候補メモだけでは評価指標・比較条件・失敗例の密度が薄く、
  Phase 3 の単独投稿にするには追加読解が必要。

---

## raw_excerpt
原文要旨の要点メモ。LLM NPC に周辺環境の spatial awareness を与えるため、NPC の周囲を panoramic image として取得し、semantic segmentation で object と spatial position を抽出する。さらに scene graph data と directional vector を組み合わせた structured JSON representation を作り、LLM への入力として使う。これにより NPC が近くの object、landmark、environmental feature に言及できるようにする。評価は expert interview による改善点抽出と、その後の user study の二段階で、context-aware NPC が baseline より好まれたと報告されている。

## why_relevant_to_games
生成NPCを「人格プロンプト」だけでなく、ゲーム空間の観測JSONと接続する候補。小型ゲームでも画面/状態を構造化してNPCや評価エージェントに渡す設計に転用できる。

---
title: "Large Language Models in Game Development: Implications for Gameplay, Playability, and Player Experience"
url: "https://arxiv.org/abs/2603.27896"
collected_at: "2026-06-09T17:24:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm, player-experience, playability, game-engineering]
evaluated_at: "2026-06-09T17:30:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T23:49:13+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-ded7421e263957c1; terminal:memory/shared_reads_candidates/20260621_llm_gameplay_playability_player_experience.md: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781984368198809; reason:posted-source canonical URL and work identity both match existing Slack posts"
next_action: none
stale_after: "2026-07-09"
supersedes: []
gate_reason: >-
  LLM を game architecture component として扱い、correctness / difficulty calibration /
  structural coherence を見る軸は有用。ただし現候補は abstract レベルで、2 つの
  project の具体差分・失敗例・評価内容が薄く、~4000字の残すべき概要には不足。
---

## raw_excerpt
arXiv 2603.27896。一次情報メモ。論文は、LLM をゲーム開発の外部補助ではなく「architectural components」として組み込んだ2つの game projects を対象に、collaborative autoethnographic study を行ったもの。分析軸は gameplay、playability、player experience。

報告されている含意は、LLM 統合により variability と personalization が増える一方で、correctness、difficulty calibration、structural coherence が新しい品質課題になるというもの。開発者の reflective narratives と artifacts を材料に、生成AIの導入が既存のゲーム構成概念をどう変形するか、また game engineering 上どのような architecture / quality considerations を持ち込むかを扱っている。

## why_relevant_to_games
LLM を NPC・物語・ルール生成・評価器に組み込む時、面白さ以前に playability と coherence の品質管理が必要になる場面の候補資料。

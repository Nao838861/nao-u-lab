---
title: "The AI Design Stack: Agents, 3D Generation, and Beyond"
url: "https://gdcvault.com/play/1036041/The-AI-Design-Stack-Agents"
collected_at: "2026-07-14T06:30:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, agentic-ai, game-design, procedural-content, 3d-generation]
evaluated_at: "2026-08-13T04:20:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-13T04:20:00+09:00"
last_decision: failed
evidence: "group_handoff:gha-3c2a14d1806f3268; terminal:memory/shared_reads_candidates/20260626_gdc2026_ai_design_stack_tencent.md: source_url schedule.gdconf.com; same GDC session; evaluation details absent; memory/shared_reads_candidates/20260714_gdc_ai_design_stack.md: source_url gdcvault.com; same GDC session; evaluation details absent; reason:schedule と Vault は同一 GDC セッションの別導線で、両候補とも紹介文相当しかなく、入出力・失敗条件・評価結果を抽出できないため。"
next_action: none
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  Vault と schedule は同一 GDC セッションの別導線で、独立した work として維持する根拠がない。
  両候補とも紹介文相当で、入出力・失敗条件・評価結果が不足するため duplicate group を fail に閉じる。
duplicate_reason: failed_duplicate_of_terminal_sibling
---

## raw_excerpt

GDC 2026 の Production セッション。Tencent Cloud の Muqing Li が、agentic AI と 3D generation をゲームデザイン工程へ接続する end-to-end demo を紹介する。例として design agent は wandering merchant のような feature を定義し、それを game lore と制作上の constraints に接地したうえで、quest、economy、content brief にまたがる multi-step workflow を編成する。並行する 3D generation pipeline は、初期探索用の rough mesh から出発し、topology と texture を調整した tech-art review 前の prop asset までを生成・最適化する。セッションページは、単発の文章生成や 3D asset 生成ではなく、設計制約、複数の downstream 制作物、専門職レビューへつながる制作 stack として AI を提示している。

## why_relevant_to_games

ゲーム feature の着想を lore・economy・quest・asset 制作へ一貫して伝播させる場面と、AI 出力を人間の tech-art review 前まで運ぶ境界設計の収集資料になる。

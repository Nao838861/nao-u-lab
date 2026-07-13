---
title: "The AI Design Stack: Agents, 3D Generation, and Beyond"
url: "https://gdcvault.com/play/1036041/The-AI-Design-Stack-Agents"
collected_at: "2026-07-14T06:30:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, agentic-ai, game-design, procedural-content, 3d-generation]
evaluated_at: "2026-07-14T06:35:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-14T06:35:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-14T06:35:00+09:00"
next_action: revise_or_research
stale_after: "2026-08-13"
supersedes: []
gate_reason: >-
  lore / constraints から quest・economy・content brief・3D asset review へ接続する制作スタックは具体的だが、
  現候補はセッション紹介相当の一段落だけで、各 agent の入出力、失敗条件、比較対象、評価結果を抽出できない。
  CoopEval 水準の約4000字を根拠付きで構成するには講演本編または詳細資料の確認が必要なため保留する。
---

## raw_excerpt

GDC 2026 の Production セッション。Tencent Cloud の Muqing Li が、agentic AI と 3D generation をゲームデザイン工程へ接続する end-to-end demo を紹介する。例として design agent は wandering merchant のような feature を定義し、それを game lore と制作上の constraints に接地したうえで、quest、economy、content brief にまたがる multi-step workflow を編成する。並行する 3D generation pipeline は、初期探索用の rough mesh から出発し、topology と texture を調整した tech-art review 前の prop asset までを生成・最適化する。セッションページは、単発の文章生成や 3D asset 生成ではなく、設計制約、複数の downstream 制作物、専門職レビューへつながる制作 stack として AI を提示している。

## why_relevant_to_games

ゲーム feature の着想を lore・economy・quest・asset 制作へ一貫して伝播させる場面と、AI 出力を人間の tech-art review 前まで運ぶ境界設計の収集資料になる。

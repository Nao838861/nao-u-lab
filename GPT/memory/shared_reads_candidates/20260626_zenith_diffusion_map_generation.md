---
title: "Zenith: Diffusion Model-Driven Map Generation"
url: "https://schedule.gdconf.com/session/zenith-diffusion-model-driven-map-generation/914450"
collected_at: "2026-06-26T03:44:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-tools, map-generation, diffusion-models, technical-art, production-workflow]
evaluated_at: "2026-07-21T20:35:43+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-21T20:35:43+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-60ad688d6ffcaf25; terminal:memory/shared_reads_candidates/20260609_zenith_diffusion_map_generation.md: https://schedule.gdconf.com/session/zenith-diffusion-model-driven-map-generation/914450; GDC abstract only; missing model details evaluation and failure cases; memory/shared_reads_candidates/20260626_zenith_diffusion_map_generation.md: https://schedule.gdconf.com/session/zenith-diffusion-model-driven-map-generation/914450; same work and same abstract evidence; no independent production data; reason:2候補は同じ GDC session URL と同じ講演概要を重複採録しており独立資料差がない。いずれもモデル詳細、出力比較、artist feedback、失敗条件がなく CoopEval 水準の概要を根拠付きで作れないため duplicate group として閉じる。"
next_action: none
stale_after: "2026-08-20"
supersedes: []
gate_reason: >-
  同一 GDC session URL の sibling と内容が重複し、独立資料として残す差分がない。
  モデル構成、出力比較、artist feedback、失敗条件も欠けており、2候補を合わせても
  CoopEval 水準の概要を根拠付きで構成できない。
---

## raw_excerpt

GDC 2026 の Machine Learning Summit 講演。登壇者は Blizzard Entertainment の Zhen Zhai。対象は "Zenith" と呼ばれる、3D environments から multi-layered top-down maps を作る production tool の紹介。GDC session abstract では、procedural geometry extraction と multi-encoder ControlNet architecture を組み合わせ、walkable areas と line art / shadows / highlights などの stylized layers を生成すると説明している。入力条件として depth、normals、detail conditioning を使い、複数の diffusion models を統合することで、大規模 training dataset を要求せずに visual consistency を保つ狙いがある。

Takeaway では、procedural geometry processing と fine-tuned ControlNet models を組み合わせ、3D 環境から stylized top-down maps を生成する流れ、limited data で高品質出力を出す training strategy、multi-modal conditioning、production workflow への組み込み、artist feedback から得た practical lessons が扱われる。対象 audience は technical artists、tool developers、software engineers、graphics engineers、applied scientists、machine learning engineers。

## why_relevant_to_games

3D 空間から 2D マップ/UI 用レイヤーを作る制作支援の題材。探索型プロトタイプやステージ設計で、walkable area、見取り図、ハイライト、影、注目経路を自動抽出する tool pipeline の参考になりそう。

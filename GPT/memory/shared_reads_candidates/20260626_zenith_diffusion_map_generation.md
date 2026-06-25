---
title: "Zenith: Diffusion Model-Driven Map Generation"
url: "https://schedule.gdconf.com/session/zenith-diffusion-model-driven-map-generation/914450"
collected_at: "2026-06-26T03:44:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-tools, map-generation, diffusion-models, technical-art, production-workflow]
evaluated_at: "2026-06-26T03:50:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-26T03:50:54+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-26T03:50:54+09:00"
next_action: revise_or_research
stale_after: "2026-07-26"
supersedes: []
gate_reason: >-
  制作適用性は高く、3D 環境から walkable area と地図用 stylized layers を作る発想は
  探索型プロトタイプの道具化に直結する。ただし現候補は GDC セッション概要ベースで、
  実際の出力例、評価、artist feedback の具体、失敗条件が不足しており、CoopEval 水準の
  4000 字概要を信頼して書くには根拠が薄い。
---

## raw_excerpt

GDC 2026 の Machine Learning Summit 講演。登壇者は Blizzard Entertainment の Zhen Zhai。対象は "Zenith" と呼ばれる、3D environments から multi-layered top-down maps を作る production tool の紹介。GDC session abstract では、procedural geometry extraction と multi-encoder ControlNet architecture を組み合わせ、walkable areas と line art / shadows / highlights などの stylized layers を生成すると説明している。入力条件として depth、normals、detail conditioning を使い、複数の diffusion models を統合することで、大規模 training dataset を要求せずに visual consistency を保つ狙いがある。

Takeaway では、procedural geometry processing と fine-tuned ControlNet models を組み合わせ、3D 環境から stylized top-down maps を生成する流れ、limited data で高品質出力を出す training strategy、multi-modal conditioning、production workflow への組み込み、artist feedback から得た practical lessons が扱われる。対象 audience は technical artists、tool developers、software engineers、graphics engineers、applied scientists、machine learning engineers。

## why_relevant_to_games

3D 空間から 2D マップ/UI 用レイヤーを作る制作支援の題材。探索型プロトタイプやステージ設計で、walkable area、見取り図、ハイライト、影、注目経路を自動抽出する tool pipeline の参考になりそう。

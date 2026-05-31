---
title: "Procedural Generation of 3D Maps with Snappable Meshes"
url: https://arxiv.org/abs/2108.00056
collected_at: 2026-05-15T15:15:12+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, level-design, prototyping, unity]
evaluated_at: 2026-05-15T15:19:33+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T15:27:00+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: >-
  問題設定は 3D level design の PCG を designer control と navigability feedback に戻すこと、
  手法は snappable mesh piece と connector/visual constraint による composition として明確。
  小型プロトタイプの部屋・地形パーツ生成へ直接転用でき、~4000字の概要に耐える。
suggested_post_outline:
  overview_angle: "完全自動生成ではなく、手作り 3D パーツを constraint で組む designer-centric PCG として整理する"
  analysis_axis: "mesh piece、connector、visual constraint、piece selection、Unity prototype/case study の役割分担"
  application_target: "小規模ゲームの部屋・通路・地形セットを、手作り資産 + 制約探索 + 即時確認の制作サイクルにする"
  pros_cons: "メリットは制御可能性とプロトタイピング速度。デメリットはパーツ準備コストと制約設計の詰まりやすさ"
  verdict_pre: "部分採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778826283429469"
next_action: none
posted:
  ts: "1778826283.429469"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778826283429469"
  char_count: 3492
  posted_at: "2026-05-15T15:27:00+09:00"

---

## raw_excerpt
原文要旨の要点メモ。既製の 3D mesh piece を、designer が指定した visual constraint / connector に従って接続し、3D map を procedural に生成する手法。grid や固定サイズに縛られず、見た目・雰囲気・通行可能性に対して designer control と immediate feedback を与えることを狙う。Unity prototype による実装と case study があり、multiplayer game への利用例、parameterization、piece selection method の違いを扱う。著者らは、この手法を designer-centric map composition method としても、3D level design の prototyping system としても使えるとしている。

## why_relevant_to_games
小規模プロトタイプでも「手作りの部屋/地形パーツを constraint でつなぐ」発想は使える。ランダム生成を完全自動化せず、デザイナーが制約を持つ PCG として見る候補。

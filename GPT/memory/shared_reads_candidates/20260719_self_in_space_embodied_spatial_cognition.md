---
title: "Self in Space: Benchmarking Self-Awareness and Spatial Cognition in UAV Embodied Intelligence"
url: "https://arxiv.org/abs/2607.12477"
collected_at: "2026-07-19T12:45:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [embodied-agent, spatial-cognition, multimodal, navigation, evaluation]
evaluated_at: "2026-07-19T12:49:26+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-19T12:49:26+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-19T12:49:26+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-18"
supersedes: []
gate_reason: >-
  space/self と perception/memory/reasoning の直交する評価枠、実世界 UAV video 由来の規模、
  motion-aware representation の介入と下流 decision-making まで揃い、重要要素を具体的に説明できる。
  3D ゲームの自動テスターで環境認識と自機状態推定を分離して測る navigation harness に直接適用できる。
suggested_post_outline:
  overview_angle: "embodied agent の空間能力を周囲の認識だけでなく、自機の位置・運動・履歴を含む self-in-space として測る軸"
  analysis_axis: "space/self × perception/memory/reasoning の評価格子、SIS-Bench のデータ構成、motion-aware representation の介入効果"
  application_target: "一人称・三人称 3D prototype の自動テスターで、物体認識、自機姿勢、移動履歴、経路判断を別々に計測する navigation harness"
  pros_cons: "利点は失敗を環境認識と自己状態推定に切り分けられること。弱点は UAV video の受動視覚評価をゲーム内の能動操作へ移す際に追加設計が要ること。"
  verdict_pre: "部分採用。まず navigation test に self-state の perception/memory 指標を追加する。"
---

## raw_excerpt

arXiv 要旨からの一次情報メモ。既存の UAV 向け multimodal large language model と benchmark は、周囲の空間理解を中心に扱い、動いている agent 自身の位置・運動・状態を一貫して表現する self-awareness は暗黙のままになっている。SIS-Bench はこれを self-in-space という統一問題として扱い、評価軸を space と self の二つ、認知段階を perception・memory・reasoning の三層に分ける。データは 1,646 本の実世界 UAV video から task-conditioned pipeline と専門家確認を経て作られ、13 task・4,856 question-answer pair を含む。現行 MLLM の評価では、spatial cognition と self-awareness の間に不均衡があり、認知段階が上がるほど性能が低下した。追加実験では optical flow と visual feature fusion により agent 自身の動きを表す motion-aware representation を導入し、space と self の双方で perception・memory が改善し、下流の UAV decision-making にも一般化したと報告する。

## why_relevant_to_games

一人称・三人称 3D ゲームの自動テスターで、周囲の物体認識と、自機位置・向き・移動履歴の保持を分けて測る navigation harness を設計する場面に接続できる。

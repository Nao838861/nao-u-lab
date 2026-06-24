---
title: "Quality Audio Prototyping: a prototype system for unified sound retrieval and procedural generation"
url: "https://arxiv.org/abs/2606.00629"
collected_at: "2026-06-19T04:08:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-audio, procedural-audio, tools, prototyping, feedback]
evaluated_at: "2026-06-19T04:31:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-19T04:31:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-19T04:31:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-19"
supersedes: []
gate_reason: |-
  音探索と procedural synthesis を統合する着想はゲーム制作へ使えるが、candidate 本文だけでは評価の中身が薄い。
  4000字級の概要にするには、実際の interface、モデル構成、ユーザー評価の詳細を追加確認したい。
---

## raw_excerpt

arXiv:2606.00629。Nelly Garcia ほか。2026-05-30 投稿。QuAP は、効果音制作で library search と procedural synthesis が分断されている問題を扱う prototype system。制作時には、既存音源を探す作業は時間がかかり、procedural synthesis は専門知識が必要で、ゲームの narrative concept から実際の sonic realisation まで距離がある、という前提。

提案システムは content-based audio retrieval と real-time procedural audio models を同じ interface にまとめる。さらに rule-based assistant が、知覚に基づく parameter guidance を出し、合成モデルの定義や推奨値を説明する。要旨では、6 つの embedded synthesis models のうち 5 つで主観評価上の品質改善が統計的に確認され、16 名の practitioner による user evaluation では、全参加者が parameter assistant は creative agency を保ったまま procedural interaction の障壁を下げたと答えた、とされる。

ゲーム制作では、音を最後に素材として貼るのではなく、操作・衝突・状態変化に応じて変化する feedback として扱う必要がある。QuAP は、音源検索と手続き的変化を同じ作業面で扱うため、短時間プロトタイプでも「当たった」「避けた」「溜めた」「壊した」の手触りを音で試す候補になる。

## why_relevant_to_games

短時間ゲーム制作で音を後回しにせず、操作 feedback と procedural variation を早く試すための道具候補。shot_log / graze 系の快感フィードバック設計に効く。

---
title: "Integrating Player-Centric Procedural Content Generation in a Human Testing Environment"
url: "https://www.cs.utah.edu/docs/techreports/2025/UUCS-25-002.pdf"
collected_at: "2026-06-10T05:44:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, player-modeling, playtesting, personalization]
evaluated_at: "2026-06-10T05:49:01+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-10T05:49:01+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-10T05:49:01+09:00"
next_action: revise_or_research
stale_after: "2026-07-10"
supersedes: []
gate_reason: |-
  PCPCG、疎な嗜好フィードバック、複数 SVM、Pac-Man 風レベル特徴という手法要素は具体的に抽出できる。
  ただし現 candidate の範囲では、楽しさの差が有意でないことへの解釈、失敗要因、実制作へ移す際の設計条件が薄い。
  投稿水準にするには本文から実験設計と限界を追加確認し、PCG/telemetry feedback loop 既存候補との差別化が必要。
---

## raw_excerpt

著者は、player-centric procedural content generation (PCPCG) を人間プレイヤーで試すため、Pac-Man 風環境で複数の SVM を使い、プレイ中に得た疎な嗜好データから次のレベル生成へ反映する実験を行っている。PDF の要旨では、PCPCG が "on-the-fly, sparse data collection" に基づいてプレイヤーから学び、後続の playthrough を嗜好に合わせることを狙うと説明される。実験は、ランダム生成の 30 分プレイ群と、複数 SVM による PCPCG 生成の 30 分プレイ群を比較し、楽しさの差は正方向だが統計的には有意でなかったと報告する。一方で、多くのプレイヤーは、さらに refine され他ジャンルへ実装されれば有用になりうると見ていた。

関連箇所では、PCG と dynamic game balancing の違い、online adaptation、プレイヤーの level preference を Likert scale やレベル後アンケートで取る設計、pellet arrangement / power pellet density / fruit spawn frequency などの可変特徴を扱うことが述べられている。単に「AI でレベルを作る」ではなく、プレイヤー嗜好をリアルタイムの生成制約へ戻す小規模な実験として読める。

## why_relevant_to_games

Nao_u_BOT の小型プロトタイプで、プレイヤーの明示/暗黙フィードバックを次ステージ生成や難度調整へ戻す probe を作る時の参照候補。統計的に強い成果かどうかは Phase 2 で判断する。

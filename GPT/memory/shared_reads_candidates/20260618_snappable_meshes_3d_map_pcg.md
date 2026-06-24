---
title: "Procedural Generation of 3D Maps with Snappable Meshes"
url: "https://arxiv.org/abs/2108.00056"
collected_at: "2026-06-18T11:44:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, level-design, 3d-map, tools, prototyping]
evaluated_at: "2026-06-18T11:47:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781751066.262309"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781751066262309"
  char_count: 3514
  posted_at: "2026-06-18T11:51:25+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-18T11:51:25+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781751066262309"
next_action: none
stale_after: "2026-07-18"
supersedes: []
gate_reason: |-
  問題設定、手法の中核、Unity prototype、case study、制作者向け制約と navigability feedback が揃っており、概要を厚く書ける。
  3D/疑似3D ステージ制作で「完全自動生成」ではなく作者制約つき prototype tool として具体的に適用できる。
suggested_post_outline:
  overview_angle: "snappable mesh を、PCG アルゴリズムではなく制作者が制約を与える 3D level prototyping workflow として説明する。"
  analysis_axis: "visual constraints、接続可能性、piece selection、navigability feedback、Unity prototype と case study の関係を見る。"
  application_target: "短期プロトタイプの 3D/疑似3D map 制作、探索導線の試作、手作業 asset と procedural assembly の中間設計。"
  pros_cons: "利点は見た目の統制と反復速度。弱点は mesh library 整備と制約設計の初期コスト、生成結果の単調化リスク。"
  verdict_pre: "部分採用。ゲーム全体の自動生成ではなく、部屋・通路・高低差の試作用 tool pattern として使う。"
---

## raw_excerpt
原文短引用: "designer-specified visual constraints"

arXiv abstract によると、この論文は premade meshes を snap 接続して 3D map を手続き生成する技法を提案する。接続は designer が指定した visual constraints に基づき、生成サイズや layout の制限を避けつつ、look and feel の制御と navigability の即時 feedback を与える。Unity prototype と複数 case study があり、multiplayer game での利用例と parameterization / piece selection method の例を含む。非専門家でも扱いやすい designer-centric map composition method と、3D level design の prototyping system として使える、という位置づけ。

## why_relevant_to_games
3D/疑似3D のステージ制作で、完全自動生成ではなく「作者の見た目制約 + ナビゲーション確認」を同時に扱う設計候補になる。

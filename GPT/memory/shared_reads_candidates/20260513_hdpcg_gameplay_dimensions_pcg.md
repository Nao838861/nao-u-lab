---
title: High Dimensional Procedural Content Generation
url: https://arxiv.org/abs/2602.18943
collected_at: 2026-05-13T00:02:14+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [procedural-generation, level-design, mechanics, validation, game-design]
evaluated_at: 2026-05-13T00:18:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-13T00:23:53.8139214+09:00"
last_decision: posted
stale_after: "2026-06-12"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778599414224349"
posted:
  ts: "1778599414.224349"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778599414224349"
  char_count: 4468
  posted_at: "2026-05-13T00:23:53.8139214+09:00"
next_action: none
gate_reason: >
  geometry だけでなく gravity inversion や time dynamics などの gameplay dimension を state space に入れる着想が強い。
  playability / structure / style / robustness / efficiency の評価軸もあり、Nao_u の小規模ゲームの生成・検証観点へ直接落とせる。
suggested_post_outline:
  overview_angle: "PCG を地形生成ではなく、メカニクスを座標として持つ探索・検証問題に拡張する論文として説明する"
  analysis_axis: "Direction-Space、Direction-Time、abstract skeleton generation、controlled grounding、high-dimensional validation"
  application_target: "重力反転、時間変化、並行世界切替などを含むレベル生成と、面白い仕掛けの自動検証"
  pros_cons: "メリットはメカニクス込みの到達可能性を扱える点。デメリットは問題定式化が重く、即席プロトタイプには検証コストが高い点。"
  verdict_pre: "部分採用"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。High Dimensional Procedural Content Generation は、従来の PCG が主に 2D/3D geometry を扱い、gameplay mechanics を補助的に扱ってきた点を問題設定にしている。提案は、非幾何学的な gameplay dimension を joint state space の first-class coordinates として扱う HDPCG。

具体方向は二つ。Direction-Space は geometry に discrete layer dimension を加え、(x,y,z,l) の 4D reachability を検証することで、gravity inversion や parallel-world switching のような 2.5D/3.5D mechanic を統一的に扱う。Direction-Time は time-expanded graphs により temporal dynamics、action semantics、conflict rules を扱う。各方向で、abstract skeleton generation、controlled grounding、high-dimensional validation、multi-metric evaluation の pipeline を共有し、playability / structure / style / robustness / efficiency で評価する。Unity-based case studies も含む。

短い原文句: "gameplay mechanics as auxiliary" / "first-class coordinates" / "time-expanded graphs"

## why_relevant_to_games
レベル生成を地形だけでなく、重力反転・時間変化・切替世界などのメカニクス込みで検証する観点を提供する。Nao_u の小型ゲームで「面白い仕掛け」を生成・検査する時の候補材料。

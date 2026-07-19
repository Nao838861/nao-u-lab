---
title: "High Dimensional Procedural Content Generation"
url: "https://arxiv.org/abs/2602.18943"
collected_at: "2026-06-04T03:07:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [pcg, mechanics, level-design, verification, temporal-design]
evaluated_at: "2026-06-04T04:31:55+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T12:48:53+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-1a4859d27061b35d; terminal:memory/shared_reads_candidates/20260513_hdpcg_gameplay_dimensions_pcg.md: posted:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778599414224349; reason:同一 canonical URL の posted sibling があり permalink まで確認できるため open sibling を再投稿対象から閉じる"
next_action: none
postpone_reason: "Phase 3 重複確認。同一 URL は 2026-05-13 に #shared-reads 投稿済みのため再投稿しない。"
duplicate_of:
  candidate: "memory/shared_reads_candidates/20260513_hdpcg_gameplay_dimensions_pcg.md"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778599414224349"
  ts: "1778599414.224349"
stale_after: "2026-07-04"
supersedes: []
gate_reason: >-
  geometry 以外の mechanic、time、layer、locomotion mode を state dimension として
  PCG に組み込む主張が明確で、validation と multi-metric evaluation まで含む。
  パズルやアクションの設計で地形先行の弱点を避ける観点として具体的に使える。
suggested_post_outline:
  overview_angle: "level を 2D/3D 地形ではなく、mechanic/time/layer を含む高次元 state space として生成する軸"
  analysis_axis: "Direction-Space、Direction-Time、abstract skeleton、controlled grounding、high-dimensional validation"
  application_target: "重力反転、時間、レイヤー切替、移動モードを持つ prototype の設計と到達可能性検証"
  pros_cons: "利点は mechanic を後付けせず検証可能にできる点。弱点は設計空間と評価指標が増え実装負荷が高い点。"
  verdict_pre: "部分採用。高次元化の考え方を設計メモと検証軸に使う。"
---

## raw_excerpt
短い原文抜粋: "non-geometric gameplay dimensions to first-class coordinates" / "controllable, verifiable, and extensible level generation"。

arXiv 2026-02-21 submitted。PCG が静的な 2D/3D geometry の生成には進んできた一方、gameplay mechanics を補助的に扱い、空間だけを最適化しがちな問題を起点にする。High-Dimensional PCG は、time、layer、locomotion mode などの non-geometric gameplay dimensions を joint state space の座標として扱う。Direction-Space は discrete layer dimension を加え 4D reachability を検証し、gravity inversion や parallel-world switching のような 2.5D/3.5D mechanics を統一的に扱う。Direction-Time は time-expanded graphs で temporal dynamics、action semantics、conflict rules を捉える。pipeline は abstract skeleton generation、controlled grounding、high-dimensional validation、multi-metric evaluation。Unity case studies で playable scenarios を示す。

## why_relevant_to_games
「地形を作ってから mechanic を後付けで検査する」流れを避け、重力反転・時間・レイヤー切替などを最初から state dimension として設計する候補。パズルやアクション prototype に効く。

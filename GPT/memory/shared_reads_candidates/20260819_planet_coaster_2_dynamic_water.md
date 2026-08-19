---
title: "Deep Dive: Crafting detailed and dynamic water in Planet Coaster 2"
url: "https://www.gamedeveloper.com/programming/deep-dive-crafting-detailed-and-dynamic-water-in-planet-coaster-2"
collected_at: "2026-08-19T18:31:57+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, rendering, simulation, technical-art, water]
evaluated_at: "2026-08-19T18:36:37+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-19T18:36:37+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-19T18:36:37+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-18"
supersedes: []
gate_reason: >-
  一次資料から、問題設定、距離適応 mesh、GPU 上の shallow-water simulation、CPU/SIMD の
  hydrostatic pipe model、各方式を分けた性能・gameplay 上の理由まで具体的に抽出できる。
  見た目・局所反応・gameplay authority を別 subsystem に割り当てる設計は制作へ直接適用でき、約4000字の深い分析に耐える。
suggested_post_outline:
  overview_angle: "万能な水 simulation を求めず、知覚距離・相互作用の尺度・gameplay authority ごとに三つの水 system を組み合わせた設計として解説する"
  analysis_axis: "mesh detail、GPU surface fluid、CPU wave model の責務分割と、5倍速・自由形状 pool・数千 guest を両立する計算配置"
  application_target: "環境表現 prototype で、見た目の fidelity、局所的な反応、gameplay に影響する状態を別層に分け、各層の更新頻度と authority を決める設計"
  pros_cons: "長所は用途ごとに必要十分な model を選べる性能・安定性・反復性。短所は複数 simulation の整合、境界条件、platform 別 GPU/CPU budget の検証が増えること"
  verdict_pre: 部分採用
---

## raw_excerpt

原文の短い抜粋: “Try simple approaches first.”

Frontier Developments の render programmer John Wigg が、『Planet Coaster 2』の water park 向け水面を、複数の役割を分けた system として説明している。近接視点でも平面に見えないよう、camera 距離に応じて water mesh を細分化し、画面内の geometry 量をおおむね一定に保ちながら centimeter scale まで表面を変位させる。水面を横切る camera では、pixel position を world coordinate に変換し、水面までの垂直距離を低解像度 texture に記録して threshold 処理することで split-shot の water line を描く。

guest や collider が水面と交差すると、GPU texture 上の grid に displacement と object velocity を initial condition として与える。pool surface の ripple、flow、vortex、foam には 2D fluid simulation を使い、semi-Lagrangian shallow-water equations、Crank–Nicolson integration、preconditioned conjugate-gradient solver を compute shader で実行する。さらに wave pool や shoreline には、用途を絞った別の簡易 wave simulation を組み合わせる。free-form pool、数千人規模の guest、最大 5 倍速の game speed、first-person camera という条件に対し、詳細描画・反応的流体・簡易波を一つの万能解へ押し込まず、それぞれの強みを接続した構成である。

## why_relevant_to_games

見た目の fidelity、gameplay object への反応、計算量の異なる要件を subsystem に分け、複雑な simulation と簡易表現を併用する実装例として、環境表現や technical prototype の設計に使える。

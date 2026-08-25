---
title: "GDC 2026: Advanced Shader Delivery on Windows"
url: "https://developer.microsoft.com/en-us/games/articles/2026/03/gdc-2026-advanced-shader-delivery-on-windows"
collected_at: "2026-08-26T05:49:25+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-dev, rendering, shaders, performance, pc-gaming, pipeline]
evaluated_at: "2026-08-26T05:53:17+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-26T05:53:17+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-26T05:53:17+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-25"
supersedes: []
gate_reason: |-
  runtime shader compilation と PC の hardware 多様性という問題から、SODB 収集、構成別 PSDB の offline compile / 配布、cache hit 観測、partial graphics programs まで一続きの手法を抽出できる。
  MonoSH を含む PC build の shader stutter 対策と QA pipeline へ具体的に接続でき、定量 benchmark がない点を限界として明示すれば約4000字の独立した概要に耐える。
suggested_post_outline:
  overview_angle: "shader stutter を runtime 最適化ではなく、収集・構成別コンパイル・配布・観測の supply chain として解く"
  analysis_axis: "SODB と PSDB の責務分離、hardware 多様性への対応、cache hit の検証可能性、partial graphics programs の適用条件"
  application_target: "MonoSH など PC 向け build の shader warmup 設計、端末別 QA、performance regression の観測項目"
  pros_cons: "実行時コンパイルを減らし検証可能にできる一方、SODB 網羅性、hardware 別 artifact 管理、platform / toolchain 依存が増える"
  verdict_pre: "部分採用"
---

## raw_excerpt

Microsoft Game Dev の GDC 2026 記事は、D3D12 ゲームで runtime shader compilation が長い compile 待ちと frame stutter を生む一方、PC では GPU と driver の組合せが固定されず、単一の precompiled shader 群を全環境へ配れないという問題を扱う。Advanced Shader Delivery では、開発側が title の実行を trace するか programmatically に State Object Database（SODB）を生成し、offline compiler で hardware 構成別の Precompiled Shader Database（PSDB）へ変換して配布する。AgilitySDK 1.619 の App Identity API は、D3D12 device 作成前に application descriptor と GUID を登録し、SODB を title に結び付ける。Stats API は特定構成での PSDB cache hit rate を返し、May 2026 版 PIX はそれを System Monitor の real-time counter として表示する予定とされる。PSO 数が多く engine が全列挙できない title については、共通状態を pre-rasterization program と pixel shader program に分割し、他の state と runtime link する partial graphics programs を準備している。記事の call to action は、engine への SODB collection 統合と、game package と一緒に Xbox Partner Center へ SODB を提出することの二段階である。

## why_relevant_to_games

PC 向けゲームの shader stutter を、実行時の局所対策ではなく「状態収集→hardware 別 offline compile→配布→cache hit 可視化」という制作・検証 pipeline として追える資料。rendering 負荷の異なる端末を跨ぐ build / QA 設計を調べる場面に接続できる。

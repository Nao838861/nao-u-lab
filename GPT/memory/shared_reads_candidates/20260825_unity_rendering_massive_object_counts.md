---
title: "Rendering at scale: Efficient strategies for massive object counts"
url: "https://unity.com/blog/rendering-at-scale-efficient-strategies-for-massive-object-counts"
collected_at: "2026-08-25T21:19:36+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-engineering, rendering, performance, unity, optimization, postmortem]
evaluated_at: "2026-08-25T21:24:01+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787661281.063809"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787661281063809"
  char_count: 4465
  posted_at: "2026-08-25T21:34:44.8335168+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-25T21:34:44.8335168+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787661281063809"
next_action: none
stale_after: "2026-09-24"
supersedes: []
gate_reason: >-
  profile で CPU/GPU bottleneck を切り分け、static batching、instancing、VAT、Update 集約を対象別に選ぶ中核と、
  animation・collision・memory の代償を実制作例から説明できる。大量 object prototype の計測→手段選択→再計測へ直接適用でき、
  単なる tips 集ではなく CoopEval 水準の比較軸を持つ概要に展開できる。
suggested_post_outline:
  overview_angle: "大量 object 最適化を万能テクニック集ではなく、bottleneck と対象特性から手段を選ぶ診断表として読む"
  analysis_axis: "CPU/GPU の負荷移送、stationary/repeated/animated object の分類、描画性能と collision・memory・制作速度の trade-off"
  application_target: "Log_cdx の大量敵・草・群衆 prototype で profiler baseline を取り、object 分類ごとに batching、instancing、VAT、Update 集約を小さく比較する"
  pros_cons: "数千体規模まで描画余地を広げられる一方、VAT は memory と shader 複雑性を増やし、動的 collider や個別 animation の自由度を失う"
  verdict_pre: "部分採用"
---

## raw_excerpt
Mega Cat Studios lead developer Matthew Wojtechko が、『Backyard Baseball 2026』で大量 object を扱った描画最適化を解説する記事。最初に CPU bound と GPU bound のどちらかを profile し、重い処理を特定してから手段を選ぶ。stationary mesh には occlusion culling と static batching、同一 mesh を多数置く foliage には GPU instancing を使い、shader parameter で色などの variation を渡す。通常の skinned mesh と Animator では数十体で性能が落ちる場面に対し、vertex animation texture と GPU instancing の組合せで数千の animated entity を描画できたと説明する。

VAT は各 vertex の position・rotation を texture に encode し shader 側で読むため、CPU 負荷を GPU と memory 側へ移す。草の揺れには使える一方、collider は動かないため正確な collision が必要な対象には向かない。URP は mobile・untethered device 向けの基礎性能を優先し、HDRP は高 fidelity が必要な場合に限定するという選択も示す。描画以外では、多数の MonoBehaviour Update を一つへ統合する、Job System・Burst・cache を検討する、shader・script・version control 上で重複 texture reference を作らない、といった対策を挙げる。制作速度を止めるほど早期に締め付けず、後期に shader・asset・script を監査する役割も紹介されている。

## why_relevant_to_games
大量敵・草・群衆を扱う prototype で、profile 結果から batching、instancing、VAT、code 側集約を選び、見た目・collision・memory の trade-off を記録する際の資料になる。

---
title: "Rendering at scale: Efficient strategies for massive object counts"
url: "https://unity.com/blog/rendering-at-scale-efficient-strategies-for-massive-object-counts"
collected_at: "2026-08-25T21:19:36+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-engineering, rendering, performance, unity, optimization, postmortem]
---

## raw_excerpt
Mega Cat Studios lead developer Matthew Wojtechko が、『Backyard Baseball 2026』で大量 object を扱った描画最適化を解説する記事。最初に CPU bound と GPU bound のどちらかを profile し、重い処理を特定してから手段を選ぶ。stationary mesh には occlusion culling と static batching、同一 mesh を多数置く foliage には GPU instancing を使い、shader parameter で色などの variation を渡す。通常の skinned mesh と Animator では数十体で性能が落ちる場面に対し、vertex animation texture と GPU instancing の組合せで数千の animated entity を描画できたと説明する。

VAT は各 vertex の position・rotation を texture に encode し shader 側で読むため、CPU 負荷を GPU と memory 側へ移す。草の揺れには使える一方、collider は動かないため正確な collision が必要な対象には向かない。URP は mobile・untethered device 向けの基礎性能を優先し、HDRP は高 fidelity が必要な場合に限定するという選択も示す。描画以外では、多数の MonoBehaviour Update を一つへ統合する、Job System・Burst・cache を検討する、shader・script・version control 上で重複 texture reference を作らない、といった対策を挙げる。制作速度を止めるほど早期に締め付けず、後期に shader・asset・script を監査する役割も紹介されている。

## why_relevant_to_games
大量敵・草・群衆を扱う prototype で、profile 結果から batching、instancing、VAT、code 側集約を選び、見た目・collision・memory の trade-off を記録する際の資料になる。

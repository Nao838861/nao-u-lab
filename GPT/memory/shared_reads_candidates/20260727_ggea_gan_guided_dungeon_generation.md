---
title: "A hybrid evolutionary framework for procedural dungeon generation using GAN-based spatial priors"
url: "https://doi.org/10.1016/j.asoc.2026.115962"
collected_at: "2026-07-27T04:47:11.6071047+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, dungeon-generation, evolutionary-computation, level-design]
---

## raw_excerpt

一次情報の abstract と section snippets を日本語で採録する（逐語引用ではない）。Search-Based Procedural Content Generation は、制約や複数の設計指標を明示的に最適化できる一方、高次元の空間表現を直接探索すると、実行不能な候補の評価に計算を費やし、収束も遅くなる。GAN による生成は既存ダンジョンの大域的な構造傾向を学べるが、直接 sampling するだけでは、接続可能性、進行順、幾何制約を細かく制御しにくい。著者らの GAN-Guided Evolutionary Algorithm（GGEA）は、この二つを三段階で組み合わせる。まず学習済み GAN の出力から連続的な artificial potential field と topological skeleton を作り、探索を構造的にもっともらしい領域へ誘導する。次に、主要 traversal path に沿って重要 room を置く skeleton-based parametric encoding により、room/corridor の位相を保ちながら局所形状を動かす。最後に Feasible-Infeasible Two-Population を用い、infeasible 集団は制約違反を減らして有効配置へ戻し、feasible 集団は potential-field alignment、coverage fidelity、geometric symmetry、experience novelty をまとめた fitness を高める。実験では、同一 protocol の GAN-LVE と Cartesian EA より外部評価が高く、Cartesian-based evolutionary search より速く収束し、expressive range も広いと報告されている。

## why_relevant_to_games

ダンジョン生成で「学習済み prior による大域形状」「進行を保つ skeleton」「実行可能性を回復する探索」を分離しており、生成レベルの制御性・多様性・playabilityを同時に検証する設計材料になる。

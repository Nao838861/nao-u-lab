---
title: "KernelArc: A Multi-Agent Framework for GPU Kernel Optimization"
url: "https://arxiv.org/abs/2608.17071"
collected_at: "2026-08-24T05:29:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, multi-agent, evaluation, optimization, game-development]
---

## raw_excerpt

abstract の採録メモ: KernelArc は、異なる種類の GPU workload を自律的に最適化する multi-agent framework である。戦略ごとに専門化した agent を並列に走らせ、agent 間では結論だけを共有する memory、候補の性能を同一条件で測る deterministic benchmark guard、他 agent の状態を変更できない read-only cross-agent state、改善が頭打ちになった時だけ新案を作る plateau-triggered drafting を組み合わせる。NVIDIA H100 / B200 上の SOL-ExecBench で、BF16 GEMM、cuBLASLt の設定表、Mixture-of-Experts backward の fusion、shape に応じた decoder-layer fusion、NVFP4 grouped-query attention、paged prefill attention を対象にした。2026-07-30 時点の公開 leaderboard snapshot では、代表的な L1、L2、Quantization、FlashInfer task で首位になったと報告する。trajectory からは、固定された candidate budget の中で複数 agent による探索が探索範囲を広げ、より強い incumbent に到達しうる一方、個々の協調機構の寄与は kernel と最適化段階によって変わるとしている。

## why_relevant_to_games

ゲーム案・敵配置・parameter tuning を複数の探索戦略で並列生成し、同じ headless benchmark と候補予算で比較する制作 harness の参考になりうる。

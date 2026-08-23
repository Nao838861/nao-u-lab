---
title: "KernelArc: A Multi-Agent Framework for GPU Kernel Optimization"
url: "https://arxiv.org/abs/2608.17071"
collected_at: "2026-08-24T05:29:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, multi-agent, evaluation, optimization, game-development]
evaluated_at: "2026-08-24T05:33:29+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1787517641.584509"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787517641584509"
  char_count: 4386
  posted_at: "2026-08-24T05:40:53+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-24T05:40:53+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787517641584509"
next_action: none
stale_after: "2026-09-23"
supersedes: []
gate_reason: >-
  GPU 最適化を単一 agent の試行錯誤ではなく、戦略別並列探索、結論 memory、決定論的 benchmark、read-only 状態共有、停滞時だけの新案生成として分解しており、手法の中核を抽出できる。
  6 種の workload と H100 / B200 上の評価、機構ごとの寄与が段階依存という限界まであり、固定予算のゲーム案探索・headless 評価へ具体的に移せるため、CoopEval 水準の分析を構成できる。
suggested_post_outline:
  overview_angle: "探索戦略を並列化しつつ、候補予算・共有情報・評価条件を固定して最適化を前進させる設計として解説する"
  analysis_axis: "多様性を生む分業と、結論 memory・read-only state・deterministic guard が探索汚染を抑える仕組みを分けて評価する"
  application_target: "ゲーム案、敵配置、パラメータ調整を複数戦略で生成し、同一 headless benchmark と固定 candidate budget で比較する制作 harness"
  pros_cons: "探索範囲と再現性を両立しやすい一方、agent 数だけで改善する保証はなく、評価関数の偏りと計算費用が結果を支配する"
  verdict_pre: "部分採用"
---

## raw_excerpt

abstract の採録メモ: KernelArc は、異なる種類の GPU workload を自律的に最適化する multi-agent framework である。戦略ごとに専門化した agent を並列に走らせ、agent 間では結論だけを共有する memory、候補の性能を同一条件で測る deterministic benchmark guard、他 agent の状態を変更できない read-only cross-agent state、改善が頭打ちになった時だけ新案を作る plateau-triggered drafting を組み合わせる。NVIDIA H100 / B200 上の SOL-ExecBench で、BF16 GEMM、cuBLASLt の設定表、Mixture-of-Experts backward の fusion、shape に応じた decoder-layer fusion、NVFP4 grouped-query attention、paged prefill attention を対象にした。2026-07-30 時点の公開 leaderboard snapshot では、代表的な L1、L2、Quantization、FlashInfer task で首位になったと報告する。trajectory からは、固定された candidate budget の中で複数 agent による探索が探索範囲を広げ、より強い incumbent に到達しうる一方、個々の協調機構の寄与は kernel と最適化段階によって変わるとしている。

## why_relevant_to_games

ゲーム案・敵配置・parameter tuning を複数の探索戦略で並列生成し、同じ headless benchmark と候補予算で比較する制作 harness の参考になりうる。

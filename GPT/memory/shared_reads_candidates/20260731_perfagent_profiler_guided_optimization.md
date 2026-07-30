---
title: "PerfAgent: Profiler-Guided Iterative Refinement for Repository-Level Code Optimization"
url: "https://arxiv.org/abs/2607.19653"
collected_at: "2026-07-31T08:48:37.0325282+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, performance, coding-agents, profiling, verification]
evaluated_at: "2026-07-31T08:53:15+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-31T08:53:15+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-31T08:53:15+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-30"
supersedes: []
gate_reason: >-
  repository-level 最適化の失敗類型、profiler と verifier を結ぶ反復手法、2 benchmark の定量評価が揃い、
  game prototype の性能改善 harness へ具体的に移せるため、CoopEval 水準の概要と独立した分析を構成できる。
suggested_post_outline:
  overview_angle: "correctness だけでは閉じない性能改善を、計測証拠と挙動検証の反復問題として捉える"
  analysis_axis: "best-of-N の試行量ではなく、hotspot 証拠を次の修正へ返す feedback quality が成功率と cost をどう変えるか"
  application_target: "game prototype の frame time・simulation throughput・asset pipeline に対する profile→patch→回帰検証 harness"
  pros_cons: "既存 agent に後付けしやすく定量停止条件を持てる一方、代表 workload・profiler 可観測性・benchmark 過適合に依存する"
  verdict_pre: "部分採用"
---

## raw_excerpt

repository-level の coding agent は issue 修正や feature 実装では成果を上げている一方、既存挙動を保ちながら runtime performance を改善する optimization では、test が通るだけでは不十分になる。抽象化層や native extension の裏にある bottleneck を見逃す、最初の小さな高速化で止まる、edge case を壊す patch を十分に検証しない、といった失敗が残る。PerfAgent は、既存の coding agent に profiler と verifier の feedback loop を加え、timing の増減だけでなく hotspot の証拠を基に次の修正対象を決め、最初の passing patch から反復して改善する workflow を提案する。

評価は repository-level code optimization benchmark の GSO と SWE-fficiency-Lite で行う。OpenHands と GPT-5.1 の組合せに対し、expert の speedup に一致する patch の比率は GSO で 19.6% から 39.2%、SWE-fficiency-Lite で 26% から 74% へ上がったと報告される。さらに、5 回の独立 sampling から最良結果を選ぶ oracle best-of-five baseline を、より低い cost で上回った。論文はこの差を、試行回数の増加ではなく、profiler evidence と検証結果を次の iteration に返す feedback の質によるものとしている。

## why_relevant_to_games

game prototype の frame time、simulation throughput、asset pipeline、headless test の高速化で、agent に「速くして」と任せるのではなく、profile・挙動保持・回帰検証を一つの反復 loop にする制作 harness の候補になる。

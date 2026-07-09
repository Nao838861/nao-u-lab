---
title: "CLQT: A Closed-Loop, Cost-Aware, Strategy-Consistent Benchmark for Diagnostic Evaluation of LLM Portfolio-Management Agents"
url: "https://arxiv.org/abs/2606.29771"
collected_at: "2026-07-09T11:44:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, closed-loop, cost-aware-evaluation, harness, game-testing]
---

## raw_excerpt
arXiv:2606.29771。対象領域は portfolio-management agents だが、問題設定は「closed-loop agent を固定期間の最終成績だけで ranking しても、reasoning の健全性、strategy の一貫性、durable edge は分からない」というもの。市場経路に左右される return だけでは agent capability を証明できず、look-ahead leakage を抑えると apparent alpha が消える場合もある、としている。

CLQT は ranking ではなく diagnosis として評価環境を作る。agent は gather、synthesize、allocate、execute、reflect の five-stage cycle を回し、各 round は DecisionRound として recompute-verifiable hash chain に封入される。基盤には TimeGate、transaction / financing cost modeling、strategy-consistency scoring、three-tier memory、Model-Context-Protocol tool layer、mandate-aware synthesis が含まれる。評価は Coherence、Acuity、Composure、Discipline、Reliability の five-axis scorecard で、process scaffolding を committee of specialized roles と single full-autonomy orchestrator の実験変数として扱う。

## why_relevant_to_games
ゲーム向け headless 評価でも、最終スコアだけでは「たまたま勝った」か「方針が一貫している」かを分けにくい。プレイログを再計算可能な decision trail として残し、成功率・コスト・一貫性・失敗箇所を分けて見る候補になりそう。

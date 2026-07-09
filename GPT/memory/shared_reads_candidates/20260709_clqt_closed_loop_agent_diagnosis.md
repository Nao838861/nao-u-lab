---
title: "CLQT: A Closed-Loop, Cost-Aware, Strategy-Consistent Benchmark for Diagnostic Evaluation of LLM Portfolio-Management Agents"
url: "https://arxiv.org/abs/2606.29771"
collected_at: "2026-07-09T11:44:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, closed-loop, cost-aware-evaluation, harness, game-testing]
evaluated_at: "2026-07-09T11:46:54+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-09T11:46:54+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-09T11:46:54+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  closed-loop agent を最終成績だけで ranking せず、decision trail と strategy consistency で診断する問題設定が明確。
  five-stage cycle、hash chain、TimeGate、cost modeling、five-axis scorecard など手法要素が揃い、評価設計の中身も candidate 本文から抽出できる。
  ゲーム制作では headless playtest の「勝ったか」ではなく、方針一貫性・失敗分類・コスト込み判断を見る harness 設計に直結する。
suggested_post_outline:
  overview_angle: "portfolio benchmark ではなく closed-loop agent の診断設計として読み替え、ゲーム用 playtest harness に転用する"
  analysis_axis: "ranking から diagnosis への転換、recompute-verifiable decision trail、時間漏洩防止、cost-aware scoring、strategy-consistency scorecard"
  application_target: "ゲーム AI/QA agent のプレイログを DecisionRound 化し、勝敗・到達度・資源浪費・方針逸脱を分けて評価する仕組み"
  pros_cons: "再現性と失敗分類が強い一方、金融ドメイン固有の部品はゲーム向けに scorecard と cost model を再設計する必要がある"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2606.29771。対象領域は portfolio-management agents だが、問題設定は「closed-loop agent を固定期間の最終成績だけで ranking しても、reasoning の健全性、strategy の一貫性、durable edge は分からない」というもの。市場経路に左右される return だけでは agent capability を証明できず、look-ahead leakage を抑えると apparent alpha が消える場合もある、としている。

CLQT は ranking ではなく diagnosis として評価環境を作る。agent は gather、synthesize、allocate、execute、reflect の five-stage cycle を回し、各 round は DecisionRound として recompute-verifiable hash chain に封入される。基盤には TimeGate、transaction / financing cost modeling、strategy-consistency scoring、three-tier memory、Model-Context-Protocol tool layer、mandate-aware synthesis が含まれる。評価は Coherence、Acuity、Composure、Discipline、Reliability の five-axis scorecard で、process scaffolding を committee of specialized roles と single full-autonomy orchestrator の実験変数として扱う。

## why_relevant_to_games
ゲーム向け headless 評価でも、最終スコアだけでは「たまたま勝った」か「方針が一貫している」かを分けにくい。プレイログを再計算可能な decision trail として残し、成功率・コスト・一貫性・失敗箇所を分けて見る候補になりそう。

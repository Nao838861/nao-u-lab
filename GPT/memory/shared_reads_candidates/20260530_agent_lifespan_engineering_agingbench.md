---
title: "Your Agents Are Aging Too: Agent Lifespan Engineering for Deployed Systems"
url: "https://arxiv.org/abs/2605.26302"
collected_at: "2026-05-30T00:14:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, memory, lifespan, harness, game-testing]
evaluated_at: "2026-05-30T00:18:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-30T00:42:43+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780068163256159"
posted:
  ts: "1780068163.256159"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780068163256159"
  char_count: 4234
  posted_at: "2026-05-30T00:42:43+09:00"
stale_after: "2026-06-29"
supersedes: []
next_action: none
gate_reason: |
  agent aging を 4 mechanism に分け、temporal dependency graph と paired counterfactual probes で write / retrieval / utilization を診断する構造が明確。
  直接の game paper ではないが、長期運用される制作 agent / 評価 agent の劣化を測る問題として、ゲーム制作サイクルへの適用対象が具体的。
suggested_post_outline:
  overview_angle: "model snapshot ではなく、memory と maintenance を含む agent harness 全体が時間で変質するという lifespan property の論文として書く。"
  analysis_axis: "compression / interference / revision / maintenance aging の分解と、どの memory pipeline stage で劣化が起きるかを切り分ける診断設計。"
  application_target: "headless 評価 agent、shared-reads 候補選別、game feedback atom の長期蓄積で、評価器そのものが古びるかを検査する harness。"
  pros_cons: "長所は劣化要因を分解して再現プローブに落とせる点。弱点は setup が重く、短期 game prototype には過剰になりやすい点。"
  verdict_pre: "部分採用。恒久ルール化ではなく、評価器の aging smoke test として小さく試す。"

---

## raw_excerpt

arXiv 要旨によると、AgingBench は long-lived AI agents を day-one benchmark だけで評価する問題を扱う。agent は model weights が固定でも、interaction history の圧縮、memory store の成長、fact revision、maintenance によって effective state が変わるため、reliability は base model の snapshot 性能ではなく harness 全体の lifespan property になる。提案は agent aging を compression aging、interference aging、revision aging、maintenance aging の 4 mechanism に分け、temporal dependency graph と paired counterfactual probes で memory pipeline の write / retrieval / utilization stage を診断すること。7 scenarios、14 models、複数 memory policy、runner-controlled / autonomous agent を含む 400 run 超、8-200 sessions の実験で、behavioral tests が clean に見えても factual precision が落ちるなど、劣化が一方向ではないことを示している。

## why_relevant_to_games

ゲーム制作 agent や headless 評価 agent を継続運用すると、記憶・評価基準・修正履歴が蓄積して挙動が変わる。長期サイクルで「評価器が古びる」問題を扱う候補。

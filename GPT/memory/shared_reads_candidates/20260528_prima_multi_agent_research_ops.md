---
title: "PRIMA: Operational Patterns for Resilient Multi-Agent Research with Verifiable Identity and Convergent Feedback"
url: https://arxiv.org/abs/2605.24775
collected_at: 2026-05-28T03:30:43+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent, memory, operations, evaluation, game-production]
evaluated_at: 2026-05-28T03:55:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-28T03:45:15+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779907495600839"
posted:
  ts: "1779907495.600839"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779907495600839"
  char_count: 3515
  posted_at: "2026-05-28T03:45:15+09:00"
stale_after: "2026-06-27"
supersedes: []
next_action: none
gate_reason: |-
  multi-agent 長時間 run の失敗要因、typed pause record、sub-agent discipline、convergence criteria が揃っており、問題設定から運用手法まで抽出できる。
  ゲーム制作そのものの手法ではないが、Nao_u_BOT の phase 分割、resume、cross_review、headless 評価を壊さず回す制作基盤に直接適用できる。
suggested_post_outline:
  overview_angle: "長時間 multi-agent research run を、drift と中断復帰に耐える制作サイクルとして扱う"
  analysis_axis: "失敗モード、typed pause record、sub-agent operating discipline、複数 draft の harmonization、convergence criteria"
  application_target: "Codex phases cycle の phase 引き継ぎ、pending game directive、cross_review 前の収束判定、staging log の構造化"
  pros_cons: "利点は長時間作業の再開性と収束条件を明示できる点。弱点は研究運用寄りで、ゲームの面白さ評価には別の実験設計が必要な点。"
  verdict_pre: "部分採用"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。PRIMA は、multi-hour の multi-agent research run で起きる失敗を扱う。例として、provider rate limit、sub-agent の task drift、tool を使わず機構説明だけをする挙動、revision loop の自己謝罪化、上流 context を executable directive と誤読する問題が挙げられている。中心は、typed pause record による中断・再開、sub-agent operating discipline、複数 draft のあとに cross-document harmonization を置く multi-phase pattern。短い原文メモ: "sub-agents drift the task", "typed pause record", "convergence criteria"。

## why_relevant_to_games
Nao_u_BOT のゲーム制作サイクルで、phase 分割、resume、cross_review、headless 評価をまたぐ長時間作業の破綻ログを candidate 化できる。

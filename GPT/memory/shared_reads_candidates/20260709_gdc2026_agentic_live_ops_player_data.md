---
title: "Agentic Live Ops: Turning Player Data into Actionable Insights"
url: "https://schedule.gdconf.com/session/agentic-live-ops-turning-player-data-into-actionable-insights-presented-by-amazon-web-services/917878"
collected_at: "2026-07-09T21:30:13+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [live-ops, player-telemetry, agentic-ai, analytics, segmentation]
evaluated_at: "2026-07-09T21:35:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-09T21:35:47+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-09T21:35:47+09:00"
next_action: keep_for_reference
stale_after: "2026-08-08"
supersedes: []
gate_reason: |-
  telemetry を次の調整候補へ変える観点は有用だが、対象は live ops / analytics 製品寄りで小型ゲーム制作への距離がある。
  現候補だけでは Strands Agents / Bedrock 構成の紹介に留まり、ゲームデザイン上の評価軸や具体的な失敗様式が薄い。
  #shared-reads 投稿ではなく、将来の playtest log 分析設計の参照に留める。
---

## raw_excerpt
GDC 2026 の AWS 講演。公式 agenda では、game studios が毎日 terabytes の player telemetry を生成する一方で、traditional analytics では insight が weeks late になり、機会を逃すという問題設定が置かれている。講演は AWS 上の agentic live ops solution を chalk talk として示し、Strands Agents、Amazon Bedrock AgentCore、Knowledge Bases を使って behavior patterns、segment characteristics、personalization opportunities を即座に surface する構成を扱う。

Takeaway は、Amazon Bedrock を使った agentic AI solution により live ops analysis cycles を weeks から days に短縮すること、conversational analytics の live demonstration、player segmentation を 100 から 1,000+ segments へ scale する architecture pattern、実装戦略。対象 audience は、slow analytics workflows と manual player segmentation に困っている data teams、analytics teams、live ops teams、product managers とされている。

## why_relevant_to_games
小型 prototype でも、playtest log / death reason / retry path / item use を後から読むだけでは遅い。自動テレメトリを「次の調整候補」へ変える agentic analysis の入口として保存する。

---
title: "CEO-Bench: Can Agents Play the Long Game?"
url: "https://arxiv.org/abs/2606.18543"
collected_at: "2026-06-26T11:44:45+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, long-horizon, simulation, management-game, planning, game-design]
evaluated_at: "2026-06-26T11:47:22+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782442320.737159"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782442320737159"
  char_count: 4490
  posted_at: "2026-06-26T11:52:04+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-26T11:52:04+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782442320737159"
next_action: none
stale_after: "2026-07-26"
supersedes: []
gate_reason: |-
  500 日の startup 運営を長期 horizon の playable simulation として扱い、情報収集・価格/販促/予算配分・交渉履歴・cash forecast を agent 評価へ落とす問題設定が明確。
  現行 agent が cohort simulation や履歴分析コードを書けても安定利益化に苦戦する、という評価観点があり、ゲーム制作では長期運営/経営ゲーム/AI playtest の設計軸へ具体的に接続できる。
suggested_post_outline:
  overview_angle: "startup 500 日運営を、短期タスクではなく不確実性下の長期意思決定ゲームとして読む。"
  analysis_axis: "hidden customer preference、noisy market、business database、negotiation history、pricing/marketing/budgeting の相互依存を agent 評価にする設計。"
  application_target: "経営/運営シミュレーション、NPC/AI director の長期計画評価、game agent の履歴分析ログと資源配分テスト。"
  pros_cons: "長期評価と情報ノイズの設計は強い。一方で startup 経営に寄るため、瞬間的な操作スキルや空間アクション評価には直結しにくい。"
  verdict_pre: "採用"
---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv abstract の短い原文句と要点メモとして保存する。短い原文句: "operating a startup for 500 days" / "navigating long horizons amid uncertainty"。CEO-Bench は、LLM agent が短期の isolated task だけでなく、長期にわたる不確実な環境で、情報収集、戦略変更、複数意思決定の調整を続けられるかを見る benchmark。fictional company を 500 日運営する設定で、agent は programmable Python interface を通じて pricing、marketing、budgeting などを管理する。環境は noisy で、business database や negotiation history から hidden customer preferences を推定し、将来 cash を forecast しながら意思決定する必要がある。論文は、強い agent は cohort simulation や履歴分析コードを書ける一方、現行の state-of-the-art でも安定して profit を出すには苦戦すると述べている。ゲーム制作文脈では、経営シムそのものだけでなく、長期 campaign、資源管理、運営型ゲーム、AI agent 評価環境の設計素材として読める。

## why_relevant_to_games

500 日の会社運営を playable simulation として使うため、長期計画、情報ノイズ、資源配分、シミュレーション型ゲームの agent 評価に接続できる。

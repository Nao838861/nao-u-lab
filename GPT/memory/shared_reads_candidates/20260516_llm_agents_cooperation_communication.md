---
title: "Communication Enables Cooperation in LLM Agents: A Comparison with Curriculum-Based Approaches"
url: https://arxiv.org/abs/2510.05748
collected_at: 2026-05-16T05:45:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-agents, social-dilemmas, cooperation, evaluation]
source_note: "memory/raw/web_research/results.jsonl query=LLM game design player evaluation; arXiv page checked 2026-05-16"
evaluated_at: 2026-05-16T05:46:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-16T05:37:05.920789+09:00"
last_decision: posted
stale_after: "2026-06-15"
supersedes: []
gate_reason: |-
  問題設定、通信 vs curriculum という比較軸、Stag Hunt / Public Goods Game with Punishment の評価結果、結論の落差が明確。
  協力 NPC、自動テストプレイ、agent 間プロトコル設計に直接転用でき、~4000字の概要でも中核要素を保って書ける。
suggested_post_outline:
  overview_angle: "LLM agent の協力行動は訓練経験列よりも最小限の通信チャネルで大きく変わる、という実験結果を軸にする。"
  analysis_axis: "Stag Hunt の cheap talk 効果、curriculum の設計敏感性、Public Goods Game with Punishment で payoff が下がった点を比較する。"
  application_target: "協力ゲームの NPC 群、自動テストプレイヤー、複数 LLM agent によるシミュレーションで、行動学習より先に通信仕様を設計・検証する probe に使う。"
  pros_cons: "メリットは介入が小さく効果が測りやすいこと。デメリットはゲーム種と通信語彙が限定され、安易に一般化すると危ないこと。"
  verdict_pre: "部分採用。通信プロトコル設計の評価軸として採用し、curriculum は慎重に扱う。"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778877425920789"
next_action: none
posted:
  ts: "1778877425.920789"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778877425920789"
  char_count: 4478
  posted_at: "2026-05-16T05:37:05.920789+09:00"

---

## raw_excerpt

arXiv abstract short quote:

> "a one-word \"cheap talk\" channel increases cooperation from 0% to 96.7%"

抄録メモ: 4-player Stag Hunt では、直接通信が協力を強く引き上げた一方、複雑なゲームを順に経験させる curriculum は設計に敏感で、Iterated Public Goods Game with Punishment では agent payoffs を下げたとされる。著者は、短期合理性に最適化した経験列が、社会的ジレンマで pessimistic な戦略学習を誘発しうる点を問題化している。arXiv では v3 が 2026-03-11 に revised。EACL 2026 掲載、二段階 communication 条件の cooperation rates 修正についてコメントあり。

## why_relevant_to_games

協力ゲーム、NPC 同士の連携、LLM agent を使った自動テストプレイで、訓練カリキュラムよりも最小限の通信プロトコルが行動を大きく変える候補として使える。

---
title: "RuleSmith: Multi-Agent LLMs for Automated Game Balancing"
url: "https://arxiv.org/abs/2602.06232"
collected_at: "2026-05-15T08:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-balancing, llm-agents, simulation, playtesting]
evaluated_at: "2026-05-15T09:03:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T09:08:42+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: >-
  問題設定、multi-agent self-play + Bayesian optimization の中核、CivMini での評価対象、balance metrics が候補段階でも読める。
  Nao_u 環境の graze / score / survival 調整を rule space 化して、主観ではなく評価ゲームで比較する用途に接続できる。
suggested_post_outline:
  overview_angle: "ゲームバランスを「案の良し悪し」ではなく rule space 探索と self-play 評価の問題として書く。"
  analysis_axis: "LLM agents のプレイ、balance metrics、Bayesian optimization による候補配分、CivMini の設計を分けて読む。"
  application_target: "小規模ゲームのパラメータ調整、特に graze_log 系のリスク/報酬/到達率を harness で測る前処理。"
  pros_cons: "外部評価軸を作れる一方、LLM プレイヤーの妥当性と探索コストが弱点。"
  verdict_pre: "部分採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778803710961519"
next_action: none
posted:
  ts: "1778803710.961519"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778803710961519"
  char_count: 3584
  posted_at: "2026-05-15T09:08:42+09:00"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。RuleSmith は、ゲームエンジン、multi-agent LLM self-play、Bayesian optimization を組み合わせ、複数次元の rule space を探索してゲームバランスを自動調整する枠組み。実験対象は CivMini で、異質な faction、economy、production、combat mechanics を持つ civilization-style の簡略ゲーム。LLM agents は textual rulebooks と game states を読んで行動し、win-rate disparities などの balance metrics を高速評価する。探索側は acquisition-based adaptive sampling と discrete projection を使い、有望候補には多くの評価ゲーム、探索候補には少数の評価ゲームを割り当てる。

## why_relevant_to_games
Nao_u 環境で不足しがちな「自分の判断ではなく外部 harness でバランス差分を見る」話に直結する。特に graze / score / survival などの調整対象を rule space として扱う候補になる。

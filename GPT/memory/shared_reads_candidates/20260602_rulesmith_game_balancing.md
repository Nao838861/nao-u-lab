---
title: RuleSmith: Multi-Agent LLMs for Automated Game Balancing
url: https://arxiv.org/abs/2602.06232
collected_at: 2026-06-02T13:59:22.2815508+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, balancing, llm-agent, self-play, bayesian-optimization]
evaluated_at: 2026-06-02T14:02:36+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T17:06:18+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-51c30c4f27de93fe; terminal:memory/shared_reads_candidates/20260515_rulesmith_multi_agent_game_balancing.md: posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778803710961519; posted_source_url_match; reason:posted-source index が arXiv:2602.06232 の実 Slack 投稿を canonical URL/work 一致で確認したため、同一内容の open siblings を閉じる。"
next_action: none
stale_after: "2026-07-02"
supersedes: []
gate_reason: "multi-agent self-play と Bayesian optimization による rule space 探索は有用だが、Phase 1 メモだけでは CivMini の実験条件・評価指標・比較結果の具体性が不足している。小規模プロトタイプのパラメータ探索への接続はあるものの、~4000字の概要にするには追加確認が必要。"
---

## raw_excerpt
arXiv 2602.06232。原文断片: "Game balancing is a longstanding challenge requiring repeated playtesting"。RuleSmith は、game engine、multi-agent LLM self-play、Bayesian optimization を組み合わせ、multi-dimensional rule space 上でゲームバランスを探索する枠組み。概念実証では CivMini という civilization-style game を使い、faction、economy、production、combat mechanics を tunable parameters として扱う。LLM agents は textual rulebooks と game states を読んで行動し、win-rate disparities などの balance metrics を評価する。探索では acquisition-based adaptive sampling と discrete projection を使い、有望候補には評価ゲーム数を多く、探索候補には少なく割り当てる。結果として balanced configurations と interpretable rule adjustments が得られるとされる。

## why_relevant_to_games
小型プロトタイプで敵数・弾速・報酬倍率などを調整するとき、単なる平均スコアではなく「候補ごとの評価ゲーム配分」を作る参考になる。

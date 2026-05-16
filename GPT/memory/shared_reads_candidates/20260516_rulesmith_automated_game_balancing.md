---
title: "RuleSmith: Multi-Agent LLMs for Automated Game Balancing"
url: "https://arxiv.org/abs/2602.06232"
collected_at: "2026-05-16T21:29:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, balancing, llm-agents, playtesting, multiagent]
---

## raw_excerpt
arXiv:2602.06232。Ziyao Zeng ほか。2026-02-05 submitted。

抄録メモ: ゲームバランス調整を、手作業の反復 playtesting と expert intuition だけに寄せず、game engine、multi-agent LLM self-play、Bayesian optimization を組み合わせる枠組みとして扱う。実験対象は CivMini という簡略化された civilization-style game で、異なる faction、economy、production rules、combat mechanics を持ち、それぞれに tunable parameter がある。LLM agent は textual rulebook と game state を読み、action を生成し、win-rate disparity などの balance metrics を高速評価する。探索側は multi-dimensional rule space に対して Bayesian optimization、acquisition-based adaptive sampling、discrete projection を使い、有望な候補には評価ゲームを多く、探索的候補には少なく割り当てる。結果として balanced configuration へ収束し、downstream game systems に適用できる interpretable rule adjustments を返す、という主張。

## why_relevant_to_games
ゲーム制作で「面白いが数値調整が詰め切れない」段階に、LLM self-play と deterministic metric を組み合わせる候補。特に小規模シミュレーションや対戦/資源管理プロトタイプの balance probe に接続できる。

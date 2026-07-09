---
title: "PTCG-Bench: Can LLM Agents Master Pokemon Trading Card Game?"
url: "https://arxiv.org/abs/2605.29653"
collected_at: "2026-07-09T13:44:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, card-game, self-evolving-agent, harness]
---

## raw_excerpt

arXiv abstract では、戦略的に複雑な board/card game では、人間は数回のプレイ後に戦略を作れるが、既存 agent benchmark はそのような evolving decision-making を十分に捉えない、と置いている。PTCG-Bench は Pokemon Trading Card Game を基盤にした benchmark で、LLM agent を二つの水準で評価する。ひとつは単一の複雑な環境内での decision-making performance、もうひとつは蓄積した経験を通じた self-evolving ability。さらに modular harness ablation を含め、agent performance と model capability を混同しない形で性能解釈を試みる。実験では非自明な gameplay performance は出る一方、安定した自己進化は難しく、性能は harness design に敏感だと報告している。

source notes:
- submitted: 2026-05-28
- arXiv id: 2605.29653
- web_research query: LLM game design player evaluation

## why_relevant_to_games

カードゲームやローグライクのような長期戦略ゲームで、agent の強さと harness の効き方を分けて見るための候補。反復プレイで学ぶNPCや自動テストの設計材料になる。

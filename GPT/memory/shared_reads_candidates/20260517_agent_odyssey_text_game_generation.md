---
title: "AgentOdyssey: Open-Ended Long-Horizon Text Game Generation for Test-Time Continual Learning Agents"
url: "https://agentodyssey.github.io/paper.pdf"
collected_at: "2026-05-17T07:29:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, text-game, agent-evaluation, procedural-generation, memory]
---

## raw_excerpt

短い原文引用: "procedurally generates open-ended text games"

AgentOdyssey は、test-time continual learning agent を評価するため、rich entities、world dynamics、long-horizon tasks を持つ open-ended text game を手続き生成する framework。通常の benchmark が「test time では学習しない」前提に寄りがちな点を問題視し、deployment 中に learning と inference が交互に起きる状況を作る。評価軸は game progress だけでなく、world knowledge acquisition、episodic memory、object/action exploration、action diversity、model cost などを含む。論文は、探索、episodic memory、world knowledge acquisition、skill learning、long-horizon planning の5能力が相互に強化し、長期・非リセット環境での成否を決めると置く。例では、数百 step の中で recipe を紙に書く、落とした trade item の場所を覚える、危険な時間帯を避ける、key を craft して merchant へ trade する、といった行動が同時に要求される。

## why_relevant_to_games

LLM agent の memory / exploration / planning をゲーム内の具体的な行動ログで測る設計として、Nao_u 作品の自己評価 harness や long-horizon tutorial 設計に使える。

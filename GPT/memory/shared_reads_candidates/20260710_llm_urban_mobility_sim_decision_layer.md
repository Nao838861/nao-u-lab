---
title: "Evaluating Large Language Models for Decision-Making in Agent-Based Urban Mobility Simulations"
url: "https://arxiv.org/abs/2607.02716v1"
collected_at: "2026-07-10T07:59:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, simulation, agent-memory, decision-layer, systems-design]
---

## raw_excerpt

arXiv abstract の要点メモ。都市交通の agent-based simulation では、従来の rule-based agent は固定 heuristic に寄り、動的環境での適応的意思決定を表しにくい。論文は GAMA platform と外部 LLM module を API で接続し、各 agent が route replanning を行うべきかを判断する hybrid architecture を提案している。LLM は routing algorithm を置き換えるのではなく、replanning behavior を導く decision layer として使われる。persistent memory を持たせ、過去 interaction が将来判断に影響し、behavioral consistency を促す構成。road-blockage scenarios と population scale を変えて rule-based / LLM-assisted を比較し、LLM-enabled agents は route flexibility が高い状況で adaptability と contextual awareness を示す。memory の効果は configuration によって変わるが、performance と behavioral consistency に影響するとされる。

## why_relevant_to_games

都市交通シミュレーションだが、NPC 群の経路再計画や群衆行動を「経路探索そのもの」ではなく「再計画すべきかの判断層」として分ける設計材料になる。

---
title: "Living-Harness Is an Interactive-Agent Evolver"
url: "https://arxiv.org/abs/2607.26598"
collected_at: "2026-07-31T04:16:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, harness, memory, evaluation, playtesting]
---

## raw_excerpt

arXiv:2607.26598v1（2026-07-29 submitted）の一次資料メモ。LLM agent は一つの episode 内で失敗から回復できても、post-episode feedback が将来の interaction を導く永続 harness を更新しないため、後続 task で同じ execution failure を繰り返し得る。固定された tools、context、memory、workflow を持つ static harness は信頼性を高める一方、deployment 後には変化しない。Living-Harness は完了 trajectory と evaluator signal を、範囲を限定した harness update のための posterior evidence に変換する self-evolving harness として提案される。

domain-level の Evolution-SOP に従い、各 episode から episode abstraction と structured update evidence を抽出し、二種類の procedural knowledge を書く。episodic memory は trigger condition、failure pattern、recovery action を保持し、state graph は state node、repair edge、transition rule を保持する。更新済み harness state は次の interaction で retrieval される一方、tools と base context は固定され、procedural repair だけが evolution cycle をまたいで蓄積される。τ²-Bench と MultiWOZ-2.4 由来の計8 interactive environment では、strongest interactive baseline に対する平均 Pass@1 がそれぞれ10.07、9.91 percentage point 改善し、進化済み harness state を別 model backbone から retrieval-only で再利用できると報告される。

## why_relevant_to_games

反復する headless playtest で、同型の操作失敗・復帰手順・状態遷移を episode 間で再利用する設計候補になる。agent 本体と playtest harness のどちらを更新した結果かを分けて記録する場面にも関係する。

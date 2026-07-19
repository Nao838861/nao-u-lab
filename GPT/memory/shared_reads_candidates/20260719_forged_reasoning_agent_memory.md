---
title: "Your Agent's Memories Are Not Its Own: Forged Reasoning Attacks on LLM Agent Memory and Defenses"
url: "https://arxiv.org/abs/2607.05029"
collected_at: "2026-07-19T12:45:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, persistent-memory, security, playtesting, provenance]
---

## raw_excerpt

arXiv 要旨からの一次情報メモ。persistent memory を持つ LLM agent は、事実、過去の決定、reasoning history、tool usage、context を次の task へ持ち越せる一方、agent 自身の推論履歴が新しい攻撃面になる。本論文は、事実知識を書き換える代わりに、記憶された reasoning trace を汚染する Forged Amplifying Rationale Memory Attack（FARMA）を提示する。FARMA は keyword-based defense を避ける言い回しで偽の推論を挿入し、self-referential reinforcement によって consensus-based defense も崩す。防御側の SENTINEL は、候補記憶を複数段で検査し、中心となる Reasoning Guard が五つの重み付き signal から forgery を構造的に分析する。複数 agent・複数 LLM、50 trial の評価では、baseline 条件で FARMA の attack success rate が最大 100% に達し、SENTINEL は最小 0% まで下げたと報告する。また benign agent trace 326 件では false positive が観測されなかったとしている。

## why_relevant_to_games

長期の自動プレイテストで過去の攻略理由や失敗原因を再利用する際、外部テキストと agent 自身の推論履歴に provenance・検査境界を置く設計資料になる。

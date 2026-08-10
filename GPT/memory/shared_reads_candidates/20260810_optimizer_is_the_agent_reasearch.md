---
title: "The Optimizer Is the Agent: Reasoning-Driven Search across Prompts, Programs, and ML Workflows"
url: "https://arxiv.org/abs/2608.06714"
collected_at: "2026-08-10T17:45:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, optimization, game-development, playtesting, iterative-design]
---

## raw_excerpt

ReASearch は、prompt、program、ML workflow の探索で、従来は evolutionary search、bandit、textual gradient など外部 controller が担っていた「次に何を評価するか」「失敗をどう診断するか」「どの候補を編集するか」「いつ再検証・後戻り・打ち切りを行うか」を、tool-using agent 自身の逐次推論へ移す枠組みである。task 固有部分は system prompt と tool set に限定し、共通 loop には file I/O、コード実行、軽量 memory、context compression を置く。agent は評価ログを Python で分析し、`lessons.md` に成功・失敗・次の試行・条件別の観測を蓄積する。program evolution では編集を別 agent に委ねつつ、高水準の分析と診断は main agent に保持する構成を取る。

評価は prompt optimization、program evolution、ML workflow optimization の3領域・14 task で行われ、各設定を3回独立実行して平均を報告している。論文が観測した探索挙動には、安価な評価で有望な変更を再確認してから高価な validation に進むこと、失敗した branch から以前の候補へ戻ること、過学習や評価分散を調べること、過去の失敗 lesson を再利用すること、単一の最高 score ではなく全履歴を見て最終候補を選ぶことが含まれる。実験には Terminal-Bench 2.0、ARC-AGI-2、Atari の Q*bert、MuJoCo などが含まれ、同一予算下の domain-specific baseline との比較と component ablation も掲載されている。

## why_relevant_to_games

ゲームの自動 playtest、parameter 調整、実装変更を「評価→診断→候補分岐→再検証→後戻り」の長期 loop として構成する際に、外部 search 手続きを固定する方法と agent に探索方針を持たせる方法を比較する材料になりうる。

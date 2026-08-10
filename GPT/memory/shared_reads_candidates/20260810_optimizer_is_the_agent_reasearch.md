---
title: "The Optimizer Is the Agent: Reasoning-Driven Search across Prompts, Programs, and ML Workflows"
url: "https://arxiv.org/abs/2608.06714"
collected_at: "2026-08-10T17:45:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, optimization, game-development, playtesting, iterative-design]
evaluated_at: "2026-08-10T17:48:24+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1786352183.698429"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786352183698429"
  char_count: 4229
  posted_at: "2026-08-10T17:56:31+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-10T17:56:31+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786352183698429"
next_action: none
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  問題設定、agent 主導の探索 loop、memory と後戻りを含む中核構成、3 領域 14 task・独立 3 回・baseline 比較・ablation まで候補本文から抽出できる。
  自動 playtest と parameter・実装候補の反復改善へ具体的に写像でき、限界を含む ~4000 字の独立分析を組み立てられるため pass とする。
suggested_post_outline:
  overview_angle: "探索 controller を固定手続きから、履歴を読み診断・分岐・後戻りを選ぶ tool-using agent へ移す設計と評価を整理する"
  analysis_axis: "固定 search と reasoning-driven search の差、履歴 memory・安価な再確認・rollback・ablation が探索品質へ与える効果と過学習リスク"
  application_target: "Log_cdx のゲーム自動 playtest、parameter 調整、実装候補生成を、評価ログと lessons を持つ長期探索 loop に接続する"
  pros_cons: "利点は失敗診断と探索方針を task 横断で再利用できること。欠点は評価器の偏り、agent の探索コスト、再現性と停止条件の管理が難しいこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

ReASearch は、prompt、program、ML workflow の探索で、従来は evolutionary search、bandit、textual gradient など外部 controller が担っていた「次に何を評価するか」「失敗をどう診断するか」「どの候補を編集するか」「いつ再検証・後戻り・打ち切りを行うか」を、tool-using agent 自身の逐次推論へ移す枠組みである。task 固有部分は system prompt と tool set に限定し、共通 loop には file I/O、コード実行、軽量 memory、context compression を置く。agent は評価ログを Python で分析し、`lessons.md` に成功・失敗・次の試行・条件別の観測を蓄積する。program evolution では編集を別 agent に委ねつつ、高水準の分析と診断は main agent に保持する構成を取る。

評価は prompt optimization、program evolution、ML workflow optimization の3領域・14 task で行われ、各設定を3回独立実行して平均を報告している。論文が観測した探索挙動には、安価な評価で有望な変更を再確認してから高価な validation に進むこと、失敗した branch から以前の候補へ戻ること、過学習や評価分散を調べること、過去の失敗 lesson を再利用すること、単一の最高 score ではなく全履歴を見て最終候補を選ぶことが含まれる。実験には Terminal-Bench 2.0、ARC-AGI-2、Atari の Q*bert、MuJoCo などが含まれ、同一予算下の domain-specific baseline との比較と component ablation も掲載されている。

## why_relevant_to_games

ゲームの自動 playtest、parameter 調整、実装変更を「評価→診断→候補分岐→再検証→後戻り」の長期 loop として構成する際に、外部 search 手続きを固定する方法と agent に探索方針を持たせる方法を比較する材料になりうる。

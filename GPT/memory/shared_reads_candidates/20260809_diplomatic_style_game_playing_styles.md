---
title: "Diplomatic Style: Modeling Human Game Playing Styles for Diplomacy"
url: "https://openreview.net/forum?id=gR2XgV07V2"
collected_at: "2026-08-09T20:03:32+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, player-modeling, strategy-game, multi-agent, reinforcement-learning]
evaluated_at: "2026-08-09T20:08:16+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-09T20:08:16+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-09T20:08:16+09:00"
next_action: revise_or_research
stale_after: "2026-09-08"
supersedes: []
gate_reason: >
  四つの style 定義、game reward と style reward の併用、GRPO、勝率比較、Chivalrous agent の事例までは具体的で、協力・裏切りを含む NPC や自動 playtester の設計へ接続できる。
  ただし現候補にはデータ規模、比較条件、style 遵守の定量評価、ablation がなく、OpenReview 本文もアクセス制限中のため、CoopEval 水準の約4000字を検証可能に書くには一次資料が不足する。
---

## raw_excerpt

OpenReview 掲載抄録からの採取メモ（非逐語訳）。対象は、交渉・連合形成・裏切りが数十 turn 続く七人用戦略ゲーム Diplomacy。研究は、人間の行動価値に基づく game-playing style として Kingmaker、Chivalrous Protector、Reciprocal Loyalist、Machiavellian Opportunist の四つを定義し、それぞれに競争上の利益と両立させる role / behavioral contract を与える。game reward と style reward を組み合わせて GRPO 学習した agent は、抄録記載値で勝率 18.5% となり、Cicero の 14.2%、style 指定なし baseline の 16.4% と比較されている。Chivalrous agent については、弱い ally を守った後にその支援を得て強い相手を崩す事例が示され、支援された player の生存率が 7%、agent 自身の勝率が 4% 上がったと報告される。抄録の表現は “Helping others can make you a stronger player”。style を表面的な発話調子ではなく、長期の交渉・協力・自己利益の間で追跡可能な行動契約として扱う構成が記載されている。

## why_relevant_to_games

NPC や自動 playtester に「上手さ」以外の一貫した行動様式を持たせ、長期戦略の中で協力・裏切り・保護がどう勝敗へ接続するかを設計・計測する場面の参照候補になる。

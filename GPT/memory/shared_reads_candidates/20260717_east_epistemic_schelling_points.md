---
title: Beyond Sally-Anne: Evaluating Theory of Mind in LLMs using Epistemic Schelling Points
url: https://arxiv.org/abs/2607.11363v1
collected_at: 2026-07-17T01:05:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, dialogue-game, theory-of-mind, evaluation, coordination]
evaluated_at: 2026-07-17T01:10:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-07-17T01:10:00+09:00
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "duplicate of posted candidate: memory/shared_reads_candidates/20260715_beyond_sally_anne_east.md; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784088387032009"
next_action: none
stale_after: "2026-08-16"
supersedes: []
gate_reason: >-
  arXiv version suffix を除けば同一 URL で、同一 title の候補が既に投稿済みである。
  canonical index の未反映を raw Slack permalink と posted candidate frontmatter で補完確認した。
---

## raw_excerpt

従来の LLM の Theory of Mind 評価は Sally-Anne 型の静的な文章問題に寄り、事前学習で類題を見た影響や定型的な言語手掛かりによって解ける可能性がある。論文は代わりに Epistemic Asymmetry Schelling Task（EAST）を導入する。これは二つの LLM が対話し、互いに直接答えを共有せず、異なる知識の公開状態のもとで意味的な Schelling point に独立に収束できるかを見る二人用ゲームである。評価対象は、知識状態が変化しても ToM を協調行動へ移せるかどうか。結果では frontier model だけが異なる epistemic demand を通過し、失敗の中心には private knowledge と mutual knowledge の混同など、知識状態の追跡誤りがあったと報告される。静的ベンチマークの高得点と、対話中の機能的な社会推論との間に能力差があるという観察を含む。

## why_relevant_to_games

非対称情報の協力ゲームや会話型 NPC を設計・テストするとき、成功率だけでなく「誰が何を知り、それを相互知識と誤認したか」を失敗分類に使う手掛かりになる。

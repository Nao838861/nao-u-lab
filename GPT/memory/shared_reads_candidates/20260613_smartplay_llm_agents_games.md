---
title: "SmartPlay: A Benchmark for LLMs as Intelligent Agents"
url: "https://openreview.net/forum?id=S2oTVrlcp3"
collected_at: "2026-06-13T07:59:44+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, benchmark, llm-agent, planning, history-learning]
evaluated_at: "2026-07-27T04:52:35+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T04:52:35+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-27T04:52:35+09:00"
next_action: keep_for_reference
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  ゲームごとに測る能力を宣言する設計は参照価値があるが、現 candidate は能力分類と環境一覧に留まり、モデル別・ゲーム別の結果や具体的な失敗分析を欠く。
  この資料量で 4000 字級に広げると一般論の水増しになるため投稿候補からは外し、benchmark 設計時の参考資料としてだけ残す。
---

## raw_excerpt
OpenReview の要旨メモ。SmartPlay は、LLM を intelligent agent として評価するための game benchmark / methodology。2024 年の ICLR poster で、Rock-Paper-Scissors、Tower of Hanoi、Minecraft など 6 種類のゲームを含み、最大 20 の evaluation settings と無限に近い environment variations を用意する。各ゲームは、LLM agent に必要な 9 種類の能力の一部を意図的に刺激する設計で、object dependency の推論、先読み planning、spatial reasoning、history からの学習、randomness の理解などが挙げられている。単に総合点を出すだけでなく、ゲームごとに問う能力が違うため、どの能力が弱いかを別々に分析できるとされる。visual observation には language descriptors を付ける設計で、完全な画像操作 benchmark というより、環境状態を言語化しながら agent 行動を評価する基礎枠として読める。公開先として microsoft/SmartPlay の GitHub が示されている。

## why_relevant_to_games
最近の game-agent benchmark を読む時の比較基準として使える。Nao_u_BOT 側でも、ゲームごとに「何の能力を測っているか」を先に宣言する候補設計の参考になる。

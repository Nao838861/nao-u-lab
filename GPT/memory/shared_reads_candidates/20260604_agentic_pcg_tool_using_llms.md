---
title: "Agentic PCG: Procedural Content Generation via Tool-using LLMs"
url: "https://zehua-jiang.github.io/AgenticPCG/"
collected_at: "2026-06-04T03:07:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [pcg, llm-agent, level-design, tool-use, game-ai]
evaluated_at: "2026-06-04T04:31:55+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-04T04:34:32+09:00"
last_decision: postponed
evidence: "duplicate_of:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779885575577609"
next_action: none
postpone_reason: "Phase 3 重複確認。同一 URL は 2026-05-27 に #shared-reads 投稿済みのため再投稿しない。"
duplicate_of:
  candidate: "memory/shared_reads_candidates/20260527_agentic_pcg_tool_using_llms.md"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779885575577609"
  ts: "1779885575.577609"
stale_after: "2026-07-04"
supersedes: []
gate_reason: >-
  tool-calling LLM に brush、生成アルゴリズム、評価関数を渡し、level を反復編集する
  という構成が具体的で、従来 PCG の制約充足と自然言語の設計意図の接続が明確。
  小規模 prototype の level/wave/enemy pattern 更新に適用しやすく、投稿水準まで伸ばせる。
suggested_post_outline:
  overview_angle: "PCG を一回の生成ではなく、評価関数付き tool-use agent の編集ループとして捉える軸"
  analysis_axis: "local brushes、classic PCG tools、evaluation functions、natural language directives の結合"
  application_target: "headless 評価つきの level/wave/enemy pattern 生成、bot-policy 検査、設計意図の反映"
  pros_cons: "利点は機能制約と人間の意図を同じループに入れられる点。弱点は評価関数設計と探索コスト。"
  verdict_pre: "採用候補。まず小さな level 編集ループの probe に落とす。"
---

## raw_excerpt
短い原文抜粋: "iteratively edits, evaluates, and optimizes game levels" / "functional and steerable via natural language"。

Project page / SSRN 2026-04-28 posted, 2026-05-10 revised。Tool-calling LLM を PCG agent として使い、local brushes、generative algorithms、evaluation functions を道具として与え、design objective に向けて level を反復編集する枠組み。対象は Binary Maze、Lode Runner、Zelda、Sokoban、Super Mario Bros などで、tile placement のような単純編集だけでなく classic PCG algorithms も tools として使う。主張は、従来の optimization PCG が computable functional constraints には強い一方、open-ended human priors や natural language directives を組み込みにくいという問題に対して、tool-using LLM agent が functional constraint satisfaction と free-form design control の間をつなぐこと。静的 level design と dynamic gameplay mechanics の両方で動くと説明されている。

## why_relevant_to_games
小型 prototype の level / wave / enemy pattern を、人間語の意図と headless 評価の両方で更新する入口になりそう。Phase 2 以降で、既存の bot-policy 評価と相性を確認できる。

---
title: "Agentic PCG: Procedural Content Generation via Tool-using LLMs"
url: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6499021
collected_at: 2026-06-06T20:14:37+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [pcg, llm-agent, level-design, tool-use, game-ai]
evaluated_at: 2026-06-06T20:17:29+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T14:50:40+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-f639cc4f7da8006b; terminal:memory/shared_reads_candidates/20260517_agentic_pcg_tool_using_llms.md: posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779885575577609; posted_source_url_match; reason:posted-source index が AgenticPCG project URL の実 Slack 投稿を exact work 一致で確認したため open siblings は再投稿候補として閉じる"
next_action: none
stale_after: "2026-07-06"
supersedes: []
gate_reason: |-
  tool-calling LLM + brushes / algorithms / evaluation functionsという着想はNao_u_BOTのPCG設計に近い。
  ただし現候補はabstractと例示中心で、評価手順・比較対象・成功失敗の中身がPhase 3水準には不足している。
  投稿候補にするには、論文本文かproject pageから実験設定と結果を補う必要がある。
---

## raw_excerpt
SSRN abstract 6499021。2026-03-18 date written、2026-04-28 posted、2026-05-10 last revised。PCG は functional constraints を満たす content 生成に強いが、open-ended human priors や natural language directive を入れるのが難しい、という問題設定。Agentic Procedural Content Generation は tool-calling LLM が game level を生成し、local brushes、generative algorithms、evaluation functions を使って design objective に向けて反復 refinement する枠組み。

短い原文断片: "functional and steerable" / "iteratively refine content" / "free-form design control"。

収集メモ: static level design task と dynamic gameplay mechanics を持つ environment の両方に適用できると説明されている。関連 project page では Binary Maze、Lode Runner、Zelda、Sokoban、Super Mario Bros level editing の例が示され、environment が metrics や simulation feedback を返す interactive environment として扱われる。

## why_relevant_to_games
Nao_u_BOT のレベル生成や敵配置調整を、LLM 直書きではなく tools + 評価関数 + 反復編集に分解する材料。human prompt と solvability / connectivity / gameplay simulation を同時に扱う設計に効く。

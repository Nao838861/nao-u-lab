---
title: Automated Generation and Evaluation of Interactive-Fiction Serious Games with Open-Weight LLMs
url: https://www.mdpi.com/2076-3417/16/6/2932
collected_at: 2026-06-04T00:29:29+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [interactive-fiction, serious-games, llm, structured-validation, narrative-design]
evaluated_at: "2026-07-19T08:04:38+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T08:42:49+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-ac23070330529ca3; terminal:memory/shared_reads_candidates/20260530_sine_open_weight_interactive_fiction_serious_games.md: status:posted permalink:p1780083448196669; reason:posted-source index が同一 MDPI URL を実投稿済みと確定"
next_action: none
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  posted-source index で同一 MDPI URL の実投稿と完全一致し、posted terminal sibling と Slack permalink を確認した。
  内容評価を重ねず、Phase 3 の投稿対象から重複として除外する。
---

## raw_excerpt
MDPI Applied Sciences の本文では、LLM による game generation を、まず graphical assets を持たない choice-based interactive fiction に限定して検証する方針が取られている。対象は station-based serious games の抽象版で、教師が technical burden を減らし、didactic content design に集中できることを狙う。入力は multiple-choice questions を含む structured JSON seed で、station と task を機械可読に指定し、LLM generation と validation の基盤にする。関連研究整理では、LLM は narrative と rule draft に使える一方、syntactic correctness、playability、intended content への fidelity を自動で保証する点が未解決とされる。grammar masking や downstream structured validation が出力妥当性を上げる動機として扱われている。

## why_relevant_to_games
小さく制約したゲーム型、structured seed、validation から始める流れは、Codex 側のプロトタイプ生成や教育/パズル系ゲームの仕様入力形式に応用できる。

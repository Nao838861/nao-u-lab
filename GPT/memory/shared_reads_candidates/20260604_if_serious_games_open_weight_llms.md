---
title: Automated Generation and Evaluation of Interactive-Fiction Serious Games with Open-Weight LLMs
url: https://www.mdpi.com/2076-3417/16/6/2932
collected_at: 2026-06-04T00:29:29+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [interactive-fiction, serious-games, llm, structured-validation, narrative-design]
evaluated_at: 2026-06-04T00:33:54+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-06-04T00:33:54+09:00
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-04T00:33:54+09:00"
next_action: revise_or_research
stale_after: "2026-07-04"
supersedes: []
gate_reason: "structured JSON seed と validation は実装可能性が高いが、候補本文だけでは評価結果の具体性、open-weight model 間の差、serious game と一般ゲーム制作の接続が不足している。Phase 3 の ~4000字概要にするには本文から評価表や失敗例を追加で抜く必要がある。"
---

## raw_excerpt
MDPI Applied Sciences の本文では、LLM による game generation を、まず graphical assets を持たない choice-based interactive fiction に限定して検証する方針が取られている。対象は station-based serious games の抽象版で、教師が technical burden を減らし、didactic content design に集中できることを狙う。入力は multiple-choice questions を含む structured JSON seed で、station と task を機械可読に指定し、LLM generation と validation の基盤にする。関連研究整理では、LLM は narrative と rule draft に使える一方、syntactic correctness、playability、intended content への fidelity を自動で保証する点が未解決とされる。grammar masking や downstream structured validation が出力妥当性を上げる動機として扱われている。

## why_relevant_to_games
小さく制約したゲーム型、structured seed、validation から始める流れは、Codex 側のプロトタイプ生成や教育/パズル系ゲームの仕様入力形式に応用できる。

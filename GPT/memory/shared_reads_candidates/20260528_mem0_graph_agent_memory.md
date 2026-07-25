---
title: "Mem0 and Mem0-Graph: scalable long-term memory for AI agents"
url: "https://arxiv.org/abs/2504.19413"
collected_at: "2026-05-28T05:44:39.3434070+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, graph-memory, llm-agents, game-dev-cycle, memory-system]
evaluated_at: "2026-07-26T05:50:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-26T05:50:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T05:50:00+09:00"
stale_after: "2026-08-25"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  extract/update/retrieve と graph memory の構成要素は抽出できるが、候補本文は方式の要点だけで評価条件・比較結果・限界がない。
  ゲーム制作への接続も記憶階層一般に留まり、CoopEval 水準の約4000字を具体的な制作場面で支えられないため参照資料として閉じる。

---

## raw_excerpt

arXiv:2504.19413 "Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory" は、固定 context window では multi-session dialogue の一貫性維持が難しいという問題に対し、会話から salient information を動的に extract / consolidate / retrieve する memory-centric architecture を提案している。graph-based memory variant では、会話要素間の複雑な関係を graph representation で扱う。

memo.d.foundation の Mem0 & Mem0-Graph breakdown では、Two-Phase Memory Pipeline として Extraction と Update を分ける。candidate fact を既存 memory と vector similarity で比較し、LLM が ADD / UPDATE / DELETE / NOOP を決める。Mem0g では memories を directed labeled graph として表し、node は entity、edge は relation triplet、label は semantic type を持つ。update resolver が conflict と temporal reasoning を扱い、multi-hop queries を支える。

Slack では Nao_u / Mir / Log の会話で、graph memory、schema-guided memory、保存前のモデリング、post-hoc 派生層の話題と接続していた。

## why_relevant_to_games

ゲーム制作サイクルで、作品ごとの feedback、playtest failure、design intent、修正履歴を「後から検索するログ」ではなく、関係と寿命を持つ作業記憶として扱うための候補。Phase 4 以降の記憶構造検討に渡せる。

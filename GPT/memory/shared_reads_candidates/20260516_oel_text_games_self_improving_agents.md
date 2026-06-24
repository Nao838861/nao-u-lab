---
title: "OEL: Online Experiential Learning for LLM Agents"
url: https://arxiv.org/abs/2603.16856
collected_at: 2026-05-16T17:29:29+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, text-game, self-improvement, memory, evaluation]
evaluated_at: 2026-06-20T17:10:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-06-20T17:10:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-20T17:10:00+09:00"
stale_after: "2026-07-20"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  失敗ログを次試行に使う発想は制作サイクルに近いが、候補本文には学習ループの実装、経験表現、実験対象、性能差の根拠がない。
  memory routing へこじつけると抽象度が高くなるため、shared-reads ではなく参照候補として failed に閉じる。

---

## raw_excerpt
原文断片: "Online Experiential Learning" / "LLM Agents" / "experience".

arXiv要旨メモ。OEL は、LLM agent が実行中の経験からオンラインに学習し、後続の判断を改善する枠組みとして説明されている。静的なプロンプトや事前に用意された知識だけに頼るのではなく、行動、観測、失敗、修正を経験として蓄積し、次の試行で使うことを扱う。論文ページでは、長期タスクやゲーム的環境で、経験の記録と再利用がエージェント性能にどう効くかを測る方向が示されている。

## why_relevant_to_games
テキストゲーム、探索ゲーム、AIプレイヤーの反復テストで、失敗ログを次のプレイ方針に変える仕組みの参考になりそう。

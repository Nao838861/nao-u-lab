---
title: "Grounding Machine Creativity in Game Design Knowledge Representations: Empirical Probing of LLM-Based Executable Synthesis of Goal Playable Patterns under Structural Constraints"
url: "https://arxiv.org/abs/2603.07101"
collected_at: "2026-06-18T09:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design-patterns, llm-codegen, unity, executable-artifact, evaluation]
evaluated_at: "2026-06-18T09:47:52+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-18T09:47:52+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-18T09:47:52+09:00"
next_action: keep_for_reference
stale_after: "2026-07-18"
supersedes: []
gate_reason: |-
  問題設定、GPC、Unity IR、26 pattern instantiations、automated replay、grounding/hygiene failure は抽出でき、単体なら投稿水準に届く。
  ただし同一論文は過去 candidate で「2026-05-16 に品質フォーマットで投稿済み」と記録されており、今回も新しい差分がない。
  Phase 3 で再投稿するより、既存投稿への参照候補として保持するのが妥当。
---

## raw_excerpt
原文短引用: "structural and project-level grounding as primary bottlenecks"

この論文は、複雑な gameplay idea を Unity project / code のような executable artifacts に翻訳する問題を、gameplay design patterns と Goal Playable Concepts から扱う。Goal patterns は player-objective relationships を formalize し、GPCs はそれを playable Unity implementations として operationalize する。26 個の goal pattern instantiations を使い、自然言語から直接 C# / Unity を生成する baseline と、人間が書いた Unity-specific intermediate representation に条件付ける pipeline を比較する。automated Unity replay で compilation success を評価し、失敗モードとして grounding と hygiene を整理している。

## why_relevant_to_games
「面白い案」から playable artifact へ落とす時の失敗を、構造制約・project grounding・hygiene に分けて拾える候補。GameCraft-Bench 系の complete artifact 評価と並べて読む価値がある。

---
title: "From Faulty Memories to Corrected Actions: Dependency-Guided Rollback Repair for Memory-Augmented Agents"
url: "https://arxiv.org/abs/2608.10502"
collected_at: "2026-08-13T16:16:30+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, memory, recovery, provenance, game-testing]
evaluated_at: "2026-08-13T16:20:07+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-13T16:20:07+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-13T16:20:07+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  faulty memory の削除だけでは派生した claim・action・memory が残るという問題を、runtime provenance graph による影響範囲の同定と選択的再実行で解く手法が明確で、二つの評価集合の回復率も示されている。
  長期プレイテスト agent や継続 NPC の誤記憶を、正常な世界状態を壊さず局所修復する検証基盤へ具体化でき、約4000字で手法・限界・導入条件を論じられる。
suggested_post_outline:
  overview_angle: "誤った memory を消すだけでは不十分で、そこから派生した action と persistent state まで因果的に巻き戻す必要がある"
  analysis_axis: "memory-to-action provenance graph、信頼済み根拠の保持、影響範囲限定 replay の精度・費用・失敗条件"
  application_target: "長期自動プレイ、継続 NPC、制作支援 agent の state に provenance edge を持たせ、誤った観測から派生した判断だけを再実行する recovery harness"
  pros_cons: "正常 state と計算量を温存できる一方、依存 edge の欠落や過剰結合が rollback 範囲を誤らせるため provenance 完全性の監査が必要"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv 要旨の収集メモ。永続記憶は session を越えた情報再利用を可能にする一方、poisoned・stale・misattributed な記録が reasoning、tool use、answer、その後の memory write へ伝播し、誤りも永続化する。疑わしい元記憶だけを削除しても、そこから派生した claim・action・memory は残り、store 全体の reset や全 trace の replay は正常な state を壊して不要な計算を繰り返す。論文は post-failure memory recovery を、失敗 execution と診断済み faulty memory が与えられた時に、影響を受けない作業を保持しながら answer と persistent state の双方を回復する問題として定式化する。提案手法は runtime provenance から型付き memory-to-action graph を構築し、明示的な downstream dependency を追跡する。独立した信頼済み根拠を持つ候補は保持し、根拠を失った memory state を無効化し、answer に関係する影響範囲だけを選択的に再実行する。3 tool-use domain・4 memory failure type の150件では recovery 85.3%、LongMemEval-V2 由来50件では68.0%と報告され、正常 memory の保持と replay cost も併記されている。

## why_relevant_to_games

長期プレイ agent や NPC の記憶誤りが後続判断へ伝播した際、影響範囲だけを巻き戻して replay する検証基盤を考える材料になる。

---
title: "From Faulty Memories to Corrected Actions: Dependency-Guided Rollback Repair for Memory-Augmented Agents"
url: "https://arxiv.org/abs/2608.10502"
collected_at: "2026-08-13T16:16:30+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, memory, recovery, provenance, game-testing]
---

## raw_excerpt

arXiv 要旨の収集メモ。永続記憶は session を越えた情報再利用を可能にする一方、poisoned・stale・misattributed な記録が reasoning、tool use、answer、その後の memory write へ伝播し、誤りも永続化する。疑わしい元記憶だけを削除しても、そこから派生した claim・action・memory は残り、store 全体の reset や全 trace の replay は正常な state を壊して不要な計算を繰り返す。論文は post-failure memory recovery を、失敗 execution と診断済み faulty memory が与えられた時に、影響を受けない作業を保持しながら answer と persistent state の双方を回復する問題として定式化する。提案手法は runtime provenance から型付き memory-to-action graph を構築し、明示的な downstream dependency を追跡する。独立した信頼済み根拠を持つ候補は保持し、根拠を失った memory state を無効化し、answer に関係する影響範囲だけを選択的に再実行する。3 tool-use domain・4 memory failure type の150件では recovery 85.3%、LongMemEval-V2 由来50件では68.0%と報告され、正常 memory の保持と replay cost も併記されている。

## why_relevant_to_games

長期プレイ agent や NPC の記憶誤りが後続判断へ伝播した際、影響範囲だけを巻き戻して replay する検証基盤を考える材料になる。

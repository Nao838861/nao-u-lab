---
title: "MemSecBench: Tracking Agent Memory Poisoning from Persistence to Consequence and Repair"
url: "https://arxiv.org/abs/2607.27080"
collected_at: "2026-08-01T23:31:03+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-agent, memory, security, evaluation, game-development-workflow]
---

## raw_excerpt

一次資料 abstract の要点メモ（逐語引用ではない）。長期記憶を持つ agent では、攻撃者が作った悪意ある instruction が保存され、かなり後の task で recall され、実際の action を静かに変える可能性がある。既存の memory security benchmark は保存、下流の結果、選択的修復の一部だけを測ることが多いため、MemSecBench は同じ悪意ある意味内容が lifecycle 全体をどう通るかを追跡する。

benchmark は code・science、日常生活、office work にまたがる48の現実的 context から310 case を構成し、隔離 runtime 上で Write--Execute--Forget protocol を実行する。agent harness、memory backend、LLM backend を固定した構成単位で、deterministic な write check、checkpoint ごとの judge-model 評価、programmatic gate を組み合わせ、7 checkpoint を判定する。実験は2 harness、4 memory backend、3 LLM backend の24構成を含む。全構成の集計では悪意ある memory が84.2%の case で残り、Write--Execute chain 全体は50.3%で成功した。poisoning 成功例の59.6%が Execute chain を完遂し、56.1%では selective repair が成立したと報告する。構成間で end-to-end attack と repair の差が大きく、memory stack 全体を lifecycle 単位で比較する必要を示す。

## why_relevant_to_games

長期運用するゲーム制作 agent が過去の playtest、設計 lesson、外部記事を再利用する時、保存成功だけでなく recall 後の実装影響と、正しい記憶を残した選択的修復まで通して検証する評価設計の材料になる。

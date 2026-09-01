---
title: "ORDDAR: Observation-Driven Reasoning for Distortion-Resilient Decision, Action, and Cognitive Recovery"
url: "https://arxiv.org/abs/2608.28704v1"
collected_at: "2026-09-01T17:04:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, automated-playtesting, agent-recovery, sequential-decision-making, interpretability]
---

## raw_excerpt

arXiv:2608.28704v1（2026-08-27投稿）、Deblina Kar、Anant Nawalgaria、Shyamal Kumar Das Mandal。要旨では、長期推論、計画、tool use、memory integration、自律的意思決定を行う AI agent は、途中で生じた誤った状態が後続へ伝播し、判断の不整合や出力の不安定化を起こすと問題設定している。既存手法は iterative planning、self-reflection、augmented memory、verification を主に用いるが、誤りが生じた推論箇所を局所化し、その部分だけを選択的に直すものは少ないという。

ORDDAR は推論を cognitive state transition として表し、局所的な distortion を検出し、過去経験から関連する推論を検索し、影響を受けた state だけを修復する。軌跡全体を最初から再生成せず、誤りを含む reasoning transition の単位で recovery を行う点が構成の中心である。要旨は、数学、commonsense、multi-hop、clinical reasoning の benchmark 群で複数の reasoning baseline と比較し、reasoning quality、recovery ability、interpretability の改善を報告している。一次資料は arXiv API の title・abstract・metadata。

## why_relevant_to_games

自動プレイテスト agent や NPC が観測欠損・状態誤認を含む長い行動列を実行する際、全 trajectory のやり直しではなく、壊れた state transition を特定して局所復旧する設計資料になり得る。

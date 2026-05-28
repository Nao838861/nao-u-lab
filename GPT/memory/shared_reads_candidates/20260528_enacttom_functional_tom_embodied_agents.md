---
title: "EnactToM: An Evolving Benchmark for Functional Theory of Mind in Embodied Agents"
url: "https://arxiv.org/abs/2605.09826"
collected_at: "2026-05-28T15:14:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-agent, multi-agent, theory-of-mind, benchmark, embodied-games]
---

## raw_excerpt
arXiv 2605.09826。既存の Theory of Mind benchmark は、直接的な belief question に答えさせる literal ToM に偏り、partial observability、private information、constrained communication の下で相手の implicit belief を使って最適行動できるかという functional ToM は十分に測れていない、という問題設定。EnactToM は 3D household 環境の 300 embodied multi-agent tasks で構成され、各 task は solvability と required epistemic depth が formal verification される。hard split では、評価された 7 frontier models が functional task completion で 0.0% Pass^3、literal belief probe では平均 45.0%。失敗分析では sampled failures の 93% が、情報を伝えない、相手の制約を無視する、message allocation を誤るといった epistemic coordination breakdown に由来する。短い原文メモ: "functional ToM", "epistemic coordination breakdowns"。

## why_relevant_to_games
協力ゲームや情報非対称ゲームで、NPC/AI teammate が「知っていること」「伝えるべきこと」「相手が動ける制約」を扱えるかを見る評価軸として使えそう。3D 家庭環境だが、ステルス、協力パズル、非対称マルチにも転用可能。

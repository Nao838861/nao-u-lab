---
title: "SkillEvo: Self-Renewing Evolution Gradients from Multi-Turn Interaction Feedback"
url: "https://arxiv.org/abs/2608.13120v1"
collected_at: "2026-08-18T10:15:09+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, agent-skills, multi-turn-evaluation, iterative-design, game-development]
---

## raw_excerpt

arXiv abstract の収集メモ。現状の Agent Skills は人手で書かれるか、一回の LLM 生成で作られることが多く、skill 自身が引き起こした interaction failure から改善する閉ループを持たない。既存の自動改善も single-turn question answering の評価に依存するため、一往復で見える欠陥を直すと改善信号が弱まり、複数ターンを通じて初めて現れる欠陥は見えないまま evolution が停滞する。さらに end-to-end の単一 verification score は、劣化版を棄却できても、構造的な原因の位置特定や修復はできない。

SkillEvo は multi-turn user simulation を最終評価ではなく feedback generator として使い、follow-up question によって欠陥を層ごとに露出させる。各改訂roundは既存feedbackを消費すると同時に次のfeedbackを生む。これに独立した governance layer を組み合わせ、事実劣化と構造的肥大を能動的に修復して、改訂方向のdriftを抑える。評価対象は cloud service 6カテゴリ、production Skills 9件、skill-reference files 98件。abstract は self-reflection-based evolution より23.0 points、single-turn-QA-driven evolution より15.4 points高い結果を報告する。

## why_relevant_to_games

ゲーム制作skillを単発の生成結果だけで評価せず、連続プレイ、追加要求、改稿の往復で初めて出る欠陥を次のskill改訂feedbackとして収集する設計資料になりうる。

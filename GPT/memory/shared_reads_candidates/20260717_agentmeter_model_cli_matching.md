---
title: "AgentMeter: Evaluating Model-CLI Matching for CLI-Based Local Task-Solving Agents"
url: "https://arxiv.org/abs/2606.21140"
collected_at: "2026-07-17T06:20:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, evaluation, harness, game-testing, automation]
---

## raw_excerpt

arXiv:2606.21140、2026-06-19 投稿。LLM agent が code 編集、repository 調査、data analysis、file 操作などを行う際、実際の挙動は model 単体ではなく、prompt、context replay、tool output、file access、terminal observation、停止条件を仲介する CLI harness との組み合わせで決まる、と問題設定している。同じ model でも CLI が異なれば task success、token 使用量、cost profile が変わるため、model と CLI を分離して評価しない AGENTMETER benchmark を提案する。

評価セットは full validation の Benchmark90 と、24 通りの model-CLI 構成を比較する低コスト subset Core30。指標 AgentMeter Score (AMS) は task success を基点に、calibrated task-effort tier と cost を組み合わせる。Core30 では Pass/30、token/pass、billable USD/pass、AMS の各基準がそれぞれ別の構成を首位に選んだ。Benchmark90 での検証では Top-1 と Top-3 の集合が維持され、Core30 との順位相関も報告されている。原文の結論は “model-CLI configurations should be evaluated as the deployed unit.”

## why_relevant_to_games

AI によるゲームの headless test、playtest、prototype 編集を比較する時、model 名だけでなく観測提示・tool 接続・停止条件を含む harness 全体を評価単位にする観点へつながる。

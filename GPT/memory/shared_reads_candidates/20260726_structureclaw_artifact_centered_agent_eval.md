---
title: "StructureClaw: Traceable LLM Agents and an Executable Benchmark for Structural Engineering Workflows"
url: "https://arxiv.org/abs/2607.14896"
collected_at: "2026-07-26T21:47:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agents, executable-evaluation, traceability, workflow-testing, game-development]
---

## raw_excerpt

arXiv abstract の内容を忠実に日本語で抜粋・再構成: 構造工学の依頼に答えるには単一の最終回答だけでなく、解釈済み requirements、計算可能な model、validation records、solver outputs、code-check records、final report という相互依存した artifact chain が必要になる。question answering や script generation を中心にした評価は、この連鎖全体を検証しないため、workflow が不完全・内部矛盾・実行不能でも流暢な出力を評価してしまう。StructureClaw は、governed engineering skills、typed tools、shared artifact state、local analysis backends を通して agent が作業する artifact-centered workbench。StructureClaw-Bench は standard workflow execution、interactive robustness、multimodal structural-model reconstruction にまたがる 150 の controlled scenario を持ち、必要な artifact-level assertion と execution-level assertion が単一 run ですべて通った時だけ成功とする。10 種の agent-model configuration を同じ 50 standard case で比較した結果、平均 Success Rate は generic-skill baseline の 56.8% から full automatic workflow の 88.6% へ上昇した。残る課題として invalid numerical input の安全な処理と、fixture と整合する structural model reconstruction が挙げられている。

## why_relevant_to_games

ゲーム制作 agent の評価を「最終的に画面が出たか」だけでなく、設計条件、playable build、検証 trace、テスト結果、変更記録が整合しているかへ広げる実行可能な benchmark 設計の参考になる。level generator や自動 playtest pipeline の途中 artifact を型付き state として検査する場面に接続できる。

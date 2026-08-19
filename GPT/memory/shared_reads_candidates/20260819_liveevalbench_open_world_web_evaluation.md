---
title: "LiveEvalBench: Toward Open-World Evaluation for Web Generation"
url: "https://arxiv.org/abs/2608.03689v1"
collected_at: "2026-08-19T20:47:14+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm, evaluation, web-generation, browser-testing, game-testing, multi-agent]
---

## raw_excerpt
2026年8月4日投稿の arXiv:2608.03689v1。著者らは、実行可能な frontend project の生成評価を screenshot や静的な仕様一致だけで済ませると、artifact が操作可能で、同じ要件にも複数の正しい実装があり、技術環境も速く変化する性質を捉えられないとする。LiveEvalBench は評価を agentic な collaborative review workflow に組み替え、Build Engineer が deployment と実行状態、Code Engineer が実装、UI Tester が browser 上の interaction を調べ、project lifecycle 全体から evidence を集める。implementation diversity への対応として、model 間比較に使う shared rubric と、各 artifact の実装事実に基づく implementation-grounded criteria を組み合わせる。評価役や assessment dimension は pipeline 全体を作り直さず追加できる設計とされる。要旨では diverse real-world web-generation scenarios で human expert judgment と近く、frontier model の能力を細粒度で示したと報告している。中心となる原文表現は “interactive rather than static” と “from deployment and code inspection to browser-based interaction”。

## why_relevant_to_games
HTML/CSS/JS ゲーム試作の評価を、build 成否・code inspection・実ブラウザ操作の証拠へ分け、共通 rubric と作品固有の成立条件を併用する playtest harness の参考になる。

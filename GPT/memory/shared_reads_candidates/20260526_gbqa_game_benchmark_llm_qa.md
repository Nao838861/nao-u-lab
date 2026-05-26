---
title: "GBQA: A Game Benchmark for Evaluating LLMs as Quality Assurance Engineers"
url: https://arxiv.org/abs/2604.02648
collected_at: 2026-05-26T22:11:26+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, qa, llm-agent, benchmark, evaluation]
---

## raw_excerpt
arXiv:2604.02648。2026-04-03 submitted、ICLR 2026 workshop paper。ゲーム開発を、LLM が実行環境内でバグを自律発見できるかを測る代表 domain として使う。GBQA は 30 games と 124 human-verified bugs を含み、難易度を 3 段階に分ける。benchmark は multi-agent system で games を作り bug を注入し、人間 expert が correctness を確認する。baseline interactive agent は multi-round ReAct loop と memory mechanism を持ち、long-horizon exploration でバグ検出を試す。実験では frontier LLM でも autonomous bug discovery は難しく、best-performing model でも verified bugs の 48.39% に留まる、という結果が示されている。

## why_relevant_to_games
Nao_u 側の headless 評価や bot policy 検証を「ゲームQAとして何を見落とすか」の候補軸にできる。制作物の自動検査で、静的コード成功と実プレイ上のバグ発見を分ける材料になる。

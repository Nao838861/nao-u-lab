---
title: "[Re] Benchmarking LLM Capabilities in Negotiation through Scoreable Games"
url: "https://arxiv.org/abs/2602.18230"
collected_at: "2026-07-09T23:48:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, negotiation, benchmark, evaluation, multi-agent]
---

## raw_excerpt
arXiv:2602.18230。Jorge Carrasco Pollo, Ioannis Kapetangeorgis, Joshua Rosenthal, John Hua Yao による Scoreable Games negotiation benchmark の再現・拡張検証。抄録は、LLM は multi-agent negotiation task で大きな可能性を示すが、robust で generalizable な benchmark が不足しているため評価が難しい、という問題設定から始める。

対象は Abdelnabi et al. (2024) の Scoreable Games benchmark。論文は元実験を追加モデルで replicate し、negotiation quality と evaluation evenness を確認する追加 metric を導入する。結果として、benchmark は複雑ではあるが、model comparison は ambiguous であり objectivity に疑問が残る、と述べている。さらに information leakage detection と ablation study の thoroughness に制約がある点を指摘し、より広い model 群での行動分析を通じて、benchmark 利用者に追加 context を与えることを狙う。

短い原文断片: "model comparison is ambiguous" / "importance of context in model-comparative evaluations"。

## why_relevant_to_games
交渉・取引・同盟・裏切りを含むゲームで、AI actor の強さを単純な勝率だけで比べると評価が歪む可能性を拾える。Scoreable Games の再現性論点は、Nao_u 向け headless multi-agent 評価の metric 設計候補になる。

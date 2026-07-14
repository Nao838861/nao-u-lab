---
title: "ORBIT-Q: Dual-axis benchmarking of autonomous agents in scientific quantum programming"
url: "https://arxiv.org/abs/2607.03105"
collected_at: "2026-07-14T13:40:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, benchmark, harness, evaluation, scientific-programming]
---

## raw_excerpt

従来型のプログラミング課題で高い成績を示す自律 coding agent でも、科学計算ではテストを通すだけでは足りず、物理的忠実性、微分可能な workflow、利用 framework 固有の意味論、規模を拡大できる表現を同時に保つ必要がある。ORBIT-Q は研究水準の量子計算 workflow を課題群として用意し、多段階の verification pipeline で生成物を検査する。比較軸は二つに分離されており、量子 software framework を固定して agent harness / model 構成を比較する軸と、agent を固定して framework を比較する軸がある。さらに agent 側の resource 使用量と、生成 artifact 側の runtime efficiency も別々に測る。著者らの評価では TensorCircuit-NG と Codex + GPT-5.5 の組合せがテスト対象中で最も高い能力と効率を示した一方、frontier agent と人間専門家による参照実装の間には性能・設計の両面でなお大きな差が残った。

## why_relevant_to_games

ゲーム制作 agent の比較でも、model / harness の能力と engine / framework 側の適合性を混同せず、playable artifact の正しさ・実行効率・設計品質を別軸で検証する benchmark 設計の材料になりうる。

---
title: "SimWorld Studio: Automatic Environment Generation with Evolving Coding Agent for Embodied Agent Learning"
url: "https://arxiv.org/abs/2605.09423"
collected_at: "2026-05-29T03:59:57+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [environment-generation, embodied-agent, curriculum, simulation, tools]
---

## raw_excerpt

原文短句: "evolving embodied learning environments" / "verifier feedback" / "adaptive curricula"。

arXiv要旨メモ。SimWorld Studio は Unreal Engine 5 上で、embodied agent の学習用3D環境を自動生成する open-source platform として説明されている。中心は SimCoder という tool / skill augmented coding agent で、言語または画像の指示から engine-level code を書き、物理的に接地した3D世界を構築する。生成された環境は、コンパイルエラー、物理チェック、VLM critique などの verifier feedback で修正され、SimCoder は再利用可能な tool / skill library も増やす。環境は Gym-style interface として出力され、agent performance feedback によって、学習者の能力境界に近い難度の環境を作る co-evolution も扱う。論文要旨では、自己進化による生成信頼性、未知 benchmark への generalization、固定環境学習に対する success-rate gain が報告されている。

## why_relevant_to_games

ゲーム制作では、敵配置やステージを「完成物」ではなく検証つき環境生成ループとして扱う参考になる。特に headless 評価と生成難度の連動を見るための候補。

---
title: "Beyond Playtesting: A Generative Multi-Agent Simulation System for Massively Multiplayer Online Games"
url: "https://arxiv.org/abs/2512.02358"
collected_at: "2026-05-15T10:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, simulation, llm-agents, balancing, mmo]
---

## raw_excerpt

arXiv:2512.02358。2025-12-02 submitted。著者は Ran Zhang, Kun Ouyang, Tiancheng Ma, Yida Yang, Dong Fang。

短い原文抜粋: "Beyond Playtesting" / "generative agent-based MMO simulation system" / "realistic and interpretable player decision-making"。

内容メモ: MMO の数値システムやメカニズム設計を、オンライン実験や固定統計モデルだけに頼らず、実プレイヤー行動データで適応させた LLM エージェントと、ゲームログから学習した環境モデルでオフラインに検証する研究。SFT と RL で一般 LLM をゲーム固有の意思決定へ寄せ、介入への反応が現実プレイヤー行動と整合するかを見ている。主眼は QA の自動化というより、経済・成長・報酬・進行などのシステム変更を、プレイヤー集団の反応として事前に見積もること。

## why_relevant_to_games

Nao_u 側の小規模ゲームでも、敵生成・報酬・難易度変更を「平均プレイ」ではなく複数プレイヤー像の反応として試算する発想に使える。特に graze_log 系の wave/room/パターン調整候補を、実装前にシミュレーションで比較する候補になる。

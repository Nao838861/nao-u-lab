---
title: "Latent Action Reparameterization for Efficient Agent Inference"
url: "https://arxiv.org/abs/2605.18597"
collected_at: "2026-05-28T15:14:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-agent, action-space, planning, efficiency, game-testing]
---

## raw_excerpt
arXiv 2605.18597。LLM agent は低レベルの textual action を長く連ねるため、effective decision horizon が長くなり、推論コストも高くなる、という問題設定。Latent Action Reparameterization (LAR) は、各 latent action が multi-step semantic behavior に対応する compact latent action space を学習し、agent の planning / execution をより短い horizon で行えるようにする。hand-crafted macro や hierarchical controller と異なり、latent action は agent trajectories から学習され、model に直接統合される。複数の LLM-based agent benchmark で、action token と wall-clock inference time を減らしつつ、task success rate を維持または改善したと報告されている。短い原文メモ: "multi-step semantic behavior", "shorter effective horizon"。

## why_relevant_to_games
ゲーム AI の操作ログを低レベル入力列ではなく、回避、接近、射撃準備、リロード誘導などの意味単位に畳む発想として使える。headless テスト bot の policy 記述や、リプレイ解析の圧縮にもつながる。

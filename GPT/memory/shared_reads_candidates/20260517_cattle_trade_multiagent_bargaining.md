---
title: "Cattle Trade: A Multi-Agent Benchmark for LLM Bluffing, Bidding, and Bargaining"
url: "https://arxiv.org/abs/2605.14537"
collected_at: "2026-05-17T07:44:05+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, benchmark, bargaining, hidden-information, agent-evaluation]
---

## raw_excerpt

arXiv:2605.14537。2026-05-14 submitted。Robert Muller / Clemens Muller による multi-agent benchmark。対象は、LLM agent が不完全情報、敵対的相互作用、資源制約のある長期ゲームで、bluffing、bidding、bargaining、opponent modeling、resource allocation を統合して使えるかを見るもの。Cattle Trade は 50-60 turn の競争的な経済ゲームで、auction、hidden-offer trade challenge、counteroffer、card selection などを一つの環境にまとめる。論文は最終スコアや勝率だけでなく、全ての bid、offer、counteroffer、card selection を記録して行動分析できる点を強調している。評価は 7 種の cost-efficient language models と 3 種の deterministic code agents、合計 242 games。結果メモとして、rank には spending volume や単一 subskill より、spending efficiency、resource discipline、phase-adaptive bidding のような strategic coherence が強く関係する。2 種の heuristic code agents は多くの LLM より上で、LLM には overbidding、self-bidding、bankrupt TC initiation、opponent-state adaptation の弱さなどが出る。

## why_relevant_to_games

ゲームを agent 評価環境として使う時、最終勝敗ではなく「いつ・なぜ資源を使いすぎたか」「相手状態へ適応したか」をログから読む設計例になる。Nao_u 側の multiplayer / 経済 / 交渉系プロトタイプや headless 評価 harness の観測項目づくりに使える。

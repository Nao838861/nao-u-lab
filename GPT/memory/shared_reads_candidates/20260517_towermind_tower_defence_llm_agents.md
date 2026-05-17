---
title: "TowerMind: A Tower Defence Game Learning Environment and Benchmark for LLM as Agents"
url: "https://arxiv.org/abs/2601.05899"
collected_at: "2026-05-17T09:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, benchmark, rts, tower-defense, multimodal-evaluation]
---

## raw_excerpt

arXiv:2601.05899。Dawei Wang ほか、AAAI 2026 Oral。論文ページの要旨では、RTS は macro-level strategic planning と micro-level tactical adaptation/action execution を同時に要求するため、LLM agent 評価に向くが、既存 RTS 環境は計算負荷が高いか textual observation が弱い、と問題設定している。TowerMind は tower defense を RTS の軽量サブジャンルとして使い、pixel-based、textual、structured game-state representation を含む multimodal observation space を持つ。5 つの benchmark levels で複数 LLM を評価し、human experts との能力差と hallucination 差を測る。結果として、planning validation の不足、multifinality の弱さ、action use の非効率が観測される。Ape-X DQN と PPO も比較対象に含める。

## why_relevant_to_games

タワーディフェンスは短いプロトタイプでも「配置計画」「局面適応」「行動の無駄」を測りやすい。Nao_u_BOT の headless 評価で、画面・テキスト・構造化状態を分けて観測する候補になる。

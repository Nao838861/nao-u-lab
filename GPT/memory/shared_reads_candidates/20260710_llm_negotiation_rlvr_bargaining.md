---
title: "Strategic Bargaining in Multi-Buyer Markets: Reinforcement Learning from Verifiable Rewards for LLM Negotiations"
url: "https://arxiv.org/abs/2607.05863"
collected_at: "2026-07-10T20:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, negotiation, multi-agent, llm-agent, verifiable-reward, bargaining]
---

## raw_excerpt
arXiv:2607.05863。2026-07-07 submitted。Shuze Daniel Liu, Claire Chen, Jiabao Sean Xiao, Xin Chen, David Simchi-Levi による、複数買い手市場での LLM negotiation を扱う研究。要旨では、交渉を「合意を目指しつつ、reservation costs や hidden valuations のような private information を守る strategic interaction」と置いている。設定は、1 人の seller が private budget を持つ複数 buyer と限られた communication turns の中で並行交渉する場面。標準 LLM は言語的には流暢でも、economic decision-maker としては buyer pool の探索に失敗し、現在の最高 bid に固着しやすいとされる。提案は Reinforcement Learning from Verifiable Rewards (RLVR) を使い、objective economic outcomes に reward を固定することで、短い quote では "market discovery and surplus extraction" のバランスを学習させるもの。結果として、seller は price anchoring と strategic probing を使い、未知の buyer style や budget distribution にもある程度 generalize すると報告されている。

## why_relevant_to_games
交渉、取引、説得、情報隠しを含むゲームで、LLM agent を会話の上手さだけでなく、探索と確定の配分、隠れ評価値の推定、verifiable reward で測る候補として使える。

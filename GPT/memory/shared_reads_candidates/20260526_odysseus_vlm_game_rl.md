---
title: "Odysseus: Scaling VLMs to 100+ Turn Decision-Making in Games via Reinforcement Learning"
url: "https://arxiv.org/abs/2605.00347"
collected_at: "2026-05-26T03:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtest, ai-agent, vlm, reinforcement-learning, platformer]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv metadata / abstract の要点メモとして保存する。短い原文句: "100+ turns" / "lightweight turn-level critic"。

Odysseus は、VLM を video game のような interactive decision-making task へ拡張する研究。既存手法は human trajectory による大規模 SFT、または 20-30 turn 程度の短い RL 設定に寄りがち、という問題設定を置く。対象環境は Super Mario Land で、100 turn 以上に渡り、画面理解、推論、操作選択をつなげる必要がある。提案は RL-based training を安定させるため、PPO に軽量な turn-level critic を組み合わせる adapted variant。critic-free な GRPO や Reinforce++ と比べて training stability と sample efficiency を改善する、とされる。さらに pretrained VLM が強い action prior を持つため、古典的 deep RL のゼロからの学習より sample efficiency がよく、action engineering の手作業負担も下がる、という主張。結果は複数 level、in-game / cross-game generalization、general-domain capabilities 維持を含む構成。

## why_relevant_to_games
LLM/VLM をゲーム制作用の自動プレイヤー・評価者にする時、「長いプレイをどこで崩すか」を見る候補。Nao_u_BOT の headless 評価で、単発入力ではなく長期ターンの安定性を測る発想に使える。

---
title: "Exploring Gameplay With AI Agents"
url: "https://arxiv.org/abs/1811.06962"
collected_at: "2026-06-26T09:44:40+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [playtesting, ai-agent, simulation, balance, game-design]
---

## raw_excerpt
arXiv 1811.06962。The Sims Mobile を題材にした automated playtesting の研究。論文は playtesting を subjective、expensive、incomplete と置き、実ゲーム client を直接操作する代わりに、bare bone mechanics を別システムとして再実装し、agent が短時間で多数の simulation を回す方法を示している。game designers が持つ質問に対して、agent の探索結果から行動バランス、意味の薄い reward、optional strategy の有効性を見た、という位置づけ。

raw に保存済みの本文では、実クライアント側 AI では制約が多かったため、tuning files から mechanics simulator を作る流れが説明されている。利点として、game state の完全制御、時間の巻き戻しや早送り、数千倍速に近い実行、build 間比較が挙げられている。結果例として、似た reward の action、特定 event の必要 action 数の突出、career balance、energy recharge 関連の strategy などを simulation で露出し、design changes に接続した。

短い原文句: "collects data to answer questions posed by the designers" / "recreates the bare bone mechanics" / "thousands of game simulations"

## why_relevant_to_games
Nao_u_BOT の headless 評価で、実ゲームそのものを無理に操作するより、core mechanics を小さく分離して高速 simulation する発想に直結する。特に「ユーザーの主観的な不満」を designer question に変換して bot policy で検査する時の古典的な素材。

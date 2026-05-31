---
title: A deep generative approach to personalized super mario level design
url: https://www.nature.com/articles/s41598-026-46199-1
collected_at: 2026-05-18T05:59:17+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [pcg, personalized-level-design, platformer, ai-game-design, difficulty]
candidate_status: needs_review
status: needs_review
last_reviewed_at: "2026-05-18T05:59:17+09:00"
last_decision: needs_review
evidence: "candidate_file:20260518_personalized_super_mario_level_gan.md; status:needs_review"
next_action: evaluate_in_phase2
stale_after: "2026-06-17"
supersedes: []

---

## raw_excerpt
Scientific Reports 掲載の 2026-04-18 論文。対象はプレイヤー技能に合わせた Super Mario 系レベル生成で、プレイヤー行動を Spectral Clustering で技能グループに分け、そのラベルを条件として GAN に入力する。比較対象は U-Net GAN、StyleGAN、DCGAN、ResNet-GAN、SN-GAN の 5 種で、評価指標は tile distribution entropy、diversity score、discriminator accuracy、generation speed、pairwise Hamming distance。短い引用: "appropriately match a player's skill level"。本文メモとしては、技能が上がるほど生成レベルは死亡数とクリア時間を抑えつつ、高いジャンプやコイン収集などの複雑な相互作用を促す傾向が報告されている。ResNet 系と U-Net 系が diversity / playability / training stability のバランスで有利とされ、skill-conditioned PCG の評価軸を複数指標で並べている。データ参照先として Mario-AI-Framework も示されている。

## why_relevant_to_games
難易度調整を「失敗回数」だけでなく、技能クラスタ、操作複雑度、レベル多様性で見る候補。Nao_u 作品の headless 評価や DDA/PCG の評価項目を作る時の材料になる。

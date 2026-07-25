---
title: A deep generative approach to personalized super mario level design
url: https://www.nature.com/articles/s41598-026-46199-1
collected_at: 2026-05-18T05:59:17+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [pcg, personalized-level-design, platformer, ai-game-design, difficulty]
evaluated_at: "2026-07-25T23:07:50+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
status: ready_to_post
last_reviewed_at: "2026-07-25T23:07:50+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-25T23:07:50+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-24"
supersedes: []
gate_reason: >-
  skill clustering を条件ラベルへ変換し、5 GAN architecture を複数指標で比較する手順と、skill 別に生じた level 特性まで抽出できている。
  difficulty を死亡回数だけでなく操作複雑度・多様性・playability へ分解でき、headless 評価への適用を含む ~4000字の独立分析を構成できる。
suggested_post_outline:
  overview_angle: "player 行動の skill cluster を条件付き level generation と多面的評価へ接続する一連の設計"
  analysis_axis: "personalization の妥当性を生成品質・多様性・速度・実際の攻略挙動へ分解して読む"
  application_target: "Log_cdx の platformer / action prototype における複数 bot policy 別の難易度生成と回帰評価"
  pros_cons: "技能別の適応と評価軸の具体性が強み。Mario 固有 dataset と技能クラスタの固定化、GAN の説明可能性が弱み"
  verdict_pre: "部分採用"

---

## raw_excerpt
Scientific Reports 掲載の 2026-04-18 論文。対象はプレイヤー技能に合わせた Super Mario 系レベル生成で、プレイヤー行動を Spectral Clustering で技能グループに分け、そのラベルを条件として GAN に入力する。比較対象は U-Net GAN、StyleGAN、DCGAN、ResNet-GAN、SN-GAN の 5 種で、評価指標は tile distribution entropy、diversity score、discriminator accuracy、generation speed、pairwise Hamming distance。短い引用: "appropriately match a player's skill level"。本文メモとしては、技能が上がるほど生成レベルは死亡数とクリア時間を抑えつつ、高いジャンプやコイン収集などの複雑な相互作用を促す傾向が報告されている。ResNet 系と U-Net 系が diversity / playability / training stability のバランスで有利とされ、skill-conditioned PCG の評価軸を複数指標で並べている。データ参照先として Mario-AI-Framework も示されている。

## why_relevant_to_games
難易度調整を「失敗回数」だけでなく、技能クラスタ、操作複雑度、レベル多様性で見る候補。Nao_u 作品の headless 評価や DDA/PCG の評価項目を作る時の材料になる。

---
title: "WorldOlympiad: Can Your World Model Survive a Triathlon?"
url: "https://arxiv.org/abs/2606.11129"
collected_at: "2026-06-14T15:59:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [world-models, evaluation, game-simulation, video-generation, agent-harness]
evaluated_at: "2026-06-14T16:04:37+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-14T16:04:37+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-14T16:04:37+09:00"
next_action: revise_or_research
stale_after: "2026-07-14"
supersedes: []
gate_reason: |-
  physical faithfulness、geometric consistency、interaction fidelity という軸はゲーム制作の動画/world model 評価に有用。
  ただし現 candidate は要旨メモ中心で、各 track の dataset、task、scoring、比較結果が薄く、CoopEval 水準の概要には原文精読が必要。
---

## raw_excerpt

arXiv 2606.11129。2026-06-09 投稿。Yuke Zhao ほか。

検索結果と arXiv 要旨による一次メモ。WorldOlympiad は、動画ベースの world model を、見た目の品質や短期 temporal coherence だけでなく、physical faithfulness、geometric consistency、interaction fidelity の三方向から診断する benchmark。対象は gaming、robotics、general real-world videos の三つで、ゲーム領域も明示的に含む。physical track では object segmentation と MLLM-as-judge を使い、mechanics、thermal phenomena、material properties などの解釈可能なルールに従うかを見る。geometry track では生成動画を Gaussian splatting で再構成し、構造一貫性、cross-view coherence、camera trajectory alignment を評価する。interaction track では、複雑な action prompt に沿って rollout が進むか、連続する video chunk 間で状態や遷移が破綻しないかを見る。検索結果では、現行モデルに physical reasoning、3D consistency、long-horizon interaction の大きなギャップが残るとされている。

## why_relevant_to_games

生成動画や world model をゲーム制作に使う時、「映像が綺麗」ではなく、操作入力に対する状態保存・地形/物体の3D一貫性・長期chunk間の破綻を測る観点として使える。

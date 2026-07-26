---
title: "WorldOlympiad: Can Your World Model Survive a Triathlon?"
url: "https://arxiv.org/abs/2606.11129"
collected_at: "2026-06-14T15:59:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [world-models, evaluation, game-simulation, video-generation, agent-harness]
evaluated_at: "2026-07-27T07:07:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T07:07:54+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-27T07:07:54+09:00"
next_action: keep_for_reference
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  physical・geometry・interaction の三軸は生成型ゲーム世界の評価に有用だが、候補本文は各 track の概念説明までしか保持していない。
  dataset・task・scoring・モデル別結果を示せず benchmark の中身を再現できないため、CoopEval 水準には届かず参照用として閉じる。
---

## raw_excerpt

arXiv 2606.11129。2026-06-09 投稿。Yuke Zhao ほか。

検索結果と arXiv 要旨による一次メモ。WorldOlympiad は、動画ベースの world model を、見た目の品質や短期 temporal coherence だけでなく、physical faithfulness、geometric consistency、interaction fidelity の三方向から診断する benchmark。対象は gaming、robotics、general real-world videos の三つで、ゲーム領域も明示的に含む。physical track では object segmentation と MLLM-as-judge を使い、mechanics、thermal phenomena、material properties などの解釈可能なルールに従うかを見る。geometry track では生成動画を Gaussian splatting で再構成し、構造一貫性、cross-view coherence、camera trajectory alignment を評価する。interaction track では、複雑な action prompt に沿って rollout が進むか、連続する video chunk 間で状態や遷移が破綻しないかを見る。検索結果では、現行モデルに physical reasoning、3D consistency、long-horizon interaction の大きなギャップが残るとされている。

## why_relevant_to_games

生成動画や world model をゲーム制作に使う時、「映像が綺麗」ではなく、操作入力に対する状態保存・地形/物体の3D一貫性・長期chunk間の破綻を測る観点として使える。

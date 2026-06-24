---
title: "EffiNav: Fusing Depth and Vision-Language for Efficient Object Goal Navigation"
url: "https://arxiv.org/abs/2606.18634"
collected_at: "2026-06-22T06:59:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [navigation, embodied-agent, spatial-reasoning, level-design, evaluation]
evaluated_at: "2026-06-22T07:03:15+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-22T07:03:15+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-22T07:03:15+09:00"
next_action: revise_or_research
stale_after: "2026-07-22"
supersedes: []
gate_reason: |
  Object Goal Navigation の成功率だけでなく探索効率や冗長移動を見る観点は、探索型ゲームや NPC 経路評価に使える。
  ただし現メモだけでは EffiNav 固有の深度/VLM 融合手法とゲーム制作の具体タスクの接続が薄く、~4000字の投稿にすると一般的な「探索効率が大事」に寄りやすい。
  Habitat / GOAT-BENCH 側の評価詳細か、既存ゲーム AI 経路評価への具体写像を追加してから再判定する。
---

## raw_excerpt
arXiv と web_research から拾った一次メモ。EffiNav は、未知環境で目標 object を探す Object Goal Navigation を扱う。成功したかどうかだけでなく、どれだけ効率よく探索したかを重視する問題設定で、navigation trajectory の効率が、agent がどれだけ賢く探索し、後続タスクにどれだけ時間を残せるかを表すと置く。既存手法には、訓練型 model の generalization 問題や、非訓練 framework の効率問題があり、最悪の場合は既訪問領域の過剰探索や不要な往復移動が起きる。EffiNav は depth と vision-language を融合し、次にどこを探索するかを決める仕組みとして提案され、Habitat Matterport 3D、Open-Vocabulary Object goal Navigation、実ロボット、さらに GOAT-BENCH の memory-augmented ObjNav へ拡張して評価されている。指標は Success Rate と Success weighted by Path Length で、効率、頑健性、実用性を示す構成。

## why_relevant_to_games
探索型ゲーム、ステルス、ダンジョン、NPC/AI プレイヤーの経路評価で、到達可否だけでなく「無駄な往復」「既探索領域への固着」「次の目標選択」を測る観点として使える。

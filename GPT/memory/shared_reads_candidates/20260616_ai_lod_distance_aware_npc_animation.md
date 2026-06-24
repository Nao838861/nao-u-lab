---
title: "AI Level of Detail: Distance-Aware ML Model Precision Selection for Real-Time Human Motion Prediction in Games"
url: "https://arxiv.org/abs/2606.06565"
collected_at: "2026-06-16T00:15:45+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-tech, npc-animation, runtime-performance, ml-inference, siggraph]
evaluated_at: "2026-06-16T00:20:10+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-16T00:20:10+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-16T00:20:10+09:00"
next_action: revise_or_research
stale_after: "2026-07-16"
supersedes: []
gate_reason: |-
  距離に応じて ML inference precision を切り替える AI LOD という着想は、NPC animation の runtime cost と知覚品質の切り分けに直接つながる。
  ただし現メモだけでは評価条件・品質劣化の測り方・ゲーム実装上の制約が薄く、CoopEval 水準の約4000字投稿にするには論文本体の確認が必要。
---

## raw_excerpt

arXiv:2606.06565。2026-06-04 submitted、SIGGRAPH Technical Workshops 2026 camera-ready。Modern game engine では、learned motion model を使って NPC animation を動かす場合、複数 NPC の runtime inference cost が問題になる。論文は AI Level of Detail (AI LOD) として、プレイヤーカメラからの距離に応じて ML model の inference precision を切り替える考え方を提案している。古典的な geometry LOD が遠距離の mesh を低詳細版に差し替えるのと同じ発想で、ここでは FP32 / FP16 / INT8 のような量子化済み ONNX Runtime variant を距離ベース selector で切り替える。

要旨では、Li et al. の convolutional sequence-to-sequence model を代表例として使い、CMU Mocap dataset で評価している。主張は、各 precision tier を距離範囲に割り当てると、知覚上ほぼ問題にならない品質低下で提供できるという初期証拠が得られた、というもの。対象は human motion prediction in games だが、より広く「context によって perceptual sensitivity が変わる AI runtime system」へ inference-time quantization を LOD 軸として使える可能性を示している。

## why_relevant_to_games

NPC や群衆の AI animation を増やす時、見えている品質と実行コストを距離・文脈で切り替える設計メモになる。小規模プロトタイプでも、画面中心・近距離・評価対象だけを高精度にし、周辺 NPC を軽量化する発想へ接続できる。

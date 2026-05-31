---
title: "PromptVFX: Text-Driven Fields for Open-World 3D Gaussian Animation"
url: "https://arxiv.org/abs/2506.01091"
collected_at: "2026-05-16T09:29:08+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-art, vfx, animation, 3d, generative-ai]
evaluated_at: "2026-05-16T09:44:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-16T09:44:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-16T09:44:00+09:00"
stale_after: "2026-06-15"
supersedes: []
gate_reason: "text-driven 4D flow field と 3D Gaussian animation の技術候補としては面白いが、現候補だけでは評価内容やゲーム制作サイクルへの具体適用が薄い。#shared-reads のゲーム制作向け4000字概要としては、制作評価よりビジュアル技術紹介に寄りすぎる。"
next_action: keep_for_reference

---

## raw_excerpt

arXiv 要旨では、ゲームや AR/VR に重要な 3D visual effects を、拡散モデルではなく field prediction task として扱う。手法は text-driven framework で、time-varying 4D flow field を推定し、3D Gaussians に作用させる。LLM と VLM を使って任意の自然言語プロンプトを関数生成へ変換し、専門的な 3D animation software の習熟や重い 4D inference なしに、open-world な 3D animation / VFX を作ることを狙う。

短い原文断片: "Visual effects", "time-varying 4D flow field", "3D Gaussians".

## why_relevant_to_games

小規模プロトタイプでも、ゲーム感やフィードバックの見た目を短い自然言語指定から試すための技術候補になる。

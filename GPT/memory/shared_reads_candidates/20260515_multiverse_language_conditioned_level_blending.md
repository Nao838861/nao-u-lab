---
title: "Multiverse: Language-Conditioned Multi-Game Level Blending via Shared Representation"
url: https://arxiv.org/abs/2603.26782
collected_at: 2026-05-15T17:14:18+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [procedural-content-generation, level-design, language-control, representation-learning]
evaluated_at: 2026-05-15T17:21:41+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-21T08:51:34+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-b3ef8b64d4530dfe; terminal:memory/shared_reads_candidates/20260515_multiverse_language_conditioned_level_blending.md: arXiv 2603.26782 の同一 work。blend quality の評価内訳が不足; memory/shared_reads_candidates/20260611_multiverse_language_conditioned_level_blending.md: arXiv 2603.26782 の同一 work。実験条件と失敗例が不足; reason:同一 arXiv work の重複候補であり両メモとも評価指標とデータセットと失敗条件が不足して投稿品質に達しないため group 全体を閉じる"
stale_after: "2026-06-14"
stale_review_state: reevaluate_in_phase2
stale_review_reason: "Phase 4a stale_review_batch: language-conditioned level blending は PCG / level design の実装知見に接続しやすいため、Phase 2 で投稿品質まで届くか再評価する。"
last_stale_reviewed_at: "2026-06-21T08:30:00+09:00"
supersedes: []
next_action: none
gate_reason: |
  shared latent space、multi-positive contrastive supervision、latent interpolation という中核は見えるが、候補メモ上では評価指標・データセット・失敗条件の具体性が足りない。
  ゲーム間構造移植の発想は有用だが、Phase 3 投稿には本文読解で blending 品質と zero-shot 評価の中身を補う必要がある。

---

## raw_excerpt
短い原文句: "Text-to-level generation" / "cross-game level blending" / "latent interpolation"。

メモ: 2026-03-25 投稿の arXiv 論文。自然言語から単一ゲームのレベルを出すだけでなく、複数ゲームのレベル構造を shared latent space に合わせ、テキスト指定で構造特性を保ったまま混ぜることを狙う。multi-positive contrastive supervision で、意味的に関連するレベル同士を結び、言語指示とレベル構造を同じ表現空間に寄せる。実験では、同ジャンル内の blending 品質や compositional prompt からの zero-shot generation を見る。ジャンル横断の「このゲームの地形リズムと、別ゲームの制約を混ぜる」方向の材料。

## why_relevant_to_games
既存 Nao_u 作品の手触りやレベル構造を、別 prototype の制約へ移植する時の発想源になる。手作りレベルを捨てず、構造特徴として再利用する設計にも使えそう。

---
title: The Procedural Content Generation Benchmark: An Open-source Testbed for Generative Challenges in Games
url: https://arxiv.org/abs/2503.21474
collected_at: 2026-06-02T16:18:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, evaluation, benchmark, pcg]
evaluated_at: 2026-06-02T16:22:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: 2026-06-02T16:22:00+09:00
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-02T16:22:00+09:00; duplicate_post:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778891744290009"
next_action: keep_for_reference
stale_after: "2026-07-02"
supersedes: []
gate_reason: "手法の重要要素とゲーム制作への適用性は十分に抽出できるが、同じ arXiv:2503.21474 は 2026-05-16 に #shared-reads 投稿済みで、atoms にも深掘りが残っている。今回の候補は新規性がなく、Phase 3 に流すと重複投稿になるため fail とする。"
---

## raw_excerpt
arXiv:2503.21474 / FDG2025。Ahmed Khalifa, Roberto Gallotta, Matthew Barthet, Antonios Liapis, Julian Togelius, Georgios N. Yannakakis による PCG 評価ベンチマーク。論文ページでは、生成アルゴリズムをゲームコンテンツ作成タスク上で比較するための Procedural Content Generation Benchmark と説明されている。対象は "12 game-related problems" で、レベル生成だけでなく、単純なアーケードゲームのルールセット生成も含む。各問題には content representation、control parameters、quality / diversity / controllability の評価指標が用意されている。ベースラインとして random generator、evolution strategy、genetic algorithm を走らせ、問題ごとの解きやすさや、目的関数の選び方が生成物の品質、多様性、制御可能性へ与える影響を示す。

## why_relevant_to_games
ゲーム生成やレベル生成を「面白そう」で終わらせず、品質・多様性・制御可能性を分けて測る候補。Nao_u 環境の headless 評価や PCG 小プロトタイプの採点軸に使える。

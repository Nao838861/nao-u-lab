---
title: "AsgardBench: Evaluating Visually Grounded Interactive Planning Under Minimal Feedback"
url: "https://www.microsoft.com/en-us/research/publication/asgardbench-evaluating-visually-grounded-interactive-planning-under-minimal-feedback/"
collected_at: "2026-05-29T13:30:04+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, visual-grounding, planning, minimal-feedback, game-testing]
evaluated_at: "2026-05-29T13:35:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-21T11:08:12+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-add345627d3416f8; terminal:memory/shared_reads_candidates/20260517_asgardbench_interactive_planning.md: https://arxiv.org/abs/2603.15888 paper source; memory/shared_reads_candidates/20260529_asgardbench_visual_planning.md: https://www.microsoft.com/en-us/research/publication/asgardbench-evaluating-visually-grounded-interactive-planning-under-minimal-feedback/ same paper publication page; reason:2件は arXiv 2603.15888 とその Microsoft Research publication page という同一論文の別入口であり task 数と要旨も一致する。独立候補として維持する資料差がなく 両方とも結果の粒度不足なので重複候補として閉じる。"
stale_after: "2026-06-28"
supersedes: []
next_action: none
gate_reason: |
  visual observation に基づく plan adaptation 評価という問題設定は、ゲーム AI tester / visual playtest に接続できる。
  ただし候補本文だけでは task 設計、baseline、失敗類型、評価結果の粒度が足りず、Phase 3 で残すべき密度の概要を書くには追加読解が必要。

---

## raw_excerpt

Microsoft Research の AsgardBench 紹介ページ。ArXiv 2026-03、Vol 2603(15888)。対象は視覚接地された high-level action sequence generation と interactive planning で、特に実行中の visual observation に基づく plan adaptation を測る。既存の embodied AI benchmark では navigation / low-level manipulation / rich corrective feedback が混ざりやすいが、AsgardBench は入力を image、action history、軽量な success/failure signal に絞り、controlled simulator 内で「見たものに基づいて plan を修正できるか」を分離して評価する。

benchmark は 12 task types、108 task instances。object state、placement、scene configuration を systematic に変え、同じ instruction でも観測状態に応じて異なる action sequence が必要になる conditional branches を作る。主要 VLM 評価では visual input を外すと性能が大きく落ち、visual grounding と state tracking の弱さが interactive planning を崩すとされる。

短い原文抜粋: "plan adaptation during execution based on visual observations"

## why_relevant_to_games

ゲーム用 AI tester / bot policy を、豊富なヒントを与えず「画面・履歴・軽い成否」だけで評価する設計候補。headless だけでなく視覚ベース playtest の評価軸に使える。

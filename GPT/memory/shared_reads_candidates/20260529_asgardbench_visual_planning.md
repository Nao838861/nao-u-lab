---
title: "AsgardBench: Evaluating Visually Grounded Interactive Planning Under Minimal Feedback"
url: "https://www.microsoft.com/en-us/research/publication/asgardbench-evaluating-visually-grounded-interactive-planning-under-minimal-feedback/"
collected_at: "2026-05-29T13:30:04+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, visual-grounding, planning, minimal-feedback, game-testing]
---

## raw_excerpt

Microsoft Research の AsgardBench 紹介ページ。ArXiv 2026-03、Vol 2603(15888)。対象は視覚接地された high-level action sequence generation と interactive planning で、特に実行中の visual observation に基づく plan adaptation を測る。既存の embodied AI benchmark では navigation / low-level manipulation / rich corrective feedback が混ざりやすいが、AsgardBench は入力を image、action history、軽量な success/failure signal に絞り、controlled simulator 内で「見たものに基づいて plan を修正できるか」を分離して評価する。

benchmark は 12 task types、108 task instances。object state、placement、scene configuration を systematic に変え、同じ instruction でも観測状態に応じて異なる action sequence が必要になる conditional branches を作る。主要 VLM 評価では visual input を外すと性能が大きく落ち、visual grounding と state tracking の弱さが interactive planning を崩すとされる。

短い原文抜粋: "plan adaptation during execution based on visual observations"

## why_relevant_to_games

ゲーム用 AI tester / bot policy を、豊富なヒントを与えず「画面・履歴・軽い成否」だけで評価する設計候補。headless だけでなく視覚ベース playtest の評価軸に使える。

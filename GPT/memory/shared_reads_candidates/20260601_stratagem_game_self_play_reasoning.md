---
title: "Stratagem: Learning Transferable Reasoning via Trajectory-Modulated Game Self-Play"
url: "https://arxiv.org/abs/2604.17696"
collected_at: "2026-06-01T03:45:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, self-play, llm-agents, reasoning, evaluation]
evaluated_at: "2026-07-26T12:21:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T12:21:31+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T12:21:31+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  trajectory を勝敗以外の transferability と evolution で選ぶ着想は self-play ログ分析の参考にはなる。
  一方、主目的と評価先は LLM の数学・一般推論・コード生成であり、ゲームのルール、難度、体験、制作サイクルへの効果は評価されていない。適用が類推に留まり共有投稿の軸として弱い。
---

## raw_excerpt
原文要旨メモ。STRATAGEM は、game self-play を LLM の reasoning 能力向上に使う研究だが、単に勝敗だけで強化するのではなく、trajectory の中にある transferable reasoning pattern を選んで強化する点を焦点にしている。問題設定は、既存の self-play が terminal game outcome に依存しがちで、ゲーム固有の heuristic と、他ドメインに移せる抽象的な reasoning を区別できないこと。論文はこの制約を、domain specificity と contextual stasis という 2 つの障壁として整理する。

提案手法は、Reasoning Transferability Coefficient で domain-agnostic な推論を含む trajectory を選び、Reasoning Evolution Reward で静的な文脈に閉じない adaptive reasoning development を促す。評価は数学推論、一般推論、code generation benchmarks で行われ、特に multi-step reasoning が重要な competition-level mathematics で強い改善が報告されている。Ablation と human evaluation でも、transferability と evolution の両要素が寄与するとされる。

## why_relevant_to_games
ゲーム内 self-play ログを「勝った/負けた」だけでなく、どの判断が別ゲームにも移せる抽象パターンかで読み分ける視点として使える。

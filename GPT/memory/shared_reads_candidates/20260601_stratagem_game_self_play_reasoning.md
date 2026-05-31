---
title: "Stratagem: Learning Transferable Reasoning via Trajectory-Modulated Game Self-Play"
url: "https://arxiv.org/abs/2604.17696"
collected_at: "2026-06-01T03:45:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, self-play, llm-agents, reasoning, evaluation]
evaluated_at: "2026-06-01T03:48:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-01T03:48:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-01T03:48:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-01"
supersedes: []
gate_reason: |-
  transferability coefficient と evolution reward は興味深く、self-play ログを勝敗以外で読む観点として使える。
  ただし評価先が数学・一般推論・コード生成に寄っており、ゲーム制作の具体場面へ落とすには full paper で trajectory 選別方法と ablation の中身を確認する必要がある。
---

## raw_excerpt
原文要旨メモ。STRATAGEM は、game self-play を LLM の reasoning 能力向上に使う研究だが、単に勝敗だけで強化するのではなく、trajectory の中にある transferable reasoning pattern を選んで強化する点を焦点にしている。問題設定は、既存の self-play が terminal game outcome に依存しがちで、ゲーム固有の heuristic と、他ドメインに移せる抽象的な reasoning を区別できないこと。論文はこの制約を、domain specificity と contextual stasis という 2 つの障壁として整理する。

提案手法は、Reasoning Transferability Coefficient で domain-agnostic な推論を含む trajectory を選び、Reasoning Evolution Reward で静的な文脈に閉じない adaptive reasoning development を促す。評価は数学推論、一般推論、code generation benchmarks で行われ、特に multi-step reasoning が重要な competition-level mathematics で強い改善が報告されている。Ablation と human evaluation でも、transferability と evolution の両要素が寄与するとされる。

## why_relevant_to_games
ゲーム内 self-play ログを「勝った/負けた」だけでなく、どの判断が別ゲームにも移せる抽象パターンかで読み分ける視点として使える。

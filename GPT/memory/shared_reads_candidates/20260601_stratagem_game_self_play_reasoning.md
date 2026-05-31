---
title: "Stratagem: Learning Transferable Reasoning via Trajectory-Modulated Game Self-Play"
url: "https://arxiv.org/abs/2604.17696"
collected_at: "2026-06-01T03:45:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, self-play, llm-agents, reasoning, evaluation]
---

## raw_excerpt
原文要旨メモ。STRATAGEM は、game self-play を LLM の reasoning 能力向上に使う研究だが、単に勝敗だけで強化するのではなく、trajectory の中にある transferable reasoning pattern を選んで強化する点を焦点にしている。問題設定は、既存の self-play が terminal game outcome に依存しがちで、ゲーム固有の heuristic と、他ドメインに移せる抽象的な reasoning を区別できないこと。論文はこの制約を、domain specificity と contextual stasis という 2 つの障壁として整理する。

提案手法は、Reasoning Transferability Coefficient で domain-agnostic な推論を含む trajectory を選び、Reasoning Evolution Reward で静的な文脈に閉じない adaptive reasoning development を促す。評価は数学推論、一般推論、code generation benchmarks で行われ、特に multi-step reasoning が重要な competition-level mathematics で強い改善が報告されている。Ablation と human evaluation でも、transferability と evolution の両要素が寄与するとされる。

## why_relevant_to_games
ゲーム内 self-play ログを「勝った/負けた」だけでなく、どの判断が別ゲームにも移せる抽象パターンかで読み分ける視点として使える。

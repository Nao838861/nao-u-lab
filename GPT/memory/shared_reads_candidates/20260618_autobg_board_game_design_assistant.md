---
title: "AutoBG: A Board Game Design Assistant with Interactive Ideation, Iterative Rulebook Generation, and Individualized Feedback"
url: "https://arxiv.org/abs/2606.01976"
collected_at: "2026-06-18T09:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, board-game, ai-assisted-design, playtesting, rulebook]
evaluated_at: "2026-06-18T09:47:52+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781744311.743629"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781744311743629"
  char_count: 3512
  posted_at: "2026-06-18T09:58:44+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-18T09:58:44+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781744311743629"
next_action: none
stale_after: "2026-07-18"
supersedes: []
gate_reason: |-
  問題設定が「ボードゲーム設計の blank-page anxiety と rulebook 化・欠陥発見・プレイヤー適合 feedback」に具体化されており、workflow の分解も明確。
  2.2K rulebooks、180K reviews、207 held-out games、30 人 user study という評価材料があり、CoopEval 水準の概要に必要な手法・評価・結論を組める。
  Nao_u_BOT の着想から playable diff 前の rule / loop / critic / persona feedback へ直接転用できる。
suggested_post_outline:
  overview_angle: "ボードゲーム制作支援を ideation、rulebook generation、critic-gated revision、player-persona feedback に分ける workflow として読む。"
  analysis_axis: "structured rulebook corpus、review corpus、critic/verifier iteration、held-out rulebook 評価、user study の役割を整理する。"
  application_target: "短期 prototype の前段で、曖昧なアイデアを rulebook 草案、設計 flaw、想定プレイヤー別 feedback に分ける工程。"
  pros_cons: "メリットは設計前処理と欠陥発見の構造化。デメリットは board game / rulebook 中心で、実装後の手触りや action game には別評価が要る点。"
  verdict_pre: "部分採用。制作 pipeline 全体ではなく、企画から rule draft へ落とす前処理として採用する。"
---

## raw_excerpt
原文短引用: "interactive ideation, iterative rulebook generation, and individualized feedback"

arXiv 抄録によると、AutoBG はボードゲーム制作のワークフローを、初期アイデアの対話的整理、構造化 draft 生成、rulebook 生成、critic による設計 flaw 診断、改善だけを通す verifier-gated iteration、150 人の実プレイヤープロファイルを使った individualized feedback に分解する。データ基盤として 2.2K structured rulebooks と 180K player reviews を使い、207 held-out games で既存 baseline より高品質な rulebook を生成したとされる。30 人の user study では blank-page anxiety の低減、隠れた設計 flaw の発見、実用的支援が報告されている。

## why_relevant_to_games
Nao_u_BOT のプロトタイプ前段で、曖昧な着想を rule / loop / audience feedback に分ける候補。Phase 2 では critic-driven refinement と persona feedback を、既存 cross_review や playable diff 評価へ転用できるかを見る。

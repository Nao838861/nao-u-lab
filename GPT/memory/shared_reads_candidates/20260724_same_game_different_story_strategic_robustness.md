---
title: "Same Game, Different Story: A Minimal Conservative Strategic Robustness Benchmark for Large Language Model Agents"
url: "https://arxiv.org/abs/2607.19670"
collected_at: "2026-07-24T04:16:46.3529283+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent-evaluation, strategic-reasoning, robustness, framing-effects]
evaluated_at: "2026-07-24T04:20:50.9254497+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784834821.252529"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784834821252529"
  char_count: 4479
  posted_at: "2026-07-24T04:27:33.1828505+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-24T04:27:33.1828505+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784834821252529"
next_action: none
stale_after: "2026-08-23"
supersedes: []
gate_reason: >-
  問題設定、変換不変性という手法の中核、7,200 decision の再分析、数値結果、限界まで抽出でき、CoopEval 水準の概要を構成できる。
  同一 payoff の局面を異なる物語表現で再生する検査は、NPC・playtest agent の表層文言依存を測る具体的なゲーム制作場面へ直接適用できる。
suggested_post_outline:
  overview_angle: "戦略能力とは別に、利得と情報を保存した narrative 変換への行動不変性を測る benchmark として整理する"
  analysis_axis: "metamorphic test としての強み、pooled robustness 0.783 と cooperation shift +0.307 の意味、図から近似 count を復元した再分析の限界を分ける"
  application_target: "NPC／playtest agent の同一 game state を neutral・cooperative・competitive・role narrative で replay し、勝率とは別に行動分布差を回帰指標へ加える"
  pros_cons: "少ない追加実装で prompt framing 依存を検出できる一方、頑固に同じ行動を返すだけでも高 robustness になり、戦略能力や面白さを単独では保証しない"
  verdict_pre: "部分採用"
---

## raw_excerpt

> 原文抜粋: “A robust strategic agent should respond primarily to the incentives and information in the game.”

論文は、利得行列と選択肢が同じ戦略ゲームでも、business meeting と friend-sharing conversation のように物語上の framing を変えると、LLM agent の行動分布がどの程度変わるかを扱う。strategic robustness を「payoff を保存する prompt 変換に対する行動分布の不変性」と定義し、strategic competence とは別の指標として測る。実証部は GPT-3.5、GPT-4、LLaMa-2、4 種の social-dilemma game、2 framing の 24 cell・7,200 decision を対象とする。trial-level data がないため、公開図の cooperation rate から各 300 試行の近似 count を再構成し、10,000 回の binomial bootstrap と保守的な attenuation を適用した。報告値は pooled robustness 0.783、friend-sharing framing による cooperation shift +0.307。著者は、robustness が高くても game を理解しているとは限らず、同じ行動を続けるだけの model もあるため、能力順位とは分ける必要があると記す。将来の直接実験向けに、abstract matrix、neutral/cooperative/competitive/role narrative、任意 label 置換の prompt family と canonical action parser も提示している。

## why_relevant_to_games

同一ルール・同一 payoff の game state を複数の物語表現で replay し、NPC や playtest agent の戦略が表層文言に引かれていないかを検査する設計に使える。勝率だけでなく、prompt-equivalent な局面間の行動分布差を別軸で記録する候補になる。

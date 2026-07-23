---
title: "Same Game, Different Story: A Minimal Conservative Strategic Robustness Benchmark for Large Language Model Agents"
url: "https://arxiv.org/abs/2607.19670"
collected_at: "2026-07-24T04:16:46.3529283+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent-evaluation, strategic-reasoning, robustness, framing-effects]
---

## raw_excerpt

> 原文抜粋: “A robust strategic agent should respond primarily to the incentives and information in the game.”

論文は、利得行列と選択肢が同じ戦略ゲームでも、business meeting と friend-sharing conversation のように物語上の framing を変えると、LLM agent の行動分布がどの程度変わるかを扱う。strategic robustness を「payoff を保存する prompt 変換に対する行動分布の不変性」と定義し、strategic competence とは別の指標として測る。実証部は GPT-3.5、GPT-4、LLaMa-2、4 種の social-dilemma game、2 framing の 24 cell・7,200 decision を対象とする。trial-level data がないため、公開図の cooperation rate から各 300 試行の近似 count を再構成し、10,000 回の binomial bootstrap と保守的な attenuation を適用した。報告値は pooled robustness 0.783、friend-sharing framing による cooperation shift +0.307。著者は、robustness が高くても game を理解しているとは限らず、同じ行動を続けるだけの model もあるため、能力順位とは分ける必要があると記す。将来の直接実験向けに、abstract matrix、neutral/cooperative/competitive/role narrative、任意 label 置換の prompt family と canonical action parser も提示している。

## why_relevant_to_games

同一ルール・同一 payoff の game state を複数の物語表現で replay し、NPC や playtest agent の戦略が表層文言に引かれていないかを検査する設計に使える。勝率だけでなく、prompt-equivalent な局面間の行動分布差を別軸で記録する候補になる。

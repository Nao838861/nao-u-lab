---
title: "Skill-as-Pseudocode: Refactoring Skill Libraries to Pseudocode for LLM Agents"
url: "https://arxiv.org/abs/2605.27955"
collected_at: "2026-06-17T07:14:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, skills, game-agent, evaluation, memory, harness]
evaluated_at: "2026-06-17T07:29:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781648936.828739"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781648936828739"
  char_count: 4495
  posted_at: "2026-06-17T07:29:09+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-17T07:29:09+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781648936828739"
next_action: none
stale_after: "2026-07-17"
supersedes: []
gate_reason: |-
  markdown skill library の自由記述が agent の行動失敗ループを生む、という問題設定が明確。typed pseudocode と concrete action template への変換、deterministic quality control、ALFWorld 134-game split での比較という手法要素も抽出できる。
  ゲーム制作では、制作 agent のツール手順、テスト手順、修正ループを typed contract 化する設計に直結する。CoopEval 水準の概要も、問題設定から評価まで一本の軸で書ける。
suggested_post_outline:
  overview_angle: "自由文スキルを、agent がそのまま実行できる typed pseudocode に変換することで、retrieval 後の迷いと再取得ループを減らす手法として書く。"
  analysis_axis: "skill 表現の曖昧さ、入力 schema と action template の分離、品質検査、ALFWorld unseen split での Graph-of-Skills 比較を軸にする。"
  application_target: "Nao_u_BOT の phase 手順、ゲーム制作 agent の playtest 修正手順、memory recall 後の行動 template 化に適用する。"
  pros_cons: "メリットは再現性、token 削減、失敗箇所の特定。デメリットは pseudocode 化の保守負荷と、過度に型付けすると探索的判断が硬くなる点。"
  verdict_pre: "部分採用。まず shared-reads 投稿後に、Phase 3b/4a の小さな probe として既存 skill/directive の一部を typed contract 化する。"
---

## raw_excerpt
Markdown skill libraries for LLM agents ship as free-form prose, forcing the agent to re-derive both the input schema and the concrete invocation syntax on every retrieval. We observe that this often produces a "confused -> re-retrieve -> still confused" loop in which the agent issues a partially-correct action, receives uninformative environment feedback, and re-retrieves the same prose.

The paper proposes Skill-as-Pseudocode, an automatic conversion of markdown skill libraries into typed pseudocode with deterministic quality control. Search result metadata reports evaluation on the 134-game ALFWorld unseen split with gpt-4o-mini, where SaP wins more paired games than the Graph-of-Skills baseline while reducing input tokens and LLM calls per game.

## why_relevant_to_games
ゲーム制作エージェントが「操作スキル」「テスト手順」「修正手順」を再利用する時、自由文の手順を typed contract と concrete action template に分ける設計の参考になる。

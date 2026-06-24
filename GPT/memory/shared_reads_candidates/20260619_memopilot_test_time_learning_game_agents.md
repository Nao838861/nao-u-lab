---
title: "From Player to Master: Enhancing Test-Time Learning of LLM Agents via Reinforcement Learning over Memory"
url: "https://arxiv.org/abs/2606.08656"
collected_at: "2026-06-19T04:08:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent-memory, test-time-learning, strategy-games, evaluation]
evaluated_at: "2026-06-19T04:31:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781045833.863959"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781045833863959"
  char_count: 3894
  posted_at: "2026-06-10T07:57:13.863959"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-19T04:10:40+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781045833863959"
next_action: none
stale_after: "2026-07-19"
supersedes: []
gate_reason: |-
  問題設定、memory update policy、multi-turn GRPO、turn-level credit assignment、RPS/LHE 評価まで投稿の骨格が明確。
  Nao_u_BOT の bot policy、replay memory、失敗ログの次プレイ反映へ直接接続でき、抽象論に留まらない。
suggested_post_outline:
  overview_angle: "LLM agent の記憶更新をプロンプト手書きではなく報酬接続された test-time learning policy として扱う"
  analysis_axis: "memory copilot 分離、multi-turn decision 化、turn-wise reward と advantage 推定、RPS/LHE での改善"
  application_target: "対戦 bot、ローグライク失敗ログ、headless replay 評価で何を記憶に残すかの設計"
  pros_cons: "メリットは記憶更新を評価可能な policy にできる点。デメリットは報酬設計と評価環境が狭い点"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2606.08656。Yishuo Cai ほか。2026-06-07 投稿。論文は、LLM agent が長く続く対戦や反復タスクで、各 interaction の後に明示 memory を更新しながら次の意思決定を良くする test-time learning を扱う。既存手法は memory 更新を hand-designed prompting rules に頼りやすく、複数ターン先の勝敗や報酬に本当に効く記憶更新を安定して選びにくい、という問題設定。

提案は MemoPilot という plug-in memory copilot。frozen LLM player 本体は変えず、memory update process を multi-turn decision problem として扱い、multi-turn GRPO で end-to-end に最適化する。訓練レシピには turn-wise reward signal と、rollout 間の context-independent turn-level advantage estimation が入り、どのターンの記憶更新が後の成果に効いたかを細かく割り当てる狙いがある。

評価は multi-round Rock-Paper-Scissors と Limit Texas Hold'em。検索結果要旨では、MemoPilot は RPS と LHE の両方で frozen player の test-time learning を改善し、Elo ratings で LHE 1762、RPS 1590 と報告されている。ゲーム制作の観点では、agent が対戦相手の癖や前回失敗から何を memory に残すかを、単なる反省文ではなく reward に接続した更新 policy として扱う材料になる。

## why_relevant_to_games

対戦・ローグライク・自動テストプレイヤーで、失敗ログを次プレイにどう残すかを設計する時の候補。Nao_u_BOT の replay / bot policy / session memory 評価にも接続できる。

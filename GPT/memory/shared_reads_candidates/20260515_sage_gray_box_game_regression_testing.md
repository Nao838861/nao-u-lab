---
title: "SAGE: Semantic-Aware Gray-Box Game Regression Testing with Large Language Models"
url: "https://arxiv.org/abs/2512.00560"
collected_at: "2026-05-15T23:29:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [playtesting, regression-testing, llm, reinforcement-learning, game-qa]
evaluated_at: "2026-05-15T23:33:39+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T23:40:20+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: |
  update log の semantic analysis から relevant test を優先する、という中核が Nao_u の差分駆動テストに直結する。
  LLM-guided RL、multi-objective optimization、Overcooked Plus / Minecraft 評価があり、手法・評価・適用の要素が揃っている。
suggested_post_outline:
  overview_angle: "ゲーム更新時に何を再テストすべきかを、差分ログとセマンティックなテスト選択で扱う regression testing 論文として書く。"
  analysis_axis: "goal-oriented exploration、cost/coverage/rarity の test suite 最適化、update log による prioritization の三層で整理する。"
  application_target: "小型プロトタイプの更新履歴から再確認すべきプレイ経路・失敗条件・既存テストを選ぶ Phase 4/実装後チェックへ接続する。"
  pros_cons: "メリットは更新差分とテスト選択を結びつける点。デメリットは RL/大規模環境前提が重く、小規模運用では簡略版に落とす必要がある点。"
  verdict_pre: "部分採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778856013077599"
next_action: none
posted:
  ts: "1778856013.077599"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778856013077599"
  char_count: 3970
  posted_at: "2026-05-15T23:40:20+09:00"

---

## raw_excerpt

arXiv:2512.00560。ライブサービス型ゲームの高速な反復では regression testing が不可欠だが、gray-box 環境ではソースコードに完全アクセスできず、手動 test case 作成、肥大化した suite の maintenance、更新に応じた relevant tests の prioritization が課題になる、という問題設定。SAGE は semantic-aware regression testing framework として、LLM-guided reinforcement learning による goal-oriented exploration で foundational test suite を作り、semantic-based multi-objective optimization で cost / coverage / rarity を balancing し、さらに update log の LLM semantic analysis で version changes に関係する test cases を優先する。Overcooked Plus と Minecraft で自動 baseline や human-recorded test cases と比較している。

## why_relevant_to_games

Nao_u 作品のバージョン更新時に「何を再テストすべきか」を update log から絞る発想として使える。小規模ゲームでも、差分駆動のテスト導線候補になる。

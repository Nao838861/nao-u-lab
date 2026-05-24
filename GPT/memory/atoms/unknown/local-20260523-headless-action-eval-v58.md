---
id: local-20260523-headless-action-eval-v58
title: graze_log_cdx v58 / 主観フィードバックを失敗 bot policy に変換する headless 評価 lesson
source: local-memory
source_ts: 20260523-headless-action-eval-v58
author: Codex
channel: local-memory
user: Codex
tags: [memory, game-design, harness, evaluation, game-dev-teacher, supervised-feedback, action-game, shmup, headless, bot-policy, dominant-strategy, graze-log-cdx-v58]
kind: [case-study, prescription, synthesis, teacher-source]
score: 18
status: active
datetime: "2026-05-23T00:00:00"
---

# graze_log_cdx v58 / 主観フィードバックを失敗 bot policy に変換する headless 評価 lesson

## Use when

Use when 2D シューティング、アクション、プラットフォーマー、避けゲーなどで、Nao_u から「単調」「適当に動くだけで勝てる」「体感が変わらない」「特定位置にいるだけで敵が死ぬ」という feedback を受け、headless 評価・bot policy・支配戦略検出・時系列指標・修正ループを設計する時。

## Excerpt

graze_log_cdx v58 で得た教訓は、headless を平均スコアの自動採点器ではなく、主観フィードバックを再現する「失敗 policy 露出器」として使うこと。ユーザーの「画面下で適当に左右移動しながら撃つだけで敵が出現直後に死ぬ」は、敵密度不足ではなく bottom-camper という支配戦略の問題だった。そこで `camper` bot を独立させ、bottomCampPct / routeCoveragePct / killCount / score / clearRate / 1秒密度を見た。修正は敵数追加ではなく、HP4 + entry shield + 横から切り込む raider + 下端限定反撃 + 下端撃破報酬低下で、支配戦略の成立条件を壊した。合格条件は「route は clear、camper は bottomCampPct が高いまま早期 game over」。次回の action game でも、ユーザーの雑な勝ち筋を bot policy 化してから直す。

## Links

- memory/game_headless_action_eval_playbook_20260523.md
- game/graze_log_cdx/v05_1_cdx_v58/design_log.md
- game/graze_log_cdx/v05_1_cdx_v58/devlog.md
- tools/headless_graze_log_cdx_v05_2_v58_check.js
- tools/headless_graze_log_cdx_v05_2_v58_policy_matrix_check.js

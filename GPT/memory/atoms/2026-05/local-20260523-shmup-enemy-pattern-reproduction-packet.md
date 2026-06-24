---
id: local-20260523-shmup-enemy-pattern-reproduction-packet
title: 2Dシューティング敵編隊 / 要約劣化を避ける再現パケット
source: local-memory
source_ts: 20260523-shmup-enemy-pattern-reproduction-packet
author: Codex
channel: local-memory
user: Codex
tags: [memory, game-design, shmup, enemy-pattern, stage-design, headless, reproduction, teacher-source, shot-log, graze-log-cdx-v58]
kind: [prescription, synthesis, teacher-source]
score: 19
status: active
datetime: "2026-05-23T00:00:00"
---

# 2Dシューティング敵編隊 / 要約劣化を避ける再現パケット

## Use when

Use when 2Dシューティング制作で、敵出現パターン、編隊、ステージ展開、ボスまでの盛り上げを設計する時。特に Nao_u から「単調」「散発的」「敵が適当に出ている」「既存ゲームの型を再現できていない」「shot_log の教師データが使えていない」と指摘された時。

## Excerpt

shot_log の記録から graze_log_cdx が同水準の敵編隊を再現できなかった原因は、記憶が「良かった点の要約」に寄り、参照元の場面、wave ごとの数、入口、軌跡、速度、撃つタイミング、前後 wave が作るプレイヤー位置、潰すべき bad policy が落ちていたこと。次回は `memory/game_2d_shmup_reproduction_packet_20260523.md` を読み、各 wave を `reference / time_window / spawn / path / fire_rule / player_intent / success_feel / failure_pressure / bad_policy_check / telemetry` で書いてから実装する。headless は route だけでなく camper / lane-holder / blind-sweeper など、ユーザーが指摘した雑な勝ち方を bot policy として独立させる。合格条件は、route が authored content を通って勝ち、雑な policy が低到達率・低スコア・早期失敗になること。

## Links

- memory/game_2d_shmup_reproduction_packet_20260523.md
- memory/game_headless_action_eval_playbook_20260523.md
- game/graze_log_cdx/v05_1_cdx_v58/README.md
- game/graze_log_cdx/v05_1_cdx_v58/design_log.md
- game/graze_log_cdx/v05_1_cdx_v58/devlog.md
- D:/AI/Nao_u_BOT/Claude/game/shot_log/dialogue_archive/INDEX.md

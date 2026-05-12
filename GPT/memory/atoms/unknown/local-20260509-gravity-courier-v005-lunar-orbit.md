---
id: local-20260509-gravity-courier-v005-lunar-orbit
title: Gravity Courier v005 月周回プロトタイプの設計教訓
source: local-memory
source_ts: 20260509-gravity-courier-v005
author: Codex
channel: local-memory
user: Codex
tags: [memory, game-design, gravity-courier, lunar-orbit, physics-game, prototype, evaluation, principle]
kind: [case-study, prescription, synthesis]
score: 10
datetime: "2026-05-09T04:10:00"
status: active
---

# Gravity Courier v005 月周回プロトタイプの設計教訓

## Use when

Use when Gravity Courier v005/v006、月周回、lunar orbit、lunar capture、重力ゲーム、軌道ゲーム、二体重力、影響圏、捕獲率/束縛率が分かりにくい時、物理っぽさとゲーム補正のバランス、画面外判定、失敗時リセット、目標を絞る判断をする時。

## Excerpt

Gravity Courier v005 の月周回プロトタイプでは、捕獲率/束縛率のような内部指標はプレイヤーに分かりにくく、成功条件は画面上の運動と一致させる必要があると分かった。採用した根本仕様は、月の影響圏内で地球重力の共通分を差し引き、月中心の角度変化を累積し、月の周りを360度まわったら成功とするもの。目標は月周回 -> 帰還の2つに絞り、再投入起動や追加調整窓は入れない。失敗時は進行維持ではなくリセット。軌道外れは半径ではなく画面外に出た時。画面は正方形にして月外側の余白を確保する。

## Links

- memory/gravity_courier_v005_lunar_orbit_case.md
- game/gravity_courier/v005/design_log.md
- game/gravity_courier/v005/game.js

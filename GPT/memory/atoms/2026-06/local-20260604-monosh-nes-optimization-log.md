---
id: local-20260604-monosh-nes-optimization-log
title: MonoSH / NES 最適化ログと次回想起フック
source: local/projects/monosh
source_ts: "1780530856.436"
author: Codex
channel: local-memory
user: Nao_u
tags: [memory, game-design, operation, monosh, nes, famicom, "6502", shmup, optimization, cc65, asm]
kind: [prescription, reflection]
score: 18
status: active
datetime: "2026-06-04T08:54:16"
---

# MonoSH / NES 最適化ログと次回想起フック

## Use when

Use when MonoSH、NES、ファミコン、6502、cc65、MMC5、シューティング、敵弾、処理落ち、update_ebullet()、check_bullet_bgobj_collision()、update_bgobj_camera()、dbg、debug profile、asm 化方針について作業するとき。

## Excerpt

MonoSH の記憶は D:\AI\Nao_u_BOT\GPT\memory\projects\monosh\ に集約し、MonoSH リポジトリ側には独立した AGENTS.md や記憶システムを置かない。直近の最適化では update_ebullet() を asm 化し、C 版を #if 0 で残す方針にした。check_bullet_bgobj_collision() は C のまま、弾 0 即 return、弾ごとの敵 z 範囲キャッシュ、敵 Y 判定の 8bit 比較化で軽量化した。update_bgobj_camera() は bgobj_wz[R00] の一度読み、未使用 joy/trig snapshot 削除、z bucket clamp 削除で軽量化した。最適化の失敗として、ループ外へ出したつもりの処理が常時純増になり、弾 1 発時や何もしない時まで悪化した。今後は最大数の弾がある時に効く内側ループ削減を優先し、fire_*() より毎フレームの update_*() を優先する。asm 化する場合はロジック追跡性を守るため C 版を #if 0 で残す。dbg 生成が壊れた時、dbg に情報を入れない回避は採用しない。commit 時は build 生成物、sys/debug_profile.h のユーザー変更、src/実装メモ.txt、ユーザーがコメントアウトした手動スクロール差分を混ぜない。

## Links

- memory/projects/monosh/20260604_nes_optimization_log.md
- memory/projects/monosh/README.md

---
title: MonoSH NES optimization work log
date: 2026-06-04
project: MonoSH
repo: D:\HomeBrew\MonoSH
status: active
tags: [monosh, nes, famicom, 6502, optimization, shmup, memory]
---

# MonoSH / NES 最適化作業メモ 2026-06-04

## 想起トリガー

MonoSH、NES、ファミコン、6502、シューティング、敵弾、処理落ち、`update_ebullet()`、`check_bullet_bgobj_collision()`、`update_bgobj_camera()`、`.dbg`、cc65、ca65、MMC5 の話をするときはこのメモを読む。

## 作業対象

- 対象リポジトリ: `D:\HomeBrew\MonoSH`
- 記憶の置き場所: `D:\AI\Nao_u_BOT\GPT\memory\projects\monosh\`
- MonoSH 側には独立した `AGENTS.md` や記憶システムを置かない。GPT 側の記憶を正本にする。

## ここまでの主な変更

- `update_ebullet()` を asm 化した。元の C ロジックは `#if 0` で残す方針にした。
- `check_bullet_bgobj_collision()` は C のまま軽量化した。
  - 弾が 0 のとき即 return。
  - 弾ごとの敵 z 範囲を一度だけ計算。
  - 敵 Y 判定で不要な 16bit 差分生成を避け、8bit 比較中心にした。
- `update_bgobj_camera()` は C のまま軽量化した。
  - `bgobj_wz[R00]` を `R02` に一度だけ読み、auto scroll 時は `R02` を減算して書き戻す。
  - 手動スクロール側がユーザー変更で無効化されているため、`JOY1_HELD` / `trig_accum` の snapshot 読みを削った。
  - `R01 = R02 >> 3` 後の `if (R01 > 7) R01 = 7;` を削った。`wz` の値域前提が崩れる変更を入れたら再確認する。
- `DBG_PROF_BG` の計測自体も負荷がある。計測表示を見ながら最適化する場合、計測コストを本体負荷と混同しない。

## 事故と教訓

- 以前の最適化候補で、弾 1 発時や何もしない時の処理落ちが悪化した。ループの外に出したつもりの処理が常時純増になる変更は危険。
- `resolve_bom_pending()` 周辺は、敵に弾を当てた時のクラッシュ疑いが出た。変更履歴と generated asm を必ず確認する。
- `.dbg` 生成が壊れた時、`.dbg` に情報を入れない回避は採用しない。以前は通常の `.dbg` 生成で動いていたため、原因はビルド生成物や debug profile 側の変更、または intermediate の不整合を優先して疑う。
- build 生成物、`sys/debug_profile.h` のユーザー変更、`src/実装メモ.txt`、ユーザーがコメントアウトした手動スクロール差分は、自分の commit に混ぜない。
- asm 化は効果が大きいがロジック追跡性が落ちる。今後 asm 化する場合は、対応する C 版を `#if 0` で残す。

## 最適化の判断基準

- 呼ばれる頻度が高い update 系を優先する。`fire_*()` は発火フレームが少ないため、最大数の弾が出ている時の `update_*()` より優先度が低い。
- 弾が複数ある時に効く変更を優先する。1 回だけ速い初期化より、弾数分、敵数分で増える内側ループを削る。
- C のまま安全に削れる候補を先に見る。
  - 配列の同じ添字を複数回読む箇所を register temp に寄せる。
  - 値域が確定している clamp や分岐を削る。
  - 16bit 計算を 8bit 比較で置き換えられる当たり判定を探す。
  - 未使用 snapshot、未使用 temporary、debug 計測だけの処理を切り分ける。
- C で cc65 が重いコードを吐く箇所は generated asm を見て判断する。`ptr1` 経由、`tossubax`、16bit compare、配列添字の再計算が目印。

## 次回作業開始時の確認

1. `git -C D:\HomeBrew\MonoSH status --short`
2. `git -C D:\HomeBrew\MonoSH diff -- src/game.c sys/debug_profile.h`
3. `make`
4. `build/mmc5/game.s` で対象関数の generated asm を確認
5. commit 前に `git diff --cached` を見て、ユーザー差分や build 生成物が混ざっていないことを確認

## 直近 commit

- `51bdc83 codex: assemble enemy bullet update`
- `1607c72 codex: streamline bullet enemy collision c path`
- `1d4ccfd codex: lighten bg object camera c path`

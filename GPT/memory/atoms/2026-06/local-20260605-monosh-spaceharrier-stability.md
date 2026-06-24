---
id: local-20260605-monosh-spaceharrier-stability
title: MonoSH Space Harrier 敵パターン・敵弾・上端クラッシュ修正ログ
source: local/projects/monosh
source_ts: 20260605-monosh-spaceharrier-stability
author: Codex
channel: local-memory
user: Nao_u
tags: [memory, game-design, monosh, nes, famicom, "6502", mmc5, cc65, shmup, space-harrier, enemy-pattern, enemy-bullet, vbuf, nmi, clipping, farcall]
kind: [prescription, reflection]
score: 19
status: active
datetime: "2026-06-05T00:00:00"
---

# MonoSH Space Harrier 敵パターン・敵弾・上端クラッシュ修正ログ

## Use when

Use when MonoSH、NES、Space Harrier 風敵パターン、敵弾、NMI 待ちループ、VBUF 範囲外書き込み、敵描画上端クリップ、cc65 / 6502 / MMC5 のデバッグを再開するとき。

## Excerpt

MonoSH の 2026-06-05 作業では、敵弾の狙いが壊れた原因を bank 越しテーブル参照と farcall A 返り値破壊に絞り、`ebullet_div_value` グローバル保存方式で修正した。Space Harrier 風の3体敵パターンは、固定X・共有Y/Zテンプレート・地平線補正・等速上昇から即落下・線形寄りの接近Zへ調整した。プレイヤーが上にいて敵が上端を越えると止まる問題は、`enemy_bot < 31` で unsigned underflow し、`draw_Em0()` に範囲外VBUF行を渡してメモリ破壊する可能性が高かったため、敵と敵弾の描画直前に `31..223` のYガードを追加した。最新 MonoSH commit は `e1238c3 Guard sprite draws against offscreen Y wrap`。次回は上端越えクラッシュ再現確認、敵弾の狙い確認、必要なら上端部分クリップ実装を検討する。

## Links

- memory/projects/monosh/20260605_spaceharrier_enemy_pattern_and_stability_log.md
- memory/projects/monosh/README.md
- D:\HomeBrew\MonoSH

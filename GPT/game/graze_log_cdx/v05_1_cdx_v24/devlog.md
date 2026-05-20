# graze_log v05.2_cdx_v24 devlog

## 目的

v23 は敵数と動きは変わったが、wave の意図が薄く、散漫だった。v24 では「参考にした動き」「目的」「プレイヤー反応」を design_log に明示し、実装側もそれに合わせて整理した。

## 実装

- v23 から `v05_1_cdx_v24` を作成。
- stage event を 20 から 16 に削減。
- `WAVE_INTENTS` を `READ / LEAD / HOLD / FOCUS / RESTOCK / DODGE / BOSSLET / MIDBOSS / PRESS / RECOVER / LANE / BOSS` に整理。
- 編隊数を減らし、敵速度を落として、狙う時間を増やした。
- `veeHold` / `sideHook` / `wheelBreak` / `peelColumn` / `orangeBrake` の移動を減速。
- 中ボス以降は新しい文法を増やさず、前半で見せた `hook / orange / red carpet / lane` を重ねるだけにした。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v24_check.js
```

確認項目:

- BOMB が自動再充填されない。
- Active DEF が発火する。
- midboss / boss に到達する。
- simpleBot が clear する。
- stage flags が 1942 型の主要編隊を通る。

## 残リスク

今回も headless は「壊れていない」確認でしかない。面白さは人間プレイで、各 wave の反応が読めるかを見る必要がある。特に `orange pair focus` と `midboss orange flank` は硬さと弾数が強すぎる可能性がある。

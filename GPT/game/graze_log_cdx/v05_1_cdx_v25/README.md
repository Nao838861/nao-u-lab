# graze_log v05.2_cdx_v25

v24 の残リスクだった「橙強敵が硬いだけに見える」問題を、短い弱点露出窓で直した版。

## 実装した変更

- `orangeAce` に `ORANGE_FOCUS_OPEN_START` / `ORANGE_FOCUS_OPEN_END` の弱点窓を追加。
- 通常時の自弾ダメージは 1、露出窓中の自弾ダメージは 3。
- 橙の表示を、露出窓中だけ明るい輪郭と外周リングに変える。
- `focus orange gate` / `orange pair focus` / `midboss orange flank` は、硬い敵を削る場面ではなく、露出窓に合わせて撃ち込む FOCUS 練習になる。

## 実行

`index.html` をブラウザで開く。

自動検証プレイは `auto_verify.html` をダブルクリック。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v25_check.js
```

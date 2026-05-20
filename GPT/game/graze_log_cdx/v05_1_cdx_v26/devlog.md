# graze_log v05.2_cdx_v26 devlog

## 目的

v25 は橙強敵を「硬い敵」から「短い弱点窓を読む敵」へ変えた。ただし、露出窓が人間に読めるか、横移動して撃ち込む操作として自然かは未確認だった。今回は UI 文言ではなく、橙の移動・弾の吸い込み・露出直後の発射抑制を変えて、操作判断そのものを変える。

## 実装

- v25 から `v05_1_cdx_v26` を作成。
- `ORANGE_COMMIT_WARN_START=104` を追加し、露出前に橙が commit lane へ寄るようにした。
- `orangeFocusWarn(e)` を追加し、予告状態を描画で区別できるようにした。
- `applyOrangeFocusMagnet(b)` を追加し、露出窓中の橙近くを通る自弾を橙へ軽く引き込むようにした。
- 露出直後だけ橙の発射を先送りし、撃ち込み窓を弾幕圧の中に埋もれにくくした。
- title を `v05.2_cdx_v26 - orange commit windows` に更新した。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v26_check.js
```

確認項目:

- v25 の BOMB / Active DEF / midboss / boss / clear / route contract 検査を維持する。
- 閉じた橙強敵への自弾が 1 ダメージである。
- 露出窓中の橙強敵への自弾が 3 ダメージである。
- 予告中の橙が commit lane へ寄る。
- 露出窓中の橙近くで自弾吸い込みが働く。
- simpleBot が clear する。

## 残リスク

headless では commit window の仕様は確認できるが、人間プレイで「横へ寄って窓へ撃ち込む」感覚が強くなったかはまだ別評価が必要。次回は v26 を実プレイ前提で、橙の予告開始が早すぎないか、吸い込みが補助として自然かを見る。

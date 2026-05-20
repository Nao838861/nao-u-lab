# graze_log v05.2_cdx_v25 devlog

## 目的

v24 は wave の段階設計を整理したが、残リスクとして `orange pair focus` と `midboss orange flank` の硬さ・圧が強すぎる可能性を残した。今回は敵数や UI ではなく、橙強敵そのものを「硬い敵」から「短い弱点窓を読む敵」へ変える。

## 実装

- v24 から `v05_1_cdx_v25` を作成。
- `ORANGE_FOCUS_OPEN_START=132`、`ORANGE_FOCUS_OPEN_END=218`、`ORANGE_FOCUS_OPEN_DAMAGE=3` を追加。
- `orangeFocusOpen(e)` を追加。
- `orangeAce` の HP を 5 から 6 にし、通常ヒットは 1 ダメージ、露出窓ヒットは 3 ダメージにした。
- 露出窓中は橙の輪郭と外周リングを明るくし、撃ち込むタイミングを画面上の状態から読めるようにした。
- title を `v05.2_cdx_v25 - orange focus windows` に更新した。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v25_check.js
```

確認項目:

- v24 の BOMB / Active DEF / midboss / boss / clear / route contract 検査を維持する。
- 閉じた橙強敵への自弾が 1 ダメージである。
- 露出窓中の橙強敵への自弾が 3 ダメージである。
- simpleBot が clear する。

## 残リスク

露出窓は headless で確認したが、人間プレイで「撃ち込むタイミングが読める」かは未確認。次回は橙窓に合わせた横移動が自然に起きるかを見る。

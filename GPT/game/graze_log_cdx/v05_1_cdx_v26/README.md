# graze_log v05.2_cdx_v26

v25 の橙弱点窓を、人間が「寄って撃つ」操作として読みやすくするため、橙を commit window 化した版。

## 実装した変更

- 橙強敵に `ORANGE_COMMIT_WARN_START` を追加し、露出前から commit lane へ寄る予告移動を入れた。
- 露出窓中だけ `applyOrangeFocusMagnet()` で自弾を橙へ軽く吸い込ませる。
- 露出直後だけ橙の発射を抑制し、撃ち込みタイミングを「弾幕を避けながら硬い敵を削る」ではなく「窓へ寄って撃つ」判断に寄せた。
- v25 の通常ヒット 1 / 露出窓ヒット 3 は維持した。

## 実行

`index.html` をブラウザで開く。

自動検証プレイは `auto_verify.html` をダブルクリック。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v26_check.js
```

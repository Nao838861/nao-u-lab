# graze_log v05.2_cdx_v27

v26 の橙 commit window に、成功時の短期リターンを追加した版。

## 実装した変更

- 橙強敵の露出窓へ初回ヒットした時だけ `FOCUS BREAK +3` を発生させる。
- `FOCUS BREAK` は橙の近傍弾を消し、消した弾を graze 成果として数え、ゲージを +3 する。
- v26 の予告移動、自弾吸い込み、露出窓ダメージ 3 は維持した。
- BOMB、Active DEF、boss、stage script、route contract は触っていない。

## 実行

`index.html` をブラウザで開く。

自動検証プレイは `auto_verify.html` をダブルクリック。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v27_check.js
```

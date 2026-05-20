# graze_log v05.2_cdx_v23

v22 は route contract を追加したが、敵配置と敵運動をほぼ維持していたため、体感差が薄かった。v23 は指定ログの shot_log 初期指示を受け、敵出現文法そのものを 1942/1943 型へ寄せた版。

## 変更点

- ランダム風の散発出現をやめ、20 個の手作り stage event に変更。
- V 字編隊、横侵入フック、円弧旋回、列からの剥がれ、左右クロス侵入を追加。
- 赤系ザコは大量に出し、倒す気持ちよさとゲージ供給を担当。
- 橙の強敵 `orangeAce` を少数混ぜ、狙い弾と硬さでアクセントを担当。
- 中ボス前後に赤編隊と橙強敵を重ね、打ち込みと回避を同時に要求する構成に変更。
- v22 の BOMB 経済、Active DEF、boss final cue、route contract は維持。

## 実行

`index.html` をブラウザで開く。

自動検証プレイは `auto_verify.html` をダブルクリック。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v23_check.js
```

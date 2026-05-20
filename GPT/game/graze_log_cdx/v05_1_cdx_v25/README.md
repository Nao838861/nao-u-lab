# graze_log v05.2_cdx_v25

v24 までの延長線上の敵配置を捨て、敵出現ソースを作り直した版。

## 目的

- ランダムに散発する敵ではなく、ステージの流れでプレイヤーの位置を誘導する。
- 「左を処理している間に右へ次の対象を見せる」「右へ移動した直後に左側へ圧を戻す」など、切り替えのタイミングを wave 側で決める。
- Galaga 的な進入レーン、1942 的な横幅圧、DonPachi 系の優先順位と次位置の作り方を、現代のオートショット縦シュー向けに再解釈する。

## 実装した構成

- `galaga left lane`: 左レーンへ曲線進入する編隊。撃ち続けるだけで連続撃破できる入口。
- `switch right marker`: 左処理中に右へ次の目標を先出しし、切り替え判断を作る。
- `galaga right lane`: 右側へ切り替えた後の同型反復。
- `1942 gap left`: 横幅のある圧を出し、左の安全穴へ移動させる。
- `center pin`: 中央へ戻すための固定砲台。
- `midboss anchor`: 画面中央の中ボスで足を止めさせ、左右の追加圧で崩す。
- `restock left right`: 左右の補充編隊で rhythm を戻す。
- `final relay switch`: 左右のリレーでボス前の切り替えテンポを上げる。
- `final gap right`: 右の安全穴へ誘導してからボスへ入る。
- `boss`: 固定ボスと左右パーツ。

## 遊び方

`index.html` をブラウザで開く。

自動検証プレイを見る場合は、エクスプローラーから `auto_verify.html` をダブルクリックする。

## ヘッドレス検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v25_check.js
```

この検証は、旧敵ソース名が残っていないこと、ブレスト記録があること、wave label と期待位置がそろっていること、BOMB / Active DEF / boss / clear / bot clear が通ることを確認する。

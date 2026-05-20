# graze_log v05.2_cdx_v24

v23 の「1942 っぽい部品を横並びにしただけ」という問題を受け、v24 では wave 数を 20 から 16 に減らし、各編隊の役割とプレイヤー反応を絞った。

## 実装した反応

- `read center vee`: 中央 V 字を読んで、正面に入り撃破する。
- `lead left/right hook`: 横から来る列に合わせて横移動し、先頭から撃つ。
- `hold wheel turn`: 上部の円弧旋回を待って、崩れる瞬間に倒す。
- `focus orange gate`: 赤編隊の中で橙強敵を優先するか、弾を見て避ける。
- `restock red carpet`: 大量の赤ザコを倒して BOMB 資源を戻す。
- `cross hook dodge`: 左右侵入の交差で、自機位置を欲張らずに逃げ道へ寄る。
- `midboss red stream`: 中ボスに撃ち込みながら、赤列を処理する。
- `midboss orange flank`: 中ボス中に橙強敵が横圧を作る。
- `final braid lanes`: 左右からの編隊をレーンとして読み、下部で安全地帯を選ぶ。

## 実行

`index.html` をブラウザで開く。

自動検証プレイは `auto_verify.html` をダブルクリック。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v24_check.js
```

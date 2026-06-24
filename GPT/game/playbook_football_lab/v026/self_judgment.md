# Playbook Football Lab v026 自己評価

## 良くなったところ

- `hook / curl / flat / deep` の違いが、名前だけでなくフィールド上の守備範囲として見えるようになった。
- AI が実際に使う `zoneLandmark()` を描画にも使っているため、表示と挙動がズレにくい。
- man/press の青線と zone の金パッドで、守備責任の種類を視覚的に分けられた。
- snapshot に `zoneLandmarks` が入り、次の検証で zone 設定の観測がしやすくなった。

## 弱いところ

- 情報量が増え、preview read line / man target link / zone pad が重なる場面がある。
- zone pad は静的な目安で、receiver が侵入した時の受け渡しや反応範囲はまだ表現していない。
- 守備保存スロットがないため、複数の zone 配置を比較しにくい。
- coverage strength の評価はまだ receiver 側の preview に寄っていて、守備側の良し悪しが読みにくい。

## 次に直すなら

1. 守備保存にも名前付きスロットを入れる。
2. 視覚レイヤーの ON/OFF を入れ、情報過多を避ける。
3. zone pad に近い receiver へ軽い反応線を出す。
4. defender ごとの coverage strength を表示する。
5. リプレイマーカーから preview 差分地点へジャンプできるようにする。


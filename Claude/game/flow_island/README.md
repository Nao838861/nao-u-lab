# 流通の島 v0 (プレイアブルモック)

生産と消費のシミュレーション(projects/production_consumption_sim)の最初の遊べる盤。
経済エンジンは空間シミュ(design/spatial/engine.py)の較正値をJS移植したもので、
**同じengine.mjsがブラウザ(このUI)とNode(ヘッドレス検証)で動く**。

## 起動
```
cd game/flow_island
python3 -m http.server 8420
# → http://localhost:8420 を開く
```

## ヘッドレス検証(Mir用)
```
node smoke.mjs
```

## v0の範囲
- 入植(7職)・道敷き・海運投資・速度4段・財政の弧(配給/支援3回/無利子M42→月利/限度/破産→リプレイ)
- 文化ラダー(建物の上のLvピップ)・季節(色調)・湾/森の残量・市場価格・イベントログ
- 未実装: 対岸/石材/菜種/家普請/分家/行商(エンジンには実装済み・UI未接続のもの多数)

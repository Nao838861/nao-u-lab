# CHARTER ISLE — 潮路の島 v004

完成済みヘッドレス経済エンジンを、公開API経由で可視化・操作するための独立ビュー。公開中のv003は変更せず残す。

## ローカル起動

リポジトリ直下でHTTPサーバーを起動する。

```bash
cd /Users/Nao_u/nao-u-lab/GPT
python3 -m http.server 8420
```

ブラウザで <http://localhost:8420/game/shioji/v004/> を開く。

## 検証

```bash
cd /Users/Nao_u/nao-u-lab/GPT/game/shioji/v004
npm test
```

`npm test`はv004の構造・決定論テストに続けて、改変禁止対象である`../engine/`の全テストも実行する。

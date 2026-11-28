# 関ヶ原 1600（M0 モック）

index.html をダブルクリックで開ける（three.js は CDN から読むのでネット接続は必要）。

開発時は js/ を編集して `python tools/build.py` で index.html を再生成する。dev.html は js/ をモジュールとして直接読む開発用（Webサーバ経由でのみ動く）。

- ドラッグ：移動 ／ 右ドラッグ：回転 ／ ホイール：ズーム
- 名札クリック：武将の解説、「この陣へ寄る」
- 右パネル：視点プリセット、1体あたりの人数（1/4/10）、兵の大きさ、天候（朝霧）

検証用スクリーンショット: `node tools/shot.mjs "http://sekigahara.local/?ratio=1&view=overview" out.png`（ローカルサーバ不要、リクエストを横取りして配信）
URL パラメータ: `ratio` `fog=clear|haze|mist` `view=<プリセット>` `cam=lon,lat,eyeH,lookLon,lookLat` `sel=<unit id>`

設計は [DESIGN.md](DESIGN.md)。

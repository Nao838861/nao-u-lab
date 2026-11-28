# 関ヶ原 1600（M0 モック）

ES モジュールを使うため、file:// では開けない。フォルダをWebサーバで配信して index.html を開く（例: `python -m http.server` → http://localhost:8000/）。

- ドラッグ：移動 ／ 右ドラッグ：回転 ／ ホイール：ズーム
- 名札クリック：武将の解説、「この陣へ寄る」
- 右パネル：視点プリセット、1体あたりの人数（1/4/10）、兵の大きさ、天候（朝霧）

検証用スクリーンショット: `node tools/shot.mjs "http://sekigahara.local/?ratio=1&view=overview" out.png`（ローカルサーバ不要、リクエストを横取りして配信）
URL パラメータ: `ratio` `fog=clear|haze|mist` `view=<プリセット>` `cam=lon,lat,eyeH,lookLon,lookLat` `sel=<unit id>`

設計は [DESIGN.md](DESIGN.md)。

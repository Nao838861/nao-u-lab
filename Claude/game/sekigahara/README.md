# 関ヶ原 1600

index.html をダブルクリックで開ける（three.js は CDN から読むのでネット接続は必要）。

開発時は js/ を編集して `python tools/build.py` で index.html を再生成する。dev.html は js/ をモジュールとして直接読む開発用（Webサーバ経由でのみ動く）。

- ドラッグ：移動 ／ 右ドラッグ：回転 ／ ホイール：ズーム
- 名札クリック：武将の解説、「この陣へ寄る」
- 「▶ 合戦を見る」で7:30から再生。下の年表の▼は主な出来事（クリックでそこへ）。スペースで一時停止
- 左：出来事の記録（クリックでその時刻へ戻る）。上：解説カード（史実／通説／逸話／異説／うんちく のタグ付き）
- 解説カードは「次に進む」で閉じる。一定時間が過ぎると合戦時計が止まり、読み終えて押すと再開する。続けて起きた出来事も順番に読める。
- 右パネル：視点、1体あたりの人数（1/4/10）、兵の大きさ、天候、カメラ自動追従、もしも（条件を変えて最初から）
- 筋書きテスト（採用した通説の流れが崩れていないかの検査。史料との照合ではない）：`node tools/sim_test.mjs`（`--trace` で30分ごとの兵力、`--if kobaya=neutral` で分岐）

検証用スクリーンショット: `node tools/shot.mjs "http://sekigahara.local/?ratio=1&view=overview" out.png`（ローカルサーバ不要、リクエストを横取りして配信）
URL パラメータ: `ratio` `t=hh:mm` `play=1` `speed` `view=<プリセット>` `cam=lon,lat,eyeH,lookLon,lookLat` `focus=id,id` `if=kobaya=neutral,...`

設計は [DESIGN.md](DESIGN.md)。

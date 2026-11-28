# 関ヶ原 1600

index.html をダブルクリックで開ける（three.js は CDN から読むのでネット接続は必要）。

開発時は js/ を編集して `python tools/build.py` で index.html を再生成する。dev.html は js/ をモジュールとして直接読む開発用（Webサーバ経由でのみ動く）。

- ドラッグ：移動 ／ 右ドラッグ：回転 ／ ホイール：ズーム
- 名札クリック：武将の解説、「この陣へ寄る」
- 「▶ 合戦を見る」で7:30から再生。下の年表の▼は主な出来事（クリックでそこへ）。スペースで一時停止
- 左：出来事の記録（クリックでその時刻へ戻る）。上：解説カード（史実／通説／逸話／異説／うんちく のタグ付き）
- 解説カードは「次に進む」で閉じる。一定時間が過ぎると合戦時計が止まり、読み終えて押すと再開する。続けて起きた出来事も順番に読める。
- 戦闘中に次の知らせがないときは、時計が止まるまでの表示時間が通常の3倍になる。延長中に次の知らせが届くとその時点で時計が止まり、「次に進む」で次のカードを読める。
- 右パネル：視点、1体あたりの人数（1/4/10）、兵の大きさ、天候、カメラ自動追従、もしも（条件を変えて最初から）
- 筋書きテスト（採用した通説の流れが崩れていないかの検査。史料との照合ではない）：`node tools/sim_test.mjs`（`--trace` で30分ごとの兵力、`--if kobaya=neutral` で分岐）

検証用スクリーンショット: `node tools/shot.mjs "http://sekigahara.local/?ratio=1&view=overview" out.png`（ローカルサーバ不要、リクエストを横取りして配信）
URL パラメータ: `ratio` `t=hh:mm` `play=1` `speed` `view=<プリセット>` `cam=lon,lat,eyeH,lookLon,lookLat` `focus=id,id` `if=kobaya=neutral,...`

設計は [DESIGN.md](DESIGN.md)。

## 街道と秋の地表

街道は[関ケ原町景観計画 第1章の旧街道図](https://www.town.sekigahara.gifu.jp/secure/6497/daiissyou.pdf)を手がかりに、現代の標高と照合して引いた。北国脇往還は笹尾山の麓から玉方面へ、伊勢街道は鳥頭坂方面へ通じる。1600年の細かな屈曲、道幅、街道沿いの家の並びは推定である。

低地には秋の刈田、土の見える区画、草の残る畦を配置した。各筆の形と収穫の進み具合は景観の想定である。近景では土・藁・落葉の写真の濃淡と立体の刈株を重ねる。素材は Poly Haven の [Withered Grass](https://polyhaven.com/a/withered_grass)、[Brown Mud Dry](https://polyhaven.com/a/brown_mud_dry)、[Forest Ground 01](https://polyhaven.com/a/forrest_ground_01)（CC0）。

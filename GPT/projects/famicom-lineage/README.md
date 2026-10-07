# ファミコンの系譜：1983–1989

1989年末までの国内FC・ディスクシステム作品を、国内発売年が下方向へ進む大きな系譜図にしました。発売一覧のカートリッジ593件・ディスク178件から、同名移植・再発売と同内容の色違いをまとめた751作品を掲載しています。外部参考76作品、関係344本、続編の太線97本です。

## 見る画像

- [全体のSVG](output/famicom-through1989-timeline.svg)：主成果物。ブラウザなどで拡大して眺めてください。
- [全体のPNG](output/famicom-through1989-timeline.png)：全体を画像として扱う場合。
- [縮小プレビュー](output/famicom-through1989-timeline-preview.png)：配置の確認用。
- [ノードのデザインの抜粋](output/famicom-through1989-timeline-detail.png)：外部参考とFCの区別。
- [マリオを含む系統の抜粋](output/famicom-through1989-timeline-mario.png)
- [RPGを含む系統の抜粋](output/famicom-through1989-timeline-rpg.png)

IDEで開いていた `output/famicom-first100-hierarchy.svg` も、最新SVGと同じ内容へ更新しています。初期100本版は `output/first100/` と `dataset-first100.json` に保存しています。

## 図の読み方

色付きの矩形と赤い左端はFC、青い左端とFDSラベルはディスクシステムです。外部作品は白地の角丸と控えめな輪郭で区別し、AC・PC・MSXなどの機種と初出年を添えています。背景の年は国内FC・FDS発売年です。外部参考は、長い線を減らすため影響先の近くに置き、背景の年とは別に初出年を明記します。

横方向には独立した系統を並べ、1983〜1989年の境界線を図全体で揃えています。横スクロールしても見失わないよう、年を境界に繰り返し記載しています。年内の上下は系譜を優先し、発売月日順ではありません。同じ列は、時代が重ならない別の系統で再利用することがあります。

接続はすべて直角の実線です。太線は続編、細線は移植・派生や他作品からの影響です。緑はシリーズ・原作からの継承、青は開発者証言を参照した関係、茶は機構の比較による推定です。推定は開発者が影響を認めたという意味ではありません。理由と出典はデータに残し、SVGの線にマウスを置くと理由が見られます。

影響元は原則1本です。マリオの3本、ゼビウスとドラゴンクエストの2本だけを例外にしています。副次的な影響元4件は近くに再掲し、「再掲」と明記しました。作品を追加したわけではありません。

関係をまだ判断していない388作品は、各年の右端の棚に並べています。影響がなかったという判断ではありません。無理に同ジャンルの作品をつなぐことは避けています。751作品は今回の発売一覧の対象範囲であり、非売品や再発売を含むあらゆる数え方の総数ではありません。

## 別のPCで再生成する

リポジトリ内の場所は `GPT/projects/famicom-lineage/` です。Python 3.10以降とPillowを使い、現在版ではGraphvizは不要です。リポジトリのルートから実行します。

```powershell
python -m pip install -r GPT/projects/famicom-lineage/requirements.txt
python GPT/projects/famicom-lineage/render.py
```

WindowsではMeiryoを使います。他のOSでは日本語フォントを用意し、そのファイルとSVGのフォント名を指定してください。

```sh
python GPT/projects/famicom-lineage/render.py --font "Noto Sans CJK JP" --font-path /path/to/NotoSansCJK-Regular.ttc
```

SVGは原寸のベクター画像です。全体PNGは60メガピクセル以内に縮小するため、細部の閲覧はSVGが適しています。PNG抜粋は各24メガピクセル以内です。

## データと検証

編集対象の正本は `dataset.json` です。作品の安定IDを使って接続するので、表示タイトルを直しても参照は壊れません。各作品に国内発売日・機種・発売一覧の元レコード、各接続に種類・理由・出典・続編フラグを保存しています。`catalogue.json` は発売一覧の事実データ、`build_dataset.py` は初期データと選別した関係から正本を再構築するスクリプトです。

```powershell
python GPT/projects/famicom-lineage/build_dataset.py
python GPT/projects/famicom-lineage/render.py --check
python GPT/projects/famicom-lineage/render.py
```

`build_dataset.py` を実行すると `dataset.json` を上書きします。正本へ直接加えた編集は、再構築する前にスクリプトにも反映してください。画像生成だけなら `render.py` だけを使います。

参照・重複・循環・年代逆行・親の本数・証言の出典、全771件の発売レコードの保持、全作品と接続の描画、作品箱の重なり、別作品の箱を通る線、直角・下向きの接続、国内作品と背景年の一致を検証します。結果は `output/verification.json`、配置は `output/layout.json` に保存します。

初期100本の旧版を再生成する場合だけ、Graphvizと `render_first100.py` を使います。出力先は `output/first100/` です。

## 出典

- [FC発売一覧](https://www.super-famicom.jp/etc00/gamelist/fc.html)
- [ディスクシステム発売一覧](https://www.super-famicom.jp/etc00/gamelist/fds.html)
- [任天堂のファミコン年表](https://www.nintendo.com/jp/famicom/history/index.html)：代表作品・続編の説明と発売日の照合。ロードランナーはこの資料の1984年7月28日へ補正。
- [堀井雄二インタビュー](https://www.famitsu.com/article/202608/78518)：Wizardry・Ultimaとの出会い。
- 初期100本で参照したマリオの開発者対談などのURLは `dataset-first100.json` と `dataset.json` に保持しています。

発売一覧の表記揺れや、原作のどの版を比較対象とするかには再検討の余地があります。原作の初出年は概数を含みます。今後は茶線の裏付けと未判定作品の関係を増やし、個別タイトルから編集できる閲覧環境へつなげられます。

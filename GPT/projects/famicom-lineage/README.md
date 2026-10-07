# ファミコンの系譜：1983–1987

1987年末までの国内FC・FDS398作品、外部参考67作品、接続412本を掲載しています。カートリッジ304件・ディスク103件の発売レコードから同名移植・再発売を統合しました。

## ブラウザで見る

**[index.html](index.html) をChromeまたはEdgeで開いてください。** `Open-Viewer.cmd` のダブルクリックでも開けます。データ内蔵のHTML一つなので、別のPCへコピーしてもサーバー・インストール・ネット接続なしで閲覧できます。

ドラッグで移動、ホイールまたは二本指で拡大縮小できます。検索と発売年でタイトルを絞り、作品をクリックすると前後の接続作品が表示されます。そのタイトルから次の作品へ移動できます。「全体」と右下のマップで遠くへ移動し、「文字を読む」で読める倍率へ戻ります。選択作品はURL末尾に保持します。

画面内だけを描画し、拡大ごとに文字と線を描き直します。高密度ディスプレイにも対応しています。Chromeで検索、年絞り込み、ズーム、ドラッグ、接続作品への移動、再読込、スマートフォン幅、二本指ズームを検証しました。結果は `output/viewer-verification.json` に保存しています。

## 配置と接続

図は5,226×3,202です。以前の49,515×7,746から対象年の削減と配置方式の変更で圧縮しました。ノード幅はタイトルに応じて76〜124、長い名前は折り返します。将来の分岐に必要な横幅を予約する方式をやめ、各年に小さな段を並べました。段間の基本間隔は約22で、配線に必要な空間を確保します。

背景は1983〜1987年を区切り、下方向に国内発売年が進みます。年内の上下は系譜を優先し、月日順ではありません。色付き矩形と赤い左端はFC、青い左端はFDSです。外部参考は白い角丸と初出年で区別し、影響先の近くに置きます。伝統的な盤上遊びは成立年不詳と表示します。

各接続を独立した線で描き、共通の幹にはまとめません。同じ種類の影響線が8本以上出る作品では、選択時にも線を太くせず塊を避けます。接続作品へマウスを置くかキーボードでフォーカスすると、その1本を強調します。交差には白い縁を付け、矢印は実際の接続方向（上端または側面）に合わせます。

接続は直角の実線、続編・シリーズ継承41本は太線です。緑は原作・シリーズ継承、青は証言を参照した関係、茶は推定・仮配置です。影響元は原則1本、重要な場合だけ2〜3本です。副次的な影響元4件を近くに再掲し、再掲ラベルを添えています。

スターフォース→スターソルジャー→ヘクター’87、ムーンクレスタ→テラクレスタを補い、スペースインベーダーはアーケード原作→FC移植としました。アーガス・Bウイングなどはゼビウスからの機構上の比較で接続しています。

国内作品の未接続は0本です。同社・同ジャンルの先行作品などへ補った155本は、データと閲覧欄で「仮配置」と明示します。これは歴史的な影響を断定するものではなく、全体を眺めるための比較上の配置です。理由と出典は各接続作品の下に常時表示しています。

## 画像

- [全体SVG](output/famicom-through1987-timeline.svg)
- [全体PNG](output/famicom-through1987-timeline.png)：原寸。
- [縮小プレビュー](output/famicom-through1987-timeline-preview.png)
- [ノードの抜粋](output/famicom-through1987-timeline-detail.png)
- [マリオ周辺](output/famicom-through1987-timeline-mario.png)
- [RPG周辺](output/famicom-through1987-timeline-rpg.png)

IDEで開いていた `output/famicom-first100-hierarchy.svg` も最新内容へ更新しました。初期100作品版は `output/first100/`、1989年までの画像は `output/famicom-through1989-*` に保存しています。

## 別のPCで再生成する

閲覧だけなら `index.html` を開くだけです。ソースは `GPT/projects/famicom-lineage/`、正本は `dataset.json` です。作品ID、発売日、機種、接続の理由・出典・種類・続編フラグ・仮配置フラグを保存しています。

Python 3.10以降、画像生成にはPillow、配置の変更にはGraphvizの `dot` を使います。GraphvizをPATHへ登録するか、環境変数 `GRAPHVIZ_DOT` に実行ファイルを指定してください。データに変更がない場合は保存済み `output/layout.json` を再利用でき、Graphvizなしでも閲覧ページを再生成できます。

リポジトリのルートから実行します。

```powershell
python -m pip install -r GPT/projects/famicom-lineage/requirements.txt
python GPT/projects/famicom-lineage/render.py --check
python GPT/projects/famicom-lineage/render.py
python GPT/projects/famicom-lineage/build_viewer.py
```

ブラウザの表示・操作は `viewer.html` を編集して `build_viewer.py` で反映します。生成済み `index.html` の直接編集は次回生成で上書きされます。

発売一覧と関係を再構築するときは `refine_1987.py` を使います。内部で `build_dataset.py` の1989年版を生成後、1987年版へ絞って補完します。`dataset.json` への直接編集は失われるため、再構築前にスクリプトにも反映してください。

```powershell
python GPT/projects/famicom-lineage/refine_1987.py
```

Windows以外では日本語フォントを指定します。

```sh
python GPT/projects/famicom-lineage/render.py --font "Noto Sans CJK JP" --font-path /path/to/NotoSansCJK-Regular.ttc
```

参照・重複・循環・年代逆行・親の本数・証言の出典、1987年までの発売レコード407件の保持、全作品と接続の描画、箱の重なり、別の箱を通る線、直角・下向きの接続、発売年と背景年の一致を検証します。結果は `output/verification.json`、配置は `output/layout.json`、Graphviz入力は `output/compact-layout.dot` です。

## 出典

- [FC発売一覧](https://www.super-famicom.jp/etc00/gamelist/fc.html)
- [ディスクシステム発売一覧](https://www.super-famicom.jp/etc00/gamelist/fds.html)
- [任天堂のファミコン年表](https://www.nintendo.com/jp/famicom/history/index.html)
- [ヘクター’87とキャラバンの系譜](https://game.watch.impress.co.jp/docs/kikaku/1516378.html)
- 個別接続の開発者対談などの参照URLは `dataset.json` に保持しています。

表記揺れや原作の版、推定の妥当性には再検討の余地があります。原作初出年は概数を含みます。今後は仮配置を個別に見直し、証言や開発上の系譜へ置き換えられます。

# ファミコン初期100タイトルの系譜図

国内FCの発売順100タイトルと外部の先行作品36本の系譜図です。138本の候補から主要な100本を選んで表示しています。影響元を上、影響先を下に置き、幅を詰めた矩形の作品箱と直角の実線で表示します。続編の15本は太線です。

影響元は原則1本に絞り、スーパーマリオブラザーズの3本とゼビウスの2本だけを例外として残しています。離れた作品を結ぶ長い横線を避けるため、マリオへの副次的な影響元2本は、同じ作品番号を持つ「同じ作品の再掲」ノードを近くに配置しています。作品数は136、再掲を含む箱数は138です。

## 閲覧するファイル

- `output/famicom-first100-hierarchy.svg`：拡大して眺めるための主成果物。ブラウザで開けます。
- `output/famicom-first100-hierarchy.png`：大きな面積を使った画像。
- `output/famicom-first100-hierarchy-preview.png`：全体配置を見る縮小画像。
- `output/famicom-first100-hierarchy.dot`：Graphviz用の図の定義。
- `output/verification.json`：作品・接続の件数、箱の重なり検査、描画環境。

## 別PCで続ける

このフォルダ全体をGitで取得してください。フォルダの絶対パスには依存しません。リポジトリ内では `GPT/projects/famicom-lineage/` にあります。現在の作業ブランチは `save-ash-c188-b2-20260516` です。

Python 3.10以降と、[Graphviz公式配布](https://graphviz.org/download/)の `dot` を用意します。Windowsではインストーラーのほか、公式ZIPを展開する方法も使えます。Graphvizの実行ファイルや一時ダウンロードはこのフォルダやGitには含めません。

リポジトリのルートから実行する例です。

```powershell
python -m pip install -r GPT/projects/famicom-lineage/requirements.txt
python GPT/projects/famicom-lineage/render.py
```

GraphvizにPATHが通っていない場合は指定します。

```powershell
python GPT/projects/famicom-lineage/render.py --dot C:/tools/Graphviz/bin/dot.exe
```

日本語表示にはWindowsでMeiryo、LinuxでNoto Sans CJK JPを使います。Macなど別のフォントを使う場合は `--font "Hiragino Sans"` のように指定してください。LinuxではGraphvizに加えて日本語フォントの導入も必要です。

データだけを検証し、DOTを生成する場合はGraphvizやPillowは不要です。

```powershell
python GPT/projects/famicom-lineage/render.py --check
```

## データを編集する

正本は `dataset.json` です。生成されたDOT・SVG・PNGを直接編集せず、データまたは `render.py` を変更して再生成します。

`nodes` に作品名、FC発売日、原作初出年、初期100本内の番号などを保存しています。接続の `source` / `target` は現在は作品名で参照しているため、作品名を変える場合は接続側も同時に変更してください。

`edges` の一件は「影響元 → 影響先」です。`reason` に影響を受けた要素と判断理由、`sources` に資料URLを記録します。

- `lineage`：緑実線。シリーズ、キャラクターや先行版の継承。操作の直接継承を意味するとは限りません。
- `documented`：青実線。対談や開発者証言を参照した影響。パックランドからマリオへの線は競争上のきっかけ、バルーンファイトからの線は運動計算の技術継承です。
- `inferred`：茶実線。Codexがゲーム内容と先行性から選んだ仮説。直接の開発者証言は確認していません。

`display` が `true` の関係だけを図に出します。外した38本は `false` として保持し、`selection_note` に選別の状態を残しています。`sequel` が `true` の15本は線幅3.6、それ以外は1.3です。続編と証言の有無は別の属性なので、マリオブラザーズからスーパーマリオブラザーズへの線は青い太線になります。

`display_policy.multiple_parent_exceptions` に複数の影響元を残す作品と理由を記録しています。例外以外は1本まで、例外も3本までです。再掲を使う関係には `local_reference: true` を付けます。表示だけを複製するもので、作品データは一件のままです。実線への変更で推定が確定事項になったわけではなく、色と `kind` で根拠の区分を維持しています。

対象の100本は1983年7月15日から1986年1月4日のツインビーまでです。限定版、教育ソフト、ファミリーベーシックも件数に含みます。同じ作品の原作とFC移植は一件にまとめています。候補データは各タイトル最大5本、図への表示は原則1本とし、無理な接続は保留しています。

## 検証と今後の作業

再生成時に、100本の件数と番号、参照先、接続重複、自己参照、循環、原作初出年の逆転、候補最大5本、表示原則1本・例外最大3本、証言ありの関係の出典を確認します。配置後は作品と再掲の箱数、表示接続数、全実線、続編の太線件数、箱同士の重なり、線の箱通過、水平・垂直の接続を確認します。配置専用の不可視辺は関係件数に含めません。線同士の交差点は作品を表さず、矢印の到着先が影響先です。

SVGは原寸のベクター画像です。PNGは大きな図を別PCでも扱えるよう75メガピクセル以内に解像度を調整します。Graphviz 16.1.0で生成・検証済みで、使用したバージョンとフォントは `output/verification.json` に残ります。

同年の作品を結んだ茶色の線は、開発の前後関係まで確定したものではありません。今後は推定線の裏付けを調べ、採用・修正・削除することと、対象タイトルの追加が主な作業です。年の一致や見た目の類似だけを実証された影響とは扱いません。

前版は `GPT/artifacts/famicom-first100/` と `GPT/tools/render_famicom_first100.py` にあります。このフォルダの `dataset.json` は独立した正本なので、前版スクリプトを動かしても上書きされません。

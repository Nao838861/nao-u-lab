# MMC5Racing 解説動画（第1稿）

前作（ファミコン版スペースハリアー解説、`GPT/video/explainer_prototype`）と同じ形式の Remotion プロジェクト。1280×720・30fps・約7分50秒。

## 方針

- 主役は「回転をデータに変える」。置けるもの／置けないもの（木の本数と1ドット配置）もこの章に入れる。
- AIとの開発の章では BGM の話をしない。3D版（GSU）は次回のサプライズなので、映像・字幕・コミット一覧のどこにも出さない。
- 図はすべてROMから復号した実データで作る（`tools/decode_course.py`）。推測の絵は使わない。

## 構成

| カット | 章 | 内容 |
|---|---|---|
| C01–C02 | はじめに | 画面ごと回る走行映像、前作との接続（実行中の計算を事前データへ） |
| C03–C12 | 回転をデータに変える | タイルとネームテーブル → 実行中の回転は間に合わない（25,024ドット vs 29,780サイクル）→ 128方向の回転済みの絵 → 172万タイルを61,478種類に集約 → MMC5拡張RAMでタイルごとに区画選択（16,384種×4セット）→ 4×4タイルのブロック辞書（芝生だけが約8割、辞書19,775、地図82,924B）→ 走行中は432タイルを書き込むだけ → 木はスプライトでなく絵に描く → 18本版のガタつき → 8本・1ドット配置 |
| C13–C15 | 1ラインずつの攻防 | 転送は画面を消している間だけ（1ライン≈114サイクル）→ 160→168失敗→168→176 → 184は1,236サイクル不足 → 右8ドット削減で136×184、243万通りすべて予算内 |
| C16–C18 | 4輪の摩擦円 | HUDの摩擦円の意味、ブレーキで前輪に荷重、GRIP/DRIFT |
| C19–C21 | AIとの開発 | 普通の言葉の指示、133コミット、処理落ち・ガタつきは遊んで発見→判断は人、Web版ランキング |
| C22–C23 | まとめ | 数字の回収、ゴールまでの走行、タイトル |

台本の正本は `tools/write_cuts.py`（`narration/cuts.json` を生成）。

## 再生成

```powershell
python -B tools/decode_course.py            # 角度ごとのコース画像と統計（10/15版ROM）
python -B tools/decode_course.py --rom <18本版ROM> --lbl <対応ラベル> --name course18
python -B tools/make_figures.py 120,150,500,500
python -B tools/write_cuts.py
powershell -ExecutionPolicy Bypass -File tools/local-narration.ps1   # 仮音声（Haruka）
node tools/generate-narration.mjs --manifest=cuts.json --compact-only
npm run render
node tools/stills.mjs 0.85                  # 確認用静止画
```

本番音声は OpenAI TTS（前作と同じ marin / 1.2倍速）で `npm run narration:force`。前作の `key.env` のキーは失効していたため、第1稿は Windows 標準の Haruka による仮音声。

`node_modules` は前作プロジェクトへのジャンクション。`public/media/`（録画の切り出し）と復号画像は git 管理外。

## 素材

- 走行：`C:\Users\owner\Videos\Captures\MMC5Racing by Nao_u838861 - Google Chrome 2026-10-24 07-51-21_60fps.mp4` の Web版リプレイ（GRIP 0:57.38）からゲーム画面 x980,y612,588×550 を切り出し。
- タイトル・Webページ：同じ録画の0〜7秒。ランキングの名前欄はぼかし済み。
- 前作：`GPT/video/explainer_prototype/public/current_demo.mp4`。
- 復号元ROM：`D:\HomeBrew\MMC5Racing\releases\MMC5Racing_AllIntegrated_144x176.nes`（8本版、10/15）と `MMC5Racing_AllIntegrated_144x160_Scenery18.nes`（18本版）。

## 数値の根拠

- 128方向・928×928・29×29ブロック・4×4タイル・32バイト辞書：開発リポジトリ `verification/scenery/map_view.py` と同じ復号で確認。
- 固有タイル61,478、辞書19,775、一様ブロック87,176/107,648：`public/gen/course_stats.json`（辞書数は scenery/README の 19,775 と一致）。
- 地図82,924B、誤差0.5ドット未満：`scenery/README.md`。
- 432タイル（18列×24行）：`verification/right-crop184/README.md`。
- 予算 9,822 / 9,273 / 8,365 / 7,449、最大 9,638 / 10,157 / 9,220 / 8,365 / 8,685 / 7,347、68,515通り、1,236不足：`README.md`・`DEVELOPMENT.md`・`FRAME_CONTRACT.md`・`verification/column-prepare/README.md`。
- 133コミット：開発リポジトリの 10/13〜10/19 の `git log`。

## 既知の差異・未確認

- 最新の配布ROM（136×184）は辞書が起動時展開の実行コード形式で静的に復号できず、図は10/15版のデータ。縁石の描き方が実際の画面より細く見える。
- 木のずれのグラフは「回転を戻して木の中心を測った値」で、開発記録の最大5.38ドット（配置誤差）とは測り方が違う。ナレーションは「数ドット」とした。
- 字幕で引用した指示文の「横を縮めて出も」は「横を縮めてでも」に直して表示している。
- DRIFTモードの走行映像は未収録（タイトル画面のみ）。摩擦円の拡大は録画の解像度のまま。

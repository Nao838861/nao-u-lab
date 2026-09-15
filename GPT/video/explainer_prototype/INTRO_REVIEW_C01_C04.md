# 設計書2の書き換えに基づくC01〜C04確認版

2026-09-16。ユーザーが編集した `設計書2.md` 冒頭の01〜04を制作対象にした。旧説明が04の下にも続いているが、今回の04は新しい「木が消失点へ動くアニメーション」であり、旧ゲームロジックや2フレーム配分の説明は含めない。ユーザー編集中の設計書本文は変更していない。

## 出力

専用フォルダ：`out/part2/intro_C01-C04_20260916/`

- `C01-C04_通し.mp4`：4カットを順に再生する確認版。
- `C01.mp4`〜`C04.mp4`：各カットを単独確認する動画。
- `設計書2_制作時点.md`、`source.json`：制作開始時の設計書とSHA-256。途中編集された原稿との識別用。
- `cuts.json`：実測音声に基づく開始フレーム・カット尺。
- `音声照合.md`：新規音声と文字起こしの照合。
- `確認画像/`、`verification.json`：完成動画からの画面抽出、ファイル検査結果。

以前の全編動画とは別のcomposition・manifest・音声フォルダを使い、以前の完成出力を保持する。

完成尺は通し1109フレーム・36.9667秒。C01は266フレーム、C02は158、C03は368、C04は317。全5本を1280×720・30fpsで書き出し、フレーム数・音声・全編デコードを確認。完成MP4から11枚を抽出して画面確認した。TypeScriptの型検査、音声の無音補正検証、木16画像のハッシュ・寸法検証も通過。

## 今回採用した4カット

### C01 タイトル

ゲーム素材の13秒から全面表示し、既存と同じ題名・副題を載せる。音声の2文目をユーザーの新原稿へ更新。

> 前回は、キャラクターを高速に描く仕組みを紹介しました。
> 今回は、そのキャラを動かすCPU処理の最適化について解説します。

### C02 30fps導入

復元ソースの `FrameFrameworkIntroScene` を新しい音声尺で描画。中央の30fpsを大きく見せ、ゲーム映像は置かない。

> ファミコンで30fpsでゲームを動かすためのフレームワークについて説明します。

### C03 CPUの制約

ユーザーの「旧C05」は前の設計書の5番目、実装では旧C21に相当する。`CoordinateTransformScene` の既存レイアウト・表示タイミング（元尺809フレーム）を使い、新しい短い音声の終わりで切る。後半の説明は次の木の図へ渡す。

> スペースハリアーは疑似3Dのゲームです。
> 3Dの座標変換には、かけ算や割り算が必要になりますが、ファミコンのCPUにはかけ算と割り算の命令がありません。

### C04 木の位置と画像の変化

左に消失点へ収束する地面の格子と木。木は手前から奥へ一方向に動き、小さくなる。右は「奥行きZ→テーブル→画面の位置と表示する絵」。下に16枚の縮小画像を並べ、いま使う画像を黄色で示す。細かい例外注記を画面に追加せず、この対応に集中する。

> 奥に行くほど座標を消失点に近づけたり、16段階ある縮小画像のどれを表示するかなど、複雑な計算のほとんどはテーブルを引く処理に置き換えられます。

使用画像は既存の `public/tree/Tree0_00.png`〜15.png（元の高さ80〜4画素）。左の木は各元画像を縦横とも3倍。画像一覧はすべて0.75倍で、大きさの違いを保つ。画面上の番号はわかりやすく1〜16、内部配列は0〜15。選択枠、右の番号、左の木は同じサイズ番号を使用する。

Zは0〜55。`src/part2Data.json` に保存済みの背景用scale・groundY・sizeの表をコピーした `introTreeData.json` を使う。図の消失点は(370,100)、木の根元は `x=370+50*scale[Z]/256*3`、`y=100+(groundY[Z]-60)*8`。表示用の原点・倍率を設定した説明図であり、実機画面そのものの再現ではない。木の絵は任意の縮小式で1枚を変形せず、実際の16画像を切り替える。

開始0.3秒で移動を始め、最後の約0.9秒は奥の状態を保持。パースの格子、移動の点線、根元の小さな円で、小さくなった木も追える。途中で手前へ瞬間移動するループは入れない。

## 音声

既存と同じmarin・速度1.2。句読点に対応する無音を保護し、それ以外の長い文中無音のみ110ms上限で補正する。新しい生音声ごとに無音候補を取り直す。C04の初回文字起こしに「教室展」「縮処理」が出たため、発音用本文だけ「しょうしつてん」「テーブルをひく」へ置換して再生成。表示原稿はユーザーの表記を維持した。補正後のC04は文字起こしと原稿が一致した。

## 編集と再生成

画面：`src/IntroReview.tsx`。composition：`IntroReviewC01C04` と `IntroReviewC01`〜`IntroReviewC04`。音声原稿：`narration/intro-review-cuts.json`。採用元は `設計書2.md` の冒頭4節。

```powershell
python tools/prepare-intro-review.py
node tools/generate-narration.mjs --manifest=intro-review-cuts.json
node tools/transcribe-part2.mjs --manifest=intro-review-cuts.json --raw
python tools/prepare-part2-pauses.py --manifest=intro-review-cuts.json
node tools/generate-narration.mjs --manifest=intro-review-cuts.json --compact-only
node tools/transcribe-part2.mjs --manifest=intro-review-cuts.json
python tools/align-part2.py --manifest=intro-review-cuts.json --alignment=src/introReviewAlignment.json --report=out/part2/intro_C01-C04_20260916/音声照合.md
node tools/verify-part2-pauses.mjs --manifest=intro-review-cuts.json
node tools/render-intro-review.mjs
python tools/verify-intro-review.py
```

原稿が変わったカットは音声生成に `--cut=Cxx --force` を指定して作り直す。画面のみの変更なら音声は再生成しない。描画スクリプトは `--stills-only` と `--video-only` に対応する。単体4本もそれぞれのソースcompositionから書き出し、カットの境界で音声が欠けないようにする。

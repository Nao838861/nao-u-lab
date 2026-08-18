# ファミコン向け擬似3Dデモ 解説映像プロトタイプ

`memory/projects/monosh/20260816_explainer_video_structure.md`の冒頭75秒を、ナレーションなしでも構造が分かるモーション＋字幕映像として試作したもの。

## 内容

1. 現在のデモ映像
2. 前回動画への接続
3. 一般的な画像描画ループ
4. Compiled Sprite
5. 二方式の同時比較
6. 横4×縦2の位置違い
7. 16サイズ×8位置とPRG bank
8. DAY 1の開発映像
9. 現在映像への回収

## 実行

```powershell
npm.cmd install
powershell -ExecutionPolicy Bypass -File tools\prepare-assets.ps1 `
  -PreviousVideo "C:\Users\owner\Downloads\「ファミコンで長いレーザーと大きなビッグコアを表示する方法の別解」の解説動画.mp4" `
  -DayOneVideo "C:\Users\owner\Videos\拡大縮小成功記念.mp4"
npm.cmd run start
npm.cmd run render
npm.cmd run still
```

レンダリング結果は`out/`へ出力する。MP4は容量が大きいためgit管理しない。確認用PNGはgit管理する。

元映像から切り出した`public/*.mp4`と、元プロジェクトから複製した`public/tree/`もgit管理しない。`tools/prepare-assets.ps1`でローカルの正本から再生成する。

## ナレーション試作

C01～C03は`narration/prototype-cuts.json`を正本として、OpenAI Speech APIからカット別WAVを生成する。

```powershell
npm.cmd run narration:generate
npm.cmd run render:narration-preview
```

- APIキーは環境変数`OPENAI_API_KEY`、プロジェクト直下の`.env`または`key.env`、あるいは`GPT/.env`から読み込む。`key.env`だけはキー単体を一行で保存した形式にも対応する。
- `.env`と生成WAVはgit管理しない。
- `public/narration/duration-report.json`へ予定尺と実測尺の比較を出す。
- 原稿または話速を変更して作り直す時は`npm.cmd run narration:regenerate`を使う。
- 試作動画は`out/完成版/explainer_narration_C01-C03.mp4`へ出力する。

API利用枠がない時は、Windows標準の`Microsoft Haruka Desktop`で仮音声を生成できる。

```powershell
npm.cmd run narration:local
npm.cmd run narration:report
```

## 制作上の注意

- プロジェクト名は動画内に表示しない。
- 素材ファイル名も画面へ出さない。
- 現時点では仮ナレーション、BGM、効果音を入れていない。
- 公開前に、前回動画・原作比較素材の利用条件を別途確認する。

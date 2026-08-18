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
npm.cmd run assets:prepare
npm.cmd run start
npm.cmd run render
npm.cmd run still
```

レンダリング結果は`out/`へ出力する。MP4は容量が大きいためgit管理しない。確認用PNGはgit管理する。

元映像から切り出した`public/*.mp4`と、元プロジェクトから複製した`public/tree/`もgit管理しない。`tools/prepare-assets.ps1`でローカルの正本から再生成する。
正本のパスは`tools/source-assets.json`で管理し、Windows PowerShellからUTF-8として読み込む。

## ナレーション試作

C01～C03は`narration/prototype-cuts.json`を正本として、OpenAI Speech APIからカット別WAVを生成する。

```powershell
npm.cmd run narration:generate
npm.cmd run render:narration-preview
```

- APIキーは環境変数`OPENAI_API_KEY`、プロジェクト直下の`.env`または`key.env`、あるいは`GPT/.env`から読み込む。`key.env`だけはキー単体を一行で保存した形式にも対応する。
- `.env`と生成WAVはgit管理しない。
- `public/narration/duration-report.json`へ音声尺と映像尺の比較を出す。
- 原稿または話速を変更して作り直す時は`npm.cmd run narration:regenerate`を使う。
- 音声生成時に実測尺をmanifestへ記録し、末尾余白を加えた映像尺、各カットの開始フレームを自動更新する。元の映像尺より短くはしない。
- `npm.cmd run assets:prepare`は音声から決まるカット尺を読み、長い正本から必要尺を連続抽出する。正本の残り時間が不足する場合だけ自動的にループへフォールバックし、結果を`public/video-asset-report.json`へ出す。C01のズームもカット全体へ追従させる。
- 生成時は未加工WAVを`public/narration/raw/`へ残し、通常の語間・読点・句点を分けて長すぎる低音量区間を自動で短縮する。カット別の`commaPauseCandidateIndices`で読点の間だけを保護し、`normalizeSentenceSilence`を有効にすると句点の間を設定値へ揃える。短縮設定だけを調整した場合は`npm.cmd run narration:compact`でAPIを呼ばずに再処理できる。
- C01だけを再生成する時は`npm.cmd run narration:final-c01`を使う。音声は既存の映像尺へ押し込まず、自然な話速で生成した実測尺を映像側へ反映する。
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

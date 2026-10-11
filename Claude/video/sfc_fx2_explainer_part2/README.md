# SuperFX でスペースハリアーを動かす技術 第2回 — 解説動画

前作（`Claude/video/sfc_fx2_explainer/`、ブランチ `codex/phase1-collect-20260810`）の続編。前作が「60fpsのために色を捨てて白黒にした」で終わったのを受け、色を取り戻す三つの道（2bpp＋パレット60fps／4bpp30fps／SA-1）を約4分半で解説する。数値の出典は [設計書.md](設計書.md)（設計書には音のカットC13〜C15も残っているが、動画からは外した）。1920×1080 / 60fps。

## 構成
|カット|内容|
|---|---|
|C01〜C03|白黒・2bppカラー・4bpp30fpsの三画面、なぜ白黒だったか、三つの道|
|C04〜C07|道A：8×8ごとのパレット、CPU計算で31.6fps、色決めをSuperFXへ移して60fps、8×8の代償|
|C08〜C09|道B：縦帯4本を2回で送る4bpp・30fps、絵の仕上げはこれから|
|C10〜C12|道C：SA-1、コンパイルドスプライト、60fpsはまだ挑戦中|
|C16|まとめ|

## 再生成（macOS）

前作は Windows の Mesen で録画したが、第2回は macOS の Mesen 2.1.1 で録画する。作業用ディレクトリ `$SCRATCH` に以下を置く。

- `venv/`：Python 3（Pillow、numpy、edge-tts、imageio-ffmpeg）
- `bin/`：`ffmpeg`／`ffprobe`（Remotion 付属のもの、TTS用）、`ffmpeg_full`（imageio-ffmpeg、rawvideo読込用）、`edge-tts`、cc65 の実行ファイル
- `mesen/Mesen.app`：Mesen 2.1.1 macOS ARM64（環境変数 `MESEN_APP` で実行ファイルを指定できる）
- `MonoSH_FX2/`：`Nao838861/MonoSH_FX2` の clone。main を cc65 commit `71746c8` でビルドすると公開ROMとバイト一致し、自動操縦用の `build/game_v001/game.lbl` が得られる
- `roms/`：`main_color.sfc`（main の `releases/MonoSHFX2_v001.sfc`）、`fourbpp30.sfc`（`experiment/4bpp-30fps-20261008` の `releases/MonoSHFX2_4bpp30_color.sfc`）、`sa1.sfc`（`experiment/sa1-4bpp-60fps-20261010` の `releases/MonoSHSA1_4bpp_experimental.sfc`）

```sh
SCRATCH=... sh tools/record_all.sh            # 公開ROMを自動操縦で録画し、同じ入力列を4bpp・SA-1版で再生
$SCRATCH/venv/bin/python tools/analyze.py $SCRATCH/rec_out   # タイルごとの色の組・表示間隔
$SCRATCH/venv/bin/python tools/prep_assets.py $SCRATCH/MonoSH_FX2 <4bpp比較画像のdir>
PATH=$SCRATCH/bin:$PATH node tools/tts.mjs     # ナレーション（edge-tts ja-JP-NanamiNeural +12%）
node tools/stills.mjs                          # 確認用静止画
npm run render
```

`public/`・`out/`・`narration/raw/` は生成物なので Git に含めない。

## 素材の扱い

- 原作の録画から切り出した画像の列は使わない。このプロジェクトの白黒原画・パレット着色版・4bpp素材だけを使う。
- SA-1版は開発継続中のROMで、表示間隔の帯は今回の録画で同じ画面が続いた回数を数えたもの。開発側の計測値ではない。
- 数値の出典は設計書の各カットに記載。

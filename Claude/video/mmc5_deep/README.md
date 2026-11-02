# MMC5Racing 技術詳解（ハードを知っている人向け）

1920×1080・60fps、約15分（本編約11分＋おまけ約4分）。一般向け（`../mmc5_v2`）の裏側を、専門用語のまま掘り下げる。制作の型と録画の仕組みは v2 と同じ。3D版（GSU）と BGM 曲には触れない。

## 構成
本編（約11分）は「少し知識があって雰囲気を見たい人」が飽きずに見られるようにし、転送の細部・経緯はおわりの後のおまけ（約4分）にまとめる。

| 場面 | 内容 |
|---|---|
| P00 | 前置き（マニアック・細かい話はおまけ）と目次 |
| A1, A2, A6, A5 | 1 背景：タイル語（NT＋ExRAM、$5130で4組）、ネームテーブルと辞書（CHRの話からのつなぎ→コース全体のネームテーブル116×116タイルが3.3MBで入らない→同じブロックを辞書に→一様セル81%→8/16/32バイト→約620KB→約450KB→行スパン。右側はセリフごとに1場面ずつ切り替え）、転送のしくみの概要、PRG内訳 |
| C1, C3, C4, C6, C7 | 2 縦分割とスプライト：画面の分解とExRAMの同居、fine X の揺れ（最新ROMの相殺だけを外した版の全画面＋拡大、BG＝揺れる／スプライト＝揺れない、8種類のCHRの図と選ばれている絵の黄枠＝`tools/finex_track.py`、CHRの8ページを空けるための模様107個の引っ越し図）、境界の黒帯（外した映像→実OAMの12枚の配置図）、OAM割り当て（摩擦円の拡大＋点のスプライト枠を毎フレームの実OAMで、時計・順位のスプライト枠）、1フレームの流れ |
| D1–D5 | 3 物理と最適化：更新の流れ、ばね（走行映像＋摩擦円の拡大＋4輪の荷重。式は省略）、タイヤ力とMMC5乗算器（使い方は省略）、処理時間、same-PRE・唯一の近似・撤回した調整 |
| F1–F3, Z9 | 4 メモリと開発環境：メモリマップとゴースト、AIの検証環境、Webカメラでの実機デバッグ（Nao_u が撮った実機のテレビ映像）、おわりに |
| おまけ | A3 転置辞書 → A4 自己書き換え → B1–B4 経緯（WRAMバッファ8,818→直接転送→列転送176→転置→オペコード書き換え4,660→全数検査 残り141） |

## 素材と根拠
- **走行**：v2 と同じランキング1位のリプレイ録画。`tools/record_replay.mjs --hide-oam=…` で黒帯スプライトだけ画面外に出した版も撮影（`nomask.mp4`）。
- **fine X の比較映像**：`tools/make_shake_rom.py` が最新ROM（Web版 game.nes）の固定バンク127 $F3CC（fine X→分割側CHRバンクの表）を8つとも「ずらし0」にした版を作り、`tools/pan.mjs` で修正後と同じ条件で撮る（`pan_latest_shake.mp4`／`pan_latest.mp4`）。
- **摩擦円の点の枠**：`tools/oam_track.mjs` がリプレイを再生して OAM 15/19/23/27 を毎フレーム記録（`src/data/dot_oam.json`）。Y は常に固定（119／151）、X だけが動く。
- **修正前ROMの比較映像（旧）**：`tools/pan.mjs` がカウントダウン中に自車の位置・向きを毎フレーム書き換えて視点を流す。
  - fine X：`265f0db`（ミニマップ復活時、揺れあり）と `aadb683`（相殺後）の配布ROM。実測でミニマップ左端が 195→188→195 と8ドット周期で動く／195固定。
- **Webカメラの映像**：Nao_u が N8 Pro の実機をWebカメラで撮った `capture(1).mp4`（640×480・約46秒）から、メニュー→起動→走行→GAME OVER（1〜18.5秒）とメニュー復帰（38.6秒〜。直前のリセット時の乱れたコマは外す）をつなぎ、テレビ画面だけを4:3で切り出した（`public/video/webcam.mp4`）。
- **Webカメラの話**：MMC5Racing `origin/codex/webcam-debug-log-20261026` の README（2D の1〜5節のみ使用）。
- **8種類のCHRの図**：`tools/finex_variants.py` が修正後の画面からミニマップを切り出して0〜7ドットずらしたもの（ROM内では断片に分かれていて、そのままは取り出せない）。
- **転送の型の機械語**：開発リポジトリ `direct-kernel/headroom184/phase.py` を読み取り専用で実行して生成し、逆アセンブル（`src/data/template.json`）。準備処理の抜粋は `producer.py` の生成パターンをこの型のアドレスで書いたもの。
- **地図・辞書の集計**：最新ROMの角度表（固定バンク127 $E900〜）から（`src/data/mapstats.json`、`blocks0.json`）。
- **OAM・ExRAM**：Web版コアでリプレイ再生中に $0200〜 と $5C00〜 を読んだもの（`src/data/oam_probe.json`）。
- 物理の式は `physics/load-transfer/load.s`、タイヤ力は `physics/tire-force-lut/tire.s`。摩擦円の飽和の具体式は記録がないため出していない。
- 数値は DEVELOPMENT.md / README / FRAME_CONTRACT / verification（critical-full・headroom-release・column-prepare・right-crop184・stutter）、physics の README と pc-physics-study による。

## 再生成
```sh
node tools/pan.mjs rec/roms/minimap_prefix.nes rec/shake_minimap_prefix 300 300 0.37 0 0 240
node tools/record_replay.mjs rec/replay_drift1.json rec/drift1_nomask --hide-oam=0,7,14,18,20,21,22,26,28,30,32,35
python -B tools/make_shake_rom.py
node tools/pan.mjs rec/roms/latest_shake.nes rec/pan_latest_shake 300 300 0.37 0 0 240
node tools/pan.mjs rec/roms/latest.nes rec/pan_latest 300 300 0.37 0 0 240
# frames.rgb → mp4（他の映像も同じ）
ffmpeg -f rawvideo -pix_fmt rgb24 -s 256x240 -r 60 -i rec/pan_latest_shake/frames.rgb -vf scale=768:720:flags=neighbor -c:v libx264 -crf 12 -pix_fmt yuv420p public/video/pan_latest_shake.mp4
node tools/oam_track.mjs rec/replay_drift1.json 300 1800
python -B tools/finex_variants.py
ffmpeg -i "capture(1).mp4" -filter_complex "[0:v]trim=1:18.5,setpts=PTS-STARTPTS[a];[0:v]trim=38.6:45.7,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1[c];[c]crop=480:360:140:34,scale=960:720:flags=lanczos,eq=contrast=1.12:saturation=1.08[v]" -map "[v]" -an -r 60 -c:v libx264 -crf 16 -pix_fmt yuv420p public/video/webcam.mp4
node tools/tts.mjs
node tools/stills.mjs
npm run render
```
`rec/`・`public/`・`webcore/`（v2 へのジャンクション）は git 管理外。生フレーム（frames.rgb）は容量節約のため削除済みで、上のコマンドで作り直せる。

# MMC5Racing 技術詳解（ハードを知っている人向け）

1920×1080・60fps、約18分30秒。一般向け（`../mmc5_v2`）の裏側を、専門用語のまま掘り下げる。制作の型と録画の仕組みは v2 と同じ。3D版（GSU）と BGM 曲には触れない。

## 構成
| 場面 | 内容 |
|---|---|
| P00 | 前置き（マニアックな話・ついていけなくても気にしない・気になる章だけでも）と章の目次 |
| A1–A5 | 1-A 背景の今の仕組み：タイル語（NT＋ExRAM、$5130で4組）、一様セル・special/extra/regular の辞書、行スパン、転置辞書、WRAMの型の自己書き換え（オペランド・オペコード・RTS）、生成された準備処理とサイクル精算、PRG内訳 |
| B1–B4 | 1-B 経緯：段階0（WRAMバッファ、背景展開8,818）→直接転送（ページごとのカーネル16バンク）→列転送176→転置とオペランド書き換え→オペコード書き換え（4,660）→全数検査（最大7,308／7,449、残り141） |
| C1–C8 | 2 縦分割とスプライト：画面の分解（実OAM）、ExRAMの同居（実測値）、場外の白化（修正前ROMの映像）、fine X の揺れ（修正前ROMの映像と実測）、境界の黒帯（外した映像）、実機でだけ欠けた黒帯（Webカメラの切り抜き）、OAM割り当て、1フレームの流れ、結果画面 |
| D1–D5 | 3 物理：更新の流れ、ばねの式と32×32表、タイヤ力とMMC5乗算器、DRIFTの補正、処理時間、same-PRE、唯一の近似、撤回した調整 |
| E1–E3 | 4 サウンド：5音の割り当て（実測）とチャンネルごとの再合成音、主音＝排気音×2（実測）、音程カーブ、181サイクル一定、ジングル |
| F1–F3 | 5 メモリマップ・ゴースト・AIの検証環境・Webカメラでの実機デバッグ（2D分のみ） |

## 素材と根拠
- **走行**：v2 と同じランキング1位のリプレイ録画。`tools/record_replay.mjs --hide-oam=…` で黒帯スプライトだけ画面外に出した版も撮影（`nomask.mp4`）。
- **修正前ROMの比較映像**：`tools/pan.mjs` がカウントダウン中に自車の位置・向きを毎フレーム書き換えて視点を流す。
  - fine X：`265f0db`（ミニマップ復活時、揺れあり）と `aadb683`（相殺後）の配布ROM。実測でミニマップ左端が 195→188→195 と8ドット周期で動く／195固定。
  - 場外の白化：TitlePolish（修正前）と SceneBoundaryFix（修正後）。
- **実機写真**：MMC5Racing `origin/codex/webcam-debug-log-20261026` の `development/webcam-debugging/central-stop-phase-camera.png`。Webカメラの話は同ブランチの README（2D の1〜5節のみ使用）。
- **チャンネル別の音**：Mesen を Lua 付きで実行し、タイトルから DRIFT 1位の入力列を流して音源レジスターへの書き込みを記録（`tools/apu_log.lua`）。入力列は開始状態の違いで約1,100コマ後に衝突して終わるが、走行中の5音は記録できた。`tools/apu_synth.py` でチャンネルごとに再合成（エンベロープ等は近似）。主音と排気音の周波数比は記録で常に2.0。ジングルはリプレイ録画のゴール時の実音。
- **転送の型の機械語**：開発リポジトリ `direct-kernel/headroom184/phase.py` を読み取り専用で実行して生成し、逆アセンブル（`src/data/template.json`）。準備処理の抜粋は `producer.py` の生成パターンをこの型のアドレスで書いたもの。
- **地図・辞書の集計**：最新ROMの角度表（固定バンク127 $E900〜）から（`src/data/mapstats.json`、`blocks0.json`）。
- **OAM・ExRAM**：Web版コアでリプレイ再生中に $0200〜 と $5C00〜 を読んだもの（`src/data/oam_probe.json`）。
- 物理の式は `physics/load-transfer/load.s`、タイヤ力は `physics/tire-force-lut/tire.s`。摩擦円の飽和の具体式は記録がないため出していない。
- 数値は DEVELOPMENT.md / README / FRAME_CONTRACT / verification（critical-full・headroom-release・column-prepare・right-crop184・stutter）、physics の README と pc-physics-study による。

## 再生成
```sh
node tools/pan.mjs rec/roms/minimap_prefix.nes rec/shake_minimap_prefix 300 300 0.37 0 0 240
node tools/record_replay.mjs rec/replay_drift1.json rec/drift1_nomask --hide-oam=0,7,14,18,20,21,22,26,28,30,32,35
python -B tools/apu_synth.py
node tools/tts.mjs
node tools/stills.mjs
npm run render
```
`rec/`・`public/`・`webcore/`（v2 へのジャンクション）は git 管理外。生フレーム（frames.rgb）は容量節約のため削除済みで、上のコマンドで作り直せる。

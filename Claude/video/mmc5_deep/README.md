# MMC5Racing 技術詳解（ハードを知っている人向け）

1920×1080・60fps、約17分（本編約9分＋おまけ約8分）。一般向け（`../mmc5_v2`）の裏側を、専門用語のまま掘り下げる。制作の型と録画の仕組みは v2 と同じ。3D版（GSU）と BGM 曲には触れない。

## 構成
本編（約9分）は「少し知識があって雰囲気を見たい人」が飽きずに見られる場面だけにし、式・サイクル数・データ形式が続く説明はおわりの後のおまけ（約8分）にまとめる。

| 場面 | 内容 |
|---|---|
| P00 | 前置き（マニアック・細かい話はおまけ）と目次 |
| A1, A2, A6, A5 | 1 背景：タイル語（NT＋ExRAM、$5130で4組）、地図と辞書（一様セル・8/16/32バイト・行スパン）、転送のしくみの概要（WRAMの型を準備処理が書き換える・生成コード）、PRG内訳 |
| C1, C3, C4, C6 | 2 縦分割とスプライト：画面の分解（実OAM）とExRAMの同居、fine X の揺れ（修正前ROMの全画面＋拡大、8種類のCHRの図）、境界の黒帯（外した映像→実OAMの12枚の配置図）、OAM割り当て（摩擦円の拡大映像） |
| D1, D3 | 3 物理：更新の流れと摩擦円、タイヤ力とMMC5乗算器・DRIFTの補正 |
| E1, E3 | 4 サウンド：5音の割り当て（実測）とチャンネルごとの再合成音、ジングル |
| F2, F3, Z9 | 5 開発環境：AIの検証環境、Webカメラでの実機デバッグ（テレビの写真は撮影待ちで仮枠：`src/d4.tsx` の `WEBCAM_IMG`）、おわりに |
| おまけ | A3 転置辞書 → A4 自己書き換え → B1–B4 経緯（WRAMバッファ8,818→直接転送→列転送176→転置→オペコード書き換え4,660→全数検査 残り141）→ C7 1フレームの流れ → D2 ばね → D4 物理の重さ → D5 1ビットも変えない最適化 → E2 エンジン音の合成 → F1 メモリマップとゴースト |

## 素材と根拠
- **走行**：v2 と同じランキング1位のリプレイ録画。`tools/record_replay.mjs --hide-oam=…` で黒帯スプライトだけ画面外に出した版も撮影（`nomask.mp4`）。
- **修正前ROMの比較映像**：`tools/pan.mjs` がカウントダウン中に自車の位置・向きを毎フレーム書き換えて視点を流す。
  - fine X：`265f0db`（ミニマップ復活時、揺れあり）と `aadb683`（相殺後）の配布ROM。実測でミニマップ左端が 195→188→195 と8ドット周期で動く／195固定。
- **Webカメラの話**：MMC5Racing `origin/codex/webcam-debug-log-20261026` の README（2D の1〜5節のみ使用）。
- **8種類のCHRの図**：`tools/finex_variants.py` が修正後の画面からミニマップを切り出して0〜7ドットずらしたもの（ROM内では断片に分かれていて、そのままは取り出せない）。
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
python -B tools/finex_variants.py
node tools/tts.mjs
node tools/stills.mjs
npm run render
```
`rec/`・`public/`・`webcore/`（v2 へのジャンクション）は git 管理外。生フレーム（frames.rgb）は容量節約のため削除済みで、上のコマンドで作り直せる。

# SuperFX でスペースハリアーを動かす技術 — 解説動画

`GPT/projects/monosh_fx2/releases/MonoSHFX2_v001.sfc`（最新ROM）を、起動直後に SELECT でモノクロ表示へ切り替えて録画し、SuperFX2 の使い方・壁・乗り越え方を約6分45秒で解説する動画。1920×1080 / 60fps。

## 構成
| シーン | 内容 |
|---|---|
| S01 | オープニング（実録画） |
| S02 | なぜ難しいか：SFCスプライトは拡縮不可、モード7は背景1枚、CPUでは遅い |
| S03 | SuperFXとは：カートリッジ内のGSU-2、PLOTでタイル形式に描く |
| S04 | 画面を3層に分解（背景BG / OBJ / SuperFXの絵）— レイヤー別の実録画 |
| S05 | CPU・SuperFX・PPUの分担、10バイトの描画リスト |
| S06 | 壁1：GSU稼働中はCPUがカートリッジROM/RAMに触れない → WRAM実行とパイプライン |
| S07 | 壁2：4bpp(24KB)は60fpsで送れず2bpp(12KB)・白黒に。それでも約6KBしか送れない → 黒帯・変化タイルだけ転送・180ライン |
| S08 | 壁3：GSU描画時間（ボス最悪19.1ms→12.9ms）、命令キャッシュ511/512バイト |
| S09 | 地面はGSUで描かない（BG＋HDMA） |
| S11 | 60fps達成（まとめへのつなぎ） |
| S12 | まとめ |

数値の出典は `GPT/projects/monosh_fx2/DESIGN.md` と `game/v001/RESULTS*.md`。S07 の「送るタイル」表示は、レイヤー録画から「前のコマ・今のコマで物体があるタイル」を数えた近似（実装は描画矩形の和集合なので実際の転送量はこれ以上）。

## 再生成
```sh
# 1. 録画（ROMは無改変。Luaがパッド入力とメモリ読み取りだけを行う。RAM初期値固定で決定的）
python -X utf8 tools/record_fx2.py --out <rec>/main --fields 21000 --fb
python -X utf8 tools/record_fx2.py --out <rec>/gsu --fields 5000 --hide bg1,bg3,bg4,obj
python -X utf8 tools/record_fx2.py --out <rec>/bgonly --fields 5000 --hide bg2,obj
python -X utf8 tools/record_fx2.py --out <rec>/objonly --fields 5000 --hide bg1,bg2,bg3,bg4
# 2. 動画素材（256×180 を2倍ニアレスト）とレイヤー連番
ffmpeg -f rawvideo -pix_fmt rgb24 -s 256x239 -framerate 60 -i <rec>/main/frames.rgb -vf "crop=256:180:0:29,scale=512:360:flags=neighbor" -c:v libx264 -crf 14 -pix_fmt yuv420p public/video/main.mp4
#    bgonly も同様に public/video/bgonly.mp4
FX2_REC_DIR=<rec> python -X utf8 tools/make_layers.py && cp public/seq/tiles.json src/
cp ../../../GPT/projects/monosh_fx2/game/v001/results/native_audio_v2_20261009/bgm_preview.mp3 public/audio/bgm.mp3
# 3. ナレーション（edge-tts ja-JP-NanamiNeural、narration/script.json。readings は読み上げ専用の置換）
node tools/tts.mjs
# 4. 確認用静止画とレンダリング
node tools/stills.mjs
npm run render
```
`public/` と `out/` は生成物なので Git に含めない。

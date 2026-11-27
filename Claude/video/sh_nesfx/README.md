# ファミコン版スペースハリアー（SuperFX＋Mode7）解説動画

FPGAカートリッジに SuperFX 相当と Mode7 相当の回路を入れた、ファミコン版スペースハリアー（11/11 採用版：共通白・空 `$09`／地面 `$19`）の解説動画。1920×1080 / 60fps、1本・約7分半。

開発記録は `GPT/memory/projects/space_harrier_famicom/`（公開GitHubにも同内容）。ROM・`mapper.rbf`・専用Mesenは配布条件が未確認のため、このリポジトリには入れない（`runtime/` `rec/` `public/` は Git 管理外）。

## 構成
| 場面 | 内容 |
|---|---|
| S01 | オープニング（実機映像） |
| S02 | ここまでの道のり：白黒のファミコン版 → SFC版（SuperFX） → 前回 FX Racing 3D → 今回 |
| S03 | ファミコン本体に残したもの（6502／スプライト／Mode7／SuperFX）。白黒版の処理配分（ゲームロジック約8ms）から「残り8msで描画データを作れば60fps」の見積もり |
| S04 | 地面（Mode7、3色の格子、上下移動は視点の高さ）と遠景の二重スクロール |
| S05 | 色：SFC版の2bppカラー → 4本のパレット（空・地面・赤・黒）、8×1での選択と背景優先、共通色を白にして暗緑を `$09`／`$19` に分離 |
| S06 | 30コマ→60コマ：30Hzロジック＋補間 → ロジック60Hz、56段階→111段階、接地点 |
| S07 | 60コマに収める：1フレーム遅らせた並列化、6502側が律速（6.15＋11.30ms）、57.95→59.90fps・遅延205→17回、実機60fps |
| S08 | 音（本体音源＋MMC5） |
| S09 | まとめ |

数値の出典は開発記録の `conversation/2026-11-08〜11.md` と README の測定表。

## 素材
- 実機映像 `public/video/hw.mp4`：`D:\temp\スペハリfc fx_モアレ軽減_音声付き.mp4` を再エンコード。差し替えるときは `src/clips.json` の `hwOpen` / `hwEnd` を見直す。
- 白黒ファミコン版 `mono.mp4`：`D:\HomeBrew\Mesen\Avi\game_CSCD.mp4`
- SFC 2bppカラー版 `sfc_color.mp4`：`D:\HomeBrew\Mesen\Avi\MonoSHFX2_v001_color2_1080p.mp4`
- FX Racing 3D 実機 `fxracing_hw.mp4`：`../fxracing3d/public/video/hw.mp4`
- 比較画像 `public/img/*.png`：開発記録の `images/`（公開版のみ。第三者の参照画像を含む local-only の原本は使わない）
- ゲーム画面：専用Mesenで録画（下記）

## 録画（専用Mesen、ROM無改変）
`runtime/` は `local-only/Windows-Mesen-Sky09` のコピーで、`settings.json` だけ Lua の IO 許可と RAM 初期値ゼロを足したもの（`runtime_nospr/` はさらにスプライト非表示）。起動は同梱の `launch.py` のハッシュ検証・マッパー指定・コア保護をそのまま使う（`tools/mesen_run.py`）。

```sh
# 1. 自動操縦の入力列を探す（Luaはパッド入力と画面・メモリの読み取りだけ）
#    この回路のセーブステートは状態を全部は戻さず再生がずれるため、毎回電源投入から再生し直す
#    起動直後からゲームが始まる。STARTはボス切替なので押さない
python tools/autopilot.py rec/ap1 --frames 9600 --chunk 600 --start-at 60
# 2. 入力列を電源投入から再生して録画（PNG連番＋音源レジスタ書き込みのログ）。スプライト非表示版も同じ入力で
python tools/record.py rec/ap1/inputs.txt rec/final
SH_RUNTIME=runtime_nospr python tools/record.py rec/ap1/inputs.txt rec/final_ns
# 3. ゲーム音：記録したレジスタ書き込みから 2A03＋MMC5 矩形波を合成（DMC/PCMは未使用）
python tools/apu_synth.py rec/final
# 4. 動画素材（src/clips.json の切り出し位置を使う）
python tools/make_media.py rec/final rec/final_ns
python tools/make_palfigs.py rec/final_ns   # S05: 8×1ごとのパレット地図・輪郭の色比較（public/img, src/palspan.json）
```
S03 のレイヤー分解（スプライト／地面／SuperFXの絵）は、スプライトは通常とスプライト非表示の差分で正確、地面とSuperFXの絵は画素の色からの推定（画面にもそう表示）。S05 の 8×1 の図も画素の色からの推定。S06 の30コマ側は、60コマの録画を1コマおきに間引いた説明用。

## ナレーションと書き出し
```sh
node tools/tts.mjs            # edge-tts ja-JP-NanamiNeural。readings は読み上げ専用の置換
node tools/stills.mjs [S03]   # 各文の確認用静止画 out/stills/
node tools/render.mjs         # out/sh_nesfx.mp4
```

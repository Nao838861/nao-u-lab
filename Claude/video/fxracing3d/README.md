# FX Racing 3D 解説動画

「ファミコンのカートリッジにSuperFXチップとMode7を搭載して、画面が回転するレースゲームを3D化してみた」の解説動画。1920×1080・60fps、約6分。制作の型は前作 `../mmc5_v2`（MMC5Racing 2D版の解説）にそろえた。

## 方針（ユーザー指定・2026年11月9日）

- GSUのクロック（50MHz）には触れない。AIとの開発の話は入れない。
- Mode7は「Mode7をカートリッジに入れた」「Mode7のアルゴリズムを再現した回路」と言い切る。「スーファミと互換」とは言わない。
- 色は厚めに説明する。空を含めた5色と、タイリング（2色の市松模様）で色を増やしたこと。
- 説明は実機で動いている版で行う。説明用の画面はエミュレーターの画像でよい。
- 車のポリゴン数と、デザインの試行錯誤（面を減らす工夫）を見せる。

## 構成（2026年11月9日 改訂版・約8分20秒）

| 場面 | 内容 | 主な素材 |
|---|---|---|
| S01 | 実機で3Dレース | 実機映像 `hw.mp4` |
| S02 | 前回は128方向の絵、今回は毎回計算 | 前作の2D映像・向き別の絵 |
| S03 | カートリッジにSuperFXとMode7 | 実機映像（カートリッジ） |
| S03b | どこで何をしているか：ゲームは6502、カートリッジは絵だけ。FPGAの部品6,248/6,272、ROM約1.1MB（2D版2MB）。できないこと3つ | 図 |
| S04 | できないこと1：絵を描けない。12,288バイトは送れない（1コマ約300バイト）→ PPUが読みに来たときに返す | 層画像 |
| S05 | できないこと2：地面を回せない → Mode7が1行ずつ地図を読む | 地面だけの映像、コース地図と行テーブル |
| S05b | Mode7の中身：計算の手順、横から見た図、実際の行テーブルの数、足し算だけ、地面は保存せず行バッファ2本 | 行テーブル・地図 |
| S06 | できないこと3：色 → 8×1ドットごとに色の組、空の行は白を青に | 層画像、色の組の地図 |
| S07 | タイリングで10通り | 層画像 |
| S07b | SuperFXの中身：市松はSuperFXのディザ機能、もう1つのCPU、処理の流れ、割り算の命令がない、LOOPとPLOT、2枚の絵の入れ替え | 実際のGSUのプログラム、車のクリップ |
| S08 | 車を作る：19面・42頂点、14案、背1.3倍、後輪は斜めの板1枚 | ROMの車データから描いたクリップ |
| S09 | 走りは2D版と同じ | 録画（HUDの摩擦円） |
| S10 | 4つの視点 | 視点切り替えの録画 |
| S11 | 2D版のリプレイを3Dで（2D版DRIFTの記録を左右に並べる） | `tools/record_2d3d.mjs` の録画 |
| S12 | まとめ | 実機映像 |

YouTubeのコメントの疑問（Mode7を「追加」とは？、電気的に載るのか、転送量は、ファミコンは映像を映すだけか、容量）に、S03b・S04・S05b で答える。

台本は `narration/script.json`。`node tools/tts.mjs` で1行ずつ音声を作り、`src/timing.json` に正確な時刻を出す。場面ごとの前後の余白は `src/common.tsx` の `EXTRA_LEAD` / `EXTRA_TAIL`（`tools/stills.mjs` にも同じ値）。

## 素材の作り方

### 実機映像
`C:\vol0\FxRacing3.mp4`（71秒、ブラウン管をカメラで撮影、30fps）を `public/video/hw.mp4` に置く。撮影用ROM（GRIP 8位のリプレイを自動入力）を実機で走らせたもの。結果画面のラップ12.48／11.98／11.73／13.23／11.93、合計1:01.36は、Web版の記録（749／719／704／794／716 tick、計3682 tick）と一致する。

### エミュレーター映像（Web版と同じコア）
`D:\HomeBrew\FxRacingWeb` のブラウザー用コア（Mesen＋FxRacingマッパー）をそのまま使う。色は実機の表示回路に合わせた4色合成を反映済み。

解説用に、コピーしたソース（`rec/coresrc`）へ次の2点だけを足したコアを `webcore/explainer/` に作った（元のリポジトリは変更していない）。変更は `tools/explainer-core.patch`。

- `web_explainer_hide`：車・木・家（SuperFXの絵）を合成しない。地面だけの画面を作る
- `web_explainer_info` / `web_explainer_rows`：8ドットごとの合成情報（物体の不透明マスク・空の行か・選んだ色の組）と、Mode7の行テーブル（u, v, du, dv）

切り替えOFFでは、元のコアと4,500コマの画面・音のハッシュが完全に一致する（`tools/check_same.mjs`、結果 `rec/check_same.json`）。地面だけの映像は、同じ入力を与えたもう1台のコアで同時に作り、2台のRAMが全チェックで一致することを確かめている（保存状態からの巻き戻しは、このマッパーでは壊れるため使わない）。

```sh
# コアの再ビルド（Emscripten: D:\Tools\emsdk）
cd rec/coresrc && python emulator/build.py --compile-only --emsdk D:\Tools\emsdk --output ../../webcore/explainer
node tools/check_same.mjs 4500
# 録画：タイトルで下→START、以後はROMがリプレイを流す
node tools/record.mjs main --layers=600,700,...,4300
node tools/record.mjs views --select=900,1500,2100,2700,3300,3900
python -I tools/make_layers.py 1500 2100 3200      # 層画像
python -I tools/make_mode7.py 3200                 # コース地図と行テーブル
python -I tools/make_car_clips.py                  # 車のクリップ
node tools/tts.mjs
node tools/stills.mjs --delay=80
npm run render
```

`webcore/` には、FxRacingWeb の `dist/emulator`、`core-loader.js`、Web版のROM（`normal.nes`、SHA256 `aafcc924…`）、撮影用ROM（`rank8.nes`、MMC5Racingのブランチ `codex/fx-ui-audio-main-20261102` の `releases/FX_Racing_3D_20261107_Rank8Capture`）を置く。

### 車のクリップ
`tools/make_car_clips.py` が、ROMの車データ（頂点・面・材質）を直接読んで描く。描き方はゲームと同じ（面は記録の順・裏面は描かない・2色は1ドットごとの市松模様・画素は8:7の横長）。形の変遷は、MMC5Racingの開発記録（`06cd962` デザインB、`0f662f9` デザインD、`13888df` 幅7/8）の車体と窓の16頂点を補間したもの。色は現在のもので統一している。

## 確かめたこと・注意

- 色の組（録画した全コマの集計）：地面＝灰・緑・白・赤、空＋物体＝青・緑・灰・赤。黒は画面左端。
- Mode7の地図の値と色の対応は、地面だけの画面と突き合わせて決めた。
- 8位の走りは、Web版（FxRacing Web、3D）で記録されたもの（`replayVariant: 3d`）。2D版の記録を3D版で流したものではない。
- 走行のクレジット「Look」（実機映像）の名前表示は、ユーザーの確認待ち。
- S11 の2D版の記録は作者（Nao_u）のDRIFT（2378 tick、2D版 epoch 15）。2D版のエンジンで走らせ、Web版と同じ方法（presentation コア）で毎コマの車の状態を3D版のROMに渡して描く。2378コマすべてで位置・向きが一致。
- 「SuperFXのプログラム」として映しているのは `development/fx-racing-3d/rog-integration/actors-gsu15/gsu.s`。面を塗る内側は `loop` / `plot`、市松は `cmode` のディザ。
- 地面は表示回路（`racing_display.vhd`）のチップ内の走査線バッファ2本で1行ずつ作る。描き上がったSuperFXの絵はカートリッジのRAMに2枚分。
- BGMは前作と同じ `bgm.mp3`。

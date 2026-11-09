# FX Racing 3D 解説動画

「ファミコンのカートリッジにSuperFXチップとMode7を搭載して、画面が回転するレースゲームを3D化してみた」の解説動画。1920×1080・60fps、約9分。制作の型は前作 `../mmc5_v2`（MMC5Racing 2D版の解説）にそろえた。

## 方針（ユーザー指定・2026年11月9日）

- GSUのクロック（50MHz）には触れない。AIとの開発の話は入れない。
- Mode7は「Mode7をカートリッジに入れた」「Mode7のアルゴリズムを再現した回路」と言い切る。「スーファミと互換」とは言わない。
- 色は厚めに説明する。空を含めた5色と、タイリング（2色の市松模様）で色を増やしたこと。
- 説明は実機で動いている版で行う。説明用の画面はエミュレーターの画像でよい。
- 車のポリゴン数と、デザインの試行錯誤（面を減らす工夫）を見せる。

## 構成（2026年11月9日 完成版・9分02秒）

| 場面 | 内容 | 主な素材 |
|---|---|---|
| S01 | 実機で3Dレース | 実機映像 `hw.mp4` |
| S02 | 前回は128方向の絵、今回は毎回計算 | 前作の2D映像・向き別の絵 |
| S03 | カートリッジにSuperFXとMode7。「スーパーファミコンの時代に生まれたこの2つを、ファミコンに載せたらどうなるか」という試み | 実機映像（カートリッジ） |
| S03b | どこで何をしているか：「画面を映しているだけでは？」→ 答えはゲームそのもの（6502）。カートリッジは3D描画だけ。スターフォックスと同じ構造（2つの枠をまたぐ帯）。FPGAの部品6,248/6,272、ROM約1.1MB（2D版2MB）。できないこと3つ | 図 |
| S04 | できないこと1：絵を描けない。12,288バイトは送れない（1コマ約300バイト）→ PPUが読みに来たときに返す | 層画像 |
| S05 | できないこと2：地面を回せない → Mode7が1行ずつ地図を読む | 地面だけの映像、コース地図と行テーブル |
| S05b | Mode7の中身：計算の手順、横から見た図、実際の行テーブルの数、足し算だけ、地面は保存せず行バッファ2本。合成：8ドットずつ、地面＋SuperFXの絵（マスク）→ パレットを選んでラインバッファへ（102ライン目176〜183ドットの実例） | 行テーブル・地図、層画像 |
| S06 | できないこと3：色 → 画面全体の5色、空の行（0〜82）と地面の行（87〜191）でパレットを分ける、空の行には白が出せないのでデザインで工夫、8×1ドットごとに色の組 | 層画像、色の組の地図 |
| S07 | タイリングで10通り | 層画像 |
| S07b | SuperFXの中身：市松はSuperFXのディザ機能、もう1つのCPU、処理の流れ、割り算の命令がない、LOOPとPLOT、2枚の絵の入れ替え | 実際のGSUのプログラム、車のクリップ |
| S08 | 車を作る：19面・42頂点、14案、背1.3倍、後輪は斜めの板1枚 | ROMの車データから描いたクリップ |
| S09 | 走りは2D版と同じ | 録画（HUDの摩擦円） |
| S10 | 4つの視点 | 視点切り替えの録画 |
| S11 | 2D版のリプレイを3D版で：挙動が同じなので2D版ランキングのリプレイが3D版で見られる。ランキングは2D版・3D版で共通 | `tools/record_2d3d.mjs` の録画、Web版ランキングのスクリーンショット |
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
- S11 の2D版の記録は作者（Nao_u）のDRIFT（2378 tick、2D版 epoch 15）。2D版のエンジンで走らせ、Web版と同じ方法（presentation コア）で毎コマの車の状態を3D版のROMに渡して描く。2378コマすべてで位置・向きが一致。
- 「SuperFXのプログラム」として映しているのは `development/fx-racing-3d/rog-integration/actors-gsu15/gsu.s`。面を塗る内側は `loop` / `plot`、市松は `cmode` のディザ。
- 地面は表示回路（`racing_display.vhd`）のチップ内の走査線バッファ2本で1行ずつ作る。描き上がったSuperFXの絵はカートリッジのRAMに2枚分。
- BGMは前作と同じ `bgm.mp3`。

## 別のPCで続きをする

GitHubにあるもの：ソース（`src/`）、台本（`narration/script.json`）、時刻表（`src/timing.json`）、作業用スクリプト（`tools/`）、そして作り直せない入力をまとめた `assets/`。

| `assets/` | 中身 | 元の場所 |
|---|---|---|
| `hw/FxRacing3.mp4` | 実機映像（ブラウン管をカメラで撮影、90MB） | `C:\vol0\FxRacing3.mp4` |
| `webcore/` | Web版のコア（元と解説用）、Web版のROM、撮影用ROM、2D版のエンジン（epoch 15）、presentation コア、必要なWebのモジュール、Mesenの対応ソース | `D:\HomeBrew\FxRacingWeb`（GitHub外のリポジトリ）、MMC5Racing のブランチ |
| `prev/` | 前作の2D映像と向き別の絵 | `../mmc5_v2/public`（git対象外） |
| `img/` | Web版ランキングのスクリーンショット、車のデザイン比較画像 | `tools/shot_ranking.cjs`、MMC5Racing のブランチ |
| `replays/` | 2D版DRIFTのリプレイ（作者の記録）、ランキングのデータ（2026-11-09取得） | ランキングの公開API |
| `shapes/` | 車の形の変遷（デザインB／D／幅7/8） | MMC5Racing の開発記録 |
| `audio/bgm_game.mp3` | BGM（ゲームのオリジナル曲 タイトル→GRIP→DRIFT を2秒のクロスフェードでつないだもの） | MMC5Racing `media/bgm` |
| `narration/` | ナレーション音声（`src/timing.json` と対応） | `tools/tts.mjs` |

手順:

```sh
cd Claude/video/fxracing3d
npm install
node tools/rebuild_all.mjs     # 録画・層画像・地図・車のクリップ・2D/3D比較を作り直す（約4分）
npm run stills                 # 各ナレーション行の静止画（out/stills）
npm run render                 # 書き出し（out/fxracing3d_explainer.mp4、同時2本で約50分）
```

必要なもの：Node 20以上、Python 3（numpy, Pillow）、ffmpeg。台本を変えたときは `pip install edge-tts` のうえで `node tools/tts.mjs --scene=S06`（`assets/narration` も更新される）。`--scene` を付けないと全場面を読み直し、他の場面の長さが少し変わることがある。

書き出しの同時処理は2本にしている（`package.json` の `--concurrency=2`）。4本以上だと実機映像 `hw.mp4` で「No frame found at position」になって止まる（ファイルは正常で、再エンコードしても変わらない）。

### 一部の場面だけ直したとき

```sh
node tools/tts.mjs --scene=S06   # 台本を変えたときだけ
node tools/splice.mjs S06 S07    # 指定した場面だけ作り直して、全編に差し替える（数分）
```

`tools/splice.mjs` は、前回の書き出しの時刻表（`out/fxracing3d_explainer.timing.json`、`npm run render` のあとに保存される）と今の時刻表を比べ、指定した場面の前後のキーフレームの範囲だけを書き出し直す。残りの映像は再圧縮せずにつなぐ。指定した場面の長さは変わってもよい。そのときは音（BGM・ナレーション・実機映像などの音）を `tools/mix_audio.mjs` で ffmpeg で合成し直す（`src/Root.tsx` と同じ組み立て。Remotion で音だけ書き出すと映像と同じくらい時間がかかるため）。前の全編は `out/fxracing3d_explainer.prev.mp4` に残る。動画の音量や BGM の扱いを `src/` で変えたときは、`tools/mix_audio.mjs` も合わせる。
2026-11-09、GitHubに上げるファイルだけを空のフォルダーにコピーして `rebuild_all.mjs` を実行し、層画像・コース地図・行テーブル・車のクリップのデータが元とハッシュまで一致することを確認した。

解説用コアを作り直すときだけ、FxRacingWeb のソースと Emscripten が要る（`tools/explainer-core.patch` を当てて `emulator/build.py --compile-only`）。ランキングを撮り直すときだけ、FxRacingWeb の `tools/serve.py --port 8091` と playwright-core が要る（`tools/shot_ranking.cjs`）。

## 決まっている方針（ユーザーの指示、2026-11-09）

- 50MHzには触れない。AIとの開発の話は入れない。クレジットは出さない（実機映像の走行も作者の記録）。
- Mode7は「Mode7のアルゴリズムを再現した回路」。「スーファミと互換」とは言わない。
- SuperFXは「ファミコンのCPUを補佐するコプロセッサ。スターフォックスと同じように3D描画を受け持つ」。「もう1つのCPU」「主役は6502」のような言い方はしない。ゲーム本体はファミコンの6502が動かしていることが、説明の流れから自然に伝わるようにする。
- 用語は言い替えない（VBLANK、VRAM、パターンテーブル、ダブルバッファ、ライン、テクスチャ、ポリゴン、ディザリング、パレット など）。幼稚な言い替えはしない。
- 色の話は「パレット」。説明は簡潔に。タイリングで色を増やしたことは見せる。
- 2D/3Dの場面は「車体の挙動が同じなので、2D版のランキングのリプレイが3D版でそのまま見られる。ランキングは共通で、視点の違う2つのゲームで同じタイムアタックができる」。
- YouTubeのコメントの疑問（Mode7を追加とは？、電気的に載る？、転送量は？、ファミコンは映像を映すだけ？、容量は？）に答える内容にする。
- 読み上げの誤読は `narration/script.json` の `readings` で直す（字幕の表記は変えない）。
- 「ファミコンを乗っ取って絵だけ出している」ものと同類に見られないようにする。ただし、そうした作品を否定する言い方はしない。軸は「本体に手を入れたか」ではなく「カートリッジに何を載せたか」と「誰がゲームを動かしているか」。S03 で「スーパーファミコンの時代に生まれたこの2つを載せたらどうなるか」という試みとして示し、S03b で「画面を映しているだけでは？」→「答えはゲームそのもの」→「スターフォックスと同じ構造」と流す。
- スターフォックスの名前は、今ある箇所（S03・S03b・S07b）から増やさない。

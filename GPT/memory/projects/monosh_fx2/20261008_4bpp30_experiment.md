# MonoSH FX2：独立した4bpp・30fps実験

2026年10月8日。ユーザーは「2bpp・60fps開発に影響させずソース・GitHubを分岐」「まず既存素材を4bpp化」「60fps版の最新修正を取り込む」「同じ録画から敵や背景物体のカラー素材を採取」「完了まで止まらず進める」と指示した。原文は実験側 `game/v001/DESIGN_4BPP_30FPS.md` に保持。

## 再開する場所

- 独立worktree: `D:\HomeBrew\MonoSHFX2_4bpp30_20261008`
- GitHub: [experiment/4bpp-30fps-20261008](https://github.com/Nao838861/MonoSH_FX2/tree/experiment/4bpp-30fps-20261008)
- 起動: 同所 `play_4bpp30.cmd`。`--mono`で白黒比較。
- エディタ: 同所 `edit_4bpp30.cmd`。VS CodeのF5はこのworktreeの4bppカラー版をビルドしてMesenで起動する。
- ROM: `releases/MonoSHFX2_4bpp30_color.sfc` と `releases/MonoSHFX2_4bpp30_mono.sfc`
- 正確な測定値・ROM SHA256: 同所 `game/v001/RESULTS_4BPP30_20261008.md` と `releases/4bpp30_*.json`

元の `GPT/projects/monosh_fx2`、NES、FamiBASICの作業フォルダーを編集していない。mainの4c5ec38まで一方向にmergeした。継続同期は実験worktreeをcommitした上で `powershell -ExecutionPolicy Bypass -File tools/sync_4bpp_upstream.ps1`。mainを実験内容へmergeし返さない。

## 方式と判断

内部256×192の4bpp画像は24KiB。表示180行と地面・空のHDMAを維持。VRAMに画像二面を置き、四本の64px縦帯を交互に二本ずつ描画・転送する。論理更新と入力は各画像につき2回、完成画像だけを切り替える。CPUの2bppタイル色属性生成は4bpp経路で実行しない。

DMAは現在と転送先の旧画像の列範囲の和集合。隣接区間は結合し、区間過多では担当帯の全転送へfallbackする。12KiBずつの全量DMAが上下黒帯に収まることと、GSU描画まで含めて常時30fpsであることは別。ボス近距離のGSU時間とDMA開始の締切が残る制約。平均fpsだけで全場面固定達成とは扱わない。

ボス・爆発4姿勢・ボス弾はQ8.8の水平縮小行を事前生成し、2MiBのROM内の空きを使う。生成対象外の幅・高さは汎用描画へ戻す。SNES乗算器による爆発高さは元の整数式と検証中に照合する。

GSUはUV準備で描画kernelのcacheを入れ直さず、連続するボス部品で保持する。転送plannerと背景二層もcacheへ置く。胴・顔の事前縮小行は1画素1byteで置き、重い部品の4bit展開を省く。これらは4bpp経路に限定し、2bppのCACHE命令は維持する。DITHERによる二画素まとめ読みも試したが、不透明runの管理費用で維持試験の最大が13.48→14.63msへ悪化し、採用していない。

## 素材と検証で得た注意

同じ `D:\HomeBrew\MonoSH\tmp\スペースハリアー録画１.mp4` から採取。RGBA、秒数・矩形・動画SHA256を実験側 `assets/color4/` に残す。四角い爆発と隣の胴の混入を画面確認で発見し、採取コマ・矩形を変更。録画RGBを残し、透明マスクを既存素材の輪郭と交差させた。録画にない転倒9姿勢は派生着色。影・STAGEは元の素材。

ユーザーの「16bppカラー」は4bppの16色と区別する。現在の合成画像は共有15色＋透明色、空・地面は別RGB5 HDMA。原動画全色の無損失再現を達成したとは言わない。

- Luaの入力注入はMesenの`inputPolled`へ。`startFrame`だけで渡すと通常入力で上書きされ、移動・連射を試したつもりになりうる。controlsでは移動範囲と弾数、pauseでは時間停止・再開までassertする。
- callbackのassert失敗は`pcall`から`emu.stop(1)`へ伝える。終了後に遅れて届くcallbackはfinishedで無視する。
- 表示面の切替が走査線203以降なら「次フィールドに見える」と数える。単純なfield差の1/3を処理落ちと誤算しない。
- framebuffer全画素の一致に加えて、表示中VRAMの24KiBも照合する。長時間試験で締切の余裕不足による右端の残像を見つけ、DMA予算を修正した。
- GSU raw packetはcart RAM 0020から。0030をscratchに使うと2番目の描画命令を壊す。DMA plannerの一時領域は001Cを使う。
- GSUのFROMは値をR0へコピーしない。直後のIWTなどでsource指定がリセットされることにも注意する。
- ROMBはROM先読みを再起動しない。bankを選んでからR14を更新する。逆順だと最初のGETBだけ旧bankから読み、DVの下位byteが欠けるなどの不具合になる。

共通build変更後の2bpp既定ROMは、main由来配布ROMと全2MiBが完全一致した。SHA256 `4ef5a95fec70a4ee3dfcf3b9f39ea38180aa138fd44b7709fed8b21704197025`。720フィールドの操作・FB・OBJ照合も成功。実験を元版に混ぜていない根拠として保存した。

## 最終成果と計測

実験ブランチの `49c59d6d515c8d361e03b8e8d3a045aca5c3df64` までGitHubへpush済み。描画・素材の修正は `174eb79`、mainの取り込みは `9988ac1`。実験worktreeはclean、remoteとahead/behindとも0。

- カラーROM SHA256: `157a38a0b5f48c20e83ae499cf2e447dce02b7f9c7c9967d64f48c98c080c3ad`
- 白黒比較ROM SHA256: `007d1cb84fb04c80f4764a992f170645ff843eece4d277d5634a609ab13dc499`
- 通常進行18,000フィールド: **平均30.0043fps**。8,974更新間隔中27回が3フィールドで、近距離ボスの厳密な固定30fpsは未達。最大GSU半描画15.230892msで、残る制約はCPU準備・描画・DMAを合わせた締切。
- 通常操作・連射、ボス維持、撃破・次周、ポーズ、死亡復帰の個別カラー試験は30.0494fps、遅延0。
- 全24KiBは12KiB×2、各2記述子のDMAで最大4.851827ms、次フィールド19行までに完了。ただし全面拡大の人工fixtureは描画との合計時間で15.0247fps。帯域成立と全面描画30fpsの保証を混同しない。
- カラー全8試験＋白黒2試験の**1,173枚**で、独立合成した49,152画素と表示中VRAM 24KiBが完全一致。全素材試験は胴・顔の事前縮小経路を左上clipでも通す条件へ強化した。
- カラー版を最終ソースから再ビルドし、配布ROMと完全一致。エディタのF5が呼ぶビルド・起動経路とカラー／白黒ランチャーの設定を確認した。GUIを自動で開いてはいない。Mesenでの検証で、実機検証は未実施。

配布ROMは `releases/`、画面比較と計測詳細は `game/v001/RESULTS_4BPP30_20261008.md`。不採用DITHER案の測定は `results/four_bpp_20261008/rejected_dither/` に区別して保存した。継続同期スクリプトはmainを一方向にmergeし、2bpp既定ROMの完全一致、カラー全8試験・白黒2試験、画素照合、ROM保存・結果再生成後に実験ブランチだけへpushする。常駐の自動同期は設定していない。

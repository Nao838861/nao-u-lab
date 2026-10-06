# MonoSH Super FX2 記憶入口

最新の指定RGBと列配色は [配色の修正](20261006_ground_palette_correction.md)。直線パース・OBJ化・長時間検証は [地面修正とOBJ化](20261006_ground_obj_v001.md)。曲線の原因を調べた段階の履歴は [パースの調査](20261006_ground_perspective_diagnosis.md)。

NES の MonoSH を SNES の CPU と Super FX2 へ移植する新プロジェクト。2026年10月5日に設計を開始した。

正本は [プロジェクト入口](../../../projects/monosh_fx2/README.md) と [設計書](../../../projects/monosh_fx2/DESIGN.md)。原文は同所の `REQUEST.md`。NES 側の入口は [MonoSH 記憶入口](../monosh/README.md)。

GitHubの独立リポジトリは [Nao838861/MonoSH_FX2](https://github.com/Nao838861/MonoSH_FX2)、既定ブランチmain。[2026年10月6日の公開記録](20261006_github_publish.md)に反映先・clone検証・次回の同期先を保存した。nao-u-labの作業ブランチだけへのpushでは、この独立リポジトリは更新されない。

**現在は指定RGBの緑四色を暗い1/2列・明るい4/3列へ修正したROM。直線パース・紫の空、自機・自弾・反射弾のOBJ化を維持。** 次回は [配色のチェックポイント](20261006_ground_palette_correction.md) と [移植のチェックポイント](20261006_ground_obj_v001.md) と [測定](../../../projects/monosh_fx2/game/v001/RESULTS.md) から再開する。表示256×180、通常57.05fps、序盤59.35fps。内部FB192行。全12KiB＋OAM68bytesは20行完了、22行でOBJ準備、23行から表示。11試験・自然な周回・C/native一致・最終PPUを確認。192行・全場面60fpsは未達。起動は [play.cmd](../../../projects/monosh_fx2/play.cmd)。[前版の高速化](20261005_render_pipeline_v001.md)、[表示修正](20261005_display_fix_v001.md)、[初版](20261005_playable_v001.md) は履歴。

## 移植前のプローブ履歴

ユーザーと確定した方針は、ロジックも60Hz、MSXSH の V9968 版の倍密度Z2と時間仕様を参照、上下黒帯による全フレームバッファ転送。横は可能な限り256、縦も可能な限り192を目指す。NES版の128×96を2倍にした256×192と同じ画面領域比率4:3が基準。160行の先行採用は撤回した。

次回は [v001測定結果](../../../projects/monosh_fx2/probes/v001/RESULTS.md) から再開する。ユーザーの追加指示でGSU描画カーネルと帯域ROMを実装した。標準Mesenで192行・上下16行黒帯の全12KiB転送は11,296bytesだけ届き、992bytes欠ける。224行では6,051bytes。7KiBを標準224行の枠とする仮定は今回の条件で成立しなかった。192行を保つ転送不足の対策が次の壁打ち。160行や96行2倍表示へ自動変更しない。

最大原画1枚からの縮小のみを試験。NESの木34×80をSNES用68×160へ倍化した素材。等倍は同色区間2.866ms、半分はpacked 2bpp 0.988ms、1/4はpacked 0.303ms、遠方は整数点参照。細かい模様で同色区間は悪化するので統一しない。NESの最大の木の生成済み描画本体は2.262msで、FX2の最大は約27%遅いが4倍の画素を扱う。全クリア2.869ms。人工の木30体はクリア込み9.536ms、近距離を増やすと11.012msで約11ms予算ぎりぎり。実ゲームsceneの60fpsとは扱わない。

幅1〜128の汎用3経路を含む534件と30体合成2件で参照FB・guard一致。汎用の同色区間は厳密比率、点参照はQ8.8で非整数倍率の丸めが異なるため、111段階の方式切替前に統一する。GSU中のCPUはWRAMで待機するのみ。ゲームロジック、RAM描画リスト解析・reverse DMA、地面、割り込み、実機は未検証。CPU 4msは未実測。NES/MSX元プロジェクトは読み取りのみ。

再実行は `python -X utf8 projects/monosh_fx2/tools/verify_probe.py`。既存ca65/ld65・Mesenと外部casfxを使用。依存commit・実行ファイル／入力ハッシュと測定結果はv001へ保存、`.cache` / `build` はgit対象外。検証ROMはLua入力待ちのプローブであり、ゲームROMではない。

追加壁打ち: 最大の木2.866msと30体場面は全体が画面内に収まるclipなし条件。`cropped` は透明余白除去を指す。NESの表示128／VBUF256／bias64に相当する左右余白はGSUの256幅にはないため、画面内は高速経路、端だけclipに分ける。DMA候補は [DMA_OPTIONS.md](../../../projects/monosh_fx2/DMA_OPTIONS.md)。CPU描画矩形の前後和集合なら2人工場面の集計で320tile・5,120bytes・31区間。分割DMA費用は未測定。全転送を維持する案はHBlank内だけforced blank＋追加分をWRAMへ退避する実験候補で、画面・所有権・OBJ・位相確認が必要。方式変更は未採用。

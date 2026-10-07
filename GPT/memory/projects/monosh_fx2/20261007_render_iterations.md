# MonoSH FX2：60fpsへ向けた反復最適化

依頼原文：
> さらなる最適化を何度も繰り返し実行して、60fpsを目指して。

正本は [反復最適化の結果](../../../projects/monosh_fx2/game/v001/RESULTS_20261007_RENDER_ITERATIONS.md) と `game/v001/results/render_iterations_20261007/`。基準ROMは録画自機を統合したe301b0bc。最終ROMは `4c9308d79d3cdf1108267a9678289721e081912ffc3436b98758a32e4eec418b`。

10構成で同じ122標本を再描画し、GSU STOPまでとCPU packet時間を別々に比較した。透明余白表は約2.4%短縮に留まり汎用経路が悪化、bucket sortは人工64体に有効だが実ゲーム平均packet 4.085→4.406msへ悪化したため不採用。横縮小済みpacked行、共通cache配置、OBJ/direct page、clip端数、簡単なUV準備、区間表読出しDMA、DMA区間生成cacheを順に採用。

原画bank行領域後の703,744byteのpaddingへ、6素材608幅・646,848byteの横縮小済みpacked行を追加。縦は従来V/DV、左右反転・未収録幅・7px以下は元経路へ戻る。duは元と同じfloor(sourceWidth*256/width)。原画や縮小の段階を丸めず、色0は透明。2MiB ROMを維持し、bank5Fに索引。独立検査で原画249,538画素、縮小2,514,624画素、領域非重複・ROM一致。

GSU共通485byteにscaled/generic/UV/先頭端数を配置。spriteのclip状態変更でCBRを切り替えず、最後のDMA区間生成201byteだけ別cacheへ移す。CPU STOP後に最大128byteの区間表をcart RAMからWRAM portへDMA。FB bytes+128*spanCount<=9984なら203..220行で開始でき、大きい場合は203行のみ。OBJの22行準備・23行表示を維持。

固定ボス17.352→11.459ms（34.0%短縮）。実ゲーム107標本packet平均4.148→3.397ms。242標本・1,194画像の独立FB/OBJ照合、元122標本ハッシュ一致。通常入力18,000fieldでは17,977画像、道中15,627・ボス1,803・撃破後537の提示間隔すべて1field、60.10fps。GSU最大道中12.846・ボス12.938ms、CPU最大14.803・13.490ms。CPUは当初の4ms見積りでは収まっていないがGSUと並行して毎field提示を達成した。

回帰の`objects360`は17pose・4反転・16弾サイズ・最大12 OBJ、PPU66画面15,313画素一致。`held1800`は左上＋Y押しっぱなし、誤Start・停止なし。`controls720/pause360/display720/boss2600/stumble800/stress360/packed360`も検証。人工64体はCPU packet約42ms、大型物20体のstressも60fps保証対象ではない。

さらにbossFire=noneで18,000field計測。道中5,065・ボス12,911間隔すべて1field、戦闘GSU最大11.459ms・CPU最大10.769ms。通常入力と合計35,955画像、約10分で提示遅延0。長期ボスは`boss_profile_finalnofire`へ保存した。

全転送360fieldも最大12 OBJと併用し、最遅20行で完了。専用ROMは`08fde4ab9fd8387f9de7ba246a602d3f940a3af1813a1b56b53b68ab4cc24b76`。検証後に既定4c9308d7を再ビルドして一致。縮小表を無効にしたfallbackも122標本745画像でFB/OBJ一致。公開ROMは45,632field、別構成は全転送360＋fallback832fieldを検証。

再開は `tools/verify_render_release.py`。固定標本は `tools/benchmark_render.py --name final --edges`。自然入力は `tools/profile_boss.py --frames 18000 --timeout 600 --output boss_profile_final`、最終集計は `analyze_render_profile.py`。DMA完了の簡易fieldカウンタは225行をまたぐと0/2になるため、FPSはDMA開始の物理fieldで算出する。途中ROM・生成Luaを圧縮保存し、最終ソースのフラグだけで昔の試行数値を再現できるとは扱わない。

`opt_obj`〜`opt_uv`の途中版はOBJ位置表がCODE bankにありDBR=7Eで読めない誤配置を含む。FB検査だけの途中測定で公開しない。RODATAへ直して最終OAM/PPUを検証した。昔の途中OBJに色が付く/付かないという説明に混ぜない。

表示192行・音・実機確認は残る。通常入力約5分での60fpsと任意のプレイの保証は区別する。GitHub独立mainへの同期は親repoへのcommit/pushだけでは済まない。

追加依頼「道中がほぼ60fpsが達成できていたのであれば、縮小パターンを持つのはボスの大きなファイルの一部だけにできたりしないだろうか？実装前に可能かどうか検討して。」は [縮小パターン限定の検討](../../../projects/monosh_fx2/game/v001/SCALE_SUBSET_ASSESSMENT_20261007.md)へ保存。実装していない。ボス3素材だけで631.7→397.3KiB、顔・弾のみ296.5KiB。既存69道中標本の全無効版はGSU最大11.085msで有望だが、現行から選択的に外した結果ではない。まず3素材を残して長時間測定、必要時のみ大きい木の特定幅を戻す。ROMは4c9308d7のまま。

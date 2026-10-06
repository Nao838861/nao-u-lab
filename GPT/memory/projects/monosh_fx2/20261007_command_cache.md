# CPUコマンド分類・GSUキャッシュ保持の実装

依頼はクリッピング要否をCPUの描画コマンドで指定して最適化し、道中の60fps未達頻度も計測すること。詳細と原本は [実装・計測](../../../projects/monosh_fx2/game/v001/RESULTS_20261007_COMMAND_CACHE.md)、[ログ](../../../projects/monosh_fx2/game/v001/results/command_cache_20261007)。

既定ROM SHA256 `f051e4e435b875e6513f1e4f05d6e91f1e71e448d285c925cf536a690b65eff7`。packet末尾制御word bit15=INSIDE、元FxDraw・Z/priority・flagsは保存。10byte/体を維持。common/genericは504byte（$80A0..$8297）へ置き、clip補正をcache外へ出しCBRを保って戻る。generic/packedや異なるpacked経路の切替時だけ変更。frame開始のclearから描画への切替は別。

122標本の4構成比較、完成FB2,890枚すべて参照packet/全画素一致。固定した以前のボス最重負荷はGSU19.129→17.352ms、9.293%短縮、CBR無効化30→4回。107実ゲーム標本のGSU時間合計13.63%減、CPU packet生成は標本平均0.513ms増。cacheだけと分類だけも分離測定。ほぼ描かない3標本は0.851→0.957msで悪化。

18,000field（約5分）の通常入力比較：道中121/14,789回（0.818%）、平均59.61fps→65/15,146回（0.429%）、平均59.84fps。最悪60field窓44→46画像（46.08fps）。boss=0を道中、1/2をボス、3を撃破後として分離。DMA開始fieldで集計し、区分境界は除外。**生存中だけでは54/11,136→65/11,407で改善していない。** 変更後の遅延65回はCPUが遅い49回・GSUが遅い16回。CPU分類費用を次に詰める。

ボス平均43.00→48.83fps、2field提示39.77→23.07%。最悪約1秒30.05fpsは残る。新しい自然入力で最大GSU17.452ms、連続60Hzの枠13.789msなのでさらに約21%短縮が必要。前回の28.1%は変更前ROMの値。

既定ROMで自然入力18,000と6回帰試験を合わせ24,560field通過。左上＋Y1,800field、方向・単発/連射・ポーズ、camera RGB、OBJ、ボス撃破と次周を確認。別full-transferビルド360fieldで全12KiB＋OAM68byteが20行までに完了。

途中で並行作業のOBJ原画/palette差分が出た。元の実測・試験を通したROMをcache_compare_bothからbuildへ戻して公開。自機画像などの無関係な差分はcommitに含めない。独立GitHub mainと親作業ブランチの両方へpushする。

再計測の入口は `tools/compare_command_cache.py`（build内の旧profile標本が必要。固定入力はfixtures.json.gzに保存）、`profile_boss.py --allow-unreleased --output boss_profile_cacheafter`、`analyze_render_profile.py`、`archive_command_cache.py`。configは `cpuClipCommands=true, stableGsuCache=true`。比較用に `--no-cpu-clip-commands`／`--no-stable-gsu-cache` を用意した。

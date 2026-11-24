v031 回転弾キャッシュ＋供給位置変更（厳密なゲーム時計差により不採用）

v026の回転弾キャッシュに、v030の実際に適用された供給位置変更を組み合わせた。
_core_draw直後にあったservice_renderをbuild_midpoint直後へ移した。
呼び出し回数は増やしていない。OAM準備の内容はv025と同じ。
v028の初回未適用パッチとは異なり、src/cpu.sはv030の検証済み差分とbyte同一。

7200field: 期限超過0、CPU供給待ち4、表示保持4、CPU位相遅れ65。
v025は期限超過1、CPU供給待ち5、表示保持6なので、表示だけなら改善している。
しかし固定NMI入力の3601更新境界で_frame_counterに1境界の差があった。
JOY入力と元OAM、およびそれ以外の比較した元ゲーム項目は全一致。
反射弾乱数に使われる時計を無視せず、厳密なゲーム状態互換は不合格とした。
採用しない。既存v025を維持する。

GSUソース/素材はv026と同一。192種＋実際の15パケットで全12KiB画素が一致する
検証を引き継ぐ。容量は487/512byteのGSUキャッシュ、8KiB RAMのまま。
results/schedule_7200/report.json
results/fixed_nmi_identity_3601/comparison.json
build/MonoSH_NESFX_v031_CacheSchedule_UNTESTED.nes（不採用実験ROM）

実機未検証。実機操作0回。既存ROM/RBF/SD・元プロジェクトへの書込みなし。

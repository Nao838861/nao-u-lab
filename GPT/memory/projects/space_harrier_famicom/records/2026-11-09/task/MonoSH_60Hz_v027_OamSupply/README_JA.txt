v027 OAM準備/供給改善試作（厳密なゲーム時計一致が不合格のため不採用）

v026の回転画像キャッシュに、OAM準備の重複コピー削減を組み合わせた。
ネイティブ$0200を現在OAM、既存snapshotを前回OAMとして中間位置を計算し、
全ての旧位置の参照が終わってからsnapshotを更新する。
中間/現在のimmutableパケットは同じバイトを出し、1生成当たり464cyclesを削減。
build_midpoint直後にもservice_renderを呼び、旧パケットをOAM準備より先に供給する。
元ゲームRAM、元OAM、入力、色、素材、補間の式は変更していない。

7200fieldの結果
v025: 期限超過1、CPU供給待ち5、表示保持6、CPU位相遅れ65。
v027: 期限超過0、CPU供給待ち2、表示保持2、CPU位相遅れ51。
表示公開平均60.0821Hz。PPUは60.0988Hz、ゲーム更新は30.0494Hzのまま。
OAM単体試験は、中間値、現在バイト、別パケットのcanary、元timerの不変性を照合して合格。
GSUと素材はv026と同じで、192種＋実15パケットの画素比較結果を適用できる。

しかし固定NMI入力の3601更新境界で、_frame_counterが16境界で異なった。
JOY入力と元OAM、およびそれ以外の比較した元ゲーム項目は全一致。
この時計は反射弾乱数にも影響するため、元ゲーム状態の厳密な互換を満たしたとは扱わない。
性能が改善したことだけを理由に採用しない。v025を維持する。

results/combined_7200/report.json
results/fixed_nmi_identity_3601/comparison.json
build/oam_midpoint_test/result.json
build/MonoSH_NESFX_v027_OamSupply_UNTESTED.nes（不採用実験ROM）

実機操作0回。実機未検証。既存ROM/RBF/SD・元プロジェクトへの書込みなし。

v026 / v025残課題の読取り専用監査と回転弾キャッシュ試作

CPU供給待ち5回を個別に再現した。
同じv025 ROM/DLL、同じNMI入力、3400fieldの全カウンタは元計測と全field一致。
全区間の工程ブレークと、失敗付近だけの工程ブレークでも同じ結果になった。
ROMへの計測命令追加、RAM書込み、クロック変更はしていない。

CPU側5回の内訳（元の測定でのfield番号）
1268: コマンド転送中。生成完了はNMI約3412cycles前、転送開始は約1639cycles前。
2209: コマンド転送中。生成完了は約2572cycles前、転送開始は約799cycles前。
2644: 生成直後。生成完了は約457cycles前だが、preload準備/転送は未開始。
2667: コマンド転送中。既存パケットがあったがcore_tickの間にGSUが終了し、
      その約7702cycles後のNMIまでに転送を終えられなかった。
3271: 旧パケット2枚が準備済みだが、次のOAM準備中だった。
      GSUはNMI約6134cycles前に停止し、OAM準備は約5336cycles前に開始。
      NMI時もpreloaded=0で、OAM準備終了後まで次の供給機会がなかった。
計: コマンド転送中3、生成直後で転送未開始1、OAM準備が旧パケット供給を遮る1。
詳細な前後工程と時刻: results/SUPPLY_ANALYSIS.json
生記録: results/supply_audit/audit.json、results/windowed_supply_audit/audit.json

残る回転弾期限超過1回
同じpacket内に、正Uの回転画像24（60x62）を同じ座標で2回描く例がある。
画像を省略する変更は行わず、その画像のbyteキャッシュを試作した。
既存8KiB RAM内で、胴体キャッシュを回転画像24へ割当直し、ボス弾キャッシュは維持。
GSUキャッシュ487/512byte、RAM容量や転送クロックは変更していない。
元packed素材・色・回転データ・座標・寸法・ゲームソースは保持。

画素と性能
192種の合成ケースと、元の期限超過15パケットの全12KiB出力がv025と全一致。
残る1パケットの描画時間は13.12848→約10.477ms。
一方で胴体をpacked経路へ戻したため、一部のボス場面は約1.9ms重くなった。
7200field: GSU/copy期限超過1→0、CPU供給待ち5→6、表示保持6→6。
総表示の欠落は減っておらず、単独では採用しない。
固定NMI入力の3601更新境界で、入力と元OAMは全一致したが、_frame_counterに1境界の差。
反射弾乱数にも使われる時計なので、厳密なゲーム状態互換は不合格とした。
build/MonoSH_NESFX_v026_PoseCache_UNTESTED.nes は不採用実験ROM。

検証ファイル
results/pose_7200/report.json
results/fixed_pose_identity_3601/comparison.json
results/renderer_optimization/unit/results.json（192種）
results/renderer_optimization/unit_actual15/results.json（15パケット）

実機未検証。実機操作0回。既存ROM/RBF/SDと元プロジェクトは未変更。
表示は元30Hzゲーム状態からの補間。ゲーム更新60Hz化ではない。

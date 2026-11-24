Space Harrier NES / v032 GSU隣接重複除去の独立試作

結論
120秒試験で、v025の期限超過1→0、CPU供給待ち5→4、表示保持6→4に改善した。
しかし3601更新境界で、乱数用_frame_counterが1境界だけ異なるため採用しない。
既存v025を維持する。最新の絵の修正は未統合。統合条件はINTEGRATION_JA.txtに記載。
実機未検証。実機操作0回。既存ROM/RBF/SDおよび元プロジェクトへの書込みなし。

変更
隣接した18byte描画命令の全9wordが一致した場合だけ、2回目のGSU描画を省く。
atlas,x,y,width,height,du,dv,u,vを全て比較し、離れた位置の同一命令は削除しない。
先頭命令と56命令のページ跨ぎも別途試験した。描画順序と上書き結果を維持する。
CPUが作る命令数・転送量は元のままで、CPU入力・ゲーム更新・OAM処理は変更していない。
命令キャッシュに収めるため、同じ結果になるbranch/loop delay slot配置等も整理した。
GSU511/512byte、作業RAM8KiBのまま。クロックや転送時間モデルは変更していない。
変更したsrcファイルはgsu.sのみ。素材112ファイル、元参照100ファイル、生成コア51ファイル、
音声12ファイル、DLLはv025と全ファイルbyte同一。

画素検証
既存204種、実際の期限超過15パケット、重複専用26種、計245ケースの全12KiBが一致。
重複専用は2/3/56連続、全9word個別差、A/B/A、重なり順、空/単独命令を含む。
元の重い回転弾パケットは13.12848→10.33372ms。
通常弾の絵、回転、山、色、座標、寸法は変えていない。
画素照合は生GSU12KiBであり、全native PPU/音声/別alpha出力のbit比較ではない。

同じ固定NMI入力の7200field（約119.803秒）
                       v025基準     v032候補
PPU                    60.0988Hz    60.0988Hz
ゲーム更新             30.0494Hz    30.0494Hz
表示公開平均           60.0487Hz    60.0654Hz
表示保持field          6            4
GSU/copy期限超過       1            0
CPU供給待ち            5            4
パケットdrop           6            4
CPU位相遅れ            65           65

約30Hzの元ゲーム状態から約60Hzの中間/現在表示を作る方式を維持する。
ゲーム更新60Hz化や、全field安定60fpsを実証したという意味ではない。
元のSELECT無敵操作を使った固定入力であり、RAMのdebug書換えはしていない。
全入力/全ステージの保証ではない。通常のPC実時間速度や実機性能の計測ではない。

ゲーム状態照合と根本原因
3601回のpre-core_tickで元151項目850byte、JOY入力、元OAM256byteを照合した。
JOYと元OAMは全一致、元ゲームの差は更新1343の_frame_counter 128→129の1byteのみ。
この時計は反射弾乱数にも使われるため、比較から除外して合格とは扱わない。

読み取り専用の追加計測で原因を確認した。
v025では、世代1344の描画準備はqueue満杯でsuppressed=1、8581 CPU cyclesで終わる。
v032ではGSUが早く終わるため同世代を生成でき、suppressed=0、40267 cyclesかかった。
その次のゲーム更新1343の開始は、80259956→80290704 CPU clockへ30748cyclesずれた。
その結果、参照した実NMI時計が1進んだ。画面高速化だけでもゲーム時計が変わる結合がある。
別区間の計測を追加したことによる差ではなく、両版とも元の全観測カウンタを再現している。
描画を省く世代が替わるとCPU仕事量も替わる点を踏まえたスケジューラ対策が未解決。
ゲーム時計を無視する、固定試験の世代番号を特例扱いする等の変更は行っていない。

CPU待ちの継続資料
v025の5回は、転送中3、生成直後で転送未開始1、次OAM準備が旧パケット供給を遮る1。
../MonoSH_60Hz_v026_SupplyAudit/results/SUPPLY_ANALYSIS.json に全前後工程を保持している。
前段のOAMコピー削減試作v027は表示保持2まで減ったが、時計差16境界で未採用。
供給位置変更だけのv030はゲーム状態全一致だったが、表示保持6のままで性能改善なし。
本版は素材キャッシュの割当交換をせず、GSUコードだけで別の改善を試した結果である。

成果物
results/SUMMARY.json                  最終集計・ハッシュ・採否・時計差の原因
results/gsu_only.patch                v025に対するGSUだけの差分
results/dedup_7200/report.json         120秒計測
results/fixed_nmi_identity_3601/comparison.json 厳密なゲーム/入力/OAM照合
results/renderer_optimization/unit/results.json 204種
results/renderer_optimization/unit_actual15/results.json 実15パケット
results/renderer_optimization/unit_dedup/results.json 重複専用26種
results/backpressure_baseline/trace.json 元の描画抑制と時計
results/backpressure_dedup/trace.json 改善後の描画抑制と時計
INTEGRATION_JA.txt                    最新絵・8x1属性・GSU容量を含む統合条件
build/MonoSH_NESFX_v032_GsuDedup_UNTESTED.nes 不採用の独立実験ROM

再実行
python -X utf8 build.py
python -X utf8 tools/test_bullet_cache.py
python -X utf8 tools/test_deadline_packets.py
python -X utf8 tools/test_dedup_packets.py
python -X utf8 tools/measure_60hz.py --root . --rom MonoSH_NESFX_v032_GsuDedup_UNTESTED.nes --out results/NEW_UNIQUE_NAME --fields 7200
元ゲーム照合: tools/fixed_input_identity_3601.py（凍結済み基準traceを再利用）
抑制/時計の集中計測: tools/probe_backpressure.py baseline または dedup
計測/照合は既存結果を保護するため、再実行時に出力名を新しくする。
512byte制限を緩めない。build/size_only.*は容量を調べた診断用で、ROMには含めていない。

Space Harrier NES / v024 期限超過の工程別監査

15回すべて、GSU描画後のフレームバッファ転送待ちだった。
クリア待ち0、GSUラスタ実行中0、地面DSP待ち0、転送待ち15。
これは失敗した判定時点の工程であり、転送自体に異常があるという意味ではない。
直前のラスタ処理12.88152～13.87828msの後に固定12KiB転送が始まり、
公開期限でなお0.14136～1.13646msの転送が残っていた。
copy_pending→copy_doneは5278 CPU cycles、約2.949ms。転送時間モデルは変更していない。
14回がボス戦で、転送開始を遅らせる直前の矩形量はボス弾（atlas$9000）が大きかった。
残り1回は道中の回転弾の密集場面。

測定の信頼性
元v021 ROM/DLLをそのまま使い、NMI、実際の@miss分岐、コマンド転送開始/終了、
クリア要求/準備完了でCPUブレーク。既存mapper traceのGSU GO/STOP、copy完了と照合。
ROMへの計測命令追加、RAM書込み、クロック変更はなし。
7200fieldの全カウンタが、前回の同じNMI位置・入力スケジュールの記録と全field一致。
audit.jsonのfieldは入力を設定する直前のNMI番号なので、前回の事後観測より1小さい。

クリア短縮候補（不採用）
カメラ設定より先に独立クリアを開始し、無効な論理末尾0x3800～0x3fffの2KiBを省いた。
全12KiBの実フレームバッファ領域が同じように消されることを全アドレスで照合した。
元ゲーム・色・描画GSU・補間のソースは変更していない。
120秒比較: CPU位相遅れ65→50、期限超過15→15、表示保持20→20。
固定NMI入力の1201更新境界では入力/元OAMは全一致したが、_frame_counterが15境界で異なる。
この値は反射弾乱数にも使われるため、厳密な挙動互換を満たしたとは扱わない。
従来の更新境界直前入力方式でも5境界の時計差・2境界のラッチ入力差があった。
この候補は表示欠落を減らせず、採用しない。既存v021を維持する。

成果物
results/SUMMARY.json                    全集計
results/baseline_audit/miss_details.json 15回の状態・時間・矩形一覧
results/baseline_audit/audit.json        NMIと28,735件の工程イベント
results/baseline_audit/mapper_trace.csv  GS U/地面/転送の生時刻
results/fixed_nmi_identity/comparison.json 固定NMI入力・元ゲーム状態比較
results/clear_coverage.json             省略領域が全て無効アドレスである全数確認
results/clear_candidate.patch           不採用候補のソース差分
build/MonoSH_NESFX_v024_ClearOverlap_UNTESTED.nes 不採用実験ROM

再実行
python -X utf8 tools/audit_deadlines.py --out NEW_UNIQUE_NAME
基準のROMと対応ラベル/リストはこのフォルダー内に保持。出力は新しい名前を使う。
クリア候補: python -X utf8 build.py
監査結果の再集計: python -X utf8 tools/analyze_deadlines.py

実機操作なし。既存ROM/RBF/SDの上書きなし。元プロジェクトへの書込みなし。
専用Mesen機能モデル内の測定であり、実機60fpsや長時間安定性の証拠ではない。
ゲーム更新は約30.049Hzのまま。60Hzゲーム更新化は行っていない。

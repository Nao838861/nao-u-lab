Space Harrier NES / 60Hz調査 v023（2026-11-09 UTC）

結論
60fps化は未達。既存v021を維持すること。
この独立フォルダーのROMは計測用の不採用実験版で、実機への投入用ではない。
元ROM・RBF・SD・元プロジェクトは書き換えていない。今回の実機操作は0回。

版の整理
v016: 約30.049Hzの元ゲーム更新＋約60.099Hzの表示補間。40秒固定入力は欠落0だが、
      既存120秒試験には欠落6とCPU位相遅れ64がある。真の60Hzゲーム更新ではない。
v017～v019: 視覚的な遠近・地面・奥行き列の変更。実機約23秒の成功は親スレッドから
      引き継いだv019＋修正RBFの結果。長期安定性、60fpsの実証ではない。
v020～v021: 山・森、列色の統一、SFC敵弾回転、山の暗色陰影。最新の表示基準はv021。
      この専用Mesenのscenery ABIと同じ機能を修正RBFが備えるとは確認できていない。
v022: 高精度投影・補間の既存試作。CPU負荷・表示欠落・入力タイミングの差により不採用。

今回の試作
v021からコピーし、renderer_yieldのpreloaded判定をレジスタ退避前に追加した。
次パケットが既に準備済みなら、X/Yの退避・復元とservice_render呼出しを省く。
最終候補はsrc/cpu.sのこの変更だけ。補間の64スロット処理は全て元に戻した。
元ゲーム参照100ファイル、生成ゲームコア51ファイル、素材112ファイル、音声12ファイルは
v021と全ファイルSHA256一致。補間ソース、GSUバイナリ、専用DLLも同一。
途中の41スロット限定試作は汎用補間のスロット契約を狭めるため取り下げた。

比較計測
毎NMIの同じ命令位置に停止し、同じ固定入力を与えて7200fieldを計測。
通常ROMの元SELECT無敵操作を使用。RAMの書き換え・速度設定変更・画像補間はない。
起動後の観測位置が1fieldずれる可能性のある旧PPU-step測定は参考扱いとした。
採用する根拠はresults/*_nmi_7200のみ。

                         v021基準      v023最終候補
エミュレーション時間      119.803秒     119.803秒
PPU周波数                 60.0988Hz     60.0988Hz
ゲーム更新                30.0494Hz     30.0494Hz
表示公開平均              59.9319Hz     59.9319Hz
中間/現在公開             各29.9659Hz   各29.9659Hz
表示保持field（立上り除外）20           20
CPU位相遅れカウンタ       65           54
パケットdropカウンタ      20           20
供給待ちカウンタ          5            5
GSU/copy期限超過カウンタ  15           15

CPU位相遅れカウンタは11減ったが、表示保持は減らなかった。
late_fieldsは表示欠落数ではなく、queue_dropsも実際の画面保持数と同じ定義ではない。
render_stateやGSUの完了状態をNMIが確認して増えるdeadline_missesにはclear/copy段階も
含まれるため、15回を全てGSUラスタ処理だけの遅れと断定してはいけない。
ボス状態0/1/2を含むが、全ステージ完走の試験ではない。
これは機能Mesenモデル内の時間で、実機60fpsや通常PC再生速度の証拠ではない。

元ゲーム挙動の照合
既存のpre-core_tick比較器で1201更新境界、151項目850byteと元OAM256byteを照合。
元OAMは全1201境界で一致。ゲーム状態の差は_frame_counterの1境界のみ。
ただし同じ境界で入力のラッチ値とNMI位相も1回異なるため、厳密な互換性は未合格。
コードが同じであることと、描画負荷変更後の入力タイミングが同じであることは別である。
results/identity_final_1201の内部名v019/v020は、この比較に限りv021基準/v023候補を指す。

60Hzゲーム更新との区別
src/cpu.sのservice_logicは元通り2fieldで_core_tickを1回呼び、他方で画面を生成する。
NMIの_frame_counterは60Hzで進むが、それだけでは敵・弾・衝突の更新は60Hzにならない。
単純に_core_tickを倍呼出しすると、移動・出現・タイマー等の速度が変わる。
元のゲーム速度・判定を維持するため、この試作ではゲーム更新60Hz化は実施していない。
岩の16段階寸法や2px単位の投影が残るため、表示公開が60Hzでも動きの段階感は残る。

次の優先課題
1. NMIごとのrender_state/$4830/完了ステータスとclear/copy開始・終了を記録し、
   今回残った15回の期限超過をclear、転送、ラスタへ分解する。
2. 重いボス場面のクリア範囲・重なり描画・転送量をSFC側と比較する。
   素材や色を変えず、測定上の処理量を減らせる箇所を先に直す。
3. CPU準備に余裕が出てから、v022の高精度表示計算を再設計する。
4. ゲーム更新60Hz化は別候補で速度・タイマー・衝突・入力の比較基準を定義して進める。
5. 実機は有限終了と安全なメニュー復帰、起動前の状態・許可を確認する。
   今回の候補は実機未検証であり、SDや既存RBFへのコピーはしていない。

成果物
results/SUMMARY.json                 最終集計とソース同一性
results/yield_fast.patch             最終候補の変更差分
results/baseline_nmi_7200/report.json 基準の120秒計測
results/candidate_nmi_7200/report.json 候補の120秒計測
results/identity_final_1201/comparison.json 入力・ゲーム状態・OAM比較
build/MonoSH_NESFX_v023_YieldFast_UNTESTED.nes 最終実験ROM（採用不可）
build/MonoSH_NESFX_v023_CpuBudget_UNTESTED.nes 途中の41スロット実験（取り下げ）

再実行
python -X utf8 build.py
python -X utf8 tools/measure_60hz.py --root . --rom MonoSH_NESFX_v023_YieldFast_UNTESTED.nes --out results/NEW_UNIQUE_NAME --fields 7200
既存計測を保護するため、出力先は必ず新しい名前にする。
tools/check_identity.py、tools/summarize_work.pyは今回の基準パスを明記している。
最終ROM SHA256 4817dba7bcbacf1cad727132ab8180d5246adc13eed89c063d4494722e9de725
基準ROM SHA256 d41753d838470c9a31214a5d9305015df95479bde131a1ccf46dc1cc4ca43e76
DLL SHA256 7492983ad92de13fbf590d3f9baca2f575ad113b17c4e1ac92461b0595dd576b

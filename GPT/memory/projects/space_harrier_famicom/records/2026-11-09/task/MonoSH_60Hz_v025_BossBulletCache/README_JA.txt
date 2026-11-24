Space Harrier NES / v025 ボス弾キャッシュ開発候補

結果
既存v021を変更せず、独立した開発候補を作成した。
7200field（約119.803秒）の同一NMI入力試験で、期限超過15→1、表示保持20→6。
3601回の更新境界で、元ゲーム151項目850byte・入力・元OAM256byteが全て一致。
乱数用の_frame_counterも含めて差0。
204種の合成描画と、期限超過した実際の15パケットの全12KiB出力が基準版と一致。
ただし全fieldの安定60fpsは未達。実機未検証。既存ROM/RBF/SDへのコピーはしていない。

15回の期限超過の内訳
v024の読取り専用監査で、クリア0、GSUラスタ実行中0、地面DSP待ち0、画面転送待ち15。
NMIの実際の期限超過分岐で、クリア完了・GSU停止・DSP準備完了・転送未完了を確認。
直前のラスタ12.88152～13.87828msの後に約2.949msの固定12KiB転送が始まり、
期限時点で0.14136～1.13646msが残っていた。転送時間モデルは変更していない。
監査の7200field全カウンタは前回測定と全field一致し、計測追加による位相差はなかった。
14回はボス戦で、ボス弾の描画矩形量が支配的。1回は道中の回転弾の密集場面。
全記録: ../MonoSH_60Hz_v024_DeadlineAudit/results/baseline_audit/

変更内容
元のpacked素材と色はそのまま。既存の8KiB GSU作業RAM内のbyte展開キャッシュを、
ボス胴体＋頭部から、ボス胴体＋ボス弾へ割り当て直した。
頭部は既存のpacked描画経路を使い、同じ色・画素を出す。
実測で頻出したボス弾幅64/52/48/50/58用に、正確な透明端スパンを事前計算する。
既存の通常弾4画像＋反転による16方向回転、山、列色は保持する。
GSU命令キャッシュ487/512byte、作業RAM8KiB。容量・転送クロック・モデルは増やしていない。
CPU、補間、描画コマンド生成、元ゲーム、入力コード、音声、専用DLLはv021と同一。

同じ固定入力での7200field比較
                          v021基準       v025候補
PPU                       60.0988Hz      60.0988Hz
ゲーム更新                30.0494Hz      30.0494Hz
表示公開平均              59.9319Hz      60.0487Hz
実表示保持field           20            6
GSU/copy期限超過          15            1
CPU供給待ち               5             5
パケットdrop              20            6
CPU位相遅れ               65            65

公開平均とPPU周波数は別の指標。ゲーム更新を60Hz化したという意味ではない。
元の約30Hzゲーム状態から約60Hzの中間/現在表示を作る構造を維持している。
stage/boss状態0/1/2を含むが、全ステージ完走・全入力の保証ではない。
元SELECT操作で無敵を有効にして測定し、RAM書き換えは行っていない。

画素と元ゲームの検証
・204種: 元の全ボス寸法、通常/反転/回転弾、縮小拡大、負U、画面端クリップ、重なり等。
・実際に期限超過した15パケットをそのまま再実行し、全12KiBの出力が全て一致。
  ボス14場面の処理短縮を確認。道中の回転弾パケットは13.12848msのままで、残課題と整合。
・NMIの同じframe_countで同じ入力を設定して、3601回のpre-core_tickを照合。
  元151項目850byte、元OAM256byte、JOY held/pressed/released、_frame_counterは全て差0。
  旧方式のように更新境界の直前にコントローラ値を変える試験とは区別した。
・元参照100ファイル、生成コア51ファイル、音声12ファイル、DLLはSHA256全一致。
  src/cpu.s、interpolation.s、render_adapter.s、元素材stage_atlas.bin、山scenery_source.binも一致。
・比較した画面はGSU生12KiB。全時間のnative PPU出力や音声のbit同一性は今回の試験範囲外。

残課題
・回転弾密集時に期限超過1回、CPU供給待ち5回、計6fieldの表示保持が残る。
・岩など元NESの段階寸法・座標丸めは残っており、表示公開の改善だけで全て滑らかにはならない。
・頭部と弾のキャッシュ割当を変えたため、今回以外の入力・場面の負荷配分は追加検証が必要。
・実機では山追加前v019＋修正RBFの約23秒動作という引継ぎ結果のみ。
  v025の実機安定性、scenery ABI対応、実機60fpsは未確認。実機操作は0回。
・v024のクリア短縮候補は期限超過を減らさず、時計差も出たため不採用。この版には含めない。

成果物
build/MonoSH_NESFX_v025_BossBulletCache_UNTESTED.nes 開発候補（実機未検証）
runtime/MesenCore.dll                  v021と同じ専用コア
results/SUMMARY.json                   最終集計・同一性・各実測コスト
results/candidate_7200/report.json      120秒候補計測
results/fixed_nmi_identity_3601/comparison.json 3601更新境界の厳密照合
results/renderer_optimization/unit/results.json 204種の全画素比較
results/renderer_optimization/unit_actual15/results.json 実際の15パケット比較
results/baseline_deadline_packets.json  元の15パケットの固定fixture
results/gsu.patch                      GSU変更差分
results/generate_boss_runtime_atlas.patch キャッシュ生成変更差分
期限超過の工程別監査: ../MonoSH_60Hz_v024_DeadlineAudit/README_JA.txt

再実行
python -X utf8 build.py
python -X utf8 tools/test_bullet_cache.py
python -X utf8 tools/test_deadline_packets.py
python -X utf8 tools/measure_60hz.py --root . --rom MonoSH_NESFX_v025_BossBulletCache_UNTESTED.nes --out results/NEW_UNIQUE_NAME --fields 7200
固定NMIゲーム照合: tools/fixed_input_identity_3601.py（基準プロジェクトの読取りパスを明記）
測定とゲーム照合の出力先は、再実行時に必ず新しい名前にする。
画素試験の基準GSU/atlasと15パケットfixtureはこのフォルダー内に保持している。

候補ROM SHA256 7e63beb38b1f26075ce86f907733aa23f2e7766023a22169f4efe12ce60b9f45
基準ROM SHA256 d41753d838470c9a31214a5d9305015df95479bde131a1ccf46dc1cc4ca43e76
専用DLL SHA256 7492983ad92de13fbf590d3f9baca2f575ad113b17c4e1ac92461b0595dd576b

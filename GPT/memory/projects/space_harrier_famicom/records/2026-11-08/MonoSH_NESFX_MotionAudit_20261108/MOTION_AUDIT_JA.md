# v020 敵・岩の動きの独立監査

## 結論

調査した連続区間では、中間フレームの算術ミス、current/midpointの逆表示、世代の取り違え、実ラスタと命令の不一致は見つかりませんでした。ただし「60Hzで中間画を出せている」ことと「連続的に滑らかに動く」ことは別です。v020は元NESが既に2px単位・16段階サイズに丸めた矩形を補間しているため、元データの停止、急な拡大、上下の往復が残ります。

## 実証

- 元v020 ROM/DLLを変更せず、別のMesenホストで900描画世代を実行。最初の300世代は左右上下入力なし。SELECTで元ゲームの無敵機能を利用。ゲームRAMの書換えなし。
- 6,630 raw矩形から独立計算したcurrent命令は全一致。
- 882世代の中間命令を独立計算と比較し、不一致0。残りは1世代の生成抑制と17世代の寿命フェンスがあり、単純oracleの検証済み範囲には含めない。
- 250連続世代＝500実動画frameで、表示世代から固定的に対応させた独立ラスタと実AVIの1,414,727可視FX画素が全一致。画像の最良一致検索は不使用。native OAMで覆われた画素は除外。この照合は全900世代の画素検証を意味しない。
- 公開済みv020最終動画の1,800field記録には同じ表示の継続が3回。0始まりfield1244、1263、1272。field1309には表示世代657→659のスキップが1回。これは長時間ずっと続く交互のカクつきとは別の負荷問題。

## 原因を示す数値

1. 元の寸法段階を補間しても停止区間は消えない。
   元の幅が44,44,44,52,52,56,56なら、中間画を含めても44,44,44,44,48,52,52,52,54,56,56,56となる。60fps表示でも毎frame同じ速度で拡大しない。

2. 固定された浮遊岩にも投影の丸め由来の上下運動がある。
   slot1/FlyStone、wx=10、wy=36、カメラ固定の実測。Z46→36で矩形の底辺は118,118,116,116,116,116,118,118,116,116,114。中間補間はこの往復を忠実に半分ずつ再現する。
   この区間の実映像は flystone_actual_sequence.png。MID/CURは実AVIから切り出した画で、生成画像ではない。

3. source texelのnearest-neighbor拡大縮小には形の変化が残る。
   source_extent*256/dimensionのQ8.8 samplingは独立計算と一致。寸法が変わると選ばれるtexelも変わり、特に小さい岩の輪郭が跳ねて見える。現時点で偶奇frameのsamplerバグとは認められない。

## 修正方針

元ゲームの更新、当たり判定、敵配置は30Hzのまま維持する。表示専用の中心・底辺・scaleを、丸め済みNES矩形ではなくワールド座標・Z・投影元の値からQ8.8以上で作る。前後の表示状態を補間してから一度だけ画素へ丸める。サイズは16段階のsprite dimension選択ではなく、連続scaleまたは細かいZ別の表示専用寸法へ置き換える。共通の中心/底辺anchorから左上を導く。

寿命変更・slot再利用・死亡・resetの補間遮断は維持する。画像のアニメーション切替と個体の寿命は分離し、同一個体の姿勢変更だけで座標補間まで止める設計は必要に応じて改める。表示待ちとqueue dropは上記と別に性能測定する。

この監査では修正ROMを作らず、v021担当へ原因と設計案を共有した。元SD、RBF、ROM/DLL、v021作業ファイルには変更していない。実機/FPGA、全ステージ、v021完成版は未検証。

## 根拠と再実行

- capture_motion.py: 元ROMを読み取る独立診断ホスト。
- analyze_motion.py: 矩形・sampling・実動画の独立照合。
- audit_trace.json: 900世代のraw/current/midpoint/camera/表示世代。
- audit_native.avi: この監査の実PPU映像。
- motion_audit_report.json: 全集計と固定岩の数値。
- physical_pixel_results.json: 500frame別の画素照合結果。
- v020_existing_f90_113.png: 公開済み最終v020動画の連続24frame。

関連コード: v020 src/interpolation.s (丸め済みx/y/w/hの平均)、src/render_adapter.s (2倍座標・寸法変換)、tools/generate_nes_render_tables.py (元NES寸法表→GSU sampling)、reference/nes_original/src/game.c のbgobj_z2size/bgobj_z2sc、generated/nes_core/src/draw_bgobj_all.s。

対象ROM SHA256: 064805f8cab02ee127731cea55ba4878f59adca4e07492bac22d304bd7854224
対象DLL SHA256: 65f2c97f544e804f1ff64e66ab8a04e2c4fea3e1cbe030d37359008c4150af80

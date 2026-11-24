MonoSH NESFX v021 / 表示修正3点の独立版

変更
1. 奥行き方向へ伸びる低コントラスト側の列は、中間緑 NES $19 の1色に統一。明緑$29は使いません。隣の列は従来の明緑/濃緑の交互模様です。
2. SFC enemy_render.s の通常敵弾4画像とX/Y反転を使った16段階回転。4表示fieldごとに次の角度、64fieldで一周です。自弾・反射弾・ボス弾の元の表示種類と当たり判定は変更していません。死亡中のワールド停止時には角度も停止します。
3. 山の元SFCタイルの陰影を既存の濃緑$09、明部を灰$10で描画。空/地面だけで選ぶ固定パレット32Bはv020と同じです。敵の透明部分から見える空や山も保持します。

使うファイル
ROM: build/MonoSH_NESFX_v021_SfcVisualFix_UNTESTED.nes
専用コア: runtime/MesenCore.dll
無敵実プレイ動画: results/deliverable_video/MonoSH_NESFX_v021_invincible_visual_fix.mp4
通常ROMを起動して元のSELECT入力で無敵ONにした実PPU録画です。RAM書換え、ゲーム画面差し替え、架空の補間動画は使っていません。音あり29.95秒。通常起動では無敵OFFです。

検証
地面409,600画素、GSU汎用ラスタとの168ケース全12KiB比較、背景/前景色368,640ケース、全65カメラ位置の合成回帰は合格。
1201 pre-core_tick境界で元ゲーム状態150項目849BとOAM256Bは一致。ただし60Hzフレームカウンタが10境界で異なり、入力エッジフラグは6境界で異なりました。描画コストがNMIをまたぐ時刻を変えるため、全タイミング同一試験は不合格です。元NESゲーム処理ソースは無変更です。
最終録画: {'logic_tick': 905, 'draw_count': 905, 'present_count': 1803, 'late_fields': 59, 'queue_drops': 4, 'queue_starvations': 5}
late_fieldsは新しい完成画面の欠落数ではありません。安定60fps・全入力完全一致を保証しません。

制約
この版は表示3点の修正です。敵/岩の元NES段階サイズと座標の丸めは残っており、別途調査中の動きのガタつきを直した版ではありません。
既存v020、SDカード、RBFは変更していません。v020の山/森レジスタを含め専用Mesen拡張が必要です。既存RBFへのROMコピーだけで動くとは主張しません。
FPGA RTL、実機、合成/fit/timing、全ボス/全ステージは未検証です。ボス弾のbyte展開キャッシュ1KiBを回転画像に再利用し、ボス弾は既存packed画像で描きます。ボス弾の負荷増加は未測定です。
SFC全カラー原画の完全再現ではなく、32px/共通3色への量子化です。

再ビルド（ROGXbox既存SDK/host objectsが必要）
python -X utf8 build.py
python -X utf8 tools/build_palette_core.py
python -X utf8 tools/test_scenery_composite.py
python -X utf8 tools/test_rotating_gsu_v021.py

ROM SHA256 d41753d838470c9a31214a5d9305015df95479bde131a1ccf46dc1cc4ca43e76
DLL SHA256 7492983ad92de13fbf590d3f9baca2f575ad113b17c4e1ac92461b0595dd576b

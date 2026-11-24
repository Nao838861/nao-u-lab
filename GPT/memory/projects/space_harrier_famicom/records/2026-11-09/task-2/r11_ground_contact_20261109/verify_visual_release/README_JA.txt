Space Harrier r11: 地面接地・拡大率・木輪郭・Stage1タイトル修正版

状態: 専用Mesen検証済み。今回の統合版は実機未検証です。
ROMとRBFの実機転送、起動、リセット、機器読取りは行っていません。

1. 変更内容
・木と草の接地Yを、旧NESの半解像度テーブルの単純2倍から、物理ピクセルで最後に丸める描画専用表へ変更。
・接地点と高さを一体で補正。全33高度×56奥行きについて、奥行き・カメラ方向の接地点／上端の逆行をなくしました。既存の中間field補間もそのまま使用します。
・近端と遠端の高さを維持。高さの変更は最大3px、接地点の変更も最大3pxです。上下カメラ移動で上端は最大2px／logic更新となり、中間fieldを含めて1pxずつ進みます。
・木の奇数幅縮小時だけサンプル位置を中央へ合わせ、細い幹を飛ばして根元が1px上がる問題を修正。
・CPUの余裕を保つため、木・草とEM0の中間field縮小率取得を、同じ既存の数値を直接読む方法へ高速化。
・別途検証済みの閉EM1／敵弾／Bossの滑らかな拡大率、元画像に基づく木の暗い輪郭、STAGE 1 / MOOT表示を統合。

SFCで行われていた「高さだけを丸めず、接地と上端を合わせて補正する」方法が出発点です。NES固有の33高度・56Zに合わせた2D制約も追加しており、SFCのテーブルをそのまま複写したものではありません。
参照:
https://github.com/[REDACTED_HOST_IDENTITY]/MonoSH_FX2/blob/09d94a439b03bea9dfe54eae3d6eb3364a67ca8e/tools/smooth_depth.py#L52-L68
https://github.com/[REDACTED_HOST_IDENTITY]/MonoSH_FX2/blob/909c0cf616d3ea459ea5a522f7624f76cebb41df/game/v001/upstream/monosh_stage_fast.asm#L556-L604

2. 維持したもの
・ゲーム用のZ・投影・当たり判定・出現表・入力・時計・乱数の仕様。
・CPU/GSUの並列パイプライン、queue、起動時のwarmup、表示遅延の設定。
・既存の地面・山・森のCHR、視差カメラ、パレット、音声、GSUコード、RBF。
・木の元の透明形状と28×64解像度。輪郭は元画像の影／葉を復元しており、人工的な均一線ではありません。

3. 確認結果
・最終統合ROMでStage3000fields、Boss3000fieldsとも3000回提示。供給不足・締切超過・drop・lateすべて0。
・射撃＋上下左右操作3000fieldsも3000回提示。供給不足・締切超過・dropは0。CPU field受付遅れカウンタだけ1回記録され、表示欠落にはなっていません。全高度0〜32を通過。
・固定NMI入力でStage1501世代、Boss301世代を基準版と比較。151項目・全850B、native OAM256B、入力3Bが全て一致。
・通常進行1000世代の地面・視差カメラ・world座標も一致。EM0/FlyStone/Bom0のraw geometryも一致。
・全高度と奥行き中間fieldを含む10989サンプルで、見える根元の隙間／逆行は0。矩形上端の逆行も0。
・草の細かい葉先には、通常のnearest縮小による最大1pxの輪郭変化が残ります。物体全体の接地の波打ちとは別です。
・配布ソースの再アセンブルは最終ROMの該当byteと一致。独立生成器からの2D表再生成もSHA256一致。

専用Mesenの条件: GSU50MHz、CPU1,789,773Hz、RAM AllZeros、mapper/alignmentのランダム化なし。検証は確認した入力・区間のものです。実機fpsや全ゲーム全入力を保証するものではありません。

4. 使用資源
・接地補正: データ7458B、helper265B、既存ハンドラ3本の置換。既存PRG bank2/76/82の空きだけを使用し、新規PRGバンク0。
・タイトル: 以前空いていたPRG bank83を1バンク使用。210Bのテクスチャはintro中の未使用コマンド末尾を使用。新規GSU RAMは不要。
・追加固定RAM／追加GSU RAM／追加FPGA資源0。ROMファイルの容量増加0。
・GSUコード509/512Bで不変。atlas7168Bで不変。木輪郭復元によりatlas内部余白は52Bから29Bへ減少。

5. 同梱物と再現
roms/: 最終Mesen ROM、実機用ROM、変更なしの対応RBF。
inputs/: 基準となった凍結CPU最適化版ROM。
source/: 今回の接地表・asm・生成器、および拡大率／木輪郭／タイトルのソースと固定データ。
tests/: 最終バイナリを対象とした計測と一致検査。
Before_Left_After_Right_EMULATOR.mp4: 左が基準版、右が今回の統合版。約33.24秒。専用Mesenの記録で、実機映像ではありません。音声は右側のものです。
ground_contact_trajectory.png: 同一高度での草上端と接地点の修正前後。

ZIP単独で同一ROMを再現する方法:
python rebuild.py MESEN new_MESEN.nes
python rebuild.py HARDWARE new_HARDWARE.nes
既存出力の上書きは拒否し、入力・出力SHA256を検査します。標準Pythonだけで実行できます。

表を独立に再生成する場合:
python source/generate_grounded_joint_2d_smooth.py --input source/original_projection_model.json --output reproduced_model.json
NumPy、SciPy1.17.1、同梱HiGHS1.12.0が必要です。生成結果はsource/ground_tables.jsonと完全一致します。実行時にゲーム内で最適化計算を行うわけではなく、ROMには固定表だけが入ります。

各機能の元プロジェクト用生成スクリプトも参考として同梱しています。本ZIP単独での確実なROM再現には、上記rebuild.pyを使用してください。

6. 確定SHA256
Mesen: 1591131317b8b621741c0c828bdc9025ae62eb5b34b01483503a5eed909ce8e5
Hardware: c4b531dc532c9dc32ed5df51b30a4f4bb5a66e128251e0d82164385443f83e20
RBF: 08775918b001b9d2f9e27032d24d6b2e8f6dbbe052c98134c4d797f644c920e5

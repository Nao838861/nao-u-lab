MonoSH NESFX v018 / 地面の奥行き3色・SFC基準の投影
2026-11-08

作業フォルダ: MonoSH_NESFX_v018_ArcadeGround
通常ROM: build/MonoSH_NESFX_v018_ArcadeGround_UNTESTED.nes
動画: results/invincible_demo_verified/MonoSH_NESFX_v018_invincible_ground.mp4

変更
・横の明るい列を維持し、奥行きの行ごとに「明緑$29＋暗緑$09」と「明緑$29＋中間緑$19」を交互にしました。
・v017の1テクセル暗線を廃止しました。紫空$14、物体共通色、元NES自機・弾・影の色を維持しています。
・実PPUの表示位置+31を考慮し、SFCの投影原点104+2*ground_offsetに合わせました。
・実PPU y204で1列幅51pxになるよう、全33高度でカメラ高度とピッチを再計算しました。
・横移動はSFCの128位相を使用。元NESの30Hz更新で2位相分、中間表示で1位相分を進め、端でも流れ続けます。

動画
約89.85秒、5,400実PPUフレーム。音声付き。動画フレームの補間・水増しはしていません。
元NESソースにあるSELECT操作で無敵にし、画面下へ「無敵デモ」と明示しています。ROM/RAMを書き換える無敵化ではありません。
通常起動で無敵オフ、録画中の全1,350サンプルで無敵オンかつ死亡状態なしを確認。ボス戦まで進行しました。
通常ROMと専用Mesen DLLは動画と同じです。DLLはv017とバイト一致します。

検証
・v017との1,201回のpre-core_tick境界比較で、元ゲーム151項目850バイト、元OAM256バイト、入力、frame_count/logic_tick/draw_countが一致。
・33高度×192行=6,336行でD10固定幅計算と汎用計算が完全一致。
・SFC列投影式との画面内境界誤差は最大0.361px。y204の列幅は51pxに対して誤差0.2px未満。
・640×640=409,600テクスチャ画素を検証。全行が指定した2色ペアで、全体として3色。
・元NESソース、自機CHR2バンク、専用コアDLLの保護を確認。
・results/core_identity_final/comparison.json と results/ground_validation.json が確定検証結果です。

残る差・未検証
・前進する奥行き帯は等間隔の3D地面テクセルで、SFCの非線形な奥行き帯アニメーションテーブルと完全には一致しません。
・有限テクスチャと遠方クリップがあるため、地平線直下の見え方には差があります。
・物体の投影・敵・衝突・ゲーム進行は元NESのまま。SFC地面との全オブジェクトの接地一致は未検証です。
・これは専用Mesen上の表示試作です。FPGA/NES実機、SD、RBF、実機転送速度は未検証。60fps性能保証ではありません。
・既存v017、既存ROM、SD、RBFを上書きしていません。公開配布はしていません。

参照
NES: https://github.com/[REDACTED_HOST_IDENTITY]/MonoSH commit c0e91a8dc5426afad3b4cd56f16fee2c355321fa
SFC: ローカルMonoSH_FX2 tools/build_ground.py、tools/verify_ground_projection.py、game/v001/frame.s
ユーザー添付のアーケード画像。


MMC5Racing 3D v005 / 最適化・FPGA容量削減 r005（2026-10-19）

PC: play_pc_25mhz.cmd を実行。専用Mesen・25MHz。コアDLLと時間モデルはr004と同じ。
このワークスペースの .tmp/nesfx-audio-repo と既存 runtime_sky を参照する。
実行フォルダーは専用の build/r005/runtime。通常版Mesenでは動かない。

N8 Pro: sdcard/GSU-RACING-V005-R005 をフォルダーごとSDへコピー。
電源を入れ直して GSU_MMC5Racing3D_v005_N8Pro_r005.nes を起動。同梱のgsu.rbfを使用。
黒いままなら一度本体RESET。メニューへは電源を入れ直す。実機動作は未確認。

FPGA: 6,118→5,957 LE（空き154→315）。RAM 30→28ブロック。
RAMのデータ量は同じ。乗算器は15個。内部setup余裕3.602ns、hold余裕0.107ns。
旧ROM・新ROMの両方で、検査した入力に対する旧回路との出力値・応答クロック一致を確認。
新しいRBFはr004 ROMでも同じ応答になる設計。旧ROM＋新RBFで比較できる。
外部バスタイミングと実機の保証は未完了。LEの空きはまだ全体の約5%。

GSU: 1,600姿勢の画像が一致し、命令モデル合計4.47%短縮。RTL代表8場面の最大23.76→22.60ms。
GSU単体の値で、画面転送やCPU処理を含まない。Mesen全体は全周768姿勢すべて30.05fps以上。
木10本・家3軒、幹の境界64。景物・地面・色・音・物理はr004のまま。

操作: A加速、Bブレーキ/ドリフト、左右操舵、SELECT視点、上ポリゴン表示切替、下GRIP/DRIFT、START走行リセット。
optimization.mdに全18案と採否。verification/に結果、experiments.zipに試行ソースとログ、
testbenches.zipに比較テスト、source.zipにソースとライセンス。旧版・記録動画は保持。

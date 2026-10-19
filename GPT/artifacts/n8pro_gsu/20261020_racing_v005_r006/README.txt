MMC5Racing 3D v005 / 継続最適化 r006（2026-10-20）

PC: play_pc_25mhz.cmd を実行。r004/r005と同じ専用Mesenコア・25MHz。
このワークスペースの .tmp/nesfx-audio-repo と runtime_sky を参照する。
実行フォルダーは専用の build/r006/runtime。通常版Mesenでは動かない。

N8 Pro: sdcard/GSU-RACING-V005-R006 をフォルダーごとSDへコピーし、
GSU_MMC5Racing3D_v005_N8Pro_r006.nes を起動。同梱gsu.rbfはr005と同じバイト列。
実機動作は未確認。黒いままなら本体RESETを一度試す。メニューへは電源を入れ直す。

GSU: r005より1,600姿勢の合計5.80%短縮、全画像一致。遅くなった姿勢はなし。
RTL代表8場面の最大22.60→21.04ms（GSU単体、CPU・画面転送を含まない）。
配布版は木10本・家3軒、幹の境界64。色・形・地面・音・物理を維持。
Mesen全体は全周768姿勢すべて30.05fps以上、重い8姿勢も各120VBlankで30.05fps。

FPGA追加案は採用せず、5,957/6,272 LE・M9K 28/30を保持。
20景物の負荷版は別の試験用。30fps保証を広げたものではない。
詳しい採否・残るボトルネック・検証限界はoptimization.md、測定値はverification/。
experiments.zipに試行ソースと負荷版、testbenches.zipにRTLテスト、source.zipにソース。
旧版と記録動画は保持。

操作: A加速、Bブレーキ/ドリフト、左右操舵、SELECT視点、上ポリゴン表示切替、
下GRIP/DRIFT、START走行リセット。

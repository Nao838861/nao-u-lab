# GRIPの摩擦限界1.3倍調整を撤回

2026年10月14日の依頼原文:

> GRIP MODEは摩擦円の大きさを1.3倍くらいにしてほしいが、できるか？の修正、いったん元に戻して。挙動が想定と違っていた。

`D:\HomeBrew\MMC5Racing`の最新main `8902afa`から、摩擦限界の変更だけを取り除いた。main `3e96287`をorigin/mainへpush済み、終了時clean・ahead/behindなし。通常荷重78→60、全65荷重の値を元の`floor(15*N/4)`へ戻した。モード別容量表と開始時コピーを削除し、bank0`$61B0..$61F0`の予約を解除した。

176pxの表示・列転送、木8本の1px回転配置、衝突・爆発・再挑戦、CPU車、HUD、モード別タイム・車色・フォント・ブレーキ音、以前のGRIP惰性／Bブレーキの荷重移動調整は保持した。操作感についての今回の指摘は、数値や負荷の検査を通っても想定した体感が保証されない教師差分として保存する。新しい操縦感の再提案は行わない。

比較元の調整前ROM`e502922b…`に対して、物理bank126全体8KiB、車軸／ブレーキ補助bank115 B400..B71C、エネルギー補助bank119 C400..D6FFがバイト一致。最新176px版に対して全CHR、摩擦円テーブル、固定の音コードはバイト一致。差分はPRG115/119/126/127の容量参照・初期化の撤回だけ。

Mesen2.1.1でGRIP通常1607レースフレーム・GRIP旋回1091・GRIP FULL1091・DRIFT旋回1091を確認し、全条件で公開間隔1、保持0、転送拒否0。旧RAM容量表への読み出し0・走行中の書き換え0、全物理更新で容量値が旧式と一致。旋回/FULLは検証用姿勢を使い、人間の自然な完走ではない。

通常起動`play.cmd`の生成ROMと、固定起動`play_scenery.cmd`が参照する`releases/MMC5Racing_AllIntegrated_144x176.nes`の両方を更新した。同じ現在版を指す`MMC5_Race5_DirectUpload_AxleShared.nes`と`MMC5Racing_Rivals3_60fps_Checked.nes`も更新。過去の168px版などは履歴のまま残す。

現行ROM SHA256 `3a4b2e04f4bfdc4d72942b29d92afad2d727afb3c6c3e5bf4ff7c7d1d5643112`。ソースの設計ログ・README・release manifestにも撤回を記録。以前のGRIP調整メモと開発側`verification/grip-friction/README.md`は撤回済みと明記。根拠は開発側`verification/grip-revert/`。

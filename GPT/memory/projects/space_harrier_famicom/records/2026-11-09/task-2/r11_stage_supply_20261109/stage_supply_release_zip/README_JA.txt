r11 CPU供給最適化版
専用Mesenで検証済み・実機未検証

結果
・Stage自然進行6000field、ボス繰返し6000fieldで、それぞれ6000枚を提示。
・射撃と上下左右移動ありも、Stageとボス各3000fieldで3000枚を提示。
・上の全試験でCPU更新遅れ、供給不足、画像破棄、描画期限超過は0。
・元のsnapshot版ではStage3000field中、供給不足12回、提示2988枚だった。
・確認した条件では毎表示fieldに1枚を提示できた。実機の速度や全場面を保証する結果ではない。

原因と変更
CPUの画像生成と次のロジック更新が同じ周期で37.24msかかる例があり、
2表示field分の約33.28msを超えていた。GSU側の描画期限超過は0だった。

変更はCPU側の4点。
1. 次の画像が準備済みなら、不要なレジスタ退避と供給関数の呼び出しを省く。
2. native OAMの中間位置と次snapshotを一回の走査で作る。
3. 背景物投影の16bit乗算に、既存のMMC5互換8bit乗算器を使う。
4. カメラ記録38byteのコピーをunrollする。

GSU509byteプログラム、atlas、CHR、山、色、EM1、音声、NMI内の音声実行順、
ゲーム時計、queue数、warmup、描画の固定遅延設定は従来どおり。
追加の待機や画質低下でフレーム数を増やしたものではない。

メモリと資源
追加の静的RAM、ROM容量、PRG bank、FPGA資源、GSU cacheは0。
CPU stackを一時的に1byte多く使う。既存の256byte予約内で、単体試験で釣り合いを確認。
CPUコードは既存PRG bank内の未使用部分と不要になったコード領域を利用する。
主なコード量はyield helper31B、OAM prepare5361B（以前2948B）、
乗算helper73B、カメラhelper498B＋固定wrapper17B。
未使用になったoam_previousの256B予約はそのままで、空きRAMとして数えていない。

同等性確認
・OAM補間36例、カメラコピー32例がすべて合格。
・乗算99,328例と256例の実CPU周期確認が合格。
・Stageとボス各1501ロジック境界で849byteのゲーム状態、入力、native OAMが一致。
  元snapshot版との相違は実NMI時計1byteだけ。時計の仕様自体は変更していない。
・各200世代の前景現在・中間コマンド、カメラ、OAMがすべて一致。
・同じ表示位相のStageとボス画像は全pixel一致。
・乗算のV flagだけは未規定。3呼出箇所すべてで使われないことを確認。

使うファイル
hardware/MonoSH_r11_CPU_SupplyOptimized_HARDWARE_UNTESTED.nes
hardware/MonoSH_r11_UNCHANGED.rbf
この組を使う。RBFは既存r11版と完全に同じ。実機は別途検証が必要。

mesen/MonoSH_r11_CPU_SupplyOptimized_MESEN.nes
専用Mesen用。対応MesenCore.dllのSHA256はMANIFESTと検証JSONを参照。
通常のMesenへの対応や、そのDLL自体はこの小さいZIPには含めていない。

配布ROMは通常起動。自動ボス開始や自動無敵の試験hookは入っていない。
試験では元からあるSELECT無敵切替、STARTボス切替を使った。
古い自動ボス試験ROMのpatchを重ねないこと。新コードがFF80..FF9E等を使用している。

再現
python -B rebuild.py
これだけで、同梱baseline ROMと固定blobから両ROMを正確に再現する。

CC65_BINにcc65のbinディレクトリを設定して、
python -B rebuild.py --assemble
と実行すれば4つの6502ソースも再アセンブルして照合する。
出力先はrebuilt。実機、SD、USBや外部状態にはアクセスしない。
prepare_oam.bin全体をROMへコピーしてはいけない。既存submitを保持するため、
rebuild.pyの2つの限定範囲だけを使う。

詳細な結果・条件・限界: tests/VALIDATION.json
CPU時間の内訳: tests/CPU_BOTTLENECK.json
正確なファイルhashと配置: MANIFEST.json / sha256sums.txt

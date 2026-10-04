# MonoSH Super FX2 記憶入口

NES の MonoSH を SNES の CPU と Super FX2 へ移植する新プロジェクト。2026年10月5日に設計を開始した。

正本は [プロジェクト入口](../../../projects/monosh_fx2/README.md) と [設計書](../../../projects/monosh_fx2/DESIGN.md)。原文は同所の `REQUEST.md`。NES 側の入口は [MonoSH 記憶入口](../monosh/README.md)。

ユーザーと確定した方針は、ロジックも60Hz、MSXSH の V9968 版の倍密度Z2と時間仕様を参照、上下黒帯による全フレームバッファ転送。次回は設計書の「壁打ちで決めること」から再開し、256×160への画角・投影、自機、色を詰める。GSU稼働中のCPU処理は本体WRAMへ置く。CPU 4ms と GSU の描画性能は未実測。今回はゲーム ROM を実装していない。

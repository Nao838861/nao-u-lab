# MonoSH Super FX2 開発プロジェクト

NES 版 MonoSH を元に、MSXSH の V9968 版の60Hz仕様を SNES の CPU へ移植し、Super FX2 で拡縮スプライトを描くフレームワークを検討する。ロジック・描画とも60Hz、上下黒帯を用いた全フレームバッファ転送から始める方針が確定。現在は設計と成立条件の確認段階で、ROM と開発ツールの導入はまだ行っていない。

第一目標は横256・縦192への直接描画。まず通常224行で約7KBという転送枠の条件を揃え、192行で増える転送枠と全12KiBの画像量を比較する。標準NTSCタイミングの上限では画像だけで約869bytes不足するため、成立方法は未確定。256×160の先行採用と、96行の画像を2倍表示する案の初期採用は行わない。

- [設計書](DESIGN.md) — メモリ所有権、CPU と GSU の並行動作、転送量、地面、移植手順、未決事項。
- [依頼原文](REQUEST.md) — 2026年10月5日の依頼を保持。
- [帯域計算](tools/frame_budget.py) — 解像度と描画リスト量から時間予算を再計算する。実測値ではない。
- [記憶入口](../../memory/projects/monosh_fx2/README.md) — 次回の再開場所。

```powershell
python -X utf8 projects/monosh_fx2/tools/frame_budget.py
python -X utf8 projects/monosh_fx2/tools/frame_budget.py --commands 40 --reserve-ms 0.5
python -X utf8 projects/monosh_fx2/tools/frame_budget.py --normal-dma-bytes 7000
```

ゲームコードの移植先候補は `D:\HomeBrew\MonoSHFX2`。この場所と独立リポジトリの作成は、設計の合意後に決める。参照元は NES の `D:\HomeBrew\MonoSH` と MSX の `D:\MSXDev\MSXSH`。

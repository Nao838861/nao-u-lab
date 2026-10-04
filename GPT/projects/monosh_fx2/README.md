# MonoSH Super FX2 開発プロジェクト

NES 版 MonoSH を元に、MSXSH の V9968 版の60Hz仕様を SNES の CPU へ移植し、Super FX2 で拡縮スプライトを描くフレームワークを検討する。ロジック・描画とも60Hz、上下黒帯を用いた全フレームバッファ転送から始める方針が確定。現在は設計と成立条件の確認段階で、ROM と開発ツールの導入はまだ行っていない。

- [設計書](DESIGN.md) — メモリ所有権、CPU と GSU の並行動作、転送量、地面、移植手順、未決事項。
- [依頼原文](REQUEST.md) — 2026年10月5日の依頼を保持。
- [帯域計算](tools/frame_budget.py) — 解像度と描画リスト量から時間予算を再計算する。実測値ではない。
- [記憶入口](../../memory/projects/monosh_fx2/README.md) — 次回の再開場所。

```powershell
python -X utf8 projects/monosh_fx2/tools/frame_budget.py
python -X utf8 projects/monosh_fx2/tools/frame_budget.py --commands 40 --reserve-ms 0.5
```

ゲームコードの移植先候補は `D:\HomeBrew\MonoSHFX2`。この場所と独立リポジトリの作成は、設計の合意後に決める。参照元は NES の `D:\HomeBrew\MonoSH` と MSX の `D:\MSXDev\MSXSH`。

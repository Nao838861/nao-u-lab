# MonoSH Super FX2 開発プロジェクト

NES 版 MonoSH を元に、MSXSH の V9968 版の60Hz仕様を SNES の CPU へ移植し、Super FX2 で拡縮スプライトを描くフレームワークを検討する。ロジック・描画とも60Hz、上下黒帯を用いた全フレームバッファ転送から始める方針が確定。現在はca65/casfxの検証ROMをMesenで実行し、描画・DMA・NES比較を測定した段階。ゲームロジックの移植はこれから。

第一目標は横256・縦192への直接描画。v001では上下各16行の黒帯で全12KiBを転送すると992bytes欠けた。最大原画からの縮小描画は成立し、方式を選ぶと木30体の人工場面はクリア込み9.54ms。近い木を増やすと11.01ms。標準条件での全転送と実ゲームの60fpsはまだ成立していない。256×160の先行採用と、96行の画像を2倍表示する案の初期採用は行わない。

- [設計書](DESIGN.md) — メモリ所有権、CPU と GSU の並行動作、転送量、地面、移植手順、未決事項。
- [v001測定結果](probes/v001/RESULTS.md) — 11種類のGSU描画経路、534件の画素検証、30体合成、全転送不足、NESとの速度比較。
- [clip条件とDMA対策](DMA_OPTIONS.md) — 最大の木はclipなし。矩形からの差分転送、固定空白、HBlank forced blank、黒帯追加を比較。
- [v001再実行手順](probes/v001/README.md) — 検証ROMのビルドと自動実行。
- [依頼原文](REQUEST.md) — 2026年10月5日の依頼を保持。
- [帯域計算](tools/frame_budget.py) — 解像度と描画リスト量から時間予算を再計算する。実測値ではない。
- [記憶入口](../../memory/projects/monosh_fx2/README.md) — 次回の再開場所。

```powershell
python -X utf8 projects/monosh_fx2/tools/verify_probe.py
python -X utf8 projects/monosh_fx2/tools/frame_budget.py
python -X utf8 projects/monosh_fx2/tools/frame_budget.py --commands 40 --reserve-ms 0.5
python -X utf8 projects/monosh_fx2/tools/frame_budget.py --normal-dma-bytes 7000
```

ゲームコードの移植先候補は `D:\HomeBrew\MonoSHFX2`。この場所と独立リポジトリの作成は、設計の合意後に決める。参照元は NES の `D:\HomeBrew\MonoSH` と MSX の `D:\MSXDev\MSXSH`。

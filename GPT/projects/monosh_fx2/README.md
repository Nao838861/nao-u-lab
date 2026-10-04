# MonoSH Super FX2 開発プロジェクト

NES版MonoSHのゲームを、MSXSHの60Hz更新仕様を参照してSNESのCPUへ移植した。Super FX2が拡縮スプライトを奥から描き、通常BGとHDMAが地面・遠景を描く。**Stage 1からボス撃破・次周まで動くROMができた。表示256×180、通常30fps前後で、60fpsの目標には未達。**

まず [play.cmd](play.cmd) で遊べる。[ROM単体](releases/MonoSHFX2_v001.sfc) と [操作・ビルド手順](game/v001/README.md)、[実ゲームの測定結果](game/v001/RESULTS.md) を保存した。上下はNESと同じリバース操作。専用ランチャーでは左右矢印、下＝上昇／上＝下降、X連射、Z単発、Enter一時停止。

192行・上下16行黒帯の全12KiB転送は最初のプローブで992bytes欠けた。今回は前後の矩形をタイル列ごとにまとめる部分転送を実装し、転送量が大きい場合は全12KiB転送へ切り替える。実ゲームのHDMAを併用する最大量テストを通すため、表示は180行にして上下を切った。内部の2bpp FBは256×192、ゲームの座標・当たり判定は縮めていない。192行表示と60fpsは引き続き改善目標。

- [設計書](DESIGN.md) — メモリ所有権、CPU と GSU の並行動作、転送量、地面、移植手順、未決事項。
- [実行可能な移植版 v001](game/v001/README.md) — ゲームROM、操作、元の60Hz更新の移植、描画・転送の実装。
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

現在の実装先はこの `projects/monosh_fx2/game/v001`。参照元はNESの `D:\HomeBrew\MonoSH` とMSXの `D:\MSXDev\MSXSH` で、原本は変更していない。通常ビルドは固定済みの原本・画像を使う。

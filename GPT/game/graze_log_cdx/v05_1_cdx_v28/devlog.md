# graze_log v05.2_cdx_v28 devlog

## 目的

v25 の「既存ゲームから型を借りた」は抽象化止まりだった。今回は 1942 を対象に、敵数・編隊単位・軌跡・追従速度を trace card として持つ実装に変えた。

## 変更

- `TRACE_EVENTS` に 1942 trace wave を12件定義。
- `SRC_W=224` / `SRC_H=256` を追加し、原作画面座標から `sx()` / `sy()` で現行画面へ変換。
- 敵軌跡を `traceLine` / `traceBezier` で明示。
- 赤5機/10機編隊を group として扱い、全滅時に formation bonus と gauge 報酬を出す。
- 下左右から上へ飛ぶ低速 bonus plane を追加。
- side curl / mirrored side curls / width pass / bomber escort を追加。
- v25 の抽象 enemy grammar は使わず、敵種を `red / gray / bonus / bomber / boss` に整理。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v28_check.js
```

確認済み:

- trace source notes がある。
- 224x256 source coordinate scale を使っている。
- concrete 1942 labels がある。
- redFiveV / redTenFormation / leftCurl / rightCurl / bonusLeft / bonusRight / widthPass / bomberEscort / boss flags が立つ。
- traceLog が全 wave を記録する。
- boss spawn / clear / Active DEF / bot clear が通る。

## 残り

現時点では「完全再現を目指すための trace 実装」であり、実際の 1942 stage 32 のフレーム単位完全コピーではない。次に精度を上げるには、動画または実機プレイから各 wave の出現フレーム、初期座標、旋回半径、離脱速度を採寸する必要がある。

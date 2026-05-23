# graze_log v05.2_cdx_v64 devlog

## 2026-05-23 Codex v64: CHASE popup pixel probe

### 背景

v63 は CHASE popup の座標 snapshot と Chrome screenshot の生成確認まで行った。ただし、スクリーンショットの bytes が存在しても、実際に CHASE 文字がその box 内に描かれているかは保証していなかった。

今回の主眼は、ゲーム制作そのものではなく「headless で何をどう振るべきか」の継続検証である。人間の目視評価を置き換えず、目視前の証拠として実ブラウザ画像から最低限の視認性を検査する。

### 実装

- v63 を `v05_1_cdx_v64` にコピー。
- `probeBare=1` を追加し、canvas だけを 420x620 で Chrome screenshot に出せるようにした。
- `makeProbeSnapshot()` に `visualContract` を追加した。
- visual probe check を作り直し、Chrome screenshot の PNG を Node.js で展開して、CHASE popup の推定 box 内を pixel scan するようにした。
- pixel scan は CHASE 系の緑色ピクセル数、暗背景ピクセル数、輝度差を検査する。
- gameplay、wave、bot policy、score、reward は変更していない。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v64_check.js
node tools\headless_graze_log_cdx_v05_2_v64_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v64_visual_probe_check.js
```

### 結果

3 本とも pass。

- focused check: route bot clear、`chaseBonus 19157`、`chasePopupCount 28`、`chasePopupMeanSpawnPlayerDist 148.3`、`chasePopupMeanActivePlayerDist 157`、`chasePopupTooFarPct 0`、`chasePopupVisualProbe true`。
- policy matrix: route/aggressive/marksman は clear し CHASE bonus を得る。camper は clear 0 / CHASE bonus 0。
- visual probe: Chrome screenshot 4 枚を生成し、全て 420x620、各 CHASE popup box で `chasePixels 27`、`lumaGap 86.1-86.8`、`pixelProbePass true`。

### 次の確認点

この pixel probe は「文字色が box 内に存在する」検証であり、「報酬として気持ちよく読める」検証ではない。次は in-app browser または実機で、通常 UI 付きの `probeFrame=838&probeDraw=1` などを見て、視線誘導と邪魔さを人間目視で評価する。

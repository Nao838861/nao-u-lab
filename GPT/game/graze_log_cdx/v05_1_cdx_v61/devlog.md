# graze_log v05.2_cdx_v61 devlog

## 2026-05-23 Codex v61: CHASE popup の safe rail と遮蔽 telemetry

### 背景

v60 では `CHASE` popup の頻度は bounded になったが、次の確認点として「`CHASE xN` が boss cue や敵弾と重なって邪魔に見えないか」が残った。今回は実機目視の前段として、表示が危険情報の上に出る条件をコード側で避け、headless でも遮蔽率を測れるようにした。

### 実装

- `CHASE` popup を kill 位置には重ねず、左右端の safe rail へ出す。
- safe rail 候補は左右 x=42/378、y=78/126/174/222。敵弾 24px 圏内または boss final cue の中央帯と重なる候補は避ける。
- `chasePopupRepositioned` を記録し、表示位置の退避が起きた回数を残す。
- frame 単位で `chasePopupThreatOverlapPct` と `chasePopupBossCueOverlapPct` を計測する。
- focused check と policy matrix に `chasePopupOcclusionBounded` 条件を追加する。

### 検証コマンド

```powershell
node tools\headless_graze_log_cdx_v05_2_v61_check.js
node tools\headless_graze_log_cdx_v05_2_v61_policy_matrix_check.js
```

### 検証結果

2026-05-23 実行。初回は kill 位置を基本に、危険時だけ rail へ逃がす実装だったが、policy matrix で aggressive `chasePopupThreatOverlapPct 0.011`、marksman `0.006` となり失敗。`CHASE` popup を常時左右 safe rail へ出す実装に変更し、両方 pass。

- focused check: route bot clear、`chaseBonus 19157`、`forwardChaseKills 66`、`chasePopupCount 28`、`chasePopupRepositioned 28`、`chasePopupDensity 0.424`、`chasePopupThreatOverlapPct 0`、`chasePopupBossCueOverlapPct 0`。
- policy matrix: route clearRate 1 / chaseBonus 19157 / popupDensity 0.424 / threatOverlap 0 / bossCueOverlap 0。
- policy matrix: aggressive clearRate 1 / chaseBonus 54322 / popupDensity 0.421 / threatOverlap 0 / bossCueOverlap 0。
- policy matrix: marksman clearRate 1 / chaseBonus 51377 / popupDensity 0.431 / threatOverlap 0 / bossCueOverlap 0。
- policy matrix: camper clearRate 0 / bottomCampPct 0.999 / chaseBonus 0。

### 次の確認点

headless で遮蔽率が bounded でも、人間視点で報酬感が十分かは別問題。次は Browser Use または実機で、右端 rail の `CHASE` が視線誘導として弱すぎないかを見る。

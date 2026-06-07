# graze_log v13 — phase 5 山 1 medium fan3 切替 (j-α) 1 行 ship

**status**: v13 (j-α) shipped

## 改変対象
- file: `index.html` line 466
- v12: `spawnEnemy('medium',W*0.35,0,'aimed');`
- v13: `spawnEnemy('medium',W*0.35,0,'fan3');`
- 変更内容: bulletPattern 引数を `'aimed'` → `'fan3'` (5 文字置換)

## Stage 3 予測 (≤3 行)
- 52-65s phase 5 (山 1) 区間で fan3 1 体が登場 → 78-90s phase 7 (山 2 final) の fan3 4 体への予兆として機能
- 山 1 が「aimed + fan3 mix」化、final への接続が滑らか化、メリハリのリズム強化を狙う
- 副作用リスク: phase 5 密度↑だが fan3 1 体追加 (medium 2 のうち 1 → fan3) のみで描画 budget は許容範囲内

## 戻し方 (1 行)
- `index.html` line 466 の `'fan3'` を `'aimed'` に書き戻し → v12 完全等価

## 親
- v12 (i-δ) phase 6 休符 medium 削除 1 行 ship (commit `3d91915db`)
- v12 README.md Stage 1+2 篩 (line 31-46) で (i-α) として確定済

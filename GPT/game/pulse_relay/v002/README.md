# Pulse Relay v002: Vector Wake

v002 は既存 v001 を参照せず、空の `v002` から作り直した 2D シューティング。通常ショットで隊列を撃ち切り、敵弾に近づいて charge した pulse で危険を反撃へ変える。

## 操作

- Move: Arrow keys / WASD
- Shoot: Z / Space
- Pulse: X / Shift
- Pause: P
- Restart: R

## ファイル

- `index.html`: playable browser entry
- `game.js`: browser と headless が共有する game model
- `verify.js`: 3 policy headless + boss TTK
- `enemy_overlap_check.js`: route overlap と密度確認
- `timeline_eval.js`: 秒別評価
- `design_trace.md`: 設計サイクルと破棄した案
- `wave_intent_table.md`: wave ごとの意図
- `eval_timeline.md`: timeline 結果
- `visual_review.md`: 見た目レビュー
- `self_judgment.md`: 自己評価
- `known_failures.md`: 未達と制約

## 検証

```powershell
node verify.js
node enemy_overlap_check.js
node timeline_eval.js
```

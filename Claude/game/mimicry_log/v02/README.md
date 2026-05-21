# mimicry_log v02 — 間合い選択ごっこ (focus shot + token burst)

## 起動

`index.html` をブラウザで開く。`?seed=N` で seed 固定可。

## 操作

| キー | 効果 |
|---|---|
| ← → ↑ ↓ / WASD | 移動 |
| **SHIFT** | FOCUS (移動 0.5x / hit 0.5x / graze 1.5x / 弾 spread 1/3 / DPS 1.3x、vignette + 青リング表示) |
| **Z** | FOCUS BURST (TOKEN 3 消費、1 秒間 DPS 2.0x / 移動 0.4x / hit 0.3x) |
| SPACE | START / BOMB (gauge MAX) / DEF (graze streak 5 以上) / RETRY |
| M | mute |

## TOKEN の貯め方

SHIFT 押下中に敵を撃破すると TOKEN が貯まる。
- small +1 / medium +3 / large +9
- TOKEN 3 で Z = BURST 発動可

## 構造ポインタ

- 設計の理由は [devlog.md](./devlog.md)
- 着手前ブレストは [brainstorm.md](./brainstorm.md)
- 実装中の判断分岐は [implementation-notes.md](./implementation-notes.md)
- 挙動回帰検査は `node _sim_check.js`

## 派生

`graze_log/v05.2` → `mimicry_log/v01` → `mimicry_log/v02` (案 A: 操作状態空間 +1 次元)

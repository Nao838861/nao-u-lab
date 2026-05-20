# graze_log v05.2_cdx_v17 devlog

## 目的

v16 の `DEF WINDOW` popup は押し時を明確にしたが、弾幕中に文字で答えを出しすぎる。v17 は Active DEF cue を ring only に寄せ、情報過多と弾幕視認阻害を減らす。

## 実装

- v16 から `v05_1_cdx_v17` を作成。
- `DEF_PROMPT_FRAMES` を 72 から 84 に延長。
- prompt 成立時の `DEF WINDOW` popup を削除。
- prompt ring を `ACTIVE_DEF_RADIUS-14` から `ACTIVE_DEF_RADIUS+6` の細い範囲に変更。
- title 表示を `v05.2_cdx_v17 - quiet DEF ring` に更新。
- `tools/headless_graze_log_cdx_v05_2_v17_check.js` を追加し、ring only cue と `DEF WINDOW` 不在を検査する。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v17_check.js
```

結果は staging に記録する。

## 次回焦点

- 実プレイで ring only cue に気づけるか。
- `WINDOW n` + `DEF n` が HUD 上で邪魔にならないか。
- ring が見えにくい場合は色や life を調整し、文字 popup 復活ではなく視覚 cue の品質で直す。

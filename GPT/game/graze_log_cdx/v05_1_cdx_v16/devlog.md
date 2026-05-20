# graze_log v05.2_cdx_v16 devlog

## 目的

v15 の課題だった「Active DEF は有効だが、押す瞬間が自然に読めるか」を改善する。BOMB や shield の数値には触らず、DEF ready 中の局所的な cue だけを追加する。

## 実装

- v15 から `v05_1_cdx_v16` を作成。
- `DEF_PROMPT_FRAMES=72`、`DEF_PROMPT_WINDOW=2` を追加。
- `defPromptReady()` を追加し、DEF ready かつ graze window 内に弾が2発以上ある時だけ cue 対象にした。
- 条件が続いた時に `DEF WINDOW` popup と Active DEF 半径 preview ring を出すようにした。
- HUD の `WINDOW n` の後ろへ、条件成立中だけ `DEF n` を表示。
- Active DEF 使用時に `defReadyT` をリセットし、cue が残らないようにした。
- `tools/headless_graze_log_cdx_v05_2_v16_check.js` を追加し、DEF prompt の発火とリセットを検査する。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v16_check.js
```

結果はこのサイクルの staging に記録する。

## 所感

v16 は新しい救済ではなく、既存の Active DEF を読ませる差分。`DEF WINDOW` は常時説明ではなく、条件を満たした時だけ出る短い cue にした。次は実プレイで、この cue が邪魔なら表示頻度を下げ、押す理由がまだ弱いなら報酬ではなく弾配置側を調整する。

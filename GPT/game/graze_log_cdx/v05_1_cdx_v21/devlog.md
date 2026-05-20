# graze_log v05.2_cdx_v21 devlog

## 目的

v20 は HUD の `WINDOW n` / `DEF n` / `SPACE [D]EF` を削り、Active DEF の押し時を ring だけで読ませる評価版にした。次の課題は、文字 cue を戻さずに ring cue の視認性を上げられるかである。v21 はそのために、BOMB・敵構成・報酬量を固定したまま Active DEF prompt ring だけを変更する。

## 実装

- v20 から `v05_1_cdx_v21` を作成。
- HTML title / title screen を v21 に更新。
- `DEF_PROMPT_RING_LIFE=52` と `DEF_PROMPT_OUTER_LIFE=34` を追加。
- prompt 成立時、太い内側 ring と薄い外側 ring を同時に出すようにした。
- draw 側で ring ごとの `w` / `a` を読めるようにし、既存 ring は従来値に fallback する。
- プレイヤー周囲の prompt ring を少し太くし、補助 ring を外側へ広げた。
- v20 で削った HUD 文字 cue は復活させていない。

## 戻し手順

- ring が強すぎる場合は `DEF_PROMPT_RING_LIFE` を 42 に戻し、外側 ring push を削除する。
- HUD 文字 cue が必要だと判断した場合も、まずは `lineWidth` / life / 半径だけを調整し、`DEF WINDOW` popup の復活は別判断にする。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v21_check.js
```

結果:

- clear-capable bot: clear。
- boss final cue: 検出。
- final BOMB: 使用。
- Active DEF cue: simpleBot が clear run 内で使用。
- HUD 文字 cue: `WINDOW n` / `DEF n` / `SPACE [D]EF` 不在。
- prompt ring: 二重 ring、outer life 34、inner life 52、`lineWidth=4` を検査。

## 次回焦点

- 実プレイで v21 の二重 ring が過剰でないかを見る。
- 読めるがうるさい場合は外側 ring の透明度を下げる。
- まだ読めない場合は文字命令ではなく、短い音・色変化・ring 寿命の追加で検討する。

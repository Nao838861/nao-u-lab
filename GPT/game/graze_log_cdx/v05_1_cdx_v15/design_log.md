# graze_log v05.2_cdx_v15 design_log

## 入力

継続 directive:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

現在の焦点:

> v14 の wave intent HUD が邪魔にならず、波の読みを助けるか確認する。
> shield 4 でリカバー性と緊張感のバランスが取れているか確認する。
> medium の `ANCHOR ESCAPING` が「早く倒す価値」として読めるか確認する。
> 次回は実プレイで見えた情報過多や medium の硬さを調整する。

## 実装前判断

v14 の headless は clear したが、simple bot の `grazeCount` は 6、`activeDefCount` は 0 だった。これはクリア可能性としては良い一方で、ゲーム名と中核ループである graze / Active DEF が「使うと得」というより、避けても通る補助に寄っている。

今回の playable diff は、wave intent や medium の硬さをさらに増やすのではなく、プレイヤーが弾の近くを通った時に「今は graze window にいる」と読め、Active DEF を使うと小さく BOMB stock へ戻るようにする。shield 4 は維持し、救済量を増やしすぎない。

## 設計サイクル

良いところ / 悪いところ:

1. v14 は finite stage / boss / clear が通る。
2. v14 は wave intent を HUD と popup に出せる。
3. v14 は shield 4 で緊張を戻した。
4. v14 は medium anchor に倒す価値を持たせた。
5. ただし graze window が画面上で弱く、近づく価値が読みにくい。
6. Active DEF は弾消しにはなるが、BOMB stock へ戻る意味が薄い。
7. HUD は情報が増えているので、独立した説明文を増やすと邪魔になる。
8. simple bot が Active DEF を使わずに clear できるため、検査上も DEF の価値を別途見る必要がある。
9. shield 4 はこのサイクルでは変えない。
10. medium HP の追加調整も今回は見送る。

改善案:

1. v14 を v15 にコピーする。
2. bullet が graze 半径の外縁にいる数を `grazeWindowCount()` として数える。
3. HUD の既存2行目に `WINDOW n` を足し、別枠の説明を増やさない。
4. player 周辺に graze window ring を出し、弾に寄った時だけ視覚強度を上げる。
5. Active DEF が消した弾数に応じて少量 gauge を返す。
6. 返す gauge は `2 * cleared`、上限 14 にする。
7. popup は `DEF x4 +8` のように結果を短く出す。
8. headless check に Active DEF focused probe を追加する。
9. 既存の clear-capable bot は維持する。
10. 継続 directive の `last_result` を v15 に更新する。

採用:

- v15 は「grazing を読ませ、DEF を BOMB stock へつなぐ」改善に絞る。
- medium / shield / boss の数値は v14 から据え置く。複数軸を同時に動かすと、改善原因が読めなくなるため。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v15_check.js
```

期待:

- v14 の finite stage / final cue / final BOMB / clear が維持される。
- `WINDOW` 表示と graze ring が HTML 上に存在する。
- focused probe で Active DEF が4発を消し、gauge +8 を返す。

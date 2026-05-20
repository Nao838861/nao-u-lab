# graze_log v05.2_cdx_v16 design_log

## 入力

継続 directive:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

現在の焦点:

> v15 の `WINDOW n` が HUD の情報過多にならず、graze の読みを助けるか確認する。
> Active DEF の gauge 報酬が BOMB を安売りせず、使う理由として足りるか確認する。
> shield 4 と DEF 報酬の組み合わせで緊張感が薄まらないか確認する。
> 次回は実プレイで DEF が自然に押されるか、または graze window が邪魔なら表示密度を下げる。

## 実装前判断

v15 の headless は clear し、focused probe では Active DEF が4発を消して gauge +8 を返すことも確認できた。一方、clear-capable bot の `activeDefCount` は 0 のままだった。これは「押せば得」ではあるが、実プレイ中に押すべき瞬間がまだ弱い可能性を示す。

今回は弾幕量、shield、BOMB、medium HP は触らない。`WINDOW n` と DEF 報酬の上に、DEF ready 中の「いま押すと効く」cue だけを足す。情報量を増やしすぎないため、常時説明文ではなく、条件を満たした時だけリングと短い `DEF WINDOW` を出す。

## 設計サイクル

良いところ / 悪いところ:

1. v15 は finite stage / boss / clear が通る。
2. v15 は graze window を HUD とリングで読ませる。
3. v15 は Active DEF に gauge 報酬を持たせた。
4. v15 は BOMB stock を安売りしない。
5. ただし `DEF READY` 後、いつ押すべきかはプレイヤー判断に残りすぎる。
6. `SPACE [D]EF` は入力可能状態の表示であり、効果的なタイミングの表示ではない。
7. `WINDOW n` は役立つが、読み慣れていないと DEF 半径と結びつきにくい。
8. bot が DEF を使わずに clear するため、DEF の価値は focused probe で別検査する必要がある。
9. shield 4 は維持する。救済量を増やすと緊張感の検証が混ざる。
10. 今回は視覚 cue と検査だけに絞る。

改善案:

1. v15 を v16 にコピーする。
2. `DEF_PROMPT_FRAMES` と `DEF_PROMPT_WINDOW` を追加する。
3. `defPromptReady()` を追加し、DEF ready かつ graze window 内の弾が2発以上ある時だけ true にする。
4. 条件継続中は `state.defReadyT` を増やす。
5. 72フレーム続いたら `DEF WINDOW` popup と Active DEF 半径の ring を出す。
6. HUD の2行目に条件成立中だけ `DEF n` を追加する。
7. player 周辺に Active DEF 半径の preview ring を出す。
8. Active DEF 使用時に `defReadyT` をリセットする。
9. headless check に DEF prompt focused probe を追加する。
10. 継続 directive の `last_result` を v16 に更新する。

採用:

- v16 は「DEF を自然に押す」ための cue 改善に絞る。
- 難度・報酬量・敵構成は据え置く。v15 からの改善原因を、DEF cue の可読性に限定する。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v16_check.js
```

期待:

- v15 の finite stage / final cue / final BOMB / clear が維持される。
- focused probe で `DEF WINDOW` が出る。
- `defReadyT` は DEF 使用後に 0 へ戻る。
- `WINDOW`、DEF 報酬、shield 4 の既存検査が引き続き通る。

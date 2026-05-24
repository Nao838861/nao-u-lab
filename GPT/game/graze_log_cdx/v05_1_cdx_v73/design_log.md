# graze_log v05.2_cdx_v73 design_log

## 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してもよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

## 実装前判断

v72 は route だけで CHASE / Active DEF / boss cue / BOMB の stable frame を抽出した。次の不足は、route で見えた cue が他 policy でも同じ意味を持つのか分からないこと。headless が人間確認へ渡す screenshot を選ぶなら、単一 policy の「良い瞬間」だけではなく、policy 差分で cue の出方が変わることも証拠にしたい。

今回は gameplay、敵配置、報酬、bot policy を変更しない。`memory/game_headless_action_eval_playbook_20260523.md` の「平均点へ圧縮しない」、`memory/game_headless_eval_causality_lesson_20260523.md` の「評価器変更と gameplay 変更を混ぜない」を優先する。v73 は playable diff だが、主眼は評価器の比較軸追加である。

## 読んだ知見と反映

- `memory/game_headless_action_eval_playbook_20260523.md`: 主観を平均 score にせず、policy split と bad-policy failure を見る。今回は route だけでなく aggressive / marksman / survival を同じ cue family で比較する。
- `memory/game_headless_eval_causality_lesson_20260523.md`: 評価器を増やす時は gameplay 原因と混ぜない。今回は v72 gameplay を固定する。
- `memory/game_memory_task_lens_index.md`: Playable / Headless 評価、Player Simulation / Persona、Repair / Iterative Improvement の lens を採用する。
- v72 `design_log.md`: cue family review の対象を policy 別へ拡張する。

## 設計サイクル

### Cycle 1

良いところ 30: v72 は route clear、BOMB 使用、Active DEF 使用、boss cue 到達、CHASE popup 抽出、stable frame 探索、DOM contract、screenshot contract、raw JSONL、既存 matrix 維持、visual probe 維持、policy review 維持、cue family 4 種、version contract、canvas contract、seed 固定、再現可能、gameplay 固定、source note 維持、bad policy 維持、density timeline 維持、route coverage 維持、event ledger 維持、Chrome 実行確認、human review 候補抽出、score 依存を避ける、frame window を見る、単一 frame を避ける、trace digest と接続、staging に残せる。

悪いところ 30: route に偏る、policy 差分がない、survival の cue が未比較、aggressive の boss cue が未比較、marksman の CHASE が未比較、Active DEF の policy 差が見えない、BOMB が route 特有か不明、screenshot が cue 別で散る、HTML packet 未整理、raw JSONL の比較が人間に読みにくい、cue 優先順位がない、policy ごとの失敗理由が薄い、camper との cue 比較が薄い、novice の迷いが未比較、panic の早期 churn が未比較、frame 選定理由が cue ごとに違う、review panel は CHASE 寄り、activeDef / bomb は panel 表示が弱い、boss cue は popup と弾幕が混在、DOM contract は見た目の意味を保証しない、画像比較は最低限、再現 seed が 1 つ、policy matrix とは別ファイル、raw が増え続ける、実行時間が伸びる、Chrome 依存、評価の読み手が迷う、gameplay 進展ではない、人間評価前 packet がない、完成判定には届かない。

改善案 30: policy cue matrix、route/aggressive/marksman/survival 比較、camper 追加候補、novice 追加候補、panic 追加候補、cue 別 stable frame、policy 別 stable frame、代表 screenshot、raw JSONL、HTML packet、cue priority、policy priority、activeDef panel 強化、bomb panel 強化、boss cue panel 強化、frame reason 統一、multi seed、seed 差分、score 以外の並び、route coverage 併記、emergency count 併記、bossCue count 併記、eventFrame と stableFrame 併記、phaseIntent 併記、popup text 併記、browser contract 維持、既存 check 再実行、gameplay 固定、source note 追加、directive 更新、staging 記録。

筋の良い案: `policy_cue_review_check` を追加し、4 policy x 4 cue family の found / frame / phase / emergency count を matrix 化する。解決できる問題は route 偏りと cue 偏り。懸念は、policy によってそもそも cue が出ない場合に「悪い」と誤読すること。

### Cycle 2

良いところ 30: v73 は既存 check を維持できる、比較範囲が限定的、Chrome contract が流用できる、raw 保存できる、policy matrix と相補的、route-only の盲点を減らす、cue family の幅を保つ、gameplay を壊さない、diff が小さい、検証目的が明確、失敗時原因が評価器側、BOMB と boss cue の到達を再確認、Active DEF の差を見る、marksman と aggressive の上限を見る、survival の危機対応を見る、headless の役割に合う、human review 前段に使える、staging しやすい、継続 directive に合う、v72 を自然に拡張、score を verdict にしない、seed 固定で比較しやすい、policy 名が明示的、画像出力が残る、DOM version が残る、既存 raw と分離、次の HTML packet に接続、評価器肥大を抑制、playable は維持、ブラウザで開ける。

悪いところ 30: 新規ゲーム性なし、camper が対象外、novice が対象外、multi seed ではない、画像解析は弱い、review panel は cue 汎用でない、policy cue matrix が JSON だけ、比較の文章化が必要、Chrome がない環境で失敗、実行時間が増える、raw が長い、threshold が暫定、stable 判定が cue 別に手作り、activeDef は視覚 cue の意味が薄い、bombFlash は短い、bossCue は popup 依存、CHASE は既存関数依存、policy ごとの死亡時 cue が拾えない、survival の clear 状況次第、aggressive が過剰最適化かもしれない、marksman が route と近いかもしれない、完成判定でない、UI packet なし、manual play なし、screen overlap 詳細なし、frame 選択が earliest bias、bad policy failure との接続が薄い、v73 check が多い、document 更新が必要、directive 更新が必要。

改善案 30: earliest stable だけでなく latest stable、cue duration、policy failure cue、camper cue absence、multi seed、screenshot montage、DOM table、HTML evidence packet、CSV-like summary、assertion を緩める、assertion を強める、policy list 拡張、cue list 拡張、Active DEF 専用 visual probe、BOMB 専用 visual probe、boss cue 専用 panel、raw pruning、staging summary、自動 diff、event digest、phase digest、death log、route coverage compare、emergency compare、clear compare、human-readable README、source note、continuous directive、all checks、commit、push。

筋の良い案: v73 では matrix と代表 screenshot だけを作り、HTML packet は次に残す。解決できる問題は今回の 1 cycle に収まること。懸念は人間が raw JSON を直接読むにはまだ負荷が高いこと。

### Cycle 3

良いところ 30: small diff、headless 主眼、policy split、cue split、固定 gameplay、既存資産活用、実行可能、ブラウザ可、raw 残存、screenshot 残存、DOM contract、source note、design log、devlog、README、directive 更新、staging 更新、commit 可能、push 可能、将来 packet 化しやすい、失敗時原因が明確、過去知見と整合、bad-policy playbook と整合、causality lesson と整合、v72 の不足に対応、score 依存回避、平均化回避、route-only 回避、cue-only 回避、人間確認前段、評価器改善。

悪いところ 30: ゲーム完成度そのものは上がらない、camper 未対象、novice 未対象、panic 未対象、multi seed 未対象、visual semantic は薄い、画像解析少ない、review panel 汎用化未了、human review packet 未了、手作り assertion、browser 依存、実行時間、raw 増加、threshold 暫定、route と marksman が近い可能性、survival clear 差の扱い、cue absence の意味づけ未了、gameplay 変更なしが物足りない、stage grammar 改善なし、manual 操作未確認、スマホ未確認、DOM dump と screenshot のみ、policy 4 種だけ、seed 1 つ、result 説明が必要、matrix 読解が必要、既存 check 7 本、staging が長くなる、次タスクが残る。

改善案 30: 今回は v73 policy cue matrix、次回は HTML evidence packet、次回は camper/novice/panic 追加、次回は multi seed、次回は cue-specific panel、次回は montage、次回は death cue absence、次回は manual packet、次回は visual semantic、次回は bad-policy screenshot、次回は policy cue ranking、次回は seed variance、次回は raw compaction、次回は JSON schema、次回は stable reason table、次回は human note、次回は browser visual diff、次回は scoreless comparison、次回は emergency economy view、次回は phase timeline view、次回は screenshot index、次回は route compare、次回は no-gameplay-change gate、次回は gameplay change gate、次回は completion review、次回は stop condition review、次回は Nao_u feedback 反映、次回は Slack evidence summary、次回は staging reduction、次回は commit hygiene。

採用案: v73 は gameplay fixed + policy cue review matrix。理由は、v72 の cue family review を自然に拡張し、headless が「どの policy のどの cue を人間へ渡すか」を判断するための最小差分になるため。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v73_check.js
node tools\headless_graze_log_cdx_v05_2_v73_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v73_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v73_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v73_policy_review_check.js
node tools\headless_graze_log_cdx_v05_2_v73_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v73_policy_cue_review_check.js
```

合格条件:

- v72 由来の focused / matrix / visual / stable / policy / cue review が維持される。
- `policy_cue_review_check` が route の 4 cue family を検出する。
- aggressive / marksman / survival でも boss cue と BOMB の stable frame が見つかる。
- Active DEF の policy 差が count と candidate で見える。
- 代表 screenshot 4 件の Chrome DOM / screenshot contract が通る。
- raw JSONL が `memory/raw/headless_eval/graze_log_cdx_policy_cue_review.jsonl` に残る。

## 結果

2026-05-24 に 7 本すべて pass。既存の focused / policy matrix / visual probe / stable review / policy review / cue review を維持し、新規 `policy_cue_review_check` も pass した。

新規 matrix の要点:

- `route`: clear、routeCoveragePct 1、BOMB 1、Active DEF 18、boss cue 1。4 cue family すべて stable frame を検出。
- `aggressive`: clear、BOMB 1、boss cue 1。Active DEF は 0 で、速攻 policy では Active DEF 候補が出ないことを記録。
- `marksman`: clear、BOMB 1、boss cue 1。Active DEF は 0 で、精密射撃 policy では Active DEF 候補が出ないことを記録。
- `survival`: result は `play`、BOMB 1、Active DEF 15、boss cue 0。boss cue に届かず、早い BOMB と Active DEF に寄る cue absence を記録。

代表 screenshot 4 件は Chrome DOM / screenshot contract を通過:

- route / activeDef: 1138f
- route / bomb: 4705f
- aggressive / bossCue: 4356f
- marksman / chasePopup: 384f

raw result は `memory/raw/headless_eval/graze_log_cdx_policy_cue_review.jsonl` に保存した。

## 懸念と次

v73 は評価器改善であり、プレイヤー体験の新要素は増やしていない。次に続けるなら、policy x cue family の screenshot を人間評価用 HTML packet にまとめ、route-only / score-only ではない比較画面にする。

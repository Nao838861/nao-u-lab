# graze_log v05.2_cdx_v82 design_log

## v82 追記: non-monotonic perturbation replay packet

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v81 は `botJitter` + `botLag` の calibration grid を追加した。その結果、弱いはずの `j4/lag4` が route 3 seed 中 2 seed で落ち、より強い `j6/lag6`、`j8/lag8`、`j10/lag10`、`j12/lag12` は 3 seed clear した。これは「perturbation 強度を小さくすれば安全」という単調な解釈が危険であることを示す。

今回は gameplay、敵配置、報酬、既定 bot を変えない。v82 は、v81 の非単調結果を seed 単位で再生し、j4 failure と j6 clear を同じ packet / raw JSONL に並べる focused evaluation diff とする。使う知見は `memory/game_headless_action_eval_playbook_20260523.md` の policy split、`memory/game_headless_eval_causality_lesson_20260523.md` の因果切り分け、`game_memory_task_lens_index.md` の Playable / Headless 評価 lens。

### 設計サイクル 1

良いところ 30: gameplay 固定、評価器差分だけ、v81 の実測を再利用、seed 3 個、policy 4 種、route と bad policy 分離、baseline 維持、j4 anomaly 明示、j6 assertion 維持、j12 stress 維持、deathContext 維持、hitBullet 記録、raw JSONL、DOM contract、screenshot contract、review packet、README、devlog、directive 更新、staging、commit、push、Chrome 実行、VM 実行、合否と probe 分離、単調解釈の抑止、原因断定の抑止、人間確認用 evidence、次回比較可能、通常プレイ非影響。

悪いところ 30: ゲーム内容は進まない、人間プレイではない、j4 failure の原因はまだ入力履歴差レベル、画像意味解析なし、policy 4 種のみ、defensive なし、survival なし、route bot 固有の癖が残る、seed 3 は少ない、jitter/lag 値は経験的、DOM contract は意味保証でない、screenshot は存在確認、packet frame は代表、manual play 未確認、Chrome 依存、VM と browser の二重経路、raw が増える、評価器調整に寄りすぎる、完成判定ではない、面白さ判定ではない、threshold 暫定、j4 を落第扱いしすぎる危険、j6 を安全扱いしすぎる危険、stress boundary の解釈が必要、route score 差の分析不足、deathContext の読み解きが必要、既存全 check は未再実行、mobile 未確認、レビュー UI は補助、Nao_u 実評価待ち。

改善案 30: seed replay packet、baseline/j4/j6 並置、j4 failure assertion、j6 clear assertion、j6 bad policy failure assertion、j12 non-asserted assertion、replayPairs 出力、routeGrid 出力、deathContext 抜粋、hitBullet 抜粋、raw JSONL 分離、DOM packet id 更新、screenshot contract、title 更新、source note 更新、README 更新、devlog 更新、directive 更新、staging 更新、commit/push、v81 gameplay copy、版表示だけ変更、non-monotonic 文言追加、単調難易度禁止を明記、合否 cell と anomaly cell 分離、stress cell 分離、seed 12345/77777 を明示、future query を残す、browser packet を残す、次回の入力履歴比較に渡す。

筋の良い案: j4/lag4 を「弱い perturbation なのに落ちた anomalous cell」として保存し、同じ seed の baseline と j6/lag6 を並べる。解決できる問題は、headless の揺らぎを線形難易度として過信すること。新しく生じる懸念は、j4 failure の原因をまだ完全には分解していないこと。次回は入力履歴差分または死亡直前操作 trace を比較する。

### 設計サイクル 2

良いところ 30: v81 の観察を捨てない、評価器の癖を記録する、異常値を隠さない、good route 維持確認、bad policy failure 確認、stress probe 除外、seed 差可視化、policy 差可視化、death phase 保存、hit bullet 保存、raw と visual packet 両方、ゲーム差分なし、プレイ可能 index 維持、タイトル開始維持、中心入力維持、HUD 非変更、敵 wave 非変更、報酬非変更、review iframe 維持、実行時間抑制、検証対象明確、次回差分比較しやすい、staging に残せる、directive の焦点に合う、平均点に逃げない、単一 bot に寄らない、人間確認の前処理になる、評価器変更と gameplay 変更を混ぜない、push 可能な単位、再現性がある。

悪いところ 30: route bot の j4 落ちが人間らしさを意味しない、j6 clear が人間耐性を意味しない、bad policy は 3 種に限定、画像 packet は代表フレームのみ、死亡直前の連続入力は未保存、弾密度時系列の詳細比較なし、activeDef timing 差の分析なし、bomb timing 差の分析なし、route intent 差の分析なし、敵配置の品質は未評価、楽しいかは未評価、Nao_u の手触り未反映、review packet がやや説明的、query が増える、raw が増える、過去 script と重複、v81 check との重複、Chrome が必要、Windows path 前提、外部ブラウザ環境差、frame number は経験値、packet は縦長、mobile 未確認、厳密な causality ではない、j4 failure の seeds が固定、全 seed 探索ではない、threshold は暫定、今後の自動評価過信リスク、完成ではない、改善余地が残る。

改善案 30: 入力履歴差分を次回追加、death packet を policy pair 化、j4/j6 の lastEvents 比較、route intent switch 比較、activeDef count 比較、bomb count 比較、danger spike 比較、near bullet 比較、frame delta 比較、score delta 比較、coverage delta 比較、death phase 表、hitBullet 表、raw append、packet DOM、packet screenshot、README、devlog、directive last_result、staging、headless pass、git commit、git push、future focus 記録、stress not asserted、anomaly not failure-of-game、average not used、bad policy split、seed list fixed、methodVersion 固定、playable link 維持。

筋の良い案: 今回は causal debug まで広げず、non-monotonic replay の packet 化に絞る。解決できる問題は、v81 の重要観察がログ文だけで埋もれること。懸念は、根本原因に踏み込まないため次回作業が残ること。これは継続 directive の次サイクルへ渡す。

### 設計サイクル 3

良いところ 30: 最小 playable diff、focused evaluation、v82 独立、index playable、review packet browser-ready、headless check runnable、raw evidence、設計ログ日本語、devlog 日本語、README 日本語、directive 更新可能、staging 更新可能、commit 可能、push 可能、既存変更を混ぜにくい、gameplay 固定、j4 anomaly 保存、j6 assertion 保存、stress 除外、bad policy split、seed replay、DOM contract、screenshot contract、deathContext、hitBullet、routeGrid、replayPairs、methodVersion、次回入力履歴比較への橋渡し、作業範囲が狭い、Nao_u 指示に沿う。

悪いところ 30: playable の新体験はない、headless 方法論中心、設計サイクルが評価寄り、人間視認はスクショ存在確認、pixel 内容検証なし、iframe frame は固定、j4 failure の死因分析は浅い、j6 route の手触り未確認、bad policy の質未拡張、seed 数少ない、全 variants 未再実行、v81 raw との統合なし、Chrome 依存、packet の表現が説明的、UI は評価用、モバイル不要だが未確認、completion 判定ではない、楽しさ判定ではない、継続作業が残る、README 更新忘れリスク、directive 更新忘れリスク、staging 更新忘れリスク、push 失敗リスク、既存 dirty worktree が多い、stage 対象注意、raw append の差分が増える、.tmp は commit 対象外、巨大 index 差分、manual play 未実施、原因切り分け未完。

改善案 30: headless 実行、結果を design_log へ追記、devlog 更新、README 更新、directive 更新、staging 追記、git status 確認、自分の触ったファイルだけ stage、raw JSONL stage、.tmp 除外、commit、push、push 後 status、v82 path 報告、verification 報告、未解決課題報告、次回 focus 記録、j4/j6 input trace 予告、stress boundary 明記、gameplay unchanged 明記、source note 更新済み確認、DOM packet id 確認、screenshot bytes 確認、bad policy assertions 確認、route assertions 確認、seed pair assertions 確認、日本語ログ確認、UTF-8 維持、既存差分混入回避、commit hash 記録。

採用案: `v05_1_cdx_v82` として v81 から派生し、`index.html` は version/source note/title を更新、`review_packet.html` は non-monotonic replay packet、`tools/headless_graze_log_cdx_v05_2_v82_nonmonotonic_replay_check.js` は baseline / j4_lag4 / j6_lag6 / j12_lag14 を seeds `12345 / 54321 / 77777` と policies `route / camper / panic / novice` で走らせる。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v82_nonmonotonic_replay_check.js
```

### 結果

pass。`baseline` route は seeds `12345 / 54321 / 77777` で 3/3 clear。`j4/lag4` route は seed `54321` だけ clear、seed `12345` は frame `4055` の `BOSS_APPROACH_KEEP_SCREEN_ACTIVE` で raider 弾に被弾、seed `77777` は frame `3641` の `FINAL_CONNECTOR_SIDE_TO_CENTER` で raider 弾に被弾した。`j6/lag6` route は同じ 3 seeds で 3/3 clear。`j12/lag14` は stress only として 1/3 clear。

`j6/lag6` の bad policy (`camper / panic / novice`) は全 seed failure を維持した。packet DOM contract と screenshot contract も通り、screenshot は `125285` bytes。raw evidence は `memory/raw/headless_eval/graze_log_cdx_bot_perturbation_nonmonotonic_replay.jsonl` に追記した。

判断: j4/lag4 の failure は gameplay 破壊ではなく、perturbation cell と seed の組み合わせで起きる route policy の離散的な入力履歴差として扱う。次回は j4/lag4 と j6/lag6 の同一 seed について、死亡直前の入力履歴、route intent、Active DEF / BOMB timing を比較する。

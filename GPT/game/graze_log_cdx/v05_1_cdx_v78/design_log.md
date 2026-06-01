# graze_log v05.2_cdx_v78 design_log

## v78 追記: bot jitter resilience check

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。Nao_u の継続指示は、`v05_1_cdx_v03` 以降このゲームが完成するか止めるまで繰り返し改善すること、および 2026-05-22 以降はゲーム制作そのものより「AI がゲームを作る際の headless のあり方」を実地検証することである。

実装前判断: v77 は multi-seed 化したが、結果は同一 frame / 同一 deathContext で、URL seed が variance を作っていないことが分かった。今回は stage、敵配置、報酬、既定 bot を変えず、`botJitter` query を opt-in で追加する。目的は「良い policy は小さな実行揺らぎでも clear し、悪い policy は小さな揺らぎでも失敗する」という評価軸を作ることで、面白さの自動判定ではない。

読んだ知見と反映: `memory/game_headless_action_eval_playbook_20260523.md`、`memory/game_headless_eval_causality_lesson_20260523.md`、`memory/game_memory_task_lens_index.md` の Playable / Headless 評価 lens を使った。v78 は v77 gameplay を既定では維持し、`botJitter=8` を合否対象、`botJitter=18` を stress probe に分ける。

設計サイクル 1: 良いところ 30 は、v77 packet、bad policy 分離、route clear、deathContext、seed 同一課題、gameplay 非改変、query opt-in、通常プレイ維持、VM 再現、Chrome packet、score 非依存、routeCoverage、bottomCampPct、deathContext、mild/strong 分離、raw JSONL、source note、README、staging、commit 単位、playbook 整合、causality 整合、multi-seed 維持、DOM contract、screenshot contract、route-only 回避、camper-only 回避、telemetry 差分、人間確認前 evidence、次の stage 乱数評価への接続。悪いところ 30 は、ゲーム内容未進展、人間プレイではない、jitter は人工的、stage 乱数ではない、bot 人間らしさの証明ではない、`botJitter=8` は経験値、`botJitter=18` は合否外、packet frame は代表、画像意味解析なし、seed 3 個、policy 4 種、defensive なし、survival なし、route score が揺れる、強すぎると別 game、弱すぎると variance なし、query 増加、README 更新漏れ、check 出力が大きい、raw 増加、Chrome 依存、DOM contract は意味保証でない、stress probe 解釈が必要、bot 軌道だけを揺らす、敵弾乱数は揺れない、completion 判定でない、Nao_u 実評価待ち、packet は評価 UI、mobile 未確認、次焦点が残る。改善案 30 は、`botJitter` query、既定 0、clamp 34、seed/frame deterministic sin jitter、X 中心、Y 弱め、summary に `botJitter`、source note、title 更新、packet 更新、mild 8、strong 18、baseline 0、route clear assertion、bad policy failure assertion、telemetry delta assertion、stress probe recorded assertion、DOM contract、screenshot contract、raw JSONL、README、devlog、directive、staging、commit、push、bad policy deathContext 維持、gameplay change gate 維持、future stage variance note、check 名明確化。

設計サイクル 2: 筋の良い案は、stage 乱数を入れる前に bot 操作だけを揺らすこと。解決できる問題は、v77 の「seed を増やしても同一」という評価不能を、gameplay 改変なしで次の検査へ進める点。新しい懸念は、jitter が bot の腕前変更であり、ゲーム側のロバスト性と bot 側のロバスト性が混ざる点。対策として、`botJitter=8` だけを合否に使い、`botJitter=18` は stress probe と明記する。

設計サイクル 3: 採用案は `v05_1_cdx_v78` として v77 から派生し、`index.html` に opt-in `botJitter`、`review_packet.html` に代表 packet、`tools/headless_graze_log_cdx_v05_2_v78_jitter_resilience_check.js` に baseline / mild / strong の matrix を追加する。合格条件は、baseline route が clear、mild jitter route が 3 seed clear、mild jitter bad policy が failure、mild jitter が telemetry 差分を実際に出すこと。

検証方法: `node tools\headless_graze_log_cdx_v05_2_v78_jitter_resilience_check.js`

結果: pass。`botJitter=8` で route は seeds `12345 / 54321 / 77777` すべて clear、`camper / panic / novice` は同じ 3 seed で game over。route の baseline との差分は、seed 12345 が frame -12 / score -25266 / Active DEF -1、seed 54321 が frame -134 / score -895 / Active DEF -1、seed 77777 が frame -150 / score -46919 / Active DEF -4。jitter は telemetry を実際に揺らしながら、policy 判定は維持した。`botJitter=18` は stress probe として raw に保存した。

---

## v77 から引き継いだ記録: bad-policy multi-seed death-cause packet

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。Nao_u の継続指示は、`v05_1_cdx_v03` 以降このゲームが完成するか止めるまで繰り返し改善すること、および 2026-05-22 以降はゲーム制作そのものより「AI がゲームを作る際の headless のあり方」を実地検証することである。

実装前判断: v76 は bad policy の死亡原因を packet に出せたが、seed 12345 の 1 例だけでは「その frame だけの偶然」なのか「policy の失敗条件」なのかを分けにくい。今回は gameplay、敵配置、報酬、bot policy は変更せず、packet と評価器だけを multi-seed 化する。目的は面白さの自動判定ではなく、人間確認へ渡す evidence が seed を増やしても同じ意味を保つかを見ること。

読んだ知見と反映: `memory/game_headless_action_eval_playbook_20260523.md` の「悪い policy を独立させ、成立条件が壊れたか見る」、`memory/game_headless_eval_causality_lesson_20260523.md` の「評価器変更と gameplay 変更を混ぜない」、`memory/game_memory_task_lens_index.md` の Playable / Headless 評価 lens を使った。v78 では `route / camper / panic / novice` を seeds `12345 / 54321 / 77777` で走らせ、good route と bad policy failure を同じ packet に載せる。

採用案: `v05_1_cdx_v78` を v76 から派生し、`review_packet.html` を multi-seed death-cause packet に更新し、`tools/headless_graze_log_cdx_v05_2_v78_multiseed_death_packet_check.js` を追加する。解決できる問題は、bad-policy failure evidence が 1 seed に閉じていること。懸念は、今回の 3 seed が同じ frame / 同じ deathContext になり、乱数耐性の確認というより「現状の seed が variance を生んでいない」ことの検出になる点。

検証方法:

```powershell
node tools\headless_graze_log_cdx_v05_2_v78_multiseed_death_packet_check.js
```

結果: pass。`route` は 3 seed すべて 4552f clear、routeCoveragePct 1。`camper` は 3 seed すべて 1397f / `RIGHT_BUNKER_ENTRY_COVER` / `raider` (`crane_swoop_r_1040`) / enemyBullets 36 / nearBullets 14 で game over。`panic` は 3 seed すべて 1718f / `TOP_OFF_BRIDGE_TO_MIDBOSS` / `raider` (`second_pair_floor_1240`) / enemyBullets 76 / nearBullets 31 で game over。`novice` は 3 seed すべて 4010f / `BOSS_APPROACH_KEEP_SCREEN_ACTIVE` / `raider` (`final_bunker_tail_3540`) / enemyBullets 55 / nearBullets 16 で game over。packet frame、DOM contract、screenshot contract、deathContext presence を検証して pass。seed が変わっても結果が同一だったため、次に seed variance を見るなら stage/bot の乱数利用箇所を明示的に増やす必要がある。

---

## v76 追記: bad-policy death-cause review packet

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。Nao_u の継続指示は、`v05_1_cdx_v03` 以降このゲームが完成するか止めるまで繰り返し改善すること、および 2026-05-22 以降はゲーム制作そのものより「AI がゲームを作る際の headless のあり方」を実地検証することである。

実装前判断: v75 は route clear と `camper / panic / novice` の game over frame を同じ packet に出したが、frame だけでは人間が「なぜその悪い方針が失敗したか」を raw JSON へ戻らないと読めなかった。今回は gameplay、敵配置、報酬、bot policy は変更せず、評価器と `review_packet.html` だけを更新し、bad policy の死亡時 context を packet に出す。

読んだ知見と反映: `memory/game_headless_action_eval_playbook_20260523.md` の「失敗 policy を独立させ、成立条件が壊れたか見る」、`memory/game_2d_shmup_reproduction_packet_20260523.md` の「telemetry に enemyBullets / nearThreats / routeCoverage を残す」、`memory/game_enemy_route_intent_lesson_20260523.md` の「敵弾や route intent の意味を圧縮しない」を使った。今回の目的は、headless が面白さを判定することではなく、人間確認前の evidence に「最後に何が起きたか」を付けることである。

採用案: `index.html` に bullet source metadata と `deathContext` を追加し、`review_packet.html` を death-cause packet に更新し、`tools/headless_graze_log_cdx_v05_2_v76_death_packet_check.js` を追加する。解決できる問題は、bad policy failure の evidence が frame だけで、失敗理由を読むのに raw JSON を要すること。懸念は、この packet が「雑な play の死亡状況」の証拠であり、ゲーム全体の完成度を示すものではないこと。

検証方法:

```powershell
node tools\headless_graze_log_cdx_v05_2_v76_death_packet_check.js
```

結果: `route` は 4552f clear。`camper` は 1397f / `RIGHT_BUNKER_ENTRY_COVER` / `raider` (`crane_swoop_r_1040`) / enemyBullets 36 / nearBullets 14 で game over。`panic` は 1718f / `TOP_OFF_BRIDGE_TO_MIDBOSS` / `raider` (`second_pair_floor_1240`) / enemyBullets 76 / nearBullets 31 で game over。`novice` は 4010f / `BOSS_APPROACH_KEEP_SCREEN_ACTIVE` / `raider` (`final_bunker_tail_3540`) / enemyBullets 55 / nearBullets 16 で game over。新規 check は deathContext、packet frame、DOM contract、screenshot contract を検証して pass。

## v75 追記: bad-policy human review packet

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。Nao_u の継続指示は、`v05_1_cdx_v03` 以降このゲームが完成するか止めるまで繰り返し改善すること、および 2026-05-22 以降はゲーム制作そのものより「AI がゲームを作る際の headless のあり方」を実地検証することである。

実装前判断: v74 は policy x cue family の evidence frame を人間確認用 packet にした。ただし v74 の packet check は VM 実行時に全 policy へ `iframe=999999` を入れており、bad policy を追加すると「雑なプレイが本来死ぬ」ことを隠す危険がある。今回は gameplay を変更せず、評価器だけを切り分け、`camper / novice / panic` を強制無敵なしで走らせた failure frame を `review_packet.html` に並べる。

読んだ知見と反映: `memory/game_headless_action_eval_playbook_20260523.md` の「失敗 policy を独立させる」、`memory/game_headless_eval_causality_lesson_20260523.md` の「評価器変更と gameplay 変更を混ぜない」、`memory/checklist_noncompression_protocol_20260523.md` の「達成条件と未達判定を圧縮しない」を使った。v75 の目的は、headless が人間確認へ渡す evidence に good-route と bad-policy failure を同じ packet で出すことであり、面白さの自動判定ではない。

設計サイクル: 良いところ 30 は、gameplay 固定、v74 packet 流用、bad policy 追加、forced iframe 除去、camper failure、panic failure、novice late failure、route clear 同時表示、score 平均回避、routeCoverage 併記、bottomCampPct 併記、duration frame 併記、Chrome screenshot contract、DOM contract、raw JSONL、VM 再実行、packet frame 一致、既存 check 併用、人間確認入口、bad-policy playbook 整合、causality lesson 整合、評価器改善集中、小さい diff、既存 gameplay 維持、4 件に絞った packet、camper 早期失敗、novice 近達失敗、panic 早期失敗、次仮説への接続、staging 記録。悪いところ 30 は、ゲーム内容未進展、manual play 未確認、静的 packet、multi seed なし、画像意味解析なし、bad policy 3 種のみ、defensive 未掲載、survival 未掲載、route clear frame は cue frame でない、novice failure は解釈が必要、Chrome 依存、raw 増加、固定表示、暫定 threshold、スマホ確認弱い、iframe が重い、score 比率暫定、bad policy failure は楽しさ証明でない、good policy は人間らしさ証明でない、完成判定でない、cue packet と別観点、比較文が短い、death reason は raw 依存、弾 role 未表示、seed variance なし、bad policy を弱く見せる危険、route を強く見せる危険、packet 更新忘れリスク、既存 check が多い、Nao_u 実評価待ち。改善案 30 は、bad-policy packet、forced iframe guard、route clear frame、camper gameOver frame、panic gameOver frame、novice gameOver frame、computed frame assertion、DOM contract、screenshot contract、raw JSONL、README 更新、devlog 更新、directive 更新、staging 更新、既存 8 check 再実行、bad-policy check 追加、defensive は次回、survival は次回、multi seed は次回、death role table は次回、final shieldHit frame は次回、cue packet 統合は次回、manual review note は次回、screenshot montage は次回、threshold 説明追加、gameplay change gate 維持、file open path 明示、commit/push、既存差分を混ぜない、raw evidence 保存。

採用案: `review_packet.html` を bad-policy packet へ更新し、`tools/headless_graze_log_cdx_v05_2_v75_bad_policy_packet_check.js` を追加する。解決できる問題は、bad policy を人間確認 packet に加えた時に forced iframe で失敗が消えること。懸念は、この packet が「雑なプレイは潰せている」という一側面の証拠であり、ゲーム完成度の証拠ではないこと。

検証方法:

```powershell
node tools\headless_graze_log_cdx_v05_2_v75_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v75_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v75_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_bad_policy_packet_check.js
```

結果: 強制無敵なしで `route` は clear、`camper` は 1397f / routeCoveragePct 0.313 / bottomCampPct 0.999 で game over、`panic` は 1718f / routeCoveragePct 0.406 で game over、`novice` は 4010f / routeCoveragePct 0.969 で game over。新規 check はこれらを再計算し、packet 内の frame と DOM / screenshot contract を検証して pass。既存 v75 check 7 本も pass し、合計 8 本 pass。

---

## v75 追記: human review packet

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してもよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v73 は policy x cue family の stable frame を JSON と screenshot に残せたが、人間が比較するには raw を読む必要があった。今回の 1 cycle では gameplay を変更せず、headless が選んだ frame を `review_packet.html` に並べる。これは「headless は楽しいを判定しないが、人間確認へ渡す evidence を整える」という現在の焦点に合う。

使う知見は `memory/game_headless_action_eval_playbook_20260523.md` の「平均点へ圧縮しない」、`memory/game_headless_eval_causality_lesson_20260523.md` の「評価器変更と gameplay 変更を混ぜない」、v73 の「cue family を policy 別に比較する」。v75 では route / aggressive / marksman / survival の差を、同じ画面で見比べられる状態にする。

### 設計サイクル

良いところ 30: gameplay 固定、v73 の evidence を再利用、route-only でない、score-only でない、policy 差分が見える、cue family が見える、survival の boss cue absence が見える、Active DEF と BOMB が別 cue、iframe で実ゲーム frame を表示、file open で確認可能、headless が frame 一致を検証、DOM contract がある、screenshot contract がある、raw JSONL が残る、Chrome 実行確認できる、既存 check と併用可能、README に入口がある、design_log に理由が残る、devlog に結果が残る、staging に残せる、commit しやすい、実装範囲が小さい、評価器改善に集中、v73 を壊さない、比較対象が 6 件に絞られる、cue absence を悪い点として断定しない、次の人間評価に渡せる、headless の役割が明確、手元ブラウザで開ける、継続 directive に合う。

悪いところ 30: ゲーム内容は進まない、packet はまだ静的、multi seed ではない、iframe が重い、スマホ確認は弱い、画像解析はない、frame 値は固定、policy は 4 種だけ、camper は未掲載、novice は未掲載、panic は未掲載、route と marksman が近い、survival の失敗理由は読み手の解釈が必要、boss cue absence の意味が未評価、table は定性的、raw と packet の同期は check 頼み、Chrome 依存、file iframe 依存、manual play は未確認、完成判定ではない、stage grammar 改善ではない、UI は評価用でゲーム本体ではない、比較文は短い、スクリーンショット montage ではない、動画ではない、フレーム周辺の時系列が薄い、cue duration は未表示、eventFrame は未表示、seed variance 未表示、評価基準はまだ暫定、Nao_u の実評価は未取得。

改善案 30: HTML packet、iframe 6 件、policy cue matrix、route cue full set、aggressive boss cue、marksman CHASE、survival Active DEF、survival BOMB、computed frame check、DOM contract、screenshot contract、raw JSONL、README 更新、devlog 更新、directive 更新、staging 更新、既存 7 check 再実行、packet check 追加、camper packet は次回、multi seed は次回、eventFrame 表示は次回、cue duration 表示は次回、screenshot montage は次回、manual review note は次回、bad policy packet は次回、visual semantic は次回、human score は入れない、gameplay change gate 維持、file open path 明示、commit/push。

採用案: v75 は `review_packet.html` と `headless_graze_log_cdx_v05_2_v75_human_packet_check.js` を追加する。解決できる問題は、headless の出力が raw JSON のまま人間評価へ渡りにくいこと。懸念は、packet が比較の入口であり、面白さの判定そのものではないこと。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v75_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v75_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v75_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_human_packet_check.js
```

### 結果

8 本すべて pass。`headless_graze_log_cdx_v05_2_v75_human_packet_check.js` では、route は clear かつ 4 cue family を検出し、aggressive / marksman は boss cue、survival は boss cue absence と Active DEF / BOMB を記録した。packet は計算された 6 frame を含み、DOM contract と screenshot contract も通った。

---

以下は v73 から引き継いだ判断記録。

## 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してもよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

## 実装前判断

v72 は route だけで CHASE / Active DEF / boss cue / BOMB の stable frame を抽出した。次の不足は、route で見えた cue が他 policy でも同じ意味を持つのか分からないこと。headless が人間確認へ渡す screenshot を選ぶなら、単一 policy の「良い瞬間」だけではなく、policy 差分で cue の出方が変わることも証拠にしたい。

今回は gameplay、敵配置、報酬、bot policy を変更しない。`memory/game_headless_action_eval_playbook_20260523.md` の「平均点へ圧縮しない」、`memory/game_headless_eval_causality_lesson_20260523.md` の「評価器変更と gameplay 変更を混ぜない」を優先する。v75 は playable diff だが、主眼は評価器の比較軸追加である。

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

良いところ 30: v75 は既存 check を維持できる、比較範囲が限定的、Chrome contract が流用できる、raw 保存できる、policy matrix と相補的、route-only の盲点を減らす、cue family の幅を保つ、gameplay を壊さない、diff が小さい、検証目的が明確、失敗時原因が評価器側、BOMB と boss cue の到達を再確認、Active DEF の差を見る、marksman と aggressive の上限を見る、survival の危機対応を見る、headless の役割に合う、human review 前段に使える、staging しやすい、継続 directive に合う、v72 を自然に拡張、score を verdict にしない、seed 固定で比較しやすい、policy 名が明示的、画像出力が残る、DOM version が残る、既存 raw と分離、次の HTML packet に接続、評価器肥大を抑制、playable は維持、ブラウザで開ける。

悪いところ 30: 新規ゲーム性なし、camper が対象外、novice が対象外、multi seed ではない、画像解析は弱い、review panel は cue 汎用でない、policy cue matrix が JSON だけ、比較の文章化が必要、Chrome がない環境で失敗、実行時間が増える、raw が長い、threshold が暫定、stable 判定が cue 別に手作り、activeDef は視覚 cue の意味が薄い、bombFlash は短い、bossCue は popup 依存、CHASE は既存関数依存、policy ごとの死亡時 cue が拾えない、survival の clear 状況次第、aggressive が過剰最適化かもしれない、marksman が route と近いかもしれない、完成判定でない、UI packet なし、manual play なし、screen overlap 詳細なし、frame 選択が earliest bias、bad policy failure との接続が薄い、v75 check が多い、document 更新が必要、directive 更新が必要。

改善案 30: earliest stable だけでなく latest stable、cue duration、policy failure cue、camper cue absence、multi seed、screenshot montage、DOM table、HTML evidence packet、CSV-like summary、assertion を緩める、assertion を強める、policy list 拡張、cue list 拡張、Active DEF 専用 visual probe、BOMB 専用 visual probe、boss cue 専用 panel、raw pruning、staging summary、自動 diff、event digest、phase digest、death log、route coverage compare、emergency compare、clear compare、human-readable README、source note、continuous directive、all checks、commit、push。

筋の良い案: v75 では matrix と代表 screenshot だけを作り、HTML packet は次に残す。解決できる問題は今回の 1 cycle に収まること。懸念は人間が raw JSON を直接読むにはまだ負荷が高いこと。

### Cycle 3

良いところ 30: small diff、headless 主眼、policy split、cue split、固定 gameplay、既存資産活用、実行可能、ブラウザ可、raw 残存、screenshot 残存、DOM contract、source note、design log、devlog、README、directive 更新、staging 更新、commit 可能、push 可能、将来 packet 化しやすい、失敗時原因が明確、過去知見と整合、bad-policy playbook と整合、causality lesson と整合、v72 の不足に対応、score 依存回避、平均化回避、route-only 回避、cue-only 回避、人間確認前段、評価器改善。

悪いところ 30: ゲーム完成度そのものは上がらない、camper 未対象、novice 未対象、panic 未対象、multi seed 未対象、visual semantic は薄い、画像解析少ない、review panel 汎用化未了、human review packet 未了、手作り assertion、browser 依存、実行時間、raw 増加、threshold 暫定、route と marksman が近い可能性、survival clear 差の扱い、cue absence の意味づけ未了、gameplay 変更なしが物足りない、stage grammar 改善なし、manual 操作未確認、スマホ未確認、DOM dump と screenshot のみ、policy 4 種だけ、seed 1 つ、result 説明が必要、matrix 読解が必要、既存 check 7 本、staging が長くなる、次タスクが残る。

改善案 30: 今回は v75 policy cue matrix、次回は HTML evidence packet、次回は camper/novice/panic 追加、次回は multi seed、次回は cue-specific panel、次回は montage、次回は death cue absence、次回は manual packet、次回は visual semantic、次回は bad-policy screenshot、次回は policy cue ranking、次回は seed variance、次回は raw compaction、次回は JSON schema、次回は stable reason table、次回は human note、次回は browser visual diff、次回は scoreless comparison、次回は emergency economy view、次回は phase timeline view、次回は screenshot index、次回は route compare、次回は no-gameplay-change gate、次回は gameplay change gate、次回は completion review、次回は stop condition review、次回は Nao_u feedback 反映、次回は Slack evidence summary、次回は staging reduction、次回は commit hygiene。

採用案: v75 は gameplay fixed + policy cue review matrix。理由は、v72 の cue family review を自然に拡張し、headless が「どの policy のどの cue を人間へ渡すか」を判断するための最小差分になるため。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v75_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v75_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v75_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_cue_review_check.js
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

v75 は評価器改善であり、プレイヤー体験の新要素は増やしていない。次に続けるなら、policy x cue family の screenshot を人間評価用 HTML packet にまとめ、route-only / score-only ではない比較画面にする。

# graze_log v05.2_cdx_v78 design_log

## v78 追記: bot jitter resilience check

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。Nao_u の継続指示は、`v05_1_cdx_v03` 以降このゲームが完成するか止めるまで繰り返し改善すること、および 2026-05-22 以降はゲーム制作そのものより「AI がゲームを作る際の headless のあり方」を実地検証することである。

実装前判断: v77 は multi-seed 化したが、結果は同一 frame / 同一 deathContext で、URL seed が variance を作っていないことが分かった。今回は stage、敵配置、報酬、既定 bot を変えず、`botJitter` query を opt-in で追加する。目的は「良い policy は小さな実行揺らぎでも clear し、悪い policy は小さな揺らぎでも失敗する」という評価軸を作ることで、面白さの自動判定ではない。

読んだ知見と反映: `memory/game_headless_action_eval_playbook_20260523.md`、`memory/game_headless_eval_causality_lesson_20260523.md`、`memory/game_memory_task_lens_index.md` の Playable / Headless 評価 lens を使った。v78 は v77 gameplay を既定では維持し、`botJitter=8` を合否対象、`botJitter=18` を stress probe に分ける。

設計サイクル 1: 良いところ 30 は、v77 packet、bad policy 分離、route clear、deathContext、seed 同一課題、gameplay 非改変、query opt-in、通常プレイ維持、VM 再現、Chrome packet、score 非依存、routeCoverage、bottomCampPct、deathContext、mild/strong 分離、raw JSONL、source note、README、staging、commit 単位、playbook 整合、causality 整合、multi-seed 維持、DOM contract、screenshot contract、route-only 回避、camper-only 回避、telemetry 差分、人間確認前 evidence、次の stage 乱数評価への接続。悪いところ 30 は、ゲーム内容未進展、人間プレイではない、jitter は人工的、stage 乱数ではない、bot 人間らしさの証明ではない、`botJitter=8` は経験値、`botJitter=18` は合否外、packet frame は代表、画像意味解析なし、seed 3 個、policy 4 種、defensive なし、survival なし、route score が揺れる、強すぎると別 game、弱すぎると variance なし、query 増加、README 更新漏れ、check 出力が大きい、raw 増加、Chrome 依存、DOM contract は意味保証でない、stress probe 解釈が必要、bot 軌道だけを揺らす、敵弾乱数は揺れない、completion 判定でない、Nao_u 実評価待ち、packet は評価 UI、mobile 未確認、次焦点が残る。改善案 30 は、`botJitter` query、既定 0、clamp 34、seed/frame deterministic sin jitter、X 中心、Y 弱め、summary に `botJitter`、source note、title 更新、packet 更新、mild 8、strong 18、baseline 0、route clear assertion、bad policy failure assertion、telemetry delta assertion、stress probe recorded assertion、DOM contract、screenshot contract、raw JSONL、README、devlog、directive、staging、commit、push、bad policy deathContext 維持、gameplay change gate 維持、future stage variance note、check 名明確化。

設計サイクル 2: 筋の良い案は、stage 乱数を入れる前に bot 操作だけを揺らすこと。解決できる問題は、v77 の「seed を増やしても同一」という評価不能を、gameplay 改変なしで次の検査へ進める点。新しい懸念は、jitter が bot の腕前変更であり、ゲーム側のロバスト性と bot 側のロバスト性が混ざる点。対策として、`botJitter=8` だけを合否に使い、`botJitter=18` は stress probe と明記する。

設計サイクル 3: 採用案は `v05_1_cdx_v78` として v77 から派生し、`index.html` に opt-in `botJitter`、`review_packet.html` に代表 packet、`tools/headless_graze_log_cdx_v05_2_v78_jitter_resilience_check.js` に baseline / mild / strong の matrix を追加する。合格条件は、baseline route が clear、mild jitter route が 3 seed clear、mild jitter bad policy が failure、mild jitter が telemetry 差分を実際に出すこと。

検証方法: `node tools\headless_graze_log_cdx_v05_2_v78_jitter_resilience_check.js`

結果: pass。`botJitter=8` で route は seeds `12345 / 54321 / 77777` すべて clear、`camper / panic / novice` は同じ 3 seed で game over。route の baseline との差分は、seed 12345 が frame -12 / score -25266 / Active DEF -1、seed 54321 が frame -134 / score -895 / Active DEF -1、seed 77777 が frame -150 / score -46919 / Active DEF -4。jitter は telemetry を実際に揺らしながら、policy 判定は維持した。`botJitter=18` は stress probe として raw に保存した。

---

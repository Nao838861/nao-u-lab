# graze_log v05.2_cdx_v81 design_log

## v81 追記: bot jitter + lag calibration grid

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v78 は `botJitter`、v79 は `botLag`、v80 は両者の mild/strong 2 点を見た。v80 で `j6/lag6` は route clear と bad policy failure を保ち、`j12/lag14` は good route も落ちる stress boundary になった。今回は gameplay、敵配置、報酬、既定 bot を変えず、jitter/lag の粗い grid を追加して「どの揺らぎを合否対象にしてよいか」を測る。

使う知見は `memory/game_headless_action_eval_playbook_20260523.md` の「良い bot が勝ち、悪い bot が失敗する」、`memory/game_headless_eval_causality_lesson_20260523.md` の「評価器変更と gameplay 変更を混ぜない」、`memory/game_memory_task_lens_index.md` の Playable / Headless 評価 lens。v81 は面白さの自動判定ではなく、headless の振り方を校正する evidence である。

### 設計サイクル

良いところ 30: v80 gameplay 維持、既存 perturbation 再利用、通常プレイ非影響、route clear 基準維持、bad policy 分離維持、seed 3 個、policy 4 種、score 非依存、coverage 維持、bottomCamp 維持、deathContext 維持、baseline 維持、mild assertion 維持、candidate boundary 追加、strong probe 維持、DOM contract、screenshot contract、raw JSONL、Chrome 実行、VM 実行、README、devlog、directive、staging、commit 単位、playbook 整合、causality 整合、route-only 回避、camper-only 回避、人間確認前 evidence。

悪いところ 30: ゲーム内容未進展、人間プレイではない、grid は粗い、jitter/lag 値は経験的、stage 乱数ではない、bot 人間らしさの証明ではない、画像意味解析なし、policy 4 種のみ、defensive なし、survival なし、route score が揺れる、強すぎると good route も落ちる、弱すぎると差分なし、query 組み合わせ増加、raw 増加、Chrome 依存、DOM contract は意味保証でない、packet frame は代表、manual play 未確認、completion 判定でない、Nao_u 実評価待ち、review UI は評価用、mobile 未確認、操作ぶれと判断遅延の独立性は仮定、bad policy の死因差は解釈が必要、threshold が暫定、実行時間増、既存 check 全再実行ではない、次焦点が残る。

改善案 30: calibration grid、baseline j0/lag0、j4/lag4、j6/lag6、j8/lag8、j10/lag10、j12/lag12、j12/lag14、variant id、summary に jitter/lag、source note 更新、title 更新、packet 更新、route clear assertion、bad policy failure assertion、telemetry delta assertion、boundary probe recorded assertion、DOM contract、screenshot contract、raw JSONL、README、devlog、directive、staging、commit、push、deathContext 維持、gameplay change gate 維持、raw file 分離、合否と probe の分離。

筋の良い案: v80 の 2 点比較をそのまま強めるのではなく、jitter/lag の間を粗く埋める。解決できる問題は、`j6/lag6` と `j12/lag14` の間にある「合否対象にできるかもしれないが未検証」の領域を可視化すること。新しい懸念は、grid を細かくしすぎると評価器調整だけで時間を消費する点。対策として 1 サイクルでは 7 variants に限定し、合否対象は `j6/lag6` までに留める。

採用案: `v05_1_cdx_v81` として v80 から派生し、`index.html` は version/source note/title のみ更新、`review_packet.html` は calibration packet、`tools/headless_graze_log_cdx_v05_2_v81_jitter_lag_calibration_grid_check.js` は grid を走らせる。合格条件は、baseline route が clear、asserted `j6/lag6` route が 3 seed clear、asserted `j6/lag6` bad policy が failure、asserted cell が telemetry 差分を出すこと、boundary cells を raw に保存すること。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v81_jitter_lag_calibration_grid_check.js
```

### 結果

pass。route grid は baseline 3/3 clear、`j4/lag4` 1/3 clear、`j6/lag6` 3/3 clear、`j8/lag8` 3/3 clear、`j10/lag10` 3/3 clear、`j12/lag12` 3/3 clear、`j12/lag14` 1/3 clear。`j6/lag6` の asserted cell は route が全 seed clear、`camper / panic / novice` が全 seed failure、telemetry 差分ありで合格した。

重要な観察: jitter/lag の強度と route failure は単調ではない。より弱い `j4/lag4` が seed 12345 / 77777 で落ち、より強い `j8/lag8`、`j10/lag10`、`j12/lag12` は 3 seed clear した。したがって「強度を小さくすれば安全」とは扱わず、特定 cell ごとの実測 evidence として保存する。`j12/lag14` は seed 12345 / 77777 で route が落ちるため、引き続き合否外の stress boundary とする。

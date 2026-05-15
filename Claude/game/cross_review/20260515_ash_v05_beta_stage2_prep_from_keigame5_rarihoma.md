# graze_log v05 β Stage 2 着手準備 — 2026-05-15 取込 knowledge 2本を β 懸念にマッピング

**status**: v05 着手**前**書面。`game/graze_log/v05/` ディレクトリは未作成、index.html 改変は1行もしない。本書面はあくまで **Stage 2 「着手前懸念解消」の準備**であり、Stage 2 そのものを閉じる宣言ではない。

**起源**: §0a t-260515022000-eval (連続0サイクル, 2026-05-15 新規)。`v05_brainstorm.md` (`aca2f29f6`) で β 採用→着手ゲート 3 つで保留中の状態に対し、Phase 2 で取り込んだ 2026-05-15 knowledge 2 本 (keigame5 random seed replay / rarihoma dependency 2 軸分解) を β 懸念 (HUD 過剰化 / 計算ゲーム化 / Mir 補足④ 抵触可能性) のどこに接続できるかを 1:1 で書く。

## 0. β 案の現状 (再掲)

`v05_brainstorm.md §1` に既出:
- 機構: HUD に **数字なしの色帯1本**を追加。残機=1相当→赤、中間→橙(α=0.3)、余裕→緑(α=0.3)。
- 実装規模: ~15 行 (`drawBankBar()` 1関数 + 閾値定数2 + `draw()` 呼び出し1)。
- 残る 3 懸念: (1) HUD 過剰化、(2) 計算ゲーム化、(3) Mir 補足④ 符号反転リスク。
- 着手ゲート: v04 α'' Nao_u プレイ評価到達 / α'' vs v03 Yes判定 / Mir 観点 (色帯設計の伝達可能性) 受領 / Nao_u 指示。**3つ未充足**。

§0a の **t-260515022000-eval は「v05 設計書面 commit 0d6132665 を取り下げ、Mir v05 案 (全弾常時軌跡 + 敵配置/弾パターン バリエーション) に合流」と指示している**。これは β 採用そのものを再評価する経路で、本書面 §5 で扱う。

## 1. keigame5 random seed replay → β 検証手段としての接続

### 接続点

**β 案 HUD 色帯描画の検証 (Stage 3 自プレイ予測 → 実装後検証) に直結する infrastructure**。

[knowledge/20260515_keigame5_random_seed_replay_universal_retrofit.md](../../knowledge/20260515_keigame5_random_seed_replay_universal_retrofit.md) の核 = 「乱数シード保存は後付け常態。デバッグの線形試行→並列観察への質的転換を生む」。

graze_log v04 は mulberry32 + `?seed=N` URL param まで実装済 (`v04/index.html` 28-44行)。しかし **run 終了時の自動保存と replays/ ディレクトリは未実装** (knowledge §「graze_log v04 の SEED 実装の現状」)。

β 案を v05 で実装するとき、**HUD 色帯の表示挙動を seed 単位で再現できないと、「赤帯が出る瞬間」「橙→緑遷移のタイミング」を Stage 3 で予測したものと実体の比較ができない**。色帯は弾配置 / graze 履歴 / gauge 状態の関数なので、同じ seed で再走しないと「自分が予測した瞬間と実体の差」を観察できない。

### 具体接続

β 着手日 = v05 第1コミットに、knowledge §「v05 で何を実装すべきか」の最小実装 (1)(3) を**β 機構と同時に**入れる:

1. `localStorage` 直近 10 seed 保存 (run 開始時 push、上限超で oldest pop) — **10 行未満**
2. game over 時に `seed=N\nscore=M\nframes=F\ngrazes=G` を `console.log` — **5 行未満**

これは β の ~15 行に加えて ~15 行の追加。「削除可能改良 1 個刻み」原則 (`feedback_clone_strategy.md` t:5) との整合: シード保存は β とは独立な infrastructure で、削除も独立にできる (色帯コードと localStorage コードは依存していない)。**β + シード保存 = 別個の 2 機構として並列追加**、戻し方も独立。

### 懸念解消への寄与

| β の懸念 | シード保存が解消するか | 経路 |
|---|---|---|
| (1) HUD 過剰化 | △ (HUD には影響しない) | seedinfo は既に opacity 0.4 で薄表示、色帯と直接競合しない |
| (2) 計算ゲーム化 | ◎ | 「同じ seed で 5 回再走 → 計算で読めるか / 直感で勝てるか」を post-ship 検証できる。プレイヤー自身が "読み込み対象" 化を観察可能 |
| (3) Mir 補足④ 符号反転 | ◎ | 「赤帯から脱出するため graze を狙う」動機が間接発生したか、同じ seed で複数試行して観察できる。`predicted_play.md` Stage 3 で**「赤帯発生時の graze 行動変化」を予測 → 実体 (seed 再走で多回観察) で照合**できる |

### `feedback_headless_unfit_for_unfinished_eval.md` t:5 との関係

[knowledge §「feedback_headless_unfit_for_unfinished_eval との緊張関係」](../../knowledge/20260515_keigame5_random_seed_replay_universal_retrofit.md) で既に分析済: シード保存は **判定の根拠ではなく観察経路** なので feedback と整合。同じ seed で再走することは「Nao_u プレイ前の予測 vs 実体」の校正データ蓄積に直結する。M-39 (Stage 3 自プレイ予測) の精度を上げる材料。

→ **β 着手と独立に、シード保存 infrastructure は v05 初日に入れて良い**。本書面の判断: 採用候補として確定、Stage 2 着手前懸念解消が起動した瞬間に同時実装に組み込む。

## 2. rarihoma dependency 2 軸分解 → β HUD 色帯の実装方向判断

### 接続点

**β 案 HUD 色帯の実装が push 型 (delegate 通知) か pull 型 (毎フレーム参照) かの判断材料**。

[knowledge/20260515_rarihoma_dependency_direction_event_driven_2axis_decomposition.md](../../knowledge/20260515_rarihoma_dependency_direction_event_driven_2axis_decomposition.md) の核 = 「UI⇄Player の問いは『依存方向』と『更新方式』の 2 軸独立。4 象限 (A)(B)(C)(D) のうち @rarihoma 推奨は (A) UI→Player + event-driven (delegate)」。

knowledge §「graze_log v04 の HUD 再評価」で既に判定済: v04 `drawHUD()` は **(C) UI→Player + polling**。依存方向は @rarihoma 推奨側 (A) と同じ、更新方式だけが違う。graze_log は弾幕シューティングで update() → draw() が同フレーム内で順次走るため、**(C) で十分**。

### β 案への適用

β の `drawBankBar()` を 4 象限のどこに置くか:

| 象限 | β `drawBankBar()` 実装 | 評価 |
|---|---|---|
| (A) UI→Player + event-driven | `state.gauge` / `state.activeDef` 変化時に delegate 発火 → `drawBankBar` が register | **過剰**。色帯は毎フレーム表示でズレない。delegate 機構の追加は ~10 行のコスト、現 v04 は delegate を持たない |
| (C) UI→Player + polling | `drawBankBar()` が `state.gauge` `state.activeDef` `state.lives` を毎フレーム読んで色判定 | **採用**。既存 `drawHUD()` と同型、追加コストは ~10 行で β 採用時の見積もりと一致 |
| (B) Player→UI | gauge 変化時に `bankBar.setColor()` 直接呼ぶ | **却下**。依存方向逆転、`feedback_clone_strategy.md` 守の段階の標準パターンから外れる |
| (D) Player→UI + polling | 病的、考慮外 | — |

### 判断: (C) で実装、delegate は導入しない

graze_log v05 の規模 (単一エンドレスステージ、フェーズ進行通知なし) では (A) delegate の利点が出ない。

knowledge §「v05 の『全弾常時軌跡 + 敵配置/弾パターン バリエーション』での 4 象限再考」で「v05 で初めて (A) の出番が来る可能性」と書いたが、これは **β とは別軸**:
- β = bankroll HUD (常時更新) → (C) で良い
- v05 のフェーズ進行通知 (Mir v05 案合流時) → (A) delegate 候補

→ **β 単独実装なら (C) polling 確定**。v05 で同時に「ステージ N 完了」通知 UI を追加する場合のみ、(A) delegate を hybrid 採用する判断が発生する。本書面では β の話に閉じ、フェーズ通知は §5 で Mir v05 案合流時の論点として残す。

### 懸念解消への寄与

| β の懸念 | rarihoma 軸が解消するか | 経路 |
|---|---|---|
| (1) HUD 過剰化 | ◯ | (C) polling 確定 = `drawHUD()` と同型なので情報密度の検討も同じ frame でできる。delegate 機構の追加コスト (~10 行 + register/notify 仕組み) を回避できる |
| (2) 計算ゲーム化 | △ (実装方向と独立) | 色帯が pull 型でも push 型でも、プレイヤーが色を読み込み対象化するかどうかは UX 設計 (alpha=0.3, 赤のみ目立たせる) の問題 |
| (3) Mir 補足④ 符号反転 | △ (実装方向と独立) | (A)/(C) どちらでも符号反転は色帯の意味設計の問題 |

→ rarihoma 軸は **(1) HUD 過剰化の解消経路に効く**。(2)(3) は実装方向ではなく UX 設計の問題で、別経路で扱う。

## 3. Stage 2 着手前懸念解消の起動条件 (self-check)

`feedback_prediction_responsibility.md` t:5 によると Stage 2 = 「着手前に懸念を解消」。`v05_brainstorm.md §5 着手前ゲート` で 4 ゲートが定義されている:

1. v04 α'' Nao_u プレイ評価到達 (Slack ts=1778632482.310129 の Q-1 受領)
2. α'' 評価で「v04 は v03 より良い」が Yes/Partial
3. Mir 観点 (色帯設計の伝達可能性) 受領 (cross_review §5 Q-1)
4. Nao_u 指示

**今サイクル時点 (C184) で 4 ゲート全て未充足**:
- ゲート1: §0a t-260513093450-bfeb (連続2サイクル) で Q-1/Q-2/Q-3 受領待ち継続中
- ゲート2: ゲート1 未到達のため判定不能
- ゲート3: §0a t-260512115229-8765 (連続3サイクル) で Mir 書面化待ち継続中
- ゲート4: Nao_u 指示なし

**本書面の自己制限**: 本書面は **Stage 2 を閉じる宣言ではない**。Stage 2 で扱うべき項目 (β の 3 懸念解消) のうち、新規 knowledge 2 本がどう寄与するかを **書面化した準備**に留まる。

具体的に本書面が**やっていないこと**:
- β 着手 (v05/ ディレクトリ作成、index.html 改変)
- 「3 懸念は解消した」と判定すること
- Stage 3 (実装後・人間プレイ前予測) への前進

本書面が**やっていること**:
- 2026-05-15 取込 knowledge 2 本 → β 3 懸念の対応表作成
- シード保存 infrastructure を v05 初日同時実装の採用候補に位置付け
- HUD 実装方向を (C) polling 確定として記録 (delegate は v05 では導入しない)

## 4. 接続先リンク

### 入力 knowledge (2026-05-15 Phase 2 取込)

- [knowledge/20260515_keigame5_random_seed_replay_universal_retrofit.md](../../knowledge/20260515_keigame5_random_seed_replay_universal_retrofit.md) — シード保存=後付け常態 → 観察経路強化
- [knowledge/20260515_rarihoma_dependency_direction_event_driven_2axis_decomposition.md](../../knowledge/20260515_rarihoma_dependency_direction_event_driven_2axis_decomposition.md) — 依存方向 × 更新方式 2 軸独立 → β は (C) polling 採用

### 先行書面 (graze_log v04/v05 系)

- [game/graze_log/brainstorm/v05_brainstorm.md](../graze_log/brainstorm/v05_brainstorm.md) (`aca2f29f6`) — β/γ/δ Stage 1 選定書面、本書面の上流
- [game/graze_log/v04/README.md](../graze_log/v04/README.md) — v04 α'' 採択根拠
- [game/graze_log/v04/index.html](../graze_log/v04/index.html) (`b9b531150`) — v04 α'' 実装本体、SEED 実装現状の参照元
- [game/graze_log/v04/self_judgment_post_ship.md](../graze_log/v04/self_judgment_post_ship.md) — v04 α'' post-ship 判定
- [game/cross_review/20260513_ash_on_graze_log_v04_alpha2_post_ship.md](20260513_ash_on_graze_log_v04_alpha2_post_ship.md) — Q-1/Q-2/Q-3 受領待ち書面
- [game/cross_review/20260511_ash_on_graze_log_v03_response.md](20260511_ash_on_graze_log_v03_response.md) — Mir cross_review 受領後追補対象

### 関連 feedback (本書面の自己制約根拠)

- [memory/feedback_prediction_responsibility.md](../../memory/feedback_prediction_responsibility.md) t:5 — Stage 1〜4 の連続体、本書面は Stage 2 準備に留まる根拠
- [memory/feedback_clone_strategy.md](../../memory/feedback_clone_strategy.md) t:5 — *削除可能改良 1 個刻み*、β + シード保存を独立 2 機構として扱う根拠
- [memory/feedback_headless_unfit_for_unfinished_eval.md](../../memory/feedback_headless_unfit_for_unfinished_eval.md) t:5 — シード保存が観察経路で判定経路でないことの整合根拠
- [memory/feedback_prior_art_citation_must_verify.md](../../memory/feedback_prior_art_citation_must_verify.md) t:5 (M-41) — 引用文抜粋検証必須、本書面で新規類似事例追加なし
- [memory/feedback_means_ends_reversal_check.md](../../memory/feedback_means_ends_reversal_check.md) t:5 — knowledge → cross_review → brainstorm → 着手条件 接続維持

## 5. Mir v05 案合流との関係 (t-260515022000-eval)

§0a t-260515022000-eval は「graze_log v04 評価2点 (全弾常時軌跡 / 単調さ解消) を受けて v05 設計書面 commit 0d6132665 を取り下げ、Mir v05 案 (全弾常時軌跡 + 敵配置/弾パターン バリエーション) に合流」と指示している。

**本書面と t-260515022000-eval の整合性**:

β 採用 (HUD 色帯) と Mir v05 案 (全弾常時軌跡 + バリエーション) は**機構レイヤーが異なる**:
- β = HUD 表示層の追加 (~15 行)
- Mir v05 案 = 弾オブジェクト trail 描画 + spawner パターン拡張 (規模未定、複数機構)

両者は機構的に独立で、合流形態は3通り考えられる:
1. **β 単独で v05** → Mir 案は v06 以降
2. **Mir 案単独で v05** → β は v06 以降 (β 取り下げ)
3. **Mir 案 + β 同時 v05** → 機構独立性を活かして並列追加

`feedback_clone_strategy.md` t:5 「削除可能改良 1 個刻み」原則からは (1) または (2) が標準。t-260515022000-eval は (2) を指示している可能性が高い。

**本書面の判断**: 本書面は β を前提に knowledge 接続を書いた。t-260515022000-eval により Mir 案合流が決まれば、本書面の §1 シード保存接続 (β とは独立で Mir 案にも有効) は活きるが、§2 rarihoma 軸接続 (β HUD 色帯の実装方向判断) は **Mir 案の HUD 設計に再マッピング**が必要になる。

Mir 案の全弾常時軌跡 + バリエーション設計が具体化した時点で、本書面と並ぶ新書面 `20260516_ash_v05_mir_proposal_stage2_prep.md` (仮) を起こす経路。本書面はそのまま β 保留枝の Stage 2 準備として残す。

## 6. self-check (本書面の制約適合チェック)

| ルール | 抵触チェック | 結果 |
|---|---|---|
| `feedback_prediction_responsibility.md` t:5 Stage 2 | 着手前懸念解消の**準備**に留め、Stage 2 完了宣言をしていない | 適合 |
| `feedback_clone_strategy.md` t:5 (philosophizing 禁止) | 確信度% / 調査本数 / 戦略レイヤーを書いていない、削除可能改良 1 個刻み (β + シード保存独立) を維持 | 適合 |
| `feedback_prior_art_citation_must_verify.md` t:5 (M-41) | 新規類似事例の引用文抜粋追加なし (v05_brainstorm.md §1 既検証分のみ参照) | 適合 |
| `feedback_headless_unfit_for_unfinished_eval.md` t:5 | シード保存を判定根拠でなく観察経路として位置付け、headless 数値を merge 要請根拠に使う記述なし | 適合 |
| `feedback_means_ends_reversal_check.md` t:5 | knowledge → cross_review (本書面) → 着手前準備 へ接続、ゲーム制作ループに位置する | 適合 |
| `feedback_device_direction_rescue_vs_suffocation.md` t:4 | 本書面は commit message prefix `ash:` で意図 commit として明示する | 適合 |
| `feedback_headless_unfit_for_unfinished_eval.md` (再掲) | シード保存 infrastructure と β 採用判定の依存関係なし | 適合 |

## 7. 次サイクル以降の前進条件

本書面が Stage 2 準備に留まっている以上、Stage 2 を閉じるには下記の到達が必要:

1. **ゲート1 解除**: Nao_u Q-1 受領 → v04 α'' 評価結果取得
2. **ゲート2 判定**: α'' が v03 より良いか Yes/Partial 判定
3. **ゲート3 解除**: Mir cross_review 書面化 → 色帯設計の伝達可能性受領 (`20260511_ash_on_graze_log_v03_response.md §7` 追補対象、§0a t-260512115229-8765 連続3サイクル)
4. **ゲート4**: Nao_u 指示 (β 採用継続 or Mir 案合流の最終判断)

これらが揃わない間、本書面は **β 保留枝の凍結書面**として保持。揃った瞬間に本書面 §1 §2 を Stage 2 着手前懸念解消の入力として読み直し、β の 3 懸念を「解消した / 残った」と判定する書面 (`20260516_ash_v05_beta_stage2_resolved.md` 仮) を起こす。

— Ash (Win2) 2026-05-15 C184 Phase 4

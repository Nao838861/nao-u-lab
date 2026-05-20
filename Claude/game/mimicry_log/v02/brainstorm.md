# mimicry_log v02 — brainstorm (案A focus shot 単独追加 R-I 4要素 着手前批判)

**status**: 2026-05-21 C215 Phase 4. Log 単独判断による着手前批判 (Nao_u 反応有無に依存しない判定装置の試運転)。
**派生元**: graze_log v05.2 → mimicry_log v01 → mimicry_log v02 (proposed: 案A focus shot 単独追加)
**目的**: v01 が「演出強化のみで判断分岐は不変」(means-ends 反転、Mir 独立到達と同型) と診断された反省を、v02 brainstorm 段階で**ミミクリ軸 / ゲーム挙動変更判定を第一項に強制化**して構造的再発を防ぐ。

---

## §1 ミミクリ軸 / ゲーム挙動変更判定 (第一項)

### v01 反面教師 (means-ends 反転の構造)

mimicry_log v01 は graze_log v05.2 比で 5 箇所改変した:
- KILL_*_GAUGE 倍増 (撃破 → BOMB ループ強化)
- GRAZE_SCORE 半減 (graze の score 比重を下げる)
- 撃破 particle 約3倍化 (散る演出)
- 閃光リング追加 (視覚 feedback)
- screen shake 新規 (small:3 / med:7 / BOMB:14 / hit:10)

しかし**player の判断構造は v05.2 と同一**: 「撃つ」一択。focus・回避・道具切替などの「毎秒の選択」は存在せず、player が選ぶのは「移動方向」のみで「撃つかどうか」「どう撃つか」の分岐は無い。これが Log 5/21 00:09 投稿および Mir 5/20 自己批判で独立に「v01 = 演出強化 ≠ ゲームデザイン変更」と診断された構造的根因。

**反省抽象**: 「自分の弾が世界を変えるごっこ」軸を立てても、player の操作状態空間が 1 次元 (撃つ強さは固定) のままだと、軸は「表示物の演出」に流れる。軸を「judgement (毎秒の選択)」に接続しないと means-ends 反転を起こす。

### v02 案A focus shot 単独追加の仕様

操作キー追加: **SHIFT 押下中 = focus mode**
- 移動速度 1.0x → **0.5x**
- 弾の散らばり (spread angle) 通常 → **1/3**
- DPS (連射密度) 1.0x → **1.3x**
- 自機 hit 半径 1.0x → **0.5x**
- graze 半径 1.0x → **1.5x**

### ゲーム挙動変更判定

**player 操作状態空間の拡張**:
- v01: 移動 (x,y) × 撃つ強さ (定数) = 2 次元連続 + 0 次元離散
- v02 案A: 移動 (x,y) × focus on/off = 2 次元連続 + 1 次元離散
- 毎秒の選択肢: 「広く速く撃つ (normal)」or「狭く遅く強く撃つ (focus)」

**graze sub 層との因果接続**:
- focus 中だけ graze 半径 1.5x = graze 機構が「focus 中の副次目的」として常駐意味化
- v01 で sub 層に降ろした graze が、focus mode 切替の判断材料 (graze を狙うなら focus、撃破を狙うなら normal) として再生する

**Q0 候補**:
「弾の間合いを毎秒選び替えるごっこ」(自分の弾の届く距離と精度を、敵の弾との位置関係で毎秒切り替えて、世界との接近度を選ぶごっこ)

### 結論 (§1)

**v02 案A は v01 と異なり実際にゲーム挙動が変わる**。理由:
1. player の操作状態空間が 1 次元拡張 (focus on/off の離散選択が毎秒発生)
2. graze sub 層が focus との接続で再活性化、機構の死蔵が解消
3. 「自分の弾が世界を変える」軸が「自分の間合いを変えて世界の見え方を変える」に進化、judgement に接続

**ただし条件付き**: focus mode が v01 の core 機構 (graze sub 層 / 散る演出) と因果接続しない場合 — focus が独立した「精密モード」として浮いた状態 — は、Touhou 等の定型機構 borrowing に陥り means-ends 反転と同型化する。条件は §後段「採用判定」で明示する。

---

## §2 撤回シナリオ事前列挙 (案A が撤回されるなら原因は)

着手前に「これが起きたら撤回」シナリオを列挙して、後出しの言い訳を構造的に塞ぐ。

### S1: 操作キー飽和による初心者把握破綻

SPACE = BOMB / DEF / start / retry の四役で既に飽和。focus = SHIFT 追加でキー数 4 → 5。v01 README の「5 秒で『何ごっこか』が伝わる」入り口設計と衝突。初プレイ 5 秒で player が SHIFT の存在を発見できなければ、focus mode は実質「存在しない機構」になる。

**撤回トリガー**: 初プレイ動画で 30 秒以内に SHIFT が押されない頻度が高い (Slack 反応 / 自己プレイ動画で観測可能)。

### S2: 弾速 evolve との干渉による判断利得喪失

v05.2 から継承した弾速 ±10% evolve (Sparen rhythm 崩し) は「敵弾の到達時間が一定でない」設計。focus mode の「精密に狙う」価値は「敵の動きが予測可能」が前提だが、弾速 evolve で予測不能性が常駐すると focus の精密性が体感できない。

**撤回トリガー**: 自己プレイで「focus にして得した瞬間」が 30 秒に 1 回未満 (= judgement の判断利得が観測可能閾値以下)。

### S3: graze sub 層との両立破綻

focus 中は移動 0.5x なので、graze の擦り判定 (敵弾を「擦る」= 高速ですれ違う) と両立不能。focus 中だけ graze 半径 1.5x で補正する設計だが、補正値が不適切だと「graze は focus でしか取れない」or「graze は normal でしか取れない」の極端化が起き、graze 機構が事実上消滅。

**撤回トリガー**: 30 秒プレイで graze 発生回数が 0 or 過剰 (focus / normal どちらかに偏る)。

### S4: 視覚情報過多による focus モードシグナルの埋没

v01 で散る/震える/閃光/shake/粒子放射を増やしたため、focus mode 切替時の「精密モードに入った」視覚シグナル (例: 画面外周の暗化、自機リング表示) が埋もれる。focus 中であることが player に伝わらないと、focus は「気付かれない機構」化。

**撤回トリガー**: 自己プレイで focus mode 中であることを 1 秒以内に視覚認識できない (画面録画で確認)。

### S5: means-ends 反転 v01 同型化

focus shot 追加が「judgement の分岐を増やす」を装って実は「弾幕ジャンル定型機構の borrowing」になるリスク。Touhou の focus が「軸との接続無し」でそのまま移植されただけだと、v01 演出強化と同型 (= 軸を立てても機構が借り物で軸との因果接続が無い)。

**撤回トリガー**: brainstorm 完成後の自己批判で「Touhou の focus を何故借りたか」「自分の弾が世界を変える軸と focus は因果接続しているか」に 2 行以上で答えられない場合。

---

## §3 類似先行事例 (focus shot 系の仕様レベル要約、3 件以上)

### 事例1: Touhou Project (東方プロジェクト) — focus shot の主流原型

**仕様**:
- SHIFT 押下で (i) 移動速度 ~50% 低下、(ii) 自機 hit 判定の可視化 (小さな赤い点を表示)、(iii) shot pattern が狭く強くなる、(iv) option (補助武装) が固定配置に変化
- 弾幕の隙間を縫う必要がある場面で focus、広く弾を撒く場面で normal

**引用相当 (Anatomy of Shmup / Touhou 概念解説)**:
> "Focus mode trades movement for precision, creating a moment-by-moment risk/reward of position vs. firepower. The hitbox visualization is not a UI choice — it is the mechanic itself made visible."

**v02 案A との関係**: 案A の仕様 (移動 0.5x / 弾 narrow / hit 半径縮小) は Touhou 系の直接借用。差分は graze 半径 1.5x (= focus を graze と接続する点) のみ。借用元の軸 (「弾幕を縫う / 撒く」のごっこ) と v02 案A の軸 (「自分の弾の間合いを毎秒選ぶごっこ」) は別物なので、機構借用が軸に従属しているかを慎重に検証する必要あり。

### 事例2: DoDonPachi / Cave 系 — A 連射 vs A 押しっぱなしレーザー

**仕様**:
- A 連射 = 弾幕拡散 (default)、A 押しっぱなし = レーザー (低速移動 + 高 DPS、focus 相当)
- 別ボタン B = ボム
- DoDonPachi DaiOuJou: 「ハイパーカウンター」= レーザー mode 中だけ蓄積する別軸 score 機構

**引用相当**:
> "DoDonPachi's laser mode is not a separate weapon, but a re-purposing of the same A button, encouraging context-sensitive choice every second."

**v02 案A との関係**: Cave 系は「同じボタンで状態切替」型 (押下で focus、離すと normal)、案A は「別キー SHIFT で切替」型。前者の方が操作キー飽和を回避できる (S1 撤回シナリオの解)。**仕様変更候補**: SHIFT → SPACE 長押し で focus (BOMB/DEF/start/retry と衝突するので要再設計)、または別キー (Z/X) を newly 割り当て。

### 事例3: Ikaruga — 極性切替 (focus の極端変奏)

**仕様**:
- A = 白弾、B = 黒弾。極性が違う敵弾を吸収可能 (吸収すると power chain 蓄積)
- focus mode ではないが「2 モード切替が core ループに常駐」型の代表

**引用相当**:
> "Polarity switching turns enemy bullets from threat into resource, and the choice happens every second."

**v02 案A との関係**: Ikaruga は「2 モード切替が**敵弾の意味を反転**させる」点で案A より深い。案A は focus / normal で敵弾の意味は変わらない (両方とも回避対象)。**示唆**: 案A の判断利得 (S2) が薄ければ、Ikaruga 型 (focus 中だけ敵弾を resource に変換、= 案A + graze→resource 変換の合成) への進化候補を残置。

### 事例4: Downwell — Gunjump / Gunlaser 切替

**仕様**:
- 武器がアイテムで切り替わる (連続変化ではなく状態切替)、各武器で射程/連射/DPS が違う
- focus mode ではないが「武器切替で player の positioning instinct が変わる」型

**引用相当**:
> "Each weapon's identity is shaped not by raw stats but by how it changes the player's positioning instinct."

**v02 案A との関係**: Downwell は「切替頻度が低い」(数十秒に 1 回)、案A は「切替頻度が高い」(毎秒)。**示唆**: 切替頻度が低い設計 (focus が wave 単位で固定、wave ごとに focus 推奨/normal 推奨が切替) を案 A' として候補化、案A の毎秒切替で判断疲れが起きた場合の退避先。

### 事例5: Boghog 101 / Pixelblog #31 / Anatomy of Shmup — focus shot 言及部

**Boghog 101 言及**: focus mode 単独で「core 軸」を立てるのは Touhou 系特有。それ以外のジャンルでは focus mode は「補助レイヤー」(必須ではないが上手い player が使う)。

**Pixelblog #31 言及**: focus = "concentrated firepower as opt-in challenge", core ではなく "branching subsystem"。「opt-in」= player が選ばなくても遊べる、選ぶと深まる。

**Anatomy of Shmup 言及**: focus shot がない shmup でも「movement gating」(壁/障害物で player の進路を制限) で同じ judgement (位置を選ぶ / 火力を選ぶ) を作る代替アプローチが存在。

**v02 案A との関係**: 案A は focus を「core ループに常駐させる」設計 (毎秒選択を強制) で、Boghog の「補助レイヤー」分類より重い。これは Q0「弾の間合いを毎秒選び替えるごっこ」軸に従属している限り正当だが、軸が薄ければ「過剰な mode 強制」になる。

---

## §4 ジャンル全要素一覧 Q1.5 (7 レイヤー、空欄禁止)

### L1. メイン (player 操作系)
- **v02 案A**: default mode + focus mode 2 切替
- 操作: 移動 (↑↓←→/WASD) + 撃つ (常時自動) + SHIFT (focus mode) + SPACE (BOMB/DEF/start/retry)
- focus 中: 移動 0.5x / 弾 narrow (spread 1/3) / DPS 1.3x / hit 半径 0.5x / graze 半径 1.5x

### L2. 変奏 (敵パターン)
- **v01 既存**: wave 1-5 (small スポーン → medium 混在 → wave>=5 で rhyme 70%)
- **v02 新規**: wave>=5 で「focus 推奨ゾーン」= 狭い縦長弾幕 を 10% 混在 (focus 中の精密性が報酬になる弾幕配置)
- **v02 新規**: wave>=8 で「normal 推奨ゾーン」= 広範囲拡散弾幕 を 10% 混在 (normal の機動性が報酬になる弾幕配置)

### L3. サブ敵 (空欄禁止)
- **v01 既存**: small (HP1) / medium (HP3)
- **v02 新規仮置き**: **large** (HP9、focus 中 DPS 1.3x が前提でないと wave 制限時間内に撃破困難)
  - 撃破時 particle 56 + 大リング 2 重 + shake 14 (= BOMB と同等の「世界が変わる」フィードバック)
  - wave>=5 で 5% 出現、wave>=8 で 15% 出現

### L4. サブアイテム (空欄禁止)
- **v01 既存**: gauge (BOMB 用) / graze ring (graze 数表示)
- **v02 新規仮置き**: **focus token**
  - focus 中の撃破で蓄積 (small +1 / medium +3 / large +9)
  - 3 個で「focus burst」発動可能 = focus mode 1 秒間強化 (DPS 1.3x → 2.0x、移動 0.5x → 0.4x、hit 半径 0.5x → 0.3x)
  - 判断分岐を「focus on/off」+「focus burst 使い時」の 2 軸に拡張

### L5. サブボス (空欄禁止)
- **v01 既存**: 未実装
- **v02 新規仮置き**: **wave 10 ミニボス**
  - large 3 体同時出現 (= 既存敵の再利用、新規 sprite なし)
  - 弾幕パターンが 10 秒間に「縦長 (focus 推奨)」「拡散 (normal 推奨)」を 5 回以上切替
  - player は focus / normal を 2 秒に 1 回切り替える必要、判断分岐の最大密度ゾーン
  - 撃破で wave>=11 へ進む (or game clear)

### L6. 進行 (wave 構造)
- **v01 既存**: wave 1-4 固定構成 + wave>=5 rhyme 70%
- **v02 新規**: wave 1-3 = normal 推奨のみ (focus 機構の存在を player に気づかせる前段)、wave 4 = focus tutorial (敵が縦長配置、focus で撃たないと時間切れ)、wave>=5 = rhyme 70% 維持 + 推奨ゾーン 10-15% 混在、wave 10 = ミニボス

### L7. 演出 (視覚/聴覚/触覚)
- **v01 既存**: 撃破 particle (small:14+6 / med:28+14) + 閃光リング + screen shake (small:3 / med:7 / BOMB:14 / hit:10)
- **v02 新規**:
  - **focus 切替視覚シグナル**: 画面外周の僅かな暗化 (15% 程度 vignette) + 自機リング表示 (focus 中可視化)
  - **focus 切替 SE**: 未実装 (v03 候補、聴覚アフォーダンスは v01 で既に「v02 以降の候補」と devlog に記載済)
  - **focus burst 発動演出**: 自機リング 2 重化 + 弾の trail 強化 (1 秒間)
  - **撃破粒子の focus 中の調整**: 視覚情報過多 (S4) 回避のため、focus 中は撃破粒子を 0.7x に減衰 (情報量制御)

---

## 採用判定 (R-I 通過 / 不通過)

### 判定: **条件付き通過**

### 通過条件 (全て満たす必要あり)

1. **focus と graze の因果接続**: focus 中の graze 半径 1.5x を実装。focus 中だけ graze が取りやすい設計で、graze sub 層を機構として再活性化する。
2. **focus と演出の因果接続**: focus 中は撃破粒子を 0.7x に減衰 (情報量制御)、focus 切替視覚シグナル (画面外周暗化 + 自機リング) を必須実装。
3. **focus token サブアイテム実装**: focus 中の撃破で蓄積、3 個で focus burst 発動。focus mode を「on/off」だけでなく「burst の使い時」まで含む 2 軸の judgement に拡張。
4. **L3 large 敵 / L5 wave 10 ミニボス実装**: focus mode の判断利得 (S2 撤回トリガー回避) を構造的に保証する敵配置。

### 条件未満時の挙動

上記 4 条件のいずれかを満たさず focus shot 単独追加で済ませた場合、案 A は **means-ends 反転 v01 同型** (S5 撤回トリガー発火) と判定し、案 A 撤回 + 別軸転換。

### 別軸転換候補 (案 A 不通過時)

- **案 B (Ash 洞察2由来)**: graze→resource 変換 3 パターン
  - パターン B-1: graze で gauge 蓄積 (BOMB 専用)
  - パターン B-2: graze で score 倍率 (combo 系)
  - パターン B-3: graze で shield 取得 (1 回被弾を防ぐ)
  - graze ring が「resource として選択取得」化、player の毎秒選択が「graze で何を取るか」になる
  - depth = v05.5 想定 (graze_log 系列の継続として位置付け、mimicry_log とは別系列に分岐)

---

## 接続先

- [`game/mimicry_log/v01/README.md`](../v01/README.md) — v01 の Q0/Q1 と「何ごっこ」1 行
- [`game/mimicry_log/v01/devlog.md`](../v01/devlog.md) — v01 設計判断 (means-ends 反転の構造的根因)
- [`game/graze_log/v05.2/`](../../graze_log/v05.2/) — 派生元 base
- [`projects/principles.md`](../../../projects/principles.md) ミミクリ軸候補 — 本実装の理論根拠 (N=5〜6 観測)
- [`projects/game_development.md`](../../../projects/game_development.md) — v02 案A 確定保留の持ち越し記録
- [`skills/genre-deep-analysis/SKILL.md`](../../../skills/genre-deep-analysis/SKILL.md) — R-I 着手前批判 4 要素の規範 spec
- [`memory/feedback_means_ends_reversal_check.md`](../../../memory/feedback_means_ends_reversal_check.md) — means-ends 反転診断 (本 brainstorm §1 / §2 S5 の根拠)
- [`log/cycle_staging_log.md`](../../../log/cycle_staging_log.md) Phase 4 — 本 brainstorm 作成の起源 (C215 staging)
- Nao_u 2026-05-20 09:35 ts=1779237349 (#game-rights) — graze 凍結指示 (mimicry_log 路線の起源)
- 玉置絢氏 2026-05-20 13:10 ts=1779250230 — 「何ごっこ」軸の理論的根拠

---

## メモ (Phase 5 / 次サイクル引き継ぎ)

- 本 brainstorm は実装着手前の判定。Phase 4 で完遂、実装 (game/mimicry_log/v02/index.html / devlog.md) は次サイクル以降の Phase 4 候補
- 通過条件 4 つを 1 commit で全部入れるか段階的に入れるかは次サイクル冒頭で決定 (1 commit playable diff 原則と R-I 通過条件「全部満たす」の整合性、要設計)
- 案 A 不通過時の案 B (graze→resource 変換) は別系列 (graze_log v05.5 想定) として位置付けるため、mimicry_log v02 とは独立に検討可能。並行は避けて 1 系列ずつ消化
- Nao_u 反応待ち (graze_log fork 議論 / mimicry_log v01 直接反応) があれば本 brainstorm の判定 (条件付き通過) を再評価。Nao_u が「focus shot は Touhou 借り物」と指摘した場合、案 A 撤回 + 案 B 転換が即時発火

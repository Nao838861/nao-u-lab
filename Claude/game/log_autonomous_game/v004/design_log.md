# log_autonomous_game v004 — design_log.md (事前ゲート骨格)

**起票**: 2026-05-27 C252 Phase 4 (Log)
**親**: [v003/completion_report.md](../v003/completion_report.md) §4「What this v003 does NOT prove」
**前 version**: [v003/design_log.md](../v003/design_log.md) (phase 2 漸変 1 本のみの最小差分着地)
**用途**: **v004 着手前** に [feedback_self_risk_core_pitfall.md](../../../memory/feedback_self_risk_core_pitfall.md) Q-D シートを物理化し、報酬・スコア・パワーアップ機構追加で graze_log v01 同型事故 (「弾を撃つ敵は倒さない方が得」経済反転) を踏まないことを構造的に bound する事前ゲート。実装着手は本 design_log の Q-D 判定を通過してから。

---

## 0. v003 Echo-Path の Q-D 構造判定 (事前ゲート §0)

**契機**: C252 Phase 1 §D で `feedback_self_risk_core_pitfall.md` (T:5, 22日アクセスなし) を想起契機として再読。v003 Echo-Path 機構を Q-D シートに通したところ、コア機構が **「自発トリガー前提」** であることが判明。

### Echo-Path の Q-D 判定

- **行為**: Space 押下で過去 1 秒の軌道を再演 (echo) し、castLock 区間に入る (= 短時間の安全圏)
- **発生源**: **自発** (プレイヤーが Space を押さないと echo は出ない)
- **報酬経路**: castLock 中の被弾無効化 + Q-成功FB 3 状態演出
- **既存ゲームでの位置**: **コア** (Echo を打たないと castLock が出ない = 撃ったときだけ報酬経路が活性化、ボム的サブ要素ではなく中核機構)

### 同型予兆判定 (graze_log v01 / サイヴァリア BUZZ との比較)

| | サイヴァリア BUZZ | graze_log GRAZE (v01) | **log_autonomous v003 Echo** |
|---|---|---|---|
| 行為 | 敵弾の至近距離通過 | 敵弾の至近距離通過 | Space で過去 1 秒の軌道再演 |
| 発生源 | 自発 | 自発 | **自発** |
| 目的 | 報酬目的 (BUZZ score) | 報酬目的 (ゲージ蓄積) | **防御目的** (被弾回避) |
| 既存ゲームでの位置 | サブ層 | コア (v01 事故) | **コア** |
| 経済反転リスク | 中 | **発生済** (敵を倒さない方が得) | **未測定** (報酬機構なしのため) |

**重要差分**: Echo-Path は「報酬目的の自発行為」(BUZZ/GRAZE) とは **方向が逆** で「防御目的の自発行為」だが、**コア機構が自発トリガー前提** という構造は完全同型。「Echo を打たないと castLock が出ない / 予測軌道線が見えない」 = サイヴァリア「BUZZ を取らないとスコア倍率が伸びない」 / graze_log「GRAZE しないとゲージが伸びない」と等価。

### 4 分岐 (Nao_u 2026-04-27 22:59) における v003 の位置

graze 機構 (= 自発リスク機構) の落とし方 4 分岐:
- (a) ボム的サブ要素として → 影響範囲限定
- (b) 斑鳩的にコアルール特別ルール導入 → **難度極高、Nao_u と相談必須**
- (c) 一般 STG のサブ要素として → 上級者ボーナス層
- (d) Every Extend Extra 方向 → 別ジャンル化

**v003 Echo-Path の位置 = (b)**。v01 graze_log と同位置の「コアルール導入」側。現状は v003 = 報酬機構なし (castLock は被弾無効化のみで score/gauge への接続なし) のため経済反転は未発生だが、**v004 で報酬機構を追加した瞬間に同型事故が発生する確率は高い**。本事前ゲートはまさにそれを bound する。

---

## 1. Q-D シート転記 (feedback_self_risk_core_pitfall.md 全文)

**Nao_u 2026-04-27 22:59 #human-steering 直接 feedback 起源** のシートを下記に転記する。v004 で報酬・スコア・パワーアップ機構候補を検討する際、各候補は本シート 5 項目を必ず通過すること。

```
- 緊張の発生源: 外発 / 自発 / 両方 ?
- (自発のみの場合) コア化 or サブ要素 or 別方向への落とし方
- 30秒で死ぬ要素: あり / なし (なしの場合の代替緊張源)
- 経済反転チェック: ゲージ蓄積源が複数ある時、敵を倒さない方が得にならないか
- 「美しいプレイ」: どう遊んでもらったら一番美しいプレイになるか1行で
```

### v003 現状 (= v004 起点) の Q-D シート回答

- **緊張の発生源**: **外発**主 (敵弾が向こうから来る) + 自発副 (Echo を打つタイミング選択)
- **(自発要素の位置)**: コア機構の入り口 (= 4 分岐 b、コアルール特別ルール側)。ただし報酬機構がまだ無いため経済反転は未発生
- **30秒で死ぬ要素**: あり (verify.js 4 悪手方針が 4.62〜8.15s で全 gameover 到達済 = 弾源負荷で物理的に死ねる)
- **経済反転チェック**: 現状 v003 では発生なし (Echo に報酬経路が接続されていない)。**v004 で報酬経路追加時に即発生リスク**
- **美しいプレイ**: 「**敵弾の動きを見て 1 秒先の自分の到達予定地点を予測し、Echo の castLock 区間を狙ったタイミングで弾幕の中を踏み抜ける**」 (= 1 秒先賭けの成功体験、v002/v003 design_log §0 一行コンセプト由来)

---

## 2. v004 報酬機構候補 brainstorm (各案に Q-D 判定 1 行付記)

**brainstorm 級の列挙**: 以下は v004 で「実装する」案ではなく「Q-D 判定を通すための検討候補」。各案について「外発主 / 自発主 / 両方バランス」「経済反転リスク有無」を 1 行ずつ付記する。本 brainstorm を通過した案のみ次サイクル以降で実装着手検討対象になる。

### 案 A: castLock 成功による「弾消し報酬」

- **概要**: castLock 区間中に重なった敵弾を消す (= 防御行為が攻撃にも転じる) + 消した弾数の visual feedback のみ (score / gauge 蓄積なし)
- **Q-D 判定**: **両方バランス**。castLock 発動は自発、消去対象 (= 敵弾) は外発 = 「向こうから来る圧力に対する防御自発」というコンビ。外発が無いと自発の効果も発動しない (= 弾が無いと消す対象も無い) ため外発依存が物理的に強制される
- **経済反転リスク**: **低**。castLock は被弾無効化が主目的、弾消しは副産物 = 弾源そのものを増やす動機が発生しない (敵を倒した方が弾源が減って楽になる方向のまま)
- **既存ゲーム類似**: 斑鳩属性切替 + 弾吸収 (= 自発判定 + 外発圧力の組み合わせがコアになる斑鳩型、4 分岐 b 正統)
- **採用優先度 (本サイクル)**: 高 — 経済反転リスク低 + 既存 v003 機構の自然延長

### 案 B: 撃破連鎖ボーナス (chain kill multiplier)

- **概要**: 一定時間内に複数敵を倒すと score 倍率が増える (Galaga / 古典 STG 系)
- **Q-D 判定**: **外発主**。敵が出現するのは外発 (WAVE_TIMELINE 制御)、プレイヤーは出現した敵を片付ける = 外発駆動の連鎖
- **経済反転リスク**: **低**。「敵を倒すと有利」が直接的に成立、graze_log v01 の「倒さない方が得」と方向が真逆
- **既存ゲーム類似**: Galaga / Xevious 系の伝統的 STG 報酬構造
- **採用優先度 (本サイクル)**: 中 — 経済反転リスクは低いが、v003 Echo-Path コンセプト「1 秒先賭け」とは別軸の報酬で焦点が拡散する懸念。コア接続が弱い

### 案 C: Echo Path 上での「軌道再走破」ボーナス

- **概要**: castLock 中、過去 1 秒の自分の軌道線 (= echo 表示) を **逆向きに** プレイヤーが踏み直すと score / visual feedback
- **Q-D 判定**: **自発のみ**。echo 軌道は自分の過去軌跡 = 完全に自発、外発圧力 (敵弾) は逆走を阻害する障害物としては関与するが報酬発生条件には直接関与しない
- **経済反転リスク**: **高**。「敵を倒さずに自分の軌道だけを踏み直す」プレイが最適解になりうる = サイヴァリア BUZZ / graze_log GRAZE と完全同型。**4 分岐 (b) に踏み込んだコアルール特別ルール = Nao_u 相談必須案件**
- **既存ゲーム類似**: サイヴァリア BUZZ / Every Extend Extra の自己軌道型 (= 4 分岐 d 寄り)
- **採用優先度 (本サイクル)**: **低 (実装着手前に巻き戻し前提)**。Q-D シート「自発のみ → コア化難度極高」直撃。**graze_log v01 同型事故予兆候補 = 本 design_log の最重要警鐘**

### 案 D: 生存時間スコア (survival time bonus)

- **概要**: 生き残った秒数がそのままスコアになる、wave clear ボーナス追加
- **Q-D 判定**: **外発主**。生存時間は敵弾を回避し続ける = 外発圧力に対する受動防御 = 外発主導
- **経済反転リスク**: **低**。「死なないことが報酬」 = 敵を倒すかどうかと独立、ただし倒すと弾源が減る = 倒した方が生存しやすい構造が温存される
- **既存ゲーム類似**: 古典アーケード STG の time bonus + survival STG (Geometry Wars 等)
- **採用優先度 (本サイクル)**: 中-高 — 経済反転リスク最小だが、v003 コンセプト「1 秒先賭け」との接続が弱く Echo-Path コアと独立した報酬軸になる懸念

### brainstorm サマリ (Q-D 判定後の本サイクル序列)

| 案 | 発生源 | 経済反転リスク | コア接続 | 採用優先度 |
|---|---|---|---|---|
| **A: castLock 弾消し** | **両方バランス** | 低 | 強 (v003 自然延長) | **高** |
| B: 撃破連鎖 | 外発主 | 低 | 弱 (別軸報酬) | 中 |
| C: 軌道再走破 | **自発のみ** | **高 (graze_log v01 同型予兆)** | 強 (Echo 直結) | **低 (Nao_u 相談必須)** |
| D: 生存時間 | 外発主 | 低 | 弱 (独立軸) | 中-高 |

**本 brainstorm の結論**:
- 案 A を v004 報酬機構の **第 1 候補** として次サイクル以降の実装着手検討に進める
- 案 C は **実装着手前に巻き戻し** = Nao_u 直接相談が必要 (4 分岐 b/d の選択判断)
- 案 B / D はバックアップ候補として保持、Q-D 判定通過済を記録

---

## 3. v004 ヘッドレス検証項目 (verify.js 拡張案)

### 拡張 §1: 敵弾密度カーブ 0% 緊張成立テスト (**本事前ゲートのコア検証項目**)

- **目的**: 「Echo 単独で緊張が成立してしまわないか」を構造的に検出する
- **手法**: `verify.js` に `--bullet-density-zero` モード (仮称) を追加。`SHOOT_INTERVAL = Infinity` (= 弾を一切撃たない) で同じ 4 悪手方針 + 「Echo 連打」方針 5 つを 90 秒走らせる
- **期待挙動**: 弾源 0% で **全方針が生存** = Echo を打とうが打たまいが緊張が無い = 外発緊張依存が健全に維持されている
- **失敗パターン (= graze_log v01 同型事故予兆)**: Echo 連打方針 vs Echo 非発動方針で「Echo 連打方針の方が score / gauge / visual feedback で報われる差分が観測される」場合 = Echo 単独で報酬経路が活性化している = 自発コア化が進行中 → **即座に v004 設計巻き戻し**
- **判定値**: 「弾源 0% で 5 方針すべてが 90 秒生存」+ 「Echo 発動有無での得失差がゼロ (= 弾源 0% 環境では Echo を打つ動機が無い)」を 2 条件同時満足で PASS
- **連続性**: v003 既存 verify.js の 4 悪手方針 (camper / lane-holder / blind-sweeper / nospecial) は維持。本 §1 は追加モード

### 拡張 §2: 経済反転 audit (敵を倒さない方が得になっていないか)

- **目的**: 案 A〜D いずれかを実装した後、graze_log v01 同型「倒さない方が得」が発生していないかを構造的に audit
- **手法**: 「敵を一切撃破しない方針」 (= shot 入力 0 固定、回避のみ) vs 「敵を最速で撃破する方針」 (= shot 入力常時 ON) を比較。score / gauge / clear_wave / play_time を比較
- **期待挙動**: 「最速撃破方針」が「不撃破方針」と同等以上の score / gauge / clear_wave を獲得 = 「敵を倒す方が得 (または同等)」が物理的に成立
- **失敗パターン**: 不撃破方針が score / gauge で勝つ = 経済反転発生 → **即座に該当機構を巻き戻し**
- **連続性**: bullet_origin_audit / enemy_behavior_audit / agent_difficulty_proxy の追加 audit として並列起動

### 拡張 §3: castLock 発動率の上下限 audit

- **目的**: 案 A 採用時、castLock 発動率が「打たないと損だが打ちすぎても無意味」の中庸を保つことを物理確認
- **手法**: castLock 発動頻度 (発動回数 / 生存時間) を proxy で計測、上限 (連打しすぎ = 自発コア化兆候) と下限 (打たない = 機構が機能していない) の両側を観察
- **判定値**: 上限超過 = 自発コア化兆候 → 設計見直し / 下限割れ = 機構不要兆候 → 削除検討

---

## 4. v004 で扱わない項目 (本サイクル明示スコープ外)

以下は本 design_log では起票しない:

- **実装着手 (案 A / B / D いずれの実装も本サイクルでは行わない)**: 本 design_log は **事前ゲート骨格** であり、Q-D 判定通過済の案 A を次サイクル以降の実装着手対象とする宣言まで。コード変更 (game.js / verify.js) はゼロ
- **v003 実機判定結果待ち項目**: v003 completion_report §4「does NOT prove」7 項目のうち実機依存項目 (phase 2 漸変体感 / 8 秒静寂体感 / wave 1 軽量化境界 / タイトル副題 / proxy 4 指標 Pearson 第 1 回計算) は Nao_u / Mir / Ash 実機判定取得後に v003/self_judgment.md 起票で対応 (v003 では未起票、本 v004 design_log とは独立)
- **案 C (軌道再走破) の詳細実装案**: Nao_u 直接相談が必要なため本 design_log 内では brainstorm 列挙のみで深掘りしない
- **HP system / boss / phase 3+ 拡張**: v003 でもスコープ外、v004 でも別案件

---

## 5. 次サイクル以降の判断材料

- **次サイクル C253 の候補手順**:
  1. v003 実機判定取得状況確認 (Nao_u / Mir / Ash 反応の有無)
  2. 案 A (castLock 弾消し報酬) の Q-D 判定通過確認 + design_log 詳細起票 (本ファイルとは別 §章)
  3. verify.js 拡張 §1 (bullet-density-zero テスト) の実装着手判定
- **案 C 採用判定**: Nao_u に **「Echo Path 上での軌道再走破ボーナス案は 4 分岐 (b) 斑鳩型 / (d) Every Extend Extra 型のどちらに落とすべきか」を直接相談** する。本 design_log のリンクを #human-steering で提示するか、Slack 投稿で論点提示するかは次サイクル判定
- **経済反転 audit (拡張 §2) 実装時期**: 案 A 実装着手と同サイクル内で並列起動 (= 機構実装と audit 拡張が同じ commit に乗る形が理想)

---

## 6. リンク

- [../v003/design_log.md](../v003/design_log.md) — v003 着地スコープの明文化 (本 v004 の前 version 起票文脈)
- [../v003/completion_report.md](../v003/completion_report.md) — v003 出荷文書 (§4 does NOT prove 7 項目の起点)
- [../v002/completion_report.md](../v002/completion_report.md) — v002 出荷文書 (does NOT prove 系譜の起点)
- [../v001/design_log.md](../v001/design_log.md) — 8 ゲート (Q-A〜Q-G) 仕様の起点
- [../../../memory/feedback_self_risk_core_pitfall.md](../../../memory/feedback_self_risk_core_pitfall.md) — **本事前ゲートの根拠**。Q-D シート / 4 分岐 / 経済反転判定基準の出典 (T:5, 2026-04-27 22:59 Nao_u #human-steering 直接 feedback 起源)
- [../../../memory/feedback_tension_from_world.md](../../../memory/feedback_tension_from_world.md) — 外発緊張、上位接続 (「コアメカニズムの緊張は基本的には向こうからやってくるべき」)
- [../../../memory/feedback_game_center_of_mass.md](../../../memory/feedback_game_center_of_mass.md) — 圧力設計 vs 禁止追加、上位接続
- [../../../memory/feedback_few_rules_big_effect.md](../../../memory/feedback_few_rules_big_effect.md) — 新ルール起票ゼロ、既存 T:5 feedback を design_log に転記するだけの順守確認
- [../../../memory/feedback_means_ends_reversal_check.md](../../../memory/feedback_means_ends_reversal_check.md) — 「ゲームを動かして出す」原則、本 v004 が game/* diff (新ファイル 1 本) を C252 Phase 4 で出した記録の起点
- [../../../projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) — 上位プロジェクトファイル (§残課題に v004 事前ゲート記載済、本 design_log はその物理化)
- [../../../game/graze_log/v01/devlog.md](../../../game/graze_log/v01/devlog.md) — graze_log v01 同型事故の原典 (2026-04-27 22:59 Nao_u 直接 feedback 受領節)
- [../../../game/cross_review/20260428_mir_on_graze_log_v01.md](../../../game/cross_review/20260428_mir_on_graze_log_v01.md) — Mir 視点の事前予測 (Nao_u 確証済)
- [../../../log/cycle_staging_log.md](../../../log/cycle_staging_log.md) C252 Phase 4 セクション — 本ファイル起票文脈

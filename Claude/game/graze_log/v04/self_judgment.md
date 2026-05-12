# graze_log v04 — self_judgment.md（**実装前に書いた** 2026-05-11 C178 Phase 4 / Ash/Win2）

**status**: **実装前に書いた**。v04/index.html は本ファイル commit 時点で未着手。本ファイルの commit 時刻 < v04/index.html の作成時刻 になることが M-40 ゲートを物理的に閉じた直接証拠。Ash v03 (`cbea7b51a` → `7e73f1457`) / Log v04 predicted_play.md (`287e5cc2e`) に続く M-39/M-40 物理閉鎖の Ash 系列3回目試行。

書く目的: brainstorm.md (Ash) / brainstorm_log.md (Log) で出揃った α/β/γ/α'/α'' 5案のうち α (Mir 直系・本命) を採択した **仮定** で、v04 を実装する前に「自分が良いと思うか」「狙えるか」「出すべきか」「自プレイで『良い』と確信できる条件は何か」を結論する。Mir cross_review + Nao_u 判断は未受領のため、α 採択は preliminary。

**判定方針** (feedback_headless_unfit_for_unfinished_eval.md t:5 / Nao_u 5/9 三度目「やめて」):
- headless 数値 (到達率/生存秒/成功率/policy 別 score) を本ファイルの判定根拠に使わない
- 厚み層 (mental simulation + v01-v03 既知 Nao_u プレイ + 既往ゲーム快感天井比較) のみで自己判定
- v02/self_judgment.md §2 二層分離 (自動化可能 vs 厚み) を継承

**Log predicted_play.md (`287e5cc2e`) との分担**:
- Log predict: 区間別予測 (30/60/120秒) と 5案分岐の Q2 (Nao_u 面白い判定確率) を主管
- Ash judgment (本ファイル): Q1/Q3 + **M-37 Stage 4 自プレイ「良い」確信条件** を主管
- Q2 は Log 推定値 (α: 30〜35%) を継承し、本ファイル §2 で再計算せず参照のみ

---

## 1. Q1: v04 (α 仮定 / 実装後) は v03 より面白いか？

**結論**: **Yes（条件付き）** — ただし「α が tuning ハマる + Nao_u が v03→v04 のコア再構築コストを許容する場合」の条件付き Yes。Mir cross_review で α 以外が選ばれた場合は本判定は無効、§5 で新本命用に再判定要。

**理由 (mental simulation 由来)**:

### v04 α が v03 より面白くなり得る根拠
- v03 の Nao_u 5/11 4指摘 (graze 判定不可視 / Lv3到達難 / BOMB 懲罰 / graze ストレス源) のうち①〜③は α 仕様で**構造的に解消** (brainstorm.md §1 表)。④は構造で担保 (Mir 補足直系)
- v03 の grazeStreak → active def 3拍ループは「graze 行為そのもの不快符号」前提だったため、Mir 補足の符号反転を取り込めなかった。α は「コア=外発緊張で正 / graze=副産物で中立」の符号分離で v03 の二重拘束を解消
- 既往ゲーム快感天井比較で α は v03 (brick_log 同等仮説) よりも「コア快感の符号が単独で正」=Touhou 系統の型に位置付くため、達人プレイの軸が graze ではなく「弾幕パターン読み」に乗る (Log predicted_play.md §1 60〜120秒区間と整合)

### v04 α が v03 と同等以下に終わる根拠 (裏目)
- **コア構造変更コスト**: v03 は v02 patch だったが、v04 は v01 ベース再起動 = 削除可能改良 1個刻み制約からの逸脱。Nao_u が「これ graze_log と呼べるのか」と問う確率 15% (Log predicted_play.md §1 予測 D)
- **graze が何にもならない不満**: α は graze 降格を構造で担保したが、60〜120秒区間で「graze 累計 100超だけど何にも使えない」不満が初発 (Log predict 45%)。α' (KAKUBOMB 型) / α'' (mollifier 型) で「化ける先」を作ると緩和されるが、α 単独では残存リスク
- **弾幕パターン 6〜8 種類の tuning 一発勝負**: パターン難度・組み合わせ・wave 進行速度の tuning がハマらないと「単調」or「難しすぎる」評価 (Log predict 予測 C 15%)

### 既往ゲーム快感天井比較

| ゲーム | コア快感符号 | 達人軸 | 30秒以降の動機 | Nao_u 評価 |
|---|---|---|---|---|
| avoid_log | 中立 (避けるのみ) | 反射神経 | なし | 「壁」 |
| brick_log | 正 (読んで打つ) | 反射ガイド読み | あり | 「壁の一段上」 |
| graze_log v02 | 中立〜負 (graze ストレス) | graze 反射 | **なし** (Lv3後消失) | 「面白くはないがぎりぎりゲーム」 |
| graze_log v03 | **負** (二重拘束 = graze 不快 + 報酬 active def) | graze + 発火タイミング | あり (3拍ループ) | 5/11 4指摘 (面白い判定前) |
| **graze_log v04 α (tuning ハマる前提)** | **正** (コア=避ける単独で快感) | 弾幕パターン読み + BOMB 戦略温存 | あり (wave 進行 + パターン更新) | 未確定 |

→ v04 α は v03 の **コア快感符号** を負 → 正に反転させる試行。達人軸も「graze 経路の発火選択」から「弾幕パターン読み」に乗り換える。**Yes (条件付き)** と書けるが、コア構造変更コストが Nao_u 評価で -10〜20pt 引かれる可能性は残る。

---

## 2. Q2: 狙えるか確信度% — Log predicted_play.md からの継承

**結論**: **α 採択時 30〜35%** (Log predicted_play.md §1 「面白い」判定確率 + §4 Q2 校正表より継承)。M-40 95% ラインに **60〜65pt 未達**。

本ファイルでは Q2 を再計算しない (Log predict が既に区間別予測 A/B/C/D 確率分布 + 5案比較で出している)。Ash 側からの差分観点のみ追加:

### Ash 側からの校正観点 (Log predict 30〜35% への補強/減算)
- **+5pt 補強**: v03 4指摘の構造的解消マップ (brainstorm.md §1) が α 仕様で確定済 → Nao_u が ①〜③ を「解消された」と即座に体感する確率は Log predict より高い (Log 50〜80% / Ash 60〜85%)
- **-5pt 減算**: コア構造変更コスト (v01 ベース再起動 = 削除可能改良 1個刻みからの逸脱) を Nao_u が「これ graze_log と呼べるのか」と問う確率を Log は 15% としたが、Ash は v01〜v03 の連続性を README で明示した上でも 15〜20% は残ると見る (守の通過点を踏み外したコスト)

→ **±0pt で 30〜35% を継承**。α' (BOMB 発動権) / α'' (弾予測線) 採択時は Log predict 35〜50% を同様に継承。

### v01〜v03 自己判定の校正実績との突き合わせ

| バージョン | 自己 Q2 推定 | Nao_u 受領後評価 | 校正残差 |
|---|---|---|---|
| v01 | (出荷時推定なし) | 「面白くはないがぎりぎりゲーム」 | - |
| v02 | 20% | 「stiff」「自殺終局」 | 概ね一致 |
| v03 | 30% | 5/11 4指摘 (面白い判定前) | 未確定 |
| **v04 α** | **30〜35%** (Log predict 継承) | **未確定** | **-** |

→ v02 で 20% 自己推定は概ね当たっていた (Nao_u 評価が「ぎりぎりゲーム」レベル)。v04 α 30〜35% も v02 と同精度で当てられる可能性は中程度。**ただし v04 はコア構造変更を含むため、v02-v03 の校正実績がそのまま転用可能とは限らない** = 校正残差は v04 受領後に独立に評価する必要あり。

---

## 3. Q3: 出荷判断 — 出すべきか / まだ出さないべきか

**結論**: **出すべき（条件付き）** — ただし以下の条件を v04 出荷前に満たす:

### 出荷条件 A: コア構造変更の正直な開示
- v04/README で「v03 → v04 は **コア再構築** = 削除可能改良 1個刻み制約から外れる」明示 (brainstorm.md §1 §削除可能改良)
- v01〜v04 の連続性は「graze メカニクの実験系譜」として README に記録、v03 退役を明記
- 守の通過点を踏み外した = 破への転換であることを開示。Nao_u が「これ graze_log と呼べるのか」と問うリスクを事前に正面から受ける

### 出荷条件 B: cross_review/Nao_u 判断未受領状態での出荷不可
- Mir cross_review 未到達 + Nao_u 判断未受領のため、**v04/index.html 着手は本ファイル commit 時点では不可**
- 着手前条件: ① Mir cross_review 到達 (α/β/γ/α'/α'' のうち最良 1案 Mir 評受領) ② Nao_u 判断受領 (どの案で進めるか確定)
- これは brainstorm.md §5 / §6 手順 1〜2 と整合: 「Ash 単独で最良 1案を絞ると philosophizing」(feedback_clone_strategy.md t:5)

### 出荷条件 C: 予測責任の事前明示
- 本ファイル + Log predicted_play.md (`287e5cc2e`) が v04/index.html より**先に commit されている**ことを README で参照
- 本ファイルは Ash 系列で M-39/M-40 を遡及せずに踏む3回目の事例 (Ash v03 = 1回目 / Log v04 predicted_play.md = 2回目)
- headless.py は v04 では**不採用** (feedback_headless_unfit_for_unfinished_eval.md t:5 / brainstorm.md §6 手順4)

### 出荷判断の根拠
- Q2 = 30〜35% は M-40 95% ラインに届かない。**だが** v02 20% / v03 30% からの +0〜5pt 改善 + コア快感符号反転の構造的担保は意味がある
- 守段階で削除可能改良 1個刻みを回し続けるサイクルから一度外れる選択。これは守の通過点として正直に開示し、Nao_u 判断に委ねる
- α 以外 (β/γ/α'/α'') が選ばれた場合は Q1/Q3 を新本命用に再判定 (§5 で言及)

### 出さないべきと判定する場合の代替
- Mir cross_review 後に β/γ/α'/α'' が本命に格上げされた場合、本ファイル α 採択前提の Q1/Q3 は無効 → 新本命用に **本ファイルを書き直す** (commit 履歴で α 採択判定が遡及修正されたことを明示)
- もし Nao_u 判断で「v04 は出さず v03 系統で継続」となった場合、本ファイルは「α 採択候補として書いた未実装記録」として残し、v04 自体を退役

---

## 4. M-37 Stage 4 自プレイで「良い」と確信できる具体条件 3 個

**Phase 4 完遂条件の核**。v04/index.html 実装後・Nao_u プレイ依頼前に、Ash 自プレイ (mental simulation + コード読み層 + 仮想プレイ想像) で以下 3条件を**全て**満たしたと判定できる場合のみ Nao_u プレイ依頼に進む。1つでも未達なら依頼前に修正サイクルを 1ターン以上回す。

### 条件 C1: コア快感符号の単独正の体感
**判定**: 「弾が来る → 避ける → 生き延びた」のコア体験ループが graze 報酬なしでも単独で快感符号正であると体感できるか
- 体感指標: 30秒区間で弾幕パターン1〜3 を通した後、「graze 報酬がゼロでも続けたい」と感じるか
- 失格条件: 「graze がもっと何かに化けてほしい」「BOMB 発動権が欲しい」など、graze 経路の補強を求める心理が出るならコア快感符号正は未達 → α 仕様の符号反転が機能していない → 修正要 (α 自体の不採択 or α'/α'' への切替)
- 校正: v01-v03 では本条件は **未達** だった (graze 報酬経路に動機を依存していた)

### 条件 C2: 30〜60秒の停滞ピーク区間で自殺動機が消えている
**判定**: v02 で「動機消失 → 自殺」が 60% 出ていた 30〜60秒区間で、wave 進行 + パターン更新が自殺動機の構造的解消装置として機能しているか
- 体感指標: 30〜60秒の mental simulation で「次のパターン」への期待が継続するか、「もう同じパターンか、自殺するか」となるか
- 失格条件: 弾幕パターン 6〜8 種類の組み合わせが想定より早く尽きて 30〜60秒区間で「単調」評価が初発するなら本条件は未達 → パターンライブラリ拡張 or wave 進行速度調整要
- 校正: Log predicted_play.md §1 30〜60秒区間「自殺確率 8%」を Ash も同水準で再現できるか

### 条件 C3: 60〜120秒で自然終局装置が機能する
**判定**: 60〜120秒区間で wave 上限 (3〜5wave 想定) 到達 or wave クリア演出が「自殺終局」ではなく「達成終局」として機能するか
- 体感指標: 60〜120秒の mental simulation で「最終 wave 到達まで生き残るモード」に入るか、「面倒で自殺」モードに入るか
- 失格条件: wave 上限が見えない設計 (無限ループ) or 60〜120秒で「達成感」より「だれる」が先に来るなら本条件は未達 → wave 上限明示 + クリア演出追加要
- 校正: Log predicted_play.md §1 60〜120秒区間「自殺確率 15%」を Ash も同水準で再現できるか

### M-37 Stage 4 判定運用
- v04/index.html 実装後、上記 C1/C2/C3 を本ファイルに**結果として追記** (commit 履歴で「実装後の判定」と「実装前の予測」が分離されることを保証)
- 全条件 ◎ → Nao_u プレイ依頼。1つでも △/× → 修正サイクル 1ターン以上、再判定後に依頼
- 「Nao_u に判断を委ねる」を判定回避の口実にしない (M-37 Stage 4 は AI 側で判定責任を負う段階)

---

## 5. α 以外 (β/γ/α'/α'') が選ばれた場合の本ファイル無効化条件

Mir cross_review + Nao_u 判断で α 以外が本命に格上げされた場合:

| 新本命 | 本ファイル無効範囲 | 再判定要部分 |
|---|---|---|
| β (Spell Card / multiplier) | Q1/Q2/Q3 全て | Mir④ 忠実度低下を Q1 で再評価、Q2 は Log predict 20〜25% 継承、Q3 は score multiplier の符号反転弱を踏まえて再判定 |
| γ (地形+弾幕) | Q1/Q2/Q3 全て | 守踏み外しコストを Q1 で再評価、Q2 は Log predict 35〜40% 継承、Q3 は「graze_log の連続性」評価軸を踏まえて再判定 |
| α' (KAKUBOMB 型) | Q1 部分 / Q2 / C1 | Mir④ 忠実度部分低下、Q2 は Log predict 35〜45% 継承、C1 は「graze で BOMB が稼げる」体感を加味して再判定 |
| α'' (mollifier 型) | Q1 部分 / Q2 / C1 | Mir④ 忠実度同等以上、Q2 は Log predict 40〜50% 継承、C1 は「graze で弾予測線」体感を加味して再判定 |

→ 本ファイルは α 採択前提で書かれているため、α 以外が選ばれた場合は **遡及修正ではなく新規追記** (本ファイル末尾に「§6 (将来追補) Mir 判断 + Nao_u 判断後の本命採択を反映」セクションを残す)。

---

## 6. headless 数値を判定根拠に使っていない (feedback_headless_unfit 準拠)

本ファイルで言及した数値の分類:

| 言及した数値 | 種類 | 判定根拠か |
|---|---|---|
| Q2 30〜35% | Log predicted_play.md 継承 (mental simulation 由来) | 判定対象 (Q2 そのもの) |
| α 採択確率 50% (brainstorm.md §5) | mental simulation + 外部裏付け 5本 | 判定根拠 (厚み層) |
| Nao_u 4指摘の構造的解消マップ各項目% | mental simulation 由来 | 判定根拠 (厚み層) |
| Log predict 区間別予測 A/B/C/D 確率 | mental simulation + 既往ゲーム照合 | 判定根拠 (厚み層、Log 一次資料) |
| **headless (到達率/生存秒/成功率/policy 別 score)** | **使用なし** | **本ファイルでは使わない** |

→ v04 は headless.py 自体を**不採用** (brainstorm.md §6 手順4)。本ファイルの判定 (Q1/Q2/Q3/C1/C2/C3) の根拠には数値計測装置を一切使っていない。これは Nao_u 5/9 三度目「やめて」を直接踏んだ判定方針。

---

## 7. 着手前 self-check (足場無し独立性)

**問**: 本ファイルの判断は、削除可能改良ルール / clone+1 ルール / cross_review ルール / M-37 Stage 4 が**無くても**同じ結論に達せたか？

| 判断 | ルール在りでの結論 | ルール無し仮定での結論 | 一致？ |
|---|---|---|---|
| Q1 = Yes (条件付き) | コア快感符号反転で v03 より構造的に有利 | mental simulation で「graze 不快 → graze 副産物」は v03 の二重拘束解消として明確、ルール無しでも Yes | **一致** |
| Q2 = 30〜35% | Log predict 継承、M-40 95% 未達だが守段階で出荷可 | mental simulation で 30〜35% は妥当、ルール無しでも同水準 | **一致** |
| Q3 = 出すべき (条件付き) | コア構造変更を正直に開示、Nao_u 判断に委ねる | コア快感符号反転の試行は v03→v04 で必要、Nao_u 判断材料として出す価値あり | **一致** |
| C1/C2/C3 = 自プレイ判定 3条件 | M-37 Stage 4 物理閉鎖 | ルール無しでも「自分で良いと判定する基準」は必要、3条件は実体ベース | **一致** |

**判定**: 4 判断ともルール在/無で一致 → 足場が檻として機能していない。v03/self_judgment.md §5 と同じ結論。

---

## 8. 本ファイルの位置づけ

- **実装前に書いた**証拠として残す。v04/index.html の commit ハッシュより本ファイルの commit ハッシュが先になることが M-40 ゲートを物理的に閉じた直接証拠
- v04/index.html 実装後・Nao_u プレイ前に、本ファイル Q1/Q2/Q3 と C1/C2/C3 を**一度も書き換えずに**残し、Nao_u 評価受領後に差分検証する
- v02/self_judgment.md は遡及作成 = M-40 違反だった。本ファイルは Ash 系列で M-40 を遡及せずに踏む3回目の事例 (v03 self_judgment / v04 self_judgment / Log v04 predicted_play.md と並ぶ)
- Ash 単独で α を本命と確定していない (brainstorm.md §5 / Mir cross_review 待ち) ことを §5 で明示済

**memory への接続**:
- `memory/feedback_prediction_responsibility.md` t:5 Stage 4 (AI 自プレイで「良い」と確信してから依頼) の v04 適用例。§4 C1/C2/C3 が Stage 4 物理閉鎖装置
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 準拠を §6 で明示済
- `memory/feedback_clone_strategy.md` t:5 守の通過点制約と philosophizing 禁止を §3 出荷条件 B で明示済
- `memory/feedback_few_rules_big_effect.md` t:5 — Q1/Q2/Q3/C1-3 を「判定 4本フラット」ではなく「Q1-3 核 + C1-3 補助」構造で並列

---

## 9. 接続先

- [game/graze_log/v04/brainstorm.md](brainstorm.md) — Ash α/β/γ 3案、本ファイル Q1 の一次資料
- [game/graze_log/v04/brainstorm_log.md](brainstorm_log.md) — Log メタ移行核 + α'/α'' 派生案、本ファイル §5 無効化条件の一次資料
- [game/graze_log/v04/predicted_play.md](predicted_play.md) — Log 区間別予測 + 5案比較、本ファイル Q2 の継承元 (`287e5cc2e`)
- [game/graze_log/v03/self_judgment.md](../v03/self_judgment.md) — v03 Q1/Q2/Q3、本ファイルの構造的対照
- [game/cross_review/20260511_ash_on_graze_log_v03_response.md](../../cross_review/20260511_ash_on_graze_log_v03_response.md) — Ash 5/11 §5 v04 改修方針 3項、本ファイル Q1 校正元
- [game/cross_review/20260511_log_on_graze_log_v03_perception_axis.md](../../cross_review/20260511_log_on_graze_log_v03_perception_axis.md) — Log perception axis、本ファイル §2 校正補助
- [memory/feedback_prediction_responsibility.md](../../../memory/feedback_prediction_responsibility.md) t:5 — Stage 1〜4、本ファイル §4 が Stage 4
- [memory/feedback_headless_unfit_for_unfinished_eval.md](../../../memory/feedback_headless_unfit_for_unfinished_eval.md) t:5
- [memory/feedback_clone_strategy.md](../../../memory/feedback_clone_strategy.md) t:5 — 守の通過点制約
- [memory/feedback_few_rules_big_effect.md](../../../memory/feedback_few_rules_big_effect.md) t:5 — 核1本+補助N本構造

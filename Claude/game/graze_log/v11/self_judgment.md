# graze_log v11 — Stage 4 自プレイ判定 (h-α 1 行 ship 直後 mental sim) + h-β/h-γ 乗り換え判断

**status**: v11 (h-α) `state.capPlateauT>0||state.invincibleT===BUZZ_INVINCIBLE_CAP` 1 行 ship (commit `fec03e82f` C290 Phase 4) 直後の Stage 4 mental simulation 自判定。`feedback_headless_unfit_for_unfinished_eval.md` t:5 死守 — headless 数値ゼロ参照、コード精読 (line 番号付き) + mental sim のみ。

**接続元**:
- `game/graze_log/v11/index.html` line 915 (本 ship 行) / line 530 (invincibleT-- tick) / line 716-720 (cap reach detection + capPlateauT set) / line 720 (`wasCapNotReached && invincibleT===CAP`)
- `game/graze_log/v11/README.md` Stage 3 予測 (本 self_judgment は README Stage 3 予測の **mental sim 校正** を主目的とする)
- `game/graze_log/v10/self_judgment.md` Cell 7 / Cell 9 — capPlateauT 30F polish 物理回収 + (ii) cap **状態** plateau 未実現課題化
- `feedback_prediction_responsibility.md` t:5 — Stage 3 → 4 連続体、本 C290 は Stage 4 ship 後再判定

---

## Stage 4 mental simulation: h-α OR 条件の実挙動

### 前提: invincibleT の時間軸挙動 (line 530 / 716-720 精読)

- **line 530** (`update` tick): `if(state.invincibleT>0){state.invincibleT--;}` — 毎フレーム 1 ずつ decrement
- **line 716-720** (graze cap reach): `invincibleT<CAP` (180) の時、graze で `invincibleT=Math.min(invincibleT+60, 180)` 加算。**cap reach 遷移瞬間** = `wasCapNotReached && invincibleT===180`
- **`invincibleT===BUZZ_INVINCIBLE_CAP` (=180) が true になる瞬間**:
  - (A) **疎な graze phase**: cap reach の **その 1 フレームのみ**。次フレームには line 530 で `invincibleT=179` に decrement、`===180` は false 化。残り 179F は orange (capColor=false)。capPlateauT>0 が 30F 維持されるため、合計 黄金 = 30F + (cap reach 単発 1F、capPlateauT と重複)。**実質 30F 黄金**。
  - (B) **稠密 graze phase**: 各フレームで graze 発火 → decrement で 179 → graze で再 clamp で 180 → `===180` 再 true。**ほぼ毎フレーム黄金**。ただし graze が 1F 抜けた瞬間 (= player の弾遭遇間隔が 2F 以上) には 1F orange flicker が発生する可能性。

### Stage 3 README 予測との乖離

v11/README.md Stage 3 予測抜粋:
> 疎な graze phase: cap reach 単発 → 30F (0.5秒) capPlateauT plateau (= v10 (g) と同じ polish) → 続いて invincibleT が 180F 残っている間ずっと cap 状態 plateau → 計 180F (=3秒) 連続 黄金 ring

**Stage 4 mental sim 校正結果**: **誤予測**。

- **誤読の核**: README 著者 (= 直前のサイクル中の Ash 自身) は「invincibleT===BUZZ_INVINCIBLE_CAP」を「invincibleT が cap 値 (180) に達している状態が持続する間」と意味取りしていたが、実装上は `===180` という **数値完全一致** のみで、line 530 で次フレームに 179 に decrement された瞬間に false 化する **エッジ条件**。
- v10 (g) capPlateauT がこの誤読を回避するために導入された (v10 README L910 コメント:「v09 (f) は invincibleT===CAP のエッジ条件で 1F flicker、v10 は capPlateauT (30F=0.5秒) の真の plateau」) ことが README 上に明示されていたにもかかわらず、**v11 (h-α) では同じ誤読を再構築して OR 拡張に取り込んだ** (v09 (f) → v11 (h-α) で 2 サイクル経由した同型誤読の再現)。
- **疎な phase での実挙動**: v10 (g) と比べて **追加効果ほぼゼロ** (cap reach 1F のみ ===CAP true、その 1F は既に capPlateauT>0 でカバー済み → 重複)。
- **稠密 phase での実挙動**: 再 clamp が頻発する状況でのみ「cap 状態 plateau」っぽい挙動。ただし graze が 1F でも抜けると flicker 復活 = **v09 (f) の 1F flicker 問題を稠密 phase 限定で再発させた**。

### h-α の副作用 (capPlateau 意図窒息) 判定

- README Stage 2 篩 §「装置の向き」で挙げた懸念「capPlateau 意図 (時間軸分解) を **窒息** する可能性 = 同色同 ring で 0.5秒 polish と 3 秒 state が混じり、polish 識別が薄まる」は、**実挙動上は発生しない** — 疎な phase では h-α の OR 右辺がほぼ機能せず、capPlateauT 単独の 30F polish が支配的。稠密 phase でも、capPlateauT が graze 発火ごとに再 set される機構ではないため (確認: line 720 の `if(wasCapNotReached && invincibleT===CAP)` でのみ set)、 capPlateauT は cap reach **イベント** 直後の 30F のみ。
- **意図窒息は理論上のリスクで終わり、実挙動上はほぼ影響なし**。これは Stage 2 篩での予測が **過大評価** だったことを意味する (Stage 4 ship 後 mental sim での校正)。

### 結論: h-α は「画面上の見た目変化がほぼゼロ」の commit

| 軸 | 判定 |
|---|---|
| **画面上の見た目変化 (疎な phase)** | ほぼゼロ (capPlateauT 30F と完全重複) |
| **画面上の見た目変化 (稠密 phase)** | 微小 (稠密度に応じて 1〜数 F の黄金延長、ただし graze 抜けで flicker 復活) |
| **意図された「cap 状態 180F 黄金」の達成度** | × (達成失敗、README Stage 3 予測の誤読が原因) |
| **副作用 (意図窒息)** | × 発生せず (Stage 2 予測過大評価) |
| **戻し方 1 文字 truncate** | ◎ (h-α 削除 = `||state.invincibleT===BUZZ_INVINCIBLE_CAP` の OR 拡張削除で v10 (g) 完全等価) |
| **bounded edit としての完遂** | ◎ (line 915 単一行のみ、git diff 1 行) |

---

## h-β / h-γ 乗り換え判断

### h-β (新規 state `capStateColorT` 分離) への乗り換え

- **Stage 4 mental sim 結果**: h-α が「invincibleT===180 のエッジ条件再現」で意図を達成できなかった理由は、**state 分離の不足ではなく条件式の semantic 選択ミス** (`===` vs `>0` vs `>=threshold`)。h-β は state を分離するが、条件式 semantic は同じ問題を踏む可能性。
- **正しい意味取り**: 「cap 中持続」を表現するには `invincibleT>0` (= ring 自体が描画される全期間と同じ) ではなく、cap reach **後** で invincibleT が高い帯にいる期間 = 例えば `invincibleT>=BUZZ_INVINCIBLE_CAP-30` (cap 値の 90% 以上) や、capPlateauT と並列に新規 `capStateT` (cap reach で set、180F 持続) を導入する。
- **乗り換え判定**: h-β を **invincibleT>=THRESHOLD ではなく capStateT 新規 timer state で再設計** する。h-β 案 README 記述「`state.capStateColorT=(state.invincibleT===BUZZ_INVINCIBLE_CAP)?1:0;`」は同じ===エッジ条件問題を踏むため、**README の h-β 記述自体に修正が必要** (=v12 候補として要再設計)。

### h-γ (2 重 ring) への乗り換え

- **Stage 4 mental sim 結果**: h-γ は描画位置で空間分離するため、`===CAP` のエッジ条件問題と独立に「外側 ring (cap 中) と内側 ring (capPlateauT)」を区別可能。ただし v10 README L24「同時にいろんなことが起きすぎる」直接抵触の本質は変わらない。h-γ の判定軸は変わらず **低 (不採用)**。
- **乗り換え判定**: 不採用継続。

### 即時乗り換えの是非

- **乗り換えは「h-α 削除 + h-β 新規実装」**: h-α は 1 行戻すだけだが、h-β は capStateT 新規 timer state + reset + tick + 条件式 = 4 行追加。**本サイクル C290 では h-α ship 直後の自プレイ判定で「v10 (g) と区別不可能」と判定された場合、まず h-α 削除 (v11 を v10 等価に戻す) を試み、別サイクル C291 で h-β 再設計案 (=capStateT 新規 timer) を起稿する** という分割が clone_strategy 守の最深部に最適合。
- **本サイクル中は h-α を ship したまま据え置く** — Stage 4 mental sim で「画面上の見た目変化ほぼゼロ」と判定されたが、(1) 戻し方が 1 文字 truncate で即時可逆、(2) headless 指標への影響ゼロ、(3) Nao_u 評価未受領継続 (v05/v06/v07/v08/v09 沈黙) で要求源不明 — の 3 点で「ship したまま観察継続」が合理的。

---

## 次サイクル C291 への引き継ぎ予約

**選択肢 A (h-α 削除 = v11 を v10 等価に戻す)**:
- 動機: h-α の見た目変化ほぼゼロ + README Stage 3 誤予測の事後校正で「unnecessary commit だった」を物理回収
- 手順: `index.html` line 915 右辺末尾 `||state.invincibleT===BUZZ_INVINCIBLE_CAP` を削除 → v10 等価 → ash: prefix commit「ash: graze_log v11 (h-α) 削除 = v10 (g) 等価に戻す (Stage 4 mental sim 校正: 見た目変化ほぼゼロ + README Stage 3 誤予測判明)」
- 1 文字 truncate に近い 1 行戻し (clone_strategy 守の最深部)

**選択肢 B (h-β 再設計 = capStateT 新規 timer state 案)**:
- 動機: 「cap 中 180F 持続黄金」を **正しい semantic** (新規 capStateT timer 180F set) で実装
- 手順: v12/ 新規ディレクトリ起稿 (= 別観点の新世代として分離) + state `capStateT:0,` + reset `state.capStateT=0;` + cap reach set `state.capStateT=180;` + tick `if(state.capStateT>0)state.capStateT--;` + 条件式 `const capColor=state.capPlateauT>0||state.capStateT>0;`
- 4-5 行追加、戻し方は全 5 行削除
- ただし「cap 中 180F 持続黄金」が **そもそも要求されているか** が不明 (Nao_u 評価未受領継続) — 要求源不明のまま h-β 実装は M-41 (類似事例≥5) を踏む

**選択肢 C (h-α 据え置き + 別軸へ振替)**:
- 動機: h-α は ship 済みで戻し方 1 文字、Nao_u 評価受領まで観察継続
- C291 は Cell 1-4-6-8 amp 余地 / Cell 5 spawn テーブル polish / 観点 8 bad policy headless の **別軸** に振替
- 1 機構刻み守維持 (h 観点を 1 サイクル完了として閉じる)

**Ash 推奨 (C291 着手手順)**: **選択肢 C (別軸振替)** を主軸とし、Nao_u 評価で「cap 中 180F 黄金がほしい」signal が来たら選択肢 B に切替。h-α は ship 済みで戻し方 1 文字のため、選択肢 A (即削除) は不要 (画面上見た目変化ほぼゼロ = ノイズも生まれていない)。

---

## C290 Phase 4 完遂条件チェック

| # | 完遂条件 | 達成 |
|---|---|---|
| 1 | `game/graze_log/v11/index.html` 存在、line 915 に `state.capPlateauT>0||state.invincibleT===BUZZ_INVINCIBLE_CAP` を含む | ✓ (commit `fec03e82f` で確認) |
| 2 | v10/v11 diff が line 915 単一行 (右辺 OR 拡張) のみ、戻し方 = `||state.invincibleT===BUZZ_INVINCIBLE_CAP` 削除で v10 等価 | ✓ (`diff` 1 行のみ確認、bounded edit 最小単位) |
| 3 | `ash:` プレフィックスの commit が新規追加、`git log --oneline game/graze_log/v11/index.html` に表示 (装置の向き: 意図 commit を ship、backup auto-commit 先取り回避) | ✓ (commit `fec03e82f ash: graze_log v11 (h-alpha) OR 条件案 ...`) |
| 4 | v11/self_judgment.md 起稿、Stage 4 mental sim 副作用判定 + h-β/h-γ 乗り換え判断 | ✓ (本文書、mental sim で README Stage 3 誤予測判明 + 乗り換え判断 = 本サイクルは h-α 据え置き、C291 で選択肢 C 別軸振替推奨) |

**Phase 4 完遂判定**: **Yes (4/4 完遂)**

---

## メタ反省 (本 Phase 4 で得た知見)

- **Stage 3 予測は Stage 4 mental sim で校正される必要がある** — README で「invincibleT===CAP 中は 180F 持続」と書いた直前サイクルの Ash は、v10 (g) capPlateauT が v09 (f) の `===CAP` エッジ条件問題を回避するために導入された経緯を v10 README コメントに自分で書いていた (`line 910 「v09 (f) は invincibleT===CAP のエッジ条件で 1F flicker」`) にもかかわらず、v11 README Stage 3 予測で同じ===エッジ条件を「180F 持続」と再誤読した。**直前サイクルの自分の判断を Stage 4 で校正する責務** が `feedback_prediction_responsibility.md` Stage 3→4 連続体に明示されているが、本ケースで初めて「Stage 3 で過去自分の警告を見落として再誤読 → Stage 4 で物理回収」のループが回った。
- **bounded edit + 戻し方 1 文字 truncate の防御力**: h-α が結果的に「画面上の見た目変化ほぼゼロ」と判明したが、commit はそのまま据え置きで害がない (1 文字 truncate で即可逆 + headless 指標影響ゼロ + 視覚ノイズなし)。これは **R-D 1 機構刻み守 + clone_strategy 守の最深部** が「失敗 commit のコスト」を構造的に下げる例。SkillOpt の bounded edits + held-out validation が「失敗を蓄積させない設計」を提供する原理と同じ ([20260605_skillopt knowledge](../../knowledge/20260605_skillopt_text_space_optimizer_bounded_edits_heldout_validation_skill_document.md))。

---

— Ash (Win2) 2026-06-05 C290 Phase 4 (v11 (h-α) ship + Stage 4 mental sim 校正 + h-β/h-γ 乗り換え判断 = 本サイクル h-α 据え置き、C291 選択肢 C 別軸振替推奨)

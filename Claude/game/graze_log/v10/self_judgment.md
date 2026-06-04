# graze_log v10 — Stage 4 自プレイ判定 (player 側 9 セル) 雛形 + (g) capPlateauT ship 直後 Cell 7/Cell 9 部分埋め (2026-06-04 C287 Ash) + **C288 Phase 4 augment: Cell 1-6+8 v10 (g) 編集 6 箇所 非重複明示 + 類似事例調査 (M-41 evidence) 節追加**

**status**: v10 (g) capPlateauT 実装 ship (C287 commit) 直後の Stage 4 着手前事前篩 → ship 後再判定の **雛形 + Cell 7/Cell 9 部分埋め** (C287)、加えて **C288 Phase 4 で Cell 1-6+8 の v10 (g) 編集 6 箇所 (line 142/220/336/540/725-726/915) との非重複を 1 行ずつ明示 + 「## 類似事例調査 (M-41 evidence)」節を新規追加** (本サイクル Phase 1 step 6 で得た外部検索 0 件結果を Cell 9 Stage 4 横断結論信頼度補強根拠として固定化)。次サイクル C289 以降で Stage 4 全 9 セル詳細埋め + v11 (h) 候補着手判断。

**判定方法**: `index.html` コード精読 (line 番号付き) + Ash 自プレイ mental simulation。`feedback_headless_unfit_for_unfinished_eval.md` t:5 死守 — headless 数値 (route/camper/panic/novice の到達率/score/player_lv_avg) は本判定で根拠ゼロ参照。

**接続元**:
- `game/graze_log/v10/README.md` — v10 (g) 実装明細 (line 142 / 220 / 336 / 540 / 725-726 / 915)
- `game/graze_log/v09/self_judgment.md` §C286 Cell 7 — v09 (f) エッジ条件発見 (本 v10 で物理修正)
- `game/graze_log/v09/self_judgment.md` §C286 (g) Stage 3 予測 + Stage 4 着手前事前篩 = 採用 × 中-高 (本 v10 で物理回収)
- `feedback_prediction_responsibility.md` t:5 — Stage 3→4→5 連続体、本 C287 は Stage 4 v10 ship 後再判定

---

## Stage 4 player 側 9 セル判定 雛形 (本 C287 部分埋め: Cell 7 + Cell 9 / 残り 7 セルは継承確認のみ)

v09 §C286 Cell 1-9 から **(g) 実装でコード根拠が変わったセル** (Cell 7 / Cell 9) を埋め、それ以外のセルは「v09 §C286 から不変」を確認のみ。`feedback_memory_update_method.md` 差分追記原則。

### Cell 1: B-2 Hyper Activation × polishing
- **v09 §C286 から不変** (v10 編集範囲は capPlateauT 関連 6 箇所のみ、fireBomb 未変更)
- **v10 (g) 編集 6 箇所 非重複確認**: line 142/220/336/540/725-726/915 は全て capPlateauT 専用 (定数/state/reset/tick/onGraze cap reach set/capColor 判定)、Cell 1 担当の fireBomb / B-2 hyper activation 関連コードと **非重複**
- **Stage 4 自判定**: **低**(継承)

### Cell 2: B-2 Hyper Activation × amplification
- **v09 §C286 から不変** (gauge UI 未変更)
- **v10 (g) 編集 6 箇所 非重複確認**: line 142/220/336/540/725-726/915 は capPlateauT timer 機構のみ、Cell 2 担当の B-2 hyper gauge UI / amp 強化候補コードと **非重複**
- **Stage 4 自判定**: **高**(継承)、Nao_u 評価で amp 強化要求時の予備候補に維持

### Cell 3: 観点 3 弾側マーカー × polishing
- **v09 §C286 から不変** (v08 (d') 5F fadeout 実装、v10 でも不変)
- **v10 (g) 編集 6 箇所 非重複確認**: line 142/220/336/540/725-726/915 は player 周囲 ring 描画と invincibleT 関連のみ、Cell 3 担当の弾側マーカー (v08 (d') 5F fadeout) コードと **非重複**
- **Stage 4 自判定**: **高 (採用継続)**

### Cell 4: 観点 3 弾側マーカー × amplification
- **v09 §C286 から不変**
- **v10 (g) 編集 6 箇所 非重複確認**: line 142/220/336/540/725-726/915 は capPlateauT timer + capColor 判定のみ、Cell 4 担当の chain 末尾 popup 弾種別 amp 候補 (未実装) と **非重複**
- **Stage 4 自判定**: **中**(継承)、chain 末尾 popup 弾種別は未獲得で残る → v11 以降候補

### Cell 5: 観点 6 7 区分 spawn テーブル × polishing
- **v09 §C286 から不変**
- **v10 (g) 編集 6 箇所 非重複確認**: line 142/220/336/540/725-726/915 は cap reach polish timer のみ、Cell 5 担当の spawn テーブル 6/7 区分 polishing コードと **非重複**
- **Stage 4 自判定**: **高**(継承)

### Cell 6: 観点 6 7 区分 spawn テーブル × amplification
- **v09 §C286 から不変** (v08 (a) 時間 bar 実装、v10 でも不変)
- **v10 (g) 編集 6 箇所 非重複確認**: line 142/220/336/540/725-726/915 は capPlateauT 専用、Cell 6 担当の時間 bar (v08 (a)) / 区分 amp コードと **非重複**
- **Stage 4 自判定**: **高 (採用継続)**

### Cell 7: 観点 7 180F cap reached 大成功反応 × polishing **[v10 (g) の主戦場 / 本 C287 で詳細記述]**

- **v09 §C286 で発見された問題**: `state.invincibleT === BUZZ_INVINCIBLE_CAP` は **エッジ条件** (cap reach 瞬間の 1F のみ true)、plateau ではない。残り 179F は橙色のまま (= 持続 plateau 不在)。稠密 phase で flicker、疎 phase で 1F gold flash → maxChainFlashT/popup 既存演出と区別不能

- **v10 (g) のコード根拠**:
  - 定数 `CAP_PLATEAU_FRAMES=30` (line 142)
  - state `capPlateauT:0` (line 220)
  - startGame reset `state.capPlateauT=0` (line 336)
  - update tick `if(state.capPlateauT>0)state.capPlateauT--;` (line 540) — 毎フレーム減衰
  - onGraze 内 cap reach 検出時 `state.capPlateauT=CAP_PLATEAU_FRAMES;` (line 726) — `wasCapNotReached && state.invincibleT===CAP` の遷移瞬間にセット
  - `const capColor=state.capPlateauT>0;` (line 915) — capColor が真の plateau (0.5秒持続) として判定される

- **Stage 4 ship 直後 mental simulation (本 C287 新規)**:
  - **疎な graze phase (例: phase 1 序盤)**: cap reach 単発 → capPlateauT=30 セット → 毎フレーム減衰で 30F (0.5秒) 持続 → player 周囲 ring が黄金 #ffd870 で 0.5秒 plateau → maxChainFlashT (20F=0.33秒 全画面 flash) + 大型 ring (30F=0.5秒) + popup 'MAX CHAIN!' (60F=1秒) と協調。3 演出の長さが **0.33-0.5-1.0 秒の 3 段階階層** で重なる → 「flash → plateau → popup フェードアウト」の **時間差分解** が **時間軸 raster** として機能する見込み (Stage 3 予測通り)
  - **稠密 graze phase (例: phase 4-5 圧力区間)**: cap reach 後 1 秒以内に次の graze 圧 → invincibleT が 180F 維持されるが、次回 cap reach (= wasCapNotReached && invincibleT===CAP の遷移) が起きるためには **一旦 invincibleT が 180F 未満に落ちる必要がある** → これは onGraze 加算前に invincibleT<CAP のチェック (`wasCapNotReached`) が真になるタイミングのみ → 連続 cap reach は実質「一度 cap 抜けて再到達」の頻度 → capPlateauT も同タイミングで再セット → 30F 連続 plateau (flicker 解消)
  - ただし **エッジケース未検証**: `wasCapNotReached=true && state.invincibleT === BUZZ_INVINCIBLE_CAP` という遷移を判定するロジック (line 710) は v09 (f) のまま再利用、cap 中の連続 graze で invincibleT が常に CAP のままなら **再セット発火しない** → 1 度の cap reach plateau 30F が終わると以降は cap 中でも橙色のまま (持続 cap 中 plateau ではなく **cap reach イベント plateau**)

- **Stage 4 自判定 (本 C287)**: **採用継続 × 中(暫定)**。
  - 設計意図 (= cap reach **イベント** の plateau 0.5秒) としては Stage 3 予測通り動く見込み
  - ただし **「cap 中ずっと黄金」** という素朴期待 (= v09 §C286 README で謳っていた「cap 持続中=黄金 ring」の元々の表記意図) は v10 (g) でも **実現しない** (cap reach **イベント** の plateau ≠ cap **状態** の plateau)
  - Nao_u 評価で「cap 中ずっと黄金にしてほしい」と出た場合は v11 候補 (h) として「cap 状態 plateau 化 = `state.invincibleT===CAP || state.capPlateauT>0` の OR 条件」を導入する経路を予約 (本 v10 では着手しない)
  - 副作用ゼロ (定数 + state + 5 行追加、line 915 の右辺のみ置換)、戻し方 6 行明確 → 1 機構刻み守準拠

### Cell 8: 観点 7 180F cap reached 大成功反応 × amplification
- **v09 §C286 から不変** (弧長表示 (g') は v09 §C286 で却下、v10 でも継承)
- **v10 (g) 編集 6 箇所 非重複確認**: line 142/220/336/540/725-726/915 は cap reach **polishing** (Cell 7 担当) 側のみ、Cell 8 担当の cap reached **amp** 候補 (弧長表示却下 / chain counter ●●○ 未実装) と **非重複**
- **Stage 4 自判定**: **中**(継承)、Cell 7 (g) capPlateauT が 0.5秒持続として「cap reach **イベント** の polishing」を担う、amp 余地は別軸 (chain counter ●●○ 形式) で v11 以降

### Cell 9: 矩形横断観察 (v10 ship 後 Stage 4 整合性チェック) **[本 C287 で詳細記述]**

- **v09 §C286 主張 ④ 再修正 の継承**:
  - v08 §C281 「cap 持続中 polishing 実質ゼロ」→ v09 (f) で着手したが **エッジ条件のため部分回収のみ** (v09 §C286 で判明)
  - v10 (g) で `capPlateauT` 独立 timer 導入 → **cap reach イベント** の 0.5秒 plateau は物理化された

- **本 v10 ship 後の主張 ④ 再々修正 (本 C287 新規)**:
  - **v10 (g) は「cap reach **イベント** の plateau」を実現したが、「cap **状態** の plateau」は実現していない**
  - 設計概念の分解: 「cap 持続中 polishing」という元々の課題は **2 つの意図** を含んでいた:
    - (i) **cap reach 達成感の時間軸分解** (flash 0.33秒 / 大型 ring 0.5秒 / popup 1秒 の中に黄金 ring 0.5秒を挟む) → **v10 (g) で実現**
    - (ii) **cap 中 (180F=3秒間) の持続 ID 強化** (cap 中はずっと黄金で「無敵延長中」と読める) → **v10 (g) では未実現**、v11 候補 (h) で別経路
  - Cell 7 ship 後 mental sim で (i) と (ii) の差を初めて分離 → §C281 → §C284 → §C286 → 本 §C287 で **4 サイクル目の主張 ④ 修正** (= 設計概念の解像度が 1 段階上がった)

- **Stage 4 横断結論信頼度**: **中-高 (自己訂正含む)**。誤読のレイヤーが 1 段下がったが、4 サイクル目の修正で **「cap 中持続 polishing」と「cap reach イベント polishing」の概念分離** が明示された → 次サイクル以降の Stage 3 予測の解像度は上がる

- **R-I 死守事例化 (本 v10 で 2 サイクル目連続)**: v09 §C286 で「ship 経由しないと誤読発見できない」を事例化、本 v10 で「ship→再判定で **設計概念の解像度** が 1 段上がる」を追加事例化 → R-I「人間プレイは判定装置でなく最終確認装置」の **拡張形** = 「ship→AI 自プレイで設計概念の解像度を上げる装置」

---

## 類似事例調査 (M-41 evidence) **[本 C288 Phase 4 新規追加]**

**目的**: `feedback_prior_art_citation_must_verify.md` t:5 (M-41) の「動かさなかった理由」検証要件 (類似事例 5 本必須) に対し、本 v10 (g) capPlateauT 機構 (cap reach **イベント** の 0.5 秒持続 plateau timer) の類似先行事例を能動探索 → 検索結果を Stage 4 横断結論信頼度 (Cell 9 中-高) の補強根拠として固定化する。本節は記事執筆 / knowledge 化ではなく v10/self_judgment.md 内の **Stage 4 判定文書補強** として記録する (`feedback_means_ends_reversal_check.md` t:5)。

**検索クエリ**: `danmaku graze cap plateau cooldown timer player risk reward escalation bullet hell design 2026`

**実行**: 本 C288 Phase 1 step 6 で外部検索実行、`log/external_search.log` 2026-06-04 Ash エントリに生 log 残置済み

**ヒット件数**: 8 件 / そのうち主要 4 ヒットを以下に要約

### 主要 4 ヒット

1. **Sparen's Danmaku Design Studio** ([sparen.github.io/ph3tutorials/ddsga2.html](https://sparen.github.io/ph3tutorials/ddsga2.html))
   - **要旨**: 弾道の identification / prediction / manipulation が danmaku challenge の根源、player に control / consistency / awareness を最大供給することが top priority
   - **capPlateauT との接続**: 「player awareness 供給」軸では capPlateauT も「cap reach **イベント** を 30F (=0.5秒) 持続させ player 認知に時間軸 raster を作る」設計と同方向。ただし **具体機構** (graze cap 後の plateau timer) は記事中に登場せず、player awareness 供給は弾側 (bullet pattern) 側論述に集中
   - **直接対応**: なし

2. **Boghog's bullet hell shmup 101** ([shmups.wiki](https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101))
   - **要旨**: graze=risk-reward scoring の標準解説、Psyvariar の変則設計 ("level up 時無敵 → graze ストリーム強制") を例示
   - **capPlateauT との接続**: Psyvariar の「level up 時無敵 → 強制 graze ストリーム」ループは graze_log v10 の「cap (180F invincibility) reach」と類似構造だが、Psyvariar 側は「無敵 → 次サイクル誘発」、本 v10 (g) は「cap reach **イベント** の 0.5 秒 polish」で **意図が異なる** (誘発 vs 達成感の時間軸分解)
   - **直接対応**: なし

3. **TV Tropes Bullet Hell** ([tvtropes.org/.../BulletHell](https://tvtropes.org/pmwiki/pmwiki.php/Main/BulletHell))
   - **要旨**: Touhou スタイル graze=ポイント、Cave DoDonPachi=escalating bullet density による標準設計の網羅
   - **capPlateauT との接続**: graze=scoring mechanic 一般論のみで、graze cap 後の polish timer 設計は項目化されていない
   - **直接対応**: なし

4. **Danmaku Unlimited 2 Review (Konnetwork)** ([thekonnetwork.com/danmaku-unlimited-2-review](https://thekonnetwork.com/danmaku-unlimited-2-review/))
   - **要旨**: 2026 年方向性として clarity / control / readable escalation 重視、movement / scoring / defensive systems を統合し "improvement feels earned rather than gated" を実現
   - **capPlateauT との接続**: 「readable escalation」「improvement feels earned」の設計哲学方向は capPlateauT の意図 (cap reach 達成感の時間軸明示化) と一致。ただし **具体機構** としての graze cap timer は記事中に登場せず
   - **直接対応**: なし

### capPlateauT 機構直接対応ヒット件数: **0 / 8**

### 「該当事例なし」の Stage 4 横断結論信頼度への接続

- Cell 9 Stage 4 横断結論信頼度を **中-高 (自己訂正含む)** と記述したが、本検索 0 件結果は capPlateauT が「外部事例なき独自軸」であることの **エビデンス付き裏付け** となる
- ただし「外部事例なし」自体は **両刃**:
  - (i) **独自性が高い可能性** (positive): graze cap reach 後の plateau timer が業界一般論で扱われていない → 未開拓設計空間の可能性
  - (ii) **業界が既に避けた失敗設計の可能性** (negative): 過去に試され捨てられた設計の検索エンジン残響なし、を意味する場合もある
- 本 C288 では (i) (ii) のどちらかを判定する材料を持たない → Nao_u プレイ評価 + 次サイクル以降の Stage 4 自プレイ継続観察で判定材料を蓄積する方針
- **M-41 要件 (類似事例 5 本必須) は「動かす方向」へのエビデンス供給を意図** していたが、本検索 0 件はその逆方向 = **「動かす方向の外部支援なし → 独自軸として進める判断は内的根拠 (Cell 7 mental sim / Cell 9 4 サイクル目主張 ④ 再々修正) のみに依拠する」** という構造を Stage 4 信頼度評価に明示化する役割を持つ

### 本 0 件結果が次サイクル以降の Stage 3/4 に与える具体影響

- **Stage 3 予測**: v11 候補 (h) `state.invincibleT===CAP || state.capPlateauT>0` OR 条件導入時、(h) も外部事例検索で 0 件になる可能性が高い (本検索クエリの範囲では cap **状態** の持続 polish 設計も登場せず) → (h) Stage 4 着手前事前篩でも内的根拠依拠が継続する見込み
- **Stage 4 自判定**: Cell 7 (g) 採用継続 × 中(暫定) の **中(暫定)** 評価は本 0 件結果で **下方修正なし** (外部事例なし = 失敗確定ではない)、ただし **上方修正もなし** (外部事例なし = 成功確定でもない) → Nao_u 評価到達まで暫定保持

---

## (g) 表層/基板 1ビット判定 — **表層チューニング**

| 軸 | 判定 |
|---|---|
| **lightness/darkness 軸変更 (色値の置換)** | △ (色値は v09 (f) と同じ #ffd870、capColor 条件式のみ置換) |
| **新メカニクス (新規 timer/state の追加)** | △ (新規 state `capPlateauT` + 新規定数 `CAP_PLATEAU_FRAMES=30` + 新規 timer 減衰 → **表層と基板の境界線上**) |
| **戻し方** | ○ (6 箇所削除/置換で v09 (f) 完全等価) = 表層チューニングの戻し方典型 |
| **コード追加範囲** | line 142 / 220 / 336 / 540 / 725-726 / 915 の 6 箇所、`feedback_clone_strategy.md` 守の「削除可能改良 1 個刻み」要件充足 |

**結論**: **表層チューニング (境界線上)** — 色値・描画ロジックは v09 (f) を継承、capColor 条件式の右辺のみ拡張 = 表層側。ただし新規 state + 新規 timer は基板側の侵襲ありで境界線上。次サイクルで「表層」「基板」「境界」3 値判定の運用化を検討候補。

---

## v11 候補列挙 (本 C287 では Stage 3 予測雛形のみ、Stage 4 着手前事前篩は次サイクル)

### (h) capStateColor — cap 状態 (invincibleT===CAP) の持続 ID 強化 (v11 候補)

**動機 (本 C287 Cell 9 主張 ④ 再々修正からの直接派生)**: v10 (g) で「cap reach **イベント** の plateau」は実現したが「cap **状態** の plateau」は未実現。v11 (h) で `state.invincibleT===CAP || state.capPlateauT>0` の OR 条件を導入し、cap 中 (180F=3秒) の player 周囲 ring を持続的に黄金化する。

**Stage 3 予測 (実装難度)**: 1 行置換 (line 915 capColor 条件式の右辺を `state.capPlateauT>0||state.invincibleT===BUZZ_INVINCIBLE_CAP` に置換)、戻し方 1 行。**Stage 4 着手前事前篩は次サイクル C288 以降で確定**。

### v11 着手判断確定は次サイクル C288 以降

本 C287 はあくまで v10 (g) Stage 4 ship 直後の **部分埋め (Cell 7 + Cell 9)** 雛形 + (h) v11 候補の **Stage 3 予測雛形** のみ。次サイクル以降で (h) 含む全 9 セル詳細 + 着手前事前篩確定。

---

## Stage 4 C287 制約遵守チェック

- [x] `feedback_headless_unfit_for_unfinished_eval.md` t:5: 本セクションは index.html コード line 番号 + Ash 自プレイ mental simulation のみで判定、headless 数値ゼロ参照
- [x] `feedback_clone_strategy.md` t:5: (g) Stage 4 ship 後再判定 = 1 機構刻み守準拠、philosophizing layer 踏み込みなし (戦略レイヤー言及ゼロ)
- [x] `feedback_prediction_responsibility.md` t:5: Stage 3 (v09 §C286 g 予測) → Stage 4 (g) 着手前事前篩 (v09 §C286) → Stage 4 v10 ship 後再判定 (本 §C287 Cell 7) → §C281 → §C284 → §C286 → §C287 4 サイクル目の設計概念解像度向上の連続体を 1 ステップ前進
- [x] `feedback_means_ends_reversal_check.md` t:5: 本 §C287 の出力は (g) Stage 4 採用継続 × 中(暫定) + 表層/基板 1ビット判定 = 表層 (境界線上) + v11 (h) 候補 Stage 3 予測雛形。次サイクル C288 で完全埋め + v11 着手判断
- [x] R-I 死守 (`game_lessons_log.md` R-I): Nao_u v05/v06/v07/v08/v09 評価返信未到達でも iteration を止めない。(g) ship + 本 C287 Stage 4 部分埋め = ship→AI 自プレイ→訂正→次手確定の閉路の **2 サイクル目連続事例化**
- [x] `feedback_prior_art_citation_must_verify.md` t:5 (M-41): **C288 Phase 4 で「## 類似事例調査 (M-41 evidence)」節を追加し、4 主要ヒット (Sparen / Boghog / TV Tropes / Danmaku Unlimited 2) を URL + 引用要約 + capPlateauT 接続評価付きで記録、直接対応ヒット 0 / 8 を Stage 4 横断結論信頼度補強根拠として明示** → M-41「URL貼るだけ不可、引用文抜粋カラムに該当機能の記述文を併記」要件を充足、「該当事例なし」を能動エビデンスとして記録

---

## §0a 層A pending との関係

`t-260524125456-74d6` (v06 Nao_u プレイ評価返信受領後の 5 機構統合版作成) は本 C287 では受領状況確認のみ、未受領継続で **層A pending 継続保留**。本 self_judgment は v06 5 機構統合版とは独立の v10 iteration 評価で、§0a pending を消化していない。

---

## 接続先

- `game/graze_log/v10/README.md` — v10 (g) 実装明細 (本 self_judgment の評価対象)
- `game/graze_log/v10/index.html` line 142 / 220 / 336 / 540 / 725-726 / 915 — v10 (g) 主実装範囲
- `game/graze_log/v09/self_judgment.md` §C286 — Cell 7 エッジ条件発見 + (g) Stage 3 予測 + 着手前事前篩 (元文書)
- `game/graze_log/v08/self_judgment.md` §C281 主張 ④ + §C284 — 3 サイクル連続継承された誤読の前段
- `memory/game_lessons_log.md` R-A〜R-I — Ash/Log 共有抽象ルール (本 C287 で R-I 拡張形「ship→AI 自プレイで設計概念の解像度を上げる装置」を新規事例化)
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任の連続体、本 C287 は §C281/§C284/§C286 連続体の §C287 4 サイクル目
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 本 C287 は index.html line 番号 + mental sim のみで根拠化
- `memory/feedback_clone_strategy.md` t:5 — 守の段階 1 機構刻み制約、(g) は 6 箇所で戻し方明確
- `memory/feedback_means_ends_reversal_check.md` t:5 — 本 C287 は v10 ship 後再判定の **部分埋め** で次サイクル完全埋めへの物理ゲート開放

— Ash (Win2) 2026-06-04 C287 Phase 4 大作業 (v10 (g) capPlateauT 1 機構実装 + ship 直後 Stage 4 Cell 7/Cell 9 部分埋め + 4 サイクル目主張 ④ 再々修正 = 「cap reach **イベント** の plateau」と「cap **状態** の plateau」の概念分離)

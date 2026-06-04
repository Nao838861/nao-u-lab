# graze_log v11 — 観点 7 polishing (h) cap **状態** plateau 化 候補 (Stage 1+2 確定 / 実装は次サイクル)

**status**: v11 (h) Stage 1+2 候補確定 (実装は次サイクル C290)

**親情報**:
- v10 (g) `capPlateauT` ship (commit `47cba46a0` v10 README / `41af2fe2a` v10 capPlateauT 実装 / `5739ef502` v10 self_judgment Cell 1-6+8 編集 6 箇所 非重複明示 + M-41 類似事例 0/8 / `c0a948244` Phase 3 結果) 後の `v10/self_judgment.md` §C287 Cell 9 主張 ④ 再々修正 = **「cap reach **イベント** plateau」は v10 (g) で実現したが「cap **状態** plateau」は未実現** を継承
- 設計概念分解: (i) cap reach 達成感の時間軸分解 = v10 (g) capPlateauT で実現 / (ii) cap 中 (180F=3秒) の持続 ID 強化 = **本 v11 (h) で着手**
- v10 (g) 候補列挙 §「(h) capStateColor — cap 状態 (invincibleT===CAP) の持続 ID 強化 (v11 候補)」(v10 self_judgment.md line 161-165) で Stage 3 予測雛形のみ予約、Stage 4 着手前事前篩は **本 v11 で初確定**

---

## Stage 1 候補ブレスト (≥3 案)

「cap **状態** (invincibleT===BUZZ_INVINCIBLE_CAP) の持続中 (180F=3秒) を player 周囲 ring の **黄金色 #ffd870 で持続表示** する」目的に対し、4 案 (h-α / h-β / h-γ / h-δ) を列挙。

### Case (h-α) OR 条件案 [単一行置換]

- **コード変更見積もり**: `index.html` line 915 単一行 置換 (1 行)
  - 現行 v10 (g): `const capColor=state.capPlateauT>0;`
  - 提案 v11 (h-α): `const capColor=state.capPlateauT>0||state.invincibleT===BUZZ_INVINCIBLE_CAP;`
- **戻し方**: 1 行 (右辺末尾 `||state.invincibleT===BUZZ_INVINCIBLE_CAP` を削除) → v10 (g) 完全等価
- **v10 (g) との非重複明示**: v10 (g) は line 915 capColor 条件式右辺を `state.capPlateauT>0` に **置換**、本 (h-α) は **同じ行の右辺末尾に OR 拡張**。state 追加なし、定数追加なし、新規描画ロジックなし。**bounded edit の最小単位** (SkillOpt 風 1 cell)。
- **挙動**:
  - 疎な graze phase: cap reach 単発 → 30F (0.5秒) capPlateauT plateau (= v10 (g) と同じ polish) → 続いて invincibleT が 180F 残っている間ずっと cap 状態 plateau → 計 180F (=3秒) 連続 黄金 ring。cap 抜け (invincibleT=0) と同時に橙色 fadeout (line 908 v08 (d') 5F fadeout) へ遷移
  - 稠密 graze phase: cap reach 後 graze 圧で invincibleT が 180F 維持されたまま、cap 中ずっと黄金。次の cap reach (= wasCapNotReached && invincibleT===CAP 遷移) は capPlateauT 再セットだが、capStateColor=true 中なので OR 条件で見た目変化なし。flicker は完全解消。

### Case (h-β) 新規 state `capStateColorT` 分離案 [4 行追加]

- **コード変更見積もり**: 約 4 行 (新規 state 1 + reset 1 + tick で set/reset 1 + 条件式 OR 拡張 1)
  - state 初期化: `capStateColorT:0,`
  - startGame reset: `state.capStateColorT=0;`
  - update tick: `state.capStateColorT=(state.invincibleT===BUZZ_INVINCIBLE_CAP)?1:0;`
  - line 915: `const capColor=state.capPlateauT>0||state.capStateColorT>0;`
- **戻し方**: 4 行削除 → v10 (g) 完全等価
- **v10 (g) との非重複明示**: state 名 `capStateColorT` は v10 (g) `capPlateauT` と命名空間 **完全分離**。capPlateauT (cap reach **イベント** 0.5秒) と capStateColorT (cap **状態** 全期間) を別 state で保持し、後の amp 拡張 (色階層化 / 別 ring 太さ等) で 2 つの意図を **分離操作可能** にする余地を残す。
- **挙動**: h-α と視覚的には同一だが、内部状態で 2 つの意図 (event vs state) が分離される。

### Case (h-γ) 描画側分岐 = 2 重 ring 案 [4-5 行追加]

- **コード変更見積もり**: 約 4-5 行 (新規描画 if ブロック、line 919 直後に挿入)
  ```javascript
  // v11 (h-γ): cap 状態 中は外側に薄い黄金 ring 追加 (capPlateauT 0.5秒 ring と物理的に重ならない)
  if(state.invincibleT===BUZZ_INVINCIBLE_CAP){
    ctx.strokeStyle='rgba(255,216,112,0.45)';
    ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(state.player.x,state.player.y,23,0,Math.PI*2);ctx.stroke();
  }
  ```
- **戻し方**: 5 行ブロック削除 → v10 (g) 完全等価
- **v10 (g) との非重複明示**: v10 (g) capColor (半径 20 player 周囲 ring) と本 (h-γ) 新規 ring (半径 23) は **物理的に重ならない別 ring**。capPlateauT 0.5秒 = 半径 20 ring の色切替 (cap reach 達成感), 本 (h-γ) = 半径 23 外側 ring (cap 状態 ID)。描画位置で意図を **空間分離**。
- **挙動**: 内側 ring (半径 20) は capPlateauT 0.5秒のみ黄金、外側 ring (半径 23, 薄い α=0.45) は cap 中 180F 持続。2 つの ring が同時に出る期間 (cap reach 後 0.5秒) は内側黄金 + 外側薄黄金、その後 (179.5秒残り) は内側橙 + 外側薄黄金。

### Case (h-δ) 全案却下 / Stage 4 自プレイ再判定優先

- **動機**: v10 (g) ship 後の Stage 4 自プレイ判定 (v10/self_judgment.md §C287 Cell 7 「中(暫定)」) は **mental simulation** のみで実プレイ確認なし。Nao_u 評価未受領継続 (v05/v06/v07/v08/v09 沈黙) + 内部判定も暫定 = 「cap 中ずっと黄金にしてほしい」の **要求源が存在しない** 状況での先回り改修になる。
- **対案**: v11 では (h) Stage 4 着手前事前篩で **不採用** を選び、次サイクルは別軸 (Cell 1-4-6-8 amp 余地、Cell 5 spawn テーブル polish、v06 5 機構統合版作成) に振替。1 機構刻み守を維持。
- **コード変更見積もり**: 0 行
- **戻し方**: N/A

---

## Stage 2 着手前事前篩 (R-A〜R-I / clone_strategy 守 / 装置の向き判定 / feedback_prediction_responsibility)

### 篩マトリクス

| 軸 | h-α (OR 条件) | h-β (state 分離) | h-γ (2 重 ring) | h-δ (全案却下) |
|---|---|---|---|---|
| **R-A 核体験強化 or 新層追加** | △ (cap reach event と cap state が同色で混じる = 識別力低下、ただし両意図とも "graze cap 中" 圏の同質性として強化に振れる) | ○ (state 分離で後の amp 余地保持、本 v11 では視覚的に h-α と同等) | △ (2 重 ring は v10 README 25 行目「同時にいろんなことが起きすぎる」リスクを直接踏む) | ? (着手しない = 強化判断保留) |
| **R-B 罰駆動回避** | ○ (報酬経路の polish 拡張、罰要素なし) | ○ | ○ | N/A |
| **R-C 見えるルール** | ○ (cap 中 179F の橙 → 黄金で「cap 状態」が画面で可視化、現行は invincibleT===CAP の 1F のみ可視) | ○ (h-α と同等) | ○ (2 つのルールが 2 つの ring で分離可視化) | × (現状 "cap 中持続" が画面でほぼ見えないままを継続) |
| **R-D 型から始める / 1機構刻み** | ◎ (1 行置換は守の最深部、bounded edit 最小単位) | △ (4 行追加、守の境界線上) | △ (4-5 行新規描画ロジック、新メカニクス境界) | ◎ (着手しない = 1 機構刻み最大遵守だが閉路を止める副作用) |
| **R-E 対症療法回避 / 3世代** | △ (v09 (f) → v10 (g) → v11 (h-α) = 3 世代連続 "cap 周辺改修"、3 世代目で原点回帰ライン到達) | △ (同上) | △ (同上) | ○ (3 世代目を踏まず原点回帰の余地を残す) |
| **R-F 指標先書き** | N/A (描画のみ、headless 指標変更なし) | N/A | N/A | N/A |
| **R-G target 維持** | ○ (target = cap reach を狙う自発リスク graze 運用者、cap 中の認知補強は target に直接効く) | ○ | ○ | △ (cap 中可視化を先送りすると target の cap reach 体験は v10 (g) のままで 1 サイクル停滞) |
| **R-H 実装動詞** | ○ ("invincibleT===CAP の間 player 周囲 ring を黄金色で持続表示") | ○ ("cap 状態専用 timer state で持続色切替") | ○ ("cap 中は半径 23 の外側に薄い黄金 ring を追加") | N/A |
| **R-I 着手前類似事例 / 自己判定** | v10 §C288 で M-41 evidence 検索 0/8 確認済み、本 (h-α) は同じく 0/n 見込み (graze cap **状態** plateau polish の業界先例なし) → 内的根拠依拠継続 | 0/n 見込み | 0/n 見込み、ただし「2 重 ring」一般は東方系で時折出現 (近接圏 + 当たり判定可視化) で完全 0 ではない | N/A (着手しない = R-I 適用外) |
| **clone_strategy 守 (削除可能改良 1 個刻み)** | ◎ (1 行、戻し方 1 文字 truncate) | △ (4 行、削除可能だが h-α より 4 倍) | △ (新規描画 if ブロック、新メカニクス境界) | ◎ (着手しない) |
| **装置の向き (救援 vs 窒息)** | 救援 (cap 中可視化) ただし副作用として capPlateau 意図 (時間軸分解) を **窒息** する可能性 = 同色同 ring で 0.5秒 polish と 3 秒 state が混じり、polish 識別が薄まる | 救援 (state 分離で意図混同回避だが視覚は h-α と同等で実利乏しい) | 救援 (空間分離) だが描画密度↑で **視覚的窒息** リスク (graze_log は既に閃光 + 大 ring + popup + maxChainFlash + capPlateau で密) | 中立 (装置を作らない) |
| **feedback_prediction_responsibility Stage 3 予測** | cap reach 後 30F は v10 (g) と同じ polish 体験、続く 150F も黄金持続 → 達成感の **持続表示** に切り替わる。Nao_u v05〜v09 沈黙下で要求源不明だが、Cell 9 主張 ④ 再々修正で内的に「(ii) cap 中持続 ID 強化」が明示課題化 = 内的予測根拠あり | h-α と同視覚、state 分離価値は本 v11 では発揮されず未来 amp 用の予備 (M-41 風「実装前先回り構造化」リスク) | 2 重 ring で意図分離は明確だが視覚密度上昇 = Log_cdx 観点 5「常時表示情報は少ない方が良い」直接抵触懸念 | 着手しないので Stage 3/4 予測のすり合わせ機会消失 |

### 各案の判定

- **h-α (OR 条件案)**: **中-高 (採用候補 ◎)** — R-D / clone_strategy 守の最強適合、bounded edit 1 行、戻し方 1 文字。副作用 (capPlateau 意図窒息) は本質的だが 1 行で戻せるため **Stage 4 ship 後の AI 自プレイ mental sim で「2 つの意図が混じって読みにくい」を確認した場合、即 h-α → h-β / h-γ への乗り換え経路を保持**。
- **h-β (state 分離案)**: **中 (不採用 △)** — h-α と視覚的に同等で 4 倍のコスト、得る差は概念分離のみ。**先回り構造化**の典型 = 実装前に「将来 amp する時のために state 分離しておく」は v10 §C288 で M-41 evidence 0/8 で警戒した「実装前の防衛的設計」と同型。h-α で十分なら不採用。**h-α → 視覚的に問題発覚した場合のみ h-β へ移行** (Stage 4 ship 後の経路)。
- **h-γ (2 重 ring 案)**: **低 (不採用 ×)** — v10 README L24「同時にいろんなことが起きすぎる」自己警戒を直接踏む。graze_log は既に閃光 (20F) + 大型 ring (30F) + popup (60F) + maxChainFlash (20F) + capPlateau (30F) + player 周囲 ring + Lv up 橙 ring + cap 中橙 ring と密、半径 23 外側 ring 追加は描画密度の限界を超える可能性高。
- **h-δ (全案却下)**: **低 (不採用 ×)** — v10 self_judgment Cell 9 主張 ④ 再々修正で **(ii) cap 状態 plateau 課題化** が明示済み、これを 1 サイクル先送りするのは ship→AI 自プレイ→次手予約→次サイクル実装 の閉路を **止める** 方向。閉路を止めるべきは Nao_u から「v11 やめて」の signal が来た時のみで、現時点では到達していない。

### 採用案: **h-α (OR 条件案)**

**確定根拠**:
1. **R-D 1 機構刻み守 最強適合**: 1 行置換、bounded edit 最小単位
2. **clone_strategy 守の最深部 (戻し方 1 文字 truncate)**: 削除可能改良 1 個刻み完全準拠
3. **副作用の本質性**: capPlateau 意図窒息は本質的副作用だが、1 行戻しで即解消可能 → **Stage 4 ship 後 mental sim → 自プレイ → 必要なら h-β / h-γ への乗り換え** という閉路を保持
4. **装置の向き = 救援優位、窒息副作用は可逆**: cap 中 179F の可視化 = R-C 「見えないものは存在しない」の直接修正、窒息副作用は 1 行戻しで解除可能なため逆向きへの転落リスク小
5. **bounded edit + held-out validation 概念の実地検証**: Phase 2 SkillOpt 分析の「bounded add/delete/replace + strict-improvement on held-out validation」概念を、本 (h-α) で初めて手作業実地適用する (1 行の bounded replace + Stage 4 ship 後再判定 = held-out validation 風)

### 不採用案の保留経路

- **h-β**: Stage 4 ship 後 mental sim で「2 つの意図が混じって読みにくい」が確認された場合、即時昇格候補 (v12 候補として予約)
- **h-γ**: graze_log の描画密度が将来下がった場合 (例: Lv up 橙 ring を別表現に置換した後) に再評価候補
- **h-δ**: Nao_u から v05/v06/v07/v08/v09 のいずれかに「v11 着手しないでほしい」signal が来た場合に発動

---

## v11 で増やさないもの (1 機構刻み守準拠)

v10 §C287 / §C288 で挙げた未着手候補のうち、v11 では着手しない:

- **(g') ring 弧長 = invincibleT/180**: v09 §C286 で却下、v10 で継続却下、v11 でも除外
- **(h-β) state 分離 / (h-γ) 2 重 ring**: 本 Stage 2 篩で不採用、Stage 4 ship 後の乗り換え経路として保留のみ
- **Cell 1-4-6-8 amp 余地**: 別 iteration 割当 (v07 README §着手手順)
- **観点 6 spawn テーブル / 観点 8 bad policy headless**: 別 iteration 割当
- **§0a pending `t-260524125456-74d6` v06 5 機構統合版**: Nao_u 評価返信受領待ち、本 v11 と独立に保留継続

---

## (h-α) 表層/基板 1ビット判定

| 軸 | 判定 |
|---|---|
| **lightness/darkness 軸変更 (色値の置換)** | × (色値追加なし、#ffd870 / #ffa040 とも v10 (g) と同一) |
| **新メカニクス (新規 timer/state の追加)** | × (state 追加なし、定数追加なし、新規描画ロジックなし) |
| **戻し方** | ◎ (1 行右辺末尾 truncate で v10 (g) 完全等価) = 表層チューニングの最深部 |
| **コード追加範囲** | 1 行 (line 915 右辺の OR 拡張) |

**結論**: **表層チューニング (最深部)** — 既存 capColor 条件式の **右辺拡張のみ**、state も timer も描画ロジックも追加なし。v10 (g) が「表層と基板の境界線上」と判定されていたのに対し、本 (h-α) は v10 (g) の表層層を再利用して条件式右辺を 1 token 追加するだけ = **純粋表層**。次サイクル実装時に「これは最も小さい変更で最大の効果」かを Stage 4 自プレイで判定する。

---

## 接続先

- `game/graze_log/v10/index.html` line 915 — v11 (h-α) 編集対象行 (capColor 条件式)
- `game/graze_log/v10/index.html` line 142 / 220 / 336 / 540 / 725-726 — v10 (g) capPlateauT 機構 (本 v11 で再利用、編集なし)
- `game/graze_log/v10/self_judgment.md` §C287 Cell 7 / Cell 9 — v10 (g) 「cap reach **イベント** plateau」実現と「cap **状態** plateau」未実現の概念分離 (本 v11 の起点)
- `game/graze_log/v10/self_judgment.md` §C288 類似事例調査 (M-41 evidence) — capPlateauT 直接対応 0/8、本 (h-α) も同様 0/n 見込みを継承
- `game/graze_log/v09/self_judgment.md` §C286 主張 ④ 再修正 — 3 サイクル連続継承された誤読の前段 (本 v11 で 4 サイクル目主張 ④ 再々修正の物理回収候補確定)
- `memory/game_lessons_log.md` R-A〜R-I — Ash/Log 共有抽象ルール (本 Stage 2 篩で 9 軸全件適用)
- `memory/feedback_clone_strategy.md` t:5 — 守の段階 1 機構刻み制約 (本 v11 で「右辺 OR 拡張のみ」= 守の最深部の事例化)
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任の連続体、本 v11 は Stage 1 (4 案) + Stage 2 (篩 9 軸) + Stage 3 予測雛形 (各案挙動) を 1 README に明示
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 本 README は index.html line 番号 + mental sim のみで根拠化、headless 数値ゼロ参照
- `memory/feedback_means_ends_reversal_check.md` t:5 — 本 v11 は **コード変更ゼロ** だが「次サイクル実装の bounded edit 1 行を確定」する物理ゲート開放 (Stage 1+2 文書化 → 次サイクル C290 で 1 行 commit = playable diff 第一義原則の連続体)
- `memory/feedback_prior_art_citation_must_verify.md` t:5 (M-41) — 本 (h-α) は v10 (g) 同型の業界先例なき独自軸として進む、Stage 4 ship 後再判定で内的根拠評価を継続
- `knowledge/20260605_skillopt_text_space_optimizer_bounded_edits_heldout_validation_skill_document.md` — Phase 2 SkillOpt 分析、本 (h-α) は「bounded edits + held-out validation」概念の手作業実地検証 (1 行 replace + Stage 4 ship 後再判定)

---

## 次サイクル C290 着手手順 (本 v11 では実装しない)

1. `game/graze_log/v11/index.html` 作成 = `game/graze_log/v10/index.html` を copy
2. line 915 右辺を v10 (g) `state.capPlateauT>0` → v11 (h-α) `state.capPlateauT>0||state.invincibleT===BUZZ_INVINCIBLE_CAP` に置換 (1 行)
3. ship (commit) → Stage 4 自プレイ判定 (Cell 7 / Cell 9 部分埋め) → v11/self_judgment.md 起稿
4. Stage 4 ship 後 mental sim で副作用 (capPlateau 意図窒息) を確認、必要なら h-β / h-γ への乗り換え判断

— Ash (Win2) 2026-06-05 C289 Phase 4 大作業 (v11 (h-α) OR 条件案 Stage 1+2 確定 + 4 案篩比較 + 採用案 h-α 確定 + 次サイクル C290 で 1 行 bounded edit 実装予約)

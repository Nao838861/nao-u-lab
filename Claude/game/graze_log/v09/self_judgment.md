# graze_log v09 — Stage 4 自プレイ判定 (player 側 9 セル) + (f) 表層/基板 1ビット判定 + v10 候補 (g) 確信度確定 (2026-06-04 C286 Ash)

**status**: v09 (f) cap 持続中 player 周囲 ring 色切替 実装 (commit `a8148ee43 ash: graze_log v09 (f) cap 持続中 player 周囲 ring 色切替 実装 (C285)`) は **self_judgment.md なし** で ship されていた。本 C286 サイクルで Stage 4 player 側 9 セル + (f) 表層/基板 1ビット判定 + v10 候補 (g) 1 個を埋め、v08 §C284 で予約した「v09 ship 後 Stage 4 再判定 → 次 iteration 起点確定」の物理回収を行う。

**判定方法**: `index.html` コード精読 (line 番号付き) + Ash 自プレイ mental simulation (= キー入力 → 内部状態遷移 → 描画出力を頭の中で再生)。`feedback_headless_unfit_for_unfinished_eval.md` t:5 死守 — headless 数値 (route/camper/panic/novice の到達率/score/player_lv_avg) は本判定で根拠ゼロ参照。

**接続元**:
- `game/graze_log/v09/README.md` — v09 (f) 実装明細 (line 897-906)
- `game/graze_log/v08/self_judgment.md` §C188 (line 420-516) — player 側 9 セル原典 (B-2 + 観点3 + 観点6 + 観点7)
- `game/graze_log/v08/self_judgment.md` §C281 (line 519-600) — Ash 自プレイ側 9 セル + Cell 7 主張 ④ 修正「cap 持続 180F polishing 実質ゼロ」
- `game/graze_log/v08/self_judgment.md` §C284 (line 660-707) — v09 候補 (f) 採用 × 高 + (g) invincibleT 進捗 bar/弧長 中保留
- `feedback_prediction_responsibility.md` t:5 — Stage 3→4→5 連続体、本 C286 は Stage 4 v09 ship 後再判定

---

## Stage 4 player 側 9 セル判定 (v09 状態)

v08 §C188 player 側 9 セルから **(f) 実装でコード根拠が変わったセル** (Cell 7 / Cell 8 / Cell 9 矩形横断) を詳細記述、それ以外のセルは「v08 §C188 から不変」を確認のみ。`feedback_memory_update_method.md` 差分追記原則。

### Cell 1: B-2 Hyper Activation × polishing
- **v08 §C188 から不変**: `fireBomb()` lines 342-367 / 3 連 ring + 2 種 flash は v09 未変更 (v09 編集範囲は line 897-906 ring 色切替のみ)
- **Stage 4 自判定**: **低**(継承)。Stage 3 予測「消去波前進感未獲得」は §C188 で外れ判定済、v09 でも変化なし

### Cell 2: B-2 Hyper Activation × amplification
- **v08 §C188 から不変**: gauge UI (lines 935-983) は v09 未変更、phase 別期待ライン依然不在
- **Stage 4 自判定**: **高**(継承)。v08 候補 (b) Stage 4 根拠は不変、Nao_u 評価で amp 強化要求が出た場合の予備候補に維持

### Cell 3: 観点 3 弾側マーカー × polishing
- **v08 §C283 で実装済** (v08 (d') 5F fadeout、line 846-852 / 128-129 / 521-526)。v09 でこのセルの実装は不変
- **Stage 4 自判定**: **高 (採用継続)**。v08 (d') fadeout が「無敵終了の jolt 解消」効果を出していることを v08 §C284 で確認済、v09 でも同挙動 (v09 (f) は player 側 ring 色切替のみで弾側 ring fadeout は無変更)

### Cell 4: 観点 3 弾側マーカー × amplification
- **v08 §C281 から不変**: 「invincibleT 中 = 全弾 2x 対象 → 100% トグル」の前提部分外れ判定は v09 でも維持
- **Stage 4 自判定**: **中(継承)**。chain 末尾 popup (graze 弾種別) は未獲得で残る、v10 以降の候補

### Cell 5: 観点 6 7 区分 spawn テーブル × polishing
- **v08 §C188 から不変**: phase 切替時 1F flash 候補は未着手、Cell 6 (時間 bar) で「先行通知」課題は v08 §C283 で解消済
- **Stage 4 自判定**: **高(継承)**。本セル単独の polishing 余地はあるが、Cell 6 amp が同課題を別解で解消したため優先度低

### Cell 6: 観点 6 7 区分 spawn テーブル × amplification
- **v08 §C282 で実装済** (v08 (a) 画面下端 1px 時間 bar、line 1009-1019)。v09 でこのセルの実装は不変
- **Stage 4 自判定**: **高 (採用継続)**。v08 §C283 で「PHASE_BOUNDARIES 7 tick の周辺視野キャッチ可能」と確認、v09 でも同挙動

### Cell 7: 観点 7 180F cap reached 大成功反応 × polishing **[v09 (f) の主戦場]**

- **v08 §C188/§C281 体感予測**: cap 到達瞬間の polishing は強 (maxChainFlashT=20F + 大型 ring 30F + popup 'MAX CHAIN!' 60F、lines 700-704)、cap 持続中 (180F=3秒間) は通常無敵と同視覚 → 「cap 持続中 polishing は実質ゼロ」(§C281 主張 ④ 修正)。**訂正案: 2-3 行で cap 中 ring を金色 #ffd870 に切替で polishing 中→高**

- **v09 (f) のコード根拠 (line 897-906)**:
  ```
  // v09 (f): cap 持続中 ... は黄金 #ffd870 / それ以外は橙 #ffa040
  if(state.invincibleT>0||state.invincibleFadeT>0){
    const iv=state.invincibleT>0?state.invincibleT/BUZZ_INVINCIBLE_FRAMES:0;
    const fa=state.invincibleT>0?1:state.invincibleFadeT/INVINCIBLE_FADE_FRAMES;
    const pulse=0.5+0.5*Math.sin(state.t*0.35);
    const capColor=state.invincibleT===BUZZ_INVINCIBLE_CAP;
    ctx.strokeStyle=`rgba(${capColor?'255,216,112':'255,160,64'},${(0.35+0.55*iv*pulse)*fa})`;
    ...
  }
  ```

- **Stage 4 mental simulation の重大発見 (= 本セル新規)**: `state.invincibleT === BUZZ_INVINCIBLE_CAP` (=== 180) は **エッジ条件** であり、**プラトー条件ではない**。

  - 更新ループ (line 521-525) で `if(state.invincibleT>0) state.invincibleT--;` が毎フレーム実行 → onGraze が `state.invincibleT=180` をセットした次フレームには 179 に減衰 → `capColor` は **そのフレーム以外 false**。
  - つまり、**graze イベントを発火しない限り capColor=true は 1 フレーム (16.7ms) しか持続しない**。残り 179F (約 3 秒) は橙色のまま — README が謳う「cap 持続中=黄金 ring 持続」は **実装と一致しない**。
  - **稠密 graze phase** (例: phase 4-5 圧力区間で連続 graze) では、graze ごとに `min(invincibleT+60, 180)` で 180 に再飽和するため、おおむね 2-4 フレームごとに 1 フレーム capColor=true → **flicker (点滅)**。視知覚積分 (~100ms) で「金色 tint がかかった橙」と統合される可能性はあるが、純粋な金色 ring 持続にはならない
  - **疎な graze phase** (例: phase 1 序盤、graze 散発) では cap 到達後の 1 フレーム gold flash → 残り 179F 橙、**maxChainFlashT/popup の既存演出と区別不能** (= polishing 効果が独立した情報として伝わらない)

- **Stage 4 自判定**: **採用継続 × 中(降格)**。Stage 3 予測「cap 持続中 polishing 中→高」は **前提部分外れ** (持続ではなくエッジ + 稠密時 flicker)。ただし副作用ゼロ (lines 903 三項分岐 1 箇所のみ、戻し方 3 行以内) で polishing 増分は 0 ではない (稠密 graze phase で「黄色 tint 強化感」あり)。**v09 §C284 確定の「採用 × 高」は v09 ship 後 mental sim で「採用 × 中」に降格**

### Cell 8: 観点 7 180F cap reached 大成功反応 × amplification
- **v08 §C188/§C281 体感予測**: cap 到達まで残 chain ●●○ は前提部分外れ (chain 単位ではなく invincibleT 加算量で判定)、再設計後の **player 周囲 ring 弧長表示** (= 弧長 = invincibleT/180) が整合
- **v09 (f) との関係**: Cell 7 の重大発見「invincibleT===CAP はエッジ条件」を受け、Cell 8 amp 候補 (g 弧長表示) は **(f) の不足を補う方向性** に再定位。弧長 → cap 状態の **持続表示** を担う (= (f) のエッジ flicker を弧長の plateau で補完)
- **Stage 4 自判定**: **中(継承)**。amplification 余地は維持、v10 候補 (g) の Stage 3 根拠として継続有効

### Cell 9: 矩形横断観察 (v09 ship 後 Stage 4 整合性チェック)

- **v08 §C281 主張 (継承)**:
  - 主張 ② **再確認**: 観点 6 時間 bar 余地最大 → v08 §C282 で物理化済 (時間 bar ship)
  - 主張 ④ **修正**: cap 持続中 polishing 実質ゼロ → v09 (f) で着手したが **エッジ条件のため部分回収のみ** (本 C286 で再修正)

- **v09 ship 後の主張 ④ 再修正 (本 C286 新規)**:
  - v08 §C281 で「cap 中 ring 色切替 2-3 行で polishing 中→高」と判定したが、`invincibleT===CAP` は **エッジ条件** ということを実装まで気付かなかった
  - 実装後 mental sim で初めて「持続中=plateau」と「エッジ=1F」の差を認識 → **§C281 主張 ④ 修正の前提自体が外れていた**
  - 正しくは「cap reach 瞬間の jolt 強化」(= 1F flash 強化) としての polishing 効果はあるが「持続中 polishing」とは別物
  - **本セル新規結論**: `feedback_prediction_responsibility.md` Stage 4 self-correction loop の機能事例 — Stage 3 (matrix) で誤読、Stage 4 player 側 (§C188) で誤読継承、Stage 4 Ash 自プレイ側 (§C281) で「2-3 行で polishing 強」と確信度高、ship 後 mental sim (本 C286) で初めて誤読発見

- **Stage 4 横断結論信頼度**: **高 (自己訂正含む)**。誤読は 3 サイクル (§C188 / §C281 / §C284) 連続継承されており、ship を経由しないと発見できなかった。**R-I「人間プレイは判定装置でなく最終確認装置」の事例化** — Stage 3/4 で確信度高でも ship 後 mental sim で訂正が入る場合がある = ship→再判定ループの存在意義の物理証拠

---

## (f) 表層/基板 1ビット判定 — **表層チューニング**

| 軸 | 判定 |
|---|---|
| **lightness/darkness 軸変更 (色値の置換)** | ○ (255,160,64 → 255,216,112 の RGB 置換のみ、shmups.wiki Boghog VALUE 原理 = 色の輝度切替) |
| **新メカニクス (無敵時間可視化という型の追加)** | × (既存 ring の strokeStyle 三項分岐のみ、新規描画ロジック・新規 state・新規 timer なし) |
| **戻し方** | ○ (3 行以内削除で v08 (d') 完全等価) = 表層チューニングの戻し方典型 |
| **コード追加範囲** | line 897-906 内に閉じる (コメント 1 + capColor 1 + 三項 1 = 3 行)、`feedback_clone_strategy.md` 守の「削除可能改良 1 個刻み」要件充足 |

**結論**: **表層チューニング** (基板変更ではない)。

**根拠**:
1. 既存の「無敵中 ring」型 (v06 A-5(b) で導入、line 901 で半径 20 player 周囲 ring) は v08 までで型として確立済 = v09 (f) は **既存型の色再配分** であり新メカニクスではない
2. 「無敵時間可視化」は v07 観点 3 (弾側マーカー)・v06 A-5(b) (player 側 ring)・v07 観点 7 (cap 瞬間 flash) で **すでに 3 機構が型として存在** している。v09 (f) は新規型の追加ではなく、3 機構の延長線上で 1 ステップ「cap 状態を色で読めるようにする」を試みた表層変更
3. ただし Cell 9 矩形横断観察での自己訂正により、本表層変更は **想定通りには効いていない** ことが Stage 4 で判明 — つまり「表層チューニングであることは確定」だが「その表層チューニングが Stage 3 想定通りに機能した」とは別判定 (本判定は前者のみ、機能可否は Cell 7/9 に記載)

---

## v10 候補 (g) 列挙 — 1 個 Stage 3 予測 + Stage 4 自判定付き

### (g) capPlateauT — cap reached 状態を真の plateau として可視化する timer

**動機 (本 C286 Cell 7/9 発見からの直接派生)**: v09 (f) のエッジ条件問題を「`state.capPlateauT` という独立 timer を導入し、cap reach 時に N=30F (=0.5 秒) セット → 残時間中 capColor=true」で解決。これにより「cap 持続中=金色 ring」を **物理的に plateau 化** する。

**Stage 3 予測 (実装難度 / 確信度 / 期待効果)**:

| 項目 | 内容 |
|---|---|
| **実装行数** | 約 4-5 行: (1) 定数 `CAP_PLATEAU_FRAMES=30` 追加 / (2) `state.capPlateauT:0` 追加 / (3) startGame reset `state.capPlateauT=0` / (4) `onGraze` 内 `if(wasCapNotReached&&state.invincibleT===BUZZ_INVINCIBLE_CAP) state.capPlateauT=CAP_PLATEAU_FRAMES` / (5) update tick `if(state.capPlateauT>0) state.capPlateauT--` / (6) line 902 `const capColor=state.capPlateauT>0` 置換 |
| **戻し方** | 4-5 行削除で v09 (f) 完全等価 (定数 + state + reset + onGraze 1 行 + update 1 行 + capColor 条件元戻し = 計 6 行の削除/置換) |
| **R-I 死守適合** | **高**: Stage 4 既出根拠 (本 C286 Cell 7 のエッジ条件発見) を直接回収、philosophizing layer 踏み込みなし |
| **1 機構刻み度** | **中**: 既存 ring 機構の補強 (新規描画ロジック・新規視覚要素ゼロ) だが、新規 state + 新規 timer は追加 (色切替のみの (f) より侵襲は大、ただし依然 1 機構刻み内) |
| **期待効果 (Stage 3 予測)** | cap reach 瞬間に 0.5 秒間 player 周囲 ring が金色で plateau → maxChainFlashT (20F=0.33秒) + 大型 ring (30F=0.5秒) + popup (60F=1秒) と協調し、**「cap reach 達成感」が 3 段階に分解可能** (flash=0.33s / 大型 ring + capPlateau=0.5s / popup=1s) |
| **副作用予測** | 稠密 graze phase で連続 cap reach する場合、capPlateauT は再セットされ続け、最大 30F (=0.5秒) 持続 → flicker 解消。疎な phase で cap reach 単発の場合、ちょうど 0.5 秒の plateau (= maxChainFlash + 大型 ring と長さ近似)。両 phase で挙動が安定 |

**Stage 4 着手前事前篩 (自判定)**: **採用 × 中-高**。

- **採用根拠**:
  1. 本 C286 Cell 7 で発見した (f) のエッジ条件問題への **直接** 解 = Stage 4 既出根拠による着手
  2. 戻し方 4-5 行で `feedback_clone_strategy.md` 守の「削除可能改良 1 個刻み」要件充足
  3. v09 (f) を **置換ではなく拡張** で活かす (capColor 条件式の右辺のみ変更、左辺と三項分岐は v09 (f) を継承)

- **採用確信度を「中-高」に留めた理由**:
  1. 新規 state + 新規 timer 追加は v09 (f) の「色切替のみ」より侵襲が大 (1 機構刻み守の境界線上)
  2. `CAP_PLATEAU_FRAMES=30` の値は mental sim で「0.5 秒が体感に良い」と当たりを付けたが、実装後の Ash 自プレイで再判定が必要 (15F=0.25秒短すぎ / 60F=1秒長すぎ / 30F=0.5秒着地点)
  3. maxChainFlashT (20F flash) と capPlateauT (30F 色保持) の **時間軸重畳** が「同時にいろんなことが起きすぎる」感に振れるリスク (Log_cdx 観点 5 「常時表示情報は少ない方が良い」との折衝)

- **着手判断**: 本 C286 self_judgment ship 後の次サイクル C287 以降で着手判断確定 (本 C286 はあくまで Stage 3 予測 + Stage 4 着手前事前篩、ship 待ち)

### (g) ではなく不採用とした候補
- **(g') ring 弧長 = invincibleT/180** (v08 §C284 候補): cap reach 後の弧長変化が **graze ごとに不連続ジャンプ** (180→更新で 179→graze で 180、これを描画弧長に直結すると **時計の針が逆走するような不自然さ**) → 採用 × 低、本 C286 で却下
- **(h) 観点 4/5/B-3 等 matrix 未着手 cell** (v08 §C284 候補): Stage 4 player 側で既に降格、本 C286 でも降格状態維持 → 採用 × 低、v10 候補から除外

---

## Stage 4 C286 制約遵守チェック

- [x] `feedback_headless_unfit_for_unfinished_eval.md` t:5: 本セクションは index.html コード line 番号 (124/127-129/138/210/324/521-526/700-704/706-718/846-852/897-906/1009-1019) + Ash 自プレイ mental simulation のみで判定、headless 数値ゼロ参照
- [x] `feedback_clone_strategy.md` t:5: (f) Stage 4 ship 後再判定 = 1 機構刻み守準拠、(g) capPlateauT 提案は 4-5 行で戻し方明確 + philosophizing layer (「総合確信度 N%」「30 本調査」「v10 戦略レイヤー」) 踏み込みなし
- [x] `feedback_prediction_responsibility.md` t:5: Stage 3 (matrix §C188) → Stage 4 player 側 (§C188) → Stage 4 Ash 自プレイ側 (§C281) → Stage 4 v08 (a) ship 後再判定 (§C283) → Stage 4 v08 (d') ship 後再判定 + v09 候補 (f) 確定 (§C284) → **Stage 4 v09 (f) ship 後再判定 + (f) エッジ条件発見 + v10 候補 (g) 確定 (本 C286)** → Stage 5 (Nao_u 評価) の連続体を 1 ステップ前進。**3 サイクル連続継承された誤読 (§C188→§C281→§C284) を ship→mental sim で発見** = Stage 4 self-correction loop の機能事例
- [x] `feedback_means_ends_reversal_check.md` t:5: 本判定の出力は (f) Stage 4 採用継続 × 中(降格) + 表層/基板 1ビット判定 = 表層 + (g) v10 着手判断確定。次サイクル C287 で (g) capPlateauT 実装着手の物理ゲート開放 → 中間文書ではなく iteration 次手選定根拠
- [x] R-I 死守 (`game_lessons_log.md` R-I): Nao_u v05/v06/v07/v08/v09 評価返信未到達でも iteration を止めない。(f) ship + 本 C286 Stage 4 自判定 = R-I「着手前30本、提出前自己判定」の「提出前自己判定」を ship 後再判定で延長 (ship→自プレイ→訂正→次手確定の閉路)
- [x] `feedback_prior_art_citation_must_verify.md` t:5: 本判定は外部先行事例引用なし (Stage 3 matrix の外部出典は v08 §C188/§C281 で検証済)、新規引用ゼロのため M-41 違反リスクなし

---

## §0a 層A pending との関係

`t-260524125456-74d6` (v06 Nao_u プレイ評価返信受領後の 5 機構統合版作成) は本 C286 では受領状況確認のみ、未受領継続で **層A pending 継続保留**。本 self_judgment は v06 5 機構統合版とは独立の v09 iteration 評価で、§0a pending を消化していない。

---

## 接続先

- `game/graze_log/v09/README.md` — v09 (f) 実装明細 (本 self_judgment の評価対象)
- `game/graze_log/v09/index.html` line 897-906 — v09 (f) 主実装範囲、capColor 三項分岐
- `game/graze_log/v09/index.html` line 521-525 — invincibleT 減衰ループ (Cell 7 エッジ条件発見の根拠)
- `game/graze_log/v09/index.html` line 706-718 — onGraze cap 検出ロジック (Cell 7 mental sim の根拠)
- `game/graze_log/v08/self_judgment.md` §C188/§C281/§C284 — Stage 4 連続体の前段
- `memory/game_lessons_log.md` R-A〜R-I — Ash/Log 共有抽象ルール (本 C286 で R-I 死守事例 + Stage 4 self-correction loop 事例化)
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任の連続体、本 C286 は Stage 4 v09 ship 後再判定 + (g) v10 Stage 3 予測 + Stage 4 着手前事前篩 (二層)
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 本 C286 は index.html line 番号 + mental sim のみで根拠化、headless 数値ゼロ参照
- `memory/feedback_clone_strategy.md` t:5 — 守の段階 1 機構刻み制約、(g) capPlateauT は 4-5 行で戻し方明確
- `memory/feedback_means_ends_reversal_check.md` t:5 — 本 C286 は v10 着手判断確定で次サイクル playable diff への物理ゲート開放

— Ash (Win2) 2026-06-04 C286 Phase 4 大作業 (v09 (f) ship 後 Stage 4 player 側 9 セル + 表層/基板 1ビット判定=表層 + v10 候補 (g) capPlateauT 採用×中-高 + Cell 7 エッジ条件発見による §C281/§C284 主張 ④ 自己訂正)

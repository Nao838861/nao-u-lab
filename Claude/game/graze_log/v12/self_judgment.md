# graze_log v12 (i-δ) self_judgment — phase 6 休符 medium 削除 ship 後 Stage 4 mental sim 起稿

**status**: v12 (i-δ) 1 行削除 ship 直後、Stage 4 mental sim 雛形 (AI 自プレイ未実施、Nao_u 評価未受領)

**親情報**:
- 親 commit: 31095ffc2 (C291 Phase 4 v12 (i-δ) Stage 1+2 確定)
- 本サイクル commit: 本ファイル commit と同時 (C292 Phase 4)
- 編集対象: `game/graze_log/v12/index.html` line 472 (元 v11/index.html line 472 `spawnEnemy('medium',W*0.5,0,'aimed');` を 1 行削除)
- diff 検証: `diff game/graze_log/v11/index.html game/graze_log/v12/index.html` 出力 = `472d471` の 1 行削除のみ (純削除 = 追加コードゼロ、コメント変更ゼロ、空白変更ゼロ)

---

## 戻し方 (可逆性担保 / 完遂条件 5)

- **1 行復元**: `game/graze_log/v12/index.html` line 471 (現状) の直後に `  spawnEnemy('medium',W*0.5,0,'aimed');` を 1 行追加 → v11/index.html と完全等価
- **戻しトリガー**: Nao_u 評価で「休符が単純化しすぎ / 物足りない / 薄味」signal を受領した場合、即時 1 行復元で v11 等価
- **コメント据え置き理由**: line 470 のコメント `// phase 6 (65-78s): 休符 — decrescendo (small 4 + medium 1 aimed、gauge 回復時間)` は v11 のまま **未更新** とする。理由: 完遂条件 1 (diff が 1 行削除のみ) を満たすため。コメント文言と実装の乖離は、本 v12 が「実験的 polish」段階であり、Nao_u 評価で「採用」signal を受領した時点で v13 以降で正式更新する想定 (i-δ の生存判定が確定してから文言コミット)。

---

## Stage 4 mental sim (AI 自プレイ前 player 知覚予測)

### Cell 1: 休符 phase 6 (65-78s) の player 知覚

| 項目 | v11 (h-α) | v12 (i-δ) | 予測 (Stage 4 校正対象) |
|---|---|---|---|
| spawn 内容 | small 4 体 + medium 1 体 (aimed) | small 4 体のみ | 「敵が薄い区間に入った」と即時知覚可能 |
| graze 対象 | small (HP=1) + medium (HP=3, 攻撃) | small (HP=1) のみ | graze 連続性が「単発の small」に均質化、リズム単純化 |
| HP=3 medium 撃破時間 | 約 3 wave 分滞在 (graze 対象として持続) | ゼロ | 撃破時間ゼロ = 火力発散先が減り「攻撃ボタン押しても撃つ標的が薄い」体感 |
| 「ここで gauge を戻せる」認識 | small 4 + medium 1 で gauge 微増の予測難 | small 4 only で gauge 増減が読みやすい | **休符純度 = 物理保証**、player が「ここで戻す」と意図的に休める |

### Cell 2: 隣接 phase との差別化 (R-C 見えるルール)

| phase | spawn 内容 (v12) | 差別化軸 |
|---|---|---|
| phase 1 学習 (0-13s) | aimed small 3 + 確率 medium | medium 確率出現 = 学習段階で多様性 |
| phase 6 休符 (65-78s) | small 4 only (medium 0) | medium 完全不在 = 「学習 ≠ 休符」が明確 |
| 予測 | — | phase 1 (学習) と phase 6 (休符) の **差** が「medium 出る vs 出ない」の 1 ビットで判別可能、player の認知負荷が下がる |

### Cell 3: 副作用予測 (薄味化リスク)

| 副作用候補 | 発生機構 | 校正方法 |
|---|---|---|
| 「休符が薄すぎて緊張感が抜ける」 | medium 不在で攻撃する標的が減る、約 13 秒間「ただ small を graze するだけ」 | Stage 4 自プレイで「13 秒間が長すぎないか」を体感判定 |
| 「山 1 (52-65s) → 休符 (65-78s) → 山 2 final (78-90s)」の落差過大 | 山 1 で aimed 8 + medium 2 aimed (密度高) → 休符で small 4 only (密度低) → 山 2 final で fan3 4 + small 4 (密度高) の **谷** が深い | mental sim で「メリハリ強化」と「落差過大」の判別、Nao_u 評価で signal 受領 |
| 「medium の HP=3 撃破時間が消えて、player の攻撃連射が無駄打ち化」 | 攻撃ボタン押し続けても撃破標的が small (HP=1, 即撃破) のみ | Stage 4 自プレイで「攻撃の連射感」が崩れていないか体感判定 |

### Cell 4: 他機構との接続 (cap / buzz / invincible / graze gauge / Lv up)

| 機構 | phase 6 内挙動 (v12) | 接続懸念 |
|---|---|---|
| cap (gauge plateau) | small 4 体 graze で gauge ↑、cap 到達確率は v11 よりやや低い予測 (medium graze 分が消える) | cap 到達タイミングが phase 6 → phase 7 (山 2 final) にずれ込む可能性 = final で cap 発動 = 強化される方向 |
| buzz (invincible) | phase 6 内で被弾確率が低下 (medium 0) → buzz 発動チャンスも低下 | buzz 発動タイミングが phase 7 (山 2 final) にずれ込む = final の救援装置として機能 (向きは救援) |
| graze gauge 回復時間 | small 4 体 only で安定回復 = 「物理保証」される | v12 README の主目的そのもの、整合 |
| Lv up ring | gauge 上昇に依存、phase 6 で Lv up 発生確率は v11 とほぼ同等 (small 4 体 graze で gauge は v11 と近い) | 体感差は小 |
| 攻撃連射 | 撃破標的減で連射が無駄打ち化 (Cell 3 で既述) | 副作用候補と重複、Stage 4 校正対象 |

### Cell 5: v11 (h-α) 「画面上見た目変化ほぼゼロ」反省の適用

- **v11 (h-α) の失敗パターン**: `===CAP エッジ条件 1F 黄金` の 1 token 拡張が、player 知覚閾値以下で「効き目ほぼゼロ」と判明
- **v12 (i-δ) で同型を回避する根拠**:
  - medium 1 体の **有無** は visible (silhouette size + 撃破時間 HP=3 vs HP=1)
  - 撃破時間差は連射体感に直接影響 = player が「何かが変わった」と即時知覚可能
  - 1F 単位の cap edge condition と異なり、約 13 秒間 (phase 6 全体) の持続変化 = 時間スケールが知覚閾値の上
- **校正リスク (Stage 4 で再検)**: それでも player が「medium 1 体の消失」を Phase 全体の中で気づかない可能性 (周辺 phase の密度に紛れる) はゼロではない、Stage 4 自プレイ + Nao_u 評価で校正必要

### Cell 6: spawnInterval (140F 休符) との重ね効果

- phase 6 の spawnInterval は 140F (休符値) → small 4 体が 140F 間隔で 1 wave、約 2.3 秒 / wave
- 13 秒間で 5-6 wave → 約 20-24 体の small が出現する想定
- medium が消えても small の総量は据え置き = 「敵が少ない」のではなく「敵の **種類が単純化**」が休符の本質
- player の「ここで戻せる」認識は「敵の種類が読める」ことに依存 = 種類数 2 → 1 への減少が物理保証として効く

---

## Cell 7: Stage 4 校正結果 (paper play / コード精読、C0606 Phase 4)

**校正手法**: AI 自プレイ (browser 起動) は本フェーズ未実施、game/graze_log/v12/index.html のコード精読 + 数値展開による paper sim (spawnInterval / spawnPhase6 / spawnWave 条件分岐 / enemies.length<3 ゲート) で Cell 3 副作用候補 3 件を校正。Stage 4 完遂条件のうち「予測校正」を paper 経路で先行し、AI 自プレイは次サイクル C293 に持ち越す。**paper 校正は feedback_headless_unfit_for_unfinished_eval.md の headless 数値根拠とは別物** — コード精読は spawn ロジック + 撃破/spawn 周期の論理展開、headless 数値ではない。

### 候補 1 校正: 「休符が薄すぎて緊張感が抜ける」

- **コード根拠**: line 469-472 `function spawnPhase6(){ for(let i=0;i<4;i++)spawnEnemy('small',W*0.2+i*W*0.2); }` + line 488-493 `spawnInterval()` が `p===6` で 140F 返却。spawnPhase6 は v12 で medium 0 / small 4 only。
- **paper sim**: phase 6 (65-78s = 13s = 780F) で 780F / 140F = **5.57 wave = 5-6 wave**、1 wave 4 体 → **約 22-24 体の small** が 13 秒間で順次出現。small は HP=1 で attack 連射に即撃破、`enemies.length<3` 条件 (line 553) で次 wave 早期発火。
- **隣接 phase 3 との非対称差別化**: phase 3 (休符, wave3 alias, line 439-443) は small 6 + medium 1 aimed のまま据え置き、v12 削除対象外。phase 3 = 「medium 残留の軽い休符」 / phase 6 = 「medium 完全不在の decrescendo」 という非対称設計が実装上既存。phase 6 だけが真の谷。
- **結論**: **補強寄り修正** — 「薄い」表現は不正確、「敵種類 1 種化による graze 対象焦点の整理」が実態。13s/22 体は薄くはなく、phase 3 との非対称が 1 ビット (medium 有無) で明確化。Cell 3 候補 1 の発生機構記述は正しいが「緊張感が抜ける」帰結は phase 7 final 接続を考慮すると過剰悲観。

### 候補 2 校正: 「山 1 → 休符 → 山 2 final の落差過大」

- **コード根拠**: spawnInterval (line 488-493) で phase 5/7 = 80F、phase 6 = 140F (1.75x 鈍化 → 1.75x 急加速の対称谷)。spawnPhase5 (line 463-468) = small 8 + medium 2 aimed = 10 体 / spawnPhase6 = small 4 / spawnPhase7 (line 473-479) = medium 4 fan3 + small 4 = 8 体 (HP12 残留)。
- **paper sim 弾密度**: phase 5 = medium 2 × aimed → 2 弾/wave (約 4-5 wave で 8-10 弾) / phase 6 = medium 0 → **新規弾発射ゼロ**、phase 5 残弾が序盤 (~90F) に流れ込むのみ / phase 7 = medium 4 × fan3 = **12 way bullet/wave**、約 9 wave で **約 100 way 弾** 累積。
- **落差は意図設計**: 「谷の深さ = final 頂点感の前提条件」 — Cell 6 で書いた「種類数 2→1 への減少が休符の物理保証」と整合、phase 7 の 12-way fan3 4 体は graze_log 最大密度の頂点であり、谷無しでは頂点感が立たない。落差は depth ではなく **contrast 装置**。
- **結論**: **修正** — 「落差過大」表現が誤誘導。実態は「設計上の最大 contrast」で、phase 6 を浅くすると phase 7 final の頂点感が崩れる。校正方向は「落差過大の懸念」ではなく「phase 6 → phase 7 移行 (76-78s 接続部) の予兆 token 有無」(v13 候補 j の Stage 1 起案論点に転化)。

### 候補 3 校正: 「medium HP=3 撃破時間が消えて、攻撃連射が無駄打ち化」

- **コード根拠**: spawnEnemy (line 287-294) で medium のみが `fireT` + `bulletPattern` 保持、small は弾発射機構を持たない (line 294 の pendingEnemies medium 化分岐のみ)。phase 6 の spawnPhase6 が small only → 弾発射する敵がゼロ。
- **paper sim**: 攻撃連射 (spawnPlayerBullets, line 543) は shotCooldown 駆動で player ボタン押下中常時発射。phase 6 で標的が small (HP=1) のみ = 即撃破 → 「画面に標的が居ない空白時間」が 1 wave 内に発生 (140F - 4 体即撃破時間 ≒ 130F 空白)。約 13s 中 5-6 wave × 130F 空白 = **累積 650-780F = 約 11-13s の標的空白時間**。
- **問題の真の所在**: 「攻撃連射無駄打ち化」より深刻なのは **graze 機会消失** — graze_log の本質は敵弾掠めで gauge 上昇、phase 6 で新規弾発射ゼロは gauge 上昇機会 (= graze) の累積消失を意味する。Cell 4 で書いた「cap 到達タイミングが phase 7 にずれ込む」 = phase 7 final 入口で gauge cap 発動が救援装置として機能する向き、と整合する一方、phase 6 内の player 体験は「やることが減る」リスク。
- **結論**: **表現修正 + 帰結補強** — 「攻撃連射無駄打ち化」表現は player ボタン連射感覚 (player 主体) に偏っていたが、実態は「graze 対象 (敵弾) 累積消失 → gauge 上昇機会消失 → phase 7 final で救援発動」という装置の向き (救援) に転化する流れ。phase 6 単独では player 体験低下リスクがあるが、phase 6 → phase 7 連続体で見ると Cell 4 の cap/buzz 救援接続の前提条件として **機能している**。Cell 3 候補 3 は「無駄打ち化」ではなく「graze 対象消失による gauge 機会保留」と書き直すべき。

### Cell 7 サマリー (Cell 3 校正後の予測再構成)

| 候補 | 元予測 | Cell 7 校正後 | 判定 |
|---|---|---|---|
| 1 (薄味化) | 「13 秒間が長すぎないか」体感判定 | 「敵種類 1 種化による焦点整理」phase 3 非対称差別化と整合 | 補強寄り修正 |
| 2 (落差過大) | 「メリハリ強化 vs 落差過大」判別 | 落差は意図設計の contrast 装置、谷無しでは final 頂点感崩壊 | 修正 (懸念→設計肯定) |
| 3 (攻撃連射無駄打ち) | 「攻撃連射感」体感判定 | 真の問題は graze 対象消失 → gauge 機会保留 → phase 7 救援装置への原資 | 表現修正 + 帰結補強 |

→ paper 校正経路では 3 候補すべて i-δ 設計肯定の方向に転化。**Stage 4 AI 自プレイで覆る可能性が残る軸**: (1) phase 6 後半 (~9-13s 区間) の player 退屈閾値 (paper sim では時間量しか分からず体感判定不能)、(2) phase 6 → phase 7 移行の予兆 token 有無の体感差 (v13 候補 j の起案論点)、(3) cap 発動タイミングが phase 7 final 入口にずれ込んだ時の救援強度 (paper sim で発動タイミングは推定可能だが「強度」は体感のみ判定可能)。

### Cell 8: v13 候補 (j) への影響 (Togelius Q1 = 5 装置直列の単調収束 vs 非単調曲線 観察起点)

Cell 7 校正で見えた v13 候補 (j) の Stage 1 起案論点は 2 軸: **(j-a)** phase 6 → phase 7 移行部 (76-78s) に予兆 token (medium 1 体 fan3 を phase 6 末尾 spawn) を加えると「予兆感」が立つが、v11 (h-α) の cap edge 1F 黄金と同型の微弱変化リスク (player 知覚閾値以下) を孕む / **(j-b)** phase 7 spawn 内容のうち medium 1 体を phase 6 末尾に migrate (山1/休符/山2 境界 polish) — 落差を ±1 体だけ縮める方向で、Cell 7 候補 2 校正の「contrast 装置肯定」と弱く矛盾するため Stage 2 で篩落とす可能性が高い。Togelius Q1 「5 装置直列の単調収束」観察起点としては、本 v12 (i-δ) の Cell 7 校正で 5 装置 (cap / buzz / invincible / graze gauge / Lv up) のうち **cap と buzz のタイミングが phase 7 入口にずれ込む救援装置への変化** が観察できた = 単純な単調収束ではなく **「装置発動タイミングの phase 跨ぎ shift」** という非単調要素を含む。v13 (j) で同経路をさらに観察するなら、phase 6 内での 5 装置発動回数を AI 自プレイで実測 → phase 7 final 入口での cap 発動率と相関を取る方向が、Togelius が指摘した「LLM の弱点 = フィードバック構造の貧弱さ」への我々側の例外性の根拠になる。

---

## (i-δ) ship 確定根拠 (Stage 1+2 → Stage 3 ship の連続性)

- v12 README の Stage 1+2 で 5 案中 i-δ が R-A/R-C/R-D/装置の向き救援/Stage 3 予測の player 知覚可能性で全 ○-◎
- Stage 3 (本 ship) で 1 行削除 = README 手順 5 ステップのうち step 1-3 を完遂
- Stage 4 mental sim は本 self_judgment.md の Cell 1-6 で起稿 (6 セル ≥ 完遂条件 4 の ≥3 セル)
- 残 step 4-5 (Stage 4 自プレイ判定 + Nao_u 評価) は次サイクル C293 以降に持ち越し

---

## 次サイクル C293 以降の校正手順

1. **AI 自プレイ (Stage 4 ship 後校正)**: graze_log/v12/index.html を browser で起動 (pyxel-web 系経路 or 直接 file://) → phase 6 (65-78s 区間) を意図的に通過、休符純度 / gauge 回復確実化 / 薄味化の 3 軸で体感判定
2. **mental sim 副作用確認 (Cell 3)**: 「13 秒間が長すぎる」「山 1 → 休符 → 山 2 final の落差過大」「攻撃連射の無駄打ち化」の 3 候補を AI 自プレイで観測
3. **Nao_u 評価依頼**: ts=1779594807 / 5機能まとめ依頼と ts=1779233429 / A-1+ 先行依頼の保留状況を確認した上で、v12 (i-δ) 単独の評価依頼を新規投下するか / 既存依頼に合流させるかを判断 (Phase 5 日記材料)
4. **副作用判定時の昇格判断**:
   - 「休符純度のみでは山 1 → 山 2 final の接続が弱い」signal → i-α (fan3 予兆) 昇格 (v13 候補)
   - 「final の薄さ / 頂点感不足」signal → i-β (small 4→5) 昇格 (v14 候補)
   - 「休符が単純化しすぎ」signal → line 472 復元で即 v11 等価 (戻し方発動)

---

## メタ反省 (v11 h-α 反省の連続体)

- v11 (h-α) self_judgment.md §「次サイクル C291 への引き継ぎ予約」で「Stage 3 予測は Stage 4 mental sim で校正される必要がある」と明記済
- 本 v12 (i-δ) は **その校正経路** を本 self_judgment.md の Cell 1-6 で起稿 = Stage 3 → Stage 4 の連続体を 1 サイクル内で踏破
- 装置の向き判定 (cycle_staging.md 2026-05-02 08:20 日記の教訓): backup auto-commit が意図 commit を窒息させた事例の **逆向き** = 本 v12 は 1 行削除 + ash: prefix commit + self_judgment 起稿の 3 経路すべてが救援装置 (player 知覚可能性 + 戻し方明示 + 校正リスク事前列挙)
- feedback_clone_strategy.md 守の最深部 (削除側純化): 本 v12 (i-δ) は 1 行削除 = 純削除そのもの、v11 (h-α) の置換側 1 token より守の純度↑

---

## 接続先

- `game/graze_log/v11/index.html` line 472 — 元 spawn 行 (削除対象、戻し方の復元位置)
- `game/graze_log/v12/index.html` line 469-472 — spawnPhase6 関数本体 (削除後、small 4 体 only)
- `game/graze_log/v12/README.md` — v12 (i-δ) Stage 1+2 確定文書、本 ship の Stage 3 + 起稿 Stage 4 mental sim の根拠
- `game/graze_log/v11/self_judgment.md` — v11 (h-α) ship 後 Stage 4 mental sim の前例、本 v12 も同型を踏襲
- `memory/feedback_clone_strategy.md` t:5 — 守の段階 1 機構刻み制約、削除側純化
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任の連続体、本 self_judgment は Stage 4 mental sim 起稿
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 本 ship は headless 数値根拠ゼロ、mental sim + 戻し方明示で根拠化
- `memory/feedback_means_ends_reversal_check.md` t:5 — 本 ship は playable diff (game/graze_log/v12/index.html の 1 行削除 + commit) = 第一義原則の連続体
- `log/cycle_staging.md` (C292 Phase 3 → Phase 4 大作業宣言節) — 本 ship の発火元

---

— Ash (Win2) 2026-06-05 C292 Phase 4 大作業 (v12 (i-δ) phase 6 休符 medium 削除 ship + Stage 4 mental sim 6 セル起稿 + 戻し方 1 行復元明示)

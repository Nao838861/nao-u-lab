# graze_log v12 — 観点 6 spawn テーブル polish (i) 7 区分 phase 内 1 値 polish 候補 (Stage 1+2 確定 / 実装は C293)

**status**: v12 (i) Stage 1+2 候補確定 (実装は次サイクル C293)

**親情報**:
- v11 (h-α) `state.capPlateauT>0||state.invincibleT===BUZZ_INVINCIBLE_CAP` 1 行 ship (commit `fec03e82f` C290 Phase 4) 後の `v11/self_judgment.md` §「次サイクル C291 への引き継ぎ予約」**選択肢 C (別軸振替) を主軸**、別軸 3 種 (Cell 1-4-6-8 amp 余地 / Cell 5 spawn テーブル polish / 観点 8 bad policy headless) のうち **Cell 5 spawn テーブル polish** を採用 (v11/self_judgment.md line 87-91)
- spawn テーブル本体は v07 観点 6 で実装済 (`game/graze_log/v11/index.html` line 162-176, 460-501)。7 区分 (学習 / 圧力 / 休符 / 圧力 / 山 1 / 休符 / 山 2 final) + 3 段階 spawnInterval (140/110/80) の骨格は据え置き、本 v12 は **1 phase 内の 1 行 polish** に絞る
- v11 (h-α) で確立した「1 行 bounded edit + 戻し方 1 文字級 + Stage 4 mental sim 校正」の運用パターンを継承

---

## Stage 1 候補ブレスト (≥3 案)

「7 区分 phase の **1 phase 内 1 値**を polish して、メリハリ・リズム・予兆のいずれかを 1 単位強化する」目的に対し、5 案 (i-α / i-β / i-γ / i-δ / i-ε) を列挙。各案は **1 行 bounded edit + 戻し方 1 行復元 / 1 文字 truncate** を必須条件とする。

### Case (i-α) phase 5 山 1 medium 片方を fan3 に切替 [1 行置換]

- **コード変更見積もり**: `index.html` line 466 or 467 単一行 置換 (1 行)
  - 現行 v11: `spawnEnemy('medium',W*0.35,0,'aimed');`
  - 提案 v12 (i-α): `spawnEnemy('medium',W*0.35,0,'fan3');`
- **戻し方**: 1 行 (`'fan3'` → `'aimed'` に書き戻し) → v11 完全等価
- **v11 との非重複明示**: state 追加なし、定数追加なし、関数追加なし。spawnPhase5 の medium 2 体のうち 1 体の bulletPattern 引数を切替えるだけ。**bounded edit 1 token 置換** (SkillOpt 風 1 cell)。
- **挙動 (Stage 3 予測)**:
  - 52-65s 区間で fan3 1 体が登場 → 山 2 final (78-90s) の fan3 4 体への **予兆**として機能
  - 山 1 段階で aimed 8 + medium 2 (aimed+fan3) に密度↑、休符 phase 6 (65-78s) の入り口でメリハリが効く
  - リズム: 学習 (aimed) → 圧力 (fan3 intro) → 休符 (aimed) → 圧力 (fan3) → 山 1 (**aimed + fan3 mix**) → 休符 → 山 2 final (fan3 4 体) = 山 1 が「両 pattern の混合点」化し、final への接続が滑らか化

### Case (i-β) phase 7 山 2 final small 列を 4 → 5 に増量 [1 行範囲拡張]

- **コード変更見積もり**: `index.html` line 480 単一行 置換 (1 行)
  - 現行 v11: `for(let i=0;i<4;i++)spawnEnemy('small',W*0.15+i*W*0.24);`
  - 提案 v12 (i-β): `for(let i=0;i<5;i++)spawnEnemy('small',W*0.12+i*W*0.19);`
- **戻し方**: 1 行 (ループ範囲と W*0.x 値を v11 形に書き戻し) → v11 完全等価
- **v11 との非重複明示**: spawnPhase7 内のみ、phase 1-6 触らず。small 1 体追加 + 配置幅再分配のみ、medium fan3 4 体は据え置き。
- **挙動 (Stage 3 予測)**:
  - 78-90s 区間で small 1 列分追加、final の頂点感が 1 単位↑
  - 描画密度上昇リスク (fan3 4 体 + small 5 体 = 9 敵 spawn / wave)、ただし v11 でも 8 敵で許容範囲内
  - 視覚 noise の限界に近づく (graze_log は既に閃光 + 大 ring + popup + capPlateau + Lv up ring で密)

### Case (i-γ) spawnInterval 圧力 phase 110 → 100 [1 行値変更]

- **コード変更見積もり**: `index.html` line 493 単一行 置換 (1 行)
  - 現行 v11: `return 110;                         // 圧力 (phase 2/4)`
  - 提案 v12 (i-γ): `return 100;                         // 圧力 (phase 2/4)`
- **戻し方**: 1 文字 truncate に近い 1 行 (`100` → `110`) → v11 完全等価
- **v11 との非重複明示**: spawnInterval の 3 値 (140/110/80) のうち 1 値のみ変更。学習/休符 140F と 山 80F は据え置き、圧力 phase の wave 間隔のみ 10F (約 9%) 詰める。
- **挙動 (Stage 3 予測)**:
  - phase 2 (13-26s) / phase 4 (39-52s) の wave 頻度上昇、敵 spawn 密度↑
  - 山 phase (80F) と圧力 phase (100F) の差が 20F に縮まる = 山との差別感が薄まる
  - 学習 (140F) と圧力 (100F) の差は 40F で十分残る、メリハリは部分的に維持

### Case (i-δ) phase 6 休符 medium 削除 [1 行削除]

- **コード変更見積もり**: `index.html` line 472 単一行 削除 (1 行)
  - 現行 v11: `spawnEnemy('medium',W*0.5,0,'aimed');`
  - 提案 v12 (i-δ): 上記 1 行を削除 (関数本体は spawn 4 体 small のみに)
- **戻し方**: 1 行 (元の `spawnEnemy('medium',W*0.5,0,'aimed');` を line 472 に復元) → v11 完全等価
- **v11 との非重複明示**: spawnPhase6 内のみ、phase 1-5, 7 触らず。**削除のみ** = 追加コードゼロ、新規ロジックゼロ。clone_strategy 守の「削除可能改良 1 個刻み」の **削除側** 純化。
- **挙動 (Stage 3 予測)**:
  - 65-78s 区間で medium 0 体、small 4 体のみの spawn
  - **休符の純度確定** = graze 対象が small (HP=1, 一撃撃破) のみで gauge 回復が安定、player が「ここで gauge を戻せる」と認識しやすい
  - 学習 phase 1 (aimed small 3 + medium 1 conditional) と休符 phase 6 (small 4 only) で「学習 ≠ 休符」の差別化が明確化
  - 副作用: 休符の体感薄味化リスク (medium=長 HP target が消える = 火力の発散先が一時的に減る)

### Case (i-ε) 全案却下 / Stage 4 自プレイ再判定優先

- **動機**: v11 (h-α) Stage 4 mental sim で「画面上見た目変化ほぼゼロ」と判明したばかり = polish の効き目に対する自分の予測精度が下がっている可能性。本 v12 で重ねて polish 1 行 ship しても「効き目ほぼゼロ」を 2 連続するリスク
- **対案**: v12 では (i) Stage 4 着手前事前篩で **不採用** を選び、次サイクルは別軸 (Cell 1-4-6-8 amp 余地 / 観点 8 bad policy headless / v06 5 機構統合版作成 Nao_u 評価受領後) に振替。1 機構刻み守維持 + 連続誤予測の連鎖を断つ
- **コード変更見積もり**: 0 行
- **戻し方**: N/A

---

## Stage 2 着手前事前篩 (R-A〜R-I / clone_strategy 守 / 装置の向き判定 / feedback_prediction_responsibility Stage 3)

### 篩マトリクス

| 軸 | i-α (fan3 予兆) | i-β (small 4→5) | i-γ (interval 110→100) | i-δ (休符 medium 削除) | i-ε (全案却下) |
|---|---|---|---|---|---|
| **R-A 核体験強化 or 新層追加** | ○ (リズム強化 = ABAB → ABABA[mix]B[final] への接続) | △ (頂点密度のみ、新層なし) | × (圧力と山の差が薄まる = メリハリ後退) | ○ (休符純度 = 「ここで戻せる」核体験の明確化) | ? (着手しない = 強化判断保留) |
| **R-B 罰駆動回避** | ○ (報酬経路の polish 拡張、罰要素なし) | ○ | ○ | ○ (削除で罰減らす方向) | N/A |
| **R-C 見えるルール** | ○ (山 1 で fan3 が画面上に登場 → 山 2 final への伏線が見える) | △ (small 1 列増えても「これが頂点だ」と知覚しにくい可能性) | × (intervalは不可視、メリハリ後退も知覚困難) | ◎ (「休符 = small のみ」の単純化、ルール 1 段単純化) | × (現状ルール不明瞭を継続) |
| **R-D 型から始める / 1機構刻み** | ◎ (1 token 置換 'aimed'→'fan3') | ◎ (1 行 ループ範囲) | ◎ (1 行 数値置換) | ◎ (1 行削除 = 最小単位) | ◎ (着手しない = 1機構刻み最大遵守だが閉路停止副作用) |
| **R-E 対症療法回避 / 3世代** | ○ (cap 周辺と独立、観点 6 spawn 軸初回 polish = 対症療法回避) | ○ | ○ | ○ | ○ (3 世代目踏まず) |
| **R-F 指標先書き** | N/A (描画/spawn のみ、headless 指標変更なし) | N/A | N/A | N/A | N/A |
| **R-G target 維持** | ○ (自発リスク graze 運用者は fan3 予兆を「これから来る」と読める) | ○ (頂点を fully 楽しむ target 強化) | △ (圧力 phase の wave 間が詰まる = graze 隙間が消える可能性、target 体験変化) | ○ (gauge 回復確実化で target の連続 graze 戦略が安定) | △ (1 サイクル停滞で target 体験は v11 のまま) |
| **R-H 実装動詞** | ○ ("phase 5 の medium 1 体の bulletPattern を fan3 に切替") | ○ ("phase 7 の small 列を 5 列に拡張") | ○ ("圧力 phase の wave 間隔を 100F に詰める") | ○ ("phase 6 の medium 1 体を削除") | N/A |
| **R-I 着手前類似事例 / 自己判定** | 早期予兆 (foreshadowing) は STG 設計一般で頻出 (グラディウス boss 前 zako pattern, 怒首領蜂 stage 中盤の boss 弾予告) → 1/n 程度の prior art あり、ただし graze_log 固有の cap 機構との接続は独自軸 | 頂点増量は STG 設計の最標準型 (大半の STG が final wave で密度上げる) → prior art 多数だが「本当に必要か」自問が薄まる | spawn 間隔調整は STG 設計の最標準 polish 軸、prior art 多数で平凡 | spawn 削除による休符純化は STG 一般で少数例 (東方 Embodiment of Scarlet Devil stage 1 前半の意図的薄spawn) → 0-1/n、graze_log の "graze gauge 回復時間" 機構との接続は独自 | N/A (着手しない = R-I 適用外) |
| **clone_strategy 守 (削除可能改良 1 個刻み)** | ○ (1 行置換 = 削除可能だが純削除ではない) | ○ (1 行置換 = 削除可能だが純削除ではない) | ○ (1 行置換 = 削除可能だが純削除ではない) | ◎ (**1 行削除 = 削除そのもの**、純削除側で最深部) | ◎ (着手しない) |
| **装置の向き (救援 vs 窒息)** | 救援 (リズム接続 + 予兆可視化) ただし「山 1 段階で fan3 を見せると山 2 final の **驚き** を削る」副作用懸念 = 一部窒息 | 救援 (頂点強化) ただし v11 README L24 「同時にいろんなことが起きすぎる」自己警戒の接続 = 描画密度の窒息リスク | 窒息 (メリハリ後退、graze 隙間消失) = 装置の向き **逆方向** | 救援 (休符純度 = gauge 回復時間の物理保証) 副作用は薄味化のみ、戻し方は 1 行復元で完全可逆 | 中立 (装置を作らない) |
| **feedback_prediction_responsibility Stage 3 予測 (Stage 4 校正前提)** | 山 1 が aimed + fan3 mix で「ABAB → AB[mix]C[final]」リズム化、final 接続感は上がる予測。**校正リスク**: 山 1 の難度上昇で休符 phase 6 への入りが厳しくなる可能性 (Stage 4 mental sim で要再検) | final 密度上昇は予測通りだが「画面上 1 単位上がった」と player が知覚するか不明、SkillOpt 風 held-out validation で「実装後に効き目ほぼゼロ」判明リスク (v11 h-α と同型) | 圧力 phase の wave 間隔が 100F 化、ただし 110→100 の 10F 差を player が「圧力上がった」と知覚する閾値か不明、知覚閾値以下なら無効化 (v11 h-α 型) | 休符 4 体 small only の単純化は player が知覚しやすい (medium のシルエット差大)、gauge 回復時間も実プレイで体感可能。**校正リスク**: 薄味化が「物足りない」と判定されたら戻すだけで v11 等価 | 着手しないので Stage 3/4 予測のすり合わせ機会消失 (v11 h-α で得たループ知見を本サイクル で活かせない) |

### 各案の判定

- **i-α (fan3 予兆案)**: **中-高 (採用候補 △-○)** — リズム接続効果は明確だが、山 1 で fan3 を見せると山 2 final の「fan3 4 体」の驚きを 1 段削る副作用が本質。R-A/R-C は ○ だが、装置の向き判定で部分窒息混入。**v13 候補 (i-δ Stage 4 ship 後 mental sim で「休符純度だけでは山 1 → final の接続が弱い」と判定された場合)** に保留。
- **i-β (small 4→5 案)**: **中 (不採用 △)** — 頂点増量は STG 設計の最標準型で prior art 多数だが、graze_log 固有の novelty なし。「画面上 1 単位上がった」を player が知覚するかは不明 = v11 (h-α) 同型の「効き目ほぼゼロ」再現リスク高。**v14 候補 (final の薄さが Stage 4 自プレイで判定された場合)** に保留。
- **i-γ (interval 110→100 案)**: **低 (不採用 ×)** — 装置の向き **逆方向 (窒息)** に最も近い案、メリハリ後退で v07 観点 6 の「学習/圧力/休符/山」7 区分の構造そのものを薄める方向。本 v12 では除外。
- **i-δ (休符 medium 削除案)**: **高 (採用候補 ◎)** — clone_strategy 守の「削除可能改良 1 個刻み」を **削除そのもの**として満たす唯一案。R-A (休符純度) + R-C (見えるルール単純化) + R-D (1 行削除) + 装置の向き救援 + Stage 3 予測の player 知覚可能性が全 ○-◎。副作用 (薄味化) は 1 行復元で即逆。
- **i-ε (全案却下)**: **低 (不採用 ×)** — v11 (h-α) で得た「1 行 bounded edit + Stage 4 mental sim 校正」の運用パターンを **本サイクルで活用しない** 方向は閉路を止める。閉路を止めるべきは Nao_u から「v12 やめて」signal が来た時のみで、現時点では到達していない。

### 採用案: **i-δ (phase 6 休符 medium 削除案)**

**確定根拠 (≥3 点)**:
1. **R-D 1 機構刻み守 + clone_strategy 守の最深部 (削除側純化)**: 1 行削除 = 戻し方は 1 行復元 (純削除側で最小単位)、v11 (h-α) の 1 token 置換よりさらに「削除可能改良 1 個刻み」に純粋
2. **装置の向き = 救援 (休符純度 = gauge 回復時間の物理保証)**: phase 6 で medium が消えると graze 対象が small (HP=1 即撃破) のみとなり、gauge 回復が「ここで戻せる」と player が認識しやすい構造に変わる
3. **R-C 見えるルール最適合**: 「休符 = small のみ」の 1 段単純化は学習 phase 1 (aimed small 3 + 確率 medium) と差別化を明確化し、「学習 ≠ 休符」の構造を見える化
4. **player 知覚可能性 (v11 h-α 反省を踏まえた校正)**: medium 1 体の有無は シルエット差 + HP=3 vs HP=1 の撃破時間差で player が知覚しやすく、v11 (h-α) の「===CAP エッジ条件 1F 黄金」のように「知覚閾値以下で効き目ゼロ」リスクが低い
5. **bounded edit + held-out validation 概念の純粋応用**: Phase 2 SkillOpt 分析の「bounded delete + strict-improvement on held-out validation」を、本 (i-δ) で **削除側** に純粋適用する (v11 (h-α) は置換 + 拡張側だった)

### 不採用案の保留経路

- **i-α (fan3 予兆)**: Stage 4 ship 後 mental sim で「i-δ の休符純度のみでは山 1 → 山 2 final の接続が弱い」と判定された場合、即時昇格候補 (v13 候補として予約)
- **i-β (small 4→5)**: Stage 4 自プレイで「final の薄さ / 頂点感不足」が確認された場合、再評価候補 (v14 候補として予約、ただし v11 h-α 同型の「効き目ほぼゼロ」リスクは事前認識)
- **i-γ (interval 110→100)**: 装置の向き逆方向 = 本質的に除外。再評価の前提条件は「7 区分構造そのものを廃棄して別 spawn 設計に移る」場合のみ、本ライン上では復活なし
- **i-ε (全案却下)**: Nao_u から v05/v06/v07/v08/v09 のいずれかに「v12 着手しないでほしい」signal が来た場合に発動

---

## v12 で増やさないもの (1 機構刻み守準拠)

v11 §「v11 で増やさないもの」で挙げた未着手候補のうち、v12 では着手しない:

- **(g') ring 弧長 = invincibleT/180**: v09 で却下、v10/v11 で継続却下、v12 でも除外
- **(h-β) state 分離 / (h-γ) 2 重 ring**: v11 Stage 2 篩で不採用、v11 self_judgment §「h-β/h-γ 乗り換え判断」で「h-α 据え置き + 別軸振替」推奨 → 本 v12 が **その別軸** = 観点 7 (cap polish) から観点 6 (spawn テーブル polish) への軸変更を実行
- **Cell 1-4-6-8 amp 余地**: 別 iteration 割当
- **観点 8 bad policy headless**: 別 iteration 割当
- **§0a pending `t-260524125456-74d6` v06 5 機構統合版**: Nao_u 評価返信受領待ち、本 v12 と独立に保留継続

---

## (i-δ) 表層/基板 1ビット判定

| 軸 | 判定 |
|---|---|
| **lightness/darkness 軸変更 (色値の置換)** | × (色値追加なし、描画関連は触らず) |
| **新メカニクス (新規 timer/state の追加)** | × (state 追加なし、定数追加なし、新規関数なし、新規描画ロジックなし) |
| **戻し方** | ◎ (1 行 `spawnEnemy('medium',W*0.5,0,'aimed');` を line 472 に復元で v11 完全等価) |
| **コード追加範囲** | -1 行 (line 472 削除のみ、純削除) |

**結論**: **表層チューニング (最深部 / 削除側純化)** — 既存 spawnPhase6 関数内の 1 行を削除するだけ、state も timer も描画ロジックも追加なし。v11 (h-α) が「1 token 置換 (拡張側)」だったのに対し、本 (i-δ) は **純削除** = 表層チューニングの **削除側最深部**。次サイクル C293 実装時に「これは最も小さい変更で最大の効果」を Stage 4 mental sim + 自プレイで判定する。

---

## 接続先

- `game/graze_log/v11/index.html` line 472 — v12 (i-δ) 編集対象行 (spawnPhase6 の medium 1 体 spawn)
- `game/graze_log/v11/index.html` line 162-176 — v07 観点 6 7 区分 spawn テーブル設計コメント (本 v12 で再利用、編集なし、削除手順記述含む)
- `game/graze_log/v11/index.html` line 460-501 — spawnPhase1-7 関数群 + currentPhase + spawnInterval + spawnWave (本 v12 で spawnPhase6 のみ編集)
- `game/graze_log/v11/index.html` line 489-494 — spawnInterval 3 段階 (140/110/80) — 本 v12 では触らず (i-γ 候補は不採用)
- `game/graze_log/v11/self_judgment.md` 「次サイクル C291 への引き継ぎ予約」 §選択肢 C — 本 v12 が選択肢 C (別軸振替) の実行
- `game/graze_log/v11/self_judgment.md` メタ反省 §「Stage 3 予測は Stage 4 mental sim で校正される必要がある」 — 本 v12 でも同じ責務を継承、Stage 3 予測を v11 (h-α) より player 知覚可能性に寄せた校正済み
- `memory/game_lessons_log.md` R-A〜R-I — Ash/Log 共有抽象ルール (本 Stage 2 篩で 9 軸全件適用)
- `memory/feedback_clone_strategy.md` t:5 — 守の段階 1 機構刻み制約 (本 v12 で「削除側 1 行 = 削除そのもの」= 守の最深部の事例化、v11 (h-α) の「置換 1 行」より純度↑)
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任の連続体、本 v12 は Stage 1 (5 案) + Stage 2 (篩 9 軸) + Stage 3 予測雛形 (各案挙動 + 校正リスク併記) を 1 README に明示
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 本 README は index.html line 番号 + mental sim のみで根拠化、headless 数値ゼロ参照
- `memory/feedback_means_ends_reversal_check.md` t:5 — 本 v12 は **コード変更ゼロ** だが「次サイクル C293 実装の 1 行 bounded edit を確定」する物理ゲート開放 (Stage 1+2 文書化 → 次サイクル C293 で 1 行 commit = playable diff 第一義原則の連続体)
- `memory/feedback_prior_art_citation_must_verify.md` t:5 (M-41) — 本 (i-δ) は「spawn 削除による休符純化」で東方 Embodiment of Scarlet Devil stage 1 前半の意図的薄 spawn に近い 0-1/n prior art、graze_log の graze gauge 回復時間機構との接続は独自軸 (URL/引用文未記載 = 内的根拠依拠継続)
- `knowledge/20260605_skillopt_text_space_optimizer_bounded_edits_heldout_validation_skill_document.md` — Phase 2 SkillOpt 分析、本 (i-δ) は「bounded delete + 戻し方 1 行復元」概念の **削除側** 純粋応用 (v11 (h-α) は置換側だった)
- `log/cycle_staging.md` (本サイクル C291 Phase 3 → Phase 4 大作業宣言節) — 本 v12 起稿の発火元

---

## 次サイクル C293 着手手順 (本 v12 では実装しない)

1. `game/graze_log/v12/index.html` 作成 = `game/graze_log/v11/index.html` を copy
2. line 472 `spawnEnemy('medium',W*0.5,0,'aimed');` を削除 (1 行削除)
3. ship (`ash:` prefix commit) → Stage 4 自プレイ判定 (休符 phase 6 で medium が消えた gauge 回復体験を mental sim → AI 自プレイ) → v12/self_judgment.md 起稿
4. Stage 4 ship 後 mental sim で副作用 (休符薄味化) を確認、必要なら i-α (fan3 予兆) / i-β (small 4→5) への乗り換え判断 (v13/v14 候補昇格)
5. Nao_u 評価で「i-δ で休符が単純化しすぎ」signal が来た場合、line 472 復元で即 v11 等価に戻す (1 行戻し)

---

— Ash (Win2) 2026-06-05 C291 Phase 4 大作業 (v12 (i-δ) phase 6 休符 medium 削除案 Stage 1+2 確定 + 5 案篩比較 + 採用案 i-δ 確定 + 次サイクル C293 で 1 行削除 bounded edit 実装予約)

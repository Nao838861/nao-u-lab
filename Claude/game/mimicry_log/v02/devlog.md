# mimicry_log v02 — devlog (間合い選択ごっこ / 案A focus shot + token burst + large 敵 + wave10 ミニボス)

**status**: 2026-05-21 C216 Phase 4 で `mimicry_log/v01` から派生。brainstorm.md §採用判定 通過条件 4 つを 1 commit playable diff に実装。

派生元: `graze_log/v05.2` → `mimicry_log/v01` (演出強化のみで means-ends 反転と診断) → `mimicry_log/v02` 案A (操作状態空間 +1 次元 + token 軸 + 敵 type 拡張)

---

## 0. Q0 取り扱い訂正 (C214 Phase 4、sense_prediction_log N=25 反映)

**Q0 は R-B/R-C 内で機能させる言語化試験。評価軸 0 として最上位固定しない**。詳細は [`brainstorm.md`](./brainstorm.md) §「Q0 の取り扱い訂正」と同じ運用に統一。

理由 (要約):
- N=24 (発火段数撤回) 直後に別軸 Q0 を即座に最上位に置こうとした自己同型 (N=25)
- R-B「核の快感が 1 語で言えるか」+ R-C「見ればわかる・やればわかる」と Q0 の射程は重複
- v02 設計判断は R-A〜R-I で行う。Q0 単独で判定軸を構成しない

### 採用判定進捗 (brainstorm §採用判定 通過条件 4 つ、C214 Phase 4 静的検証時点)

- [x] 通過条件 1: focus 中 graze 半径 1.5x (実装: `FOCUS_GRAZE=1.5` / `curGrazeR()`、_sim_check Test1 OK)
- [x] 通過条件 2: focus 切替視覚シグナル (vignette + 自機青リング + hit dot 可視化、撃破粒子 0.7x 減衰)
- [x] 通過条件 3: focus token + 3 個で burst (small+1/med+3/large+9、burst 60f DPS2.0/move0.4/hit0.3、_sim_check Test2 OK)
- [x] 通過条件 4: large 敵 (HP9、wave>=5: 5%/wave>=8: 15%) + wave 10 miniboss (large×3 + narrow/spread 2 秒毎切替、_sim_check Test3/Test4 OK)

**4/4 静的検証通過**。ただし「体感で繋がっているか」の実プレイ評価は §5 の S1-S5 撤回トリガーで次サイクル冒頭に Nao_u/Mir/Ash プレイ依頼で確定する (静的全通過 ≠ 体感保証)。

---

## 1. Q0 — 1行コンセプトゲート (この遊びは1行で何か)

> **ゲート名リネーム (C246)**: 旧名「ミミクリ軸 (何ごっこか)」→ 機能名「1行コンセプトゲート」へ。理由 = ゲート名に固有コンセプト「ごっこ」を含めた結果、参照されるたびに「ごっこ」語が増殖し Nao_u 2026-05-26 06:06 #human-steering 「ごっこ乱用」指摘を招いた。本文中で「ごっこ」を採用する判断は残すが、ゲート名は機能名に限定する (`feedback_recency_bias_concept_overuse.md` §2026-05-26 直処方)。

**「弾の間合いを毎秒選び替えるごっこ」**

- 自分の弾の射程と精度を `SHIFT` で切替、敵弾との位置関係に合わせて間合いを選び直す
- v01 の「自分の弾が世界を即座に変える因果」軸を継承しつつ、player 側の judgement (= 毎秒どの間合いを選ぶか) を core に置き直す
- カイヨワ 4 要素: ミミクリ (間合いを操る者) + アゴン (撃破) + アレア (敵 RNG) + イリンクス (focus burst の一瞬の重ね合わせ) の 4 軸 (v01 比 1 軸追加)

## 2. Q1 — 30 秒プレイの想像 (操作 / 報酬 / 失敗の見え方)

| 秒数 | 起こること | 受け取り |
|---|---|---|
| 0–3 | PRESS SPACE → wave 1 small 3 体 | 「撃つゲーム。SHIFT がある」 |
| 3–8 | small 撃破 + medium 登場 → 撃破 | 「撃つと崩れる」 |
| 8–15 | wave 2-3 small/med 混在 + 敵弾発射 | 「graze ring が淡く出る、focus ring が見える」 |
| 15–22 | SHIFT 押下 → vignette + 自機リング青 + hit dot 縮小 | 「これが focus か。狭くなって精度上がった」 |
| 22–30 | SHIFT 中の medium 撃破で TOKEN +3 → Z で BURST 1 秒 | 「token 溜まった、Z で短時間 強化」 |

**30 秒で focus on/off + burst の 2 軸選択を 5 回以上発生**させる設計。focus tutorial は wave 4 (縦長 medium 3 体) で明示的に示す。

## 3. brainstorm.md §採用判定 通過条件 4 つの実装

| 条件 | 実装箇所 (index.html) | 確認 |
|---|---|---|
| 1: focus 中 graze 半径 1.5x | `FOCUS_GRAZE=1.5` / `curGrazeR()` / 弾衝突判定で `gR` 使用 | `_sim_check.js` Test1 OK (graze 33 vs base 22) |
| 2: focus 切替視覚シグナル (vignette + 自機リング + 撃破粒子 0.7x 減衰) | `state.focus` 時に `createRadialGradient` で外周 vignette、自機青リング + hit dot 可視化、`spawnKillBurst` 内 `focusK=FOCUS_PARTICLE=0.7` | コード読み: vignette/ring 両方 focus 中のみ描画、`focusK` で N と Ninner を縮小 |
| 3: focus token + 3 個で burst (small+1/med+3/large+9、burst 1秒 DPS2.0/移動0.4/hit0.3) | `state.focusTokens` を kill 時加算 (focus 中のみ)、`triggerFocusBurst()` で `BURST_FRAMES=60` / `BURST_DPS=2.0` / `BURST_MOVE=0.4` / `BURST_HIT=0.3` | Test2 OK (tokens 3→0, burstT=60, hit 2.4, move 0.4, cd 4<6) |
| 4: large 敵 (HP9, wave>=5 で 5%, wave>=8 で 15%) + wave 10 ミニボス | `spawnEnemy('large',...)` hp=9 / `spawnWaveRandom` largeP / `spawnWave10MiniBoss` large×3 + `miniBossPhase` 2 秒毎 narrow/spread 切替 | Test3 OK (3 large, hp=9), Test4 wave 5 で large 出現確認 |

### 補足

- **wave>=5 の 5% 出現率の calibration**: 現実装の `spawnWave` は 70% WAVE_FUNCS + 30% spawnWaveRandom 分岐で、WAVE_FUNCS 側にも単発 large 抽選を追加した結果、Test4 で per-enemy ≈ 1.5% の large 出現を観測。brainstorm の「5%」は per-enemy か per-wave か曖昧、実装は「per-wave に 1 体程度 (= 5% 解釈)」寄り。プレイ感で薄ければ次サイクルで largeP を引き上げる
- **wave 10 boss clear 後の進行**: 現実装は `bossClear=true` フラグを立てるのみ (game clear 状態にはしない)。次 wave (11+) はランダム生成に戻る。「撃破で wave>=11 へ進む (or game clear)」のうち前者を採用
- **focus burst キー**: brainstorm では「使い時を player が選ぶ」とのみ指定。実装は `Z` キーを新規割当 (操作キー数 5→6、S1 撤回シナリオの risk 拡大だが、SHIFT との衝突回避優先)。Cave 系 (同じボタンで状態切替) への退避は v03 候補

## 4. brainstorm §「次の評価軸候補」(X1/X2/X3) 通過確認 3 質問の自己回答

### Q-X1: focus mode は ship 制御 / 弾回避 / 敵殲滅 の 3 軸全部に因果接続しているか

**YES (3 軸とも実装)**:
- **ship 制御**: focus 中 `curMoveK()=0.5` で移動速度が物理的に変わる (操作応答の質感が変わる)
- **弾回避**: focus 中 `curHitR()=4` (hit 半径 0.5x) + 自機 hit dot 可視化で「縫う」体感が解像度上がる
- **敵殲滅**: focus 中 `shotCooldownF()` が 1/1.3 で短縮、弾 spread も 1/3 で集約 = 縦長 path の敵を狙い撃ちできる

3 軸合成のごっこ = 「縦長の敵列 (=ship 制御方向に並んだ標的) を、間合いを狭く合わせて (=弾回避との両立)、密度高く撃ち抜く (=敵殲滅)」。v01 の「単軸 (撃つ強さ固定) → 1 軸合成 (敵殲滅のみ)」から 3 軸合成への構造的進化を確認。

### Q-X2: L2 弾幕配置の path 5 分類を選んだ理由を devlog に書けるか (Touhou 系の無反省借用か、Q0 軸に従属した選択か)

**YES (5 分類のうち 2 分類のみ採用、Q0 軸に従属)**:
- 実装した path は **narrow (= 直線/微小 spread)** と **spread (= 拡散 5 方向)** の 2 種類のみ
- 5 分類 (直線/ジグザグ/ループ/S字/螺旋) のうち、Q0「弾の間合いを毎秒選び替える」軸に直接従属するのは「player の間合い選択を強制する path」= narrow / spread の 2 種
- ジグザグ/ループ/螺旋は「player の path 学習」が core になるので別軸 (Ash 5/19「敵別 schema 学習軸」系) に押し出した。本実装では未採用
- Touhou 系の無反省借用ではなく、Q0 軸から逆算した「focus 推奨 = narrow」「normal 推奨 = spread」の 2 値設計。借用の動機は明確化された

### Q-X3: wave 1-10 の theme 導入順序が Pixelblog の「易しめ→興味深い→習得報酬」と整合するか

**YES (3 段階に分離)**:
- **wave 1-3 (易しめ)**: small/medium のみ、敵弾発射密度低。player に「撃つゲーム」を学ばせ、SHIFT の存在は HUD に提示 (押すかは player 任意)
- **wave 4 (興味深い)**: 縦長 medium 3 体 = focus tutorial。SHIFT を押さない限り時間がかかる配置で、「あ、ここで SHIFT か」と気づく
- **wave 5-9 (深化)**: large 混在 (5-15%) + 既存 wave_funcs ランダム化
- **wave 10 (習得報酬 = mid-boss)**: large × 3 同時 + narrow/spread 2 秒毎切替 = player は 2 秒に 1 回 focus を切り替える必要、判断密度最大

Pixelblog の「mid-boss で習得を報酬化」と整合: wave 10 ミニボスは「SHIFT + Z を使いこなせる player にだけ完遂可能」設計。

## 5. self_judgment (実装直後の静的検証 + 部分プレイ)

**実プレイは未実施** (Win headless ターミナルで browser を立ち上げる手段がないため)。代わりに以下 3 種の静的検証を行った:

1. **Node.js でスクリプト構文チェック**: `new Function(scriptBody)` で構文 OK 確認 (32027 chars)
2. **挙動シミュレーション** (`_sim_check.js`): focus mode 4 つの multiplier、burst 6 つの効果、wave 10 boss の 3 large hp=9、wave 5 で large 出現の 5 種を全部 OK
3. **コード読み返し**: vignette の `createRadialGradient` 描画、自機青リング + hit dot 表示、撃破粒子 `focusK=0.7` 減衰、token 加算が `state.focus` 真の時のみ発火、Z キー → `triggerFocusBurst()` が `focusTokens>=FOCUS_TOKEN_TH` ガード付きで動作 — 全て brainstorm 通過条件 4 と一致

**判定**: 静的には Q0「弾の間合いを毎秒選び替えるごっこ」を体験するための機構は揃った。**ただし「体感で繋がっているか」は実プレイ未実施なので未確定**。次サイクル冒頭で Nao_u or Mir/Ash に手動プレイを依頼し、以下 5 点を観察してもらう必要がある:

- (1) 30 秒以内に SHIFT を自然に押したか (S1 操作キー飽和 撤回トリガー)
- (2) SHIFT 中に「得した瞬間」を 30 秒に 1 回以上感じたか (S2 判断利得 撤回トリガー)
- (3) graze が focus / normal どちらかに極端化していないか (S3 両立破綻 撤回トリガー)
- (4) focus mode 中であることを 1 秒以内に視覚認識できたか (S4 視覚シグナル埋没 撤回トリガー)
- (5) Touhou 借り物感ではなく Q0 軸との接続を感じたか (S5 means-ends 反転 v01 同型化 撤回トリガー)

5 点のいずれかが NG なら brainstorm.md §別軸転換候補 案 B (graze→resource 変換、v05.5 想定) へ転換。

## 6. v01 → v02 の差分 (実装 9 箇所)

| 項目 | v01 | v02 | 意味 |
|---|---|---|---|
| 1. focus mode | 無 | SHIFT で `state.focus=true` / 全効果 5 種 | 操作状態空間 +1 次元 |
| 2. 弾 spread 圧縮 | 固定 | focus 中 1/3 (`FOCUS_SPREAD`) | 弾の集中性 |
| 3. shot cooldown | gauge level のみ | + focus 1/1.3 / + burst 1/2.0 | DPS 軸 |
| 4. 移動速度 | 固定 4.2 | focus 0.5x / burst 0.4x | 動 vs 静のトレードオフ |
| 5. hit/graze 半径 | 固定 | focus / burst で動的 (`curHitR/curGrazeR`) | 「縫う」体感 |
| 6. focus token | 無 | small+1/med+3/large+9 | sub アイテム軸新設 |
| 7. focus burst | 無 | Z で 1 秒間 強化 (token 3 消費) | judgement 第2軸 |
| 8. large 敵 | 無 | HP9 / wave>=5: 5% / wave>=8: 15% | sub 敵軸拡張 |
| 9. wave 10 mini boss | 無 | large×3 + path narrow/spread 切替 | sub boss 軸新設 (L5) |

(削除手順 = v01 等価復元): `state.focus` / `focusTokens` / `burstT` / `miniBoss*` を消し、`curHitR/curGrazeR/curMoveK` を定数に戻し、`spawnEnemy('large',...)` 分岐と `spawnWave10MiniBoss` を消し、`triggerFocusBurst` を消す。

## 7. 接続先

- [`game/mimicry_log/v02/brainstorm.md`](./brainstorm.md) — 着手前批判 (採用判定 通過条件 4)
- [`game/mimicry_log/v01/`](../v01/) — 派生元 (means-ends 反転 v01 自己診断)
- [`game/graze_log/v05.2/`](../../graze_log/v05.2/) — graze_log 系列 base
- [`projects/game_development.md`](../../../projects/game_development.md) — C216 Phase 4 で本 ship 記録
- [`memory/feedback_means_ends_reversal_check.md`](../../../memory/feedback_means_ends_reversal_check.md) — means-ends 反転 診断
- [`memory/game_lessons_log.md`](../../../memory/game_lessons_log.md) — R-A〜R-I 抽象ルール (本実装は R-I 着手前批判 4 要素通過済)
- Nao_u 2026-05-20 09:35 ts=1779237349 (#game-rights) — graze 凍結
- 玉置絢 2026-05-20 13:10 ts=1779250230 — 「何ごっこ」軸

## 8. 次サイクル引き継ぎ

- **最優先**: 実プレイ評価 (Nao_u or 他インスタンス) で S1-S5 撤回トリガー 5 点の有無を確定
- 5 点 NG 0 件 → v02 結晶化 + v03 ブレスト着手 (聴覚アフォーダンス / Cave 系同じボタン状態切替へ進化)
- 5 点 NG 1+ → v02 撤回理由を本 devlog に追記、案 B (graze→resource 変換) 着手判断
- `_sim_check.js` は将来の挙動回帰検知に流用可 (v03 でも focus mode 倍率定数を変えた時の検算)

## 10. § Log 自己判定 (C219 Phase 4) — 2026-05-22 03:00 Log

C218 Phase 5 「次回起動時にやること」#1 = 4 サイクル目継続。Slack #all-nao-u-lab ts=1779385355 で「Phase 4 大作業に本観察を充てる」と外的責任化済 → 本サイクル Phase 4 で完遂。

### (a) Log 自身の v02 観察記録 (1 セッション、ヘッドレス代替)

**前提**: Win headless Bash 環境ではブラウザ起動不可。代替として `node _sim_check.js` 挙動観察 + `index.html` 全 1035 行コード再読 で「実行可能な観察」を行う。

**sim_check 実行結果 (2026-05-22 03:00、v02 directory 直下)**:
```
[Test1] focus mode multipliers
  OK   hit 0.5x (4 vs base 8)
  OK   graze 1.5x (33 vs base 22)
  OK   move 0.5x (0.5)
  OK   DPS up (cd focus 6 < cd normal 8)
[Test2] focus burst
  OK   tokens consumed (0==0)
  OK   burstT active (60>0)
  OK   burstCount=1
  OK   burst hit 0.3x (2.4)
  OK   burst move 0.4x (0.4)
  OK   burst DPS 2.0x (cd burst 4 < cd focus)
[Test3] wave10 miniboss
  OK   miniBossActive
  OK   3 large enemies
  OK   large hp=9
[Test4] wave>=5 spawn distribution total=976 small=694 med=263 large=19 largeP=0.019
```

**コード再読観察 (HUD / 描画 / 入力フロー、line 番号付き)**:
- `drawHUD()` 915-928: focus / token / burst HUD は 1 行 (y=44)、左から FOCUS 表示 → TOKEN x/3 → (条件付き) Z = BURST または BURST 残時間
- **発見**: TOKEN が閾値未満 (0/1/2) のときは Z キー HUD が完全非表示 (line 922-928 の if/else if のみ、else 節なし) — 「Z キーが存在することを HUD が一度も教えない」現象。タイトル画面 (drawTitle, line 963) と body の `<p>` 説明文 (line 17) でのみ Z 言及
- `draw()` 858-864: vignette は `state.focus` 真の時のみ `createRadialGradient` 描画。中心 25% 透明 → 端 62% で `rgba(0,16,40,0.55)` の青暗色。半透明 0.55 は十分検出可能だが、player 視線が中央 (自機 + 敵弾) に集中していると周辺視への入射経路で見落としリスクあり
- `update()` 515-521: wave 10 miniboss clear は `bossClear=true` + `BOSS CLEAR` popup 90f 表示のみ。wave 11 への遷移は通常の `spawnWave` ランダムループに復帰 (line 415-426)。`bossClear` フラグは後段で参照されておらず**永久に有意な効果を生まない** (dead flag) — wave 11 が「ただの 5-9 ランダム」に戻る理由が物理的に確定

**自己判定**: sim_check 5 テスト全 OK + コード読みで focus / burst / large / miniboss の 4 機構は brainstorm 通過条件 4 を満たす実装が継続している。**ただし「体感で繋がっているか」は依然未確定** (実プレイ未実施)。本観察は「機構が壊れていない」確認に留まる。

### (b) 赤信号 3 候補 (Slack ts=1779385355 で公開) の踏査結果

各候補について「コード読みで踏む可能性が高いか」を 3 段階で評価。3 候補のうち **2 候補は構造的に踏みやすい / 1 候補は player 状態依存** と判定。

| # | 赤信号 | 踏みやすさ | 根拠 (コード再読所見) |
|---|---|---|---|
| 1 | vignette 見落とし | 中 | `state.focus` 中のみ描画、alpha 0.55 で十分強度だが中央視線時の周辺視盲点に依存 (player 状態依存) |
| 2 | **Z キー未気付き** | **高** | HUD は TOKEN 3 達成後しか Z を表示しない (else 節欠落)。タイトルテキスト見逃し + HUD 注視 のみで遊ぶ player は永久に Z の存在を学習しない |
| 3 | **wave 11 突入無感** | **高** | `bossClear` フラグが dead (後段未参照)、wave 11+ は WAVE_FUNCS ランダム + 通常 large 抽選に戻る = wave 5-9 と統計的に区別不能 |

**踏んだ数**: コード読みベースで **2 / 3** (Z キー未気付き / wave 11 突入無感)。vignette は player 状態依存で「踏まないかもしれない」が、実プレイ評価 (Nao_u/Mir/Ash) で確定する必要がある。

**「実プレイで踏んだ数」との差**: 本観察はコード読みのみなので踏みやすさの推定。実プレイで誰か (Nao_u 含む) が 30 秒プレイした時に「あれ、Z 何のキーだっけ」「wave 11 来たけど何が変わった?」と言う確率は高い、と Log は予測する。

### (c) 改修候補 M 個 + 優先順位 1 位の改修提案

| 候補 | 対応赤信号 | コスト | 効果予測 | 優先 |
|---|---|---|---|---|
| **C1: HUD に「Z (need TOKEN 3)」常時表示** | #2 Z キー未気付き | 4 行 | Z キー存在を全 player に伝達、TOKEN 蓄積動機にも接続 | **1 位** |
| C2: README.md 新規作成で操作キー全列挙 | #2 (二次) | 1 ファイル | directory listing から操作把握可、Nao_u/他インスタンス引き継ぎ容易化 | 2 位 |
| C3: wave 11 突入時に「WAVE 11 START」または「AFTER-BOSS」popup | #3 wave 11 突入無感 | 5 行 | boss clear 後の「世界が変わった」感を最小コストで物理化 | 3 位 (次サイクル) |
| C4: vignette alpha 0.55 → 0.70 引き上げ | #1 vignette 見落とし | 1 行 | 周辺視検出力強化、ただし過剰演出リスク | 4 位 (次サイクル、実プレイ判定後) |

**本サイクル実装**: C1 + C2 を Phase 4 内で物理化。
- C1: `index.html` line 922-928 の if/else if に **else 節を追加**、TOKEN 未達時も `'Z (need TOKEN 3)'` を grey で表示。改修後 sim_check 全テスト OK 維持確認済 (Test1-4)
- C2: `README.md` 新規作成、操作キー表 + TOKEN 蓄積式 + 構造ポインタを 1 ページに集約

C3/C4 は次サイクル送り。理由: 実プレイ判定なしに wave 11 演出 / vignette 強度を即変更すると「最後に見たものを過剰に大事なもの」(Nao_u 5/21 05:50) 同型のリスク = まず Nao_u/他インスタンスの実プレイで「踏んだ数」を確定してから次の演出強化を判定する。

### (d) 本セクションの位置付け

- C218 Phase 5 「次回起動時にやること」#1 への Log 主体応答 = 4 サイクル目継続案件を本サイクルで「Log 観察分」だけ完遂
- **Nao_u/Mir/Ash の実プレイ判定は依然未着** (Slack ts=1779385355 で再提示済、本サイクル Log 主体プッシュは行わない方針 Phase 1 §2c 整合)
- 次サイクル冒頭: もし実プレイ判定が来ていれば S1-S5 撤回トリガー 5 点と「Log 観察 2/3 候補」の一致度を判定、来ていなければ C3/C4 を Log 単独で先行実装するか再判断
- **意義**: 「直近 5 commit が codex 系または Auto sync で Log 主体 game: commit が不在」(Phase 1 §0) の状態を本サイクルで解消、Log 自走サイクルが playable diff を出す経路を再確立

## 11. C220 Phase 4 — bossClear dead flag 救済 (2026-05-22 06:50 Log)

C219 §10(c) で「次サイクル送り」と保留した **C3 (wave 11 突入時 popup)** を本 Phase 4 で実装。

### 着手判定の根拠 (C219 保留判定を覆した理由)

C219 §10(c) 保留判定の主な根拠は「実プレイ判定なしに **演出強化** を即変更すると『最後に見たものを過剰に大事なもの』(Nao_u 5/21 05:50) 同型のリスク」。本実装は演出強化ではなく **dead flag (bossClear) 救済 = 既存設計が物理的に成立していなかった構造バグの修正**。カテゴリが保留判定の射程外。

C219 §10(a) line 178 で確定した所見:
> `bossClear` フラグは後段で参照されておらず**永久に有意な効果を生まない** (dead flag) — wave 11 が「ただの 5-9 ランダム」に戻る理由が物理的に確定

「設計意図が `bossClear` フラグを立てた」のに「物理化が抜けていた」 = 構造の未完成。実プレイ判定とは独立に修正してよい。

### 実装

`index.html` `spawnWave()` 冒頭 5 行追加:

```javascript
function spawnWave(){
  state.wave++;
  const w=state.wave;
  // wave 10 boss clear 後の最初の wave 突入を可視化 (dead flag 救済)
  if(state.bossClear){
    state.bossClear=false;
    state.popups.push({x:W/2,y:H/2-40,text:`WAVE ${w} AFTER-BOSS`,life:60,c:'#80ffd0'});
  }
  ...
```

### 検証

`_sim_check.js` に Test6 (bossClear → spawnWave で popup 出力 + flag リセット + idempotent guard) 追加、4 アサート全通過。既存 Test1-5 も全通過維持。

### 残課題

- 実プレイで wave 10 → 11 遷移を観測した player が「AFTER-BOSS」表示で何かが変わったと感じるか = 次サイクル以降の Nao_u/Mir/Ash プレイ判定で確定
- C4 (vignette alpha 0.55 → 0.70) は依然「演出強化カテゴリ」のため次サイクル送り維持

## 9. C218 Phase 4 追記 — 3 層分離試行 implementation-notes.md 新規作成 (2026-05-21 23:50 Log)

C215 Phase 3 §洞察3 で予告した「devlog / implementation-notes / 却下案ログ の 3 層分離」を、Log 側で初めて物理化した。

- 新規ファイル: [`implementation-notes.md`](./implementation-notes.md) — リアルタイム判断層 (本サイクルは後追い記述、次 v03 で実装中記述に移行する判定軸を §4 に明文化)
- 内容: C216 実装中の判断分岐 5 件 (focus token 加算条件 / burst キー / boss clear 後進行 / large 出現率解釈 / vignette 透過率) を「選んだ案 / 選ばなかった案 / 理由 / 未解決」形式で再構成
- 却下案ログ独立ファイル化は **本サイクル保留**。理由: Nao_u 5/21 05:50 段数議論凍結叱責との構造同型回避 (層数で解決した気になる誤謬の予防)。implementation-notes + brainstorm.md §A4 で「迷って捨てた判断」を吸収できるかを次 v03 で判定する 2.5 層運用試行

**意義**: C215 Phase 3 §「v02 設計言語の切替方針」で書いた「devlog の薄い写しではなく実装中の分岐記録を独立化する」予告を、本サイクルで物理化。staging C218 Phase 4 完遂条件 4 ファイル目 (`implementation-notes.md` 試行) を満たした。

**残課題**: 後追い記述では「実装中のリアルタイム性」が失われる。v03 で本ファイル §4 評価軸 1-3 を実装中に判定し、3 層分離の本格採用 or 2.5 層への退避を確定する。

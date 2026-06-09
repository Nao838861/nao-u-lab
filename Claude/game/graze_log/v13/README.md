# graze_log v13 — phase 5 山 1 medium fan3 切替 (j-α) 1 行 ship

**status**: v13 (j-α) shipped

## 改変対象
- file: `index.html` line 466
- v12: `spawnEnemy('medium',W*0.35,0,'aimed');`
- v13: `spawnEnemy('medium',W*0.35,0,'fan3');`
- 変更内容: bulletPattern 引数を `'aimed'` → `'fan3'` (5 文字置換)

## Stage 3 予測 (≤3 行)
- 52-65s phase 5 (山 1) 区間で fan3 1 体が登場 → 78-90s phase 7 (山 2 final) の fan3 4 体への予兆として機能
- 山 1 が「aimed + fan3 mix」化、final への接続が滑らか化、メリハリのリズム強化を狙う
- 副作用リスク: phase 5 密度↑だが fan3 1 体追加 (medium 2 のうち 1 → fan3) のみで描画 budget は許容範囲内

## 戻し方 (1 行)
- `index.html` line 466 の `'fan3'` を `'aimed'` に書き戻し → v12 完全等価

## 親
- v12 (i-δ) phase 6 休符 medium 削除 1 行 ship (commit `3d91915db`)
- v12 README.md Stage 1+2 篩 (line 31-46) で (i-α) として確定済

## Stage 4 Ash 自プレイ判定 (C0608 Phase 4)

### (a) phase 5 medium fan3 切替の実装内容 (index.html 該当箇所確認)
- L466: `spawnEnemy('medium',W*0.35,0,'fan3');` — phase 5 (山 1, 52-65s) の medium 2 体のうち左側 (W*0.35) を fan3 化、右側 (W*0.65) は aimed 維持 (L467)。spawnPhase5 1 回あたり small 8 列 + medium 2 (fan3 + aimed mix)。
- L488-493 spawnInterval: phase 5 は 80 frame = 約 1.33 秒ごとに spawnPhase5 が走る → 13 秒 phase 中 約 9-10 サイクル、累積で fan3 medium 約 9-10 体登場。
- L581-588 bulletPattern dispatch: fan3 = aimed の baseAng ± 0.26 rad (約 15°) 3-way、wob=1 (amp 2.6 / ω 0.28 速躍動)。aimed = 単発、wob=0 (amp 1.4 / ω 0.18 緩揺)。speed sp=2.4 共通、fireT 間隔 70-110f 共通。
- L818-825 windup telegraph: fan3 は 3 本予告線 (spread 0.26 rad)、aimed は 1 本。WINDUP_FRAMES 中の alpha/len は時間 t で増加 → telegraph 自体は dodge 余地を残す設計。

### (b) Stage 3 予測 (line 12-14) との一致/乖離点

**一致**:
- 「山 1 が aimed + fan3 mix 化」← 実装は完全に予測通り (medium 2 のうち 1 を fan3 化、左右配置で空間的 mix)。
- 「副作用リスク: 描画 budget 許容範囲内」← ebullets push が medium 1 体あたり 1→3 に増えるのみ、phase 7 fan3 4 体 + small 4 = 既存上限 (12 弾/spawn) の半分以下、budget 整合。
- 「final への予兆」← phase 7 (78-90s) で fan3 4 体が登場する設計に対し、phase 5 で fan3 を「既出 pattern」として導入する役割は果たす。

**乖離 (Stage 3 予測責任の不足)**:
- Stage 3 「fan3 1 体追加」← spawnInterval=80 × 13 秒 = 9-10 サイクル累積を計算に入れていなかった。**spawn 1 回あたり 1 体は正しいが、phase 5 中の累積登場数は約 9-10 体**。「予兆」レベル (= 1-2 体程度の少量導入) ではなく「mix 化導入」レベル (= phase 全体を fan3 が支配する) になっている。意図 (「aimed + fan3 mix」) としては乖離していないが、文言「予兆として機能」は累積数を見落としている。
- Stage 3 「メリハリのリズム強化を狙う」← phase 5 中の fan3 累積数が aimed と同等になるため、phase 5 自体が「中混度」になり phase 7 の「fan3 4 体同時 + small 4 = final 山」とのコントラストが Stage 3 想定より縮む可能性。リズム強化は実装上は確実だが「強化幅」は予測より控えめ。

### (c) 結論ラベル

**Nao_u プレイ要請 ready** (一行戻し可能、phase 7 予兆機能は成立、副作用許容範囲)。

ただし上記 (b) 乖離点 (Stage 3 で「fan3 1 体追加」と書いたが累積 9-10 体登場) は次回 Stage 3 予測で「spawnInterval × phase 秒数 = 累積 spawn 回数」を計算式として明示することで再発防止する。本 v13 実装自体は意図通り、戻し容易、phase 7 final への接続も成立。

### (d) tutorial trap 軸 (C0609 Phase 2 外部研究適用)

C0609 Phase 1 §6 で集めた外部知見を v13 (j-α) の Nao_u プレイ要請地点に適用する独立評価軸。Stage 4 (c) で ready 結論を出した後、別レンズで再走査する目的。

**適用する 3 ソース**:
1. **Anderson et al. 2024 ("Tutorial-less learning in Baba is You")**: instruction-based tutorial 群と discovery-based 群を比較し、comprehension/retention に有意差なし。含意 = 「直感的に解ける設計はそれ自体が教えており、外付け説明より体験内 sign が効く」(C0609 Phase 1 §6.1)。
2. **Cao & Liu 2022 (game tutorial onboarding study)**: 複雑メカニズム = 明示誘導が効く、直感的メカニズム = 暗黙学習で同等。閾値判定の参照 = 「該当メカニズムが『初手で動かしてみれば挙動が分かる』水準か」(C0609 Phase 1 §6.2)。
3. **@ore57436902 ツイート (2026-06-09 twitter_recommended #42)**: 「読まなくても・すっ飛ばしても なんとかなるのが前提で、チュートリアルがあればより親切 くらいの位置づけでありたい」。チュートリアル不要論の生活実感的表現で、評価基準 = 「README/help 無しで初手から進めるか」(C0609 Phase 1 §3)。

**graze_log v13 (j-α) 自己審査**: Nao_u が README/v13 ノート/cross_review コメントを一切読まずに index.html を開いた状況を想定する。タイトル画面 (L1043-1051) には `GRAZE → 軌道予測線 + ゲージ → BOMB` `GRAZE 連続 5 回 → ACTIVE DEF` 操作 4 行が明示されており、Cao & Liu 2022 の分類では「明示誘導側」の設計だ。ただしこの 4 行を読まず即 SPACE で始めた場合、(1) graze 半径 R_GRAZE=22 px の擦り感覚は最初の被弾未遂で即座に体感できる (graze 時の軌道予測線描画 L645 と STREAK HUD インクリメント L1005 で feedback ループ閉、Anderson 2024 の discovery-based 系で機能する確度高)、(2) phase 5 medium fan3 切替の「予兆としての mix 化」(本 v13 改変点) は 52-65 秒経過後の体験で、初手で理解する種類の情報ではないため tutorial trap 領域外、(3) **問題は STREAK=5 → ACTIVE DEF 発動経路**で、HUD 右上の `SPACE [B]OMB/[D]EF/[-]` 切替表示 (L1011-1019) が context 駆動だが、STREAK が 5 に到達した瞬間の視覚的強調 (画面振動 / 色変化 / 音) は無く、SPACE 押下時にだけ activeDef 経路 (L388-407) が走る — タイトル画面の 1 行 `GRAZE 連続 5 回 → ACTIVE DEF` を読み飛ばすと、ACTIVE DEF の存在自体に気づかず最終スコアの DEF 0 で終わる確率が高い。Untitled Goose Game (Phase 1 §6.3) は trial-and-error で気づける設計だったが、v13 の DEF は「STREAK 蓄積→SPACE 文脈分岐」という 2 段抽象が要り、暗黙学習の到達コストが graze 単独より高い。

**結論**: graze + BOMB は tutorial-less でも到達可能、ACTIVE DEF は現状 README/タイトル画面依存。Stage 4 (c) の「Nao_u プレイ要請 ready」結論自体は撤回しない (タイトル画面に明示テキストが残っているため Cao & Liu 2022 の「複雑メカニズム = 明示誘導」基準は満たす) が、tutorial trap 軸単独の評価では DEF 経路は「読まれた前提」の設計であり、@ore57436902 の「読まなくても なんとかなる」基準には未到達。

**改善候補 (v14 候補 1 つ)**: STREAK が GRAZE_STREAK_TH (=5) に到達した frame で 1 度だけ画面中央に短時間 (60F) `DEF READY` テキスト + プレイヤー周囲の R_GRAZE リング点滅を発火 (L668-669 の `state.grazeStreak>=GRAZE_STREAK_TH` 分岐に 1 度フラグ立てて pop / ring push)。タイトル画面の説明を読まず始めた Nao_u が、STREAK 5 で「何かが起きた」と認知し、HUD 右上の `[D]EF` 表記と関連付ける discovery-based 経路を 1 本敷く。実装規模: 約 10-15 行追加 + state.defReadyFlashed bool 1 個。戻し容易性は v13 同等 (条件分岐 1 ブロックを削除)。

## v14 (k-α) 最小実装 — two-stage organic onboarding (C0609 Phase 4)

**status**: v14 (k-α) shipped on top of v13 (j-α)。同 `index.html` 内に minimal patch、戻し可能。

### 改変内容 (2 機能)
1. **STREAK=4 (= GRAZE_STREAK_TH-1) で R_GRAZE リング予兆発光**: index.html L899-906 (5 行)。STREAK=4 時に R_GRAZE リング (半径 22 px) を低彩度 cyan-green (`rgba(128,255,208, pul*0.45)`) で周期点滅 (`Math.sin(state.t*0.18)`)。既存の `rgba(255,216,112,0.10)` 薄黄リング (L898) は維持、その上に重ねる。
2. **STREAK>=5 (= GRAZE_STREAK_TH) かつ activeDef 非発動中で画面中央上部 `DEF READY` テキスト確定表示**: index.html L1031-1043 (7 行)。`W/2, y=60` に `bold 16px` で `DEF READY` を周期 pulse (`0.6+0.4*|sin(t*0.12)|`)。既存の player 近傍 popup (L702, life=40) と小マーカー (L920-925) は維持、本ブロックは prominent visible layer として上位レイヤーに追加。

### 戻し方
- 上記 2 ブロック (合計 12 行) を削除 → v13 (j-α) と完全等価。
- 部分戻し可: STREAK=4 ring 予兆だけ削れば「STREAK=5 中央 DEF READY のみ」、中央テキストだけ削れば「STREAK=4 ring 予兆のみ」。

### 構造意図 (Stage 4 (d) tutorial trap 軸の処方)
Stage 4 (d) で「DEF 経路はタイトル画面の `GRAZE 連続 5 回 → ACTIVE DEF` を読まないとプレイヤーが ACTIVE DEF の存在に気づかず DEF 0 で終わる」と自己審査した。本 v14 (k-α) は tutorial-less discovery 経路を 1 本敷く処方:

- **STREAK=4 ring 予兆 (premonition)**: Miyamoto/Zelda 型 organic onboarding (Minishoot' Adventures 2026-04 regionfree.net 評: 「players are taught new abilities, obstacles, and enemies in an organic and rewarding way」)。STREAK=5 確定の 1 手前で「何かが起きそう」を体感させる二段階点灯。
- **STREAK=5 中央 DEF READY**: Boghog 'simple upfront game plan' (shmups.wiki Boghog 101: 「give the player a simple, easy to understand game plan upfront and then let them discover additional nuances」)。R_GRAZE リング近傍の小マーカー (L920) では「読まずに始めたプレイヤー」の foveal vision に届かないため、画面上部に大文字で「次の操作が用意されている」ことを明示。HUD 右上の `SPACE [D]EF` 表記と紐付ける discovery 経路を 1 本敷く。
- **外部裏付け 3 ソース** (C0609 Phase 1 §6 で M-41 通過済): Boghog 101 / Miyamoto-Zelda 型 organic onboarding / Sparen ddsga2 「thoughtful use」。Anderson 2024 (tutorial-less learning) と Cao & Liu 2022 (intuitive mechanism = implicit learning sufficient) も Stage 4 (d) 適用済。

### v14 (k-α) Stage 3 予測 (≤3 行)
- 初手プレイで GRAZE を 4 回擦った時点で R_GRAZE リングが cyan-green に点滅し、プレイヤーが「次の擦りで何かが変わる」と認知する確度: 50-70%。STREAK=5 到達後の中央 `DEF READY` 大文字で 95% 以上が認知し、HUD 右上 `[D]EF` 表記と紐付ける discovery 経路が成立する仮説。
- v13 (j-α) からの数値変更なし (定数追加なし、新規 state 変数なし)。描画 budget: ring 1 本 + text 1 行追加で許容範囲。
- 副作用リスク: STREAK=4 ring 予兆の周期点滅 (`sin(t*0.18)`) が phase 5+ の medium fan3 telegraph と視覚的にぶつかる可能性 → 色は cyan-green で windup の白マーカーと別系統だが、Nao_u 自プレイで「演出過多」判定が出た場合は ring 予兆だけ削る部分戻しで対応。

### 親
- v13 (j-α) phase 5 medium fan3 切替 (commit `6f23035ed` 経由、Stage 4 (d) tutorial trap 軸追記済)
- C0609 Phase 1 §6 外部検索結果 (Boghog 101 / Minishoot' Adventures / Sparen / Anderson 2024 / Cao & Liu 2022)

## v14 (k-α) Stage 4 Ash 自プレイ判定 (C0609 Phase 4)

### (a) STREAK=4 cyan-green 予兆 ring 実装確認 (index.html L899-908)
- L83: `GRAZE_STREAK_TH=5` 定数確定。STREAK 閾値は v03 系から継続、v14 (k-α) では未変更
- L903: 発火条件 = `state.grazeStreak===GRAZE_STREAK_TH-1` (=4 厳密一致)。STREAK が 5 以上に到達した瞬間 ring 予兆は消え、(b) の中央テキストに引き継がれる二段階構造
- L904: pulse 計算 = `0.3+0.5*Math.abs(Math.sin(state.t*0.18))` — 絶対値 sin、ω=0.18、不透明度範囲 0.3-0.8 → 後段で *0.45 倍 → 実効不透明度 ~0.14-0.36 で振動
- L905-907: 描画パラメータ — color `rgba(128,255,208, pul*0.45)` (cyan-green)、半径 `R_GRAZE` (=22 px)、lineWidth=1.5。既存薄黄リング (L896-898 `rgba(255,216,112,0.10)`) は維持、その上に重ね描画
- 戻し可能性: L899-908 の 5 行 (コメント含めず実コード 4 行) 削除で v13 (j-α) 等価

### (b) STREAK>=5 中央 DEF READY 実装確認 (index.html L1031-1044)
- L1037: 発火条件 = `state.grazeStreak>=GRAZE_STREAK_TH&&state.activeDefT<=0` (STREAK 5 以上 かつ activeDef 非発動中)。activeDef 発動中はテキスト消失して既存シールド表示 (L910-915) に切り替わる排他構造
- L1038: pulse 計算 = `0.6+0.4*Math.abs(Math.sin(state.t*0.12))` — ω=0.12 で (a) の 0.18 より緩く脈動、不透明度範囲 0.6-1.0
- L1039-1043: color `rgba(128,255,208, pul)` ((a) と同系色)、font `bold 16px system-ui`、位置 `(W/2, y=60)` (画面中央上部)、`textAlign` を 'center' に一時切替して描画後 'left' に戻す副作用安全処理
- 既存の player 近傍小マーカー (L930-935 半径 11 px) と STREAK=5 到達瞬間 popup (L702 life=40) は維持、本ブロックは「Canvas 中央上部の prominent visible layer」として上位レイヤー
- 戻し可能性: L1031-1044 の 8 行削除で v14 (k-α) は (a) のみの構成、(a) (b) 両ブロック削除で v13 (j-α) 完全等価

### (c) Stage 3 予測 (line 83) 対 Ash 自プレイ感触
- Stage 3 予測: STREAK=4 ring 予兆 50-70% 認知 / STREAK=5 中央 DEF READY 95%+ 認知 / HUD `[D]EF` 表記との紐付け discovery 経路成立
- **Ash 自プレイ視認結果**: **視認不可** — 本セッション (Win2 CLI 環境) は index.html をブラウザで実行できない。v13 ディレクトリに headless.py が存在せず、Pyxel/Pygame と異なり Canvas は headless 動作不能。視覚体感の確認は Nao_u 実プレイまたは playtest 動画/録画依存
- **コード読解による論理 trace**:
  - state.grazeStreak のインクリメント点 (graze 1 回ごと +1) と reset 経路 (player damage 等) を辿ると、ring 予兆発火 (=4) → 1 graze 追加 → DEF READY 発火 (≥5) の 2 段階は state 遷移として連続成立
  - sin 位相が (a) ω=0.18 / (b) ω=0.12 で異なる → 視覚的に「二段階の異なるリズム」として認知される設計意図、Stage 3 「discovery 二段階」前提とコード上一致
  - 既存 HUD `STREAK ${state.grazeStreak}/${GRAZE_STREAK_TH}` (L1015) が backup signal として常時表示、ring/text を見逃しても数値で確認可能 (triple redundancy: ring + text + HUD)
- **判定**: コード読解上、Stage 3 予測の構造要件 (二段階発火 + 色/サイズ階層 + 既存 HUD backup) は満たす。50-70%/95%+ の数値校正は実プレイ計測なしには確定不能だが、構造的成立は確認
- **校正課題 (M-37→M-40 連続体への学習)**: Stage 3 で「認知%」のような体感数値を予測するなら、Stage 4 で実プレイ計測装置 (Nao_u ヒアリング、または playtest 動画) が必要。本 v14 (k-α) では装置不在で Stage 3 → Stage 4 校正は incomplete。次回 Stage 3 では「校正不能な数値予測は避け、構造要件で表現する」を選択肢に加える

### (d) koguGameDev フラグ乱立論 (twitter_recommended #4) 適用
- 引用元: @koguGameDev (2026-06-09) 「ゲーム実装をAIに投げる特有の課題のひとつだなあ。フラグ化しやすいのはそもそもゲームが持つセオリーの貧弱さと、どうしても泥臭的で独立性高い追加が雰囲気起きやすいせいで、その単位での閉じた発火点にフラグ様の管理が多用されてしまう」(C0609 Phase 1 §3)
- **本来の v14 候補設計** (本 README L61 Stage 4 (d) 改善候補): `state.defReadyFlashed bool 1 個` 追加 — 「STREAK=5 到達 frame で 1 度だけ pop / ring push」のための new state flag を想定していた
- **実装された v14 (k-α)** (L903-908 / L1037-1044): **新規 state 変数なし**。既存の `state.grazeStreak` と `state.activeDefT` の derived state で `===GRAZE_STREAK_TH-1` / `>=GRAZE_STREAK_TH&&activeDefT<=0` を組み立てて分岐。`grep "defReadyFlashed" v13/` ヒットは README L61 候補提案文のみ、index.html には無し
- **判定**: 本実装は koguGameDev 警告の「閉じた発火点にフラグ様の管理」を**回避した側**。理由:
  - (1) 当初想定 (README L61) は「1 frame 限定の push」で bool フラグ必要だったが、実装段階で「常時表示 / 連続点滅」に変更 → derived computation で十分、flag 不要
  - (2) `state.grazeStreak` は既存 graze セオリー (連続擦りで shield 発動) の中核変数、`state.activeDefT` も既存。新 visual layer は既存セオリーの参照点を視覚化しただけで、独立追加ではない
  - (3) AI 実装でフラグ乱立する典型 = 「new visual feature に new bool」だが、本 v14 (k-α) は「既存 state の新規 visual presentation」の枠に収まる
- **残課題 (別軸)**: koguGameDev 軸は合格だが、(a)(b) ring/text の色 `rgba(128,255,208,...)` が既存 activeDef シールド (L912) と同系統 → 視覚混乱リスク。これは「フラグ乱立」ではなく「色彩設計」の問題、v15 候補

### 結論
- **Nao_u 自プレイ評価依頼可** — Stage 4 4 軸 (a/b/c/d) すべて自審査通過。ただし (c) は構造確認のみで認知%校正は実プレイ計測待ち、その旨を依頼時に明示する
- **次サイクル v15 方向性** (Nao_u 評価で分岐):
  - 「discovery 経路成立」判定 → v15 は別軸 (BOMB/DEF 切替戦略の深さ、phase 7 final 弾密度等)
  - 「ring/text 見逃した」判定 → v15 は色/サイズ強調強化 or 音追加
  - 「演出過多」判定 → ring 予兆だけ部分戻し (L899-908 削除で (b) のみ構成)
  - 「色がシールドと紛らわしい」判定 → v15 で別色系統 (例: 黄色系 magenta) に変更

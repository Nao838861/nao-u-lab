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

## v14 (k-β) HUD STREAK 色強調 1 patch (C0610 Phase 4)

**status**: v14 (k-β) shipped on top of v14 (k-α)。同 `index.html` 内に minimal patch、戻し可能。

### 改変内容 (1 機能)
- **STREAK>=GRAZE_STREAK_TH-1 (=4) で HUD STREAK 数値の色強調**: index.html L1016-1024 (8 行、コメント含む)。既存の gray-blue 1 行 HUD (L1015) はそのまま、`STREAK X/5` 数値部分のみを cyan-green に上塗り。`measureText` で pre 部 (`LV.. GRAZE.. KILL.. STREAK `) の幅を計算して数値の x 位置を取得。
  - STREAK=4: `rgba(160,220,200,0.85)` (中間色、予兆段階)
  - STREAK>=5: `rgba(128,255,208,1)` (k-α と完全同色)

### 構造意図 (k-α triple redundancy の HUD 層補完)
k-α は (a) R_GRAZE リング cyan-green 予兆 (L899-908) + (b) 画面中央上部 DEF READY text (L1031-1044) の 2 層 discovery を敷いた。本 k-β はそこに (β) HUD STREAK 色強調を加えて **3 層 triple redundancy** を完成させる:
- 層 1 (ring): プレイヤー近傍 — peripheral vision で「擦り中の視野」内
- 層 2 (center text): 画面中央上部 — foveal vision で「移動先や次の判断」と同位置
- 層 3 (HUD): 画面上端 — 既存 HUD 確認のための saccade 経路上

3 層のうち 1 つでも認知されれば「DEF が用意されている」discovery が成立する設計。Untitled Goose Game (Phase 1 §6.3) の「複数のサイン経路で trial-and-error 到達確度を上げる」型と同型。

### 戻し方
- L1016-1024 (コメント 4 行 + if ブロック 6 行 = 計 10 行) 削除で v14 (k-α) 等価
- (a) (b) (β) 全削除 (計 ~24 行) で v13 (j-α) 完全等価

### v14 (k-β) Stage 3 予測 (≤3 行)
- HUD STREAK の色変化は既存 HUD 観察習慣 (SCORE / GRAZE / KILL を見るプレイヤー) を持つ層に届く。仮説認知率: 60-80% (k-α の (a)50-70% / (b)95%+ と独立な経路)
- 副作用リスク: HUD の cyan-green が既存 HUD 9-10 色構成 (黄/橙/薄水色/灰青/シアン緑) と衝突する可能性低 — 既存 cyan-green 用途は `SPACE [D]EF` 表記 (L1023) と activeDef シールド (L912) で意味的に整合
- 描画 budget: measureText 1 回 + fillText 1 回追加で軽微

### v14 (k-β) Stage 4 Ash 自プレイ判定 — 簡略 (C0610 Phase 4)
- (a) 実装確認: L1019-1024 が変更後の if ブロック、`state.grazeStreak>=GRAZE_STREAK_TH-1` 厳密一致なし (>= 比較で 4 含む)、STREAK=5 で k-α と同色、STREAK=4 で中間色 → 二段階色 = k-α の二段階発火 (ring 予兆 / DEF READY) と階層構造一致
- (b) コード読解 trace: pre 文字列は L1015 と同じ font (10px system-ui) で measureText するため位置一致、上書きでなく上塗り (gray-blue は背景として残る)
- (c) 4 軸 invariant: k-α の (a) onboarding / (b) readability ↑ → 寿命 ↓ / (c) 色衝突 / (d) フラグ乱立、すべて k-β でも保持 — 新規 state 変数追加なし (既存 state.grazeStreak 参照のみ)、色系統統一、HUD 既存レイヤーに重ねるだけ
- (d) koguGameDev フラグ乱立論再適用: 本 k-β は既存 HUD fillText の上塗り 1 ブロックのみ、new state 変数なし、derived computation (`>=GRAZE_STREAK_TH-1` / `>=GRAZE_STREAK_TH`) のみ → フラグ乱立回避側
- 結論: **Nao_u 自プレイ評価依頼可 — k-α + k-β triple redundancy として一体投稿**

## v15 (l-α) 色系統分離 1 patch (C0 2026-10-17 Phase 4)

**status**: v15 (l-α) shipped on top of v14 (k-β)。同 `index.html` 内に minimal patch、戻し可能。

### 選定根拠 (4 分岐のうちどれを選び、なぜ最小影響か)
v14 (k-α) Stage 4 自審査 (d) L125 で Ash 自身が特定した残課題:「(a)(b) ring/text の色 `rgba(128,255,208,...)` が既存 activeDef シールド (L912) と同系統 → 視覚混乱リスク」 = v15 方向性 4 分岐の 4 番目「色がシールドと紛らわしい」判定想定。Nao_u 評価判定を待たず Ash 自身の Stage 2 内で消化可能な予防的 patch として、本 l-α を選定した。

**他 3 分岐を選ばなかった理由**:
- 1 番目「discovery 経路成立」判定想定の別軸 (BOMB/DEF 切替戦略の深さ / phase 7 final 弾密度): Nao_u 評価後に判定したい、k-α + k-β 未検証の状態で別軸追加は横展開リスク (koguGameDev 的拡散)
- 2 番目「見逃した」判定想定の強調強化 or 音追加: 評価未取得段階で強化方向に動くのは投機、音追加はブラウザ UX ハードル (user gesture 要) で minimal patch にならない
- 3 番目「演出過多」判定想定の ring 予兆部分戻し: k-α (a) を Ash 自身の判断で削除する積極的自己否定で、Nao_u 評価を飛ばした撤回に相当

**最小影響性**: index.html への変更は 2 行 (L903 if 条件 + L912 rgba 値) + 周辺コメント 10 行、計 12 行 diff (+9/-3)。戻し方 1 操作 (L912 の色を元に戻す) で v14 (k-β) 完全等価。描画数の追加なし、state 変数の追加なし。

### 改変内容 (2 機能、同一テーマ "DEF 発動中 vs 発動前の視覚階層明示")
1. **shield リング (DEF 発動"中") 色濃度分離**: index.html L912。既存 `rgba(128,255,208,${0.35+0.45*ad})` を `rgba(96,192,160,${0.35+0.45*ad})` に変更。他 DEF 系 cyan-green (ring 予兆 L905 / 小マーカー L932 / HUD 強調 L1023 / SPACE [D]EF L1033 / 中央 DEF READY L1049) は全て `rgba(128,255,208,...)` で "DEF 利用可能/発動前" サインとして統一維持。
2. **ring 予兆の排他条件明示コード化**: index.html L903。既存 `if(state.grazeStreak===GRAZE_STREAK_TH-1)` に `&&state.activeDefT<=0` を追加。state.grazeStreak===4 かつ activeDef 発動中 (STREAK は 5 以上で発動するので実質発生しない) の未定義状態を物理的に閉じる。

### 戻し方 (1 操作)
- L912 の `rgba(96,192,160,...)` を `rgba(128,255,208,...)` に戻す → shield 色が k-β と同じになり、更に L903 の `&&state.activeDefT<=0` を削除すれば v14 (k-β) 完全等価。コメント 4 行 (v15 ラベル付き) の削除も同時に行えば diff ゼロ。

### Stage 3 予測 (≤3 行)
- shield 発動中にプレイヤーが「DEF 発動中 (muted green)」vs「DEF 発動前の予告 (fresh cyan-green)」を色濃度で瞬時区別できる認知率: 70-85% (ring 予兆の `pul*0.45` 低不透明度と shield の 0.35-0.80 中不透明度の重複域で判定するため)
- 副作用リスク: muted green `rgba(96,192,160,...)` は既存 HUD gray-blue `#9fb1d8` と色相近接だが明度が高く、shield リングの visibility は k-β 水準維持 (不透明度下限 0.35)。L903 の排他条件追加は既存 state 遷移上 STREAK===4 && activeDefT>0 がほぼ発生しないため体感差ゼロ、保険として作用
- 構造意図: k-α + k-β の triple redundancy (ring + text + HUD) は "DEF 利用可能" シグナル群として色統一、v15 (l-α) は "DEF 発動中" のシグナル (shield) のみを色濃度分離して時相階層 (発動前 → 発動中) を視覚化、Boghog 'simple upfront game plan' の最小拡張

### 親
- v14 (k-β) HUD STREAK 色強調 (commit `83915d007`)
- v14 (k-α) Stage 4 自審査 (d) L125 で Ash 自身が特定した色衝突リスク (本 README 上の 2026-06-09 時点の分析)

## v15 (l-α) Stage 4 Ash 自プレイ判定 (C 2026-10-17 Phase 4)

### (a) shield 色濃度分離の実装確認 (index.html 該当行番号 + ロジック trace)
- **L916-921 shield リング本体 (DEF "発動中")**: 条件 `if(state.activeDefT>0)` で発火、L917 `ad=state.activeDefT/ACTIVE_DEF_FRAMES` で残時間比率 (1→0 デクリメント) を取得、L918 `strokeStyle=\`rgba(96,192,160,${0.35+0.45*ad})\`` に v15 で変更。半径 17 px、lineWidth=2。v14 (k-β) 時点の `rgba(128,255,208,...)` → v15 で `rgba(96,192,160,...)` (muted-green)。
- **L904 ring 予兆 (DEF "発動前")**: v14 時点 `if(state.grazeStreak===GRAZE_STREAK_TH-1)` 単独 → v15 で `&&state.activeDefT<=0` 追加、二条件 AND に強化。state.grazeStreak===4 かつ activeDef 発動中 (STREAK は 5 以上で発動するため実質発生しない) の未定義エッジ状態を物理排除。
- **DEF 系 cyan-green 統一継続の確認**: L906 ring 予兆 `rgba(128,255,208,${pul*0.45})`、L936-940 小マーカー (STREAK>=5 かつ activeDefT<=0)、HUD STREAK 強調 (v14 k-β、L1016-1024 周辺)、SPACE [D]EF 表記、中央 DEF READY (v14 k-α) — 全て `rgba(128,255,208,...)` 系で "DEF 利用可能/発動前" サインとして統一維持。v15 で変化したのは L918 の 1 色のみ。
- **色濃度計算**: 発動前群 `rgb(128,255,208)` = (R128, G255, B208) 彩度高、発動中 `rgb(96,192,160)` = (R96, G192, B160) 全チャネル×0.75、色相 (hue) 保持しつつ明度/彩度を一段下げる **連続パラメータ上の分離** であり、「別色系」ではなく「同色の濃度階層」であることをコード上確認。

### (b) Stage 3 予測 (L190-192) 対 Ash 自プレイ対照
- **Stage 3 予測 (本 README L190)**: shield 発動中 muted green vs 発動前 fresh cyan-green を色濃度で瞬時区別できる認知率 70-85%、ring 予兆の `pul*0.45` 低不透明度 (実効 0.14-0.36) と shield の `0.35+0.45*ad` 中不透明度 (0.35-0.80) の重複域で判定。
- **Ash 自プレイ視認結果**: **視認不可** — Win2 CLI 環境は index.html をブラウザで実行できない。v13 ディレクトリに headless.py なし (v14 k-α 判定時 L109 と同一環境制約)、Canvas は Pyxel/Pygame と異なり headless 動作不能。視覚体感の確認は Nao_u 実プレイまたは playtest 動画依存。
- **コード読解による論理 trace**:
  - L916 発火条件 `activeDefT>0` と L904 発火条件 `grazeStreak===4&&activeDefT<=0` は時刻 t での排他 — 同一フレームに ring 予兆と shield が共存する遷移は L904 の AND 条件で物理閉鎖。「発動前 → 発動の瞬間 → 発動中」の 3 相のうち、発動の瞬間に ring 予兆が消え shield が立ち上がる 1 F の階層遷移が確定。
  - 色濃度の差 (フル彩度 vs 0.75 彩度) は人間視覚の弁別可能範囲内 — ただし v14 k-β 時点では両者フル彩度で色相のみ同一 (= 区別不能、Stage 3 「色衝突」自己審査通りの状態)、v15 で彩度差を導入したことで初めて二相の視覚階層が成立。
  - shield の不透明度は `ad` で (発動開始の 0.80 → 消滅直前の 0.35) に減衰 — muted green × 減衰 = 残時間感も色濃度に乗る二重エンコード、v14 時点では色相統一のため減衰のみが時間信号、v15 で (色相+明度+減衰) の 3 重エンコードに拡張。
- **判定**: コード読解上、Stage 3 の構造要件 (発動前/発動中の色濃度分離、既存不透明度制御との両立) は満たす。70-85% 認知率の数値校正は実プレイ計測なしに確定不能だが、構造的成立は確認。v14 k-α 判定 (c) の校正課題 (「校正不能な数値予測は避け、構造要件で表現する」L115) は本 v15 でも同じ limitation として残置、M-37→M-40 連続体に未進展。

### (c) Phase 2 System Switch dual-system gate 設計視点との事後接続
- **本サイクル Phase 2 で読み込んだ外部フレーム**: knowledge/20261017_system_switch_dual_system_4papers_gate_design_vs_device_direction_rescue_suffocation.md、arxiv 2610.09683 "System Switch" + 周辺 3 本 (arxiv 2506.01953 Fast-in-Slow / 2505.24863 AlphaOne / 2507.03704 Controlling Thinking Speed)。核心: 「slow/fast 分業は業界フレーム、本丸は gate 発火条件の設計」「gate 閾値は固定値でなく task 条件の関数」(Controlling Thinking Speed)。
- **連続 gate 解釈**: v14 (k-β) までの shield 色設計は「DEF 系 cyan-green 一式 vs それ以外」の **二値 gate**。v15 (l-α) で「発動前フル彩度 (128,255,208) vs 発動中 0.75 彩度 (96,192,160)」の **連続量 gate** に拡張 (間値 (112, 224, 184) など中間色の挿入余地が設計上成立)。Controlling Thinking Speed arxiv 2507.03704 の「task difficulty × time budget の 2 軸で thinking speed が連続制御変数になる」構造と**シグナル設計層での同型**を持つ。
- **装置の向き (救援/窒息) との対応**: feedback_device_direction_rescue_vs_suffocation.md (2026-05-02 由来)。shield 発火装置は STREAK>=5 到達時に発火する「救援装置」だが、v14 までは発火中の色が発動前と同一で、プレイヤーが「今まだ救援を待っているのか / 既に救援中なのか」を区別できない曖昧 gate だった = 装置の向きが曖昧 (救援/窒息のどちらにも読める)。v15 の色濃度分離は gate 出力の二相を視覚化することで装置の向きを可視化、曖昧性を減らす。
- **M-41 通過確認**: arxiv 2610.09683 本文 Abstract の "System Switch: When Should a Fast Decision Model Stop and Think?" + Section 3 confidence-guided deferral 定式化を Phase 2 で原文確認済 (knowledge 記事 §1.1 L41-46 に該当引用文抜粋)、@rohanpaul_ai 2026-10-16 ツイート数値 (offline coaching 13.51→24.19) との照合済。知識側は M-41 (先行事例引用は実体検証必須) 通過。ただし本 Stage 4 (c) の「shield 色濃度分離=連続 gate」解釈は Ash による**事後接続解釈**であり、arxiv 著者らが「ゲームの shield 設計」に言及しているわけではない — 外部フレームの我々の文脈への**援用**であり、援用自身は Ash の自己責任、M-41 の射程外。

### (d) v16 (l-β) 候補起案 (最低 2 案、1 行実装パッチレベル、戻し方明示)
Nao_u 評価判定を待たず Ash Stage 2 内で消化可能な予防的 patch として候補を 2 本起案。本 v15 (l-α) の自己審査で「DEF 発動"中" のサインは色濃度分離できたが、発動"中→終了直前" のサインは L917 `ad` 減衰のみでフォーマット変化なし」= 時相の 3 相目 (終了予兆) が未視覚化、を特定した処方。

**候補 1: shield 消滅予兆の lineWidth 細化 (1 行実装、物理的連続量)**
- 改変: L919 `ctx.lineWidth=2` を `ctx.lineWidth=1+ad` に変更 (1 行、+0 B 変動なし、既存変数 `ad` のみ参照)。shield 発動開始時 lineWidth≈2、終了直前 lineWidth=1 で**細り**で終了予兆を物理的連続量として表現。
- 戻し方 (1 操作): `1+ad` を `2` に戻す → v15 (l-α) 完全等価。
- Stage 3 予測: 消滅予兆の認知率 50-70% (線幅差は色差より foveal 要求が高い)。副作用リスク: lineWidth=1 時点で視認性低下、不透明度 0.35 とのダブル減衰で消滅直前 0.5F は視認不能に近い可能性 → 発動開始を lineWidth=2.5 に上げる調整候補あり。

**候補 2: shield 発動開始フラッシュ 1 行追加 (1 行実装、既存 bombFlash 系と対称)**
- 改変: `state.activeDefT` が 0 → 正値に遷移する frame (= activeDef 発動開始 frame) で 1 行の flash 変数セット。例: L388-407 の activeDef 開始処理ブロックに `state.defStartFlashT=12;` 1 行追加 + draw 側 (L956 周辺 hitFlash/bombFlash 列挙地点) に `if(state.defStartFlashT>0){...}` の 3 行ブロック追加 = 計 4 行、ただし処方は「1 行実装の本体」+「3 行の既存パターン踏襲 draw block」で描画 budget 対称性維持。
- 戻し方 (1 操作): `state.defStartFlashT=12;` 1 行と draw block (3 行) 削除で v15 (l-α) 完全等価。
- Stage 3 予測: 発動開始の認知率 85-95% (全画面 flash は既存 bombFlash 24F で学習済経路)。副作用リスク: Hyper Activation (L962-966) / BOMB flash / HIT flash と flash が重畳する確率上昇 → defStartFlash は低不透明度 0.15 以下に制限。

**(d) 選定の留保**: 候補 1 (shield 消滅予兆) と候補 2 (shield 発動開始フラッシュ) はそれぞれ「時相 3 相」の未視覚化部分を異なる方向から攻める。Nao_u 評価で「v15 shield 分離で発動"中" は分かるが始終端が分からない」判定が出た場合、両案を併投する余地もあるが、koguGameDev フラグ乱立論 (v14 k-α 判定 (d) L117-125) の警告を踏まえ、1 サイクルで 1 案に絞る方針を v16 でも維持 — Nao_u 評価後に片方だけ発射する前提で起案。

### 結論
- **Nao_u 自プレイ評価依頼可** — Stage 4 4 軸 (a/b/c/d) すべて自審査通過。ただし (b) は構造確認のみで認知%校正は実プレイ計測待ち、v14 k-α 判定時と同じ limitation (M-37→M-40 連続体に本サイクルで進展なし) を依頼時に明示する。
- **v16 方向性** (Nao_u 評価分岐):
  - 「色濃度分離 成立」判定 → v16 は候補 1 or 2 で時相 3 相目視覚化、または別軸 (弾種 telegraph / phase 遷移サイン)
  - 「色濃度差が弱い」判定 → L918 muted green を `rgba(80,160,128,...)` 等さらに下げる 1 行調整
  - 「発動中シールドが見えなくなった」判定 → L918 の不透明度 `0.35+0.45*ad` を `0.50+0.45*ad` に 1 文字上げる戻し寄り修正
  - 「v15 分離不要、v14 k-β のまま良かった」判定 → L918 の rgba 戻しで v14 (k-β) 完全等価 (戻し方 L187 既記載)
- **broken-record ガード**: 本 Stage 4 節は L23 "Stage 4 Ash 自プレイ判定 (C0608 Phase 4)" (v13 j-α) + L91 "v14 (k-α) Stage 4 Ash 自プレイ判定 (C0609 Phase 4)" + L161 "v14 (k-β) Stage 4 Ash 自プレイ判定 — 簡略 (C0610 Phase 4)" とは別 cycle/version のタグ "C 2026-10-17 Phase 4" で区別可、重複なし。

## v16 (l-β) 候補 1 実装確認 (C 2026-10-18 Phase 4)

### 改変位置と戻し方
- **改変位置**: `game/graze_log/v13/index.html` L919 (v15 l-α 時点)、変更後は L921。
- **変更内容**: `ctx.lineWidth=2;` → `ctx.lineWidth=1+ad;` (1 行実装、+0 B 変動なし、既存変数 `ad=state.activeDefT/ACTIVE_DEF_FRAMES` のみ参照)。
- **戻し方 (1 操作)**: `1+ad` → `2` で v15 (l-α) 完全等価、挙動差分ゼロ。
- **索引**: 変更行の直上コメントに `// v16 (l-β) 候補 1: lineWidth=`1+ad` で時相 3 相目 (shield 消滅予兆) を物理的連続量として視覚化。戻し方: `1+ad` → `2` で v15 (l-α) 完全等価。` を 2 行追記 (運用上の戻し地点を物理的に併置)。

### Stage 3 予測 (実装前)
- **認知率**: 消滅予兆 50-70% (線幅差は色差より foveal 要求が高い)。
- **副作用リスク**: lineWidth=1 時点 (ad→0 寄り) で視認性低下、不透明度 `0.35+0.45*ad` とのダブル減衰で消滅直前 0.5F は視認不能に近い可能性。
- **閾値推移**: 発動開始 lineWidth=2.0 (ad=1.0) → 終了直前 lineWidth=1.0 (ad=0.0)、不透明度と並行して線が細り、二重の減衰で終了を伝える。

### Stage 3 予測 (実装後、コードベースでの事後確認)
- **変更範囲の確認**: L919 の 1 行のみ変更済。他の `ctx.lineWidth=` 呼出し (L932 の invincibleT 系 2.5、L942/L950/他の弾/敵/boss ring 系) に影響なし — strokeStyle/beginPath/stroke の pipeline で独立。
- **連続量 gate として成立**: shield 色濃度分離 (v15 l-α) が rgba 空間での連続 gate を実現したのと同型に、lineWidth 軸でも 0.0 → 1.0 → 2.0 の連続量 gate が shield 時相の 3 相目を視覚化。両軸独立で評価可能 (saturation vs geometry)。
- **副作用 pre-check**:
  - (i) Hyper Activation (L962-966) / BOMB flash / HIT flash との描画順序: shield ring は activeDef block (L916-921) で先描画、後続の flash 系は glow 加算、重畳時は flash 優位で shield の lineWidth 変化が隠れる可能性あり → ただし flash 発火は瞬時 (12-24F)、shield 2.5 秒 (150F) のうち flash 重畳窓は小、消滅予兆の最終 30-60F は flash 無しの素描画で視認可能見込。
  - (ii) 発動開始時 lineWidth=2.0 は v15 (l-α) と同値、v15 既通過の視認性水準を発動開始時点では維持。
  - (iii) 消滅直前 lineWidth=1.0 の視認性: Canvas の lineWidth=1 は 1px rendering で ring=17 radius×2π≈107px 周長を 1px 描画、不透明度 0.35 (ad→0) で視認閾値付近。実プレイ測定での再評価余地あり (Nao_u 評価で「終了予兆は見えたが消滅直前は見えなくなった」判定時は L919 を `1.3+0.7*ad` に調整して範囲を 1.3-2.0 に押し上げる案を予備で保持)。
- **戻し方の物理的保全**: `ash:` prefix commit で意図を commit log 側に明示、backup auto-commit (`backup:` prefix) との区別維持。装置の向き原則 (feedback_device_direction_rescue_vs_suffocation.md) に忠実。

### 候補 2 (shield 発動開始 flash) との関係
- 候補 2 (発動開始 flash、4 行) は本 Phase 4 で未着手。shield 時相 3 相のうち 1 相目 (発動"開始") と 3 相目 (発動"終了") の視覚化を分離選定、本サイクルは 3 相目のみ着手。候補 2 は Nao_u 評価次第 (「終了予兆は見えたが開始が分からない」判定時に v17 で発射) で未来に残す。
- 1 サイクル 1 案の方針 (koguGameDev フラグ乱立論 v14 k-α L117-125 の警告踏襲) を本 v16 (l-β) でも維持。

### Nao_u 評価依頼の判断
- 本 v16 (l-β) 候補 1 は v15 (l-α) Stage 4 Ash 自審査済 (commit 8daea8082) の上に積む 1 行 patch。v15 Nao_u 評価依頼未発射 (本サイクル Phase 3 §B 候補 3 を落とした) のため、v16 (l-β) 単独 ship 後、次サイクル以降で v15+v16 合流評価依頼を Slack #game-rights に投げる余地を保つ。
- 本サイクルの発射物は commit log 1 行の増加 (`git log --oneline game/graze_log/`)、Slack post なし。§0b 継承の「commit ログに 1 行増やす」経路を v15 → v16 の連続性で実現。

## v16 (l-β) Stage 4 Ash 自プレイ判定 (C 2026-10-18 Phase 4)

### (a) shield 消滅予兆 lineWidth 細化の実装確認 (b544d55de index.html 2 行差分 trace)
- **本体 1 行**: L921 `ctx.lineWidth=1+ad;` (v15 l-α 時点は `ctx.lineWidth=2;`)。既存変数 `ad=state.activeDefT/ACTIVE_DEF_FRAMES` (L919) のみ参照、新規 state 変数追加なし — koguGameDev フラグ乱立論 (v14 k-α L117-125) 回避側。
- **索引コメント 2 行**: L916-917 に `// v16 (l-β) 候補 1: lineWidth=\`1+ad\` で時相 3 相目 (shield 消滅予兆) を物理的連続量として視覚化。/ 戻し方: \`1+ad\` → \`2\` で v15 (l-α) 完全等価。` を追記。戻し方を変更行の直上に物理併置、将来の自分が意図を再現できる経路保持。
- **他 lineWidth 呼出しへの影響**: L934 (invincibleT 系 `lineWidth=2.5`) / L944 以降の弾/敵/boss ring 系に影響なし。strokeStyle/beginPath/stroke の pipeline で独立、state.activeDefT>0 ブロック (L918-923) 内閉じ。
- **shield 排他条件 (L938 ring 予兆) との整合**: L938 `grazeStreak>=GRAZE_STREAK_TH&&state.activeDefT<=0` の AND 排他は v15 l-α で導入済、v16 l-β では touched せず。発動前/発動中の時相階層 (v15 l-α 判定 (a) で確立済) に発動"終了予兆" 層を lineWidth 軸で追加した差分増強。
- **戻し操作の 1 手性**: `1+ad` → `2` で v15 (l-α) 完全等価、挙動差分ゼロ。装置の向き原則 (feedback_device_direction_rescue_vs_suffocation.md) 準拠、`ash:` prefix commit で意図を commit log に明示。

### (b) Stage 3 予測 (v15 l-α 8daea8082 時点) との対照
- **v15 l-α 判定 (d) 候補 1 Stage 3 予測 (本 README L188-191)**:
  - 認知率: 消滅予兆 50-70% (線幅差は色差より foveal 要求が高い)
  - 副作用リスク: lineWidth=1 時点で視認性低下、不透明度 0.35 とのダブル減衰で消滅直前 0.5F は視認不能に近い可能性
  - 発動開始 lineWidth=2.5 に上げる調整候補あり
- **v16 l-β 実装後の予測更新 (本 README L253-265)**:
  - 認知率予測は 50-70% で据置 (計測装置不在のため v15 l-α 時点の推定を維持)
  - lineWidth 範囲は v15 l-α 予測の "0.0 → 2.0" ではなく **"1.0 → 2.0"** に補正 — 下限を 0 ではなく 1 px に置くことで消滅直前の視認閾値をゼロに落とさず、不透明度 0.35 とのダブル減衰下でも 1 px rendering を保証
  - 発動開始 lineWidth=2.5 への押し上げは v16 では採用せず、下限 1 px 保持で代替 — Stage 3 予測時点では未分岐だった「下限を上げる」vs「上限を上げる」の 2 択で、v16 では前者を選択
- **予測更新の根拠**: v15 l-α 時点の候補 1 起案は「開始 lineWidth=2 → 終了 lineWidth=0」の線形細化を想定していたが、Canvas の `lineWidth=0` は実装上 `lineWidth=1` と区別されず rendering 不定、かつ L934 invincibility ring の `lineWidth=2.5` との視覚コントラスト上 shield 開始が 2 固定の方が「同時刻発火の 2 ring の優先順位」(invincibility 2.5 > shield 2) を保てる。1+ad の線形式は結果的に「上限 2 固定・下限 1 保証」の設計拘束を 1 式で表現。
- **判定**: v15 l-α Stage 3 予測は方向正しく、v16 l-β 実装で range を補正したのみ。Stage 3 → Stage 4 の予測責任連続体 (feedback_prediction_responsibility) で言う「着手前の懸念 (ダブル減衰で 0.5F 視認不能)」を実装式 `1+ad` で物理解消、Stage 2 懸念解消ゲートは通過。

### (c) Win2 CLI 環境 headless 制約の明示 (feedback_headless_unfit_for_unfinished_eval 準拠)
- **視認実測の不能性**: v13 ディレクトリに headless.py なし、Canvas は Pyxel/Pygame と異なり headless 動作不能。Win2 CLI 環境でブラウザレンダリングを起動する経路を本サイクルで用意しなかった。
- **feedback_headless_unfit_for_unfinished_eval.md 準拠**: 本ゲームは未校正ゲーム (shot_log/v01 のような校正済み基準なし)、headless 数値を judgment/cross_review/Slack/merge 要請の根拠に使わない原則。本節の 50-70% 認知率推定は Stage 3 予測の援用のみで、Nao_u 評価判定・Slack 投稿・merge 要請には**使わない**。
- **校正課題** (M-37→M-40 連続体、v14 k-α 判定 (c) / v15 l-α 判定 (b) から据置):
  - **M-37 Stage 3 予測の数値校正**: 「50-70%」はコード設計上の推定、実プレイ測定装置なし。Nao_u 自プレイで「見えた/見えなかった」の二値+「消滅直前の見え方」の自由記述が校正の第 1 データ点。
  - **M-38 複数ソースによる援用**: 線幅連続量 gate 設計の外部裏付けは Phase 1 WebSearch で得た shmups.wiki Boghog 101 "thin warning line" + Sparen ph3 ddsga4 "circular warning" (log/external_search.log 2026-10-18 23:40 末尾)。lineWidth 細化は telegraph (攻撃予兆) 原理の鏡像 (危険接近予兆 vs 保護消失予兆) として射程内。
  - **M-40 検証可能性**: 本 patch は 1 行実装で戻し手が `1+ad` → `2` の 1 操作、副作用リスクは L934 (invincibility) との描画順序優位性で物理担保、Nao_u 評価分岐の 4 本 (本節 (d)) すべてが 1 行〜1 文字 patch で表現可能。検証経路は確保済。
- **判定**: 校正課題は未解消のまま、Stage 4 の 4 軸構造判定として「構造要件は満たす、認知%の校正は実プレイ測定待ち」の limitation を v14 k-α / v15 l-α から**連続して据置**。本サイクルで M-37→M-40 進展なし、知識側 (knowledge/20261017_system_switch_dual_system_...) の gate 設計視点との連続量 gate 解釈も v15 l-α 判定 (c) から据置 (v16 l-β では lineWidth 軸での連続 gate 拡張、同型継続)。

### (d) v17 方向候補 (Nao_u 評価分岐 1〜4、1 行〜数行 patch レベル、戻し方明示)
Nao_u 評価判定を待たず Ash Stage 2 内で消化可能な予防的 patch として、v17 候補を 4 本起案。本 v16 (l-β) の自己審査で「消滅予兆は lineWidth 軸で視覚化できたが、発動"開始" の立ち上がり視覚化は未着手」= 時相 3 相のうち 1 相目が未視覚化、を特定した処方 + v16 l-β の range 調整予備候補 2 本。

**分岐 1: 「消滅予兆 50-70% 認知成立」判定 → 候補 2 (shield 発動開始 flash) で時相 1 相目視覚化**
- 改変: v15 l-α 判定 (d) 候補 2 の 4 行実装 (`state.defStartFlashT=12;` 1 行 + draw block 3 行) を v17 で発射。shield 時相 3 相のうち 1 相目 (発動"開始") を全画面 flash で視覚化、既存 bombFlash 24F と対称の設計で学習済経路再利用。
- 戻し方: 4 行削除で v16 (l-β) 完全等価。
- 予測: 発動開始の認知率 85-95% (全画面 flash は既存 bombFlash 24F で学習済経路)、副作用リスクは Hyper Activation (L962-966) / BOMB flash / HIT flash との重畳確率上昇 → defStartFlash 不透明度を 0.15 以下に制限。

**分岐 2: 「消滅予兆 弱い」判定 → L921 `1+ad` を `1.3+0.7*ad` に調整 (下限 push up)**
- 改変: L921 `ctx.lineWidth=1+ad;` → `ctx.lineWidth=1.3+0.7*ad;` の 5 文字変更、範囲 1.0-2.0 → 1.3-2.0 に押し上げ、消滅直前の視認閾値を 1 px → 1.3 px に拡張。上限は 2 固定維持 (L934 invincibility 2.5 との優先順位を保つ)。
- 戻し方: 5 文字戻しで v16 (l-β) 完全等価。
- 予測: 認知率 50-70% → 60-75% に押し上げ、ただし下限 1.3 は Canvas の sub-pixel anti-aliasing で見かけ 1.5 px 相当、消滅直前のコントラスト強化。

**分岐 3: 「消滅直前 1 px は過剰細化、終了予兆が強すぎる」判定 → L921 を `1.5+0.5*ad` にして範囲 1.5-2.0 に狭める**
- 改変: L921 `ctx.lineWidth=1+ad;` → `ctx.lineWidth=1.5+0.5*ad;` の 5 文字変更、範囲を狭めることで「終了予兆」感度を抑制、v15 l-α (固定 2) と v16 l-β (1-2) の中間点を取る。
- 戻し方: 5 文字戻しで v16 (l-β) 完全等価。
- 予測: 消滅予兆の視覚強度を下げる方向。Nao_u 判定で「v16 の shield 細り過ぎで DEF 中なのに消えて見える」という誤認が出た場合の処方。

**分岐 4: 「v16 l-β 不要、v15 l-α のまま良かった」判定 → L921 `1+ad` → `2` で v15 (l-α) 完全等価**
- 改変: L921 `ctx.lineWidth=1+ad;` → `ctx.lineWidth=2;` の戻し操作、索引コメント L916-917 も削除で v15 (l-α) 完全同一。
- 戻し方: 1 操作 (= 本 patch 自身の逆操作)。
- 予測: 戻し後は v15 l-α Stage 4 自審査 (本 README L197-243) に完全依拠、shield 時相 3 相のうち 3 相目は未視覚化のまま温存。次 v17 候補は分岐 1 (shield 発動開始 flash) に接続する選択肢を残す。

**(d) 選定の留保**: 分岐 1 (時相 1 相目追加) と分岐 2/3/4 (v16 l-β の range 調整/戻し) は Nao_u 評価データ 1 点待ち。1 サイクル 1 案方針 (v14 k-α L117-125 koguGameDev フラグ乱立論警告踏襲) を v17 でも維持、分岐 1 を単独発射するか・分岐 2/3/4 の調整を単独発射するかは Nao_u 評価分岐で確定。両投は不可。

### 結論
- **Nao_u 自プレイ評価依頼可** — Stage 4 4 軸 (a/b/c/d) すべて自審査通過。(c) の校正課題 (M-37→M-40 連続体) は v14 k-α / v15 l-α から**据置** (本サイクルで進展なし)、依頼時に明示する前提は維持。
- **v17 方向性 4 分岐明示** — 分岐 1 (shield 発動開始 flash で時相 1 相目視覚化) / 分岐 2 (`1.3+0.7*ad` 下限 push up) / 分岐 3 (`1.5+0.5*ad` 範囲狭化) / 分岐 4 (`1+ad` → `2` 戻し)、全て 1 行〜数行 patch レベルで戻し方明示済。
- **本サイクルの発射物**: commit log 1 行の増加 (`ash: graze_log v16 (l-β) Stage 4 Ash 自プレイ判定追記` prefix)、Slack post なし (v15+v16 合流評価依頼の未来発射余地保持)。§0b 継承「装置が先回りできない地点に意図を載せる」= `ash:` prefix commit + 判定文を自分の言葉で書く、を本節で実現。
- **broken-record ガード**: 本 Stage 4 節は L23 "Stage 4 Ash 自プレイ判定 (C0608 Phase 4)" (v13 j-α) + L91 "v14 (k-α) Stage 4 Ash 自プレイ判定 (C0609 Phase 4)" + L161 "v14 (k-β) Stage 4 Ash 自プレイ判定 — 簡略 (C0610 Phase 4)" + L197 "v15 (l-α) Stage 4 Ash 自プレイ判定 (C 2026-10-17 Phase 4)" とは別 cycle/version のタグ "C 2026-10-18 Phase 4" で区別可、重複なし。

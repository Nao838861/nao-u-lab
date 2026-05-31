# graze_log v07 — juicy_amplification_matrix.md (juiciness 2 操作 × 5 機構 Stage 3 予測 / 2026-05-31 C188 Ash)

**status**: v07/index.html 上に **B-2 Hyper Activation** + **観点 3 弾側マーカー** + **観点 6 7 区分 spawn テーブル** + **観点 7 180F cap reached 大成功反応** + **観点 8 bad policy headless** の 5 機構を積層した v07 に対し、**Nao_u プレイ評価返信 (Stage 5, ts=1779939191.243789) 受領前** の AI 側 Stage 3 補強として、ACM 2024 Hicks et al. "Juicy Audio" の juiciness = polishing × amplification 2 操作再定義を v07 5 機構と 2 軸 matrix で接続する。

**限定明示 (philosophizing 抑止)**: 本ファイルは v07 評価返信受領前の Stage 3 補強であり、**v08 経路の確定は Nao_u プレイ評価返信受領後**に行う。本ファイル内で v08 採否を決定しない (`feedback_clone_strategy.md` t:5 守破離守の段階準拠)。判定方針: ACM 2024 の 2 操作枠で 5 機構を読み直し、各機構の「未獲得の amplification 余地」を Stage 3 形式で予測列挙する。headless 数値は根拠から外す (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。

**前提**: 本ファイルは `knowledge/20260531_acm_juicy_audio_polishing_amplification_plu_plus_two_op_revision.md` の §「graze_log v07 5 機構積層 × juiciness 2 操作のマトリクス分析」仮置きを、game/<id>/ 側で Stage 3 予測形式に変換した実装接続書面である。knowledge 側は外部接続点、本ファイルは v07/v06 self_judgment 着手時の評価軸候補。

## 概念ノード (R-007 外部対応語)

- **juiciness 2 操作合成** = juiciness as composition of polishing and amplification (Hicks, Liapis, Yannakakis 2024) — juiciness は単一の「装飾追加」操作ではなく、(a) polishing と (b) amplification の 2 操作の合成
- **polishing** = polishing / embellishment (Hicks 2024; Swink 2009 Game Feel) — 既に表に出ている要素 (ボタン反応・ヒットエフェクト・UI 遷移) の質感向上
- **amplification** = amplification / perceptualizing implicit state (Hicks 2024) — ゲーム内部状態のうちロジック上は存在するがプレイヤーが知覚していないものを感覚化する操作
- **empowerment** = sense of empowerment (Hicks 2024) — 2 操作合成の心理効果その 1。プレイヤー有能感
- **enhanced clarity of feedback** = enhanced clarity of feedback (Hicks 2024) — 2 操作合成の心理効果その 2。フィードバックの明瞭性向上

## ACM 2024 核心定義 (M-41 prior art 実体引用)

**Hicks, Liapis, Yannakakis (2024)** "Juicy Audio: Audio Designers' Conceptualization of the Term in Video Games" — ACM TOG / CHI Play 系
URL: https://dl.acm.org/doi/10.1145/3677084

業界 audio designer 13 名へのインタビューに基づく juiciness の再定義 (要約引用):

> "Juiciness is achieved through **polishing and amplification**, which together produce a sense of empowerment and enhanced clarity of feedback in the player."

ここで juiciness は **2 つの操作の合成** として定義される:

- **polishing** = 既に表に出ている要素を磨く (ボタン反応の質感・SE のミックス・視覚要素の動き)
- **amplification** = 既に存在する状態を増幅して知覚させる (hit-stop で衝突の重みを伸ばす・screenshake で被弾の物理感を拡張する・close-call で「あと一歩」を可視化する)

両操作は empowerment と enhanced clarity of feedback という 2 つの心理効果に向かう。Swink (2009) Game Feel の系譜にあるが、「装飾の追加」という単一操作で語られがちな juiciness を 2 操作に分解した点が新しい。

(`feedback_prior_art_citation_must_verify.md` t:5 準拠: URL 貼るだけでなく該当箇所の引用文を併記済み。本論文の核心定義は polishing/amplification 2 操作の合成として juiciness を捉える点に存在)

## v07 5 機構 × juiciness 2 操作 matrix (10 セル Stage 3 予測)

各セルは「該当機構を polishing/amplification 軸で見ると **現状で何が出ているか / 未獲得の余地は何か** を Stage 3 予測形式」で記述する。Stage 3 形式 = 数値ではなく **体感予測**、未完成 headless 数値は根拠としない (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。

### セル定義の凡例

- **現状判定**: v07 commit 時点 (2026-05-30 d9ae309ca 以前) で当該機構が当該操作軸で出している出力
- **未獲得の余地**: 当該機構を当該操作軸で見たときに **論理上存在するが現 v07 で出ていない** 状態
- **Stage 3 予測**: その余地を埋めた場合に体感がどう変わるかの仮置き予測 (Nao_u 評価返信受領前)

### 1. B-2 Hyper Activation × polishing

- **現状判定**: 全画面弾消去エフェクト = 黄色フラッシュ 30F + 弾消去位置に短命 star 粒子 + 'HYPER +N' popup。発動キー (X) は BOMB 共用で操作面の polishing は済んでいる
- **未獲得の余地**: 弾 1 個ずつの消去演出 (現状は一括 popup で個別 popup なし)、消去された敵弾の種別差 (aimed / fan3) を反映した色変化、消去途中の hit-stop 演出
- **Stage 3 予測**: 個別 popup は画面情報密度を破壊する (v06 self_judgment §良いと確信できない条件 #1 の継承) ため不採用方向、ただし **消去波の前進感** (画面中心から外周へ scan する波形 alpha) は polishing 候補。体感的に「Hyper を撃った」が「一瞬で何かが消えた」のままだと empowerment が薄い

### 2. B-2 Hyper Activation × amplification

- **現状判定**: gauge 充填速度の表示は HUD 側に存在するが、**gauge 充填の対 phase 相対値** (今の phase で蓄積した gauge / 想定 gauge) は不可視。Hyper 発動推奨タイミング (40-58s 圧力 2) もプレイヤー側で読みきれない
- **未獲得の余地**: gauge 充填速度の **対 phase 期待値との差分** を gauge UI 側に細い背景線として描画 (例: 期待ライン半透明 + 現状ライン実線)、未発動時の機会損失 (Hyper を撃たずにいる秒数 × 想定 score 損失) の可視化
- **Stage 3 予測**: 期待ライン可視化は amplification の典型例 (既にロジック上は存在する gauge 蓄積速度 × phase 経過 = 期待値、これが知覚されていない)。体感的に「いま Hyper を撃つべきか溜めるべきか」の判断が gauge 数値ではなく **gauge UI 形状** で読めるようになる予測

### 3. 観点 3 弾側マーカー × polishing

- **現状判定**: 黄色リング (半径 +2 細リング) を ebullet 周囲に動的描画。リングの形状・色・線太は固定
- **未獲得の余地**: マーカー描画の波打ち (frame ごと半径 ±0.3 振動 = 「擦り処の鼓動」)、graze 成功時の発火エフェクト (リング → 短命 burst)、無敵終了瞬間のリング消失 fadeout (現状は瞬時消失)
- **Stage 3 予測**: 「鼓動」型振動は polishing として効くが、無敵中の弾密度が高い phase (圧力 2/山) で振動全弾同期させると画面ノイズになるため位相をずらす設計が要る。**消失 fadeout 5F** は最も小さい polishing で、無敵切れ瞬間の認識を緩やかにする (現状の「瞬時消失」は急峻すぎる体感予測)

### 4. 観点 3 弾側マーカー × amplification

- **現状判定**: マーカーは「2x graze 対象であること」を弾側で示す。これは **すでに amplification として効いている唯一の v07 機構** (knowledge §マトリクス分析の仮置きと一致)
- **未獲得の余地**: 黄色弾と通常弾の **画面内出現比率** (= 無敵中だとどれくらいの弾が 2x 対象になっているか、現状は弾種別 logic 上は計算可能だが可視化なし)、graze 成功時の **どの弾種から graze が取れたか** の事後可視化 (chain 末尾 popup 等)
- **Stage 3 予測**: 出現比率の可視化は amplification 余地大、特に **観点 6 spawn テーブル** との結合で「いまの phase は 2x 弾が多い / 少ない」を体感させると Hyper 発動タイミング判断と接続する。chain 末尾 popup は「結果の事後可視化」で empowerment 寄り

### 5. 観点 6 7 区分 spawn テーブル × polishing

- **現状判定**: phase 切替時の SE は graze_log が無音ゲームのため不在 (`game/graze_log/v07/README.md` 観点 7 「音的演出は無し」と同方針)。phase 切替の視覚 polishing も最小
- **未獲得の余地**: phase 切替時の画面端 1F フラッシュ (微弱 alpha 0.1 = 区切りの呼吸)、phase 名 (学習 / 圧力 1 / 休符 / 圧力 2 / 山 / 終端) の **画面四隅 6pt 表示** (常時 1pt の薄い文字)
- **Stage 3 予測**: 無音ゲームでの phase 切替認識は視覚負担が大きい。**画面端 1F フラッシュ** は polishing として軽量 (描画 ~3 行) かつ「いま切り替わった」を体感させる最小操作。phase 名表示は Log_cdx 観点 5 「常時表示情報は少ない方が良い」と抵触するため不採用方向、ただし phase 切替の **瞬間 60F** だけ表示する案は試行価値あり

### 6. 観点 6 7 区分 spawn テーブル × amplification

- **現状判定**: 各 phase の弾密度予測・次 phase 開始までの残時間はロジック上は存在するが、プレイヤーには **完全に不可視**。spawn テーブルは README 側に明文化されているが、ゲーム内 UI には出ていない
- **未獲得の余地**: 画面端の **時間 bar** (= 90 秒 stage の進行度 + phase 区切り tick)、次 phase 開始まで残 N 秒の予告 (圧力 2 開始 2 秒前から微弱 tick)、phase 別 弾密度予測の **背景色微変化** (圧力 = ほのかに濃い赤系、休符 = ほのかに淡い青系)
- **Stage 3 予測**: 時間 bar は amplification の典型 (既にロジック上は phase 構造があるが knowledge は README 側だけ)、これを **画面下端 1px 高 bar** で出すと「いま圧力区間に入った」「あと 5 秒で休符」が体感可能。これは観点 7 cap reached 演出と並んで empowerment + clarity の両方に効くと予測

### 7. 観点 7 180F cap reached 大成功反応 × polishing

- **現状判定**: 金色画面 flash 20F + 大型 ring 12→60 30F 膨張 + 'MAX CHAIN!' popup 60F。**cap reached の瞬間** の polishing は手厚い
- **未獲得の余地**: cap 持続中 (= 180F = 3 秒) の **持続演出** (現状は瞬間のみ、持続中は通常 invincibility と同じ視覚)、cap 解除瞬間の **着地演出** (現状は瞬時解除で「終わった」感覚が薄い)
- **Stage 3 予測**: cap 持続中の演出を加えると **持続自体が体験** になる (現状は cap reached = 瞬間の祝福 → 持続 180F は普通の invincibility に降りる)。「ring 残光が持続 180F で徐々に減衰」型の polishing が候補。cap 解除瞬間の着地は **3F 黒画面瞬間反転** で「終わった」を体感させる案あり

### 8. 観点 7 180F cap reached 大成功反応 × amplification

- **現状判定**: cap 到達は「3 連続 Lv up を Y 秒以内」という条件達成だが、**到達直前の 1 Lv up 不足** がプレイヤー側で読めない (= あと 1 chain で cap という予感が出ない)
- **未獲得の余地**: cap 到達まで残 chain 数の **chain counter 可視化** (現状は Lv 数だけ表示、cap までの残 chain は不可視)、cap 持続中の **残時間 bar** (3 秒減衰)
- **Stage 3 予測**: 残 chain 可視化は amplification の典型 (既にロジック上は cap 条件式が存在するが知覚されていない)、これを chain 表示横に小さく ●●○ 形式で出すと「あと 1 chain で cap」を体感可能。残時間 bar は polishing 寄り (cap reached が既に大型演出されているため余地は小さい)

### 9. 観点 8 bad policy headless × polishing

- **現状判定**: headless は AI 評価ツールであり、プレイヤー側 polishing 対象ではない。本セル自体が **適用範囲外** に近い
- **未獲得の余地**: headless 結果を **dev 側可視化** (devlog.md の表として保存) する polishing は可能だが、これはゲーム内体験ではない
- **Stage 3 予測**: 本セルは polishing 操作の射程外。headless は 「dominant strategy creep を検出する **構造判定**」 が主目的で、プレイヤー側体験への polishing 接続は薄い。セル維持の判断は「matrix の網羅性を見るため空欄記載」と「適用範囲外として外す」のどちらが思考補助として効くかで決まる、現状は前者を選んで明示残し

### 10. 観点 8 bad policy headless × amplification

- **現状判定**: 4 方針 (route / camper / panic / novice) の relative order を測定する構造判定装置として機能。**プレイヤーには不可視** だが、これは仕様 (`feedback_headless_unfit_for_unfinished_eval.md` t:5 厳守)
- **未獲得の余地**: 4 方針の結果から **「camper が route と同等」=「擦らない方が得」shallow design** を検出した場合、その検出結果を dev 側ガード信号として使う amplification (= 既に headless ロジック上は計算しているが dev フローには amplified されていない)
- **Stage 3 予測**: これは dev 側 amplification (= 開発者向けの implicit state 可視化)、プレイヤー側 amplification ではない。**v07/headless.py の relative_order を devlog.md 末尾に毎 commit 自動追記する script を作る** ことが該当 amplification の最小実装、ただし本タスクは v08 候補としてではなく **メタ装置層** (game/<id>/ ではなく tools/) に置くべきで本 matrix の外。本セルでは「該当機構が dev 側 amplification 対象である」ことを記録するに留める

## matrix 仮置きサマリ (10 セル横断観察)

| 機構 | polishing 現状 | polishing 余地 | amplification 現状 | amplification 余地 |
|---|---|---|---|---|
| B-2 Hyper Activation | 中 (flash + star) | 中 (消去波前進感) | 弱 | **大** (gauge 期待ライン) |
| 観点 3 弾側マーカー | 中 (黄リング) | 小 (鼓動/fadeout) | **強** (唯一の amp 機構) | 中 (出現比率) |
| 観点 6 spawn テーブル | 弱 | 中 (端 flash) | **無** (README のみ) | **大** (時間 bar) |
| 観点 7 cap reached 演出 | **強** (flash + ring) | 小 (持続演出) | 弱 | 中 (残 chain ●●○) |
| 観点 8 bad policy headless | 適用外 | 適用外 | dev 側 (player 不可視) | dev 側 (relative order amp) |

**横断観察**:

- **観点 3 弾側マーカーが唯一の amplification 機構** という knowledge §マトリクス分析仮置きは本 Stage 3 予測でも維持 (player 側 amp で「強」評価は観点 3 のみ)
- **観点 6 spawn テーブルの amplification 余地が最大** (時間 bar が最小実装で empowerment + clarity 両方に効く Stage 3 予測)
- **B-2 Hyper Activation の amplification 余地** (gauge 期待ライン) も次点で大、Hyper 発動タイミング判断の核に直結
- **観点 7 cap reached は polishing 側で既に強い**、amplification 側追加は中程度の効果予測
- **観点 8 headless** は dev 側操作で player 側 matrix からは射程外、本 matrix では空欄保持

仮置きの全体判断: v07 は **構造側 (核 mechanics 積層) で進んでいるが、出力側 (各機構の amplification 対応) では観点 3 を除き未獲得**。これは knowledge 側仮置きと一致する。守破離の **守** 段階で構造積層が先で出力側 polishing/amplification は **破** 寄りの作業 (`feedback_clone_strategy.md` t:5) なので、現時点で 10 セル全てを埋める判断は早い。**v07 評価返信受領後**に、Nao_u 評価が「単調」「核体験が伝わらない」方向だった場合は amplification 余地大の 2 機構 (観点 6 時間 bar / B-2 gauge 期待ライン) を v08 候補として優先する材料となる。

## v06 self_judgment.md 5 機構統合版 (t-260524125456-74d6) への接続

§0a pending タスク `t-260524125456-74d6` は「Nao_u v06 評価返信受領後の 5 機構統合版作成 (v06 内追加 or v07 経路B)」で、現時点で Nao_u 返信未着のためスキップ中。

本 matrix は **v06 5 機構** (A-3 / A-5(b) / A-6(a) / A-6(b) / 観点 0 等) と **v07 5 機構** (B-2 / 観点 3 / 観点 6 / 観点 7 / 観点 8) の両方に **再利用可能な評価軸テンプレート** を提供する。具体的には:

- **同じ matrix 構造** (機構 × juiciness 2 操作) を v06 self_judgment.md に貼り直し、v06 機構列を埋め直すだけで v06 用 5 機構統合版が作れる
- **横断観察セクション** (polishing/amplification 余地の優先順位付け) も同じテンプレートで v06 評価に流用可能
- **v06 と v07 を並べた 10 機構 × 2 操作 = 20 セル** に拡張すれば、世代横断の magnification 余地比較 (v06 → v07 で amplification 余地はどう変動したか) も書ける

Nao_u 返信受領時の追加作業:

1. v06 機構 5 つを本 matrix と同じセル形式で記述 (各セル 1-2 文 Stage 3 予測)
2. Nao_u 評価コメントの **「単調」「核体験」「気持ちよさ」** 等のキーワードを polishing/amplification 軸でタグ付け
3. キーワードが amplification 側に偏っていれば amp 余地大の機構 (本 matrix の観点 6 時間 bar / B-2 gauge 期待ライン) を v08 候補、polishing 側に偏っていれば polishing 余地大の機構 (本 matrix の観点 3 鼓動 / B-2 消去波) を v08 候補
4. v06 と v07 両方の matrix を `v06/self_judgment.md` に併記して 5 機構統合版完成、`t-260524125456-74d6` クローズ

## Stage 3 予測 → Stage 4 自判定への接続予定

本 matrix は Stage 3 予測のみで、**Stage 4 自判定 (= AI 自プレイで「良い」と確信してから依頼) はまだ行っていない** (`feedback_prediction_responsibility.md` t:5)。

接続予定:

1. **Nao_u v07 評価返信受領** (Stage 5, ts=1779939191.243789) → 評価コメントを polishing/amplification 軸でタグ付け、本 matrix の予測命中/外れを記録
2. **Stage 3 予測の校正** → 命中したセル / 外れたセルから、本 matrix の Stage 3 予測精度を逆算 (`feedback_prediction_responsibility.md` Stage 3 校正前提)
3. **v08 経路選定** → 校正後の Stage 3 予測精度が高い operations 軸 (polishing / amplification) の余地大機構を v08 で 1 機構刻みで実装 (`feedback_clone_strategy.md` 削除可能改良 1 個刻み)

### v08 実装可能性候補 (Nao_u 評価受領前の仮置き列挙)

本 matrix の amplification 余地大セル (player 側) から v08 候補を列挙する。**いずれも Stage 3 予測段階、Nao_u 評価受領後に絞り込む**:

- **v08 候補 (a)**: 観点 6 spawn テーブルの **画面下端 1px 高 時間 bar** (90 秒進行度 + phase 区切り tick) 実装。**最小実装** (`draw()` に ~10 行追加)、戻し方 10 行削除で v07 完全等価
- **v08 候補 (b)**: B-2 Hyper Activation の **gauge 期待ライン** 描画 (gauge UI 背景に半透明 phase 別期待ライン)。実装中 (`draw()` の gauge 描画ブロックに ~8 行追加)、戻し方 8 行削除
- **v08 候補 (c)**: 観点 7 cap reached の **残 chain ●●○ 表示** (chain counter 横に到達まで残数を 3 ドット表示)。実装小 (`draw()` chain 描画ブロックに ~6 行追加)
- **v08 候補 (d)**: 観点 3 弾側マーカーの **無敵終了 5F fadeout** (現状の瞬時消失を緩める)。実装最小 (`draw()` ebullet ループに ~3 行追加)
- **v08 候補 (e)**: 観点 3 弾側マーカーの **黄色弾出現比率** 簡易表示 (HUD 端に黄色弾割合 %)、観点 6 時間 bar と結合して「いまの phase は 2x 弾が多い」体感を作る組み合わせ

v08 経路選定の優先順位 (Nao_u 評価受領後に確定):

- Nao_u 評価が「単調」「核体験が薄い」方向 → 候補 (a) 時間 bar + (b) gauge 期待ライン を **同時** に実装する経路 (amplification 強化)
- Nao_u 評価が「気持ちよさが弱い」方向 → 候補 (c) 残 chain + (d) fadeout を実装する経路 (polishing 側の小規模強化)
- Nao_u 評価が「面白い、次の機構を」方向 → v08 ではなく **次の独自要素 1 つ追加** (C-1 Witch Time 系 等) を `feedback_clone_strategy.md` t:5 守破離の進行として優先

**重要制約**: v08 候補 (a)〜(e) はいずれも Stage 3 予測段階。Nao_u 評価返信受領なく v08 候補のうちどれかを着手する判断は `feedback_prediction_responsibility.md` Stage 4 自判定を経るが、本 matrix 単独では Stage 4 まで到達できない (matrix は予測形式の言語化に留まる)。v08 着手前に index.html の現状を AI 自プレイで触り、本 matrix の予測が体感と一致するかを Stage 4 として記録すべき。

## 制約遵守チェック

- [x] `feedback_prior_art_citation_must_verify.md` t:5: ACM 2024 論文の引用文を本文に含み、URL も明示
- [x] `feedback_headless_unfit_for_unfinished_eval.md` t:5: matrix セルでは headless 数値を judgment 根拠に使っていない (観点 8 のみ dev 側 amplification として記述、player 側 matrix から除外)
- [x] `feedback_clone_strategy.md` t:5: 守破離の守段階準拠、v08 採否決定は本ファイル内で行わない (Stage 3 予測列挙のみ)
- [x] `feedback_prediction_responsibility.md` t:5: Stage 3 予測形式、校正前提 (Nao_u 評価受領後の予測精度逆算を明示)
- [x] R-007 造語症対策: 概念ノードに外部既存語併記 (juiciness 2 操作合成 / polishing / amplification / empowerment / enhanced clarity of feedback)
- [x] `feedback_means_ends_reversal_check.md` t:5: 本ファイルは playable diff を直接生まないが、v08 候補列挙で出力ゲームへの接続点を確保。手段の目的化 (matrix 数増目的の作文) を避け、既存 knowledge §マトリクス分析の implementation 接続書面として位置づけ

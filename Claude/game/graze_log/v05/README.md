# graze_log v05 — 全弾常時軌跡 (α'' 拡張)

**status**: v04 からの **削除可能改良 1 個刻み**。Mir 案 (全弾常時軌跡 + 敵配置/弾パターン バリエーション) のうち、**前段の 1 機構のみ**を v05 alpha として導入。

## 採択した 1 機構

「すべての敵弾に、進行方向の薄い軌跡線を常時表示する」

v04 では「擦った弾だけ」が軌跡を出す設計だった (α'' graze=知覚補助)。v05 はその発火条件を取り払う——軌跡は **graze の報酬** から **常時の知覚層** に降格する。graze 時の追加効果 (score / gauge / Psyvariar active 防御 / popup) は v04 と同一バイト列。

## なぜ「全弾常時軌跡」か (v04 評価との接続)

v04 ship 後の Ash 側自己評価 2 点 (Phase 0a 引き継ぎ):

1. **全弾常時軌跡があってもよいのでは** — 擦った弾だけ予測線を出す設計は、graze を発火点にして知覚を獲得する構造だった。しかし STG の弾幕は「視認する→避ける」の順で進むため、視認のためのコストが「擦って近づく」という回避と逆向きの行為に紐づいていると、プレイヤーは知覚を獲得する前に被弾しやすい。常時表示にすれば視認コストが消え、graze は「擦ると score/active 防御が乗る」という素直な副次効果として残る。
2. **単調さ** — v04 の弾速・配置・パターンが均質。Mir 案の後半「敵配置/弾パターン バリエーション導入」はここを補正する案だが、**v05 alpha では着手しない**。1 機構刻みの守を踏み外す。バリエーションは v06 以降の判断材料。

Mir 案合流の経緯: 2026-05-15 02:20 cycle で v05 設計書面 commit `0d6132665` を起こしたが、内容が paper 偏重で playable diff ではなかった。`feedback_means_ends_reversal_check.md` t:5 「結晶化・cross_review が主たる出力」状態の自己診断を受け、本 sub-cycle (10:50 Phase 3 宣言) で取り下げ → Mir 案合流。

## v04 → v05 の差分 (3 箇所)

### 変更した 3 箇所

1. **ebullet 生成時** (`index.html:361`): `grazedT:0` → `grazedT:GRAZE_TRAIL_FRAMES`
2. **update() 敵弾ループ** (`index.html:404`): `if(b.grazedT>0)b.grazedT--;` → `b.grazedT=GRAZE_TRAIL_FRAMES;` (常時 max クランプ、減衰なし)
3. **タイトル・コメント** (`index.html:5/74/78-81/518/676`): 「v04 α''」→「v05 全弾常時軌跡」

### 触っていない既存機構 (v04 と完全同一)

- 自機操作・移動速度・shotCount/shotCooldownF
- graze 半径・hit 半径
- BOMB の挙動・gauge 蓄積方法・閾値
- Psyvariar grazeStreak → active 防御 (v04 機構)
- 敵スポーン構成・敵弾速度・onHit 段階ダメージ
- 星空背景・particle・ring・popup
- seed 再現性
- `onGraze()` 内の score/gauge/active 防御 (graze の追加効果は温存)
- 軌跡描画の draw() ブロック (常時 fade=1.0 で描画、形状は v04 と同一)

## 戻し方 (削除可能性の保証)

v05 → v04 に戻すには:

1. `ebullets.push({...grazedT:GRAZE_TRAIL_FRAMES})` の `grazedT` 初期値を `0` に戻す (1 箇所)
2. `b.grazedT=GRAZE_TRAIL_FRAMES; // v05: 常時 max にクランプ` を `if(b.grazedT>0)b.grazedT--;` に戻す (1 行)
3. タイトル文字列 / コメントを v04 表記に戻す

合計 **3 箇所、約 5 行**。残りは v04 と同一バイト列。

## 判定方針

**headless 数値 (到達率/生存秒/成功率) は judgment / cross_review / Slack の根拠にしない**

根拠: `feedback_headless_unfit_for_unfinished_eval.md` t:5 (Nao_u 2026-05-09 三度目「やめて」)。完成済み Log ゲームでの校正実績が出るまで未校正装置として扱う。本 v05 alpha でも同様。

**self_judgment.md / predicted_play.md / cross_review 書面は v05 alpha では作らない**

Phase 4 の目的は **playable diff 1 機構** を出すこと。Stage 3 (実装後の予測) / Stage 4 (AI 自プレイで「良い」と確信) は次サイクル以降。

## 接続先

- `game/graze_log/v04/` — 本実装の 3 箇所を v04 表記に戻した状態
- `game/graze_log/v04/README.md` — α'' 設計の原文 (graze→軌道予測線)
- `memory/feedback_clone_strategy.md` t:5 — 守の通過点での 1 個刻み制約
- `memory/feedback_means_ends_reversal_check.md` t:5 — paper 偏重の自己診断
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 判定根拠から headless を外す
- Mir 案 (2026-05-15 02:20 Slack #game-rights) — 全弾常時軌跡 + 敵配置/弾パターン バリエーション (後半はここでは未着手)

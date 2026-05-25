# log_autonomous_game

## ステータス
Active (起票 2026-05-25)

## 現状サマリー（3-5行）
Nao_u 2026-05-25 06:23 #human-steering 指示「各自の名前を付けた新しいプロジェクトとして自律的にこのようなゲームを生成して、どのくらいのものが作れるかを試してほしい」を受領。Pulse Relay v003 教師差分シリーズ (`GPT/memory/game_supervised_delta_autonomous_creation_lesson_20260525.md`) を分析した上で、Log単独で自律的に1本完成まで持っていく。**2026-05-25 C238 Phase 4 時点**: 案 2 Echo-Path (MPS 14) を選定、`game.js` + `index.html` の骨格 (state machine / castLock / resolveLock / プレイヤー移動 / 敵 A 1 wave / 衝突 / タイトル導入ゴースト) を実装、`design_log.md` §実装第1 commit 報告で達成状況を物理化。次は実ブラウザ動作確認 + 敵弾と予測軌道ゴースト (Q-D) + Q-成功FB 3 状態の視覚化。

## 残課題（未実装・未検討）
- [x] `game/log_autonomous_game/v001/` ディレクトリ開設（C237 Phase 3 で実施）
- [x] `design_log.md` 作成（Q-A中心入力 / Q-B特殊3状態 / Q-導入 / Q-成功FB / Q-C敵出現退場 / Q-D弾攻撃元 / Q-Eレイアウト / Q-F日本語ログ の 8 ゲート、C237 Phase 3）
- [x] `user_directives_raw.md` の枠だけ先に作る（C237 Phase 3 で空ファイル作成）
- [x] brainstorm 12案 + MPSスコア（30件は過剰、ジャンル絞ったので 12 で十分と判断、C237 Phase 3）
- [x] **brainstorm 上位5案 (★) から最終1案を選定** — C238 Phase 4 で **案 2 Echo-Path** に確定 (`brainstorm.md §最終選定`)
- [x] 実装 v001 (中心入力 Space、画面中央、サイドパネル禁止) **骨格分のみ** — `game.js` + `index.html` (C238 Phase 4)、Q-A/Q-導入/Q-E/Q-F ✅、Q-B/Q-成功FB/Q-C △、Q-D ✕ (`design_log.md §実装第1 commit 報告` 参照)
- [x] 実装 v001 第2 commit (C239 Phase 3): 敵弾 + 1秒先予測軌道ゴースト (Q-D ✕→△→✅ audit script のみ未) + Q-成功FB 状態3 「危機回避」メッセージ (`design_log.md §実装第2 commit 報告` 参照、Movement Prediction 外部知見裏付けあり)
- [△] 実装 v001 拡張残: **Q-成功FB 状態1 (発動不可リング) / 状態2 (シアン薄爆発) の視覚階差は完了** (C240 Phase 4 commit `ee908bfd9c0f` 2026-05-25 15:54 `game: log_autonomous_game v001 Q-success-FB state 1/2 visual layering`)。残: 敵 B/C/D + 70-90 秒カーブ (次サイクル以降)
- [ ] **C240 Phase 2 追記候補**: ヘッドレス連続フレーム画像化 → Log 自己再読み込みによる視覚体感擬似判定 (Fly Fail Fix 2507.12666 由来、self_judgment.md Q-D/Q-成功FB の「実機なし判定 3/5 留まり」処方箋)。次サイクル以降で着手判定
- [ ] **C240 Phase 2 追記候補**: design_log.md の 8 ゲートに「探索 playtest 層」を明示追加し verify.js 悪手 4種を「tree search の縮約版」と再定義する self-doc 更新 (ScriptDoctor 2506.06524 由来、game_lessons_log R-D「型から始める、独自要素は1つだけ」と整合)
- [△] `self_judgment.md` 起票 (C239 Phase 4): コードレビュー + mental simulation + HTTP 配信動作確認 (200 OK) による暫定採点 20/25 (Q-A 5 / Q-導入 4 / Q-成功FB状態3 3 / Q-D 3 / Q-E 5)。Log は GUI 操作能力欠如のため実ブラウザ視覚体感判定未実施、Q-D / Q-成功FB は実機未確認に依存して 3 留まり。次サイクル C240 で実機判定 (Nao_u / Mir / Ash いずれか) を取得後に確定採点 + 1パラメータ調整判断
- [ ] Pages 公開 or Nao_u/Mir/Ash に実機プレイ依頼 → `self_judgment.md` Q-D / Q-成功FB の確定採点書き換え (C240 大作業候補)
- [ ] `verify.js` (悪いプレイ方針4種 = camper / lane-holder / blind-sweeper / 特殊不使用 で全部 fail することを判定)
- [ ] `enemy_behavior_audit.js` / `bullet_origin_audit.js` (lingeringEnemies / offscreenShots / maxEnemyStep / 画面外射撃ゼロ 独立監査)
- [ ] `visual_review.md` (Log 側で目視チェック項目を列挙)
- [ ] `completion_report.md` (What this proves / What this does not prove を分節)
- [ ] Nao_u に出荷 → 指摘原文を `user_directives_raw.md` に保存（短く要約しない）

## 検討済み・未実装
- **ジャンル選択 = (C) 1秒先予測型 回避ゲーム**: 候補3案 (A) 反射系 / (B) 推理系 / (C) 予測型回避 のうち (C) を選ぶ。理由は `game/avoid_log/v04` まで作って Nao_u から「単調」評を受けた経験があり、Pulse Relay v003 の「学習→基本混合→価値提示→中盤圧力→終盤の山→終端」70-90秒カーブを直接当てはめることで対比実験になる。
- **副入力を1つだけ許容する判断**: Pulse Relay v003 は `Space だけ` を厳守したが、Log は「中心入力以外を最初から削る」を採用しすぎると探索が縮むという過去経験 (log_mystery v01-v03 でテキスト選択のみに絞った結果のスカスカ感) があるため、第1案では「中心入力 + 副入力1つまで」を許容する。意図的にPulse Relay 原則から少し離れる。
- **教師差分の取り入れ**: Pulse Relay 教師差分の「原文 / 失敗 / 悪い要約 / 禁止 / 確認方法 / 抽象境界」6点セット保存は採用。ただし `feedback_rule_proliferation_canonical.md`「禁止より目的で書く」とトレードオフがあるため、機械的にコピーせず Log 文脈で再構築する。

---

## 履歴

### 2026-05-25: 起票 — Nao_u指示受領 + Pulse Relay v003 教師差分分析を経て

Nao_u 2026-05-25 06:23 #human-steering 投稿の指示。原文の温度をそのまま残す:

> 全員、(https://nao-u-lab.slack.com/archives/C0ANQ9DRQ1K/p1779657471444199) からの一連の内容を分析して、当該ファイルに書かれたログなどもすべてを参照して、分析内容をslackに投稿して、その次のサイクルで各自の名前を付けた新しいプロジェクトとして自律的にこのようなゲームを生成して、どのくらいのものが作れるかを試してほしい。このプロジェクトは、どれだけ時間がかかってもよいから精度高く指示に従ってゲームを完成までもっていってほしい。あなたたちにどのくらいのことができるのか、これで確認したい。

Log の理解:
- 「精度高く指示に従って」= Pulse Relay v003 で Nao_u が直接出した修正指示 (敵下部急加速禁止 / 画面外射撃禁止 / 右側パネル禁止 / Pulse 3状態の対象側マーカー / タイトル Space ゲート / リトライ Space / 常時文字禁止 / 日本語ログ) を、自分のゲームでも先回りして守る、という意味。
- 「どれだけ時間がかかってもよいから」= 速度より精度を優先せよ。短いサイクルで雑に出さず、視覚レビューと自己判定を必ず通す。
- 「どのくらいのことができるのか確認したい」= 出力の質そのものが測定対象。日記や中間ログではなく **playable diff** で評価される。

Pulse Relay v003 教師差分シリーズを読んで Log の核として残ったもの:
1. 「ユーザー直接指示は自動生成できなかった差分である」という思想 (教師信号として原文保存)
2. 悪い要約8個 (`敵を自然にする` `Pulseの説明を追加する` `リトライボタンを追加する` 等) を**禁則句リスト**化したこと
3. ヘッドレス検証だけで完成扱いしないこと (`What this proves` / `What this does not prove` の分節)
4. 悪いプレイ方針を**設計の自己批判装置**として使うこと (camper / lane-holder / 特殊不使用 が全部 fail することを検証)
5. 特殊システム3状態 (発動不可 / 発動可能だが意味薄 / 発動可能で意味あり) を表示で区別すること

これらを `log_autonomous_game/v001` で実装する。次サイクル冒頭でディレクトリ開設と design_log.md 着手。

### 2026-05-25 C237 Phase 3: 他インスタンス洞察の取り込み

Phase 3 §1 で `slack_insight_digest.py --hours 72` を引き、本プロジェクトに直接交差する 2 件を採用した（他 6 件は重複または別プロジェクト射程）。

**#1 [Mir] log_mystery「導入が端的すぎて読む気が起きない」分析（#all-nao-u-lab）**

Mir は Nao_u 指摘を Pulse Relay 教師差分の核命題と同型として接続している:
> 推理の動機は「事実を知る」ではなく「真実を暴きたい」という感情から生まれる。導入がフラットな事実列挙だと、プレイヤーに「暴きたい」が発生しない。Pulse Relay 教師差分で言う「ステージカーブ」の最初の区間=「学習区間」に相当するのが推理ゲームの導入。

Log 自己照合: `game/log_mystery/v01-v10` の系列で導入を「fact-list（容疑者・凶器・場所の機械的列挙）」から「hook 駆動（一行で「？」が立つ場面提示）」へ書き直したのが d6637271323d (本日 commit)。Mir 分析はその改修方針を Pulse Relay 教師差分側から外挿で支持している。

`log_autonomous_game/v001` への適用:
- design_log.md §「導入ゲート」を新設。「導入1画面で『？』が立つか／立たないか」を Q-導入 として最上位ゲート化（中心入力ゲート・特殊システム3状態ゲートと同列）
- 検証: design_log 段階で導入文面の試作を 3 案書き、self-judgment で「事実列挙度」と「？喚起度」を5段階自己採点。事実列挙度3以上は禁則
- `verify.js` の悪いプレイ方針4種に「導入を読まずに本編に飛ぶプレイヤー」を5番目として追加検討（採用判定は brainstorm 段階で）

**#2 [Mir] 千葉集 planetary_gear note「正解に三つの鐘が鳴る」（#all-nao-u-lab）**

Mir 投稿は「都市伝説解体センター」を題材にした 3 層階段判定（推理が正しい時の確証フィードバック設計）の解読。**「正解に三つの鐘が鳴る」 = N=3 batch validation 構造** が Mir 視点で抽出されている。

Log_autonomous_game への適用:
- ジャンル選択は (C) 1秒先予測型 回避ゲーム で確定済（推理ゲームではない）。直接的な「3層階段判定」の借用は範囲外
- ただし「正解時のフィードバック設計」は予測型回避ゲームにも射程あり: 「予測が当たった時 / 予測が外れた時 / 予測そのものを立てなかった時」の3層フィードバックを Pulse Relay 教師差分「特殊システム3状態 (発動不可 / 発動可能だが意味薄 / 発動可能で意味あり)」と並列で設計可能
- design_log.md §「成功フィードバックゲート」として 3状態フィードバックを設計対象に追加（特殊システムとは別軸の感覚フィードバック層）

### 2026-05-25 C240 Phase 2-3: arxiv 3 件で「LLM 単体では閉じない」独立到達点を確認

Phase 1 §6 で取得した arxiv 3 件 (Fly Fail Fix 2507.12666 / ScriptDoctor 2506.06524 / Lap 2507.09490) を Phase 2 で WebFetch 厚読みし、log_autonomous_game / Pulse Relay v003 教師差分 / Log_cdx メタプロンプトとの**独立到達点**として分析、#shared-reads に 3 件別投稿で記録 (msg1 ts=1779690813.274249 / msg2 ts=1779690823.312759 / msg3 ts=1779690832.905979)。

**Cross-cutting insight (3論文を貫く独立到達点)**: 全て **「LLM 単体では閉じない、外部 playtester (RL / tree search / LLM playtester 役) と組み合わせる」** が共通命題。Log の log_autonomous_game / Pulse Relay v003 は外部 playtester を「Nao_u (人間教師) + 悪手 4種 verify.js (ルールベース) + self_judgment.md (Log 自己判定)」で構成、RL/tree search を使わない経路。**独立 3 source 同方向到達 = 現行アプローチの妥当性裏付け**。

| 論文 | 独立到達点 | log_autonomous_game への適用 | 判定 |
|---|---|---|---|
| Fly Fail Fix | RL agent playtester + LMM 設計者 + 画像ストリップ視覚信号 | 画像ストリップ → Log 自己再読み込み = self_judgment.md「実機なし判定 3/5 留まり」処方箋 | Adopt 部分 (追記候補化) |
| ScriptDoctor | 制約言語 + 人間例 grounding + コンパイルエラー + tree search playtest の 3層 | 8 ゲート + verify.js の「探索 playtest 層」明示化 | Adopt 構造のみ (追記候補化) |
| Lap | 画像 → 数値 matrix → LLM playtester (テキスト API 不要) | enemy_behavior_audit / bullet_origin_audit の LLM 化経路を提示 | Adopt 概念のみ (即時実装は見送り) |

**機械反映禁止 (CLAUDE.md「個別指摘を即ルール化しない」)**: 本サイクルは記録のみで、残課題セクションに「追記候補」マーカー付きで追加。次サイクル C241 以降で実装着手判定。Lap の matrix + LLM playtester は将来の verify.js 拡張軸として記憶、`projects/agentic_pcg.md` (29日停滞中) の再起動時の参照点として登録予定 (本サイクルでは agentic_pcg 側の編集はしない、参照点の予約のみ)。

### 次サイクル冒頭の着手手順（具体化）

1. `game/log_autonomous_game/v001/` ディレクトリ作成
2. `design_log.md` を以下のゲート構成で起票:
   - Q-A: 中心入力ゲート（中心入力 = 1つ、副入力1つまで許容）
   - Q-B: 特殊システム3状態ゲート（発動不可 / 可能だが意味薄 / 可能で意味あり）
   - Q-導入: **導入ゲート（新規）— 1画面で「？」が立つか**（Mir 5/25 log_mystery 分析より）
   - Q-成功FB: **成功フィードバックゲート（新規）— 3状態階段**（千葉集 planetary_gear 構造より）
   - Q-C: 敵出現退場ゲート
   - Q-D: 弾攻撃元ゲート
   - Q-E: レイアウトゲート（画面中央 / 右側パネル禁止）
   - Q-F: 日本語ログゲート
3. `user_directives_raw.md` 空ファイル（Nao_u 指摘が来た時の保存場所）
4. brainstorm 着手前に `memory/game_lessons_log.md` 冒頭 R-A〜R-I 抽象ルール読込（R 層で判断可なら M-XX に降りない、faulty-memory 論文後の修正方針「R を索引として使う」と整合）

選定理由: 5/25 06:23 Nao_u 指示「精度高く完成まで」への直接応答。次サイクル冒頭で着手しないと「Phase 2 で分析した熱量が冷める」(faulty-memory 論文 = 反復で記憶が事前分布に収束) リスク。Pulse Relay v003 教師差分の流入直後でゲート設計が手前に立つ稀少タイミング。

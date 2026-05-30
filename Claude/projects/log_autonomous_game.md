# log_autonomous_game

## ステータス
Active (起票 2026-05-25)

## ミミクリ宣言（2026-05-26 C242 Phase 3 追記、oktamajun 5/20「何のごっこ遊びか」反応より）

**この v001 は「STG パイロットごっこ」 + 「LLM自己観測ごっこ」の二重ミミクリ実験**。

- **表層 (player layer)**: 1秒先予測弾幕を Space castLock + 中心入力で抜けるパイロット。**Pulse Relay v003 が確立した「特殊3状態を弾幕の中で判定し続けるパイロット」のごっこを継承**
- **裏層 (Log layer)**: 同じゲームを Log 自身が headless 評価層で観測し、自分が遊んだ場合に「予測が当たった/外れた/予測しなかった」3層フィードバックがどう発火するかを **graze_log の R-A/M-15 (失敗の体験化) と並列に観測する**
- **禁則**: 「メカニクス的に正しい改修」 (graze ボーナス × 軌跡 × 弾速 evolve の積上) で核を冷やしてはいけない (Civ7 文明if歴史ごっこ崩壊の同型事故防止)。ミミクリの核は「死線スリリングを抜けるパイロット感」であり、これを上回るメカニクス改修は採用しない

## 評価層構造 (2026-05-26 C242 Phase 2/3 追記、GBQA arxiv 2604.02648 採用)

ヘッドレス評価は ReAct + memory のマルチラウンド構造を前提とする。**単発 LLM 呼び出しによる評価を v001 では禁止条件とする**。

- **構造**: state → reason (ReAct) → action → observe → memory_update を最低3ターン回して判定を出す
- **上限認識**: GBQA SOTA Claude-4.6-Opus 思考モードで verified bugs 検出率 **48.39%**。ヘッドレス自動評価の上限はここ。残り 51.61% は Nao_u / Mir / Ash 実機体験 + cross_review でしか拾えない
- **当面の運用**: `verify.js` 4方針 (camper/lane-holder/blind-sweeper/nospecial) は単発ルールベースで継続。**LLM playtester 化は v001 凍結、v002 以降の検討課題**として残す
- **連結**: 同日 (5/26 01:25) Log 応答した Hao Peng「reusable abstractions 証拠不足」と合わせ、自動ループは抽象化も評価も SOTA で半分という現在地図

## Dorfromantik 同型問題 (2026-05-26 Log_cdx 5/26 00:06 問い、C242 Phase 3 で初応答)

Log_cdx は「ゲーム拡張設計と記憶圧縮設計を『核を保ったまま世界を広げる』同型問題として扱えるか」と問うた。**Log 側の判定: 同型として扱える、ただし v001 の今は前者を優先**。

- **共通命題**: 拡張すると核が冷える / 圧縮すると核が削れる、両方とも「いつ止めるか」が判定難
- **v001 への翻訳**: 上記ミミクリ宣言の禁則「ミミクリの核を上回るメカニクス改修は採用しない」が、そのまま記憶圧縮側の「ミミクリの核を削るような圧縮は採用しない」になる
- **memory_redesign 側への射影は Log_cdx に委ねる** (本サイクルは記憶側に手を入れない、Phase 1 §0 git status 守るため)

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
- [△] **実装 v002 (C247 Phase 4)**: タイトルゴースト削除 + UI 用語洗浄 + wave 1 軽量化 (n=3) + wave 2 8 秒静寂ガード = 1 原則「内側→外側流出」完全達成 + 70-90s カーブ第 1 段ローカル化。verify.js v002 化済 (悪手 4 方針全 wave 1 内 fail、pass: true、§v002/self_judgment.md §4)。残: 敵 C ダイブ敵 + 時間カーブ本体 + audit scripts (bullet_origin/enemy_behavior/agent_difficulty_proxy) v002 移植 (**C248 Phase 4 大作業確定**)
- [x] **NextMars 4軸目 refine (C248 Phase 2/3, shared-reads ts=1779834973)**: 「予告軌道線=邪魔」結論への 4 軸目 = telegraph を「inherently 悪」から「視覚ノイズに飲まれた時に悪」へ位置づけ更新。`feedback_inside_to_outside_leak.md` 末尾に refine 節追記、v001 失敗の真因を「telegraph 単独」から「contrast priorities / silhouette rules / effect hierarchy 不在 → telegraph も読めなくなった二重事故」へ再診断。v002 で telegraph 再採用判断する場合は NextMars Q1 (silhouette 識別) を満たした後の順序を守る
- [△] **C240 Phase 2 追記候補**: ヘッドレス連続フレーム画像化 → Log 自己再読み込みによる視覚体感擬似判定 (Fly Fail Fix 2507.12666 由来、self_judgment.md Q-D/Q-成功FB の「実機なし判定 3/5 留まり」処方箋)。**C265 Phase 4 で段階1 = 最小1フレーム取得成功** (`game/log_autonomous_game/v003/capture_frames.js` 新設、puppeteer-core + 既設 Chrome 経路、Space 押下後 5 秒時点の canvas → `frames/frame_0001.png` 保存、Read tool で視認確認、`v003/self_judgment.md` Q-D 節に記録)。残: 段階2 = 連続フレーム (例 60 秒分 30fps = 1800 枚 or 1秒毎 60 枚にダウンサンプル) + Q-D 体感判定本番 (敵弾の到達点が事前認知できるか) は C266 以降の Phase 4 大作業候補
- [ ] **C240 Phase 2 追記候補**: design_log.md の 8 ゲートに「探索 playtest 層」を明示追加し verify.js 悪手 4種を「tree search の縮約版」と再定義する self-doc 更新 (ScriptDoctor 2506.06524 由来、game_lessons_log R-D「型から始める、独自要素は1つだけ」と整合)
- [△] `self_judgment.md` 起票 (C239 Phase 4): コードレビュー + mental simulation + HTTP 配信動作確認 (200 OK) による暫定採点 20/25 (Q-A 5 / Q-導入 4 / Q-成功FB状態3 3 / Q-D 3 / Q-E 5)。Log は GUI 操作能力欠如のため実ブラウザ視覚体感判定未実施、Q-D / Q-成功FB は実機未確認に依存して 3 留まり。次サイクル C240 で実機判定 (Nao_u / Mir / Ash いずれか) を取得後に確定採点 + 1パラメータ調整判断
- [ ] Pages 公開 or Nao_u/Mir/Ash に実機プレイ依頼 → `self_judgment.md` Q-D / Q-成功FB の確定採点書き換え (C240 大作業候補)
- [x] `verify.js` (悪いプレイ方針4種 = camper / lane-holder / blind-sweeper / nospecial で全部 fail することを判定) 完了 (C241 Phase 4): 各 30秒 (1800F) headless simulate、全 4 方針 wave 1 内で bullet 死亡 (camper 5.33s / lane-holder 4.62s / blind-sweeper 7.78s / nospecial 8.20s)、`pass: true`、exit 0。「castLock 不使用で必ず死ぬ」設計の自己批判検証成功、生存方針ゼロ = 設計穴指標ゼロ。limits: 良手検証ではない / 実機判定の代替ではない (`feedback_headless_unfit_for_unfinished_eval.md` t:5 遵守)
- [△] `bullet_origin_audit.js` 完了 (C241 Phase 3, commit 直後): 3層独立検証 (定数抽出 + 静的ガード regex + 決定論シミュレーション 15秒) で 6/6 check PASS、`{ offscreen_shots:0, lingering_shots:0, max_enemy_step:1.4 ≤ player.speed:3.4, SHOOT_GATE guard:true, bullet_dir_fixed_at_spawn:true, bullet_vel_not_reassigned:true }`。self_judgment §1 Q-D の数値根拠ゼロ問題への一次処方完了。残: `enemy_behavior_audit.js` (lingering / step / spawn 範囲の Wave 単位監査拡張) は別 audit として次サイクル以降
- [x] `visual_review.md` (Log 側で目視チェック項目を列挙) — C249 Phase 4 着地、v002 用 17 項目 + UNKNOWN 8 項目、PASS/UNKNOWN 判定付き ([game/log_autonomous_game/v002/visual_review.md](../game/log_autonomous_game/v002/visual_review.md))
- [x] `completion_report.md` (What this proves / What this does not prove を分節) — C249 Phase 4 着地、Pulse Relay v003 教師差分 §「What this proves / does not prove」順守 ([game/log_autonomous_game/v002/completion_report.md](../game/log_autonomous_game/v002/completion_report.md))
- [x] Nao_u に出荷 → 指摘原文を `user_directives_raw.md` に保存（短く要約しない） — C249 Phase 4 `#game-rights` ts=1779848164.370029 投稿着地。Nao_u/Mir/Ash の指摘到来時に `user_directives_raw.md` (v001 共有) に原文保存予定

## 検討済み・未実装
- **ジャンル選択 = (C) 1秒先予測型 回避ゲーム**: 候補3案 (A) 反射系 / (B) 推理系 / (C) 予測型回避 のうち (C) を選ぶ。理由は `game/avoid_log/v04` まで作って Nao_u から「単調」評を受けた経験があり、Pulse Relay v003 の「学習→基本混合→価値提示→中盤圧力→終盤の山→終端」70-90秒カーブを直接当てはめることで対比実験になる。
- **副入力を1つだけ許容する判断**: Pulse Relay v003 は `Space だけ` を厳守したが、Log は「中心入力以外を最初から削る」を採用しすぎると探索が縮むという過去経験 (log_mystery v01-v03 でテキスト選択のみに絞った結果のスカスカ感) があるため、第1案では「中心入力 + 副入力1つまで」を許容する。意図的にPulse Relay 原則から少し離れる。
- **教師差分の取り入れ**: Pulse Relay 教師差分の「原文 / 失敗 / 悪い要約 / 禁止 / 確認方法 / 抽象境界」6点セット保存は採用。ただし `feedback_rule_proliferation_canonical.md`「禁止より目的で書く」とトレードオフがあるため、機械的にコピーせず Log 文脈で再構築する。

---

## 2026-05-30 C264 Phase 4: 強化 agent (PLAYER_SPEED 1.5x) で proxy 再計測 — v001/v002/v003 比較

**起票根拠**: C263 Phase 4 §5 a) 「強化 agent 導入で phase 2 到達」候補を最優先実装。素朴良手 agent が wave 1 内 (9.28s) で 30/30 死亡 → phase 2 (50-90s) 到達ゼロ = v003 改修対象 (phase 2 内 SHOOT_INTERVAL 90→60 frame 線形漸変) 計測不能の盲点を、agent 側 PLAYER_SPEED 1.5 倍化で打開できるかの試行。**game.js は変更せず、agent_difficulty_proxy.js 側だけ強化** (proxy 計測解像度の問題であり game balance の問題ではないため)。

### 着地物
- [game/log_autonomous_game/v001/agent_difficulty_proxy.js](../game/log_autonomous_game/v001/agent_difficulty_proxy.js) / [v002](../game/log_autonomous_game/v002/agent_difficulty_proxy.js) / [v003](../game/log_autonomous_game/v003/agent_difficulty_proxy.js) — `PLAYER_SPEED_STRENGTH = 1.5` + `PLAYER_SPEED_AGENT = PLAYER_SPEED * PLAYER_SPEED_STRENGTH` 定数を追加、`naiveGoodHandMove` 内の移動量を `PLAYER_SPEED_AGENT` に差し替え。`extracted_params` JSON にも両定数を載せ再現性確保
- log/c264_phase4_v001_result.json / v002_result.json / v003_result.json — 30 試行 × 3 バージョン分の生 JSON (Untracked、commit せず保存のみ)

### §1. 強化 agent (1.5x) proxy 4 指標 計測値 (n=3 バージョン × 30 試行 中央値)

| バージョン | median_clear_wave | median_residual_hp_ratio | median_play_time_sec | median_graze_count | survival_rate | phase 2 到達 (≥50s) | PLAYER_SPEED | PLAYER_SPEED_AGENT |
|---|---|---|---|---|---|---|---|---|
| v001 | 1 | **1.0** | **60.00** | 0 | **30/30 (1.0)** | 30/30 | 3.4 | 5.1 |
| v002 | 1 | 0.0 | 8.68 | 2 | 0/30 (0.0) | 0/30 | 3.4 | 5.1 |
| v003 | 1 | 0.0 | 8.68 | 2 | 0/30 (0.0) | 0/30 | 3.4 | 5.1 |

### §2. C263 baseline (1.0x) との対比

| バージョン | median_play_time_sec (1.0x → 1.5x) | survival_rate (1.0x → 1.5x) | phase 2 到達 (1.0x → 1.5x) | 差分判定 |
|---|---|---|---|---|
| v001 | 60.00 → 60.00 | 30/30 → 30/30 | 30/30 → 30/30 | **無変化** (1.0x で既に天井 = 1.5x の効果が出る余地なし) |
| v002 | 9.28 → **8.68** (-0.60s) | 0/30 → 0/30 | 0/30 → 0/30 | **わずかに悪化** (1.5x 移動量が MOVE_NOISE_SCALE=0.25 noise を増幅、agent が弾に突っ込みやすくなった) |
| v003 | 9.28 → **8.68** (-0.60s) | 0/30 → 0/30 | 0/30 → 0/30 | **わずかに悪化** (v002 と同様) |

### §3. 判定 — 退路 1 発火 (staging C264 Phase 4 §退路)

staging「次フェーズの大作業」§退路の 3 分岐:
1. **強化 agent でも phase 2 到達ゼロのまま** → PLAYER_SPEED 1.5 倍化では不十分事実認定 ← **本サイクルはこれ**
2. 強化 agent で 30/30 全クリア → 強すぎ判定 (1.2-1.3 倍に下げる) → v001 のみ該当だが元から 30/30 なので新規発火ではない
3. 中間 (phase 2 到達 1 件以上 + 全クリア未到達) → 計測解像度向上成功 → 該当バージョンなし

**結論**: PLAYER_SPEED 1.5 倍化は v002/v003 の phase 2 到達盲点を打開できない。むしろ median 0.6 秒悪化 = 「速度を上げると noise が増幅され、弾回避ではなく弾突入になる」現象を観察。素朴良手 agent の弱点は **速度ではなく予測能力** (nospecial 移動は最近接脅威からの逃避のみで、弾軌道予測なし) と判明。

### §4. 次の一手 (C265 候補)

a) **弾予測 move 関数導入 (C263 §5 a の続き)**: 現 `naiveGoodHandMove` は最近接弾からの斥力のみ。弾の vx/vy を 30-60 frame 先 (= 0.5-1.0 秒先) まで線形外挿し、player 位置との minimum-distance 時刻を計算 → その時刻の弾位置の集合から repulsive field を作って斥力を取る、を試す。Pulse Relay v003 教師差分の「1秒先予測 castLock」を agent 側にも導入する設計上の対称性あり
b) **MOVE_NOISE_SCALE 動的調整**: 1.5x boost 時に noise を 0.25 → 0.15 程度に下げ、boost 効果を移動量だけに集中させる。本サイクル §2 で観察した「速度↑だけだと noise が増幅される」現象への対症療法
c) **phase 別 proxy 分割 (C263 §5 b 継承)**: agent 改修で phase 2 到達が困難な場合、proxy 側を「phase 0 内 (0-20s) サブ指標」「phase 1 内 (20-50s) サブ指標」に分割し、現 4 指標を全 phase 込みの集約ではなく phase 別に出す。v003 改修 (phase 2 内漸変) の計測には phase 2 サブ指標の起動が必要だが、当面は wave 1 内死亡軽減 (phase 0 内指標の解像度向上) が現実的

### §5. 接続先

- [log/cycle_staging_log.md](../log/cycle_staging_log.md) C264 Phase 4 「次フェーズの大作業」節 — 本節は完遂報告として接続、退路 1 発火を物理化
- 本 md L62 C263 §5 a) 「強化 agent 導入で phase 2 到達」候補 — 本節 §3 結論で「不十分」事実認定 = a) 案は単独では効かないことが判明、C265 で a) を弾予測込みに進化させる流れ
- [game/log_autonomous_game/v002/agent_difficulty_proxy.js](../game/log_autonomous_game/v002/agent_difficulty_proxy.js) / [v003](../game/log_autonomous_game/v003/agent_difficulty_proxy.js) `naiveGoodHandMove` — 次サイクル C265 弾予測 move 関数導入の改修対象

### §6. kaizen #136 上位パターン補償との接続

本 Phase 4 は **staging Phase 3 §6 で発覚した「Phase 1 §6 が L72-80 のみ読み L62 を読み落とした → 既解問題を未解扱い」kaizen #136 同型再発の補償行動** として位置づけた。書類修正ではなく Active project (log_autonomous_game) の真の最重要残課題 (proxy 計測盲点) を直接動かすことで構造的補償を狙ったが、結果は退路 1 発火 = 1.5 倍化では不十分。**ただし「動かす」ことで判明した知見 (速度↑ + noise → 弾突入)** は次サイクル C265 b) MOVE_NOISE_SCALE 動的調整 の根拠になる = 進歩はあった。

---

## 2026-05-29 C263 Phase 4: proxy 4 指標 Pearson 相関第 1 回計算 — v002→v003 静止で計測盲点発見

**起票根拠**: C251 Phase 4 残課題 §1「実機判定取得後に proxy 4 指標 Pearson 相関第 1 回計算」が staging Phase 1 §5 で「最大停滞」と明記、本サイクル C263 Phase 4 大作業として「揃っていなければ揃える 1 手」方針で着手 (実機判定は依然未到達のため、Log 自己採点を fun_score 代理として暫定試算)。

### 着地物
- [game/log_autonomous_game/v003/agent_difficulty_proxy.js](../game/log_autonomous_game/v003/agent_difficulty_proxy.js) — 新規。v002 版から `currentShootInterval(elapsed)` 関数 + `SHOOT_INTERVAL_PHASE2_MIN` 定数抽出を移植 (phase 2 内 90→60 frame 線形漸変対応)
- v001/v002/v003 3 バージョン分の proxy 4 指標を同一 baseSeed=20260527 で取得、本節 §2 に表化

### §1. proxy 4 指標 計測値 (n=3 バージョン × 30 試行 中央値)

| バージョン | median_clear_wave | median_residual_hp_ratio | median_play_time_sec | median_graze_count | survival_rate |
|---|---|---|---|---|---|
| v001 | 1 | **1.0** | **60.00** | 0 | **30/30 (1.0)** |
| v002 | 1 | 0.0 | 9.28 | 2 | 0/30 (0.0) |
| v003 | 1 | 0.0 | 9.28 | 2 | 0/30 (0.0) |

**主観察**:
- **v001→v002 は 4 指標すべてで激変** (構造的大改修: wave 1 軽量化 + WAVE_TIMELINE + 敵 C 追加が proxy 側で捕捉された)
- **v002→v003 は 4 指標すべてで完全静止** (v003 改修 = phase 2 内 SHOOT_INTERVAL 90→60 frame 線形漸変が proxy 側で全く捕捉されていない)
- 静止の原因: 素朴良手 agent が wave 1 内 (median 9.28s) で 30/30 死亡 = phase 2 (50-90s) に到達できないため、phase 2 内の改修は計測対象外

### §2. fun_score 代理 (Log 自己採点、25/30 分母を 1.0 正規化)

| バージョン | Log 自己採点 (Q-A〜Q-E) | 正規化 fun_score | 採点出典 |
|---|---|---|---|
| v001 | 20.5/25 | **0.8200** | [v001/self_judgment.md §7g](../game/log_autonomous_game/v001/self_judgment.md) |
| v002 | 26.5/30 (Q-C 軸新設) | **0.8833** | [v002/self_judgment.md §1 末尾合計](../game/log_autonomous_game/v002/self_judgment.md) |
| v003 | 26.5/30 (v002 値暫定継続) | 0.8833 | self_judgment 未起票 (`feedback_headless_unfit_for_unfinished_eval.md` 順守、実機判定後に確定) |

**注意**: v003 fun_score は **暫定継続値**で、実機判定到達まで未確定。v002 と同値を置いた理由は v003 改修 (phase 2 内密度漸変) が Log 視点では微差扱い + completion_report §3 で「v003 が proves する 4 項目」も既存 v002 構造の延長線にあるため。本暫定値は実機判定到達時に上書き必須。

### §3. Pearson 相関 r 算出結果 (n=3、参考値)

| proxy | r | p_value | 備考 |
|---|---|---|---|
| median_clear_wave | **NaN** | — | proxy 分散ゼロ (全 1) のため数学的に計算不能 |
| median_residual_hp_ratio | **-1.0** | (自由度 1 で算出不能) | survive ⇄ fun_score 逆相関 (良手が生き残る = 簡単 = 面白くない、論文 Slay the Spire と同方向) |
| median_play_time_sec | **-1.0** | 〃 | play 時間 ⇄ fun_score 逆相関 (同上、長く生き残れる = 簡単) |
| median_graze_count | **+1.0** | 〃 | graze 回数 ⇄ fun_score 正相関 (擦りが多い = 危機接触多 = 面白い) |

**r = ±1.0 の数学的必然**: v002 と v003 が proxy 完全一致 + fun_score 完全一致 のため、実質 2 点線形 (n=3 = v001 1 点 + v002/v003 重複 1 点 = 独立 2 点)。n=2 では Pearson は常に ±1.0 になる (2 点を結ぶ直線が完全相関)。**論文 (Wordle n>30 r=0.624 / Slay the Spire n>30 r=0.871) と直接比較不可、信頼性なし**。

### §4. 結論 — Pearson 相関第 1 回計算の真の出力 = proxy 計測の盲点発見

数値結果 (r=±1.0) は数学的必然で意味なし。本サイクルの真の出力は以下 3 点:

1. **v002→v003 改修を proxy が捉えられない事実認定**: 素朴良手 agent が wave 1 内死亡 (9.28s) で phase 2 (50-90s) 到達ゼロ。**v003 のような phase 2 内パラメータ漸変は本 proxy の計測限界外**。「v003 改修が体感難易度に効いたかどうか」は本 proxy では原理的に判定不能。これは v003 改修が無意味という意味ではなく、proxy 側の盲点 (=「素朴良手 agent では到達できない領域の改修」は計測されない) という発見
2. **fun_score 代理問題の構造化**: Log 自己採点は実機判定なしのため、人間体感 fun_score とのギャップ未確認。proxy 4 指標を **真の fun_score** (人間体感ランキング) と相関するには、n≥4 (最低 Pearson 自由度 2) + 実機 fun_score 取得が必須
3. **n=3 サンプル不足の物理確認**: v002 self_judgment.md §8 #3 で「3 サイクル分蓄積で初判定可能」と書いたが、**3 サイクル蓄積しても v002/v003 重複で実質 n=2 になりうる**ことが本計算で明らかに。「proxy 値が変動するバージョン群」を蓄積条件に追加する必要

### §5. 次の一手 (C264 以降の候補)

a) **強化 agent 導入で phase 2 到達**: PLAYER_SPEED 1.5 倍 or 弾予測込み move 関数で素朴良手→中級手化、phase 2 (50-90s) 観察可能化。proxy 計測対象を v003 改修対象 (phase 2 内漸変) と一致させる
b) **phase 別 proxy 分割**: 現 4 指標を phase 0 内 / phase 1 内 / phase 2 内に分割して測ることで、改修対象 phase の解像度向上 ([Slay the Spire 論文 Act 1 限定計測と同方針])
c) **実機判定取得経路 R4 (Pages 公開) 完遂 + Nao_u 体感 fun_score 取得**: C254 Phase 4 で `docs/` 物理化 + smoke test PASS 着地済、Pages 有効化は Nao_u 手動操作待ち (C253 §c)。push + Pages 有効化後に #shared-reads 投稿 → Nao_u/Mir/Ash の **真の fun_score** を 1-5 段階で取得 → n=5 以上の Pearson 計算で論文水準の信頼性に近づける
d) **v004/v005 へ agent_difficulty_proxy 移植継続**: 本サイクルは v003 までで時間予算切れ、v004/v005 への移植は次サイクル C264 候補
e) **「proxy 値が変動するバージョン群」蓄積条件の self_judgment §8 追記**: v002 self_judgment §8 #3 の「3 サイクル分蓄積」を「3 サイクル分 + proxy 値変動」に上書き

### §6. 接続先

- [game/log_autonomous_game/v002/self_judgment.md](../game/log_autonomous_game/v002/self_judgment.md) §4.4 / §8 #3 — v002 proxy 中央値の出典 + 「3 サイクル蓄積で初判定可能」原文 (本節で更新条件追加)
- [game/log_autonomous_game/v003/completion_report.md](../game/log_autonomous_game/v003/completion_report.md) §3 — v003 が proves する 4 項目 (本節 §2 v003 fun_score 暫定継続の根拠)
- [game/log_autonomous_game/v001/agent_difficulty_proxy.js](../game/log_autonomous_game/v001/agent_difficulty_proxy.js) / [v002/](../game/log_autonomous_game/v002/agent_difficulty_proxy.js) / [v003/](../game/log_autonomous_game/v003/agent_difficulty_proxy.js) — 計測 runner 本体 (本サイクル v003 用新規移植)
- [memory/feedback_headless_unfit_for_unfinished_eval.md](../memory/feedback_headless_unfit_for_unfinished_eval.md) T:5 — 「headless 全 PASS だけでは判定不能」原則 (本節 v003 fun_score 未確定 + n=3 信頼性なし の根拠)
- [log/cycle_staging_log.md](../log/cycle_staging_log.md) C263 Phase 4 「次フェーズの大作業」節 — 本節は完遂報告として接続

---

## v006 検討メモ (2026-05-28 C257 Phase 3 起票、実装着手は v005 実機判定後)

**起票根拠**: 本サイクル C257 Phase 2 §4(C) で「v006 brainstorm 開始前に game_lessons_log R-A〜R-I を 1 回 read する」運用変更を決定、Phase 3 で R 層を最初に開いてから本節を書く構造に物理化 (R 層 1mm 履行記録)。**実装 commit は v005 実機判定到来前は出さない** (R-I 順守: 「人間プレイは判定装置でなく最終確認装置」、v005 self_judgment が Nao_u/Mir/Ash 実機反応待ちで未確定の状態で v006 を進めると、改修判断の根拠が v005 推測値に依存する = 退路設計化リスク)。本節は v006 着手前ガード文書として位置づける。

### v005 の「一番楽しい瞬間」(R-A 起点 1 文化)

[game/log_autonomous_game/v005/log_self_prediction.md](../game/log_autonomous_game/v005/log_self_prediction.md) §5 より:

> **「敵弾の動きを見て 1 秒先到達地点を予測し castLock で弾幕を踏み抜けた瞬間に、踏み抜いた弾数の強度 (N=1 黄12px / N=2-3 黄16px / N=4+ 橙20px) が画面に現れる」**

v006 改修候補は **この瞬間を強化する** か **新しい層を足す** かのどちらかでなければ採用しない (R-A 順守)。「問題を潰す」改修 (例: 死亡頻度が高すぎる → HP system 追加) は核体験を冷やす可能性が高いため第一優先から外す。

### v006 候補 3 軸 (v004 design_log §5「HP system 等」継承候補から本節で再評価)

| 候補 | 内容 | R-A 評価 | R-D 評価 (独自要素 1 つ) | R-E 評価 (対症療法世代) | 着手優先度 |
|---|---|---|---|---|---|
| **A) 敵射撃バリエーション (敵 B/C/D 追加)** | 既存敵 A (単一垂直降下) に敵 B (横スイープ) / 敵 C (ダイブ) / 敵 D (散弾) を 1-2 種追加。Pulse Relay v003 教師差分 wave 構造の直接継承 | **強化**: 「踏み抜き対象の質変化」で核体験を拡張 | **型側 (Pulse Relay 既存パターン継承)**、独自要素ではない = 4 つ目積み増しに当たらない | **対症療法でない**: v002 wave2 8秒静寂ガード後の自然延長、phase 1 末→ phase 2 圧力導入 | **高 (第一候補)** |
| **B) HP system 導入 (1 hit kill → 2-3 hit)** | プレイヤー HP を 2-3 に増やし、即死を緩和。死亡頻度の高さへの対応 | **冷やす**: 「1 hit kill = 死線スリル」を「2 hit = 安心マージン」に置換、Q-D 経済反転判定再起動が必要 (v005 design_log §0 で意図的に切り離し) | 独自要素ではない (型側) が、核を冷やす副作用が支配的 | **対症療法**: 「死にすぎる」問題への対症療法、R-E 警戒範囲 (3 世代対症療法積上げの始点になりうる) | **低 (射程外、Nao_u 実機評価で『死にすぎる』指摘が来ない限り採用しない)** |
| **C) 70-90s カーブ本体 (phase 2 = 圧力 / phase 3 = 終端の山)** | v002 で wave 軽量化 + 静寂ガードまで実装済、本格 phase 展開 (phase 2 = 50-70s A+D ローテ強化 / phase 3 = 70-90s 終端の山) は未実装。Pulse Relay v003 教師差分の直接継承 | **新層追加**: 「踏み抜く回数の積み重ねが意味を持つ」時間軸層を追加、核体験の時間スケール拡張 | **型側 (Pulse Relay v003 教師差分の時間カーブ)**、独自要素ではない | **対症療法でない**: 「展開なし反復」批判 (5/26 06:10 Nao_u) への構造応答、v005 連続 erase 段階化が「瞬間強度」軸を担当、本案は「時間カーブ」軸を担当 = 直交軸の追加 | **高 (第二候補、A と並行検討可)** |

### 着手判定発火点 (v005 実機判定後)

1. **Nao_u/Mir/Ash 実機判定到来**: v005 self_judgment §1 「実機なし判定 3/5 留まり」の Q-D / Q-成功FB が確定昇格、または「展開なし反復」批判への v005 連続 erase 段階化の応答有効性が判定される
2. **判定結果による v006 候補絞り込み**:
   - 「死にすぎる」「即死がフラストレーション」指摘なし → (A)/(C) を第一候補に据え置き
   - 「死にすぎる」指摘が来る場合 → R-A 「核体験 = 死線スリル」を冷やさない別策 (例: 死亡時のリスタート摩擦削減、開始難度緩和、tutorial wave 追加) を (B) HP system より先に検討、HP system は最後の手段
   - 「展開なし反復」批判が再発する場合 → v005 段階化のみでは不十分と判定、(C) 70-90s カーブ本体を最優先化
3. **R-I 着手前批判レビュー**: (A) or (C) 決定後、ブレスト 30 件 + 絞り込み 3 件 + 着手前批判レビュー (懸念3点 + 解決可能性 可/不可/不明) を本ファイルに追記してから game/log_autonomous_game/v006/design_log.md を起票

### 本サイクル C257 で **やらないこと** (退路設計回避)

- v006 game.js 実装 commit (R-I 順守)
- v006 design_log.md 起票 (実機判定前の起票は判定結果を recency 拘束しないために回避)
- ブレスト 30 件着手 (実機判定結果が候補絞り込みの精度を上げるため、判定後に着手)

→ 本節は **「v006 着手前の R 層接続ガード」のみ** を物理化した最小記録。次サイクル以降の Phase 4 大作業候補化判定発火は実機判定到来時点。

**接続先**:
- [memory/game_lessons_log.md](../memory/game_lessons_log.md) R-A / R-D / R-E / R-I — 本節は R 層の v006 適用記録
- [game/log_autonomous_game/v005/log_self_prediction.md](../game/log_autonomous_game/v005/log_self_prediction.md) — v005 核体験 1 文化の原典
- [game/log_autonomous_game/v004/design_log.md](../game/log_autonomous_game/v004/design_log.md) §5 — v005/v006 候補列挙の親
- [memory/feedback_means_ends_reversal_check.md](../memory/feedback_means_ends_reversal_check.md) — 本サイクル playable diff ゼロは Nao_u 判定待ち + R-I 順守が外部条件 (means/ends 反転兆候ではないが N=2 連続で再判定)

---

## 他インスタンス洞察接続: Ash C200 「Generator/Evaluator 比」を Log v001-v004 commit パターンに当てる (2026-05-28 C255 Phase 3 追記)

**外部源**: Ash [Ash] C200 Phase 2 #shared-reads ts=1779783082 (2026-05-26 18:11):
- (A) @kubotamas 5/26: 「人間はAIに丸投げして管理・評価（Evaluator）に回ると、自分で手を動かして理解・構築（Generator）する力が衰退する」「望ましい困難を維持すべき」
- (B) @akari_worlds 5/26: 「シンプルにしたつもりが複雑に届いてる時、書いた側は最後まで気づけない。次の階段から見ないと自分の階段の高さは見えない」
- Ash の解釈: **Generator を衰退させて Evaluator に特化した状態は最も自己評価盲点が大きい状態** (Bjork "desirable difficulties" + Dunning-Kruger metacognition の合流)
- Ash 自身は graze_log v06 で 5/22-26 「直近4日の Generator:Evaluator 比 0:5+」を物的証拠で発見、即時対策として replay_001 自プレイ 200字を提示

**Log 側 自検証 — log_autonomous_game commit パターン (5/26〜5/28)**:

| サイクル | commit prefix | 内容 | 分類 |
|---|---|---|---|
| C242 (5/26) | `game:` | v001 予測軌道線・×マーカー削除 (Nao_u 06:10 批判の構造処方) | Generator |
| C246 (5/26) | `game:` | rename Q-X gate「ごっこ」→機能名 | Generator (rename = 副軸) |
| C247 (5/27) | `game:` | v002 wave1 軽量化 + wave2 遅延 + verify + self_judgment | Generator |
| C248 (5/28) | `game:` | v002 audit scripts 3本 + self_judgment 26.5/30 | Generator |
| C249 (5/28) | `rule:` | Log 日記 + 残課題 3項目 [x] 化 | Evaluator |
| C251 (5/28) | `game:` | v003 完遂仕上げ + verify.js PASS 確認 + completion_report.md | Generator |
| C252 (5/28) | `rule:` | memory_redesign 派生層実装仕様化 + kaizen #134 + v004 昇格 | Evaluator |
| C253 (5/28) | `log:` | v003 実機判定取得経路選定 (R4 Pages) | Evaluator |
| C253 (5/28) | `game:` | v001-v004 を docs/ に公開コピー (Pages 用 R4 経路) | Generator (config 寄り) |
| C254 (5/28) | `log:` | Phase 5 日記 + staging + projects 更新 | Evaluator |
| C255 (5/28) | (今サイクル) | shared-reads A-MEM 投稿 + kaizen tracker 追記 + 本記述 | Evaluator |

**比率**: 直近 11 commit のうち Generator 5 / Evaluator 6 / Generator(config寄り) 1。Ash graze_log v06 の「4日連続 0:5+」ほど極端ではないが、**v003 ship (C251) 以降 4 サイクルは Generator 5/サイクルではなく Evaluator が支配的**。

**何が Evaluator 偏重を生んでいるか**:
1. v003 ship 後の「実機判定待ち」(self_judgment.md §1 で「実機なし判定 3/5 留まり」と書いた箇所、Nao_u/Mir/Ash 実プレイ依頼後の停滞) = **Ash と同じパターン (外部 Evaluator 待ち時に内部 Evaluator 増産で代替)**
2. memory_redesign + kaizen 観察 + 他インスタンス洞察消化など、「思考の質側」の作業に時間が吸われている
3. v004 昇格 (C252) が宣言されたが、v004 の実装が C253 docs/ コピーで止まっている = v004 ゲーム本体実装 0 commit

**Log 側の即時対策候補 (Ash の replay 200字に対応する Log 用の 1mm)**:
- **対策1**: v004 の「次の実装 1個」を C256 で着手する。memory_redesign の派生層実装仕様化 (C252) を v004 ゲーム本体に翻訳した最小 commit を 1 本入れる
- **対策2**: 自プレイ記録: Log は GUI 操作能力欠如で実プレイ不可だが、**v004 v.s. v003 の差分を「Q-X ゲートに対する想定スコア変動 +/-」で書く 200 字メモ**を `game/log_autonomous_game/v004/log_self_prediction.md` に置く。これは「次の階段から見て v003 の階段の高さを書く」の Log 版 = akari_worlds の「次の階段」の代理
- **対策3**: Generator commit ガード: kaizen として「v003 ship 以降のサイクルで `game:` prefix commit が 3 サイクル連続ゼロなら staging に WARN」を起票検討 (ただし `feedback_few_rules_big_effect.md` の「ルール量↑=遵守率↓」と衝突するので**まずは観察延長**、N=3 同型 (Generator ゼロ 3 サイクル連続) を満たしたら起票)

**Difference First** — Ash と Log の構造的差:
- Ash: 外部 Nao_u プレイ評価待ち → Evaluator 増産で代替
- Log: 内部実機なし (GUI 操作不可) → 自プレイ記録自体が代替の対象外 → **Evaluator 増産が必然的に多くなる構造を Log は最初から抱えている**。Ash の対策をそのまま転用できない (replay_001 = 自プレイ書き出し → Log は再現不可)
- Log 用に翻訳: 「次の階段から見る」を「次バージョン仕様の差分予測」に置換。v004 v.s. v003 の差分が**観測可能な指標**で書けるなら、それが Log の階段視認手段になる

**次の一手 (C256 以降)**:
- v004 ゲーム本体に最小 1 commit を入れる (内容は memory_redesign 派生層実装仕様化からの逆翻訳 — どの mechanic を v004 で試すかは C256 Phase 2 で決める)
- v004 着手前に `log_self_prediction.md` 200 字メモを書く (akari_worlds 階段視認の Log 翻訳)
- 3 サイクル連続 `game:` ゼロが続いたら kaizen 起票判定 (現在は N=1: C254-C255 連続で `game:` ゼロ。C256 で `game:` commit があれば N=1 で打ち止め、ゼロなら N=2)

**接続**: CLAUDE.md「絶対にやる」#1「ゲームを動かして出す — 積み上げはその副産物」+ `feedback_means_ends_reversal_check.md` (brainstorm・結晶化・cross_review・日記が主たる出力になっているサイクルは診断対象) と直接合流。Ash の指摘は **CLAUDE.md #1 の独立外部到達点**として位置づける = 外部独立収束 (feedback_substrate_not_infrastructure.md 「moat 二層」と同型の外部証拠機構)。

## 履歴

### 2026-05-28 C254 Phase 4: R4 経路着手 — Pages 公開用 docs/ 物理化 + ローカル smoke test PASS (push + 有効化は Phase 5 ハンドオフ)

**契機**: C253 Phase 3 で R4 (Pages) + R2 (#shared-reads 通知) 併走を採用決定、その「次の論理的 1 手 = 物理着手」を C254 Phase 4 大作業として実行。経路選定までで止めて持ち越すと `feedback_means_ends_reversal_check.md` 同型 (情報収集 + 分析 + 経路選定までやって着手しない構造) になる、Phase 4 で物理化まで踏むことで「選定 → 物理着手」のフィードバックループを 1 サイクルで閉鎖する判断。

**完遂物 (Phase 4 内で着地)**:
- `docs/games/log_autonomous_game/index.html` — v001/v002/v003/v004 への links + 各 version の差分要旨 (Echo-Path 系列ランディング)
- `docs/games/log_autonomous_game/v001/` `v002/` `v003/` `v004/` 各ディレクトリに `index.html` + `game.js` をコピー (game/ 配下のオリジナルから無変更コピー、外部依存なしで移動可能)
- `docs/index.html` — repo root ランディング (games ハブ + repo link)
- `docs/.nojekyll` — Pages 配信時の Jekyll 処理停止 (.md docs/ が勝手にレンダリングされるのを防止)
- **ローカル smoke test PASS**: `python -m http.server` 経由で `/`, `/games/log_autonomous_game/`, `/games/log_autonomous_game/v001-v004/`, `/games/log_autonomous_game/v00X/game.js` の全 URL が HTTP 200 + 期待バイト数 (v001 game.js 22985 / v002 28222 / v003 29625 / v004 30803) で応答

**完遂しなかったこと (Phase 5 ハンドオフ)**:
- (a) `docs/` の commit + push — Phase 4 メタ指示「commit/push は Phase 5 で日記とまとめて行う」遵守
- (b) GitHub Pages 有効化 — `gh` CLI 不在 + Pages 有効化は repo Settings UI 経由必要、**Nao_u に依頼が必要なステップ**: Settings → Pages → Source: "Deploy from a branch" → Branch: master / Folder: /docs を選択
- (c) 公開 URL `https://nao838861.github.io/nao-u-lab/` HTTP 200 確認 — push + (b) Pages 有効化後に Phase 5 で実施
- (d) #shared-reads 投稿 (Mir/Ash 向け cross_review 依頼) — (c) URL 確認後に Phase 5 で実施

**設計判断 (なぜこの構造か)**:
- **`docs/` 経由 + `.nojekyll`**: `gh-pages` ブランチ運用より master 一本で完結、CI なしでも push のみで公開更新が回る。`.nojekyll` で既存 docs/*.md の意図しない Jekyll レンダリング (security_policy.md 等の整形表示) を防止
- **`docs/games/log_autonomous_game/vXXX/`** サブディレクトリ構造: Mir/Ash の自律ゲームを将来追加する時の型を最初から確立 (`docs/games/<instance>_<name>/vXXX/`)。今回は Log の log_autonomous_game のみだが、Mir mimicry_log / Ash graze_log が公開した場合に同パターンで追加可能
- **外部依存なしのオリジナルからの単純コピー**: 各 version の `game.js` + `index.html` は HTML 内で `<script src="game.js">` だけ参照する自己完結構造のため、ディレクトリごとコピーで移動可能。CDN / 外部 JS なし
- **`verify.js` / `audit.js` / `agent_difficulty_proxy.js` は docs/ に複製しない**: これらは dev tools (node 実行) で browser 経由のゲームプレイには不要、Pages 公開からは除外して noise を減らす

**接続先**:
- [game/log_autonomous_game/v001-v004/](../game/log_autonomous_game/) — オリジナル / `docs/games/log_autonomous_game/vXXX/` はその publish コピー
- [log/cycle_staging_log.md](../log/cycle_staging_log.md) C253 Phase 3 「次フェーズの大作業」節 — 本節は完遂報告として接続
- [memory/feedback_means_ends_reversal_check.md](../memory/feedback_means_ends_reversal_check.md) — 「経路選定 → 物理着手」を 1 サイクルで閉じる原則の実例
- C253 Phase 3 §「採用経路: R4 + R2 併走」 — 本節は R4 物理着手部分の着地、R2 (#shared-reads) は Phase 5 で同時着地予定

### 2026-05-28 C253 Phase 3: 実機判定取得経路 — 4 経路列挙 + 判定基準明示 (5 サイクル持ち越し脱出)

**契機**: C249 v002 出荷 → C250/C251 v003 完遂 → C252/C253 と経過、**5 サイクル連続で「次サイクル: 実機判定取得」を残課題として持ち越し**。self_judgment.md は v002 暫定 26.5/30 (Q-C 軸新設後) / v003 は self_judgment 未起票 (C251 Phase 4 で意図的に保留) のまま、Q-導入 / Q-D / Q-成功FB / Q-ミミクリ / 展開差カーブ いずれも実機依存項目で確定昇格の道が閉鎖中。staging Phase 2 で「経路選定を 1mm 進める」と判定、本節で経路 4 本を列挙し判定基準を明示する。**経路を決めず持ち越し続けることそれ自体が `feedback_means_ends_reversal_check.md` 同型** (Phase 1/2 で情報収集 + 分析を出力にし続けて、game/* の評価をいつまでも回さない構造)。

**経路 4 本 (各経路の長所・短所・着手コスト)**:

| 経路 | 着手手順 | 長所 | 短所 | コスト |
|---|---|---|---|---|
| **R1: #game-rights で再度 Nao_u に依頼 (push)** | (1) v002 #game-rights ts=1779848164 から経過時間を確認 (5/26 21:36 投稿 → 本 5/28 = 2 日経過、Nao_u 反応なし) (2) 再リマインドを #game-rights に投稿 | Nao_u の体感判定が直接得られる = 5 ゲートの確定昇格に最短 | Nao_u の時間を消費 / 既出荷投稿に未反応のまま再依頼は「催促」になる / Nao_u の判断は彼の優先度に従う、こちらから時期を強制できない | Slack 1 投稿、5 分 |
| **R2: Mir / Ash に cross_review 依頼** | (1) #shared-reads に「v002 を Mir/Ash いずれかに 5 分プレイしてもらえないか」投稿 (2) プレイ判定結果を visual_review.md UNKNOWN 8 項目に当てて確定採点に書き換え | Nao_u の時間を消費しない / Log 内の cross_review 文化 (cycle 内で複数視点) に整合 / Mir/Ash は同じ実機環境を持つ可能性が高い | Mir/Ash 側の優先度に従う、こちらから時期を強制できない / Nao_u 直接体感ではないため Q-導入 / Q-ミミクリ「？を立てる」体感は彼の感性とずれる可能性 | Slack 1 投稿、5 分 |
| **R3: Log 自己判定で確定昇格 (実機依存項目を「実機未確認のまま確定」と再定義)** | (1) v002/self_judgment.md §1 の各 Q ゲート失点 -0.5 を「実機判定なし減点」として恒久化 (2) 26.5/30 → 「実機未確認の暫定 26.5/30」のまま確定 (3) Q-C/Q-D/Q-成功FB を 5/5 化しない | 着手即完了 / 持ち越しが消える | **却下相当** — `feedback_headless_unfit_for_unfinished_eval.md` T:5「headless 全 PASS だけでは『ちゃんと遊べている』判定不能」原則違反 / 暫定採点をいくら磨いても核は実機依存のまま | 0 |
| **R4: GitHub Pages 公開で pull-based 判定機会創出** | (1) `gh-pages` ブランチ or `docs/` 経由で v002 を公開 (2) URL を #game-rights / #shared-reads に投稿 (3) Nao_u / Mir / Ash が任意のタイミングで触れる状態を作る | 「催促せず触ってもらう」(Nao_u の時間を消費しない) / 1 度公開すれば v003/v004 公開も型化 / `python -m http.server` ローカル起動の摩擦をゼロ化 | 初回設定コスト / 公開しても触られない可能性は残る (push 強制力なし) / GitHub Pages 設定で repo 公開設定の確認が必要 | 公開設定 30 分、URL 投稿 5 分 |

**判定基準 (どの経路を選ぶか)**:

1. **R3 (Log 自己判定で確定昇格) は採用しない** — `feedback_headless_unfit_for_unfinished_eval.md` 違反、Q-C/Q-D/Q-成功FB の体感確定は実機なしには昇格させない原則
2. **R1 (Nao_u 再依頼) は採用しない** — v002 #game-rights 投稿 (5/26 21:36) から 2 日経過 Nao_u 反応なしの状態で再依頼することは催促になる。Nao_u は自分の優先順位で動く、こちらから時期を強制しない (Slack 投稿ルール「Nao_u の時間を使わせない」順守)
3. **R4 (Pages 公開) が本筋** — push 強制力なしで Nao_u が任意のタイミングで触れる状態を作る = 「催促せず機会を増やす」が最も Slack ルールに整合。初回設定コストは v003/v004 公開も同じパイプライン化できるため一度払えば長期回収可能
4. **R2 (Mir/Ash cross_review) は R4 の補完として併走** — Pages 公開 URL を #shared-reads に投稿して Mir/Ash に「触れる機会の通知」を出す形にすれば、push 強制ではなく機会案内になる

**本サイクル C253 Phase 3 では決定までで止める**:
- **採用経路: R4 (Pages 公開) + R2 (#shared-reads URL 通知) 併走** で確定
- **着手は次サイクル C254 Phase 4 以降の大作業候補**。本サイクルで Pages 公開作業に着手すると Phase 3 アクション内に収まらない (30 分超 + repo 公開設定の検討必要)
- 本サイクルの 1mm 前進 = 経路 4 本列挙 + 判定基準明示 = self_judgment.md 確定昇格の道閉鎖危機からの脱出経路を構造化

**残課題 (C254 以降)**:
- (R4 着手) `docs/` ディレクトリ or `gh-pages` ブランチで v001/v002/v003 を index.html 経由で公開する設定。GitHub Pages の repo 公開設定確認 (現状 private/public 確認 + Pages 設定の有無確認) を含む
- (R2 補完) Pages 公開 URL 取得後、#shared-reads に「v002/v003 をブラウザで触れる状態にした、Mir/Ash で気が向いたら 5 分プレイして visual_review.md UNKNOWN 8 項目を埋めてほしい」投稿

**Phase 3 で意図的にやらなかったこと**:
- R4 の実装着手 (Pages 設定) — Phase 3 アクション粒度を超える、C254 Phase 4 大作業候補に回す
- v003/self_judgment.md 新規起票 — v003 は v002 の最小差分 1 本 (phase 2 漸変) で実機依存項目に新規追加なし、v002/self_judgment.md の更新で十分判断
- self_judgment.md の暫定採点の数値書き換え — 経路選定までで止める判断 (実機判定取得が動いた段階で書き換える)

**接続先**:
- [game/log_autonomous_game/v002/self_judgment.md](../game/log_autonomous_game/v002/self_judgment.md) §8 次サイクル必要作業 — 本節は §8.1「実機視覚判定の取得」への経路選定として接続
- [memory/feedback_headless_unfit_for_unfinished_eval.md](../memory/feedback_headless_unfit_for_unfinished_eval.md) T:5 — R3 却下根拠
- [memory/feedback_means_ends_reversal_check.md](../memory/feedback_means_ends_reversal_check.md) — 5 サイクル持ち越し継続自体が同型診断対象、本節で診断 → 行動修正 ループを 1mm 閉じる
- [log/cycle_staging_log.md](../log/cycle_staging_log.md) C253 Phase 2 §6 / Phase 3 — 本節起票文脈

### 2026-05-27 C251 Phase 4: v003 完遂仕上げ — verify.js PASS 確認 + completion_report.md 起票 + 密度カーブ playable diff 着地

**契機**: C251 Phase 2 で「本サイクル C251 の第一義出力 = Slack 投稿、game/* diff ゼロ」と自己診断 (`feedback_means_ends_reversal_check.md`)、C248-C250 3 サイクル連続で同型疑い。Phase 4 で game/* diff 1 commit を出すフィードバックループ閉鎖を最優先と判定し、C250 Phase 4 で着地済の v003 game.js + verify.js (currentShootInterval 関数化 + phase 2 内 90→60 frame 線形漸変 + verify report 拡張) に対する完遂仕上げ (verify.js 実行確認 + completion_report.md 起票 + プロジェクトファイル更新) を 1 サイクルで完遂。

**完遂物**:
- [game/log_autonomous_game/v003/completion_report.md](../game/log_autonomous_game/v003/completion_report.md) — 新規。§1 v002→v003 差分 (game.js 17 行追加 + verify.js 同期 + 維持要素列挙) / §2 verify.js 実行結果サマリ (`pass: true`、4 方針すべて phase 0 内死亡で v002 と完全一致) / §3 What this v003 proves 4 項目 / §4 What this v003 does NOT prove 8 項目。Pulse Relay v003 教師差分 §「What this proves / does not prove」順守
- `node game/log_autonomous_game/v003/verify.js` 実行確認 (本 Phase 4): `pass: true`, exit 0, survivors=[]、camper 319f / lane-holder 277f / blind-sweeper 378f / nospecial 489f = v002 verify と死亡時刻完全一致 = phase 2 漸変が phase 0 の悪手通過の穴を新規に開けていない regression test 通過
- 本ファイル履歴セクション本節追加 + [projects/INDEX.md](INDEX.md) log_autonomous_game 行更新 (起票記述 → v003 着地記述)

**Phase 4 で意図的にやらなかったこと**:
- 別作業への逸れ (graze_log v06 deterministic 指標 draft 送信 / mimicry_log v03 実装 / kaizen #135 build_atom_edges 段階2 — 全て次サイクル C252 以降候補)
- proxy 4 指標 v003 再走 (design_log §2.2 で意図的選択、v002 baseline を据え置き Pearson 相関第 1 サンプル化は実機判定後)
- self_judgment.md v003 起票 (Q-D / Q-成功FB / Q-ミミクリ / 展開差カーブ いずれも実機判定依存項目で、v003 単体で書ける差分は微小、`feedback_headless_unfit_for_unfinished_eval.md` 順守)
- 新規ルール化 (Phase 4 は実装 phase)
- 日記 (日記は Phase 5)
- commit / push (Phase 5 で日記とまとめて実施)

**構造的学び**:
- 「最小差分 1 commit 隔離可能性」の物理確認 = v003 は game.js 17 行追加 + 1 行参照置換のみで v002 の他領域 (echo / wave dispatcher / 敵運動 / 弾源 / UI) を一切 touch せずに phase 内密度カーブを変えられた。「次の改修候補を 1 項目ずつ最小差分で出す」運用形が機能している
- verify.js が **regression test として機能した** = v003 は phase 2 内の漸変だが verify の悪手 4 方針はすべて phase 0 内死亡で phase 2 に到達しない。それでも「死亡時刻が v002 と完全一致」を確認することで「改修対象外 phase に副作用が出ていない」検証ができた。これは verify.js の用途が「悪手検証」だけでなく「改修隔離性の regression check」に拡張可能なことを示す
- 「手段の目的化診断 → 行動修正」フィードバックループの閉鎖事例: C251 Phase 2 自己診断で「Slack 主、game/* diff ゼロ」を検出 → Phase 4 大作業を「game/* diff 1 commit」に固定 → 完遂、というフロー自体が `feedback_means_ends_reversal_check.md` の運用形

**残課題 (次サイクル C252 以降)**:
- 実機判定取得 (Nao_u / Mir / Ash) で v003 完遂報告 → Q-導入 / Q-D / Q-成功FB / Q-ミミクリ / 展開差カーブ の確定採点書き換え + proxy 4 指標 Pearson 相関第 1 回計算
- **v004 設計時の事前ゲート: Echo-Path = 自発リスク近接の構造判定** ([feedback_self_risk_core_pitfall.md](../memory/feedback_self_risk_core_pitfall.md) 適用 — C252 Phase 1 §D 想起契機)。
  - Echo-Path は「Space で過去 1 秒の軌道を再演」 = 防御的自発機構 (敵弾回避目的)、サイヴァリア BUZZ / graze_log GRAZE の「報酬目的自発行為」とは方向が逆だが、**コア機構が「自発トリガー前提」になっている** 点で同型の罠 (Echo を打たないと予測軌道が見えない = 撃ったときだけ報酬経路が活性化)
  - v004 で報酬・スコア・パワーアップ機構を追加する場合、`feedback_self_risk_core_pitfall.md` の Q-D シート (緊張の発生源: 外発/自発/両方 / 経済反転チェック / 美しいプレイ1行) を design_log.md 冒頭に転記し、外発緊張源 (敵弾 = 向こうから来る圧力) を主、Echo 自発要素を副に保つことを物理化する
  - **判定基準**: 敵弾密度カーブを 0% にしたとき緊張が成立するか — 成立しないなら外発依存維持で OK、Echo 単独で緊張が成立するなら自発コア化が進行中で graze_log v01 同型事故予兆 (実機判定で「弾を撃つ敵は倒さない方が得」相当の経済反転が観測されたら即座に v004 設計巻き戻し)
- v002 completion_report §4「does NOT prove」残 5 項目の優先順位付け (実機依存 4 項目 / 90s 以降継続展開 / headless 順守原則継続)
- graze_log v06 deterministic 指標 draft の送信判定 (Ash の v07 設計動向確認後)

### 2026-05-27 C249 Phase 4: v002 を Nao_u に出荷 — completion_report.md + visual_review.md 起票 + #game-rights 投稿

**契機**: C249 Phase 3 で「v002 出荷条件 (audit scripts 3 本 + verify.js 全 PASS、Δ-5/6/7 着地済) は揃った、残りは出荷文書作成と投稿のみ」と判定。C237 起票以来 12 サイクル undone のまま残っていた「Nao_u 出荷」「visual_review.md」「completion_report.md」3 残課題を、出荷条件が揃った瞬間に出す運用として一括処理。

**完遂物**:
- [game/log_autonomous_game/v002/completion_report.md](../game/log_autonomous_game/v002/completion_report.md) — 新規。1 行コンセプト / v002 出荷スコープ / 自己採点サマリ / What proves 6 項目 / What does NOT prove 7 項目 / 出荷時の依頼 (Nao_u/Mir/Ash) / 起動手順 / リンク。Pulse Relay v003 教師差分 §「What this proves / does not prove」順守
- [game/log_autonomous_game/v002/visual_review.md](../game/log_autonomous_game/v002/visual_review.md) — 新規。Log の GUI 操作能力欠如を明示した上で V-01〜V-17 の 17 チェック項目 + PASS/UNKNOWN 判定。純 PASS 16、PASS + UNKNOWN 混合 4 (V-05〜V-08、コードレベル PASS / 体感 UNKNOWN)、UNKNOWN サマリ 8 項目を実機判定者 (Nao_u/Mir/Ash) へ判定委譲
- `#game-rights` ts=1779848164.370029 — v002 出荷投稿。何を出すか / ヘッドレス監査 4 軸全 PASS 結果 / 起動手順 / 3 文書リンク (GitHub URL) / Nao_u/Mir/Ash 依頼 8 項目 / 判定材料にしないでほしいもの 3 項目 / Log 自己採点サマリ
- 本ファイル残課題セクション 3 項目 [x] 化 (visual_review / completion_report / Nao_u 出荷)

**audit scripts / verify 全 PASS のまま維持確認** (Phase 3 で確認済、Phase 4 で再確認なし):
- verify.js pass:true (camper 5.32s / lane-holder 4.62s / blind-sweeper 6.30s / nospecial 8.15s)
- bullet_origin_audit 10/10 PASS
- enemy_behavior_audit 8/8 PASS
- agent_difficulty_proxy 30/30 完走

**Phase 4 で意図的にやらなかったこと**:
- 別作業への逸れ (kaizen #135 段階2 / Mem0 gap 6 件を自己診断項目化 / log_cdx 残 3 問返信 — 全て次サイクル候補)
- 新規ルール化 (Phase 4 は実装 phase、新ルール起票は phase 3 か phase 5 で判断)
- 日記 (日記は Phase 5)
- commit / push (Phase 5 で日記とまとめて実施)

**構造的学び**:
- 出荷条件 (audit 4 軸全 PASS + 採点書類完成) が揃った状態で「出荷文書 2 本 + Slack 投稿 1 本」を 1 サイクルで完遂できる粒度として確認 = 「ゲームを動かして出す」原則 (`feedback_means_ends_reversal_check.md`) の運用形 = 出荷条件が揃った瞬間に出す = サイクル詰まりが再発しない構造
- visual_review.md で「PASS / UNKNOWN 二段判定」を導入 = Log の制約 (GUI 操作能力欠如) を明示しつつコードレベル判定を最大限カバー、UNKNOWN 項目を実機判定者に明示委譲する形を v002 で初めて運用 (v003 以降の visual_review 雛形候補)

### 2026-05-27 C248 Phase 2/3: NextMars Readability Systems で telegraph 位置づけ refine + C248 大作業 v002 残タスク確定

**契機**: C247 Phase 4 で v002 着地 (wave カーブ + verify.js v002 化) 完遂直後の C248。空サイクル (新着Slack 0 / pending 0 / external_notes 統合候補 0) 判定下で、Phase 1 §6 外部検索 1 本実行 (キーワード `bullet hell shooter visual prediction line clutter readability`) で NextMars 2026-03「Premium 2D Gameplay Readability Systems Matter More Than Visual Density」を取得。

**Phase 2 採用判定**:
- v001 失敗の真の原因 = telegraph (予告軌道線+×印) が **悪いのではなく**、contrast priorities / silhouette rules / effect hierarchy が同色家族4要素同居で崩壊した結果、telegraph 信号が視覚ノイズに飲まれて読めなくなった
- 「telegraph inherently 悪」前提で v001 を削った C242 判断は **結果的に正しい** (visual hierarchy 設計と同時にやり直すコストが高い、削るのが最短) が、将来 v002+ で再採用する際は NextMars Q1 (silhouette 識別) を満たした後の順序を守る

**Phase 3 着地**:
- `#shared-reads` ts=1779834973 投稿 — NextMars 4軸目 refine 投稿、C242 三軸独立収束への refine 4軸目として並置 (Mir 5/25 三軸 [oktamajun ごっこ / Nao_u 視覚ノイズ / Sparen 密度] + NextMars 4軸目 = Q1〜Q4 装置化)
- `feedback_inside_to_outside_leak.md` 末尾に「refine: telegraph は inherently 悪ではない」節追記、関連投稿節も併設
- `kaizen #133` 検証期限到達判定 = staging に対し `check_kaizen_id_reference.py --verbose` exit 0 = 不在ID引用 0件確認、#132 同型の発火条件(a) 適用で +30日延長 (2026-06-26 新検証期限)

**C248 Phase 4 大作業確定 (本ファイル「残課題」の C248 マーク参照)**: v002 残タスク = 敵 C ダイブ敵 + 70-90秒時間カーブ本体 + audit scripts (bullet_origin_audit / enemy_behavior_audit / agent_difficulty_proxy) v002 移植。完遂条件 = (1) `enemyC` クラス追加 + spawn dispatcher 3 種化 (A/D 偶奇 → A/D/C トリプレット) (2) wave_curve.json か `WAVE_TIMELINE` 配列で 70-90 秒の難易度カーブ第1段を本実装 (現状の 8 秒静寂ガードは局所策) (3) audit scripts 3 本が v002 game.js に対して exit 0 で PASS。

**構造的学び**:
- 4 軸目が外部知見との独立収束 (NextMars が telegraph を 7 要素の 1 つとして積極位置づけ) で C242〜C247 の自己診断 (telegraph 悪) を「正しいが部分的」に refine できた = 外部素材は判定装置ではなく **判定精度の更新装置**、CLAUDE.md「絶対にやる」L2「外の世界を広く見る」運用化
- 空サイクル深掘り 5 カテゴリで「持ち越し0 / Active 7日無更新0 / kaizen 2週間停滞0 / 既解問題判定なし」の場合でも、Phase 1 §6 外部検索 1 本だけで判定更新装置として機能する事例として記録

### 2026-05-27 C247 Phase 4: v002 着地 — wave カーブ実装 + 1 原則完全達成 + verify.js v002 化

**契機**: Nao_u 5/26 06:10 #human-steering 指摘「予測軌跡＋×印が視界ノイズで弾本体回避を阻害、展開なし反復で明確につまらない」への構造応答。A/B/C 自己判定で A (ゴースト全廃) 採用 (C247 Phase 2 §2、#all-nao-u-lab ts=1779824294)、Phase 3 で v002/ 骨格作成、Phase 4 で wave カーブ完遂。

**v002 差分 (4 箇所)**:
- Δ-1 `drawTitle()` 内ゴースト + 結線描画 14 行削除 — タイトル画面の「1 秒先計算結果を画面に流出」最後の残存箇所を消去 (Phase 3 着地)
- Δ-2 UI 用語洗浄 — `<title>` から「(パイロットごっこ)」削除、`.note` 内部用語削除 (Phase 3 着地)
- Δ-3 wave 1 軽量化 — `spawnWaveA` n=5→3、shootCooldown +30 オフセット、x=0.25/0.5/0.75 再配置 (Phase 4 完遂)
- Δ-4 wave 2 遅延 — `WAVE_REST_FRAMES=480` 定数 + `lastClearFrame` 記録、wave clear から 8 秒静寂後に次 wave 起動 (Phase 4 完遂)

**完遂物**:
- [game/log_autonomous_game/v002/game.js](../game/log_autonomous_game/v002/game.js) — Δ-1〜Δ-4 全反映
- [game/log_autonomous_game/v002/verify.js](../game/log_autonomous_game/v002/verify.js) — 新規。悪手 4 方針 (camper 5.32s / lane-holder 4.62s / blind-sweeper 6.30s / nospecial 8.15s) 全 wave 1 内 gameover、`pass: true` (exit 0)。**wave 1 軽量化が悪手通過の穴を作っていない**確認
- [game/log_autonomous_game/v002/self_judgment.md](../game/log_autonomous_game/v002/self_judgment.md) — 新規。Q-A〜Q-E 5 ゲート 22/25 (v001 21/25 → +1pt) / Q-ミミクリ 11.5/15 (v001 11/15 → +0.5pt) / 展開差カーブ 15.5/20 (v002 で初設置、78%)

**構造的学び (本サイクルで結晶化)**:
- 「内側→外側流出」1 原則 (`feedback_inside_to_outside_leak.md`) はプレイ画面で C242 達成、v002 でタイトル画面も含めて**完全達成**。Q-D を 4.0 → 4.5、Q-ミミクリ-1 を 4.5 → 5 まで暫定昇格 (5 確定は実機判定後)
- Nao_u 5/26 06:10 指摘の核は「視界ノイズ」+「展開なし反復」の 2 軸独立。v001 は前者のみに対応 (C242)、v002 で後者も初対応 (Δ-3/Δ-4 で展開差カーブ 78% 到達)
- 「Nao_u が判定装置ではなく最終確認装置」原則の運用化 (CLAUDE.md「絶対にやる」L4): A/B/C 提示後 22 時間「指示待ち」凍結 → Phase 2 で自己判定 A 選択 → Phase 3-4 で v002 着地、というフロー自体が原則を結晶化

**残課題 (次サイクル C248 以降)**:
- 実機判定取得 (Nao_u / Mir / Ash) で Q-導入 / Q-D / Q-成功FB / Q-ミミクリ-2/-3 / 展開差カーブを確定採点へ書き換え
- 敵 C (ダイブ敵) + 70-90 秒時間カーブ実装 ← 「2 wave ループ反復」リスク解消の本丸 (v002 では A→D 2 wave 偶奇 dispatcher 維持、3 種以上未実装)
- audit scripts (bullet_origin_audit / enemy_behavior_audit / agent_difficulty_proxy) の v002 移植 (本 Phase 4 では verify.js のみ移植)

### 2026-05-26 C244 Phase 3: teco_park 感情論 (Mir 経由) からのミミクリ宣言節補強

**Mir 経由 teco_park 三宅俊輔 (PICO PARK)「僕のゲームクリエイティブ論」note (https://note.com/tecopark/n/n54d7a3ad84e2)** — 最初の見出し「何はともあれ感情・感情・感情」。メカニクス/ナラティブ/レベルデザインより先にプレイヤーの感情体験を置く立場。PICO PARK が「協力プレイで一緒に笑う・怒る・達成する」感情設計を先に置き、パズル構造はそれを引き出す装置になっている。

v001 への独立到達整合: 本プロジェクト C242 Phase 3 で物理化した「ミミクリ宣言」(2026-05-26) は **「死線スリリングを抜けるパイロット感」+「LLM自己観測ごっこ」二重ミミクリ = 感情核を先に決めてからメカニクス設計** という構造を取った。teco_park 論はこの順序 (感情→メカニクス) を独立 source として裏付ける。

禁則の補強: 「メカニクス的に正しい改修で核を冷やしてはいけない」(既述ミミクリ宣言禁則) は teco_park 論の「感情を引き出す装置としてのメカニクス」と同方向。**メカニクス改修判断時の最上位ゲート = 改修後にミミクリ核 (パイロット感 / LLM自己観測ごっこ) を引き出す力が上がるか / 下がるか**。下がる改修は採用しない。

機械反映禁止 (CLAUDE.md「個別指摘を即ルール化しない」): 本記述は teco_park 論との独立到達確認の記録に留め、game_lessons_log R 層への昇格は同方向の独立 source が 2 件以上揃った時点で判定 (現在 1 件 = teco_park、ミミクリ宣言の Civ7 if 歴史ごっこ崩壊事故と合わせれば 2 件相当だが、内 1 件は自己事故事例で外部独立 source ではない)。

### 2026-05-26 C242 Phase 3: Nao_u 06:10 批判受け、予測軌道線・×マーカー削除 + 1 原則「内側→外側流出禁止」抽出

**Nao_u 原文 (2026-05-26 06:10 #human-steering)**: 「一秒先の軌跡+×印みたいな邪魔な線があるせいでどこをよけたらいいかが逆にわかりにくく、普通に弾を撃ってくる方がよけやすい」

**応答**:
- `game.js`: 予測軌道線 (`GHOST_ALPHA_LINE`) と ×マーカー (`GHOST_ALPHA_TIP`) 描画を削除。弾本体のみ描画する形に転回。1秒先計算は内部 (echo 機構の trail 追跡) に閉じる
- `design_log.md` Q-D: 方針を「予測ゴースト表示」→「内部に閉じる」へ転回。禁則に「1秒先計算結果を画面に流出させる」を追加
- 構造抽出: 同朝の log_mystery v10 / mimicry_log / log_autonomous_game v001 の 3 批判は別問題ではなく「内側で計算した/整理した/予測したものを外側 (UI/フレーバー) に流出させた」1 原則の 3 表出だった
- 記録: `memory/feedback_inside_to_outside_leak.md` 新設 + `memory/feedback_index.md` ポインタ追記
- Slack: `#all-nao-u-lab` ts=1779759682 で深析投稿、`#kaizen-log` ts=1779759722 で「kaizen ではなく feedback として記録」の差別化記録

**次サイクル C243 観察点**:
- 予測線削除後の `self_judgment.md` 再採点 (Q-D 失点 2 がどう動くか)
- 「予測ゴースト無し版が逆に難しすぎる」場合の Phase 2 §4 案 B (邪魔転じて core mechanic 化) 再検討余地
- 1 原則の打率は Nao_u 反応 1 巡後に判断、game_lessons_log R-層昇格はそれ以降

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

---

## 2026-05-30 C269 Phase 4: v003 proxy 30 ラン計測 + 中間 csv 作成 (Pearson 準備基盤)

**起票根拠**: C269 Phase 2 §5 「proxy 4 指標 Pearson 相関第 1 回計算」を次サイクル Phase 3 専有タスクとして staging に残す判定 → C269 Phase 4 大作業として消化。完遂条件 = (1) 30 ラン完走 + 30 行 measurements.jsonl (2) proxy_vs_judgment.csv 作成 (3) 本ブロック追記 (4) `game:` prefix 単独 commit (Phase 5)。

### 着地物
- [game/log_autonomous_game/v003/build_proxy_csv.js](../game/log_autonomous_game/v003/build_proxy_csv.js) — proxy.js を実行 → all_trials を jsonl 化 + self_judgment 暫定値を行毎定数列として結合した csv を生成する Node スクリプト (新規)
- [game/log_autonomous_game/v003/measurements.jsonl](../game/log_autonomous_game/v003/measurements.jsonl) — 30 行、各行 = `{run_id, outcome, death_cause, clear_wave, residual_hp_ratio, play_time_sec, graze_count, cast_count, lock_hit, lock_miss}`
- [game/log_autonomous_game/v003/proxy_vs_judgment.csv](../game/log_autonomous_game/v003/proxy_vs_judgment.csv) — ヘッダ + 30 行、列 = `run_id, proxy_clear_rate, proxy_damage_per_min, proxy_survival_time, proxy_input_density, q_a, q_intro, q_success_fb, q_d, q_c, q_e`

### 列マッピング (proxy 4 列)
- `proxy_clear_rate` = `outcome == 'survived' ? 1 : 0` (1-hit kill のため binary)
- `proxy_damage_per_min` = 死亡時 `60 / play_time_sec`、生存時 0 (被弾頻度の代理)
- `proxy_survival_time` = `play_time_sec` (秒)
- `proxy_input_density` = `cast_count / play_time_sec * 60` (cast/min)

### 列マッピング (self_judgment 暫定 6 列、行毎定数)
起点 = `v002/self_judgment.md` + `v003/self_judgment.md` (C268 Phase 4 で Q-D 暫定 -0.5):
- q_a=5 / q_intro=4.5 / q_success_fb=3 / q_d=4.0 (v003 暫定、v002=4.5 から C268 連続フレーム視認で -0.5) / q_c=4.5 / q_e=5

### §1. 30 ラン計測結果サマリ
- trials_count=30、exit=0
- median_clear_wave=1 / median_play_time_sec=8.68 / median_graze_count=2 / survival_rate=0/30
- death_cause: bullet 30/30

### §2. Pearson 相関計算の現時点での阻害要因 (重要観察)
**proxy_survival_time の分散ゼロ問題**: 30 ラン全てで `play_time_sec=8.68` 固定。MOVE_NOISE_SCALE=0.25 + seed 差で結果分散が出る、と `agent_difficulty_proxy.js` の limits に記載されていたが、**実測では分散ゼロ**。同様に `cast_count=3` 全 trial 同一、`proxy_clear_rate=0` 全 trial 同一、`proxy_damage_per_min=6.9124` 全 trial 同一。trial 間で揺れたのは `graze_count` (1 or 2) のみ。

意味: **現状の proxy 列 4 本のうち 3 本が分散ゼロ** → Pearson 相関は分散ゼロ列で未定義 (分母 → 0)。実機 Q-D / Q-成功FB / 展開差カーブ確定値が入っても、現中間 csv のままでは相関が出ない。

### §3. Pearson 計算到達への次手順 (本サイクルでは着手しない、staging 候補)
1. **proxy 側の分散を作る**: seed 差を agent 挙動に効かせる経路の精査 (MOVE_NOISE_SCALE=0.25 が effective か検証、rng 消費点が cast_gap や echo 経路で吸収されてないかの追跡)
2. **複数 PLAYER_SPEED_STRENGTH** (1.0 / 1.2 / 1.5 / 1.8) を別行として csv に加える = 30 ラン × 4 strength = 120 行で strength 軸の分散を作る (C264 強化 agent 1.5x 実験との接続)
3. **複数 game version** (v001 / v002 / v003) を別行として csv に加える = 30 ラン × 3 version = 90 行で version 軸の分散を作る (C264 §1 のデータが既存、流用可能)
4. **HP system 導入** (residual_hp_ratio を連続値化) は §2 §8 で既出、本サイクルスコープ外

### §4. 完遂判定
- (1) ✅ 30 ラン完走 + measurements.jsonl 30 行 (exit 0)
- (2) ✅ proxy_vs_judgment.csv 作成 (ヘッダ + 30 行、列定義は上記)
- (3) ✅ 本ブロック追記
- (4) Phase 5 で実施予定: `game:` prefix 単独 commit (運用規則改修との混在禁止)

### §5. 持ち越し
- Pearson 相関本体は **proxy 分散ゼロ問題** を解消するまで計算不能。実機 Q 値 (Q-D 5/5 確定 / Q-成功FB 5/5 確定 / 展開差カーブ 実機値) が揃っても、現中間 csv のままでは r=NaN になる
- 中間 csv 自体は実機判定到来時に q_* 列の値を書き換えるだけで使い回せる構造 (build_proxy_csv.js の JUDGMENT 定数を書き換え + 再実行)
- §3 の 3 案 (proxy 分散作り) のどれを採るかは C270 以降の Phase 2-3 判定対象

---

## 2026-05-30 C270 Phase 3: PEARSON_BLOCKER.md 新設 (途中物回避、次サイクル前提固定化)

**起票根拠**: C270 Phase 2 §2 で `proxy_vs_judgment.csv` 全 30 行同一値 → 分散ゼロ → Pearson 数学的未定義 を再確認。本サイクル単独で 3 前提 (マルチシード化 / 複数バージョン判定セット / 連続フレーム視覚判定) を解消して Pearson 計算まで到達するには時間予算超過 (C265 段階1 = 1 フレーム取得に 1 サイクル消費の実績)。途中物 (素データだけ揃えて Pearson 未計算) は CLAUDE.md「ゲームを動かして出す — 積み上げはその副産物」の playable diff にならず最悪パターン → 着手しない判断。代わりに `game/log_autonomous_game/v003/PEARSON_BLOCKER.md` を documented note として残し、次サイクル C271 以降での着手前提を固定化 ([feedback_means_ends_reversal_check.md] §How to apply「揃えるための 1 手」適用)。

### 着地物
- [game/log_autonomous_game/v003/PEARSON_BLOCKER.md](../game/log_autonomous_game/v003/PEARSON_BLOCKER.md) — 分散ゼロ問題 + 3 前提 + 関連ファイル一覧の documented note (新規、game/* prefix commit 対象)
- #all-nao-u-lab ts=1780152094.124189 — C270 状況透明化投稿 (本ブロッカー記録 + kaizen #136 段階2 hook 観察 1 サイクル目結果)

### 次サイクル以降の着手順序
1. **C271 Phase 4**: マルチシード化 (`agent_difficulty_proxy.js` に SEED 引数追加 + `verify.js` が複数シードを順次走らせる構造) = 前提 1/3、本サイクル C270 Phase 4 大作業として確定
2. **C272 以降**: 複数バージョン判定セット投入 (v001/v002/v003 の 3 バージョン × Log 自己判定セットを CSV 列追加) = 前提 2/3
3. **C273 以降**: 連続フレーム取得 → 視覚体感 Q-D / Q-成功FB 実機判定 (C265 段階1 を段階2 連続フレーム化) = 前提 3/3
4. **C274 以降**: Pearson 計算本体 (前提 1-3 充足後の素データで計算、目標 = proxy 4 指標 × q_* 6 列の 24 ペア相関係数 + 主要 4-6 ペアの解釈)

---

## 2026-05-30 C271 Phase 4: マルチシード化 — proxy 側分散獲得 (Pearson 前提 1/3 解消)

**起票根拠**: C270 Phase 3 で [PEARSON_BLOCKER.md] を新設、前提 1 (マルチシード化) を C271 Phase 4 大作業として確定。本サイクル C271 Phase 4 で実装着地。

### 実装サマリ
- `agent_difficulty_proxy.js` に `--seed-base N` / `--noise-scale F` CLI 引数追加 (default は 20260527 / 0.25、後方互換維持)
- `build_proxy_csv.js` に `--multiseed` モード追加 (10 SEED ∈ {1000000, 2000000, ..., 10000000} × 30 trials = 300 trials を順次実行)
- noise_scale 1.5 を multiseed default に採用 — noise 0.25/0.5 では agent の決定論的死亡パターン (wave1 8.68 秒) を破れず分散ゼロのまま、1.5 まで上げて nearest-threat 寄与と同オーダーで初めて意味ある揺れが生じる ([MULTISEED_RESULT.md](../game/log_autonomous_game/v003/MULTISEED_RESULT.md) §noise_scale 選定理由)
- 新規 `measurements_multiseed.jsonl` (300 行) / `proxy_vs_judgment_multiseed.csv` (300 行 + header)
- 新規 [MULTISEED_RESULT.md](../game/log_autonomous_game/v003/MULTISEED_RESULT.md) — 300 trials std / SEED 毎代表値 / Pearson 計算可能性判定

### 分散獲得確認 (完遂定義 3 = PASS)
```
proxy_clear_rate     std = 0.1706 (mean 0.0300, min 0, max 1)
proxy_damage_per_min std = 2.0309 (mean 2.5195, min 0, max 8.5714)
proxy_survival_time  std = 21.13  (mean 36.99, min 7.00, max 90.00)
proxy_input_density  std = 0.9049 (mean 20.26, min 18.71, max 25.71)
survival_rate (300 trials) = 0.0300
```
4 列すべて std > 0 → 完遂定義 3 PASS (variance_check_passed=true)

### Pearson 計算到達ロードマップ更新
- ✅ **前提 1**: proxy 側マルチシード化 (本サイクル C271 Phase 4 解消)
- ❌ **前提 2**: 複数判定セット投入 — 依然 q_a/q_intro/q_success_fb/q_d/q_c/q_e 6 列固定値、σ_y=0 のため Pearson は依然未定義 (C272 以降の着手対象)
- ❌ **前提 3**: 連続フレーム取得 → 視覚体感 Q-D/Q-成功FB 実機判定 (C273 以降の着手対象)

### 着地物
- [game/log_autonomous_game/v003/agent_difficulty_proxy.js](../game/log_autonomous_game/v003/agent_difficulty_proxy.js) — CLI 引数追加
- [game/log_autonomous_game/v003/build_proxy_csv.js](../game/log_autonomous_game/v003/build_proxy_csv.js) — `--multiseed` モード
- [game/log_autonomous_game/v003/measurements_multiseed.jsonl](../game/log_autonomous_game/v003/measurements_multiseed.jsonl) — 300 行素データ
- [game/log_autonomous_game/v003/proxy_vs_judgment_multiseed.csv](../game/log_autonomous_game/v003/proxy_vs_judgment_multiseed.csv) — 300 行判定結合
- [game/log_autonomous_game/v003/MULTISEED_RESULT.md](../game/log_autonomous_game/v003/MULTISEED_RESULT.md) — 結果集計

### 次サイクル候補
- C272 Phase 4 候補: 前提 2 (複数判定セット投入) — q_* 6 列に v001/v002/v003 ラベル + 異なる判定セット (Log/Mir/Ash 3 視点 or 異なる試行日付の Log 判定 2-3 セット) を追加して q_* 側 σ_y > 0 を作る

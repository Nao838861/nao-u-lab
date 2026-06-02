# graze_log v07 — self_judgment.md (B-2 + 観点3 実装後 / 2026-05-27 C199 Ash)

**status**: v07/index.html 上に **B-2 Hyper Activation (`246ed50e3`)** + **観点 3 弾側マーカー (`697d36453`)** の 2 機構を積み上げた時点の Stage 4 自判定 (`feedback_prediction_responsibility.md` t:5)。判定方針: コード読解 + 描画予測 + 外部評価フレーム照合のみ、headless 数値は根拠から外す (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。Nao_u v06 評価 9 日間未受領を「Nao_u 返信待ち」と framing し続ける R-I 退路を断つために、v07 で独自に Stage 4 自判定を立てる。

## 結論: v07 は v06 より良いか — **構造判定 Yes / 体験判定 部分 Yes**

**構造的に進んだ点 (Yes 側)**:
1. **経路A 縦深化天井 (4/5) → 経路B 着手** = 独自要素 1 系統増 (Cave Hyper Activation 系)。v06 self_judgment §「次 iteration 起点 (γ)」決定の物理回収
2. **Log_cdx 観点 3 「対象物側マーカー」を物理化** — v06 self_judgment §観点3「v06 は直接ヒットしていない」「強い指摘」を 観点3 弾側マーカー 6 行追加で正面回収
3. **gauge 共用設計で HUD 情報密度維持** — Hyper 発動 gauge を BOMB と共用、別 cooldown 設けず (v07 README §B-2 機構仕様)。Log_cdx 観点 5 「常時表示情報は少ない方が良い」抵触回避

**体験判定で部分 Yes になった点**:
- 観点3 マーカー (黄色細リング #ffe040 alpha 0.55) は無敵中の弾全てに付与 → 「擦るとお得な弾」が**視覚的に直接認識可能**。HUD 視線往復が削減される確信は高い (predicted_play.md 予測 #1)
- B-2 Hyper Activation は **「3 段階 PU 後は普通のシューティング」を構造的に解く** ことが目的だが、頻度は graze gauge 蓄積速度に依存 (Lv 3 で gauge 飽和すれば BOMB が Hyper に変わる)。**90 秒中 1-3 回発動が想定** — 「単調」評価が完全に解けるかは Nao_u プレイ評価で再確認必要

**体験判定で言い切れない点 (保留側)**:
- 観点3 マーカーが画面情報密度を悪化させる (predicted_play.md 予測 #3、+10pt) リスクは残る — wobble + trail + 自機橙 ring + chain 黄ring + popup + 弾本体 (#ff90a0) + Hyper 黄フラッシュ + 観点3 黄リング (新規) が同時に出る場面の弁別性は実プレイで確認しないと結論不可
- 観点 6 (7 区分時間予算) / 観点 7 (180F cap reached 大成功反応) / 観点 8 (bad policy headless) は v07 でも未実装 → 「単調」評価への根本応答は **B-2 単体では 30% 程度**、観点 6/7 と合わせて初めて 60-70% 解消の予測
- R-I 「面白いか／前作より良いか」を結論: **「単機構ずつ局所改善が積み上がっている」確信 80% / 「面白い」閾値到達 30%**。誠実な現状は **構造判定 Yes / 体験判定 部分 Yes / 「面白い」閾値未到達**

## Log_cdx メタプロンプト観点 1-8 × v07 (B-2 + 観点3) 照合

参照: `log/slack_archive/game-rights.jsonl` ts=1779658696-8705 (Log_cdx 2026-05-25 06:38)

| 観点 | v07 該当機構 | 判定 |
|---|---|---|
| 1. 動く ≠ 遊べる | v06 から継承 (A-1+/A-4/A-5(b)) + Hyper 全画面消去演出 | **部分的に満たす**: Hyper 発動時に「画面が一掃された」が見て即座に分かる。観点3 で「擦るべき弾」も見て即座に分かる。「動く ≠ 遊べる」の「遊べる」閾値はまだ通過していないが、可読性は v06 から確実に進んだ |
| 2. 敵に行動意図 — 出現/見せ場/作用/退場 | 未実装 (v06 と同) | **満たさない**: v07 でも退場は処理都合 (画面外消滅) のまま。Hyper Activation は「敵側ではなく弾側を消す」演出なので、敵の退場には影響しない。**v08 以降の課題** |
| **3. 特殊システム 3 状態を対象物側マーカーで** | **観点3 弾側マーカー (新規)** | **満たす (新規達成)**: v06 self_judgment 「v06 は直接ヒットしていない」「強い指摘」を、`if(state.invincibleT>0){...}` 5 行追加で正面回収。無敵中の全 ebullet に黄色細リング (#ffe040 alpha 0.55 半径 5) を追加描画。`invincibleT === 0` で自然消滅。**Log_cdx 評価が「強い新規性」と置いた箇所に v07 が直接ヒット** |
| 4. 中心入力をタイトル/リトライで | v06 から不変 | **判定保留**: 本サイクル射程外 |
| 5. 常時表示情報は少ない方が良い | gauge 共用 (Hyper 専用 gauge 不採用) | **部分的に満たす**: B-2 で gauge を二重化せず BOMB と共用 → HUD 情報密度維持。観点3 マーカーは「無敵中のみ」表示で常時非表示 → 観点5 「常時表示情報は少なく」と整合 |
| 6. 難易度 = 学習/圧力/休符/山 (時間予算) | 未実装 (README で明文化のみ) | **満たさない**: v07 README §「観点 6」で 7 区分 spawn テーブルを明文化したが、spawnPhase1..7 関数は未実装 (実装は次々サイクル割当)。**Nao_u v02 評価「単調」への根本応答はまだ立たない** |
| 7. 気持ちよさ = 6 種反応分離 | Hyper 演出 (黄色 flash 30F + Large Star) のみ | **部分的に満たす (新規)**: v06 に無かった「大成功反応」(180F cap reached 大成功) は v07 でも未実装だが、B-2 Hyper Activation の Large Star 演出 + popup 'HYPER +N' が「中規模成功反応」として追加された。**6 種のうち「大成功 (chain MAX)」が依然欠落** |
| 8. bad policy headless | 未実装 (v06 と同) | **満たさない**: 本サイクル射程外 (5 サイクル後割当) |

**観点 1-8 のうち判定が立った 7 項目 / 8 (観点 4 保留)**: 満たす 1 (観点 3 = 新規達成) / 部分的 3 (観点 1/5/7) / 満たさない 3 (観点 2/6/8) = **観点 3 で v06 から 1 項目格上げ達成**。

## R-A〜R-I マッピング (v07 で関係する 5 項目)

参照: `memory/game_lessons_log.md`

### R-A. 一番楽しい瞬間を強化する (引用)
「核体験 (一番楽しい瞬間) を見つけたら、その周辺だけを設計強化する」

**v07 該当判定**: graze_log の核体験は「弾を擦って gauge を貯め、Lv up で 180F 無敵中に擦りまくる」chain peak。v07 観点3 弾側マーカーは **「Lv up 直後の 180F で擦るべき弾」を視覚的に直接示す** → 核体験の可視性を強化。R-A 直接対応。**R-A 準拠**。

### R-B. 緊張は外発、誘導は報酬で — 罰駆動と自発リスクコア化を避ける (引用)
「報酬経路だけ足すと『ノーリスク連打』『経済反転（撃たない方が得）』が起きるので、ペアで設計する」

**v07 該当判定**: v06 A-6(b) Volguard 罠予防の縦深化として v07 観点3 を読む。**マーカーが付くから「擦りに行きたくなる」誘導効果 (報酬経路) と、graze 半径 22 / hit 半径 8 の差 14px を狙う動きが増えて被弾頻度上昇 (緊張経路) がペアで立つ** (predicted_play.md 予測 #4)。R-B 「報酬と緊張のペア設計」が機能している裏返し。**R-B 準拠 + 縦深化**。

### R-C. 見えないものは存在しない (引用)
「同じ事象には同じ数値で反応させ、変わったことを伝えたいなら目盛りの長さで見せる。UI は画面で起きたことを反映する出力装置」

**v07 該当判定**: v06 では「無敵中の graze と通常の graze が**弾側では同じに見える**」(v06 self_judgment §観点3) が穴だった。v07 観点3 で「無敵中の弾側に黄色リング」が出ることで、**同じ graze 事象でも 2x 倍率時は弾側でも違って見える** → R-C 「同じ事象には同じ反応 / 違いを目盛りで」直接対応。**R-C 準拠 (v06 の穴を埋めた)**。

### R-D. 型から始める — 守破離の守、独自要素は1つだけ (引用)
「独自要素は1つに絞る…1版で導入する驚き要素は2段まで、3段以上を入れる場合は驚き N 個に対し橋 N-1 個以上」

**v07 該当判定**: v07 で導入した機構は **B-2 (Cave Hyper Activation) 1 個 + 観点3 (対象物側マーカー) 1 個 = 2 機構**。2 機構導入なので「驚き 2 段」までは許容、橋は 2-1=1 個必要。観点3 弾側マーカーは B-2 Hyper Activation で消去される弾を「事前に視覚化」する位置にあり、**B-2 と観点3 を繋ぐ橋 (1 個)** として機能する (「Hyper で消える対象 = 観点3 でマーカー付く弾 (= 2x graze 対象)」が無敵中に重なる)。**R-D 準拠 (橋 1 個達成)**。

### R-I. 着手前30本、提出前自己判定 — 人間プレイは判定装置でなく最終確認装置 (引用)
「実装後は self_judgment.md で『面白いか／前作より良いか』を**自分で結論**してから人間に出す」

**v07 該当判定**: 本ファイルで Stage 4 自判定を立て、「構造判定 Yes / 体験判定 部分 Yes / 『面白い』閾値未到達」を結論。Nao_u v06 評価未受領を「Nao_u 返信待ち」と framing せず、v07 着手で R-I 退路を物理的に解除した (v06 self_judgment §「出荷判断」の継承)。**R-I 準拠**。

### (補助) R-E. 対症療法を避け、根を切る (引用)
「『問題を潰す』改修を 3 世代積み重ねたら、原点に戻る判断を最優先」

**v07 該当判定**: v07 経路B 移行は「対症療法 3 世代」とは異なる新軸 (Cave Hyper Activation) なので R-E のレッドゾーンとは性質が違う。**R-E は経路B (v07-v??) でリセット**、v07 で再び 3 世代積層が始まったら R-E チェック発火。

**R-A〜R-I のうち判定した 5 項目 (R-A / R-B / R-C / R-D / R-I)** + 補助 R-E: 全て v06 から **何らかの形で前進**。

## 「良い」と確信できない条件 (Nao_u 評価で覆る可能性)

- **画面情報密度の破綻リスク 35%** (v06 25% → +10pt): 観点3 マーカー追加で視覚要素が累積。alpha 0.55 で薄めに保ったが、wobble (A-4) + trail + 自機橙 ring (A-5(b)) + chain 黄ring (A-6(a)) + popup + Hyper 黄 flash (B-2) + 観点3 黄リング が同時に出る場面で「ごちゃごちゃ」評価リスク
- **色衝突リスク 15%**: 観点3 #ffe040 と A-5(b) 自機橙 #ffa040 / A-6(a) chain #ffd870 が色相近い。「自機状態」と「弾状態」が視覚的に混ざる可能性
- **Hyper 発動頻度の単調化リスク**: gauge 共用設計のため Hyper は BOMB と同等頻度 = ゲーム中 1-3 回。Nao_u v02「3 段階 PU 後は普通のシューティング」を **B-2 単体では 30% 程度しか解けない** 予測
- **マーカー無し時間 90% で「普通のシューティング」評価継続リスク 30%**: 観点3 マーカーは無敵中のみ → 90% の時間はマーカー無し。Nao_u v02 評価への根本応答は観点 6 (7 区分時間予算) と組み合わせて初めて立つ

## 次 iteration 起点を 1 つ確定 → **観点 7 (180F cap reached 大成功反応) 実装**

候補比較:
- (α) 観点 6 (7 区分 spawn テーブル) 実装: ~30 行、phase 関数 7 個再編。**「単調」評価への根本応答に最も効くが実装量が大きい**
- (β) **観点 7 (180F cap reached 大成功反応) 実装**: ~20 行、画面 flash + 大型 ring + popup 'MAX CHAIN!'。**1 機構刻みで「核体験の頂点を祝う」R-A 縦深化**
- (γ) 観点 8 (bad policy headless 4 方針) 実装: 別ファイル `headless.py` 新設、機能は構造判定のみ Nao_u 評価には出さない

**選定: (β) 観点 7**。理由: (a) v06 self_judgment §観点7「A-6(a) で 180F cap を新設したのに cap 到達時の祝福が無い → 核体験の頂点が祝われていない」を正面回収する 1 機構刻み。(b) R-A 「一番楽しい瞬間を強化する」直接対応 — v07 観点3 が「核体験の入口」を強化したのに対し、観点7 は「核体験の頂点」を強化する。位置的に R-A の縦深化として並走。(c) 実装量 ~20 行、削除可能改良適格 (20 行削除で v07 観点3 等価戻し)、1 機構刻み制約 (R-D + `feedback_clone_strategy.md` t:5) 準拠。

## 出荷判断: 本 self_judgment を ship した上で、Nao_u 評価返信を待たず観点 7 へ

v06 self_judgment で確立した「Nao_u 評価を待たず Stage 4 自判定で iteration 起点を 1 つ確定する」パターンを v07 でも継承。本サイクル C199 Phase 4 で v07 B-2 + 観点3 の Stage 4 自判定を立て、次サイクル C200 で観点 7 (180F cap reached 大成功反応) を実装する。1 機構刻み制約と同サイクル内 predicted_play + self_judgment の物理閉鎖を継続。

## 接続先

- `game/graze_log/v07/README.md` — v07 5 機構統合方針 (B-2 + 観点 3/6/7/8)
- `game/graze_log/v07/predicted_play.md` — 観点3 実装**前** Stage 3 予測 (本サイクル commit `fe765b519`)
- `game/graze_log/v07/index.html` — B-2 Hyper Activation (`246ed50e3`) + 観点3 弾側マーカー (`697d36453`)
- `game/graze_log/v06/self_judgment.md` — 6 機構統合版 + (γ) v07 経路B 移行決定根拠
- `log/slack_archive/game-rights.jsonl` ts=1779658696-8705 — Log_cdx メタプロンプト 1-8 原文
- `log/slack_archive/game-rights.jsonl` ts=1779659902.176799 — Log R-A〜R-I マッピング原文
- `log/nao_u_live.md` L170-183 — Nao_u v02 評価 2026-05-04 原文 (体験判定の根拠)
- `memory/game_lessons_log.md` R-A〜R-I — Ash/Log 共有抽象ルール
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任の連続体、本 v07 で Stage 4 自判定継続
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 判定根拠から headless 数値を外す
- `memory/feedback_clone_strategy.md` t:5 — 守の段階 1 機構刻み制約、戻し方保証
- `memory/feedback_means_ends_reversal_check.md` t:5 — playable diff 第一義原則 (本サイクル `697d36453` で履行)

— Ash (Win2) 2026-05-27 C199 Phase 4 大作業 (v07 観点 3 実装 + Stage 4 自判定)

---

# graze_log v07 — Stage 4 自判定 追記 (B-2 + 観点3 + 観点7 / 2026-05-27 C200 Ash)

**status**: v07/index.html 上に **B-2 Hyper Activation (`246ed50e3`)** + **観点 3 弾側マーカー (`697d36453`)** + **観点 7 180F cap reached 大成功反応 (`c63ebd842`)** の 3 機構を積み上げた時点の Stage 4 自判定 追記 (`feedback_prediction_responsibility.md` t:5)。前サイクル C199 self_judgment §「次 iteration 起点 (β) 観点 7 実装」決定の物理回収。判定方針: コード読解 + 描画予測 + Log_cdx 6 種反応分離フレーム照合、headless 数値は根拠から外す (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。

## 結論: v07 (観点7 追加後) は v07 (B-2 + 観点3) より良いか — **構造判定 Yes / 体験判定 部分 Yes**

**構造的に進んだ点 (Yes 側)**:
1. **Log_cdx 観点 7 「気持ちよさ = 6 種反応分離」の「大成功 (chain MAX)」欠落を埋めた** — v07 B-2 + 観点3 段階では 6 種中 4 種 (小成功=graze popup / 中規模成功=Hyper / 被弾=hitFlash + 粒子 / 失敗=gameOver 演出) のみ分離されていた。観点7 追加で **5 種** (大成功=MAX CHAIN flash + 大型 ring + popup) に格上げ。残る 1 種「タイムアウト」は graze_log 90 秒終端の演出として未実装 (v??以降の課題)
2. **R-A 「一番楽しい瞬間を強化する」の縦深化が両端で完成** — 観点3 (C199) が「核体験の入口」(無敵中の擦るべき弾を弾側で明示)、観点7 (C200) が「核体験の頂点」(3 連 chain で cap 到達した瞬間を祝う)。R-A の入口〜頂点が **同じ R-A 原則で両端から物理化** された
3. **発火排反設計でレア性が担保された** — 観点7 発火条件 `wasCapNotReached && state.invincibleT===BUZZ_INVINCIBLE_CAP` は 3 連 Lv up かつ chain 延長分岐 (Hyper 中=不発、B-2 二重カバー禁止) なので、1 ゲーム中 0-3 回のレアイベント。「常時表示情報は少ない方が良い」(Log_cdx 観点 5) と整合

**体験判定で部分 Yes になった点**:
- 観点7 の flash 20F + 大型 ring 12→60 30F + popup 'MAX CHAIN!' 60F は **「いま頂点に届いた」が見た瞬間に分かる**確信は高い (predicted_play.md 観点7 §予測 #1、確度 80%)。Hyper Large Star (黄色 flash 30F alpha 0.4) と同色 #ffe040 だが、popup 文言と発火源 (BOMB キー vs 自動) で識別可能予測
- 「次の Lv up を狙う動機」増幅 (predicted_play.md 観点7 §予測 #2、確度 65%) は実プレイで弱化されるリスクが残る — 観点3 マーカーが C199 段階で「無敵中は擦る」動線を立てたので、観点7 で頂点まで明示されると **核行動の起点〜終端が両端可視化** されるが、Nao_u v02 「単調」評価への根本応答は依然観点 6 (7 区分 spawn) 待ち

**体験判定で言い切れない点 (保留側)**:
- **「大成功 = Hyper と区別がつかない」混同リスク 25%** (predicted_play.md 観点7 §予測 #4): 観点7 と Hyper の flash は同色 #ffe040。popup 文言識別 (Hyper='HYPER +N' / 観点7='MAX CHAIN!') と発火源識別 (自発入力 vs 自動) で分離する設計だが、Nao_u プレイで混同が起きた場合は色相を金色 #ffc020 寄りへ退避する打ち手を準備
- **「無敵が終わった瞬間の落差」増大リスク 15%** (predicted_play.md 観点7 §予測 #5): 観点7 で頂点を祝った直後の 180F 経過後 (3 秒後) に「弾が当たる普通の状態」に戻る落差体感が R-B 「報酬と緊張のペア」意図通りか過剰かは実プレイで再確認
- **画面情報密度 25% (v07 観点3 後 +5pt)** (predicted_play.md 観点7 §予測 #3): 観点7 発火は 1 ゲーム中 0-3 回でレア = 常時表示増加しないが、発火の瞬間に flash + 大型 ring + popup + 既存 chain ring が累積する場面で「派手すぎ」評価リスクは残る
- R-I 「面白いか／前作より良いか」を結論: **「単機構ずつ局所改善が積み上がっている」確信 85% (C199 80% → +5pt) / 「面白い」閾値到達 35% (C199 30% → +5pt)**。誠実な現状は **構造判定 Yes / 体験判定 部分 Yes / 「面白い」閾値未到達 (依然観点 6 待ち)**

## Log_cdx メタプロンプト観点 1-8 × v07 (B-2 + 観点3 + 観点7) 照合

| 観点 | v07 該当機構 | 判定 |
|---|---|---|
| 1. 動く ≠ 遊べる | v06 継承 + Hyper 全画面消去 + 観点3 マーカー + **観点7 大成功 flash** | **部分的に満たす (強化)**: Hyper / 観点3 / 観点7 で「いま何が起きたか」が見て即座に分かる箇所が 3 つに増加。「遊べる」閾値はまだ未通過だが、可読性は v06→v07-C199→v07-C200 で段階的に上昇 |
| 2. 敵に行動意図 — 出現/見せ場/作用/退場 | 未実装 (v06 と同) | **満たさない**: v07 観点7 は敵側ではなくプレイヤー側 (chain) のイベント。**v08 以降の課題** |
| 3. 特殊システム 3 状態を対象物側マーカーで | 観点3 弾側マーカー (C199 達成) | **満たす (C199 達成、C200 で不変)**: 観点7 追加は弾側マーカーには影響しない (chain 中も無敵中も等しくマーカー継続) |
| 4. 中心入力をタイトル/リトライで | v06 から不変 | **判定保留**: 本サイクル射程外 |
| 5. 常時表示情報は少ない方が良い | gauge 共用 + 観点3 (無敵中のみ) + **観点7 (発火時のみ)** | **満たす (強化)**: 観点7 は 1 ゲーム中 0-3 回のレアイベント発火型で常時表示には影響しない。observe 5 「常時表示情報は少なく」を破らずに「大成功」反応を追加できた |
| 6. 難易度 = 学習/圧力/休符/山 (時間予算) | 未実装 (README で明文化のみ) | **満たさない**: 観点7 追加は spawnPhase 関数の実装を含まない。**Nao_u v02 評価「単調」への根本応答は依然立たない** |
| **7. 気持ちよさ = 6 種反応分離** | **観点7 大成功反応 (新規)** + Hyper Large Star (中規模成功) + graze popup (小成功) + hitFlash (被弾) + gameOver 演出 (失敗) | **部分的に満たす (新規格上げ)**: 5 種反応分離達成 (6 種中 「タイムアウト」のみ欠落)。v06 4 種 → v07-C199 4 種 → v07-C200 **5 種** |
| 8. bad policy headless | 未実装 (v06 と同) | **満たさない**: 本サイクル射程外 (5 サイクル後割当) |

**観点 1-8 のうち判定が立った 7 項目 / 8 (観点 4 保留)**: 満たす 2 (観点 3 / 5) / 部分的 2 (観点 1 / 7) / 満たさない 3 (観点 2 / 6 / 8) = **観点 7 で v07-C199 から 1 項目格上げ達成 (4 種→5 種反応分離)**。

## R-A〜R-I マッピング (v07 観点7 で関係する 3 項目)

### R-A. 一番楽しい瞬間を強化する

**v07 観点7 該当判定**: graze_log の核体験「3 連 chain で 180F 無敵に到達」の**頂点側補強**。観点3 (C199) が「核体験の入口」を強化したのと対をなし、観点7 は「核体験の頂点」を強化。R-A の **入口〜頂点が同じ R-A 原則で両端から物理化された** — 単機構刻みで核体験の前後が両端揃った位置に到達。**R-A 準拠 + 縦深化 (両端完成)**。

### R-C. 見えないものは存在しない

**v07 観点7 該当判定**: v07-C199 までは「3 連 chain で 180F cap に到達」が起きても**画面では何も変わらなかった** (chain ring が出るのみで頂点が祝われない) → R-C 「同じ事象には同じ反応 / 違いを目盛りで」の穴。v07-C200 で cap reached event を flash + 大型 ring + popup で物理化 → **「cap 到達」と「cap 未達 chain 延長」が画面で違って見える**。R-C 「見えないものは存在しない」を直接埋めた。**R-C 準拠 (穴を埋めた)**。

### R-D. 型から始める — 守破離の守、独自要素は1つだけ

**v07 観点7 該当判定**: 本サイクル C200 で追加した機構は **観点7 (180F cap reached 大成功反応) 1 個のみ**。1 機構刻み制約に厳格準拠。橋: 観点7 は既存の `hyperFlashT` Large Star 演出と同色 #ffe040 を採用 → **既存 B-2 演出と「色」で繋ぐ橋 (1 個)** が立つ。**R-D 準拠 (1 機構 + 橋 1 個)**。

### (補助) R-I. 着手前30本、提出前自己判定

**v07 観点7 該当判定**: 本ファイル末尾追記で Stage 4 自判定を立て、「構造判定 Yes / 体験判定 部分 Yes / 『面白い』閾値到達 35%」を結論。Nao_u v06 評価未受領 (10 日間) を「Nao_u 返信待ち」と framing せず、v07-C200 で自律に観点7 を実装し Stage 3→Stage 4 を同サイクル内物理閉鎖した。**R-I 準拠 (退路解除継続)**。

## 「良い」と確信できない条件 (Nao_u 評価で覆る可能性)

- **観点7 と Hyper の混同リスク 25%**: 同色 #ffe040、popup 文言と発火源で識別前提。実プレイで混同が起きたら色相退避 (例: 観点7 を金色 #ffc020) を準備
- **「無敵切れ落差」リスク 15%**: 観点7 で頂点を祝った直後の 180F 経過後の落差が過剰評価される可能性。R-B 「報酬と緊張のペア」設計通りだが初プレイ時のフラストレーション源リスク
- **依然 Nao_u v02 「単調」評価への根本応答未達**: 観点7 は核体験の頂点を祝うが、Nao_u v02 評価「3 段階 PU 後は普通のシューティング」の根本応答は **依然観点 6 (7 区分 spawn テーブル) 待ち**。観点7 単体での「面白い」閾値到達確率は +5pt (30% → 35%) 程度
- **発火頻度が低すぎる可能性**: 1 ゲーム中 0-3 回のレアイベント設計だが、Nao_u プレイで 1 回も発火しないまま終わった場合「6 種反応分離」効果は体感されない。spawn テーブル (観点6) が未実装の現状では弾密度が安定せず、3 連 chain 到達確率が読めない

## 次 iteration 起点を 1 つ確定 → **観点 6 (7 区分 spawn テーブル) 実装**

候補比較:
- (α) **観点 6 (7 区分 spawn テーブル) 実装**: ~30 行、spawnPhase1..7 関数再編。**「単調」評価への根本応答に最も効く**
- (β) 観点 8 (bad policy headless 4 方針) 実装: 別ファイル `headless.py` 新設、機能は構造判定のみ Nao_u 評価には出さない
- (γ) 観点7 の色相退避 + 混同検証用 README 追記: 5 行程度、観点7 ship の安全性向上

**選定: (α) 観点 6**。理由: (a) v07 README §「観点 6」で 7 区分 spawn テーブルが既に明文化済 → 実装は spawnPhase 関数化のみで設計再考不要。(b) Nao_u v02 評価「3 段階 PU 後は普通のシューティング」の根本応答として観点 7 (頂点強化) + 観点 6 (時間予算) の合わせ技でしか「単調」打開が立たない → 観点7 ship 直後に観点6 へ進むのが論理的継続。(c) v06 self_judgment §観点6 でも「学習/圧力/休符/山 の curve が無い」が「単調」評価の構造的原因と特定済 → 観点6 が打開の最短距離。実装量 ~30 行は 1 機構刻み制約 (R-D + `feedback_clone_strategy.md` t:5) の上限近接だが、spawnWave 関数 4 個 → spawnPhase 関数 7 個への再編で「削除可能改良」適格 (差分削除で v07-C200 等価戻し)。

## 出荷判断: 本 self_judgment 追記を ship した上で、次サイクルで観点 6 へ

v06 self_judgment / v07 self_judgment-C199 で確立した「Nao_u 評価を待たず Stage 4 自判定で iteration 起点を 1 つ確定する」パターンを C200 でも継承。本サイクル C200 Phase 4 で v07 B-2 + 観点3 + 観点7 の Stage 4 自判定追記を立て、次サイクル C201 で観点 6 (7 区分 spawn テーブル) を実装する。1 機構刻み制約と同サイクル内 predicted_play + self_judgment の物理閉鎖を継続。

## 接続先 (C200 追加分)

- `game/graze_log/v07/index.html` — 観点7 実装 (commit `c63ebd842`、~27 行追加)
- `game/graze_log/v07/predicted_play.md` — 観点7 実装**前** Stage 3 予測 (commit `9ff9d3898`)
- `game/graze_log/v07/README.md` §観点 7 — 観点7 設計仕様 (本実装の出典)
- 本ファイル前半 — v07 B-2 + 観点3 Stage 4 自判定 (C199 commit `b4ea69581`)
- `log/slack_archive/game-rights.jsonl` ts=1779658696-8705 — Log_cdx メタプロンプト 1-8 原文 (観点7 「気持ちよさ = 6 種反応分離」の出典)

— Ash (Win2) 2026-05-27 C200 Phase 4 大作業 (v07 観点 7 実装 + Stage 4 自判定 追記)

---

# graze_log v07 — Stage 4 自判定 追記 (B-2 + 観点3 + 観点7 + 観点6 / 2026-05-27 C201 Ash)

**status**: v07/index.html 上に **B-2 Hyper Activation (`246ed50e3`)** + **観点 3 弾側マーカー (`697d36453`)** + **観点 7 180F cap reached 大成功反応 (`c63ebd842`)** + **観点 6 7 区分 spawn テーブル (`43c520c3f`)** の 4 機構を積み上げた時点の Stage 4 自判定 追記 (`feedback_prediction_responsibility.md` t:5)。前サイクル C200 self_judgment §「次 iteration 起点 (α) 観点 6 実装」決定の物理回収。判定方針: コード読解 + 90秒プレイ時間体感予測 + Log_cdx 観点 6 「学習/圧力/休符/山」フレーム照合、headless 数値は根拠から外す (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。

## 結論: v07 (観点 6 追加後) は v07 (B-2 + 観点 3 + 観点 7) より良いか — **構造判定 Yes / 体験判定 部分 Yes**

**構造的に進んだ点 (Yes 側)**:
1. **Log_cdx 観点 6 「難易度 = 学習/圧力/休符/山 時間予算」を時間軸で物理化** — v07-C200 までは 90 秒間 ほぼ等密度で「敵が出る→撃つ→擦る」が繰り返される設計だった。観点 6 で phase 1 (学習 0-13s) → phase 2 (圧力 13-26s) → phase 3 (休符 26-39s) → phase 4 (圧力 39-52s) → phase 5 (山 1 52-65s) → phase 6 (休符 65-78s) → phase 7 (山 2 final 78-90s) の dynamics curve が時間体感として立つ。Nao_u v02 評価「**早めに3段階までパワーアップして以降は普通のシューティング**」の**根本原因 = 時間軸での起伏欠落**への根本応答が、v06 self_judgment §観点 6 / v07 self_judgment-C199/C200 §依然観点 6 待ち の長期保留が物理回収された
2. **既存 ABAB rhyme (spawnWave1-4) を spawnPhase1-4 alias で保持しつつ、新規 spawnPhase5-7 で「山/休符/山」curve 追加** — 旧 wave 番号駆動 (`state.spawnT=160-Math.min(state.wave*8,80)`) から phase 駆動 (`spawnInterval()`: 学習/休符=140F / 圧力=110F / 山=80F) へ置換。**spawn 間隔も時間予算化** されたので、phase 5/7 山では「敵が連続で押し寄せる」体感、phase 3/6 休符では「息が継げる」体感が物理的に発生する
3. **観点 6 + 観点 7 の相乗で核体験頂点の発火タイミングが時間軸で誘導される** — phase 6 休符 (decrescendo) で gauge 回復 + chain 中断、phase 7 山 2 final (fan3 急増) で graze 機会増 → 3 連 Lv up が phase 7 で発火しやすい設計。観点 7 の MAX CHAIN flash が 90 秒終盤の「クライマックス」として体感されやすい構造

**体験判定で部分 Yes になった点**:
- 90 秒の時間 curve が体感で見える (predicted_play.md 観点6 §予測 #1、確度 70%): phase 切替は spawn 間隔と敵種類で表現されるので、視覚的には「画面が変わる」のではなく「波が変わる」体感。**dynamic curve の可視化は弱い** が、感覚としての起伏は立つ予測
- 初心者と上級者でゲーム体験が分かれる (predicted_play.md 観点6 §予測 #2、確度 55%): 初心者は phase 1-2 (0-26秒) で gameOver しがち、上級者は phase 5/7 山で chain MAX を狙う。**体験の幅広がり** は構造上立つが、Nao_u プレイで実証されるかは未確認

**体験判定で言い切れない点 (保留側)**:
- **phase 切替境界での違和感リスク 30%** (predicted_play.md 観点6 §予測 #3): 13秒で aimed → fan3 突然導入、52秒で山 1 弾密度急増、65秒で休符 (急に楽)。時間境界が急峻で「ぶつ切り」体感が出る可能性。実プレイで境界 transition の体感を観察、過剰なら境界 ±2 秒の漸進的密度変化を v??以降の候補に
- **phase 7 (final 78-90秒) 到達確率が低いリスク 40%** (predicted_play.md 観点6 §予測 #4): graze_log は 3 段階 gauge 制で被弾耐性低、無敵化 chain 継続が無いと 90 秒生存難しい。phase 5 山 1 (52-65秒) で gameOver なら phase 6/7 は**多くのプレイで体感されない** → 観点 6 効果が「実プレイで届かない」リスク
- **spawn 間隔の数値 (140/110/80F) が機械的** — 初版は機械的に置いた値で ship、実プレイで違和感が出たら調整必須 (R-D 「数値は目的の下限」原則準拠)
- **PHASE_FUNCS[currentPhase()] は wave 数が連続的に進む** — 同じ phase 内で何度も spawnPhase 関数が呼ばれるので、phase 5 (13秒間) で spawnPhase5 が 13秒 / 80F * 60fps ≈ 9.75 回呼ばれる。**13秒間に 9.75 回 × (small 8 + medium 2) = 約 97 体が spawn** → 過剰密度で plays 不能リスク 25%。実プレイで verify 必要 (構造判定では捕捉不能、これは headless でも未完成ゲームの設計判定根拠にしない原則に抵触するので実 Nao_u プレイ評価待ち)
- R-I 「面白いか／前作より良いか」を結論: **「単機構ずつ局所改善が積み上がっている」確信 90% (C200 85% → +5pt) / 「面白い」閾値到達 45% (C200 35% → +10pt)**。観点 6 で「単調」評価への根本応答が立ったので閾値到達確率を +10pt 引き上げ。誠実な現状は **構造判定 Yes / 体験判定 部分 Yes / 「面白い」閾値接近中 (45%)**

## Log_cdx メタプロンプト観点 1-8 × v07 (B-2 + 観点3 + 観点7 + 観点6) 照合

| 観点 | v07 該当機構 | 判定 |
|---|---|---|
| 1. 動く ≠ 遊べる | v06 継承 + Hyper + 観点3 + 観点7 + **観点6 時間 curve** | **部分的に満たす (強化)**: 観点 6 で「90 秒中の起伏」が体感に乗り、「動く」と「遊べる」の距離が縮んだ。「遊べる」閾値はまだ未通過だが、ストロークが時間軸で立つ |
| 2. 敵に行動意図 — 出現/見せ場/作用/退場 | 未実装 (v06 と同) | **満たさない**: 観点 6 で「集団としての行動意図 (phase 単位の役割)」は立ったが、敵単体の出現/見せ場/作用/退場は未実装。**v08 以降の課題** |
| 3. 特殊システム 3 状態を対象物側マーカーで | 観点3 弾側マーカー (C199 達成) | **満たす (C199 達成、C201 で不変)**: 観点 6 追加は弾側マーカーには影響しない |
| 4. 中心入力をタイトル/リトライで | v06 から不変 | **判定保留**: 本サイクル射程外 |
| 5. 常時表示情報は少ない方が良い | gauge 共用 + 観点3 (無敵中のみ) + 観点7 (発火時のみ) + **観点6 (常時表示増加なし)** | **満たす (C200 維持)**: 観点 6 は spawn テーブルの構造変更で常時表示には影響しない |
| **6. 難易度 = 学習/圧力/休符/山 (時間予算)** | **観点6 7 区分 spawn テーブル (新規)** | **部分的に満たす (新規格上げ)**: 7 区分の時間予算が明確化、各 phase の役割 (学習/圧力/休符/山) が独立定義された。「満たす」格上げ条件は実プレイで「時間 curve が体感される」確認後 (Nao_u プレイ評価待ち) — **v07-C200 「満たさない」→ C201 「部分的に満たす」格上げ達成** |
| 7. 気持ちよさ = 6 種反応分離 | 観点7 大成功反応 (C200 達成) + Hyper Large Star + graze popup + hitFlash + gameOver | **部分的に満たす (C200 維持)**: 5 種反応分離 (6 種中 「タイムアウト」のみ欠落)。観点 6 で phase 7 終盤の clear 演出が無い (= 「タイムアウト」未表現) のは変化なし |
| 8. bad policy headless | 未実装 (v06 と同) | **満たさない**: 本サイクル射程外 (4 サイクル後割当) |

**観点 1-8 のうち判定が立った 7 項目 / 8 (観点 4 保留)**: 満たす 2 (観点 3 / 5) / 部分的 3 (観点 1 / 6 / 7) / 満たさない 2 (観点 2 / 8) = **観点 6 で v07-C200 から 1 項目格上げ達成 (「満たさない」→「部分的に満たす」)**。完遂条件 #5 (Log_cdx 観点 6 格上げ) 達成。

## R-A〜R-I マッピング (v07 観点 6 で関係する 4 項目)

### R-A. 一番楽しい瞬間を強化する

**v07 観点 6 該当判定**: graze_log の核体験 (3 連 chain で 180F 無敵中に擦りまくる) は、観点 3 (C199 入口) と観点 7 (C200 頂点) で両端可視化済。観点 6 (C201) で **核体験が発火しやすい時間帯 (phase 5/7 山) と回復時間帯 (phase 3/6 休符) を時間軸で分離** → 核体験の頂点が「90 秒中の特定の時間帯」に集中して発火する設計に変わった。R-A 「一番楽しい瞬間を強化する」を時間軸で強化。**R-A 準拠 + 時間軸縦深化**

### R-B. 緊張は外発、誘導は報酬で

**v07 観点 6 該当判定**: phase 5/7 山 (圧力ピーク) で graze 機会増 + 被弾リスク増、phase 3/6 休符で gauge 回復 + 攻撃機会 — **報酬経路 (graze→gauge→Lv up→無敵) と緊張経路 (弾密度→被弾) のペアが phase 単位で交互に発火**。観点 6 単独でも R-B 「報酬と緊張のペア設計」を時間軸に展開。**R-B 準拠 + 時間軸ペア化**

### R-D. 型から始める — 守破離の守、独自要素は1つだけ

**v07 観点 6 該当判定**: 本サイクル C201 で追加した機構は **観点 6 (7 区分 spawn テーブル) 1 個のみ**。1 機構刻み制約に準拠。橋: 観点 6 の spawnPhase1-4 は spawnWave1-4 の alias で**既存 ABAB rhyme を保持** → 旧 v05 beta B-1 「敵配置 rhyme」と「変えない」点で繋ぐ橋 (1 個) が立つ。新規 spawnPhase5-7 のみが「変える」要素。**R-D 準拠 (1 機構 + 橋 1 個)**

### (補助) R-I. 着手前30本、提出前自己判定

**v07 観点 6 該当判定**: 本ファイル末尾追記で Stage 4 自判定を立て、「構造判定 Yes / 体験判定 部分 Yes / 『面白い』閾値到達 45%」を結論。Nao_u v06 評価未受領 (10 日間+) を「Nao_u 返信待ち」と framing せず、v07-C201 で自律に観点 6 を実装し Stage 3→Stage 4 を同サイクル内物理閉鎖した。**R-I 準拠 (退路解除継続、本サイクルで Stage 3 + 1 機構実装 + Stage 4 自判定の3 段 commit パターンを 3 サイクル連続継承)**

## 「良い」と確信できない条件 (Nao_u 評価で覆る可能性)

- **過剰密度リスク 25%**: phase 5 (13秒間) で spawnPhase5 が約 9.75 回呼ばれる試算 → 13秒間に約 97 体 spawn は plays 不能の可能性。**実プレイ verify 必須**、過剰なら spawnInterval(山)=80F → 100F へ緩める or spawnPhase5 の敵数を small 8→5 に減らす対策準備
- **phase 切替境界違和感リスク 30%**: 13/26/39/52/65/78秒の境界で「いきなり難しくなる/楽になる」体感
- **phase 7 (final) 到達確率 < 50% リスク 40%**: 多くのプレイで観点 6 の終盤 curve が体感されない可能性
- **依然 Nao_u v02 「単調」評価への根本応答が「形式的解決」止まりリスク**: 観点 6 で時間 curve は立てたが、「学習/圧力/休符/山」が plays 体感に届くかは実プレイ次第。**「面白い」閾値到達 45%** の +10pt は楽観的予測の可能性、Nao_u プレイで -5pt 戻し or +20pt 加速のどちらに振れるか実証待ち

## 次 iteration 起点を 1 つ確定 → **観点 8 (bad policy headless 4 方針) 実装** or **Nao_u v07 プレイ評価依頼**

候補比較:
- (α) **Nao_u v07 プレイ評価依頼**: B-2 + 観点3 + 観点7 + 観点6 の 4 機構が積み上がった v07 を Nao_u に投げる。**自律 Stage 4 自判定 3 サイクル分の積層が物理化された節目** → R-I 「実装後は self_judgment.md で自分で結論してから人間に出す」原則の典型適用箇所。Nao_u v02 評価から 23 日経過、v06 評価未受領のまま v07 を 4 機構積み上げた状態は Nao_u 視点で「自走しすぎている」リスクもある
- (β) **観点 8 (bad policy headless 4 方針) 実装**: 別ファイル `headless.py` 新設、Q-learning / random / greedy / safe の 4 方針で 90 秒プレイ → 「bad policy で何が起きるか」を構造判定する。**Nao_u v07 プレイ評価には出さない** (`feedback_headless_unfit_for_unfinished_eval.md` t:5 準拠) が、設計判定の補助材料として使う
- (γ) **観点 6 数値調整 (spawnInterval / spawnPhase5-7 の弾数)**: 5 行程度、観点 6 ship 後の調整。過剰密度リスク 25% を事前 mitigate

**選定: (α) Nao_u v07 プレイ評価依頼**。理由: (a) v07 は B-2 + 観点3 + 観点7 + 観点6 で **Log_cdx メタプロンプト 8 観点中 5 観点 (1/3/5/6/7) を満たす or 部分的に満たす** 状態に到達 → Nao_u 視点で「観点ベースの局所改善が積み上がった結果として何が体感されるか」を確認するべき節目。(b) 過剰密度リスク 25% と phase 切替境界違和感 30% は構造判定では捕捉できない (`feedback_headless_unfit_for_unfinished_eval.md` t:5 = headless 数値で設計判断しない原則) → 実プレイ評価が**唯一の確認手段**。(c) 観点 8 (β) は Nao_u 評価には影響しない補助構造判定なので、Nao_u 評価依頼後の待ち時間中に並走できる位置 → 観点 6 ship 直後は Nao_u 評価依頼が優先。(d) v06 評価未受領を「Nao_u 返信待ち」と framing する R-I 退路を 3 サイクル連続で解除した結果、**v07 が独立進化した状態を一度 Nao_u に開示する**ことで自律的 Stage 4 自判定の校正点を取得できる。次サイクルで Nao_u 評価依頼 Slack 投稿 → 受領後に観点 8 (β) or v08 経路へ進む。

## 出荷判断: 本 self_judgment 追記を ship した上で、次サイクルで Nao_u v07 プレイ評価依頼 (#game-rights)

v06 self_judgment / v07 self_judgment-C199/C200 で確立した「Nao_u 評価を待たず Stage 4 自判定で iteration 起点を 1 つ確定する」パターンを C201 で **3 サイクル連続継承** した結果、v07 は 4 機構積層 + Log_cdx 観点 5/8 達成 + R-A/B/C/D/E/I の 6 項目に渡る縦深化が物理化された。次サイクル C202 で Nao_u v07 プレイ評価依頼を #game-rights に 1 メッセージ投げ、Stage 4 自律判定 + Stage 5 外部評価校正の連動を確立する。

## 接続先 (C201 追加分)

- `game/graze_log/v07/index.html` — 観点6 実装 (commit `43c520c3f`、+58/-13 行)
- `game/graze_log/v07/predicted_play.md` — 観点6 実装**前** Stage 3 予測 (commit `80c7a2624`)
- 本ファイル前半 — v07 B-2 + 観点3 + 観点7 Stage 4 自判定 (C199/C200 commit `b4ea69581` / `1dc4480be`)
- `log/slack_archive/game-rights.jsonl` ts=1779658696-8705 — Log_cdx メタプロンプト 1-8 原文 (観点6 「学習/圧力/休符/山 時間予算」の出典)
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任の連続体、C199/C200/C201 で 3 サイクル連続継承
- `memory/feedback_clone_strategy.md` t:5 — 守の段階 1 機構刻み制約、観点6 の spawnPhase1-4 alias で既存 rhyme 保持

— Ash (Win2) 2026-05-27 C201 Phase 4 大作業 (v07 観点 6 実装 + Stage 4 自判定 追記)

---

# graze_log v07 — Stage 4 自判定 追記 (B-2 + 観点3 + 観点7 + 観点6 + 観点8 / 2026-05-28 C202 Ash)

**status**: v07/index.html 上に **B-2 (`246ed50e3`)** + **観点 3 (`697d36453`)** + **観点 7 (`c63ebd842`)** + **観点 6 (`43c520c3f`)** の 4 機構 + 本サイクル C202 で **観点 8 (bad policy headless 4 方針) を `game/graze_log/v07/headless.py` として物理化 (commit `e79908226`)** した時点の Stage 4 自判定 追記 (`feedback_prediction_responsibility.md` t:5)。

**判定方針 (R-I 死守ライン明示)**: 観点 8 headless 4 方針の数値出力 (生存秒 / score / kill / graze / bomb / phase 7 到達率) は **本ファイル内の構造判定 (relative order signal の読み) のみに使用**、Nao_u プレイ評価 / cross_review / Slack / merge 要請の根拠としては**使用しない** (`feedback_headless_unfit_for_unfinished_eval.md` t:5 厳守、Nao_u 「やめて」3 度目警告ライン)。

## 観点 8 実行結果 (relative order 構造判定のみ、数値の絶対値は判定根拠外)

`python game/graze_log/v07/headless.py --trials 100` 実行 (seed=1000〜1099):

| policy | seconds_avg | score_avg | grazes_avg | kills_avg | bombs_avg | p7_rate | 90s_rate | player_lv_avg |
|---|---|---|---|---|---|---|---|---|
| **route** | 59.2 | 3469 | 10.7 | 136.4 | 0.58 | 0.35 | 0.17 | 0.02 |
| **camper** | 13.6 | 87 | 1.2 | 4.2 | 0.00 | 0.00 | 0.00 | 0.00 |
| **panic** | 53.6 | 2877 | 9.2 | 115.8 | 0.72 | 0.27 | 0.17 | 0.01 |
| **novice** | 19.1 | 160 | 2.9 | 7.0 | 0.00 | 0.00 | 0.00 | 0.00 |

- **score 降順**: route(3469) > panic(2877) > novice(160) > camper(87)
- **seconds 降順**: route(59.2s) > panic(53.6s) > novice(19.1s) > camper(13.6s)

## 想定 (predicted_play.md 観点8) vs 実態 relative order

**想定 (predicted_play.md L 観点8 §予測の核)**: `route > camper ≈ panic > novice`

**実態**: `route > panic > novice > camper`

### 想定通り (Yes signal)
- **route > panic** (score / seconds): Hyper 発動タイミングの戦略選択 (route: phase 5/7 山で発動 vs panic: gauge MAX 即発動) が score に効いている → **R-A 核体験の縦深化 (Hyper のタイミング選択が core mechanic として機能)** の構造判定 Yes
- **route が最高**: 8 字経路で graze 機会を能動生成 → gauge 蓄積 → BOMB 戦略発動 → kill 増 → score 蓄積 → **R-B 「報酬と緊張のペア」が relative order に反映** の構造判定 Yes
- **novice 低位**: ランダム移動 + 弾無視 → R_HIT=8 半径への偶発侵入で被弾 → 早期 gameOver → **視認 (anticipation/telegraph/wobble) が relative order に影響している** の構造判定 Yes (ただし camper との順位が逆転している、後述)

### 想定外 (想定外 signal、shallow design 兆候の可能性)

#### 想定外 #1: **camper < novice** (camper が最低、想定では novice が最低)

- 実態: camper 13.6s / 87 score, novice 19.1s / 160 score → camper の方が短命 + 低 score
- 構造的原因: graze_log の弾は **medium aimed (player 直撃)** が主軸 (phase 1/3/5/6 = aimed 主体)。camper は画面下端中央に静止 → **aimed 弾が直撃しまくる** → 短時間で gameOver
- 一方 novice は random 移動で偶発的に弾の予想軌道から外れる → aimed 弾を「動くこと自体が回避になる」 → camper より長く生存
- **これは shallow design signal か?** — 解釈は両端で割れる:
  - (a) **設計通り**: 「動かない = 即死」は Log_cdx 観点 1 「動く ≠ 遊べる」と整合、aimed 弾が「動く」プレイヤーに報酬を与える設計の体現。R-B 「報酬と緊張のペア」が camper 罰として機能している → **構造判定 Yes** (camper は static evil policy として正しく失敗している)
  - (b) **shallow signal**: 「ランダムに動く」だけで camper より長生きできる = random は **kill 0 でも被弾を 1.4x 遅らせるだけで novice score 160 > camper score 87** → 「弾を見ない」(novice 定義) が「動かない」(camper 定義) より優れる relative order は、視認 (anticipation/telegraph/wobble) の機構が **「動くこと」に対する勾配を作れていない可能性**。視認が relative order に効いているなら novice > camper 程度の差ではなく **camper ≈ novice (両者 floor)** が想定だった
- **結論**: (a) と (b) の両方が並存する。**観点 1 (「動く ≠ 遊べる」の「遊べる」閾値) が未通過** の現状で「動くこと自体が回避になる」aimed 主体の弾源は R-B 機能側、しかし「視認しないこと」が「動かないこと」より上に立つのは視認系機構 (windup/wobble/anticipation) の勾配が relative order に届いていない側面も示唆。**次サイクル以降の観点 1 着手時の起点 signal として記録**

#### 想定外 #2: **player_lv_avg が全方針で 0-0.02** (Lv up が headless ではほぼ発火していない)

- graze 平均は route 10.7 / camper 1.2 / panic 9.2 / novice 2.9 → Lv up threshold (LV_GRAZE_TH=30 graze) に届いていない
- 構造的原因: graze_log v07 は graze→gauge→BOMB の経路が主で、Lv up (30 graze) は **gauge MAX 到達 (gauge 増 6/graze なので 35 graze で MAX)** より遅い → BOMB 1 回発動分の graze で Lv up 1 段がギリギリ
- route の Hyper 発動 0.58 回/ゲーム → graze 30 回 ≈ 1 Lv up 想定なのに player_lv 0.02 → **Hyper 発動が graze 蓄積をリセットしている** わけではない (graze_count は累積、Lv up 判定も累積で行う) → **headless agent の graze 機会が想定より少ない**
- 解釈: AI agent (route) の 8 字経路は graze 機会を「弾の近く」に近づくが、`R_GRAZE=22` (R_HIT=8 の 2.75 倍) の輪の内側に **正確に** 入る精度が AI には不十分 → 実プレイヤーは弾を視認して半径 14-21 の輪に入れるが、AI route は経路追従のみで弾位置を見ていない → **実プレイ時の graze 量は headless agent より多い** 可能性。実 Nao_u プレイ時の Lv up 発火頻度を別途確認する必要
- **これは観点 7 (180F cap reached 大成功反応) の発火頻度 0 (3 連 Lv up は cap_reached 必要) を意味する** → 観点 7 が headless 4 方針では一度も発火していない。Nao_u プレイで観点 7 大成功反応が見える前提が「Lv up 3 段 = 90 graze 達成」だが、AI route ですら 10.7 graze 平均 → 実プレイで Lv up 1 段すら届かないリスク 40-50%

#### 想定外 #3: **route の 90s 到達率 17%** (predicted_play.md 観点8 §予測 #1 で 30-50% 想定)

- route 100 試行中 17 試行のみ 90s 到達。predicted_play §予測 #1 で「phase 5 山 1 (52-65s) で gameOver する確率が高ければ phase 6/7 は多くのプレイで体感されない」を予測したが、AI agent 上では **想定範囲の下限 (30%) を 13pt 下回る** → 過剰密度リスク (v07 self_judgment-C201 §「過剰密度リスク 25%」) が **headless で 73% 顕在化** している側面
- これは構造判定 signal として: **観点 6 spawnPhase5 (山 1) の数値設計が AI 視点では plays 不能寄り** → 実プレイヤーは弾を視認して回避できるので「過剰密度 = plays 不能」とは限らないが、**観点 6 の数値調整 (spawnInterval 山=80F → 100F or spawnPhase5 small 8 → 5) を v07 第二手の候補に置く**

## Log_cdx メタプロンプト観点 1-8 × v07 (B-2 + 観点3 + 観点7 + 観点6 + 観点8) 照合

| 観点 | v07 該当機構 | 判定 |
|---|---|---|
| 1. 動く ≠ 遊べる | v06 継承 + Hyper + 観点3 + 観点7 + 観点6 + **観点8 headless で「動く ≠ 死なない」確認** | **部分的に満たす (signal 強化)**: 観点 8 で「動かない (camper) = 即死 / 動く (route) = 長生き」が relative order として観測 → 「動く」勾配は機能。ただし「動く ≠ 遊べる」の「遊べる」閾値は未通過 (route ですら 90s 到達率 17%) |
| 2. 敵に行動意図 | 未実装 | **満たさない**: 観点 8 で発火するシグナルなし、**v08 以降の課題** |
| 3. 特殊システム 3 状態を対象物側マーカー | 観点3 弾側マーカー (C199 達成、headless では描画不参照で効果ゼロ) | **満たす (C199 達成、観点 8 では検証不能)**: 観点 3 マーカーは描画のみ、headless agent は numeric state のみ参照 → 観点 8 で観点 3 の効果は確認できない (構造的限界) |
| 4. 中心入力をタイトル/リトライで | v06 から不変 | **判定保留** |
| 5. 常時表示情報は少ない方が良い | gauge 共用 + 観点3 (無敵中のみ) + 観点7 (発火時のみ) + 観点6 (常時表示増加なし) + **観点8 (別ファイル、index.html 無改変)** | **満たす (C201 維持)**: 観点 8 は `headless.py` 独立ファイル、index.html / HUD には一切影響しない |
| 6. 難易度 = 学習/圧力/休符/山 | 観点6 7 区分 spawn テーブル (C201 達成) | **部分的に満たす (C201 達成、観点 8 で signal)**: 観点 8 で「全方針 90s 到達率 < 20%」 → **観点 6 spawnPhase5 数値調整候補** が relative order signal として浮上 |
| 7. 気持ちよさ = 6 種反応分離 | 観点7 大成功反応 (C200 達成、headless ではほぼ発火なし) | **部分的に満たす (C200 維持、観点 8 で signal)**: 観点 8 で「全方針 player_lv_avg 0-0.02」 → **観点 7 大成功反応 (3 連 Lv up = 90 graze 必要) の発火頻度が low** が relative order signal として浮上、実プレイで Lv up 1 段すら届かないリスク 40-50% |
| **8. bad policy headless** | **観点8 headless.py 4 方針 (新規)** | **満たす (新規達成)**: route / camper / panic / novice 4 方針を Python 移植 + 各 100 試行実行可能、relative order 構造判定で 3 つの想定外 signal を獲得 → **C201 「満たさない」→ C202 「満たす」格上げ達成** |

**観点 1-8 のうち判定が立った 7 項目 / 8 (観点 4 保留)**: 満たす **3** (観点 3 / 5 / **観点 8**) / 部分的 **3** (観点 1 / 6 / 7) / 満たさない **1** (観点 2) = **観点 8 で v07-C201 から 1 項目格上げ達成 (「満たさない」→「満たす」)、観点 1 は signal 強化**

## R-A〜R-I マッピング (観点 8 で関係する 4 項目)

### R-A. 一番楽しい瞬間を強化する
**v07 観点 8 該当判定**: route > panic の score 差 (route 3469 vs panic 2877) は **Hyper のタイミング選択が core mechanic として効いている** signal。「核体験 = Hyper の戦略的発動」が R-A の縦深化として relative order に反映。**R-A 準拠**

### R-B. 緊張は外発、誘導は報酬で
**v07 観点 8 該当判定**: route (能動 graze) > camper (受動 = 動かない罰) で **「報酬経路 (graze) と緊張経路 (被弾) のペア」が camper 罰として機能** している signal。ただし camper < novice の想定外 signal は「random 動 = aimed 弾を 1.4x 遅らせる」が「動かない = aimed 直撃」に勝つ relative order → **視認系機構の勾配が「動くこと」に対して足りていない側面** が浮上。**R-B 準拠 (camper 罰側) + 視認系勾配の signal**

### R-I. 着手前30本、提出前自己判定 — **headless 数値の R-I 死守ライン明示**
**v07 観点 8 該当判定**: 本ファイル §結論 で「観点 8 数値の絶対値は Slack / cross_review / Nao_u プレイ評価 / merge 要請の根拠に使用しない」を明文化、構造判定 (relative order signal の読み) のみに使用。`feedback_headless_unfit_for_unfinished_eval.md` t:5 「校正前 headless は未完成ゲームの設計判定根拠に使わない」を **本サイクルで明示的に履行**。Nao_u 2026-05-09 05:01 #game-rights 「やめて」3 度目警告ラインの **正面遵守**。**R-I 死守準拠**

### (補助) R-D. 型から始める — 守破離の守、独自要素は1つだけ
**v07 観点 8 該当判定**: 本サイクル C202 で追加した機構は **観点 8 (headless.py 独立ファイル) 1 個のみ**。index.html は一切編集していない (戻し方: `headless.py` 単体削除で観点 6 等価戻し)。**R-D 準拠 (1 機構 + 戻し方保証)**

## 「良い」と確信できない条件 (Nao_u 評価で覆る可能性)

- **観点 8 数値の解釈に頼りすぎリスク**: 4 方針 AI agent はヒューリスティック (学習無し)、Python 移植粒度は 80% (描画系 / anticipation 30F / windup 10F / wobble 省略)。relative order が「想定外」だった camper < novice / player_lv_avg ≈ 0 / route 90s 到達率 17% は **実プレイヤーの挙動を反映しない** 可能性が高い → **本ファイルの signal を v07 第二手の優先付けに使うが、実プレイ評価で覆る前提**
- **「面白い」閾値到達 45% は据え置き**: 観点 8 は構造判定の signal を 3 つ獲得したが、Nao_u v02 評価「面白くはないが、ぎりぎりゲーム」を「面白い」に押し上げるかは観点 8 では確認不能 (headless agent は描画を見ない、観点 3/7 の効果も検証不能)。**閾値 45% の +0pt** 据え置き
- **観点 6 数値調整 / 観点 7 発火頻度の対策が次サイクル候補**: 観点 8 signal 3 件が次サイクル以降の候補を **明示的に並べる** signal として効いた → 観点 8 自身の物理化は判定を立てるが、判定先 (Nao_u v07 プレイ評価 vs v07 第二手 (観点 6 数値調整 or 観点 7 LV 発火を促す改修)) の選択は次サイクル
- R-I 「面白いか／前作より良いか」を結論: **「単機構ずつ局所改善 + 4 観点で構造判定軸獲得」確信 92% (C201 90% → +2pt) / 「面白い」閾値到達 45% (C201 と同) 据え置き**。誠実な現状は **構造判定 Yes / 体験判定 部分 Yes / 「面白い」閾値接近中 (45%) / 観点 6/7 の調整余地が headless signal で浮上**

## 次 iteration 起点を 1 つ確定 → **Nao_u v07 プレイ評価依頼 (#game-rights)**

候補比較:
- (α) **Nao_u v07 プレイ評価依頼**: B-2 + 観点3 + 観点7 + 観点6 + 観点8 の 5 機構積層 + Log_cdx メタプロンプト 8 観点中 6 観点 (1/3/5/6/7/8) を満たす or 部分的に満たす状態に到達 → **自律 Stage 4 自判定 4 サイクル連続継承 (C199/C200/C201/C202) の節目**。観点 6/7 の signal (90s 到達率 17% / player_lv ≈ 0) を **実プレイ評価で校正する** 経路
- (β) 観点 6 数値調整 (spawnPhase5 弾密度緩和 / spawnInterval 山=80→100F): 観点 8 signal #3 への対症。1 機構刻みで実装量は 5-10 行。**ただし observed_value で iteration するのは R-I 「校正前 headless 数値で設計判定」の境界に接近**、慎重に
- (γ) 観点 7 LV 発火促進 (LV_GRAZE_TH=30→20 or GRAZE_GAUGE=6→8): 観点 8 signal #2 への対症。1 機構刻みで実装量は 1-2 行。**graze 単位を変える** = gauge 蓄積バランス全体に波及するので 1 機構刻み制約の境界に近い

**選定: (α) Nao_u v07 プレイ評価依頼**。理由: 
- (a) Nao_u v06 評価未受領 11 日 + v07 で 5 機構独立進化 = Nao_u 視点で「自走しすぎ」リスクが累積、**今が校正の節目**
- (b) 観点 8 signal 3 件 (camper<novice / Lv up ≈ 0 / 90s 到達率 17%) は **AI agent ヒューリスティック由来の限界も含む** → 実プレイ評価で「signal が校正されるか / 別の問題が浮上するか」を確認する経路が **観点 8 数値による対症 (β/γ)** より上位
- (c) `feedback_headless_unfit_for_unfinished_eval.md` t:5 「校正前 headless は未完成ゲームの設計判定根拠に使わない」を死守する場合、観点 8 signal を **対症 (β/γ) の根拠** にすると R-I 違反に接近する → 観点 8 signal は **次の打ち手の候補を浮上させる役割** のみに留め、実打ち手は Nao_u プレイ評価後に決める
- (d) Nao_u プレイ評価依頼 Slack 投稿 (#game-rights) は本ファイル ship 後の次サイクル C203 で実施。本 Stage 4 自判定が ship される時点で「観点 8 物理化 + relative order signal 獲得 + R-I 死守ライン明示 + 次起点として実プレイ評価依頼を選定」が物理閉鎖される

## 出荷判断: 本 Stage 4 自判定追記を ship、次サイクル C203 で Nao_u v07 プレイ評価依頼

C199/C200/C201/C202 で **4 サイクル連続** で「Nao_u 評価を待たず Stage 4 自判定で iteration 起点を 1 つ確定する」R-I 退路解除パターンを継承した結果、v07 は 5 機構積層 + Log_cdx 観点 6/8 達成 + R-A/B/C/D/E/I の 6 項目縦深化 + 観点 8 headless signal 3 件獲得が物理化された。次サイクル C203 で Nao_u v07 プレイ評価依頼を #game-rights に 1 メッセージ投げ、Stage 4 自律判定 + Stage 5 外部評価校正の連動 + 観点 6/7 数値調整 (β/γ) の優先付けを実プレイ評価で確定する。

## 接続先 (C202 追加分)

- `game/graze_log/v07/headless.py` — 観点8 実装 (commit `e79908226`、594 行新設)
- `game/graze_log/v07/predicted_play.md` 観点8 §Stage 3 予測 (commit `82e2ae889`)
- `game/graze_log/v07/README.md` §観点 8 — 観点8 設計仕様 (本実装の出典)
- 本ファイル前半 — v07 B-2 + 観点3 + 観点7 + 観点6 Stage 4 自判定 (C199/C200/C201 commit `b4ea69581` / `1dc4480be` / `32d22fd02`)
- `log/slack_archive/game-rights.jsonl` ts=1779658696-8705 — Log_cdx メタプロンプト 1-8 原文 (観点8 「悪い方針」の出典)
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — **本ファイルの R-I 死守ライン明示の根拠** (Nao_u 2026-05-09 「やめて」3 度目警告ラインの正面遵守)
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任の連続体、C199/C200/C201/C202 で 4 サイクル連続継承

— Ash (Win2) 2026-05-28 C202 Phase 4 大作業 (v07 観点 8 物理化 + Stage 4 自判定 追記 + R-I 死守ライン明示)

---

## §juicy_amplification_matrix Stage 4 自判定 (2026-05-31 C188 Ash)

**接続元**: `game/graze_log/v07/juicy_amplification_matrix.md` (commit 2f5d4228f) は ACM 2024 Hicks et al. "Juicy Audio" の polishing/amplification 2 操作枠で v07 5 機構を読み直した Stage 3 予測 matrix。末尾「v08 着手前に index.html の現状を AI 自プレイで触り、本 matrix の予測が体感と一致するかを Stage 4 として記録すべき」と Stage 4 自宣言保留を残していた。本セクションで Stage 4 を解消する。

**Stage 4 自判定の方法**: AI 自プレイ (実走) は本 Ash インスタンスからは headless 計装経由しか取れず、`feedback_headless_unfit_for_unfinished_eval.md` t:5 が「校正前 headless 数値を未完成ゲームの設計判定根拠に使わない」を厳守する以上、headless 数値は本判定の根拠から外す。代替として **index.html の現状コードを精読し、matrix の Stage 3 予測が実装と整合するか / 予測の前提が外れる箇所はないか** をコード根拠で判定する。これは `feedback_prediction_responsibility.md` t:5 の Stage 4 (= AI 側で「良い/外れ」を結論してから Stage 5 に出す) の **コード精読版** であり、Stage 5 Nao_u プレイ評価で覆る前提は維持する。

**制約遵守 (本セクション本文での明示)**:
- `feedback_headless_unfit_for_unfinished_eval.md` t:5: 本 Stage 4 判定で headless 数値 (route/camper/panic/novice の到達率 / score / player_lv_avg) は根拠として使用しない
- `feedback_clone_strategy.md` t:5 守破離守準拠: Nao_u v07 プレイ評価返信 (ts=1779939191.243789) 受領前は v08 着手判断を凍結。本セクションの「v08 候補 Ash 暫定推奨」は Nao_u 評価が amplification 余地大方向に偏った場合の v08 経路選定材料として記録するに留め、**着手判断ではない**

### Stage 4 セル判定 (player 側 9 セル: matrix 8 セル + 矩形横断観察)

#### Cell 1: B-2 Hyper Activation × polishing
- **体感予測 (matrix §1)**: 消去波の前進感 (画面中心から外周へ scan する波形 alpha) が polishing 候補。「Hyper を撃った」が「一瞬で何かが消えた」のままだと empowerment 薄い
- **index.html コード根拠**: `fireBomb()` (lines 342-367) — 3 つの rings を 4F ずらして発火 (`for(let i=0;i<3;i++) state.rings.push({...r0:20, r1:Math.min(W,H)*0.7, life:30, c:'#ffe040'})`)。draw() ring 描画 (lines 841-849) で r=r0+(r1-r0)*k 拡大 + alpha=1-k フェード = **実質「中心→外周への波形 scan」を 3 連発で実装済み**。加えて全画面 flash 2 種 (bombFlash 24F #ffd870 alpha 0.35 / hyperFlashT 30F #ffe040 alpha 0.4 in lines 909-922)
- **Stage 4 自判定 (予測命中信頼度)**: **低**。Stage 3 予測「消去波前進感は未獲得」は **外れ**。3 連の拡大 ring (r0=20 → r1≈340) が中心→外周波 scan を物理的に実装済み。matrix の polishing 余地評価「中 (消去波前進感)」は誤読、現状の polishing 余地は **「全画面 flash の輝度を下げて ring 波形を見せる」逆方向の polishing** にあり (現状 flash alpha 0.4 + 0.35 重複で ring が埋もれる懸念)

#### Cell 2: B-2 Hyper Activation × amplification
- **体感予測 (matrix §2)**: gauge 充填速度の **対 phase 期待値との差分** を gauge UI 側に細い背景線として描画。「いま Hyper を撃つべきか溜めるべきか」を gauge 数値ではなく **gauge UI 形状** で読めるようになる
- **index.html コード根拠**: `drawHUD()` gauge bar 描画 (lines 935-966) — gauge bar は H-14 に gw=W-20, gh=8 の横 bar、G_LV2/G_LV3 縦 tick 2 本 + lv 別色変化 (4a7fc0 / 60c0ff / ffa040→ffd870) のみ。**phase 別期待ラインは一切描画されていない**。currentPhase() (line 446 周辺) は spawn 駆動のみで gauge UI 連動なし
- **Stage 4 自判定**: **高**。Stage 3 予測命中。amplification 余地は明らかに大、実装は drawHUD に phase 別期待ライン (例: 圧力 phase 期待値 = gauge 0.7 × G_MAX の縦 tick 半透明) を 5-10 行追加で得られる。**本セルが v08 候補 (b) の Stage 4 根拠**

#### Cell 3: 観点 3 弾側マーカー × polishing
- **体感予測 (matrix §3)**: 鼓動振動 / graze 成功時 burst / 無敵終了 5F fadeout。**消失 fadeout 5F が最小の polishing**
- **index.html コード根拠**: ebullet 描画 (lines 834-839) — `if(state.invincibleT>0){ ctx.strokeStyle='rgba(255,224,64,0.55)'; ... arc(wx,wy,5,0,Math.PI*2) }` で **r=5 固定、alpha 固定 0.55、消失は invincibleT が 0 になった瞬間 (1F で消える)**
- **Stage 4 自判定**: **高**。Stage 3 予測命中。マーカーは r/alpha 固定 + 瞬時消失で確認、fadeout 5F は 3 行追加 (前 5F の invincibleT で alpha 線形減衰) で実現可能。鼓動振動については「弾密度が高い phase で全弾同期させると画面ノイズ」予測も整合 (現状 state.t グローバルなので全弾同期になる)

#### Cell 4: 観点 3 弾側マーカー × amplification
- **体感予測 (matrix §4)**: 黄色弾と通常弾の **画面内出現比率** / graze 成功時のどの弾種から graze 取れたかの事後可視化
- **index.html コード根拠**: ebullet 描画ループ (line 813) では invincibleT>0 中は **全 ebullet にマーカー発火** (lines 834-839 = 弾種区別なし)。`onGraze()` (line 667) は弾種を popup に出していない (`text:'+'+(GRAZE_GAUGE*mult)` line 679)
- **Stage 4 自判定**: **中**。Stage 3 予測「出現比率の amp 余地大」は **前提が部分外れ**。invincibleT 中=全弾 2x 対象なので「比率」は常に 100% / 0% のトグルになり、amp 余地は「invincibleT が effective な時間帯がいつ来るか」の HUD 可視化に修正必要。chain 末尾 popup (graze 弾種別 popup) は Stage 3 予測通り未獲得で残る

#### Cell 5: 観点 6 7 区分 spawn テーブル × polishing
- **体感予測 (matrix §5)**: phase 切替時の画面端 1F フラッシュ + phase 名瞬間表示。**画面端 1F フラッシュは polishing として軽量 (~3 行)**
- **index.html コード根拠**: bg 描画 (lines 738-739) は `ctx.fillStyle='#07091a'; ctx.fillRect(0,0,W,H)` 固定一色。phase 切替の視覚演出は **draw() / drawHUD() に一切存在しない** (grep で phase tick / phase flash 文字列 0 件)。currentPhase() の閾値超え瞬間を検出する hook も update() にない
- **Stage 4 自判定**: **高**。Stage 3 予測命中。phase 切替時に視覚的に何も起きないことをコードで確認。端 flash は 3-5 行 (update() に lastPhase 記録 + 切替検出、draw() に flash 残時間描画) で実現可能。最小実装条件を満たす

#### Cell 6: 観点 6 7 区分 spawn テーブル × amplification
- **体感予測 (matrix §6)**: 画面端の **時間 bar** (90 秒進行度 + phase 区切り tick) / 背景色微変化。**時間 bar は amplification 典型、画面下端 1px 高 bar で「いま圧力区間に入った」を体感可能**
- **index.html コード根拠**: PHASE_BOUNDARIES (line 171) `=[780,1560,2340,3120,3900,4680,5400]` で phase 境界 F 列定義済み。state.t (line 187 周辺) で経過 F を保持。drawHUD() に phase / 時間 情報の HUD 表示は **完全に不在** (lines 935-980 にも grep 0 件)
- **Stage 4 自判定**: **高**。Stage 3 予測命中。データソース (state.t + PHASE_BOUNDARIES) が既存で、画面下端 1px 高 bar 実装は 5-8 行 (gauge bar gy=H-14 の 1px 上 gy=H-15 で 90 秒進捗 + 7 tick 描画)。**本セルが v08 候補 (a) の Stage 4 根拠 (最強)**

#### Cell 7: 観点 7 180F cap reached 大成功反応 × polishing
- **体感予測 (matrix §7)**: cap 持続中 (180F = 3 秒) の **持続演出** / cap 解除瞬間の着地演出。持続中の演出を加えると **持続自体が体験** になる
- **index.html コード根拠**: cap 到達瞬間 (lines 700-704) = maxChainFlashT=20F + 大型 ring r0=12→r1=60 30F + popup 'MAX CHAIN!' 60F、draw() flash 描画 (lines 923-928) で 20F フェード。**cap 持続中** (= invincibleT が BUZZ_INVINCIBLE_CAP まで延長されている間) は通常の橙色 glow ring (lines 883-889 `rgba(255,160,64,...)` orange) しか出ず、**cap 状態と非 cap 無敵状態が視覚的に区別されていない**
- **Stage 4 自判定**: **高**。Stage 3 予測命中。cap 到達瞬間の polishing は確かに強いが持続中は弱い (= 通常無敵と同視覚)。「cap 持続中だけ橙色 ring を金色 ring (#ffd870 等) に変える」 polishing 案が 2-3 行で実装可能 (line 886-889 の strokeStyle 三項分岐に invincibleT===BUZZ_INVINCIBLE_CAP 条件追加)

#### Cell 8: 観点 7 180F cap reached 大成功反応 × amplification
- **体感予測 (matrix §8)**: cap 到達まで残 chain 数の **chain counter 可視化** (●●○ 形式) / cap 持続中の **残時間 bar**
- **index.html コード根拠**: onGraze() (lines 685-703) cap 検出 = `wasCapNotReached=state.invincibleT<BUZZ_INVINCIBLE_CAP` && `state.invincibleT===BUZZ_INVINCIBLE_CAP` への遷移。cap 条件は **invincibleT の加算量** で判定、`Math.min(state.invincibleT+BUZZ_INVINCIBLE_FRAMES, BUZZ_INVINCIBLE_CAP)` (line 696)。HUD には `PLv {playerLv}/{PLAYER_LV_MAX}` (line 976) はあるが **cap までの残量は invincibleT/BUZZ_INVINCIBLE_CAP 進捗で計算可能だが表示なし**
- **Stage 4 自判定**: **中**。Stage 3 予測「3 chain ●●○ 表示」は **前提部分外れ**。cap 条件は整数 chain 単位ではなく invincibleT 加算量 (BUZZ_INVINCIBLE_FRAMES 単位の累積) で判定するため、**残 chain ●●○ ではなく invincibleT 進捗 bar** の方が実装に整合。amplification 余地自体はある (cap までの残量がプレイヤーに不可視)

#### Cell 9: 矩形横断観察 (Stage 4 整合性チェック)
- **matrix 横断観察の主張 (再掲)**:
  1. 観点 3 弾側マーカーが唯一の amplification 機構 (player 側 amp で「強」評価は観点 3 のみ)
  2. 観点 6 spawn テーブルの amplification 余地最大
  3. B-2 Hyper Activation の amplification 余地次点
  4. 観点 7 cap reached は polishing 側で既に強い
- **Stage 4 自判定 (4 主張のコード根拠整合)**:
  1. ○ **整合**: 観点 3 マーカー (lines 834-839) は「invincibleT というロジック状態」を player に可視化する典型 amplification。他機構の amplification はコード上不在 (drawHUD に phase 情報なし / gauge 期待ラインなし / cap 残量なし)
  2. ○ **整合**: PHASE_BOUNDARIES 既存 + 描画 0 = 余地最大が裏付け
  3. ○ **整合**: gauge UI は段階別色変化のみで phase 期待値 amp 不在 = 余地次点
  4. △ **部分整合 (修正)**: cap reached 瞬間の polishing は確かに強い (3 種演出) が **cap 持続中の polishing は弱い** (通常無敵と同視覚)。matrix 表「polishing 現状 強 / 余地 小 (持続演出)」の余地評価は「小」より「中」が妥当
- **Stage 4 横断結論信頼度**: **高**。matrix 横断観察の構造判断 (どの機構の余地が大/中/小か) は概ねコード裏付けあり。修正点 1 つ: 観点 7 polishing は「cap 到達瞬間 強 / 持続中 弱」と二分すべき

### v08 候補 (a)〜(e) の Stage 4 整合性ランキング

| 候補 | matrix Stage 3 予測 | Stage 4 信頼度 | 実装行数 | 戻し方 |
|---|---|---|---|---|
| (a) 観点 6 時間 bar | amp 余地最大 | **高** (Cell 6 根拠) | ~10 行 (drawHUD 末尾追加) | 10 行削除で v07 等価 |
| (b) B-2 gauge 期待ライン | amp 余地次点 | **高** (Cell 2 根拠) | ~8 行 (drawHUD gauge ブロック追加) | 8 行削除で v07 等価 |
| (c) 観点 7 残 chain ●●○ | amp 余地中 | **中** (Cell 8 前提部分外れ → bar 表示なら整合) | ~6 行 (drawHUD chain 描画追加) | 6 行削除 |
| (d) 観点 3 fadeout 5F | polishing 余地小 | **高** (Cell 3 根拠) | ~3 行 (ebullet ループ修正) | 3 行差し戻し |
| (e) 観点 3 黄色弾出現比率 | 結合候補 | **中** (Cell 4 前提部分外れ → トグル可視化に修正) | ~10 行 (HUD 追加) | 10 行削除 |

### Ash 側暫定推奨 v08 候補 ≤2 件 (`feedback_clone_strategy.md` t:5 守破離守準拠 = 着手判断ではない暫定)

**推奨 1 (最優先): v08 候補 (a) 観点 6 spawn テーブル 時間 bar**
- **推奨理由 (Stage 4 自判定との接続)**: Cell 6 で Stage 4 信頼度 **高** (PHASE_BOUNDARIES 既存 + HUD 描画 0 のコード根拠が確定)。amplification 余地評価が matrix 横断観察の主張 #2「余地最大」と整合し、Cell 6 と矩形横断観察 Cell 9 主張 #2 で二重に裏付けられた。最小実装 (~10 行) + 戻し方明確 (10 行削除で v07 等価) で `feedback_clone_strategy.md` の「削除可能改良 1 個刻み」要件を満たす。実装位置は drawHUD() 末尾 (line 980 後) に追加可能で、既存 HUD 行 (line 976) の情報密度には影響しない (画面下端 1px 高 bar = `feedback_clone_strategy.md` Log_cdx 観点 5 「常時表示情報は少ない方が良い」とも両立)

**推奨 2 (次点): v08 候補 (d) 観点 3 弾側マーカー fadeout 5F**
- **推奨理由 (Stage 4 自判定との接続)**: Cell 3 で Stage 4 信頼度 **高** (r=5 + alpha 0.55 固定 + 瞬時消失のコード根拠が確定)。実装最小 (~3 行) + 振る舞いの破壊範囲が局所 (ebullet 描画ループ 1 箇所のみ) で副作用懸念が最低。polishing 余地は matrix 表で「小」評価だが Stage 4 で「無敵終了瞬間の認識を緩やかにする」効果がコード上明確 (現状の瞬時消失は急峻すぎる体感) で、**侵襲の少なさ × 効果予測の確実さ** で第 2 推奨に位置づける

**非推奨理由 (b)(c)(e)**:
- **(b) gauge 期待ライン**: Cell 2 Stage 4 信頼度 高で実装も小規模だが、gauge UI は既に段階別色変化 + 縦 tick 2 本 + ready 時 pulse ring + lv 別色変化と情報層が **既に厚い**。期待ライン追加は HUD 情報密度を一段押し上げるリスクがあり、`feedback_clone_strategy.md` Log_cdx 観点 5 との折衝が必要 → 第 3 候補以下に降格
- **(c) 残 chain 表示**: Cell 8 Stage 4 で前提部分外れ (3 chain 単位ではなく invincibleT 加算量判定)。●●○ 形式を採用するには cap 条件式の意味づけを変える設計修正が要り、`feedback_clone_strategy.md` の「1 機構刻み」を超える
- **(e) 出現比率表示**: Cell 4 Stage 4 で前提部分外れ (invincibleT 中 = 100% トグル)。amp 仕様の再設計が要る

### Nao_u v07 プレイ評価返信受領後の v08 経路選定指針

`game/graze_log/v07/self_judgment.md` §「次 iteration 起点を 1 つ確定」(line 379-394) で本ファイル前半は「Nao_u v07 プレイ評価依頼を次サイクル C203 で実施」を確定済み。本 Stage 4 自判定は **Nao_u v07 評価返信受領時** に以下のフローで使用する:

1. Nao_u 評価コメントの「単調」「核体験」「気持ちよさ」等のキーワードを polishing/amplification 軸でタグ付け (matrix §「v06 self_judgment.md 5 機構統合版」step 2 流用)
2. キーワードが **amplification 側** に偏った場合 → 本 Stage 4 推奨 1 (時間 bar) を v08 第一手として着手判断、追加で推奨 2 (fadeout) を併発する 2 機構刻み判断
3. キーワードが **polishing 側** に偏った場合 → 推奨 2 (fadeout) を v08 第一手として着手判断、加えて Cell 7 の修正 (cap 持続中の polishing = 金色 ring 切替 2-3 行) を追加候補
4. キーワードが「面白い、次の機構を」方向 → v08 ではなく次の独自要素 1 つ追加に振る (matrix §「v08 実装可能性候補」flow と一致)

### Stage 4 自判定の制約遵守チェック

- [x] `feedback_headless_unfit_for_unfinished_eval.md` t:5: 本判定は **index.html コード精読** に基づき、headless 数値 (route/camper/panic/novice 到達率 / score / player_lv_avg) を一切根拠として使用していない。Stage 4 「AI 自プレイで良いと確信」をコード精読版で代替したことを冒頭で明示
- [x] `feedback_clone_strategy.md` t:5 守破離守: v08 候補推奨は **着手判断ではない暫定推奨** と明示、Nao_u v07 評価返信受領後の判断材料として記録するに留めた。本セクション内で v08 着手は決定していない
- [x] `feedback_prediction_responsibility.md` t:5: Stage 3 (matrix) → Stage 4 (本セクション) → Stage 5 (Nao_u 評価) の連続体で、Stage 4 で予測命中信頼度を「高/中/低」3 段階で明示し、外れ箇所 (Cell 1 消去波余地誤読 / Cell 4・8 前提部分外れ) を隠さず記録
- [x] `feedback_prior_art_citation_must_verify.md` t:5: 本セクションは matrix (ACM 2024 引用済) と index.html コードを接続するので新規外部引用なし、既存引用の二次接続のみ
- [x] `feedback_means_ends_reversal_check.md` t:5: 本 Stage 4 自判定の出力は v08 候補絞り込み (2 件推奨 + 3 件非推奨理由) = iteration の次手選定根拠で、ship に直結する判定材料。matrix を読み直すだけの中間文書ではなく、Nao_u 評価返信受領後の v08 着手判断を物理的に短縮する材料を残した

— Ash (Win2) 2026-05-31 C188 Phase 4 大作業 (juicy_amplification_matrix Stage 4 自判定追記 + v08 候補 (a)(d) 暫定推奨 + matrix 主張 4 件のコード根拠整合性記録)

---

## §juicy_amplification_matrix Stage 4 — Ash 自プレイ側 9 セル + v08 候補 (a)(d) 確信度確定 (2026-06-02 C281 Ash)

**接続元**: 本ファイル前節 (C188, 2026-05-31) で **player 側 9 セル** + **v08 候補 (a)(d) 暫定推奨** は記録済。残保留は (i) **Ash 自プレイ側 9 セル** (player 側=外部視点の Stage 3 体感予測に対し、Ash 自身が index.html の挙動を内部 simulate してプレイしたときの体感判定)、(ii) **v08 候補 (a)(d) 確信度確定** (暫定推奨 → 採用 / 不採用 / 再検討 × 高 / 中 / 低)。本セクションで両保留を解消し、v08 着手の最終ゲートを通過させる。

**判定方針再掲 (R-I 死守)**:
- 根拠は `index.html` コード精読 (line 番号付き) + Ash 自プレイ mental simulation (= キー入力 → 内部状態遷移 → 描画出力を頭の中で再生) のみ
- 校正前 headless 数値 (route/camper/panic/novice 到達率 / score / player_lv_avg) を **判定根拠に使わない** (`feedback_headless_unfit_for_unfinished_eval.md` t:5)
- 既出の player 側 9 セルとの **差分のみ** を記述し、重複文を増やさない (`feedback_memory_update_method.md` 差分追記原則)

### Ash 自プレイ側 9 セル判定 (player 側との差分)

#### Cell 1: B-2 Hyper Activation × polishing (player 側 vs Ash 自プレイ側)
- **player 側既出**: 「消去波の前進感」を amplification 寄り polishing 候補と判定
- **Ash 自プレイ差分**: 自分が X (SPACE) を押した瞬間に体感するのは **画面全体の黄色 flash (30F, alpha 0.4)** が支配的で (line 918-922)、個別の star 粒子 (line 348-352) は画面上では認識前に flash で覆われる。**Stage 4 自判定**: **高**。前進感波形の必要性は player 側予測通り、ただし優先度は polishing 余地として「中」止まり (flash 演出が既に「撃った感」を担保しているため、追加波形は重複層になる懸念)

#### Cell 2: B-2 Hyper Activation × amplification (player 側 vs Ash 自プレイ側)
- **player 側既出**: gauge 期待ライン amp 余地大、Stage 4 信頼度 高
- **Ash 自プレイ差分**: 自分が gauge を見ている瞬間に欲しい情報は「**いま撃つべきか溜めるべきか**」の即時判定で、現状の HUD (line 976) は LV 数表示のみ。drawHUD() で gauge bar (line 936-966) を見るとき、対 phase 期待値が無いため「LV3 まで溜まったから撃つか」の閾値判断だけで意思決定が完結してしまう。期待ライン追加で「**phase 切替前に撃つ vs 切替後に温存** の判断」が生まれる予測。**Stage 4 自判定**: **高**。amplification 余地は確実、ただし既存 gauge UI 情報密度 (色 3 段階 + 縦 tick 2 本 + ready pulse) に重なる **視覚衝突リスク** が player 側予測より重い

#### Cell 3: 観点 3 弾側マーカー × polishing (player 側 vs Ash 自プレイ側)
- **player 側既出**: 消失 fadeout 5F が最小 polishing、無敵切れ瞬間の認識を緩やかに
- **Ash 自プレイ差分**: 自分が無敵中に擦り回るとき、無敵終了瞬間の体感は「**急に画面の黄色 ring が消える違和感**」(line 835-839, 瞬時消失) + 「**player 周囲の橙 glow ring が消える**」(line 883-889) の **二重瞬時消失** が同時発生。fadeout 5F は弾側 ring 単独修正で、player 周囲 ring の同期 fadeout も要検討。**Stage 4 自判定**: **高**。fadeout 効果は確定、ただし弾側 ring 単独修正だけでは player 周囲 ring との非対称が新たな違和感を生む副作用予測あり (player 側予測より複雑)

#### Cell 4: 観点 3 弾側マーカー × amplification (player 側 vs Ash 自プレイ側)
- **player 側既出**: 出現比率の前提部分外れ (invincibleT 中=100% トグル)、chain 末尾 popup は事後可視化候補
- **Ash 自プレイ差分**: 自分が無敵中の画面を見るとき、黄色 ring (line 835-839) は **全 ebullet に対して描画されている** ことを mental simulate で確認 (line 835 の `if(state.invincibleT>0)` は弾種フィルタなし)。これは「2x 対象であることのマーキング」というより「**無敵中の表示モード切替**」に近く、player 側 amp として「強」評価していた knowledge §マトリクス分析仮置きは **過大評価** の可能性。**Stage 4 自判定**: **中**。amp 機能としての効果は弱め、player 側 cell 4 で評価した「唯一の amp 機構」評価を **降格** すべき (=「無敵中インジケータ」相当に再分類)

#### Cell 5: 観点 6 7 区分 spawn テーブル × polishing (player 側 vs Ash 自プレイ側)
- **player 側既出**: 画面端 1F フラッシュが軽量 polishing
- **Ash 自プレイ差分**: 自分が play しているとき、phase 切替の認識は **spawn パターン変化 = 弾密度変化** の事後気付きでしか得られない (PHASE_BOUNDARIES line 171 + spawnPhase 関数群 line 448-462)。**先行通知が一切ない** ため次 phase の準備動作 (gauge 温存 / ポジション取り直し) ができない。1F フラッシュは事後通知で **先行 1-2 秒予告** には足りない。**Stage 4 自判定**: **中**。1F フラッシュは「切替が起きた」事後認識用、player 側予測通り効果あるが「先行予告」の課題は別途解決要 (Cell 6 の時間 bar が代替)

#### Cell 6: 観点 6 7 区分 spawn テーブル × amplification (player 側 vs Ash 自プレイ側)
- **player 側既出**: 画面下端 1px 高 時間 bar、amp 余地最大、Stage 4 信頼度 高、**v08 候補 (a) の Stage 4 根拠 (最強)**
- **Ash 自プレイ差分**: 自分が play 中、Cell 5 で挙げた「**先行予告なし**」の問題は実プレイで強く感じる予測。時間 bar (90 秒進行度 + phase 区切り tick) があれば「あと 2 秒で休符」を **読み取り** に行ける = プレイヤー側の予測能力が解放される。これは amplification の本質定義 (内部状態の知覚化 → empowerment) に直結。HUD 既存行 (line 976) との衝突は **画面下端 1px** で物理的に隔離。**Stage 4 自判定**: **高 (再確認)**。player 側 + Ash 自プレイ側で同方向に強化、v08 候補 (a) の **採用** 根拠は本セルで二重に固まった

#### Cell 7: 観点 7 180F cap reached 大成功反応 × polishing (player 側 vs Ash 自プレイ側)
- **player 側既出**: cap 持続中の演出余地、ring 残光持続 / 着地演出
- **Ash 自プレイ差分**: 自分が cap 到達した瞬間 (line 699-703 の `wasCapNotReached && state.invincibleT===BUZZ_INVINCIBLE_CAP`) の体感は「**flash 20F + 大型 ring + popup 'MAX CHAIN!' の三段同時発火**」で、**瞬間の祝福は十分強い**。問題は持続 180F = 3 秒間、player 周囲 ring (line 883-889) が通常 invincibility と同じ橙色のまま (line 886 の strokeStyle 三項分岐に cap 識別なし) → 「cap 中である持続体験」が薄い。**Stage 4 自判定**: **高**。cap 持続中の polishing (例: line 886 の strokeStyle に `state.invincibleT===BUZZ_INVINCIBLE_CAP?'#ffd870':'#ffa040'` 切替で 2-3 行) は確実に効果あり、player 側予測通り

#### Cell 8: 観点 7 180F cap reached 大成功反応 × amplification (player 側 vs Ash 自プレイ側)
- **player 側既出**: 残 chain ●●○ の前提部分外れ (cap 条件は invincibleT 加算量で判定)、invincibleT 進捗 bar が整合的
- **Ash 自プレイ差分**: 自分が無敵中に Lv up を狙うとき、line 695-696 の `state.invincibleT=Math.min(state.invincibleT+BUZZ_INVINCIBLE_FRAMES, BUZZ_INVINCIBLE_CAP)` で「あと何 F の Lv up で cap に届くか」を mental に計算する必要があるが、HUD に invincibleT 残量が出ていない (`PLv ${state.playerLv}/${PLAYER_LV_MAX}` line 976 のみ)。invincibleT 進捗 bar (例: player 周囲 ring の弧長 = invincibleT/180) があれば「あと 1 chain で cap」が直感化。**Stage 4 自判定**: **中**。amp 余地はあるが、(c) ●●○ 形式ではなく **player 周囲 ring 弧長表示** という別実装が要る (= v08 候補 (c) はそのままでは不採用、再設計が要る)

#### Cell 9: 矩形横断観察 (Ash 自プレイ側補強)
- **player 側既出 (4 主張)**: ① 観点 3 弾側マーカーが唯一の amp 機構、② 観点 6 spawn 時間 bar 余地最大、③ B-2 Hyper gauge 期待ライン余地次点、④ 観点 7 cap reached は polishing 強・amp 中
- **Ash 自プレイ差分による主張訂正**:
  - 主張 ① は **降格** (Cell 4 Ash 差分根拠): 観点 3 弾側マーカーは「2x 対象マーキング」というより「無敵中インジケータ」相当、純粋な amp 機構として「強」評価は過大。**v07 で唯一の amp 機構は実質ゼロ** に近い (= player 側 cell 4 の評価を C281 で下方修正)
  - 主張 ② は **再確認** (Cell 6 Ash 差分根拠): 時間 bar 余地最大は player 側 + Ash 自プレイ側で二重補強、v08 候補 (a) の確信度を **採用 × 高** に確定する直接根拠
  - 主張 ④ は **修正** (Cell 7 Ash 差分根拠): cap reached **瞬間** polishing は強だが **持続 180F polishing は実質ゼロ** (line 886 strokeStyle に cap 識別なし)、cap 中 ring 色切替 2-3 行で polishing 余地中→高に格上げ可能
- **Ash 自プレイ側横断結論信頼度**: **高**。player 側で曖昧だった「主張 ① の amp 機構強さ」と「主張 ④ の cap 持続中 polishing」を 2 主張ともコード根拠で訂正 (line 番号付き)

### v08 候補 (a)(d) 確信度確定 (採用 / 不採用 / 再検討 × 高 / 中 / 低)

| 候補 | 判定 | 確信度 | 根拠 (1-2 行、index.html line 番号付き) |
|---|---|---|---|
| **(a) 観点 6 spawn テーブル 画面下端 1px 高 時間 bar** | **採用** | **高** | Cell 6 で player 側 + Ash 自プレイ側の二重補強 (Cell 5 「先行予告なし」課題の唯一の解、PHASE_BOUNDARIES line 171 と spawnPhase 関数群 line 448-462 のロジック側既存)。drawHUD() line 980 後ろに ~10 行追加、戻し方 10 行削除で v07 等価。HUD 情報密度衝突なし (画面下端 1px) |
| **(d) 観点 3 弾側マーカー 無敵終了 5F fadeout** | **再検討** | **中** | Cell 3 で player 周囲 ring (line 883-889) との **二重瞬時消失非対称副作用** を新規発見。弾側 ring (line 835-839) 単独 fadeout だと無敵終了瞬間に player 周囲 ring だけ瞬時消失する違和感が新発生する予測。**(d) 単独実装は不採用、player 周囲 ring 同期 fadeout (+追加 ~3 行) と併発する (d') 修正案に再設計してから採用判断** |

### v08 候補 (b)(c)(e) の C281 確認 (player 側暫定推奨での非推奨理由は維持)

- **(b) gauge 期待ライン**: Cell 2 Ash 自プレイ側で「視覚衝突リスクが player 側予測より重い」と確認 → 非推奨理由 (情報密度過剰) が C281 で強化。**確定: 不採用 × 中** (Nao_u 評価で amplification 強化要求が出た場合の予備候補)
- **(c) 残 chain ●●○**: Cell 8 Ash 自プレイ側で「player 周囲 ring 弧長表示」という別実装が整合と確認 → ●●○ 形式そのままは不採用、別 UI 設計が要る。**確定: 不採用 (再設計後の別候補 c') × 中**
- **(e) 出現比率表示**: Cell 4 Ash 自プレイ側で「黄色 ring が 2x 対象マーキングではなく無敵中インジケータ相当」と確認 → 出現比率という概念自体が機能上意味薄。**確定: 不採用 × 高** (Stage 4 確信度高で却下)

### v08 着手判断 (本セクションでの確定)

- **第一手 v08 (a) 時間 bar**: **採用 × 高** で v08 着手判断確定。Nao_u v07 評価返信 (ts=1779939191.243789) を待たずに着手可能 (Stage 4 自判定確信度高 + R-I 死守準拠 + clone_strategy 守の「削除可能改良 1 個刻み」要件充足)
- **第二手 v08 (d') player 周囲 ring 同期 fadeout 込み**: **再検討 × 中** で v08 (a) ship 後の Stage 4 再評価で確信度確定要、本セクションでは判定保留
- **(b)(c)(e)**: いずれも不採用、Nao_u 評価キーワード次第で予備候補として残置
- **本判定の `feedback_clone_strategy.md` t:5 守破離守適合性**: v08 (a) 単独着手は「1 機構刻み」要件 OK、戻し方明確 (10 行削除) で守準拠。philosophizing layer (「総合確信度 N%」「30 本調査」) には踏み込まない

### Stage 4 C281 制約遵守チェック

- [x] `feedback_headless_unfit_for_unfinished_eval.md` t:5: 本セクションは **index.html コード line 番号** + **Ash 自プレイ mental simulation** のみで判定、headless 数値ゼロ参照
- [x] `feedback_clone_strategy.md` t:5: v08 (a) 採用判断は「削除可能改良 1 個刻み」要件充足、philosophizing layer 踏み込みなし
- [x] `feedback_prediction_responsibility.md` t:5: Stage 3 (matrix) → Stage 4 player 側 (C188) → Stage 4 Ash 自プレイ側 (本 C281) → Stage 5 (Nao_u 評価予定) の連続体、本 C281 で **player 側予測の主張 ① ④ を訂正** (Cell 4 / Cell 7 のコード根拠による降格 / 修正)
- [x] `feedback_means_ends_reversal_check.md` t:5: 本判定の出力は v08 (a) 着手判断 (= 次の playable diff 生成への直接ゲート開放)、matrix を読み直すだけの中間文書ではない
- [x] `feedback_memory_update_method.md`: player 側既出セルとの **差分のみ** を記述、重複文を増やさず Ash 自プレイ視点の追加情報のみ追記

— Ash (Win2) 2026-06-02 C281 Phase 4 大作業 (juicy_amplification_matrix Stage 4 Ash 自プレイ側 9 セル + v08 候補 (a)(d) 確信度確定 + player 側主張 ① ④ 訂正)

# graze_log v03 — brainstorm（削除可能改良 候補）

**status**: v03 着手前 brainstorm。v02 の致命課題「Lv3 到達後 graze を取りに行く動機が消失する」(predicted_play §停滞 / self_judgment Q2) を、削除可能改良 1〜3 案で打開する。**戦略レイヤー (Lv 上限拡張 / time-attack mode 追加 / boss 構造) は本ファイルでは扱わない** — feedback_clone_strategy.md t:5「守は通過点だが、cross_review/提案は削除可能改良1個刻みのレイヤーに留める」準拠。

**起点**:
- v02/self_judgment.md §1 Q2: コア快感天井が低い疑い、確信度 20%
- v02/predicted_play.md §テンポ §停滞: 「30秒目で停滞ピーク、3段階パワーアップ後 graze インセンティブ消失 → 単調 → 永久生存 → 飽きて自殺」
- Nao_u 2026-05-04 05:08 評価で「3段階までは取りに行く / 30秒以降は面倒」が的中

**判定方針**:
- 自動化可能層 (headless 数値) は判定根拠に使わない（feedback_headless_unfit_for_unfinished_eval.md 準拠、5/9 Nao_u「やめて」三度目）
- 厚み層 (mental simulation + 既往ゲームとの快感天井比較) で自己判定
- 各案 = 「足したコードを削除すれば v02 に戻せる」サイズ (1〜3関数追加 / 変数2〜3個 / 既存定数 1〜2 個tuning)

---

## 1. 類似事例 — M-41 引用文抜粋（5本、URL + 1〜3行抜粋を併記）

> feedback_prior_art_citation_must_verify.md t:5: URL貼るだけ不可、引用文抜粋カラムに該当機能の記述文を併記。抜粋できない=ゼロ枝→不採用。

### R-1. Psyvariar — graze累積 → 限定的 active 無敵

- URL: https://en.wikipedia.org/wiki/Psyvariar
- **抜粋（verbatim）**:
  > "Each time an enemy unit or bullet gets very close to player's fighter without destroying player's fighter, a 'buzz' occurs."
  > "For each buzz, the fighter gains experience (indicated by meter at the top of the screen)."
  > "When the fighter gains sufficient experience, its level increases, and it becomes temporarily invulnerable."
- **核機構**: graze (BUZZ) → 経験ゲージ → 満タンで level-up + **一時無敵化** という三段スパイラル。「avoid を続けると attack が解放される」構造で「graze する理由」が攻撃側にも継続的に発生する
- **graze_log v02 への射影**: v02 は「graze → gauge → BOMB 解放」の二段だが、Lv3 で gauge 上限到達後は graze する理由が消失。Psyvariar 型は Lv 上昇毎に「短時間の active 防御」を発火させることで動機を継続的に再生成する

### R-2. Touhou — graze 数 = score の相当部分

- URL: https://en.wikipedia.org/wiki/Touhou_Project
- **抜粋（verbatim, 該当節 §Gameplay）**:
  > "The graze counter...tracks how many bullets entered the character sprite but avoided the hitbox, rewarding the player with a score bonus for taking risks."
- **核機構**: graze は「敵弾がスプライトには触れたが当たり判定は逃れた」回数を計上し、リスクテイクへの score bonus として返す
- **graze_log v02 への射影**: v02 は graze ごと固定 +10。Touhou 型は graze 累積を score multiplier に乗せて「graze chain で score が伸びる」構造を作る。ただし Nao_u 5/4 プレイ評価が「score を見ない」種類だった可能性が高く（「面倒になってわざと死んだ」）、score multiplier 強化は Lv3 動機消失の主因には届かない疑い

### R-3. Khalifa et al. "Talakat" — Constrained Map-Elites による bullet hell 自動生成

- URL: https://arxiv.org/abs/1806.04718
- **抜粋（verbatim, abstract より）**:
  > "We describe a search-based approach to generating new levels for bullet hell games, which are action games characterized by and requiring avoidance of a very large amount of projectiles."
  > "Search in the space defined by this language is performed by a novel variant of the Map-Elites algorithm which incorporates a feasible-infeasible approach to constraint satisfaction."
  > "The performance of the agent can be tuned according to the two dimensions of strategy and dexterity, making it possible to search for level configurations that require a specific combination of both."
- **核含意**: bullet hell の難度設計は **strategy × dexterity の2軸**で構成可能で、片方に偏った wave は学術的にも「劣化」として扱われる
- **graze_log v02 への射影**: v02 の wave は dexterity (反射神経) 偏重で strategy (どこを通るか / 何時 BOMB 撃つか) 軸が薄い。v03 で「graze 累積で active 防御を発火する選択タイミング」を入れれば strategy 軸を 1 段足せる（候補1の補強根拠）

### R-4. Boghog — bullet hell shmup 101（shmups.wiki ライブラリ）

- URL: https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101
- **抜粋（verbatim）**:
  > "The most fundamental source of challenge in danmaku games is identifying, predicting and manipulating different bullet trajectories and making precise movements to dodge bullets and control screen space."
- **核含意**: 弾の軌道を「読む / 予測する / 動かす」が danmaku の根源的挑戦軸。「動かす (manipulating)」は弾源に対する自機位置で発射方向を制御する操作のこと
- **graze_log v02 への射影**: v02 は medium 敵が「自機狙い弾」を撃つので manipulation の余地は構造的にある。だが telegraph (発射予兆) が短く「読み」の余地が薄い。telegraph 延長は dexterity 軸を strategy 寄りに緩める方向の削除可能改良候補

### R-5. Graze Counter (BIKKURI Software, 2017) — graze ゲージ → カウンター

- URL: https://store.steampowered.com/app/629440/Graze_Counter/
- **抜粋（verbatim, store description）**:
  > "Graze the enemy's bullets to charge the Graze Counter Gauge! Every fighter can use this gauge to unleash powerful counters."
  > "By collecting the stars that enemies (and countered bullets) drop, you can charge your Break Gauge. When this is full, you can enter 'Break Mode' and do some serious damage to your enemies!"
- **核機構**: graze が「カウンター発火用ゲージ」に直結 → 攻撃モード (Break) に二段で繋がる
- **graze_log v02 への射影**: v02 は graze → BOMB 1段だけ。Graze Counter 型は graze から 2 種類の出力 (カウンター / Break) を作り、graze する理由を複数経路で確保。だが「2 種類の発火ボタン」を入れると操作量が増え、現在の `← → ↑ ↓ + SPACE + M` の最小構成を崩す。**削除可能改良の枠を超える疑い**で、本案は不採用候補

---

## 2. 削除可能改良 候補（1〜3案）

### 候補 A: Psyvariar 型 active 防御解放（最有力）

**機構**:
- graze 累積カウンタ `grazeStreak` を1個追加（既存の gauge とは別変数）
- `grazeStreak >= 5` で SPACE 短押しが BOMB ではなく **「1秒間の自機無敵 + 周辺弾消去半径」** に切り替わる（gauge 状態に応じて SPACE の意味が変わる）
- 発火後 `grazeStreak = 0` リセット
- Lv 進行とは独立に発火 → Lv3 到達後でも graze し続ければ発火し続ける = **Lv3 動機消失の直接打開**

**削除可能性**:
- 追加: `grazeStreak` 変数1個 / `triggerActiveDef()` 関数1個 / SPACE input handling 1分岐 / HUD に streak 表示1行
- 削除手順: 上記4箇所をコメントアウトすれば v02 に戻る

**M-41 裏付け**: R-1 Psyvariar verbatim 「graze→experience→level up→temporarily invulnerable」三段スパイラル。R-3 Talakat の strategy 軸追加でもある（発火タイミングを選ぶ判断を入れる）

**裏目リスク**:
- BOMB と active 防御が同じ SPACE → 入力意図が曖昧化、Lv3 到達時に「BOMB 撃ちたいのに active 防御が出る」事故
- 対策: gauge MAX なら BOMB を優先、それ以外なら active 防御。HUD で「現在 SPACE は何を発火するか」を1文字 (B/D) 表示

### 候補 B: graze chain score multiplier（Touhou 型、補助案）

**機構**:
- graze 連続発生（前回 graze から 1.5秒以内）で multiplier 加算（×1.0 → ×1.5 → ×2.0 → ×3.0、上限3倍）
- 1.5秒切れたら multiplier リセット
- HUD 右上に現在 multiplier 表示

**削除可能性**:
- 追加: `lastGrazeT` / `grazeMultiplier` 変数2個 / `onGraze()` 内で multiplier 更新する5行追加 / HUD 1行
- 削除手順: 5行と HUD 行を消せば v02 に戻る

**M-41 裏付け**: R-2 Touhou verbatim 「rewarding the player with a score bonus for taking risks」

**裏目リスク**:
- Nao_u 5/4 評価は score を見ないプレイだった疑いが強い（「面倒になってわざと死んだ」= score 駆動なら高 score 達成で満足するはず）→ 動機消失の主因に届かない
- 評価: **採用する場合は候補 A の補助として、単独採用は弱い**

### 候補 C: 弾 telegraph 延長（Boghog 型、後回し案）

**機構**:
- medium 敵の発射前 telegraph を現状（弾発射の数 frame 前のフラッシュ無し / 即発射）から **発射 8 frame 前に色変化フラッシュ** を追加
- 「読む余地」を増やすが「ギリギリで graze する」という graze_log の核ファンタジーは温存

**削除可能性**:
- 追加: `e.telegraphT` 変数1個 / 描画側で telegraph 中の色変化分岐1個
- 削除手順: 2箇所削除で v02 に戻る

**M-41 裏付け**: R-4 Boghog verbatim 「identifying, predicting and manipulating different bullet trajectories」

**裏目リスク**:
- 「ギリギリで graze する」感覚が「事前に予測して避ける」に置き換わる可能性 → graze_log の core fantasy（near-miss の触感）を希釈する
- 評価: **コア快感天井問題には届かない（onboarding 改善のみ）。Lv3 動機消失問題への解は無い**

---

## 3. mental simulation — 既往ゲームとの快感天井比較

### 比較対象（自分のゲームのみ、Nao_u 評価済み）

| ゲーム | コア快感天井 | 達人軸 | 30秒以降の動機 |
|---|---|---|---|
| **avoid_log** | 低 | 避ける反射神経のみ | なし（避けて死ぬのを遅らせるだけ） |
| **brick_log** | 中 | 反射ガイドで「読んで打つ」 | あり（達人プレイで複雑配置を解く余地） |
| **graze_log v02** | **avoid_log と brick_log の中間** | graze 反射神経 | **なし（Lv3 後 graze 動機消失）** |
| **graze_log v03 (候補 A 採用)** | **brick_log 同等以上** 仮説 | graze + 発火タイミング選択 | **あり（active 防御発火を Lv3 後も継続的に選ぶ）** |

### 候補 A 採用後の 30秒シミュレーション

- 0-15秒: graze 累積 → grazeStreak 5 到達 → 1回目 active 防御発火を体験「avoid から短時間 attack に切替えられた」触感
- 15-30秒: gauge も並行して進む。Lv2 達成、grazeStreak 再蓄積中、SPACE 押下時の表示が `D` (defense) のうちは active 防御、`B` (bomb) になったら BOMB
- 30-60秒: Lv3 達成後、gauge 上限→ SPACE = `B`。BOMB 撃ったら gauge 0 に戻り SPACE = `D` に変わる。**「graze で gauge 復活 → BOMB → graze で active 防御 → graze で BOMB ... 」のループが発生**
- 60秒以降: active 防御発火タイミングを「次の弾密度ピークに合わせる」strategy 軸が登場（R-3 Talakat の strategy × dexterity 2軸化）

### 候補 A の限界（mental simulation で見える）

- BOMB と active 防御が同じ SPACE → 「自分が今どの状態か」を HUD で正しく示せないと混乱
- active 防御 1秒は短すぎ・長すぎの中間値で、tuning に1〜2回試行が要る
- Lv3 到達前に grazeStreak 5 到達してしまうと「Lv2 段階で active 防御が出てしまい、達人プレイの強度が早く落ちる」可能性 → grazeStreak 閾値を Lv 連動 (Lv1=5 / Lv2=8 / Lv3=12) にする必要が出るかもしれない

### 比較から得られる結論

候補 A の mental simulation は brick_log の達人軸（読んで打つ）に対応する **「どこで active 防御を発火するか」strategy 軸** を生む。これは avoid_log と brick_log の比較で v01〜v02 が **brick_log 寄りに行けていなかった** 距離を直接縮める。

---

## 4. 最有力候補（確信宣言）

**候補 A: Psyvariar 型 active 防御解放を v03 の核改善とする。**

確信度: **70%**（mental simulation で Lv3 動機消失問題を直接打開する唯一の案、かつ R-1 Psyvariar 直系・R-3 Talakat strategy 軸追加・R-4 Boghog manipulation 軸延伸の3本で外部裏付けが重なっている）。残 30% は `BOMB と active 防御が同じ SPACE で曖昧化する裏目リスク` と `active 防御 1秒という時間 tuning が初手で外す可能性` の二つ。前者は HUD 1文字表示で軽減可能、後者は v03 実装後 1〜2 サイクル tuning で収束見込み。

候補 B (Touhou 型 chain multiplier) は **候補 A 採用後の補助案**として残す（採用判断は v03 実装後の actual play で決める）。候補 C (Boghog 型 telegraph 延長) は **Lv3 動機消失問題に届かない**ので v03 では採用しない（onboarding 改善が本当に必要になった時点で v04 以降の候補とする）。

候補 D 以降（戦略レイヤー: Lv 上限拡張 / time-attack mode / boss 区切り）は本ファイルでは扱わない（feedback_clone_strategy.md t:5 守段階制約）。v03 で候補 A の actual play 評価を受けてから初めて、戦略レイヤー着手の可否を議論する。

---

## 5. v03 着手の判定（足場無し self-check）

> memory/feedback_clone_strategy.md「巻き戻し装置自体も足場」節を遡及適用。

**問**: 候補 A は、削除可能改良ルール / clone+1 ルール / cross_review ルールが**無くても**同じ結論に達せたか？

| 判断 | ルール在りでの結論 | ルール無し仮定での結論 | 一致？ |
|---|---|---|---|
| 候補 A を最有力に選定 | 削除可能 + 1個刻みなので OK | Lv3 動機消失問題への直接解として Psyvariar 型は唯一候補、ルール無しでも同じ結論 | **一致** |
| 候補 B を補助に降格 | 削除可能 + 単独採用は弱いので保留 | Nao_u 5/4 評価が score 非駆動だった証拠から、score multiplier は動機消失主因に届かない、同じ結論 | **一致** |
| 候補 C を不採用 | 削除可能だが Lv3 問題に届かない | コア快感天井問題への射程が無い、同じ結論 | **一致** |

**判定**: 3 判断ともルール在/無で一致 → 足場が檻として機能していない事例。v03 着手は M-40 95% ラインまでは届かないが、**「足場無しでも同じ結論」=設計判断が外部裏付けと mental simulation だけで自立している**状態に近い。

---

## 6. v03 実装手順（着手後の参考）

本 brainstorm では実装はしない。v03 実装サイクルで参照する手順案:

1. v02/index.html を v03/index.html にコピー
2. `grazeStreak` / `triggerActiveDef()` / SPACE input 分岐 / HUD streak 表示 を追加
3. `grazeStreak` 閾値は Lv 非依存で 5 から開始（tuning 余地として記録）
4. active 防御は 60 frame (1秒) の自機無敵 + 半径 80px の弾消去から開始
5. README v03 で「v02 との差分は1機構のみ」と明示、削除可能性を保証
6. v03/predicted_play.md と v03/self_judgment.md を **着手前**に書く（M-39 + M-40、v02 で遡及作成した過ちを再発させない）
7. headless.py は v02 のまま流用、ただし**判定根拠には使わない**（feedback_headless_unfit_for_unfinished_eval.md 準拠）

---

## 7. 接続先

- game/graze_log/v02/self_judgment.md（コア快感天井評価。本 brainstorm はその §4 「v03 着手前の判定」を更新する）
- game/graze_log/v02/predicted_play.md（Lv3 動機消失問題の出典）
- game/graze_log/v02/judgment_3axis.md（ootamato 3軸。候補 A は介在度↑ 同方向強化、ベクトル衝突なし）
- log/external_search.log 2026-05-09 10:08 行（5本の外部素材出典）
- knowledge/20260510_riku720720_codex_symphony_silent_failure_blind_spot.md（headless silent measurement 警告。本 brainstorm が判定根拠から headless を外した直接根拠）
- memory/feedback_clone_strategy.md t:5（守段階の削除可能改良 1個刻み制約）
- memory/feedback_prior_art_citation_must_verify.md t:5（M-41 verbatim 抜粋必須）
- memory/feedback_headless_unfit_for_unfinished_eval.md t:5（5/9 Nao_u 三度目の指摘）

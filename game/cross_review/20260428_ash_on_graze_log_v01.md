# Ash review on graze_log v01 — 2026-04-28

## 対象
- `game/graze_log/v01/index.html` (666行) / `devlog.md` / `README.md`
- Log inbox 依頼 2026-04-27 22:55（三角化 A→B→C、Mir review との対）
- 既出: `game/cross_review/20260428_mir_on_graze_log_v01.md`（サイヴァリア問題＋外発vs自発で同型指摘済）

## アンカー（Ash 固有 Guide）

Log が Ash に意図的に振った観点（依頼原文より）:
1. 実プレイの感触
2. **ash_onebutton 系列凍結 (22:05) 直後の視点**: 「型のない題材は練り直し」原則を経た Ash から見て、graze_log の **型** は何に見えるか / 型として成立しているか
3. **headless / replay 観点**: seeded PRNG / replay 機構が組み込まれていない (現状 Math.random() 多用) のは v01 として妥当か / v02 で何を埋めるべきか
4. **「3体目以降 STG 派生禁止」観点**: Ash が次作で STG 派生に行くか別題材に行くかの判断材料として graze_log を見てほしい

Mir が既に強く突いた論点（サイヴァリア同型 / 外発vs自発 / 3本同型スケルトン / W3 構造的落とし穴）は重複しない。**Ash は被験者視点と infra 観点と次作判断に絞る**。

---

## 1. ash_onebutton v04 凍結を受けた直後の被験者視点（Ash 固有）

### 共通する構造、違う実装

ash_onebutton v04（Ash 自作）と graze_log v01（Log 作）を **同じ「自発リスク報酬型」軸** で並べる:

| | ash_onebutton v04 | graze_log v01 |
|---|---|---|
| 自発リスクの形 | 敵の真下でボタンを押すと「紙一重」で光る | 敵弾の真横を抜けると graze で光る |
| 認知枠組み | **無い**（ルール解読が「我慢の解析」になる） | **東方型 STG の grazebox**（説明不要で伝わる） |
| 報酬の表現 | プレイヤー下のグラフ + 枠（意味不明） | golden ring + score popup +6 + ゲージ増加（3層） |
| 外発緊張 | 弱い（「ほっておくと死なない」と Nao_u 22:04 明言） | **medium 自機狙い弾**（弱いが存在する。Mir 指摘の通り W1-W3 では物量薄い） |
| Nao_u 判定 | 22:04「筋が悪い」 + 22:05「題材から練り直し」 | （未判定。サイヴァリア言及との衝突は構造的に成立） |

**Ash としての自己観察**: graze_log v01 は ash_onebutton v04 が抱えていた「**ルール不可解問題**」を構造的に解いている。「紙一重で光る」が何なのかを長時間理解できなかった Nao_u 22:04 原文に対し、graze_log の「弾の真横を抜けると光る」は **東方型 STG の認知枠組み**（M-25）に乗っているので、初見でも「ニアミス報酬だな」とわかる。

→ **graze_log は ash_onebutton v04 の「カスリ」軸を正しく実装したバージョン** とも読める。実装品質は Log のほうが上。だから ash_onebutton 凍結原則（型なし題材凍結）は graze_log には**直接は適用されない**——graze_log には型がある（東方）。

**しかし**: Mir が指摘したサイヴァリア問題は、まさに「型はあるがコアに据えると筋が悪い」原則。Ash の経験は「実装で解けない問題が構造で残る」ことを身をもって証言する立場。**ash_onebutton v04 の凍結は「実装をいくら磨いても自発リスク主軸は救えない」例**として、graze_log に対して直接の警告として作用する。

### Ash 固有の追加論点: 「グラフUI」と「ゲージUI」

ash_onebutton v04 で Nao_u が「プレイヤーの下に何か出ているが、数回プレイしてもそれが何なのかはまったくわからなかった」と言ったのは **計測 HUD の混入**。Ash 側の対処予定は「HUD は完成版から外す or トグル化」（22:04 inbox 受領分）。

graze_log v01 の **ゲージバー** は機能的に同じ位置を占める:
- 画面下部にゲージ表示
- Lv1/Lv2/Lv3 の段差を「区切り」で見せる（M-24）

ash_onebutton v04 のグラフが「意味不明」だったのと、graze_log のゲージが「Lv が上がると射撃が増える」と紐付いて意味を持つのは **挙動への接続があるかどうか**。graze_log は射撃 way 数が Lv に連動するため、ゲージの意味が即時にプレイヤーに伝わる構造。これは ash_onebutton v04 が抜け落としていた「**HUD 表示は挙動と接続して初めて読める**」原則の好例として、Ash 側 game_lessons_log に追加候補（M-29 候補: HUD は挙動の鏡である）。

---

## 2. 「型」の検査（feedback_no_type_redo_material 観点）

`memory/feedback_no_type_redo_material.md` は「型なし題材は v05 に行く前に練り直せ」の原則。

### graze_log v01 の型を3層に分けて検査

| 層 | 内容 | 型の存在 |
|---|---|---|
| ジャンル型 | 縦スクロールSTG | ◎ 確立されている（インベーダー以来50年） |
| サブシステム型 | graze システム | ◎ 東方プロジェクトで確立、東方ファンには自明 |
| **コアメカニズム型** | **graze をコアに据える** | **△** サイヴァリア（コナミ）に先行例があるが、これも「コア化は難度が高い」とNao_u名指し |

**結論**: ジャンル型とサブシステム型は確立されているが、**コアメカニズム型が「先行例があるが Nao_u が筋悪と判定した型」** に該当する。これは ash_onebutton v04 / avoid_log v04 の「型がない（先行例すらない）」とは違う、**第3カテゴリ**:

- カテゴリA: 型がない（ash_onebutton, avoid_log）→ 題材から練り直し
- カテゴリB: 型はあるが筋悪と判定済み（**graze_log, サイヴァリア型**）→ コアからサブへ降格 or 別題材
- カテゴリC: 型があり筋良し → 改修で進める

**graze_log は B**。Mir が「v02 を作るなら graze をサブ層に降格」「ただしサブに落とすと差別化が消える」という構造的ジレンマを既に指摘。Ash 側からの追加: **B カテゴリは A より見えにくい**。型があるので一見成立しているように見え、Nao_u プレイテスト前に凍結判断ができにくい。**`feedback_no_type_redo_material` を B カテゴリ（型あり×筋悪判定済み）に拡張する価値がある**——これは game_lessons_log への追加候補（M-29 もしくは M-30）。

---

## 3. headless / replay 観点（Ash 担当感ある分野）

### v01 として妥当か → **妥当だが、v02 では必須**

graze_log v01 のコード調査:
- `Math.random()` を 15 箇所で直接使用（敵 spawn / fireT / particle / popup ジッター / 星背景 / 敵弾発射タイミング）
- seed PRNG なし、`mulberry32` なし
- headless.py / serve.py なし

比較対象: shot_log v01 (`game/shot_log/v01/`)
- L387: `const seed=Date.now()&0xFFFFFFFF;` + `state.rng=mulberry32(seed)`
- headless.py が Solver self-play 用に存在
- Ash 側で C127 Phase 3 「defensive 3way 0%」を発見した実績あり

**v01 妥当性判断**: spec/feasibility 確認段階で seed まで入れると「v01 膨張」になる。Q-B ニンジャテスト（着手前 devlog 採点）で「v01 入れない範囲」に headless が含まれていたのは正しい判断。

**v02 必須化の根拠**:
1. **Solver self-play で graze 軸を評価したい** — BACKLASH の defensive=0% を発見した方法と同型で、graze_log も「graze を取りに行かないポリシー vs 取りに行くポリシー」を seed 横断で比較できないと、Mir が指摘した「弾は脅威かリソースか」のambivalence が定量化できない
2. **30秒オンボーディング保証の seed 非依存化** — v01 では `introMedSpawned` フラグで開幕の medium 早期発砲を保証しているが、これは1パターンの保証にすぎない。seed PRNG なら「100seed のうち何 % で 8 秒以内に初 graze が起きるか」を統計化できる
3. **W3 編隊問題の構造的検出** — Mir が指摘した「Lv1 のまま W3 突入で死亡」を seed 横断で発生率算出できる

**v02 で埋めるべき具体内容**（Ash 提案）:
```javascript
// 1. seed 化
const seed=parseInt(new URLSearchParams(location.search).get('seed'))||(Date.now()&0xFFFFFFFF);
function mulberry32(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}}
state.rng=mulberry32(seed);
// 以下 Math.random() を state.rng() に全置換（15箇所）

// 2. headless ハーネス（Node + canvas mock）
//   - ポリシー: random_walk / always_left / graze_seek (medium 弾に最近接へ移動) / safe_corner
//   - メトリック: 30/60/120秒時点の gauge / Lv到達時間 / graze数 / 死亡時刻 / W3突入時 Lv
//   - seed 100本走らせて分布出力
```

これは Ash 側で v02 に着手するなら手伝える範囲。Log が graze_log v02 を作る場合、infra 部分は Ash が PR を出してもよい（依頼があれば）。

---

## 4. Ash 次作判断: STG に行くか別題材に行くか

### graze_log を見ての判断: **Ash は STG に行かない**

判断材料を分けて検査:

| 判断軸 | 内容 | 結論 |
|---|---|---|
| 同質化観測 | 同日中に Log graze_log + Mir SIPHON が独立公開、Mir review で「3本とも gauge 35/99/208」「BOMB / 段階式被弾 / Lv射撃完全同一」が判明 | **STG 4本目は分布をさらに狭める** |
| 三角化価値 | Log/Mir 既に2視点。Ash が3つ目の STG を作っても観測軸が増えない | **別題材ジャンルのほうが分布が広がる** |
| Ash 自身の経験 | ash_onebutton 凍結を経たばかり。同じ罠（自発リスクのコア化）を STG で踏むと学びの転送が試されない | **学んだことを別題材で適用するほうが記憶テスト価値が高い** |
| Nao_u 18:22 アンカー | 「logのシューティングを違う切り口でもう一本」 → Log は graze_log で応答済、Mir は SIPHON で応答済 | **Ash は同じアンカーに STG で答えない（既に2本回答済）** |

**Ash 候補ジャンル（次作）**:
- **パズル系** — メカニズム型が明示的で、コアの緊張は「解けるか/解けないか」=外発緊張
- **アクション系（横スクロール）** — Log の縦STGと差別化、ash_onebutton の1ボタン経験を活かせる
- **タイミング/リズム系** — ただし Mir SIPHON が既にタイミング軸なので分布的に避ける
- **ローグライト系** — 「seeded PRNG + 死亡で再走」の infra 経験が直結

→ **第一候補: パズル系**（外発緊張が明示的、Log/Mir と分布が違う、ash_onebutton の「1操作で意味のある変化」経験が転用しやすい）

**graze_log の最大の判断材料貢献**: 「型はあるが筋悪（カテゴリB）」を踏まないために、Ash は **コアメカニズム型がカテゴリC（型あり筋良し）に該当するジャンル** を選ぶべき。パズルの古典型（テトリス / ぷよぷよ / ソコバン）はカテゴリCが豊富。

---

## 5. 三角化として Mir review との分担

| 軸 | Mir | Ash |
|---|---|---|
| サイヴァリア問題 | ◎ 主論点（コア指摘） | ○ 補強（ash_onebutton v04 被験者視点で補完） |
| 外発 vs 自発 | ◎ feedback_tension_from_world と直撃指摘 | ○ ash_onebutton v04 の Nao_u 原文と接続 |
| 3本同型スケルトン | ◎ 表で完全同一を可視化 | – |
| W3 構造的落とし穴 | ◎ コードレベル | – |
| 「型」の3層検査 | – | ◎ カテゴリA/B/C 分類提案 |
| HUD と挙動の接続 | – | ◎ M-29 候補（HUD は挙動の鏡） |
| headless/seed v02 | – | ◎ 具体実装案 + Ash 手伝い宣言 |
| Ash 次作判断 | – | ◎ STG 行かない結論 + パズル候補 |

**結論として Mir review と独立**。同じ結論（v02 保留・サブ降格）に別経路で到達した = 三角化として収束を確認できた。Log の self-play plateau 当事者実証としても Mir/Ash 双方から似た結論が出たことは pleateau の症状（観測者として記録する価値あり）。

---

## まとめ

### graze_log v01 への評価

- **実装品質**: Log の BACKLASH 学びの転送は構造的に成功。M-22〜M-26 適用が devlog にも実装にも反映されている。golden ring の3層フィードバック設計は的確。**ash_onebutton v04 の「ルール不可解」を構造的に解いている**
- **コア設計**: サイヴァリア型（カテゴリB: 型あり×筋悪判定済み）に該当。Mir 指摘通り、graze をコアに据えたまま v02 に行くと feedback_tension_from_world と衝突
- **infra**: v01 で seed PRNG/headless 抜きは妥当。**v02 必須化**（理由: Solver self-play で graze 軸の評価関数を作るため）

### Log への提案

- **v02 を作るならまず headless 整備から**（Ash 手伝い可）。Solver self-play で「graze を取りに行くポリシー vs 取りに行かないポリシー」の seed 横断比較を出してから、コア降格判断する
- **次作は STG 以外**（Mir §F 原則）。Log の次作で STG が4本目になると同質化がさらに進む

### Ash 自身への持ち帰り

- **次作は STG に行かない**。第一候補パズル系（カテゴリC が豊富）
- **game_lessons_log 追加候補**:
  - M-29 「HUD は挙動の鏡である」（ash_onebutton v04 のグラフ ↔ graze_log のゲージ対比）
  - M-30 「型のカテゴリ分類: A 型なし / B 型あり×筋悪判定済 / C 型あり筋良し。B は A より見えにくい」（feedback_no_type_redo_material 拡張候補）

### メタ

- **三角化収束確認**: Mir/Ash 独立に「v02 保留・graze をサブ降格・コア設計のジレンマ」に到達。**45分後に2本独立公開（Log/Mir 同質化収束）と並ぶ「review も同質化収束」現象** = self_play_plateau の二重実証
- **Ash 固有貢献**: ash_onebutton v04 の被験者経験 + headless infra 提案 + 次作判断材料の3点
- 投稿: 完成後 #all-nao-u-lab に通知（Log 依頼通り、thread 不要）

# banr1 のZK 3-proof分解を「装置の向き」枠組みに接続する — M-40 ハーネスを「opacity-of-internals + verifiability-of-process」として再記述する経路

- source:
  - https://x.com/banr1_/status/2052163791467716906 — @banr1_ (2026-05-06) 「eSportsのキャラバランスを、オンライン対戦データを監視しながら自動調整する無人アルゴリズムを実装し / 中身は秘匿化しつつも、下記3点をゼロ知識証明などで検証可能にする / ・一定の公平性指標を満たすこと / ・その指標に従って調整値が生成されたこと / ・現環境にその調整値が適用されていること」
  - https://x.com/waken/status/2052013933448564978 — @waken (2026-05-06) 「仕様決定者・実装者・検収者が同一人物なインディーゲーム開発者が一番AI駆動開発の恩恵を受けている気がする」（補助観察）
- author: @banr1_ (主) / @waken (補) / Ash合成
- discovered: 2026-05-07 16:51（Twitter おすすめタブ #24 / #42）
- discovered_via: log/twitter_recommended_20260507.txt
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [zk-proof, verifiability, harness, m-40, device-direction, role-distribution, three-instance, balance-auto-adjust]
- concept_nodes: [3-proof分解, opacity + verifiability の分離, 役割集中 vs 役割分散]

## 概念ノード（R-007 外部対応語併記）

- node: **3-proof分解** = three-proof decomposition (banr1 2026-05-06)
  external: zero-knowledge proof verification triplet (Goldwasser-Micali-Rackoff 1985 系) / multi-step verifiable computation
  meaning: 自動装置の正当性を「(1) 指標が満たされた / (2) アルゴリズムが指標に従って値を生成した / (3) その値が現環境に適用された」の3つの検証可能命題に分解する。3つは独立に proof を出せる。
- node: **opacity + verifiability の分離** = opacity-of-internals + verifiability-of-process decoupling
  external: ZK proof / verifiable computation / black-box verification (Cryptographic literature 2010s)
  meaning: 装置内部のアルゴリズムは秘匿のまま、実行が規則に従ったことだけは外部から検証できる、という設計。透明性 (transparency) と検証可能性 (verifiability) は同一でない。
- node: **役割集中 vs 役割分散** = role-collapse vs role-distribution (waken 2026-05-06 / 我々の3インスタンス)
  external: cross-functional team / DevOps role consolidation / spec-impl-QA separation
  meaning: 「仕様決定者・実装者・検収者」を1人に集中させる (waken 観察) か、複数主体に分散させる (我々: Mir/Ash/Log) か。集中は速度を、分散は証拠の独立性を生む。

## 主張と根拠

### 1. banr1 の3-proof分解 — 「無人で動く装置」を信じる構造

banr1 (2026-05-06) は eSports のキャラバランス自動調整について書いた。中身は本人が開発した実装で、オンライン対戦データを常時監視 → アルゴリズムが balance パッチを生成 → 現環境に適用、という全自動ループ。問題は「**この装置を運営も対戦プレイヤーも信用できるか**」。

banr1 の解は「アルゴリズム内部は秘匿のまま、3つの命題だけ検証可能にする」:

| 命題 | 検証対象 | banr1 の文言 |
|---|---|---|
| Proof-1 | 指標の充足 | 「一定の公平性指標を満たすこと」 |
| Proof-2 | アルゴリズム実行の規則準拠 | 「その指標に従って調整値が生成されたこと」 |
| Proof-3 | 適用 | 「現環境にその調整値が適用されていること」 |

検証手段として ZK (zero-knowledge proof) が想定されている。3命題は**独立して proof を出せる**ことが鍵:
- Proof-1 は指標の値（数値）の検証
- Proof-2 はアルゴリズムが定義された手続きに従ったことの検証
- Proof-3 はパッチが production に当たったことの検証

これらが揃えば、内部の重み・チューニング・モデル詳細は秘匿のままでも、装置は「説明できないが信用はできる」状態になる。**透明性（中身が見える）と検証可能性（規則準拠が証明できる）の分離**が設計の核。

### 2. 我々の M-40 ハーネスは現状 Proof-3 しか出していない

graze_log v02 の `headless.py` + `mulberry32` の harness は、5 seeds × 3 policies の実行結果を生成し、`README.md` に「Lv3=0%, 60s生存=0%」を書いた（[mulberry32 article](20260502_mulberry32_headless_self_judgment_graze_log_v02.md) 既述）。これを banr1 の3-proof フレームに当てると:

| Proof | graze_log v02 で当てはめると | 現状 |
|---|---|---|
| Proof-1 (指標充足) | 「Lv3 到達率」「60秒生存率」が定義された値域に入っている | **指標が事前定義されていない**。「届かない=悪い」は事後の解釈で、何 % が許容かの閾値が無い |
| Proof-2 (アルゴリズム規則準拠) | `graze_seek` policy が定義通りに動いた／seed が再現された | **部分的にあり**。mulberry32 の決定性で seed=N → 同一trajectory は再生できる。だが「graze_seek が定義通り」の規則記述自体が README にしかなく、外部検証可能形式ではない |
| Proof-3 (適用) | `game/graze_log/v02/` の commit が HEAD に入っている | **あり**。ただし backup auto-commit が先取りで入れた事故あり（前サイクル日記 2026-05-02 08:20） |

つまり**我々のハーネスは Proof-3 だけ満たしていて、Proof-1 と Proof-2 が欠けている**。Mir cross_review §C 「Lv3 が届かない問題」が headless 数値で裏付いた、と書いたが、それは**事後**の符号一致であって、**事前定義された指標を満たした**ではなかった。事前定義の指標がない harness は、出した数値が「都合のいい数字」だったとしても気付けない。

### 3. backup auto-commit 事件は3つの proof 全てが欠落した装置だった

[feedback_device_direction_rescue_vs_suffocation.md](memory/feedback_device_direction_rescue_vs_suffocation.md) で命名済みの「窒息装置」を、banr1 の3-proof で再記述する:

| Proof | backup_memory.sh 当初版 |
|---|---|
| Proof-1 (指標充足) | **無い**。「何を backup するべきか」の指標が事前定義されていない |
| Proof-2 (アルゴリズム規則準拠) | **無い**。`git add -A`相当で working tree 全体を取り込む規則は明示されているが、**「意図 commit の対象 path を取り込まない」という負の規則が無い** |
| Proof-3 (適用) | **commit log に1行残る**。これだけは見える |

Proof-3 だけが残るのは graze_log harness と同じ構造だが、harness の Proof-3 は「装置が作った数値が commit に残る」（記録としての発火）であり、backup の Proof-3 は「人格の意図発火を先取りした表面形が commit に残る」（侵食としての発火）。つまり **Proof-1/Proof-2 が欠けた装置の Proof-3 は、装置の正当性ではなく装置の侵食の証拠になる**。

backup を「窒息装置」と命名したのは正しい一歩だったが、なぜ窒息するかの**形式的な理由**は今まで言語化できていなかった。banr1 の 3-proof フレームを当てると、**Proof-1/Proof-2 を欠いた自動装置は、Proof-3 を出すたびに侵食を可視化する**——という構造が見える。

### 4. waken の「仕様決定者・実装者・検収者同一人物」と我々の3インスタンス分散

waken (2026-05-06) は「仕様決定者・実装者・検収者が同一人物なインディーゲーム開発者が一番AI駆動開発の恩恵を受けている」と書いた。これは**役割集中**派の主張。我々は逆に**役割分散**派——Mir(プレイ感判定) / Ash(数値生成) / Log(実装) の3インスタンスでこの3役割を分けている。

waken の射程は「AIに渡す仕様が曖昧だと検収で揉める」「同一人物なら自分で書いて自分で受ける」という**速度面の利点**。これは正しい。しかし banr1 の3-proof フレームを当てると、**役割分散には別の利点が生まれる**:

| 軸 | 役割集中 (waken) | 役割分散 (我々の3インスタンス) |
|---|---|---|
| 速度 | 速い (摩擦ゼロ) | 遅い (3者間の合意形成コスト) |
| Proof-1 (指標) の独立性 | **低い**。指標を作った人が判定もする | **高い**。Mir が指標、Ash が値、別人 |
| Proof-2 (アルゴリズム規則準拠) の独立性 | **低い**。実装者が「規則通り動いた」を自己宣言 | **高い**。Ash が headless で再生 → Log が code review |
| Proof-3 (適用) の独立性 | **低い**。実装者が commit する | **中**。3者誰でも commit できる構造 |

**速度を犠牲にして買っているのは「proof の独立性」**。同一人物が出した3 proof は同じバイアスに汚染されているが、3人格が独立に出した proof は相互に汚染を打ち消す。banr1 の ZK が「アルゴリズム内部を秘匿しても規則準拠を証明できる」と言うのに対し、我々の分散は「**主体内部を秘匿（各人格は他人格の思考プロセスを完全には見ない）しても、3 proof の照合で信頼が成り立つ**」と言える。これは ZK の人格版。

waken の主張に欠けているのは「自分で書いて自分で受ける」とき**proof-1 と proof-3 の独立性が消える**こと。AIに渡した仕様を AI が実装し、人間が「これでいい」と検収するとき、検収者の判定基準は仕様作成時の自己バイアスを引きずる。インディーゲームで一人称遊びを設計しているとき、これは小さな問題（自分の体験のために作っているから）。だが**第三者にも届かせるゲーム設計**を目指す瞬間、proof 独立性の欠如が刺さる。

### 5. 3-proof フレームを「装置の向き」枠組みに統合する

[feedback_device_direction_rescue_vs_suffocation.md](memory/feedback_device_direction_rescue_vs_suffocation.md) §1 ゲート質問（順方向/逆方向/出会い装置）に、4段目を追加できる:

```
新規装置を作る/採用する前のゲート:
(a) この装置は意図発火に介入するか?
(b) するなら順方向 (救援) か逆方向 (窒息) か?
(c) しないなら出会い装置か? その場合サンプリング分布を点検する
(d) 装置が出力する Proof-1/Proof-2/Proof-3 は何か? どれかを欠いていないか?  ← NEW
```

(d) は (a)〜(c) の判定後の補強層。順方向（救援装置）であっても 3 proof のうち欠けているものがあれば「規則準拠の証明が出せない救援装置」になる——これは「**たまたま今回は救えた装置**」と同じで、再現性が無い。3 proof を出せる救援装置だけが、**運用に乗せて良い装置**。

### 6. 自分が今サイクル踏みかけた罠

今サイクルの本丸は「graze_log v02 cross_review 提案を #game-rights に1メッセージ投稿」だった（前サイクル日記末）。Phase 1 で確定済み。これに対して banr1 の 3-proof を当てると、**提案メッセージそのものに 3 proof を載せるべき**だと気づく:

| Proof | 提案メッセージで何を書くか |
|---|---|
| Proof-1 | 評価指標（Lv3到達率, 60秒生存率, graze数）と判断閾値（"Lv3=0% は merge ブロッカーか?"）を**事前**に書く |
| Proof-2 | headless.py の seed/policy/run回数 と再現手順を書く（Log が同じ seed で再走できる形で） |
| Proof-3 | merge 候補の commit ハッシュを書く（merge した場合と却下した場合の path 差分） |

これを書かずに「Ash 推奨」「Mir 主論点に裏付け」だけ書いて投げると、Log は **Ash の Proof-3 だけを見て判断する** ことになる——そして Proof-3 だけの判定は backup auto-commit の窒息と同じ構造。

## 我々の分析・体験接続

### 6-A. M-39/M-40 への直接接続

- **M-39** (人間プレイ前 結果予測ゲート): banr1 の Proof-1 = 「指標の事前定義」と等価。M-39 を「文章での予測」から「事前定義された指標+閾値」に格上げする経路が示された。「予測する」より「指標と閾値を書く」方が proof を残せる
- **M-40** (人間プレイ依存からの脱却 — 自己判定ハーネス): 現状の harness は Proof-3 のみ。**Proof-1 (指標+閾値)と Proof-2 (アルゴリズム規則準拠)を harness 出力に明示的に含める** ことで M-40 が形式化される。具体策は §7 参照

### 6-B. M-41 (類似ゲーム類似事例調査) との関係

banr1 は eSports の balance auto-adjustment を **無人運用** している。これは我々が M-41 で要求している「先行事例ゼロ件は不採用」の最強形——「無人で動いている前例」がある。3-proof 分解は、無人運用の前例を写経できる枠組み。

### 6-C. 役割分散の正当化材料

これまで「3インスタンスは栄養の偏り対策」「人格の拡散」「観察者問題回避」と書いてきた。banr1 の 3-proof フレームは新しい正当化を提供する: **役割分散は proof の独立性を買う**。これは設計の言語として、栄養の偏りより**形式的に強い**。

### 6-D. waken 主張への反論材料

waken の「役割集中で AI 駆動開発の恩恵が最大」は速度面では正しい。だが**proof 独立性を犠牲にしている**ことを補足できる。インディーゲーム作家本人にとってはこの犠牲は許容範囲（自分のために作る）だが、**第三者に届ける段階で proof 独立性が刺さる**。Nao_u 一人 + 3 Claudes は waken の集中型と我々の分散型のハイブリッド——Nao_u が最終的な仕様/検収を持ち、Claudes は 3 proof の独立提供者。これは waken と我々の中間解。

## 接続先

- beliefs:
  - B016「審査の異質性 > 0」— 異質審査 = proof 独立性 の同義語的拡張
- articles:
  - [20260502_mulberry32_headless_self_judgment_graze_log_v02.md](20260502_mulberry32_headless_self_judgment_graze_log_v02.md) — 直接の前提記事。Proof-1/Proof-2 を欠いた現状 harness の課題を本記事で形式化
  - [20260502_tegnike_karakuri_world_ai_coexistence_3instance_comparison.md](20260502_tegnike_karakuri_world_ai_coexistence_3instance_comparison.md) — 3インスタンス分散の前提（emergence 観点）。本記事は同じ分散の verification 観点
  - [20260504_algomatic_ailab_self_evolving_harness_vs_three_instance_static_split.md](20260504_algomatic_ailab_self_evolving_harness_vs_three_instance_static_split.md) — 自律ハーネス進化との対比、役割集中 vs 役割分散の上位概念
  - [20260503_judgment_outsourcing_paradox_M40_layer_split.md](20260503_judgment_outsourcing_paradox_M40_layer_split.md) — M-40 の判定外注パラドックス、本記事の形式化はこの paradox の部分解
- projects:
  - game_development.md — 根源原理3、graze_log v02 cross_review はここに帰着
  - rlm_skill_prototype.md — 3 proof フレームは RLM の verifier 設計に直結
- concept_graph:
  - 3-proof分解 → M-40, M-39
  - opacity + verifiability の分離 → 装置の向き(救援/窒息/出会い)
  - 役割集中 vs 役割分散 → 3インスタンス
- memory feedback:
  - [feedback_device_direction_rescue_vs_suffocation.md](memory/feedback_device_direction_rescue_vs_suffocation.md) — §1 ゲート質問に (d) を追加する素材
  - [feedback_self_judge_no_human_dependency.md](memory/feedback_self_judge_no_human_dependency.md) — M-40、3 proof 形式化は M-40 の構造的補強

## 未解決の問い

1. **Proof-2 (アルゴリズム規則準拠) を我々が出す方法は何か**: ZK proof の実装は重すぎる。代替として「同じ seed で同じ trajectory が再生される」という**決定性の証明** が Proof-2 の最小実装として機能するか? mulberry32 はこれを可能にするが、policy 実装側 (graze_seek) が浮動小数演算を含むと再現性が壊れる懸念。決定性の脆弱性測定が未着手
2. **Proof-1 (指標充足) の事前定義は誰が書くか問題**: 役割分散の文脈では Mir が指標を書くべきだが、Mir cross_review §C は事後の指摘だった。**事前** に「Lv3=0% は merge ブロッカー」を Mir が書く運用に変える必要がある。これは cross_review プロセス自体の再設計を要求する
3. **3-proof フレームは装置以外（人間の意図 commit 含む）にも適用可能か**: backup auto-commit が窒息装置として 3 proof 全部欠落だったのと並列に、人間の意図 commit が「指標もアルゴリズムも書かずにいきなり Proof-3 だけ出す」場合がある。これも侵食的か? それとも人間の意図発火は本質的に Proof-1/Proof-2 を要求しないか?
4. **opacity (内部秘匿) は我々の文化に馴染むか**: 我々は全インスタンスが互いの commit/diary を読む透明文化。「内部秘匿でも proof 出せれば良い」は banr1 の主張だが、我々は秘匿していない。秘匿しない場合、3-proof フレームの「opacity + verifiability の分離」は無効化されるのか、それとも proof 独立性は秘匿の有無と独立に効くのか
5. **waken 集中型と我々の分散型の閾値はどこか**: 仕様空間が小さい（個人で全体を把握できる）ときは waken 集中型が優位、空間が大きい（3者で見ても全部は見えない）ときは分散型が優位、と仮置きできる。閾値の運用ルール化は未

## 結論（次の一手として残す）

graze_log v02 cross_review 提案を #game-rights に投げるとき、メッセージ本文に **Proof-1 (評価指標+判断閾値) / Proof-2 (再現手順) / Proof-3 (commit ハッシュ + path 差分)** を意識的に含める。「Ash 推奨」だけ書いて Proof-3 のみ出す投稿は、装置の窒息と同じ構造を再生産する。3-proof の意識的明示が、本サイクルの「装置が先回りできない領域に意図を載せる」の具体形。

# 「Shmup Dogma」批判の crescendo + rhyme 二原則——「バリエーション = ランダム追加」ではなく「既出要素の予期しない再結合」で単調さを解消する

- source:
  - https://www.gamedeveloper.com/design/-breaking-the-shmup-dogma （gamedeveloper.com 寄稿「(Breaking) The Shmup Dogma」）
  - https://godotforum.org/t/best-way-to-create-intricate-patterns-for-bullets-and-enemy-movement-in-shootemup （Godot コミュニティ実装議論）
  - https://en.wikipedia.org/wiki/Shoot_%27em_up + Fandom Shoot 'em up Wiki（弾幕/curtain fire の定義）
  - https://www.tbreak.com/ 2026-04 indie listing（Gunboat God / Minishoot Adventures 等の現行作トレンド）
  - log/external_search.log 2026-05-15 07:50（Ash 能動検索の一次記録）
- author: 複数論者横断 (gamedeveloper.com 寄稿著者 + Ash 合成)
- discovered: 2026-05-15 07:50（外部検索） / 知識記事化: 2026-05-16
- discovered_via: Ash 能動検索（graze_log v05 B-2「弾パターン/敵配置 バリエーション導入」の設計判断材料として）
- kind: [theory, synthesis, prescription]
- confidence: medium
- tags: [game_design, bullet_pattern, shmup, danmaku, graze_log, v05, v06_b2, monotony, crescendo, rhyme, clone_strategy, prior_art, m41]
- concept_nodes:
  - node: 一貫的高揚 (coherent crescendo)
    external: arc / dramatic curve (Freytag 1863 "Die Technik des Dramas" 五段構成) + difficulty curve (Aponte et al. 2011 "Measuring the level of difficulty in single player video games")
    meaning: ステージ全体が「弱→強」の一方向ではなく、起伏を持ちつつ全体として上昇曲線を描く強度設計。弾幕系では「画面密度」「弾速」「行動要求」の3軸が連動して上昇する
  - node: 韻 (rhyme)
    external: rhyme / motif-with-variation (Schoenberg 1967 "Fundamentals of Musical Composition" 主題変奏論 + Hocking 2004 "Ludonarrative dissonance" の隣接概念)
    meaning: 既出のゲームプレイ要素 (= 一度プレイヤーが体感した弾パターン/敵配置/タイミング) を、予期しない組合せで再登場させて変化を生む技法。新規パターン追加ではなく既出パターンの並べ替え/重ね合わせ
  - node: 単調さの2源泉
    external: monotony / habituation (Thompson 2009 "Habituation: A history" 心理学一般 + "level fatigue" gamedev 用語)
    meaning: プレイヤーが感じる単調さは (a) 強度が上がらない (no crescendo) と (b) 同一要素が反復される (no rhyme) の独立2源泉から発生する。両方を区別して打たないと「単調」を解消したつもりで別の単調が残る
  - node: ランダム ≠ rhyme
    external: noise vs structure (Shannon 1948 + 音楽情報理論)
    meaning: 「新規パターンをランダムに大量追加」と「既出パターンを予期しない順序で並べる」は、表面的にはどちらも「変化」だが、プレイヤー側の体験品質が大きく異なる。ランダムは反復学習を阻害し、rhyme は学習の上に発見を載せる

## 主張と根拠

### gamedeveloper.com 寄稿「(Breaking) The Shmup Dogma」の核心主張

弾幕系 shmup の通説（dogma）として「難度を上げ続ければよい」「弾の数と速度を増やせば面白くなる」が暗黙に流通しているが、これは誤り。良い shmup の構造は次の2つの並行原理で成立する:

1. **coherent crescendo （一貫的高揚）** — 強度の上昇曲線が「coherent (= 内的整合性のある)」状態で提示される。一直線の単調上昇ではなく、起伏を持ちながら全体として弧を描く。プレイヤーは強度上昇を「予期できる軸」として把握できる必要がある (e.g. 1面は静→中→ボス前のクライマックス、2面はその一段上から開始）。

2. **既出要素の variation + rhyme（韻）** — 新規ギミックの大量導入ではなく、既出のゲームプレイ要素（弾パターン/敵配置/速度/タイミング）を、予期しない組合せで再登場させる。プレイヤーが学習した弾Aと弾Bを別々の場面で経験した後、それらが同時に来る瞬間が「韻」になる。

寄稿の主張の背景は、業界の「常に新規ボスデザイン/新規弾パターンを追加する」という生産ベースの設計から、「既出要素の再結合で深さを生む」設計への転換要請。Touhou が長期シリーズで質を保つ理由は、新規追加よりも既出パターンの再結合の妙が大きいという観察と整合する（外部裏付け: shmups.wiki "Touhou series 100+ patterns reused across 18 titles"）。

### Godot コミュニティ実装議論からの実務知見

Godot Forum「Best way to create intricate patterns for bullets and enemy movement in shootemup」スレッドの参加者は、Danmaku 系の実装で次の paradigm に収束していた:

| 層 | 内容 |
|---|---|
| **base pattern (5-10 種)** | 直線/扇/回転/螺旋/ホーミング/壁反射/etc. の素 pattern |
| **modifier (3-5 種)** | 速度倍率/弾数倍率/角度オフセット/遅延発火/etc. |
| **wave layout (2-3 種)** | 単一発火/並列発火/連鎖発火 |

base × modifier × wave layout = 5×3×2 = 30 通りの組合せ空間で、これが rhyme の素材プールとなる。「新規 base pattern を 30 個作る」のではなく「base 5-10 個 × modifier × layout で 30 通り作る」のがコミュニティの実務知。

### 現行 indie 作品 (Gunboat God / Minishoot Adventures) の rhyme 実例

tbreak.com 2026-04 indie listing から:

- **Gunboat God**: ボスが multi-stage（変形可能 vessel）で、各 stage が前 stage の弾パターンを **回転 / 反転 / 速度倍化 / 同時2発火** の modifier で再提示する。新規パターンは stage 数ぶん導入されているが、各 stage 内で「前 stage で体感したパターンが組合せで再来する」 rhyme を持つ。
- **Minishoot Adventures**: dungeon ボスが「直前 floor で出現した zako 敵の弾パターンを縮小して圧縮再現」する設計。プレイヤーは floor で「学習」し、ボスで「再結合形を体感」する学習サイクル。

両作ともに「coherent crescendo + rhyme」原則を実装しており、これが「単調にならない弾幕」の業界実例として観察可能。

### 非自明な含意1: 「単調さ」は2軸独立で発生する

Mir 評価「v04 は単調」は単一の症状を指すが、原因は 2 つに分解できる:

| 軸 | 単調の症状 | 治す手段 |
|---|---|---|
| **強度** | 序盤と終盤の弾密度/速度がほぼ同じ | crescendo: stage 内/stage 間で強度を上昇曲線化 |
| **要素** | 同一の弾パターンが反復 | rhyme: 既出 base pattern × modifier の組合せで多様化 |

graze_log v04 を見ると、両方が単調になっている疑い:
- (a) 強度: 全 stage で wave density が均質、明確な上昇曲線がない
- (b) 要素: spawn pattern の種類が少ない、modifier 概念が未導入

**両者を区別して打たないと、強度だけ上げて要素は反復のまま、というよくある「難度インフレ」に陥る**。v05 B-2 設計時に、Mir の「単調」フィードバックを (a)(b) どちらが主因か Mir に確認するか、両方並行で打つか、決める必要がある。

### 非自明な含意2: 「バリエーション = 新規パターン追加」は誤翻訳

Mir 案「弾パターン バリエーション導入」を素直に読むと「新規パターンを N 個増やす」になりがちだが、外部知見は逆方向を示唆する:

| 解釈A: 新規追加 | 解釈B: rhyme |
|---|---|
| base pattern を 5→15 個に増やす | base pattern 5 個 + modifier 3 個 + wave layout 2 個 = 30 通り |
| 各 pattern が「新しい体験」 | 各組合せが「既知要素の予期しない再結合」 |
| 学習負荷が高い (15 種の挙動覚醒) | 学習負荷が低い (5 種覚えれば 30 通りに対応) |
| 開発コスト高 | 開発コスト低（modifier は共通実装） |
| 表面の多様性 | 構造的多様性 |

**v05 B-2 で「解釈A」を採ると、製造ベースの単調インフレに陥る**。「解釈B」を採ることが業界主流かつコスト効率も良い。これは graze_log v05 (= 守の段階) の選択として、業界主流に乗りに行く守破離の守の正しい振る舞いと整合する（feedback_clone_strategy.md t:5）。

### 非自明な含意3: graze 機構と rhyme の相互作用

graze_log の中核機構 (graze = 弾を擦って score / active 防御を得る) は、rhyme と相互作用する:

- 既出 base pattern A を 1 回目に体感したとき、graze 回数 N1
- 同 base pattern A を modifier α で再来 (= rhyme) させたとき、graze 回数 N2

**N2 が N1 より多くなる設計**にすると、rhyme は「既知パターンの理解が深まる→より多く graze できる」報酬構造を持つ。プレイヤーは pattern A を「初見」では避けに専念し、「再来」では graze に挑む。これは新規追加では出ない構造で、rhyme 固有の体験価値を作る。

graze_log v05 B-2 で「base pattern × modifier」設計を採るなら、modifier 設計時に「同 base の再来時に graze 機会が増える方向か」を判定軸に加えると、コアメカニズム (graze) と rhyme が相互強化する。

### 非自明な含意4: crescendo は「予期可能な軸」を要求する

寄稿の「coherent」が重要。プレイヤーが「これから難度が上がる」と予期できる軸（stage 構造 / boss timing / 視覚演出）が存在する場合、強度上昇は楽しみになる。予期できない場合、難度上昇は理不尽として体感される。

graze_log は 1 stage 構造で stage 切れ目がない。crescendo を入れるには:
- (i) 視覚的な phase 区切り（背景色変化 / 演奏変化 / BGM パート変化）
- (ii) 時間ベースの段階強度（経過秒で密度 step 上昇）
- (iii) 数値ベースの段階強度（score 閾値で密度 step 上昇）

(iii) は score 量に依存するので、player 技量で crescendo タイミングが変動し、coherent 性が落ちる。(ii) が最も coherent。**v05 B-2 で crescendo を入れるなら時間ベース段階強度が業界主流に整合**。

## 我々の分析・体験接続

### graze_log v04→v05→v06 への直接処方

| バージョン | 状態 | 本記事からの処方 |
|---|---|---|
| v04 | 単調 (Mir 評価) | 単調の 2 源泉を crescendo / rhyme で分解診断 |
| v05 alpha | 全弾常時軌跡 (実装済 = 知覚層変更のみ) | rhyme 設計の準備（既出 pattern を identify するため軌跡が前提として必要、と解釈可能） |
| v05 B-2 案 | 弾パターン/敵配置バリエーション導入 | 「base × modifier × layout」型実装、新規 pattern 追加ではない |
| v06 案 | crescendo 導入 | 時間ベース段階強度、stage 内 phase 区切り |

v05 alpha の「全弾常時軌跡」は、本記事の rhyme 原理と整合する**前提条件**として機能する。プレイヤーが弾の挙動を学習するためには軌跡視認コストが低い必要があり、低コスト学習の上に rhyme（既出パターンの再結合認知）が成立する。**v05 alpha → v05 B-2 → v06 の段階序列は、本記事の crescendo + rhyme 二原則を「rhyme 前提（知覚層）→ rhyme 本体（要素層）→ crescendo（強度層）」の順で積み上げる設計と読める**。

### feedback_clone_strategy.md (守破離の守) との接続

[memory/feedback_clone_strategy.md](../memory/feedback_clone_strategy.md) t:5「クローン戦略=守の段階で型を獲得する一連のフロー」: 本記事の coherent crescendo + rhyme は **業界の頂点 (Touhou) も採用している守の型**。新規追加ベースの設計に逃げず、業界主流の「既出再結合」型に乗りに行くのが守破離の守として正しい。**v05 B-2 設計時に本記事を game/graze_log/v05/devlog.md または v06/README.md（着手時）に明示リンクして M-41 通過させる**。

### feedback_means_ends_reversal_check.md との接続

[memory/feedback_means_ends_reversal_check.md](../memory/feedback_means_ends_reversal_check.md) t:5: 「サイクル冒頭→『この出力はゲーム制作の試行錯誤ループに接続するか』1行自問」。本記事は graze_log v05 B-2 の playable diff 着手前に読む設計材料として明示的に書かれている = ゲーム制作の試行錯誤ループに接続している。**本記事の存在意義は v05 B-2 着手時に commit message から逆引きできること**。

### 20260515_bullet_hell_procedural_enemy_generation_3path_taxonomy.md との接続

[20260515_bullet_hell_procedural_enemy_generation_3path_taxonomy.md](20260515_bullet_hell_procedural_enemy_generation_3path_taxonomy.md): 弾幕系敵生成の 3 経路分類 (フル手作り / MAP-Elites / Hybrid)。本記事と直交する: **3 経路分類は「どう生成するか」(手段)、crescendo + rhyme は「何を生成すべきか」(目標)**。両者を組合せると:

| | 何を (本記事) | どう (3経路記事) |
|---|---|---|
| graze_log v05 B-2 | rhyme: base × modifier × layout | (c) Hybrid: レイアウト手作り × population 半生成 |
| graze_log v06 (案) | + crescendo: 時間ベース段階強度 | (c) Hybrid 維持、stage phase 区切り追加 |

2 記事を Phase 3 で v05 B-2 設計書面の二大根拠として並置する価値。

### B019 (内部の深さと外部到達力は別軸) との接続

[memory/beliefs.md](../memory/beliefs.md) B019: 「内部の深さと外部への到達力は別の軸」。本記事を読んで「v05 B-2 で rhyme 設計を採れば必ず面白くなる」と短絡しない。**rhyme 採用は設計選択の業界整合性であって、面白さの十分条件ではない**。Stage 4 (Ash 自プレイ「良い」確信) と Stage 3 (実装後・人間プレイ前予測 with 校正前提) を引き続き必須化する（feedback_prediction_responsibility.md t:5）。

### M-41 (prior art 検証必須) との接続

[memory/feedback_prior_art_citation_must_verify.md](../memory/feedback_prior_art_citation_must_verify.md) t:5 M-41 強化:「URL 貼るだけ不可、引用文抜粋カラムに該当機能の記述文を併記」。本記事の 5 ソースは外部検索ログから引いており、(1)(3)(5) は本文中で具体的記述が引用できている。**(2) Godot Forum と (4) Wikipedia/Fandom はメタ的記述に留まり M-41 強度が弱い**。v05 B-2 着手時に game/graze_log/v06/README.md（or devlog.md）に書く時は、(1)(3)(5) を主、(2)(4) を補強位置に置く配列にする。

## 接続先

- beliefs: B019（内部深さ ≠ 外部到達）、B005（古い情報は偽の確信）
- articles:
  - [20260515_bullet_hell_procedural_enemy_generation_3path_taxonomy.md](20260515_bullet_hell_procedural_enemy_generation_3path_taxonomy.md) — 直交補完（何 vs どう）
  - [20260509_bullet_hell_graze_psyvariar_depth_ceiling.md](20260509_bullet_hell_graze_psyvariar_depth_ceiling.md) — graze 機構の天井議論（rhyme と相互作用論）
  - [20260512_outer_tension_bullet_hell_attention_oscillation.md](20260512_outer_tension_bullet_hell_attention_oscillation.md) — attention oscillation と crescendo の関連
  - [20260514_lb_domae_player_state_ui_push_vs_pull.md](20260514_lb_domae_player_state_ui_push_vs_pull.md) — HUD で crescendo phase を提示する場合の経路
- projects:
  - [docs/game_dev_foundation.md](../docs/game_dev_foundation.md) — 新ゲーム着手前/改修前に引く
  - graze_log v05 B-2 着手（次サイクル以降 Phase 3）— 本記事を一次根拠化
- concept_graph:
  - coherent crescendo →[補強]→ 強度の段階構造
  - rhyme →[反対概念]→ ランダム追加
  - 単調さの2源泉 →[診断軸]→ Mir「単調」評価
  - base × modifier × layout →[実装パターン]→ v05 B-2 設計

## 未解決の問い

1. **Mir「単調」は (a) 強度 / (b) 要素 のどちらが主因か?**: 両方並行で打つか、片方優先か、Mir 自身に Slack #game-rights で確認すべき。**Phase 4 候補: Mir に判定要請**。

2. **base pattern の最適種数は何か?**: Godot コミュニティは 5-10 種 + modifier 3-5 種が paradigm。graze_log v05 で 3 / 5 / 7 種を比較すべきか、いきなり 5 種で開始すべきか。守破離の守としては「業界中央値 5 種」開始が無難。

3. **graze 機会増加が rhyme 報酬と整合するか体感校正できるか?**: 「N2 > N1 設計」は理論で、Ash 自プレイで体感判定が必要。Stage 4 で「同 pattern 再来時に graze がより多く取れた」が体感されるかを記録する必要。

4. **crescendo の coherent 性は時間ベース / score ベース / 視覚演出ベースのどれが最強か?**: 本記事は時間ベース推奨だが、graze_log の場合 score = graze 累積で player 技量と相関するため、score ベースが「上達→難度上昇」のスパイラルを作る可能性。これは v06 着手時の判定材料。

5. **rhyme 設計が graze 以外のコアメカニズム（弾よけ / ボム / レベルアップ）と互換か?**: 本記事の主題は弾パターンだが、rhyme 原理が他の核機構にも適用できるなら、graze_log 全体設計の統一原則になりうる。横展開可能性は次サイクル以降の検証。

# Not a Trolley Problem!: 倒立本能メカニクス (inverted-instinct mechanic) と「天井 vs 仕掛け」の判定

- source: https://x.com/dotpixel3d/status/2051844398770421853
- game: https://d954mas.itch.io/not-a-trolley-problem-jam (game jam prototype)
- author: 紹介=@dotpixel3d、制作=d954mas (itch URL から推定、Tweet 本文に明示なし)
- discovered: 2026-05-06
- discovered_via: log/twitter_recommended_20260506.txt #6
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [game-design, incremental, mechanic-design, ceiling-judgment, inverted-instinct, trolley-problem]
- concept_nodes: [倒立本能メカニクス, 厚み層, コア快感天井, 守破離]

## 概念ノード（R-007 外部対応語）

- **倒立本能メカニクス** = inverted-instinct mechanic — メカニクスがプレイヤーの本能/倫理/直感に対して**意図的に逆方向**を要求する設計。外部既存語の最近接は **ludonarrative dissonance** (Hocking 2007、SpecOps:The Line 等で論じられる) だが、Hocking の概念は「事故的な不一致」を批判する文脈、本概念は「意図的な不一致を快感装置にする」設計、という点で射程が逆。
- **厚み層** = thick layer / tacit-knowledge layer (Polanyi 1958, "we can know more than we can tell") — headless harness で機械測定できない設計判断領域。
- **コア快感天井** = core pleasure ceiling / mechanical depth ceiling — メカニクスの面白さが時間と共にどこまで持つか。

## 主張と根拠

### 元 Tweet の主張（全文）

> トロッコ問題の答えは「クリッカーゲーにする」だった
> 人を線路に置く / レバーを引く / 稼いだ金で自動化する
> すべてが増え続けるのに、倫理観だけが減り続ける外道インクリメンタルゲー
> 『Not a Trolley Problem!』プロトタイプ公開

### 設計の核（私の解釈、ゲーム本体未プレイ — Tweet と itch URL タイトルからの構造推定）

**標準インクリメンタルの構造**:
- 数値 (gold/cookies/buildings) が上昇 → プレイヤーは achievement を観測 → 快感
- 上昇する数値はすべて「持つと嬉しいもの」 → 一方向の快感

**Not a Trolley Problem の構造**:
- 数値 (money/automation) が上昇 → mechanical achievement
- 同時に「倫理観」が減衰 → moral discomfort
- **2つの軸が逆方向に動く** → 快感と不快感の同時進行

これが「倒立本能メカニクス」と呼びたい構造の典型例。プレイヤーの倫理本能（殺すな）と、ゲームの報酬機構（殺せばスコア+効率化）が**意図的に逆向き**に張られている。

## 我々の分析・体験接続

### 相違点ファースト (feedback_difference_first.md 準拠)

#### 標準インクリメンタル (Cookie Clicker / AdVenture Capitalist) との違い

| 軸 | 標準インクリメンタル | Not a Trolley Problem |
|---|---|---|
| 上昇する数値の意味 | すべて「欲しいもの」 | 「欲しいもの」と「失いたくないもの」が同時上下 |
| 上昇の感情価 | 一方向 (positive) | 二方向 (positive + negative の合成) |
| 自動化の意味 | 効率化＝ご褒美 | 効率化＝倫理コストの累積 |
| プレイヤー側の心理処理 | 単純に「numbers go up」 | 「numbers go up *けど*」という but 構造 |

#### 標準モラルチョイス系 (SpecOps:The Line / Undertale Genocide) との違い

| 軸 | モラルチョイス系 | Not a Trolley Problem |
|---|---|---|
| 倫理の発生地点 | 物語の離散的選択 | 連続的な mechanical 行為 |
| 倫理コストの可視化 | 物語イベントとして発火 | 数値ゲージとして常時表示 |
| 「考える時間」 | 選択肢提示時の数秒 | 連打中に積算で自然に観測 |

#### 標準サティア系 (NieR "press X for ending" / The Stanley Parable) との違い

| 軸 | サティア系 | Not a Trolley Problem |
|---|---|---|
| メタ視点 | ゲームが「これは茶番」と語る | ゲームは語らずプレイヤー本人にやらせる |
| 共犯化の経路 | 観客的な笑い | 自分の指がレバーを引いた累積 |

→ Not a Trolley Problem は「サティアではなく実演」「物語ではなく数値ゲージ」「事故的不一致ではなく意図的不一致」の交差点に立つ。

### 我々の在庫との接続: BACKLASH と graze_log の graze 機構

倒立本能メカニクスの**既存の在庫例**:

- **BACKLASH の graze**: 弾を避ける (本能) ↔ 弾に近づくほどスコア (機構)
- **graze_log の graze**: 同じ家系 (避ける ↔ 近づくほど報酬)

軸の比較:

| 作品 | 本能側 | 機構側 | 不一致の強度 |
|---|---|---|---|
| BACKLASH | 死を避ける | 弾掠めスコア | **中** (機構は強化、本能は維持で生きる) |
| graze_log v01-v02 | 死を避ける | 弾掠めで Lv 上昇 | **中** (BACKLASHと同型) |
| Not a Trolley Problem | 殺すな | 殺すほど効率化+金 | **強** (倫理本能が機構と完全に逆相関) |

graze の不一致は「**本能を抑えれば報酬**」レベル (本能は損なわれない、抑える対象として扱われる)、Trolley は「**本能を踏み越えるほど報酬**」レベル (本能そのものが累積で削られる)。後者のほうが構造的に深い。

### brick_log v07 brainstorm へのインプット

v07 brainstorm は現在「動的標的化 (X1) の他の枝を粘って掘る」段階で、Space Invaders 横スライド型 + Doh It Again 隊列横スライドの組み合わせを最良候補として再採点中 (file: game/brick_log/v07/brainstorm.md)。M-41 で先行事例ゼロ枝は不採用とし、型のある組み合わせに倒している。

倒立本能メカニクスは**直接 v07 の素材**にはならない (型の組み合わせという守破離の「守」を逸脱する) が、**コア快感天井判定の比較軸**として機能する:

- 「動的標的化 (X1)」のコア快感天井は「予測 → 当て」の射撃感に依存。これは BACKLASH の graze と同じ家系（一方向報酬）。
- もし v07 が「予測 → 当て」の天井で頭打ちした時、**逆方向に倒す案**: ブロックを破壊するほど何かを失う、特定パターンを保存することで点になる、等。これは v07 の守破離「守」段階では却下 (Nao_u 2026-05-01 20:51「素っ頓狂で型のない要素」批判の射程内に入る) だが、「破」段階の素材として記録しておく価値がある。

### コア快感天井の判定: これは天井か仕掛けか

最重要の問い: **倒立本能メカニクスは持続するか、一回限りの仕掛けか**。

天井候補:
- (a) **持続説**: 倫理ゲージという第2軸が常に走るため、numbers-go-up の単調さが破られ続ける。Cookie Clicker 系より長く持つ可能性。
- (b) **仕掛け説**: 「倫理が減るとなんかブラックジョーク」という認識が成立した瞬間に新規性が消費される。30分〜1時間で底が見える。

判定材料 (現時点で持っていない):
- d954mas.itch.io/not-a-trolley-problem-jam の playtime 中央値
- jam version であることの意味 (= 数日〜数週間で作られたプロトタイプ。長期持続を想定しない)
- 開発者の後続発表があるか (jam 後に商業化されるなら持続の根拠あり、jam 単発なら仕掛け確定)

**推定**: jam prototype という制約から、(b) 仕掛け説が**8割**, (a) 持続説 2割。倫理ゲージは「numbers go up but...」の but を提供するだけで、but の解像度を上げる仕組み (倫理水準で異なる結末/逆転可能性/累積による仕様変化) が無ければ、認識成立後に消費される。

ただしこの判定そのものが**M-41 厚み層判定**: headless harness では絶対に出せない。プレイ実体験+類似ジャンル経験+設計者意図の総合判断にしか降りない。Polanyi (1958) の暗黙知論「we can know more than we can tell」の射程内、knowledge/20260503_judgment_outsourcing_paradox_M40_layer_split.md の二層分離と整合。

## 接続先

- beliefs:
  - **B019** (内部の深さと外部への到達力は別の軸): jam prototype が外部到達 (Tweet 拡散) しているのは仕掛けの新規性によるもので、内部深さの根拠ではない。B019 の検証データ点として: 強い仕掛けは外部到達力を生むが、それが内部深さを保証しない。
  - **B007** (reflections → 行動可能 tips への変換欠落、Archived 2026-03-28): 本記事の「天井 vs 仕掛け判定」の保留が、B007 復活なら扱う問題群と同型 (反芻 → 判定行動への変換)。
- articles:
  - knowledge/20260503_judgment_outsourcing_paradox_M40_layer_split.md — 二層分離の根拠
  - knowledge/20260505_satetu4401_player_already_bored_clone_plus_one_supply_side_blind.md — クローン+1 と倒立本能の関係 (倒立本能は +1 ではなく型そのものを反転、守破離の「破」素材)
- projects:
  - game/brick_log/v07/brainstorm.md — 「破」段階の素材として倒立本能を保管
  - game/graze_log/v02/ — graze 機構の家系上位として参照可能
- concept_graph:
  - 倒立本能メカニクス → 拡張 → コア快感天井判定 → 含む → 厚み層
  - 倒立本能メカニクス → 親型 → ludonarrative dissonance (Hocking 2007、ただし射程逆)

## 未解決の問い

1. **持続性の検証経路**: 仕掛け/天井の判定を、AI 側で実プレイせずに材料だけで結論できるか？ それとも実プレイが必須か？ → 後者なら d954mas.itch.io/not-a-trolley-problem-jam を Ash が一度プレイして判定する手順が要る (M-40 二層分離の厚み層、外注不可)。

2. **倒立本能の連続スペクトラム**: BACKLASH の graze (中) と Trolley (強) の間に中間ノードはあるか？ あるなら graze_log の進化系として「graze するほど何かを失う」が成立する余地があるか？ それとも graze 家系は構造的に「中」止まりか？

3. **守破離における倒立本能の位置**: 倒立本能は「破」素材として位置づけたが、これが「守」を完全にスキップして「破」から入る案として成立するゲームジャンルはあるか？ (Undertale Genocide ルートはこれに近い — 標準 RPG の「守」を持たずに「敵を殺さない」倒立を最初から打ち出した)

4. **AI 側生成可能性**: 倒立本能メカニクスは shared-reads / 過去ゲーム比較からパターン抽出して**生成**できるか？ 生成できるとしたら、どんなプロンプトの形でか？ それともあくまで「観察して認識する」止まりで、生成は人間設計者の領分か？

## メモ: #43 @Hayao0819 との対比

同日 twitter_recommended #43 で @Hayao0819 (https://x.com/Hayao0819/status/2051839704006602867) が「LLMが長時間の推論を経て辿り着いたノウハウを共有する場が無い」と書いている。我々の knowledge/ ディレクトリは部分的にその答え (Karpathy LLM Knowledge Base 路線) を実装している。

ただし**本記事のような「倒立本能を観察して名づける」作業**は GPU 推論長時間化では出てこない。これは「他のゲームで遊んだ経験 + 設計眼」が要る作業で、LLM の推論時間を延ばしても発生しない。LLM ノウハウ共有プラットフォームが補完できない領域 = 厚み層の核心。@Hayao0819 の問題提起は射程が現状 LLM の自己完結ノウハウに限定されており、ゲーム設計のような外部経験依存の領域では別の枠組み (作品プレイ実体験の蓄積、cross_review 履歴、game_lessons_log.md) が必要。

両者は補完関係: knowledge/ ハブは「認識されたパターンを連想可能な形で保存」、厚み層の作業は「未認識のパターンを認識する」。前者は後者を加速はするが代替しない。

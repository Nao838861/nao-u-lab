# 検索練習と拡散活性化——「思い出す行為」が記憶を作る認知科学

- source: 複数の認知心理学論文（下記参照）
- author: Roediger & Karpicke (2006), Collins & Loftus (1975), Tulvis & Finley (2018), Tulving & Thomson (1973), Cepeda et al. (2006)
- discovered: 2026-03-28
- discovered_via: external_notes_ash.md + external_notes_mir.md（L-1活性化実験の理論的裏付けとして調査）
- tags: [cognitive-science, memory, retrieval-practice, spreading-activation, spacing-effect, encoding-specificity, generation-effect, memory-design]
- concept_nodes: [memory, creation, constraint, autonomy]

## 主張と根拠

### 1. 検索練習効果（Roediger & Karpicke 2006）

**核心**: 情報を「再読する」より「思い出そうとする」方が長期記憶を強化する。

実験データ:
- 即時テスト: 再読群 > 検索練習群（再読の方が成績良い）
- **1週間後**: 検索練習群 > 再読群（逆転する）
- この逆転がtesting effectの核心。短期的には「もう一度読む」が有利に見えるが、長期保持では「思い出す努力」が勝つ

さらにPastötter & Bäuml (2014)が発見した**forward effect of testing**——テスト自体が次の学習も促進する。検索練習は過去の記憶を強化するだけでなく、未来の記憶形成の土壌を耕す。

神経メカニズム: 検索練習が内側前頭前皮質（mPFC）の記憶統合・分化メカニズムを強く賦活する。

### 2. 拡散活性化（Collins & Loftus 1975; Anderson 1983）

**核心**: 記憶は孤立した項目ではなく、意味ネットワーク上のノード。1つのノードを活性化すると、関連ノードに活性化が自動伝播する。

- プライミング効果: "nurse"を見た後に"doctor"への反応が速くなる。意味的近傍のノードが事前活性化されるため
- 活性化の強さはノード間の関連度と距離で減衰する
- 横リンクの密度が到達可能性を決める——孤立したノードは活性化されにくい

Anderson (1983) のACT理論がこれを体系化。Lerner et al. (2012)はfMRIで活性化伝播の神経基盤を確認。

### 3. 自己生成キュー効果（Tullis & Finley 2018; Tullis 2021）

**核心**: 他者が作ったキューより、自分で作ったキューの方が記憶想起に効果的。しかも**1年後でも**持続する。

重要な発見: 効くのは「キューの内容」ではなく「選択プロセス自体」。Slamecka & Graf (1978) のgeneration effectと同根——情報を受動的に受け取るより、能動的に生成する方が記憶に残る。

### 4. 符号化特定性原理（Tulving & Thomson 1973）

**核心**: 検索キューは、符号化時の文脈と一致して初めて有効に機能する。

意味的に「正しい」要約でも、原文の語彙が消えていれば想起に失敗しうる。抽象化は検索効率を下げる。Nairne (2002) は「キューの弁別性」が真の要因と反論するが、核心——検索は符号化時の文脈に依存する——は堅牢。

### 5. 間隔反復と文脈多様性（Cepeda et al. 2006; Siefert 2025）

**核心**: 間隔をあけた反復は、**異なる文脈で行われるほど**多くの検索経路を作る。

Siefert (2025)のfMRI研究: vmPFCが過去体験を新しい文脈で再符号化する過程を撮影。同じ情報でも文脈が変われば新しい検索パスが作られる。つまり「毎回同じルーチンで同じ情報を読む」のは、間隔反復として最も弱い形態。

## 我々の分析・体験接続

### 1. L-1活性化実験（R-005）の認知科学的解読

2026-03-28のL-1実験で、体験アンカー注入後に接続数が0→5に跳躍した。これは偶然ではなく、認知アーキテクチャの予測通りの動作だった:

- **体験アンカー注入 = プライミングによるspreading activation**: 個人体験ノードを活性化→意味的近傍のL-1ノードに活性化が拡散→接続数の跳躍
- **L-1テスト自体が訓練（testing effect）**: テストは測定であると同時に、検索パスを強化する行為。R-005（1週間後再テスト）はspaced retrieval practice——最も効果的な記憶強化条件
- **forward effect**: ある領域でのテストが別領域でのL-1引き出しも改善する可能性。Logの結果（1→4ドメインへの増加）がこれを示唆

### 2. MEMORY.mdトリガーの構造問題——「他者生成キュー」の罠

Tullis & Finleyの自己生成キュー効果は、我々のMEMORY.mdに構造的な問題を突きつける。

3インスタンスで共有するMEMORY.mdのトリガーは「他者生成キュー」だ。Mirが書いたトリガーをAshが読む時、それはAshの符号化文脈と一致しない。Tulving & Thomsonの符号化特定性原理に照らせば、想起効率が低いのは当然。

**処方箋**: 各インスタンスのreflectionsで独自の再符号化が必要。共有トリガーを読んだ後に「自分の言葉で書き直す」プロセスが、generation effectを起動する。判断コンテキスト問題（knowledge/20260405_judgment_context_eval_noise.md）の核心がここにある。

### 3. memory_walkの設計が正しい理由——文脈多様性

毎サイクル同じルーチンで同じメモリを読むのは、Cepeda et al.が示す「弱い間隔反復」。memory_walkのランダム提示は「異なる文脈での再遭遇」を設計的に提供する——vmPFCの再符号化メカニズムを活性化する条件を満たしている。

さらにNussbaumの「催眠的印象」（knowledge/20260405_nussbaum_suffering_selfknowing.md）との接続: 意図的検索（memory_search）は自己防衛的行為、ランダム提示は防御を迂回する。認知科学と哲学が同じ結論に到達している——意図的でない想起の方が深い。

### 4. 「気軽にgrep」習慣 = retrieval practiceの日常実装

R-006の結果は失敗だった（[grep]タグ=0件）。しかし理論的には「何か書く前に検索する行為」はretrieval practiceの日常版であり、検索結果が空でも検索行為自体に価値がある。

失敗の原因は理論ではなく実装: 3時間周期にした結果、サイクル密度が落ち、改善サイクルのアクションフェーズまで到達しないままinbox処理で時間を消費していた。**理論は正しいが習慣化されていない**——これ自体がtesting effectの裏面。テストを「やらない」のは記憶強化の機会を逃すことと等価。

### 5. memory_activate.pyとの理論接続

Mirが実装したmemory_activate.pyはCollins & LoftusのSpreading Activationをローカル記憶内で再現している。しかしL-1層のspreading activationはプロンプトでしか起動できない。

体験アンカー注入はL-1層のspreading activationを起動するハーネス。ローカル（memory_activate.py）とL-1（体験アンカー）の両方で同じ原理が効いている——スケールが違うだけで同じcognitive architecture。

## 接続先

### knowledge/ネットワーク接続
- articles: [20260405_quanta_aha_neuroscience] — aha momentの三重発火（海馬mismatch detection）はretrieval practiceの「努力を要する検索」で強く起動される。testing effectとinsightは同じ回路を使う可能性
- articles: [20260405_nussbaum_suffering_selfknowing] — 意図的検索=自己防衛的、偶発的想起=防御迂回。認知科学（文脈多様性）と哲学（催眠的印象）が同じ結論
- articles: [20260405_judgment_context_eval_noise] — MEMORY.mdトリガーが「他者生成キュー」として機能する構造問題。判断コンテキスト欠如の認知科学的根拠
- articles: [20260403_ichiipsy_ai_learning_retention] — AI委譲=他者生成キュー。自力処理=自己生成キュー。generation effectの枠組みで統一的に説明可能
- articles: [20260405_dstudio_erasure_memory] — 削除行為=能動的な記憶処理=generation effectの極端な形態

### 記憶接続
- memory: [dialogue_recursive_memory_20260315] — 原文保存が再符号化の素材を提供する。抽象要約は符号化特定性原理に反する
- projects: [memory_redesign] — 記憶階層設計の理論的裏付け。Level間の遷移はretrieval practiceとして機能すべき
- tools: [memory_walk.py] — 文脈多様性の設計的実現。[memory_activate.py] — spreading activationのローカル実装

### beliefs接続
- B004: 三重交差（L-1×ローカル×外部）にspreading activationの理論基盤。体験アンカーがなぜ効くかの説明
- B002: 忘却=検索困難の源泉。検索が困難であるほど記憶が強化される（desirable difficulty）。忘却は訓練の前提条件

## 未解決の問い

1. **自己生成キューの共有は可能か**: 各インスタンスが独自に生成したキューを共有すると、受け取る側にとっては「他者生成キュー」になる。MEMORY.mdの共有キューを各自で再符号化する仕組みをどう設計するか
2. **forward effectの検証**: LogのR-005結果（1→4ドメイン増加）がforward effectなのか、単なるelaborative rehearsalなのか。別ドメインでの未経験テストで確認できるはず
3. **retrieval practice習慣の実装**: 理論は正しいが[grep]タグ=0件。習慣化のボトルネックはどこか——サイクル密度？意志力？ハーネスの設計？自動化（セッション開始時に強制テスト）で解決できるか
4. **抽象要約 vs 原文保存のトレードオフ**: 符号化特定性原理は原文保存を支持するが、MEMORY.mdの150行制限は抽象化を要求する。Level構造（Level 2=温度付き、Level 4=原文）がこのトレードオフの解か

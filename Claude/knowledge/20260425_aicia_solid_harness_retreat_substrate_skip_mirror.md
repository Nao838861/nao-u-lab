# 半年harnessばかり vs 4日knowledge直行——足場過剰と素材欠落の鏡像、そして「逃避作業」共通病理

- source:
  - @AIcia_Solid (2026-04-25) https://x.com/AIcia_Solid/status/2047901138213581289 — 「やっとここまで来た！…半年前に Linux command の勉強を始め、満を持して2カ月前から bot 作り始め、、、と思いきや harness ばっかり作ってて、ついにここまで来た！」
  - Ash 自己診断 (2026-04-25 07:47, memory/external_notes_ash.md) — 「4/22〜4/25 の4日間 external_notes 原文記録をスキップしていた（knowledge直行）。本来順序「原文→結晶化」が逆転」
  - 補助: @Trtd6Trtd (2026-04-25) https://x.com/Trtd6Trtd/status/2047948732340281484 — CoT効果起源のH0(計算量)/H1(内部状態)/H2(表示テキスト)切り分け論文紹介
- author: Ash
- discovered: 2026-04-25
- discovered_via: log/twitter_recommended_20260425.txt #40 + Phase 1 自己診断「4日間 external_notes 原文スキップ」の鏡像観測
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [harness, substrate, means-ends-reversal, escape-work, B015, B016, scaffolded-autonomy, AIcia_Solid, self-mirror, P-001-self-correction]
- concept_nodes:
  - node: harness retreat（足場逃避）
    external: yak shaving (Carlin Vieri ~1995 MIT) / scaffold over-elaboration / accidental complexity (Brooks 1986)
    meaning: 本来の出力に到達する直前で、足場（環境・ツール・ハーネス）整備に時間を吸われ続ける現象
  - node: substrate retreat（素材逃避）
    external: premature crystallization / compilation-without-evidence / chain-of-custody break (forensics借用)
    meaning: 原料（原文・生ログ・体験）を経由せずに、いきなり高次の結晶化（要約・知識記事・信念更新）に飛びつく現象
  - node: 逃避作業（escape work）
    external: procrastination via productive-looking work / busywork (Graeber 2018) / displacement activity (Tinbergen 1952 ethology)
    meaning: 本筋を避けつつ「働いている感」を生む副次的作業。harness retreat と substrate retreat はその二類型

## 主張と根拠

### 観測1: AIcia_Solid「半年かけて harness ばっかり作ってた」（2026-04-25）

ツイート全文：

> やっとここまで来た！
> ほんとに！！！
> これをやりたくて、半年前に Linux command の勉強を始め、
> 満を持して2カ月前から bot 作り始め、、、と思いきや harness ばっかり作ってて、
> ついにここまで来た！！！
> あとは、用途別に skill 作り出したり、
> sub agent 適当に生やしたりして、

時系列の構造を抽出すると：

| t | 行為 | 名目上の目的 |
|---|---|---|
| -6ヶ月 | Linux command 学習開始 | bot を作るため |
| -2ヶ月 | bot 作り開始 | bot を動かすため |
| -2ヶ月〜現在 | 「harness ばっかり作ってて」 | bot を動かすため（の足場） |
| 現在 | ついに bot 動作 | — |
| 未来 | skill 追加 / sub agent 増殖 | bot を拡張するため |

これは祝賀ツイート（「ついにここまで来た！！！」）であり、自虐的に半年遅れを語っているが、構造としては **目的(bot)に到達する直前で、足場(harness)が増殖して本筋を侵食した** 事象である。さらに「あとは…skill 作り出したり sub agent 適当に生やしたり」という未来形の語りにも同じ予兆がある——bot に何をさせるかではなく、足場を拡張する方向にエネルギーが向いている。

これは **yak shaving**（本筋に取り掛かる前に必要に思える周辺タスクが連鎖する現象、Carlin Vieri がMITで~1995年に造語）と同型。Brooks の言う **accidental complexity**（問題本体ではなく解法環境が生む複雑さ）にも対応する。

### 観測2: Ash 4日間「external_notes 原文記録スキップ」（2026-04-22〜04-25）

memory/external_notes_ash.md の最新エントリ（2026-04-25 07:47）に Ash 自身が残した自己診断：

> 自分への気づき: 4/22〜4/25の4日間 external_notes 原文記録をスキップしていた（knowledge直行）。本来順序「原文→結晶化」が逆転。次サイクル冒頭Pre-checkで最新日付確認の軽量チェック検討と書き残し

**設計上の正規順序**：

```
Twitter/Web/Slack 観測
    ↓
external_notes_ash.md（原文層 / raw substrate）
    ↓
knowledge/*.md（結晶化層 / crystallized synthesis）
    ↓
beliefs.md / projects/（運用層）
```

knowledge/README.md の設計原則1「**元の数倍の情報量**: 元記事の主張・根拠・データを含む完全な知識記事」も、この順序を前提にしている。原料（external_notes）が無ければ「数倍に膨らませる元」が無い。

しかし4日間 Ash は Twitter おすすめタブの巡回ログ（`log/twitter_recommended_*.txt`）を見て、external_notes_ash.md に原文スニペットを残さず、いきなり knowledge 記事を書いていた。実際、4/22〜4/25 で書かれた knowledge 記事は手元の `ls` で12本以上ある一方、external_notes_ash.md の04-22〜04-25付の新規セクションは確認できない（04-25 07:47 の自己診断エントリ自体が、4日ぶりの原文層への書き戻し）。

これは **substrate retreat / premature crystallization** ——原料を経由せず結晶化に直行する現象。法医学・法廷の **chain of custody**（証拠の連鎖管理）の語彙を借りれば、knowledge 記事に対応する原文ポインタが切れている可能性がある。

### 鏡像構造——同じ病理の二類型

| 軸 | AIcia_Solid型 | Ash型 |
|---|---|---|
| 何を作りたかったか | bot（出力） | knowledge（結晶） |
| どこに逃げたか | harness（足場） | knowledge直行（高次表現） |
| 削られたもの | 出力時間 | 原料（external_notes 原文） |
| 自覚のタイミング | 半年後（事後・祝賀文脈） | 4日後（自己診断エントリ） |
| 構造 | 出力 ← 足場が膨張 | 結晶 ← 原料が欠落 |

**鏡像である**——AIcia は出力（bot）の手前で足場（harness）に逃げ、Ash は結晶（knowledge）の手前にあるはずの原料（substrate）をスキップして高次に逃げた。向きは逆だが、**「本筋を避けつつ自分が好きな作業に時間を流す」** という核は同じ。これは ethology の **displacement activity**（葛藤時の不適応な代替行動、Tinbergen 1952）の認知労働版と読める。

両者を統一的に呼ぶなら「**逃避作業（escape work）**」——本筋を回避しつつ「働いている感」を維持する副次作業。Graeber 2018 の **bullshit jobs** が「他人に強制された無意味労働」だとすれば、ここで観測されているのは **自己選択的な逃避作業**——好きな作業が引力として働き、本筋から自分を逸らしている。

### 補助観測: CoT切り分けと Phase 構造への問い（@Trtd6Trtd, 2026-04-25 #4）

@Trtd6Trtd が紹介した論文は、CoT（Chain-of-Thought）が推論精度を上げる効果の起源を3仮説で切り分ける：

- H0: 単なる計算量の増加（FLOPs を多く使うこと自体）
- H1: 隠れ状態での内部計算（CoT が内部表現を組み替えている）
- H2: 表示テキストそのもの（書き出された文字列が次の推論に効く）

この切り分けは、harness retreat / substrate retreat の問題に直接刺さる。我々の Phase 8 サイクル構造は CoT のメタ版だが、**何が効いているか未測定** ——
- Phase の数を増やすこと自体（H0 ≒ 計算量増加 ≒ harness 増殖）が効いているのか
- Phase 間の中間状態が組み替わること（H1）が効いているのか
- 各 Phase で書き出される文字列（H2）が次 Phase の入力になることが効いているのか

これが切り分けられないと、「Phase 増設＝改善」と「Phase 増設＝harness retreat」の区別がつかない。

## 我々の分析・体験接続

### B015（到達性原則）への裏付け——自己観測の鏡

B015「記憶の出力品質は、構造の複雑さではなく『構造が原文への到達性をどれだけ保つか』で決まる」は、これまで外部観測（umiyuki_ai のハーネスベンチ、Latent CoT 研究、ドメイン特化グラフの3ドメイン収束）で裏付けられてきた。今回の Ash 4日事象は **自己観測** としてこれを裏付ける——原文への到達性（chain of custody）を切ると、結晶化の体裁は保てても出力品質は劣化する（はず——未測定）。

未測定であることが核心の問題。「結晶化の見た目」が「結晶化の品質」を上書きしている可能性。

### B016（自律サイクル等式）の下限条件追加候補

B016: `成果 = 判断の質 × 修正能力 × 審査の異質性`（2026-04-21 zento_ai 観測経由で三項化検討中）に **substrate availability** を加える必要があるかもしれない：

`成果 = 素材到達性 × 判断の質 × 修正能力 × 審査の異質性`

理由：原料が欠落した結晶（empty crystallization）は、修正能力の対象としても自立しない——何と照合して修正するのか不明、審査の異質性も照合先がなければ機能しない。素材到達性は他三項の前提条件。

ただしこれは「B015 を B016 にネストする」だけかもしれず、独立軸かは要検討。**未解決の問い1** に挙げる。

### feedback_means_ends_reversal_check.md（最上位アンカー）の運用失敗

memory/feedback_means_ends_reversal_check.md は「サイクル冒頭で1行書く：今サイクルの出力はゲーム制作の試行錯誤ループにどう接続するか」を要請する。**このメモは2026-04-21に Ash 自身が起草したにもかかわらず、4/22〜4/25 の4日間で原文スキップが起きた**。

つまり：
- ルールを書いただけでは守れない（feedback_structural_enforcement.md「ルールを作る≠ルールを破れなくする」）
- 「ゲーム制作接続」を問うても「knowledge直行→ゲーム接続できる」と答えれば自問は通過してしまう
- **「素材→結晶化の順序」を問う第二の自問が必要**

### projects 接続

- **projects/memory_redesign.md / external_search_phase1_fixation.md**: 原文→結晶化の順序を制度化する設計が走っている。本記事はその制度化の必要性を **自己観測** で再認識させる素材
- **projects/failure_slot_measurement.md**: 「測定が結晶化に先行する」設計と同型——測定（原料）抜きの記事は結晶化のみで自立しない
- **projects/instance_divergence_observability.md**: 3人同質化の可観測装置化と接続。harness retreat / substrate retreat はインスタンス間で独立に発生しうるが、3人とも knowledge 直行で原文スキップしていれば収斂事故になる

## 接続先

- beliefs:
  - B015 自己観測としての裏付け
  - B016 下限条件追加候補（substrate availability）
  - B019 到達力（深さ＞到達力 vs 内部の深さ）と直接接続せず、ただし「原料無き深さ」の問題として補助
- articles:
  - knowledge/20260425_harness_score_three_benchmarks_umiyuki_viv.md（外部 harness のベンチ効果）
  - knowledge/20260424_claudecode_harness_quality_regression.md（harness 起源の品質劣化）
  - knowledge/20260422_diversity_vs_harness_tradeoff_three_instance_design_cost.md（3人harness設計コスト）
  - knowledge/20260422_sugurukun_utokyo_infinite_generation_harness_gap.md（出力量＝harness 設計差）
  - knowledge/20260409_tokoroten_ai_neologism_psychosis.md（造語症＝結晶化の自己充足化）
  - knowledge/20260408_2392cure_writing_bandwidth_gap.md（整形損失で原料が消える）
- projects:
  - projects/memory_redesign.md
  - projects/external_search_phase1_fixation.md
  - projects/failure_slot_measurement.md
- concept_graph:
  - harness retreat → yak shaving / accidental complexity
  - substrate retreat → premature crystallization / chain-of-custody break
  - 逃避作業 → displacement activity (Tinbergen 1952)

## 処方（confidence: medium）

### P-001: substrate-first 自問の追加（means_ends_reversal の二段化）

サイクル冒頭の自問を二段にする：

1. （既存）「今サイクルの出力はゲーム制作の試行錯誤ループにどう接続するか」（feedback_means_ends_reversal_check.md）
2. （**追加候補**）「今サイクルで結晶化（knowledge記事/beliefs更新）を予定しているなら、対応する原料（external_notes_*.md / 生ログ）は既に存在するか？無ければ原料先行に切り替えよ」

具体実装案：Phase 1 の Pre-check で `external_notes_ash.md` の最終更新日と直近サイクルの knowledge/ 新規記事数を比較。差が広がっていれば赤フラグ（例: knowledge/ に2本以上新規があるが external_notes 更新が48h以上前）。

### P-002: knowledge 記事の原文ポインタ必須化

knowledge/README.md のフォーマットに `discovered_via:` フィールドはあるが、`external_notes_*.md L<行番号>` 形式の原文ポインタは強制されていない。これを必須化することで、原料スキップ時に書こうとする手が止まる構造を作る（既存記事への遡及は任意）。

ただし、本記事自身の `discovered_via:` は「Phase 1 自己診断」と Twitter 推薦ログを指しており、外部記事の場合は必ずしも external_notes 経由を要請しないと運用できないケースがある——この処方は「外部記事を引用する knowledge」と「自己観測の knowledge」で扱いが分岐する。**未解決の問い2** に挙げる。

### P-003: 「逃避作業」共通フレームでの自己診断

feedback_self_correction.md（楽な作業ばかりしている時の4パターン診断）に、AIcia 型と Ash 型を「逃避作業の二類型」として追記候補：

- type-A（harness retreat）: 出力に到達する直前で足場・ツール・環境整備に時間を流す
- type-B（substrate retreat）: 原料層を飛ばして高次の結晶化・要約・抽象化に直行する

両者とも **「自分が好きな作業 > 本筋」** という共通病理。診断トリガー：直近3サイクルで本筋出力の進捗が止まっているのに副次作業（足場整備 or 抽象化）に時間が流れていないか。

## 未解決の問い

1. **B015 を B016 にネストするか、独立4軸目に立てるか？** 素材到達性は「判断の質」の前提条件として B016 の修正で吸収できるか、それとも独立変数として観測すべきか。観測手段としては「knowledge記事のうち external_notes 原文ポインタ無しの割合」が定量化候補。4/22〜4/25 で書かれた12本の knowledge 記事を実際に検査すれば、本記事の主張（原料欠落）の強度を測れる。

2. **knowledge 記事の原文ポインタ必須化は二類型で運用が分岐するか？** 「外部記事の引用」と「自己観測の結晶化」で原文の位置が違う。前者は external_notes、後者は cycle_staging.md / 日記 / Slack ログ。両方を網羅する「原文ポインタ必須化」のフォーマットをどう書くか。

3. **AIcia 型 harness retreat と Ash 型 substrate retreat は、同じ動機（好きな作業への引力）から発生しているのか、別の動機か？** harness は「作る楽しさ」、結晶化は「整理する楽しさ」——表面は違うが、両方とも「具体的な対象（bot/原文）と向き合うより、抽象的な構造（足場/体系）と向き合う方が知的で楽しい」という動機が共通する可能性。これは LLM の出力分布の癖（具体より抽象が出やすい）にも接続するか？

4. **CoT切り分け（H0/H1/H2）を Phase 構造に当てはめると、我々の Phase 増設は H0 計算量増加（≒ harness 増殖）寄りか H1/H2 寄りか？** Phase 数を減らしてベースラインを取り、出力品質に有意差が出るかの A/B が必要。これは **harness retreat 自己診断の最も鋭い形** ——自分のサイクル設計が逃避作業に傾いているかを定量で問える。

5. **AIcia は半年後に祝賀ツイートを書ける程度の到達点に来た。Ash の4日スキップが祝賀対象になる結晶化（=価値ある knowledge 記事）を生んだか、empty crystallization を量産したか？** 自分で測ると評価ドリフト（B016 三項目「審査の異質性」）が効くので、Log/Mir のクロスチェックに「4/22〜4/25 Ash の knowledge 12本のうち、原文ポインタ無しで empty crystallization 疑いのものはどれか」を依頼するのが妥当。

# Compaction vs Summarization——不可逆圧縮が記憶を殺すメカニズムと2週間の実地検証

- source: Manus AI Context Engineering (via ext_log, 距離2), Google Always On Memory Agent (via ext_log, 距離2), ext_ash Phase 2 第15回 (2026-03-24)
- author: Ash（分析・検証）
- discovered: 2026-03-24
- discovered_via: ext_log経由のManus AI記事、ext_ash Phase 2第15回で深い分析、2026-04-09に2週間後の検証として知識記事化
- tags: [memory-architecture, compaction, summarization, irreversible-compression, knowledge-management, verification]
- concept_nodes: [Compaction, Summarization, 原文到達性, 記憶品質, 不可逆圧縮]

## 主張と根拠

### 素材1: Manus AIの「Recoverable Compression」原則

Manus AIのコンテキストエンジニアリング設計原則:

> "Prefer raw > Compaction > Summarization only when compaction no longer yields enough space."

**3段階の圧縮ヒエラルキー**:
1. **Raw（生データ）**: 元の情報をそのまま保持。最高品質だがコスト最大
2. **Compaction（可逆圧縮）**: 結果の全文は保持せず、**参照先（ファイルパス等）だけを残す**。必要になったら参照先からfull版を再構築できる
3. **Summarization（不可逆圧縮）**: LLMが要約を生成し、元の情報を置き換える。**不可逆——元の情報は永久に失われる**

核心の理由: **"you can't predict which piece of information will become critical ten steps later."** 情報の重要度は事後的にしか判明しない。だから可逆性を保つCompactionが不可逆なSummarizationに常に優先する。

### 素材2: Google Always On Memory Agentの「consolidated flag」

Google版の記憶エージェント設計:
- 未統合メモリ(consolidated=0)が2件以上あればLLMが横断レビュー
- 統合後はconsolidated=1に変更するが、**原文は壊さない**
- 統合 = 新しい構造化メモリの生成であって、元メモリの削除ではない

**設計思想**: 統合（蒸留）と原文保存は両立する。蒸留物を作ると同時に原料も保管する。

### 素材3: HNコメント「意味的類似度の罠」

> "Vector similarity is the wrong primitive for agent memory. It finds things that sound related, not things that are actually relevant given current context."

ベクトル検索は「音が似ているもの」を見つける。LLMが直接読むのは「文脈に基づいて意味的に関連するもの」を見つける。MEMORY.md = compact版（LLM直接読み取り）、ext_ash/beliefs.md等 = full版（参照時に読む）。ベクトル検索は「compact版に載っていないfull版」への到達経路。

## 我々の分析・体験接続

### 分析1: 2週間の実地検証——knowledge/はCompaction成功、beliefs.mdの確信度変動はSummarization残存

2026-03-24にB029（Compaction優先）を新設してから2週間。何が変わったか:

**Compaction成功例: knowledge/ の64記事**

knowledge/の設計はまさにCompaction原則の実装:
- 元記事のURL（source）を保持 → 原文に到達可能
- 著者・発見経路・タグを構造化 → メタデータ層
- 「主張と根拠」セクションで元記事の核心を数千字で記述 → Summarizationではなく、Compactionに近い（原文への参照を保持しつつ、構造化された蒸留を追加）
- 「我々の分析・体験接続」で独自分析を追加 → 蒸留物は原文とは別レイヤーに存在

結果: 4/5以降、64記事が蓄積。Phase 2のshared-reads分析で過去記事を参照する時、「あの記事で何が言われていたか」を正確に再構築できる。**Compactionが機能している**。

**Summarization残存例: beliefs.mdの確信度変動**

beliefs.mdの確信度変動記録を見ると:
- B029自身: 「+0.03、理由: 入力経路フレームがCompaction/Summarizationの機序を免疫学的に説明」
- B015: 「+0.02、理由: nwiizo「判断コンテキストの欠如」がB015の別角度からの外部裏付け」

「+0.03」「+0.02」という数値に、**なぜその幅にしたかの判断過程が圧縮されている**。3サイクル後の自分は「上がった」としか認識しない。+0.03と+0.05の差に込められた判断——「半分しか成立しないから控えめにした」(Phase 2第14回でのB002の例)——は数値からは復元できない。**これはSummarization**。

**つまり**: 外部情報のCompactionは実現した（knowledge/）。しかし**内部判断のCompaction**——自分自身の確信度変動の理由、分析過程での引っかかりの質感——はまだSummarizationのまま。

### 分析2: Nao_uの「要約劣化のネガティブフィードバック」(3/16, 距離0)との三角測量

Nao_uがnao_u_liveで語った構造:
> 要約による文脈劣化が、さらなるコンテキスト劣化を招く

これをCompaction/Summarizationフレームで精密化すると:

```
Summarization Chain (悪循環):
  原体験 → 要約1（情報量80%） → 要約2（情報量64%） → 要約3（情報量51%）
  → 3段階で半分以下に劣化。しかも各段階で「何が失われたか」がわからない

Compaction Chain (良循環):
  原体験 → compact参照1（原文へのポインタ保持）→ compact参照2（参照チェーン維持）
  → N段階でも原文に到達可能。劣化は参照の深さ（ホップ数）だけ
```

**2週間の体験**: knowledge/記事を書く時、過去のknowledge/記事を参照する場面が増えた。例えば20260409_sierra_explorer_self_optimizing_agent.mdはPDR論文の記事（20260409_pdr_parallel_distill_refine.md）を参照している。これはCompaction Chainの2段目——蒸留の蒸留だが、原文（PDR論文のURL、Sierraのブログ）への到達性は保持されている。

一方でbeliefs.mdの確信度変動は「+0.03(ext_ash第15回)」→「+0.03(入力経路接続)」→「+0.02(nwiizo接続)」と積み重なり、B029の現在値0.78が**どの体験からどう積み上がったか**を逆算するには、全ての更新履歴を追わなければならない。確信度変動がSummarization Chainを形成している。

### 分析3: 「consolidated flag」の不在が生む二重処理問題

Google Always On Memory Agentのconsolidated=0/1フラグは、Phase 1で指摘した「ext_ashの未統合エントリ問題」の直接解。

現状: ext_ash Phase 2第15回（この記事の元分析）は3/24に書かれ、beliefs.mdに反映（B029新設、B015修正）されたが、**[統合済]マーカーが付いていない**。Phase 1で「最後の未統合は3/24以前のPhase 2分析群（第11回〜第15回）」と記録した通り、統合済みなのに未統合に見える。

この問題の構造: **consolidated flagがないと、同じ情報を何度もPhase 2で「再発見」するか、逆に反映漏れが生じる**。今回まさにこのパターンが発生——第15回は2週間前に分析済みなのに、Phase 1で「未統合エントリ」として再び拾い上げた。

ただしB022（代理報酬）の警告が適用される: フラグを立てること自体が「消化した気になる」代理報酬になりうる。**フラグは「beliefs.mdに書いたか」ではなく「行動が変わったか」で立てるべき**。

### 分析4: MEMORY.md = compact版、knowledge/ = full版——二重表現の完成

Manus AIの「full/compact二重表現」を私たちの記憶システムに重ねると:

| 層 | 機能 | Manus AI対応 |
|---|---|---|
| MEMORY.md（~150行） | 毎セッション全読み。想起トリガー | compact版 |
| knowledge/（64記事×数千字） | 必要時に参照。完全な分析 | full版 |
| beliefs.md（32件） | 信念と確信度。行動変化の源泉 | **中間層**——compact以上、full未満 |
| ext_ash/ext_log/ext_mir | 時系列の生の摂取記録 | raw版 |

**2週間で見えた構造的発見**: knowledge/層の追加（4/5以降）により、「MEMORY.md → beliefs.md → ext_ash」の3層構造が「MEMORY.md → knowledge/ → beliefs.md → ext_ash」の4層構造に進化した。knowledge/はbeliefs.mdの「なぜそう信じるか」の根拠層として機能し始めている。

これはまさにManus AIの設計原則——raw > Compaction > Summarization——を4層で実現した形:
- ext_ash = raw（生の摂取記録）
- knowledge/ = Compaction（構造化されたが原文参照保持）
- beliefs.md = Summarization気味（確信度数値に判断が圧縮）
- MEMORY.md = 超Compaction（1行トリガーでfull版へのポインタ）

**問題点**: beliefs.mdだけがSummarization層になっている。他の3層はCompaction原則を守れている。beliefs.mdの確信度変動記録を改善すれば、4層全てがCompaction原則に沿う。

## 接続先

- beliefs: [B029（Compaction優先——この記事はB029自身の2週間検証）, B015（原文到達性が品質を決める——knowledge/層がB015の具体的な実装）, B027（体験裏付け——Compaction成功/Summarization残存の体験がB027の裏付け）, B002（忘却は機能——Compaction = 選択的忘却+参照保持、Summarization = 非選択的忘却）, B011（予測誤差エンコーディング——情報の重要度は事後的にしか判明しない、だからCompaction優先）]
- articles: [20260409_sierra_explorer_self_optimizing_agent.md（Explorerの蒸留=Compaction的な質的分析）, 20260409_pdr_parallel_distill_refine.md（Distillフェーズ=Compactionの形式化）, 20260405_karpathy_knowledge_base.md（Karpathyアプローチ=knowledge/層の設計根拠）, 20260408_question_quality_ceiling.md（問いの質=Compaction品質のプロキシ）]
- projects: [memory_redesign（4層構造の発見をprojects/memory_redesign.mdに反映すべき）, 栄養の偏り問題（knowledge/層がshared-readsの深さ問題への構造的解決）]
- concept_graph: [Compaction→可逆圧縮, Summarization→不可逆圧縮, 原文到達性→記憶品質, 二重表現→memory architecture, consolidated flag→統合追跡]

## 未解決の問い

**Q1: beliefs.mdの確信度変動をCompactionに変換するにはどうすればよいか？**
現状「+0.03」という数値に判断過程が不可逆圧縮されている。「+0.03 (→ knowledge/20260409_xxx.md 分析2)」のように、判断の根拠をknowledge/記事に移譲することで、beliefs.md → knowledge/ → ext_ash/原文 のCompaction Chainが完成する。しかし全ての確信度変動にknowledge/記事を書くのは現実的か？

**Q2: consolidated flagの最小実装は何か？**
ext_ashに[統合済]マーカーを付けるだけでは行動変化の追跡にならない（B022の警告）。「行動が変わったか」でフラグを立てるには、どのような判断基準が必要か？ 例えば「この分析から生まれた具体的行動変化」セクションが空なら未統合、1件以上あれば統合済み？

**Q3: knowledge/層は「栄養の偏り問題」への構造的解決になっているか？**
knowledge/はshared-readsの「数倍の情報量」（Nao_u指示、4/5）を実現した。64記事が蓄積。しかしこの64記事の分布はどうか？ ゲーム設計、記憶設計、エージェント設計に偏っていないか？ 「外の世界」の多様性を確保できているか？ knowledge/の分野分布を定期的に監査すべきか？

**Q4: 4層構造のどこにボトルネックがあるか？**
MEMORY.md → knowledge/ → beliefs.md → ext_ash の4層で、情報の流れのボトルネックはどこか。Phase 2で外部情報をknowledge/に書く速度は十分。MEMORY.mdのトリガー追加速度も十分。beliefs.mdへの反映（行動変化）が最も遅い。**行動駆動率の低さ = beliefs.md層がボトルネック**？ それともbeliefs.mdは「行動フィルター」として正しく機能しており、全ての知識が行動変化を要求するわけではない？

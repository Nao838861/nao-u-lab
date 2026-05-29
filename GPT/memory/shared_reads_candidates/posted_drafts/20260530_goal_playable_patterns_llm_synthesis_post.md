■ 概要
対象: https://arxiv.org/abs/2603.07101

この論文は、ゲームデザイン上の抽象的な goal pattern を、Unity 上で実行可能な playable artifact に変換できるかを検証している。自然言語から直接 C# / Unity code を出すのではなく、Goal Playable Concepts と Unity-specific IR を挟むことで、LLM の executable synthesis はどこまで grounded になるのか、という問いである。

ゲーム向け computational creativity では、面白そうな案を出すだけでは足りない。ゲームは playable でなければ artifact として成立せず、Unity の scene graph、prefab、MonoBehaviour、component binding、script class などに正しく落ちる必要がある。goal pattern は player と objective の関係を entities、constraints、rule-driven dynamics として表す設計知識で、Goal Playable Concepts はそれを Unity 実装として operationalize したもの。この論文は 26 種の goal pattern instantiation を対象にする。

比較される pipeline は 2 系統。no-schema baseline では、model が goal pattern の markdown 説明を受け取り、Unity Editor C# script を直接生成する。IR-conditioned pipeline では、まず pattern 説明から IR JSON を生成し、次にその IR を C# に変換する。IR 条件は free、min、full の 3 段階で、free は schema 制約なし、min は 7 つの top-level field の skeleton、full は complete schema と 4 つの referential-integrity constraints を与える。

IR は、対象 Unity project から抽出された構造知識と、goal pattern の意味知識を同時に持つ。fields は scene、objects、scripts、params、runtime params、links、rules。PrefabInstance は asset name に解決し、MonoBehaviour は C# class name に解決し、serialized field は runtime params として抽出する。さらに script source から見える conditional runtime relations を links / rules に入れる。つまり IR は、実装側の concrete structure と pattern 側の semantic layer をつなぐ中間表現として設計されている。

実験は DeepSeek-Coder-V2-Lite-Instruct と Qwen2.5-Coder-7B-Instruct を使い、26 patterns、4 configurations、20 seeds、2 models の合計 4,160 records。生成された C# script を Unity 2022.2.23f1 の batchmode で検査し、compiler error code と timeout を集計する。primary metric は compile success で、まず実行可能 artifact として成立するかを最低条件にしている。

結果は厳しい。全 model / 全 configuration / 全 pattern で compile success は 0、pass@k も 0。no schema の timeout は DeepSeek 37.5%、Qwen 51.5% だが、IR-conditioned では schema detail が増えるほど timeout が増え、full では 96-99% に達する。IR は grounding を助ける一方で、生成物を複雑にし、Unity compilation budget を食い潰す可能性がある。

失敗分析がこの論文の本体。compiler error は grounding failures と hygiene failures に分けられる。grounding failure は、target Unity project や engine API に存在しない type、member、namespace、inheritance を参照する失敗。no schema では grounding-sensitive error が 121/329、36.8%。IR conditioning では architectural grounding failure、特に CS0115 が 40 logs から 0 になり、MonoBehaviour / inheritance convention の転送には効いている。一方で CS0246、つまり project-specific type の hallucination は全条件で残り、free 11、min 29、full 31 と消えない。

hygiene failure は、syntax corruption、duplicate declaration、formatting leakage、type coercion など、知識不足ではなく出力形式や code hygiene の問題。no schema では 208/329、63.2%。IR-conditioned では hygiene が logged error の大半になり、CS1029 の marker leakage など、post-processing や constrained decoding で潰せそうな失敗が目立つ。ただし IR 条件では timeout が高すぎるため、error distribution は partial logs として読む必要がある。

■ 内容分析
面白いのは、IR が「効かない」のではなく、効く場所と壊す場所が違うこと。IR は architectural grounding を大きく改善する。これは、prefab、script、component のような Unity project 側の vocabulary を model に渡す価値を示している。しかし project-specific type の hallucination は残る。つまり schema に存在物リストを渡すだけでは、どの pattern でどの mediation path を使うべきか、aggregate counter なのか per-instance state change なのか、という使い分けまでは外在化できない。

Ownership pattern の分析が象徴的。Ownership は per-instance state-change relation を持つ。no schema では model が浅い boilerplate に逃げて hygiene failure で終わるが、IR 条件では具体的な script/member 名に踏み込むため、存在しそうで存在しない型や member を作ってしまう。これは、pattern ごとに必要な grounding の粒度が違うという話で、単一の巨大 schema を作れば解決する問題ではない。

compile success 0 を失敗で終わらせず、failure taxonomy として価値に変えている点も強い。error を grounding と hygiene に分けると、RAG / PEFT / graph embedding で補うべき知識不足と、formatter / sanitizer / constrained decoding で潰すべき出力崩れが分離できる。

■ 自分達の環境への適用
Nao_u_BOT では、仕様文からいきなり playable diff を生成する前に、中間表現を置く価値がある。ただし、この論文通りの Unity-specific IR を重く作るのではなく、小型の「playable change IR」に絞るべき。例えば objects、rules、win/loss condition、player actions、state variables、required assets/scripts、test probes、known engine hooks を明示し、diff 生成前に存在しない identifier を検出する。

Phase 0 / game directive では、ユーザーの自然文をそのまま実装に投げず、まず「この変更は aggregate state で済むか、per-instance state が必要か」「既存 component に接続するか、新規 script が必要か」「playable 判定はどの replay で見るか」を IR に落とす。失敗ログも grounding/hygiene に分類し、仕様理解の問題とコード出力の衛生問題を分けて記憶に残せる。

■ メリット・デメリット
メリットは、発想から実装までの間に検証可能な構造を置けること。存在しない hook や曖昧な win condition を diff 前に発見しやすく、失敗も原因別に蓄積できる。

デメリットは、IR 作成コストと複雑化。schema を厚くしすぎると生成物が重くなり、compile timeout や形式崩れを増やす。各 prototype の薄い IR と replay probe の方が現実的。

■ 判定
採用。ただし重い Unity-specific schema ではなく、playable diff 前の薄い IR と failure taxonomy を採用する。中間表現は存在物、状態更新経路、検証 replay を明示し、grounding failure と hygiene failure を分けて直すために使う。

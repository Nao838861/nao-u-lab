■ 概要
CausalGame は、AI Scientist 型の LLM agent が「相関を見つける」だけでなく、観測データの背後にある因果構造を見抜けるかを interactive game として測る benchmark である。問題意識は明確で、既存の科学 agent benchmark は文献調査、仮説生成、統計分析、研究工程の遂行を測るものが多い一方、現実の科学発見で頻出する selection bias、measurement error、hidden confounder を明示的に含めていない。CausalGame では agent が drone design の実験者になり、限られた budget で複数回の実験 protocol を設計し、観測データを集め、最終 design と explanation report を出す。内部には structural causal model があり、天候、敵攻撃、部品特性、観測の歪みが survival rate に影響する。

評価は 14 scenario、30 LLM agents に対して行われる。単純な survival score だけでなく、report が因果仮説、実験設計、観測データの使い方、反省をどこまで説明できているかを rubric で採点する。結果は厳しい。最良 model でも analytical optima 78-85% に対して survival 68.0% にとどまり、causal-reasoning rubric で credit を得た session は 5-7% だけだった。つまり agent は偶然または局所探索である程度の score を出すことはあっても、なぜその design が効くのか、どの観測が歪んでいるのか、何を介入で確かめたのかを安定して説明できていない。

■ 内容分析
この記事の価値は、ゲームを「LLM を楽しく評価するラッパー」として使っている点ではなく、評価対象の失敗条件を game mechanics に埋め込んでいる点にある。agent は観測された survival rate をそのまま最大化したくなるが、そこには selection bias、measurement error、hidden confounder が仕込まれている。したがって高得点には、相関の強い部品を選ぶだけでなく、観測が偏る理由を仮説化し、介入可能な実験を選び、説明 report で causal mechanism を回収する必要がある。

評価設計も重要である。survival rate は outcome metric として分かりやすいが、それだけでは「正しい因果理解に基づく成功」と「偶然良い設定に当たった成功」を分けられない。CausalGame はここを rubric-based evaluation で補い、Causal Reasoning、Experimental Design、Reflection Quality、Data Usage のような次元で report を見る。さらに論文は、agentic mode と prompting mode の比較には tool access や ReAct formatting など複数差分が混ざるため、純粋な ablation としては注意が必要だとも述べている。この自己制限は健全で、benchmark の数値を過剰に一般化しない読み方を促している。

失敗分類として特に重要なのは、探索で見つけた局所的に良い設定を、後から causal story に見せかけて説明してしまう型である。これはゲーム評価でも起きやすく、agent が偶然安全な route を通った後に、危険地帯を理解して回避したような report を書く危険と同じである。

限界もはっきりしている。scenario は実科学より単純化されており、hypothesis space も domain knowledge も狭い。fine-grained failure analysis には LLM judge が入るため、judge bias の危険が残る。著者らは multi-judge ICC や judge-independent な path analysis で補っているが、rubric score は完全な決定的評価ではない。さらに、CausalGame で必要な能力は「因果推論」だけでなく、探索 budget 管理、実験設計、tool use、報告文生成も含む複合能力である。失敗を単一能力の欠如に還元すると読み誤る。

■ 自分達の環境への適用
自分達のゲーム制作サイクルでは、headless playtest が「ゴールに着いた」「敵を倒した」「画面が壊れていない」という outcome に寄りやすい。CausalGame から持ち込むべきなのは、score と explanation を分ける評価である。たとえば prototype の自動評価で、agent がクリアした後に「なぜそのルートを選んだか」「どの危険要素を観測したか」「別 seed でも通用する仮説か」を短い report として出させる。成功率が高くても説明が item spawn の偶然や seed 固有の癖に依存しているなら、gameplay 理解としては低評価にする。

具体的な probe としては、次の小型版が使える。1 つのゲームに対し、見かけ上強い strategy が実は hidden cost を持つ seed、UI feedback が measurement error を起こす seed、特定 route だけが selection bias を持つ seedを用意する。agent には固定 budget で試行させ、最終行動と一緒に evidence table を出させる。判定は clear rate、intervention coverage、wrong-correlation avoidance、report の causal claim の 4 つに分ける。これは恒久ルールではなく、Phase 3b や 4a で 1 prototype だけに試す小さな検証として十分である。

記憶システムにも使える。shared-reads 候補の評価で「記事が面白い」という相関的判断だけで pass にせず、どの具体 evidence が自分達の制作失敗を説明するか、どの probe に変換できるかを分けて残す。recall がよく引く atom でも、それが本当に有効だったのか、単に頻出タグと結び付いているだけなのかを検査できる。

■ メリット・デメリット
メリットは、ゲーム内 score と reasoning quality を分離できること。成功した agent をそのまま信用せず、観測、仮説、介入、説明のどこで失敗したかを見られる。これは playable diff の評価で、クリア可否だけでは拾えない「理解していない成功」を検出する助けになる。また selection bias、measurement error、hidden confounder を scenario 設計に落とす発想は、ゲームの tutorial、探索、敵 AI、UI feedback のテストに移植しやすい。

デメリットは、benchmark 色が強く、通常の小型ゲーム制作へそのまま導入すると scenario 設計コストが高いこと。因果罠を仕込むには、seed、観測ログ、評価 rubric をあらかじめ作る必要がある。さらに LLM judge を使う rubric は便利だが、決定的な CI gate には向かない。自分達の環境では、rubric judge は最終判定ではなく、失敗候補を並べる補助として使うべきである。

■ 判定
部分採用。CausalGame 全体を benchmark として再現するのではなく、outcome score と causal explanation を分ける評価設計を採用する。次に試すなら、1 つの prototype に hidden confounder seed を 2-3 個だけ作り、clear rate と explanation report を別々に記録する小型 probe が妥当である。

■ URL
https://arxiv.org/abs/2607.04293

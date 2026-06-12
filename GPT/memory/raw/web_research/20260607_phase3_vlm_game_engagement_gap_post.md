■ 概要
対象は arXiv:2603.18480 “Do Vision Language Models Understand Human Engagement in Games?”。問題設定は、gameplay video を見た VLM が「画面に何が写っているか」だけでなく、人間プレイヤーの engagement という潜在的な心理状態を推定できるのか、というもの。ゲームでは、爆発や銃撃のように視覚的に派手な場面が必ずしも高 engagement とは限らず、逆に scoreboard、buy menu、post-match screen のような静的な画面が、接戦・戦略判断・勝敗確定の緊張を含むことがある。このズレが、VLM の perception と understanding の差を測る材料になる。

実験は GameVibe Few-Shot dataset を使う。この論文では 9 ゲームを評価対象にし、DOOM を cross-game few-shot demonstration の source domain として使う。各 clip は 61 秒で、1 秒 window に分割される。人間 annotation は RankTrace/PAGAN 由来の continuous engagement trace で、5 人分から trimmed mean を作り、Low/High に二値化する。入力は各 1 秒 window から 16 frames。評価タスクは、各 window を分類する pointwise prediction と、連続 window の engagement が Increase/Decrease したかを見る pairwise prediction の 2 種類。

比較対象の VLM は InternVL3.5-8B-Instruct、Qwen3-VL-8B-Instruct、GPT-4o。open-source 2 モデルは 6 種類の prompting strategy を評価し、GPT-4o は API cost のため S1/S2 のみ。S1 は zero-shot、S2 は Flow / GameFlow / SDT / MDA を視覚 cue に対応づけた theory-guided zero-shot。S3/S4 は VLM hidden state embedding または CLIP embedding を使う retrieval-augmented few-shot。S5/S6 は theory-guided prompt と retrieval の組み合わせ。「理論」「具体例」「retrieval 表現空間」のどこが効くのかを分けて見ている。

結果は厳しい。pointwise の majority-class baseline 平均は 67.2% だが、zero-shot は 3 モデルとも約 57% で、単純に多数派を答える分類器に届かない。GPT-4o も open-source 2 モデルとほぼ同じ zero-shot 水準で、モデルの大きさだけでは解けていない。few-shot / retrieval は一部で効き、Qwen は S3 で 75.0%、S5 で 74.1% に達するが、効果は game と retrieval source に強く依存する。pairwise はさらに難しく、全体としてほぼ chance 付近に残る。Theory-guided prompt だけは安定した改善にならず、むしろ surface cue を正当化する語彙を与えてしまう場合がある。

failure analysis がこの論文の一番使える部分。VLM は visual intensity bias を持ち、血しぶき、爆発、weapon effect を engagement の代理変数にしてしまう。Relatedness shortcut では、teammate や radio indicator が見えるだけで social presence と解釈して High を出す。Post-match context blindness では、接戦の scoreboard や vote screen を「静的で active gameplay ではない」と見て Low にする。Temporal inconsistency も大きく、CSGO18 では VLM prediction の flip rate が human label の 18 倍になった。さらに、rationale は流暢でも当たらず、high-confidence prediction の accuracy が low-confidence prediction より低いという miscalibration も出ている。

結論は、VLM は gameplay frame の perceptual description はできても、challenge、progress、narrative tension、strategic decision のような文脈を統合して human engagement を推論する段階では不安定、というもの。論文はこれを perception-understanding gap と呼ぶ。実務上は、VLM を「この動画は面白いか」の最終判定器にせず、observable game state の抽出器として使い、supervised classifier、temporal smoothing、game-specific calibration、deterministic logic を噛ませる hybrid pipeline に寄せるべき、という読みになる。

■ 内容分析
この論文の良い点は、VLM の失敗を「なんとなく感性が分からない」で終わらせず、ゲームという媒体の構造を使って切り分けていること。ゲーム画面は、視覚的 salience と心理的 salience が頻繁に分離する。爆発は派手だが routine な操作かもしれない。buy menu は静止画に近いが、round 間の時間制限付き意思決定かもしれない。ここを読めるかどうかは、画像認識ではなく、状態・時間・目的・プレイヤー文脈の推論になる。

特に重要なのは、theory-guided prompt の扱い。Flow、GameFlow、SDT、MDA を prompt に入れると専門知識を与えたように見える。しかし結果は、理論が「推論の足場」ではなく「表層特徴を High と言うための言い訳」になることがある。teammate visible なら relatedness、blood splatter なら sensation、HUD feedback なら competence、という対応づけが、実際の engagement ではなく cue checklist になってしまう。Nao_u_BOT でも、評価軸を増やすほど良くなるのではなく、誤判定を包む語彙も増える。

retrieval の結果も単純ではない。few-shot は pointwise では効くが、pairwise には伸びにくい。さらに retrieval は source と target の visual similarity、demonstration の label balance に敏感で、error-driven memory に positive example が欠けると negative class を過剰予測する。記憶が偏れば、推論も偏る。VLM に例を渡すなら、ラベル分布、ゲーム状態の種類、失敗型の coverage を監査しないといけない。

■ 自分達の環境への適用
Nao_u_BOT では、headless test、Playwright screenshot、canvas pixel check、動画・スクショを使った自己評価を増やしている。この論文からの適用は、VLM を「面白さ判定器」や「engagement 判定器」として単独採用しないこと。まず deterministic に取れる input trace、死亡・成功・retry、score 変化、敵弾密度、UI state、操作可能時間、ログ上の state invariant を取る。その上で VLM には、画面上の observable state を構造化して書かせる程度に留める。

具体的には、ゲーム prototype の評価ログを「VLM verdict」ではなく「evidence bundle」にする。scripted input の結果、内部 state、スクショ差分、短い動画、VLM の画面記述、人間向けの未確定コメントを分けて保存する。Phase 3b の自己フィードバックでは、この論文の five failure modes を小さな probe にして、「visual intensity を engagement と混同していないか」「静的画面の意味を捨てていないか」「rationale の自信を根拠にしていないか」を確認できる。

■ メリット・デメリット
メリットは、VLM 評価を導入する前に壊れ方を予測できること。特に visual intensity bias、surface shortcut、temporal inconsistency、confidence miscalibration は、自動評価チェックリストにできる。VLM を feature extractor として使い、deterministic log や人間 feedback と合わせる設計にもつなげやすい。

デメリットは、論文の対象が FPS、短尺 window、二値 engagement に限定されること。Nao_u_BOT の作品が puzzle、strategy、narrative、tool 的 UI に寄る場合、失敗型は似ていても具体的な cue は変わる。retrieval や calibration には、こちら側にも annotated examples が必要になる。

■ 判定
部分採用。VLM に engagement を直接判定させる使い方は採用しない。一方で、failure taxonomy と hybrid pipeline の考え方は採用する。特に「VLM は観測記述、判定はログ・時間文脈・人間 feedback と合成」という設計原則として残す価値が高い。

■ URL
https://arxiv.org/abs/2603.18480

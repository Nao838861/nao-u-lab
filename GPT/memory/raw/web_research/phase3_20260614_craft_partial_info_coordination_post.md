■ 概要
対象は arXiv:2603.25268 “CRAFT: Grounded Multi-Agent Coordination Under Partial Information”。これは、複数の LLM agent が不完全で互いに補完的な視界だけを持ち、自然言語で相談しながら、誰も全体を直接見られない 3D 構造物を組み立てる benchmark である。単に「会話できるか」や「一人で空間推論できるか」ではなく、部分情報下で、相手が何を見ているか、自分が何を伝えるべきか、Builder が実行可能な命令へどう落とすかをまとめて測る。

CRAFT の重要な点は、協調を抽象的なチャット成功ではなく、物理的なブロック配置タスクとして固定していること。手続き的に target 3D object と各 agent の private 2D view を作り、複数の Director が自分の見えている情報から Builder へ指示を出す。Builder はその指示をもとにブロックを置く、消す、向きを指定するなどの操作を行い、環境側は move validation とログを持つ。つまり、会話の印象ではなく、状態が進んだか、どの指示が誤ったか、何ターン停滞したかを追える。

論文はこの設定を multi-sender Bounded Pragmatic Speaker problem として整理し、失敗を spatial grounding、belief modeling、pragmatic communication のズレに分解する。spatial grounding は、座標、層、向き、ブロックの大きさや span を正しく環境に対応づける問題。belief modeling は、自分の見え方と相手や Builder の知識状態を区別する問題。pragmatic communication は、正しい情報を持っていても、相手が次の実行に使えるだけの具体性、優先順位、修正手順として伝えられるかの問題である。

評価では、open-weight model と frontier model、reasoning model を含む多様なモデルを比較している。結果の主張は直感に反していて、強い reasoning 能力がそのまま協調成功へはつながらない。個々の発話が丁寧になっても collective task success が改善しない場合があり、小さめの open-weight model が frontier system に匹敵または上回る場面もある。これは「単体推論」「説明の流暢さ」「共同作業の進捗」が別能力であることを示している。

失敗例も具体的で、例えば Director が「bottom layer」と言ったが実際には除去すべきブロックが layer 1 にあり、Builder が layer 0 を消そうとして engine に拒否される。複数の Director が同じ誤りを繰り返し、数ターン進捗ゼロになる。別の例では、大きいブロックを置くには span endpoint が必要なのに、Director が「bottom right」だけを伝え、Builder が大きさを推測しても span を欠く。この種の失敗は、発話が自然でも、環境状態、操作前提、相手の解釈が揃っていないと共同作業が壊れることを示す。

結論として CRAFT は、LLM agent の協調を「会話品質」だけで評価する危うさを突いている。partial information では、各 agent が見たものを説明するだけでは足りない。必要なのは、見えていない部分の不確実性を保持し、相手の知識状態を推定し、環境で検証可能な一手へ変換すること。現在のモデルはこの連鎖を安定して閉じられておらず、multi-agent coordination はまだ解けていない、というのが論文の中心的な結論である。

■ 内容分析
この論文の価値は、協調失敗を「LLM が賢くない」ではなく、どの接続が切れたかとして読むための語彙を与えている点にある。多くの multi-agent 評価では、最終成功率や会話 transcript の見た目が前面に出る。しかし CRAFT は、Director の private view、Builder の action、engine の validation、oracle 的な推奨、ターンごとの停滞を並べ、失敗を局所化する。これにより、モデル比較よりも、協調を壊す設計上の弱点が見える。

特に重要なのは、reasoning model の強さを過信していないところ。長い説明や一見もっともらしい相談は、共同作業ではむしろ誤った合意を強化することがある。Director 同士が同じ間違った layer 認識を共有すると、Builder はその consensus に従い、環境は何も進まない。これは「合意があること」と「正しい共通理解があること」が違う、という multi-agent 運用上の核心である。

また、タスクが 3D ブロックであることもよい制約になっている。完全なゲーム環境ほど複雑ではないが、座標、層、遮蔽、複数視点、手戻り、可視範囲の違いがあるため、単純な言語パズルよりもゲーム制作に近い。発話ログだけでなく、状態遷移と実行エラーを見られるので、LLM agent を「NPC らしく話す存在」ではなく「世界状態に対して責任を持つ共同作業者」として評価できる。

限界は、3D 構造物構築という人工タスクから、ゲーム内の多様な協調へ直接一般化できるわけではないこと。プレイヤーの意図、楽しさ、駆け引き、UI 読み取り、リアルタイム操作はまだ入っていない。ただし、部分情報、自然言語指示、環境検証、修正ループという骨格は、ゲーム AI 評価に移植しやすい。

■ 自分達の環境への適用
Nao_u_BOT では、協力ゲーム、情報非対称 NPC、複数 AI playtester の評価にそのまま使える。例えば「NPC がプレイヤーにヒントを出す」「複数 bot が別視点で map を探索する」「AI reviewer が別々のログを見て playable diff を評価する」といった場面で、成功/失敗だけを見ると薄い。CRAFT 風に、grounding、belief、pragmatics の三分解でログを残すと、失敗原因が設計へ戻しやすくなる。

具体的には、prototype の headless run に、各 agent の観測範囲、送った指示、受け手の解釈、実行 action、engine validation、停滞ターンを出す小さな trace schema を追加できる。shared-reads や Phase 3b の自己反映にも使える。候補投稿の品質を見る時も、「記事内容を見たか」「Nao_u 環境を見たか」「その二つを検証可能な一手へつないだか」を分ければ、テンプレ的な適用案を減らせる。

ゲーム制作で特に効くのは、会話ログを褒める前に状態進捗を確認する習慣である。NPC が自然に話していても、プレイヤーの次行動が改善しなければ設計上は失敗かもしれない。AI playtester が合意しても、同じ誤読を共有しているだけかもしれない。この疑いを持つための benchmark として CRAFT は有用。

■ メリット・デメリット
メリットは、multi-agent の失敗を、曖昧な会話評価ではなく、空間 grounding、相手モデル、実行可能な指示という観察単位へ分けられること。協力ゲームや NPC 評価で、どの設計変更が共同作業を進めたのかを追いやすい。

デメリットは、移植にはタスク設計が必要なこと。ゲーム側で private view、正解または oracle、move validation、turn log を用意しないと、CRAFT の強みは出ない。また、協調を検査するための環境が重くなりすぎると、短期 prototype の速度を落とす。

■ 判定
部分採用。CRAFT 全体を benchmark として導入するのではなく、Nao_u_BOT の協力・情報非対称 prototype と AI playtest ログに、grounding / belief / pragmatics / progress の分解を probe として入れる価値が高い。

■ URL
https://arxiv.org/abs/2603.25268
https://arxiv.org/html/2603.25268v2

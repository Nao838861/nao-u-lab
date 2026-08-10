■ 概要
対象は “When LLMs Play the Telephone Game: Cultural Attractors as Conceptual Tools to Evaluate LLMs in Multi-turn Settings”。単発の prompt-output では小さく見える生成 bias が、LLM から LLM へ文章を繰り返し渡すと、どの方向へ蓄積・収束するかを調べた研究である。個体モデルの品質ではなく、反復伝達する集団系の挙動を文化進化の transmission chain で測る。

実験では最初の agent に人間が書いた文章と処理 instruction を渡し、次の agent は直前の出力だけを受け取る。この写像を50 generation続ける。task は、意味を保つ Rephrase、材料として新作する Take inspiration、続きを書く Continue の3種。model は GPT-4o-mini、GPT-3.5、Llama3 8B/70B、Mistral 7B、Mixtral 8x7B の6種で、20初期文章×5 chainを各条件で回す。主実験は同じ model・同じ instruction の homogeneous chain で、補助実験では異種 model も扱う。

追跡する property は toxicity、positivity、difficulty、length。difficulty は Gunning-Fog index、length は文字数で測る。著者らは attractor を、初期値が異なっても反復後に近づく理論上の equilibrium として、位置と強さに分ける。初期 property と50 generation 後の property の回帰を取り、slope が0に近いほど初期値を忘れて同じ地点へ引かれる強い attractor、回帰線と対角線の交点を attractor position とする。

結果は、generation 1 と後続 generation の分布を比べた KS test の p-value が多くの条件で世代とともに0へ近づき、単発処理後とは異なる分布へ移ることを示す。Rephrase は初期の positivity を比較的保つが、Take inspiration と Continue は変化が強い。Continue のように制約の弱い task は Rephrase より attractor が強く、property 間では toxicity の attraction が length より強い。model によって attractor position は異なり、GPT-3.5やLlama3-8Bは短文化、MixtralやGPT-4o-miniは長文化へ動く例もある。Llama3系の positivity は二峰性へ収束する条件がある。

temperature 上昇は Rephrase と Take inspiration の attraction strength を増すが、すでに開放的な Continue では同じ効果が出ない。base/instruct の fine-tuning も attractor の位置と強さを変える。Mistral-7B の Continue では “#keyword” 型の文字列を大量反復する長文化 outlier まで生じ、主解析から除外されたが、反復生成系が局所的な崩壊へ入る失敗例として重要である。結論は、multi-turn 系を一回ごとの平均品質だけで評価せず、反復写像が持つ収束方向を測るべきだというものだ。

■ 内容分析
この研究の価値は「誤りが累積する」という一般論を、初期値への依存度と収束点という二つの量へ変換したことにある。意味保持率だけでは、文章が毎回少し変わるものの初期差を保つ系と、どんな入力も同じ感情・難度・長さへ均す系を区別できない。attractor strength はその区別を可能にし、position は「どこへ均されるか」を示す。

また、品質低下と設計された変形を分ける視点が要る。Continue で文章が新しい方向へ動くのはtaskの目的でもあり、変化量だけを悪とすると創造性を殺す。一方、toxicity や positivity が初期内容と無関係に特定点へ収束したり、文字列反復に崩壊したりするのは、作者が意図した物語変形とは別である。従って evaluation は content identity、style/property drift、task success を別列に持つべきだ。

実験の強みは50世代、複数初期値、複数chain、複数model・taskを揃え、prompt wording と初期文章数の robustness check も行ったことだ。単一の面白い失敗例ではなく、分布変化と回帰で系の傾向を捉えている。反面、主実験は線形の homogeneous chain であり、実際のNPCネットワークの分岐、選択的伝達、外部world stateからの再注入、ユーザー訂正は含まれない。property metric も、toxicity classifier や readability index が物語上のニュアンスを完全に表すわけではない。

重要な追加解釈は、memory summarization にも同じ attractor があることだ。長いログを要約し、その要約を次の要約の入力にする構造では、明示的な誤情報がなくても、文章が「肯定的・単純・短い・説明口調」など model 固有の既定点へ近づき得る。個々の要約を目視して自然に見えることと、50回後に少数意見や例外が残ることは別問題である。

■ 自分達の環境への適用
ゲームではNPCの噂、伝言、派閥間報告、プレイヤー行動の口承を同じ seed から複数chainで回す。seed factを、人物、場所、時刻、因果、確信度、感情valenceに分解し、各generationで保持率とproperty driftを記録する。意図したゲームメカニクスなら「人物名は残るが犯行動機は誇張される」など設計目標を先に置き、意図しない attractor と区別する。

最小probeは、10種類の短いworld eventを用意し、Rephrase相当の厳密伝達、Take inspiration相当の脚色、Continue相当の自由応答を各10～20世代、5seedずつ回す。entity/fact F1、因果方向の反転、toxicity、positivity、length、重複率を世代ごとに保存する。generation 1 と最終だけでなく、どの世代から急変したかを見る。modelやpromptを更新した際はattractor positionとstrengthの差を回帰試験にする。

記憶システムでは、raw→atom→candidate→staging→日記のような派生列を電話ゲームとして監査できる。同一raw事実から各層の表現を直列に入力し、URL、数値、否定、留保、失敗条件が何段後まで残るかを測る。特に「前段の要約だけを読んで次段を書く」経路と「各段でrawを再参照する」経路を比較すれば、再帰要約による attractor を検出できる。現行の raw 原文保持と final gate は、この drift を切る再注入点として意味を持つ。

制作サイクルでは、LLMを更新した時の単発benchmarkに加え、反復変換benchmarkを一つ持つ。合格条件は、自然さの平均点ではなく、critical fact retention、望ましくないpropertyの収束、collapse patternの有無で定義する。長期運用で使うchain長より短い試験だけでは安全側にならないため、実運用の最大hop数以上まで回す。

■ メリット・デメリット
メリットは、multi-agentや長期memoryの問題を、各agentの賢さではなく系の反復特性として観察できることだ。小さいbiasの増幅をrelease前に発見でき、model、temperature、instructionの変更をattractorの移動として比較できる。ゲーム上は、噂の変形をバグではなく制御可能なメカニクスへ変える設計語彙にもなる。

デメリットは、50世代の線形chainが実際の会話網より単純で、metricが意味の保存を十分に捉えないこと、推論費用がchain長に比例することだ。attractor positionは初期値範囲と回帰形に依存し、非線形・多峰性の系を一本の直線で要約すると落とし物が出る。positivityが二峰性になる結果は、単一の収束点だけでは不十分な例でもある。

危ない移植は、driftをすべて抑えることと、自然な噂変形を作ることを混同する点だ。事実の核、演出上変えてよい属性、絶対に増幅してはいけない属性を事前に分け、collapse検知と創造性評価を別にする必要がある。

■ 判定
採用。反復生成を含むNPC会話・world log・記憶圧縮の回帰試験として、generationごとの事実保持とproperty drift、attractor position/strengthを測る。まずraw再参照あり・なしの二経路を比較し、再帰要約がどこで固有の既定点へ寄るかを可視化する。

■ URL
https://arxiv.org/abs/2407.04503
https://arxiv.org/html/2407.04503
https://sites.google.com/view/telephone-game-llm

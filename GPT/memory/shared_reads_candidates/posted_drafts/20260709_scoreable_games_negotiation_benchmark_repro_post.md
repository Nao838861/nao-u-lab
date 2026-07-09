■ 概要
“[Re] Benchmarking LLM Capabilities in Negotiation through Scoreable Games” は、Abdelnabi et al. 2024 の Scoreable Games 型 LLM 交渉 benchmark を、「この benchmark でモデル比較を客観的に読めるのか」という観点で検査した再現・拡張研究である。元 benchmark は、6 人前後の stakeholder が複数 issue について交渉し、各 agent が私的な効用関数と合意 threshold を持つ。5/6 人以上と veto power を持つ party が受け入れる deal を作れるかで、LLM の協調・交渉能力を測る。

この論文の中核は、Scoreable Games を「複雑で現実的な交渉場」として評価しつつ、その複雑さが benchmark としての解釈可能性を壊していないかを調べた点にある。著者らは GPT-4o mini、GPT-4o、Qwen2.5、Mistral、DeepSeek、Llama、Phi などで元実験を再現し、base game、ablation、複数 game variant、baseline、game 調整、greedy/adversarial behavior を調べる。評価は final 5/6-way agreement、6-way agreement、wrong deal、private score leakage に加え、USW、ESW、NSW まで広げている。

結論は、Scoreable Games は単純な囚人のジレンマより複雑で、prompt で greedy や adversarial behavior を出せる有用な環境だが、モデルの強弱表としては危うい、というもの。game ごとに難易度がモデル依存で入れ替わり、ablation 設定でも順位が変わり、元実装の leakage 判定や final deal 評価には bug 由来の混入がある。この benchmark は、どの context と metric を揃えないと比較が壊れるかを示す材料として読むべきである。

■ 内容分析
この論文で一番使えるのは、benchmark claim、adjustments claim、behavioral claim を分けた読み方である。benchmark claim では、モデル間比較が一貫して解釈できるかを見る。base game だけなら DeepSeek 系が 5-way/6-way agreement で高く見え、Qwen2.5-72B や Mistral-Small も一定の成功率を示す。しかし game variant を広げると、あるモデルに難しい game が別モデルには易しくなる。GPT-4o mini と Qwen2.5-72B は game 2 で苦戦し、Mistral-Small は game 3 で大きく落ちる。これは「交渉能力」という単一軸ではなく、issue 構造、prompt、score function、役割配置が混ざった複合評価であることを示す。

ablation の扱いも重要である。元研究の ablation は、previous deals、others preferences、candidates、planning のどの情報を落とすかが十分に透明ではなかったため、著者らは GPT-4o mini と Qwen2.5-72B で広く比較する。結果として、ある ablation configuration で良く見えるモデルが、別 configuration では別の姿を見せる。これは「プロンプトを少し変えただけで勝率が変わる」問題と同型で、点数を出す前に入力 context の公平性を検査する必要がある。

leakage と実装 bug の分析は特に実務的である。元 benchmark では private scoring information を漏らすかを GPT-4 judge で判定していたが、再現側は、漏洩の多くが agent の意図的な策略ではなく、`<ANSWER>` tag 欠落などの formatting failure によって confidential output が public に出る構造的 bug で増幅されていたと見る。さらに、threshold の不整合、ある player の threshold が無条件に 10 緩和される処理、final round で valid deal が出ない時に過去の valid deal が final として扱われる評価 bug も指摘する。これは「LLM が悪い交渉をした」のか「harness が失敗を成功に変換した」のかを分ける話である。

追加 metric の USW、ESW、NSW は、勝率だけでは見えない偏りを拾うための safeguard として設計されている。USW は全員の utility 合計、ESW は最小 utility、NSW は utility の積で効率と公平性のバランスを見る。論文ではこれらが大まかに同じ傾向を示したため、単独 agent の一方的な搾取は主結果を壊していないと判断している。ただし、この確認自体が大事で、agreement rate だけを採用していたら合意の質を読み違える。

adjustments claim では、game の多様性と調整可能性が検査される。元 benchmark の 5 game はすべて construction project 系の設定に寄っており、元 prompt を 10 回使ってもそこから抜けにくい。score function の diversity も、sparsity、agent preference の IoU、acceptable deal space で見ると狭い範囲に収まる。つまり「LLM に新しいシナリオを書かせているから多様」とは言えず、生成 prompt 自体が domain bias を持つ。behavioral claim では、greedy/adversarial agent によって合意率や対象 agent の utility が変わる傾向は再現されており、この部分は benchmark の強みとして残る。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作に直接移すなら、Scoreable Games 本体をそのまま導入するより、評価 harness の作り方を借りるのがよい。交渉、同盟、取引、裏切り、説得を含む prototype では、AI actor の性能を win rate だけで測ると、強い agent が全体を壊しているのか、弱い agent が黙って損をしているのか、harness が invalid action を都合よく補正しているのかが分からない。次に multi-agent headless 評価を作る時は、success rate、invalid proposal rate、agreement quality、公平性、leakage/hidden state exposure、final action validity を分ける。

小さな検証案としては、6 人交渉を作る必要はない。3 agent の資源配分 mini-game を用意し、同じ seed で cooperative、greedy、adversarial の 3 条件を走らせる。出力は最終合意の有無だけでなく、各 agent utility、最小 utility、utility 合計、invalid deal、private preference 発話回数、最終 round の valid proposal 有無を JSONL に残す。さらに prompt ablation として、過去 deal、他者 preference、候補 deal の提示を切り替え、順位が安定するかを見る。ここまでなら playable diff の横に headless probe として置ける。

記憶システムにも使える。shared-reads candidate の pass/fail を単一評価にせず、概要密度、手法理解、評価理解、適用設計、限界分析を分ける今の運用は、この論文の benchmark claim 分解と同じ構造である。次回のゲーム評価ログに `agreement_rate` だけでなく `fairness_floor`、`invalid_final_action`、`prompt_context_variant` の列を足す probe が現実的である。

■ メリット・デメリット
メリットは、複雑な multi-agent benchmark を信用する前に見るべき検査項目が具体的なこと。モデル群、game variant、ablation、社会厚生指標、leakage と parser failure の分離、baseline の再現可能性確認は、そのまま headless game evaluation の checklist になる。harness bug が成績を水増しする例も、自作ゲーム評価で起きやすい。

デメリットは、Scoreable Games が重く、一般のゲーム prototype にそのまま載せると評価設計の方が本体より大きくなること。また、論文自体も「どの game category ならどの能力を測るのか」という分類は未完成で、複雑さを増やせば客観性が上がるわけではない。USW/ESW/NSW も utility function に依存するため、効用設計が雑なら精密な数字で雑な設計を正当化する危険がある。

■ 判定
部分採用。Scoreable Games benchmark をそのまま採用するのではなく、再現研究が示した評価分解を採用する。multi-agent game の headless 評価で、勝率、合意品質、公平性、invalid action、private information leakage、prompt context sensitivity を別々に記録する。AI actor の強さを一枚の順位表に潰さず、どの条件で評価が壊れたかを次の playable diff に戻せる。

■ URL
https://arxiv.org/abs/2602.18230
https://arxiv.org/html/2602.18230v1

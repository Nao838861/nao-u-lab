■ 概要
対象: Agentic PCG: Procedural Content Generation via Tool-using LLMs
URL: https://zehua-jiang.github.io/AgenticPCG/

Agentic PCG は、LLM に game level を一発生成させるのではなく、環境 feedback と編集 tool を持つ agent として反復的に level を直させる framework である。プロジェクトページの中心的な主張は、PCG に LLM を入れる価値は「自然文から完成 map を吐く」ことだけではなく、現在の level を観察し、何を改善すべきか推論し、編集計画を立て、tool を呼んで変更し、評価結果を受けてまた直す loop にある、という点にある。著者は Zehua Jiang、Sam Earle、Ahmed Khalifa、Julian Togelius。対象 domain は Binary Maze、Lode Runner、Zelda、Sokoban、Super Mario Bros などで、タイルベースの静的 puzzle から、行動 simulation が必要な platformer までを含む。

framework は perceive / reason / plan / edit という流れで説明されている。環境は RL environment のように wrap され、現在の level state、構造 metric、制約違反、simulation 結果を agent に返す。agent はそれを見て、どこが target から外れているかを考え、次の編集方針を自然言語で説明し、実際の編集 tool を実行する。重要なのは、評価が「LLM の主観」ではなく、環境側の metric や simulation から返ること。静的 task では tile counts、connectivity、solvability のような構造指標が使われ、動的 task では deterministic A* agent が level を走った時の挙動のような gameplay simulation feedback も使われる。これにより、見た目だけ整ったが解けない maze、敵や鍵の配置はあるが到達不能な Zelda map、Mario が実際には進めない segment のような失敗を、生成後の人間確認だけに任せず loop 内で扱える。

編集 tool の設計も単純な tile placement に閉じていない。agent は個別 tile を置く、線を引く、patch を変えるといった primitive edit を使えるだけでなく、Binary Maze では binary space partitioning や tree-search-based diggers のような classic PCG algorithm も tool として呼び出せる。ページ上の Binary Maze の例では、最初に solid な level に対して generate_digger を使い、path length が target に届かないと判断すると wall placement や generate_bsp に切り替え、最後に corridor reroute と shortcut 作成で target path length に近づける。ここでは LLM が全部を描くのではなく、既存 PCG 手法を選び、失敗を説明し、局所修正へ移る orchestrator になっている。

もう一つの軸は、free-form language instructions と explicit functional constraints の両立である。単に「長い迷路にして」「Mario っぽくして」といった曖昧な指示だけでは functional quality が崩れるし、逆に path length や connectivity だけを満たしても意図したテーマや遊びの雰囲気には届かない。Agentic PCG は、metric target に向けた controllability と、自然言語による theme / story / player experience の誘導を同じ loop に入れる。ページでは、各 domain で target metric を変えた trial の final maps を並べ、制御対象が変わると生成結果も変わることを示している。また Super Mario Bros では simulation feedback を使い、playability constraints と自然言語の creative instruction を同時に扱う例が示されている。

この研究の結論は、LLM を PCG の代替品として置くのではなく、PCG tool、評価関数、simulation、自然言語指示をつなぐ編集 agent として置くと、従来の PCG と LLM の弱点を補いやすい、というものだと読める。LLM は厳密な solvability 判定や最短経路計算を自前でやる必要はない。環境と tool がそこを返す。逆に classic PCG は designer の曖昧な意図や段階的な方針転換を扱いにくいが、LLM agent がその上に乗ることで、失敗理由の説明、tool 選択、局所編集の計画を担える。したがって、これは「生成 AI でレベルを作る」話ではなく、「評価可能な制作 loop に LLM を入れる」話である。

■ 内容分析
Agentic PCG の強い点は、PCGML や prompt-only generation の議論から少し離れて、制作工程に近い単位で LLM の役割を定義していることだ。完成物を一度に出す方式では、失敗した時に prompt を変えるしかない。ここでは、失敗が metric として返り、agent は編集履歴を見ながら「digger では短すぎた」「手動編集では disconnect した」「BSP のほうが長い通路に向く」といった tool selection の理由を変えられる。これは実際の level design の試行錯誤に近い。

ただし、framework の品質は評価関数に強く依存する。connectivity や solvability は測りやすいが、「面白い」「緊張がある」「プレイヤーが理解しやすい」「繰り返し遊んでも飽きにくい」は、そのまま metric になりにくい。A* agent が Mario segment を進めることは playability の最低条件にはなるが、プレイヤー体験の良さとは別である。したがって、この手法を制作に入れるなら、LLM を designer の代替ではなく、制約充足と候補改善の worker として扱い、人間や別評価が体験品質を見続ける設計が必要になる。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、まず wave / level / encounter を小さな grammar として定義し、LLM が直接コードを書く前に edit operation を選ぶ形に寄せられる。例として、enemy wave の間隔、敵種比率、報酬量、地形 blocker、checkpoint、tutorial hint を編集 tool にする。環境側は deterministic simulation を走らせ、clear rate、平均被ダメージ、詰み率、移動距離、無操作時間、報酬過多などを返す。LLM は「難しすぎるので敵 HP を下げる」ではなく、「第 2 wave の遠距離敵が回復前に重なるため、spawn interval を 2 秒伸ばす」のような局所編集を提案する。

記憶システムにも接続できる。成功した編集 loop は、単なる最終 level ではなく、失敗 metric、選んだ tool、却下された案、最終的に効いた edit を atom 化する。次の prototype で似た失敗が出た時、過去の「solvability は満たすが pacing が悪い」「A* は通れるが人間には視認しづらい」といった pattern を recall できる。Phase 3b/4a の probe としては、まず 1 画面の maze か wave table を対象に、3 step だけ LLM edit loop を回し、metric 改善と副作用を記録するのが現実的である。

■ メリット・デメリット
メリットは、LLM の創造性を deterministic な評価と tool 実行に接続でき、候補生成から playable 修正へ直接つながること。既存 PCG algorithm を捨てず、LLM に選択・説明・局所補正を担当させられる点も強い。デメリットは、評価関数が浅いと agent が metric hack や局所最適に逃げること。tool set が粗すぎると修正不能になり、細かすぎると探索が長くなる。体験品質は別途レビューが要る。

■ 判定
採用。まず小型の level/wave grammar に solvability、clear simulation、pacing 指標を付け、LLM を反復編集 agent として使う probe から始める。

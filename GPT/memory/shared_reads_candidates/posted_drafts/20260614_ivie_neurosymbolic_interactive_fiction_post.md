■ 概要
IVIE は、Interactive Fiction の世界を LLM だけで即興生成すると、物品・場所・NPC・パズル条件が会話の進行中に崩れるという問題に対して、生成を段階分解し、各段階の出力を symbolic world model で検証する neuro-symbolic な世界生成システムである。前提になっている緊張は明確で、LLM は設定、人物、描写、パズル案のような創造的要素を出せる一方、場所の接続、アイテムの所在、達成条件、通行不能な経路の解除条件を長期に一貫させるのが苦手である。逆に symbolic system は一貫性を保てるが、手作業で世界を定義しないと表現の幅が狭い。IVIE は PAYADOR の object-oriented world model と二重 LLM 構成を土台に、手作り済みの世界で遊ぶ段階から、complete and playable な IF world を最初から生成する段階へ拡張している。

手法の中核は four-stage incremental generation pipeline である。Stage 1 は Adventure Core で、テーマ、主人公、目的の概念を作る。目的型は REACH_LOCATION、GET_ITEM、DELIVER_ITEM、FIND_CHARACTER、SOLVE_MYSTERY のように分類され、以後の生成で何が必要かを決める制約になる。Stage 2 は World Structure で、目的達成に必要な location、character、item を抽象的な識別子と relevance_to_objective 付きで列挙する。ここでは装飾的で機能しない要素を減らすため、各要素が目的にどう関係するかを LLM に明示させる。Stage 3 は World Materialization で、場所の説明、双方向接続、NPC と item の初期位置、gettable flag など、PAYADOR が実行可能な具体的 world state に落とす。ここで DFS による到達可能性、目的型ごとの達成可能性、Pydantic schema による型検証が入る。Stage 4 は Challenges で、パズル、blocked passage、解法、progressive hint、interaction hint を追加し、追加後も spatial connectivity と objective completability を再検証する。

検証戦略は単純な reject ではなく、correctable issue と structural failure を分ける。双方向接続の欠落や型不一致は自動補正し、到達不能 location や解けない目的のような根本破綻は、エラー内容を prompt に戻して最大 3 回再生成する。gameplay 中の記憶には RAG を使い、各 turn の player action、narration、world state summary を AtomicMemory として保存し、ChromaDB と embedding で top-3 を narration prompt に戻す。これは symbolic state が保持する「何がどこにあるか」とは別に、「NPC が過去の出来事を覚えている感じ」を補う層である。

評価は 8 人の参加者による tutorial、Generate mode、Inspiration mode のプレイで、言語、RAG 有無、LLM provider を分けて行っている。世界サイズは 4 locations、4 items、2 NPCs、1 puzzle に固定。Generate mode では 8/8 world で objective completion が達成された一方、Inspiration mode は 4/8 に落ちた。失敗の内訳は、必要 item が world model 上に存在するのに location が割り当てられていない objective validation gap、API quota による中断、NPC から item を受け取る正しい試行を reasoning model が transfer transformation に変換できないケースである。16 world 中 13 world は設定パラメータ通りで、DFS による spatial connectivity は全ケースで成功した。パズルは約 75% が logical and useful hints と評価されたが、3/16 world ではプレイヤーが「解いた」と主張するだけで reasoning model が通してしまい、symbolic 側が前提条件を十分検証できていない bypass が残った。結論として、IVIE は LLM の創造性と symbolic validation の分担が IF world generation に効くことを示すが、goal validation、puzzle prerequisite、RAG の context mixing など、検証契約の穴も浮かび上がらせている。

■ 内容分析
この記事の面白さは、「LLM にゲームを作らせる」話を、生成品質の感想ではなく、どの world state invariant をいつ検査するかの設計問題に落としているところにある。Stage 1 から Stage 4 までを読むと、IVIE は大きな一発生成を避け、目的、必要要素、空間配置、障害物という順に依存関係を固定していく。これは PCG というより、生成物に対する contract を段階的に増やす pipeline であり、validation が単なる後処理ではなく、次段階の入力空間を狭める役割を持っている。

一方で、評価結果は neuro-symbolic という言葉を過信しないための材料にもなる。DFS は全ケースで通っているので、地図として孤立していないことは保証できている。しかし、必要 item が location を持たないまま validation を通る、NPC inventory から player inventory への transfer が発生しない、誤答でも puzzle solved になる、という失敗は、symbolic model が保持している state と、LLM reasoning が提案する transformation の境界に穴があることを示している。つまり「世界構造を symbolic に持つ」だけでは足りず、「どの action がどの precondition を満たした時だけ state transition を許すか」まで symbolic contract に入れないと、プレイヤー入力の自由度が validation を迂回する。

RAG の扱いも示唆がある。RAG は NPC が turn 17 の theft を turn 44 で参照するような長期的な語りの連続性には効くが、過去の puzzle context を現在に混ぜる副作用がある。ここでも必要なのは大きな記憶ではなく、location event、character interaction、puzzle attempt のような memory type segmentation である。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作サイクルでは、IVIE をそのまま IF engine として採用するより、「生成後に検証可能な world state へ接地する」部分を小さく取り込むのがよい。たとえば探索ゲームや 2D adventure の prototype で、LLM に room、item、NPC、goal、puzzle を一括生成させるのではなく、mission_graph.json、entity_table.json、layout_seed.json、puzzle_contract.json に分ける。各段階で、全 node reachable、goal item has location、lock key は lock より手前で入手可能、NPC が持つ item は会話 action で transfer 可能、という deterministic test を走らせる。

Phase 3b への戻し方としては、次の playable diff に「生成物の validation contract」を 1 つ追加する probe が向いている。具体的には、目的達成に必要な entity が relevance_to_goal を持つか、blocked passage が解法と報酬を持つか、プレイヤーが誤答で puzzle を bypass できないかを headless test する。記憶システム側では、RAG を単なる top-k recall にせず、location / NPC / puzzle / player-history の type を frontmatter か atom metadata に持たせ、現在の game state と合う種類だけを戻す設計に接続できる。

■ メリット・デメリット
メリットは、LLM の創造的な題材生成を捨てずに、ゲームとして壊れてはいけない条件を段階ごとに検査できる点である。小規模 prototype でも、生成物を保存して replay し、失敗 turn と state diff を見られる設計は制作ログと相性がよい。デメリットは、検証契約を書いた範囲しか守れないこと。IVIE でも到達可能性は守れたが、item location、NPC transfer、puzzle prerequisite の穴は残った。

■ 判定
部分採用。IF world generation 全体ではなく、objective-driven incremental generation と validation contract を採用する。まずは小規模探索 prototype で、LLM 生成物を JSON 化し、到達可能性・目的達成可能性・puzzle bypass を deterministic probe に落とす。

■ URL
https://arxiv.org/abs/2606.13348
https://arxiv.org/html/2606.13348

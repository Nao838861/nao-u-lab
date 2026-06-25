■ 概要
「lmgame-Bench: How Good are LLMs at Playing Games?」は、LLM をゲーム内に置いて「遊べるか」を測る研究だが、主眼はゲームの腕前ランキングではない。論文の問題設定は、既存ゲームをそのまま VLM/LLM agent に渡すと、評価として壊れやすい、という点にある。ゲームは知覚、記憶、長期計画、部分観測下の意思決定を同時に要求するため、agent 評価として魅力的に見える。しかし画面スクリーンショットを投げて次の操作を出させるだけでは、視覚認識の失敗、prompt の微差による成績変動、既存ゲーム資産や攻略情報の学習データ混入が混ざり、モデル能力をきれいに測れない。

lmgame-Bench はこの混線をほどくため、Super Mario Bros.、Tetris、Sokoban、Candy Crush、2048、Ace Attorney という性質の違う 6 ゲームを、Gym 風 API で扱える評価環境にしている。選定は、横スクロールの空間操作、落ち物・盤面パズル、低 fault tolerance の箱押し、連鎖を読む match-3、状態空間が詰まりやすい 2048、長文の証言と証拠を追う法廷アドベンチャーを並べ、単一能力ではなく複合能力を測る構成になっている。報酬も、Mario の進行距離や Tetris/2048 の累積スコアのような progression reward と、Sokoban のように途中の箱位置だけでは進捗を線形に測りにくい long-horizon reward に分けている。

重要なのは harness の設計である。論文は「ゲームを素で投げる」条件だけでなく、perception module、memory module、reasoning module をオンオフできる形にする。perception module は、Sokoban、Candy Crush、2048、Tetris のような格子系ではバックエンドから盤面をテキスト表現に変換し、座標とオブジェクト属性として渡す。Ace Attorney や Mario では、画面要素や会話をテキスト化して、モデルが見るべき情報を補助する。memory module は、過去状態と行動の transient memory と、失敗を避ける lesson を明示する reflection からなり、特に 2048 のような長期状態管理で効く。reasoning module は long-CoT 型モデルの挙動も評価できるようにするための切り分けで、モデル本体の推論能力と周辺 scaffold の効果を分けて見られる。

評価結果では、harness なしの多くの実行が random baseline 近くに固まり、特に Sokoban や Ace Attorney では 0 点に近いモデルが多い。これは「LLM はゲームが下手」という単純な話ではなく、生の視覚入力や長期文脈を直接処理させる条件では、能力差を測る前に評価面が潰れていることを示す。harness を入れると、多くのゲームで random baseline から離れ、モデル間の差が見えやすくなる。論文は 13 モデルで比較し、o3 と o1 が全体上位、Gemini 2.5 Pro preview や Claude 3.7 thinking が続き、非 reasoning 系では GPT-4.1 が強い、という形で分離が出ると報告している。

contamination への扱いも実務的である。Mario では Level 1-1 の RGB frame をシャッフルして時系列復元させ、視覚レベルの記憶が成績を説明していないかを見る。最高でも pairwise accuracy は 30% 前後で、復元指標とゲーム成績の相関は有意ではなかった。一方 Ace Attorney では、公開 fan transcript との類似が成績と強く結びつく条件があり、entity masking、paraphrase、reasoning 強制による mitigation 後は、類似度ではなく reasoning quality に寄るランキングへ変わる。つまり、ゲーム評価では「有名ゲームだから危ない」と一般論で終わらせず、画像列の未来予測とテキスト台本の再生を別々に疑い、必要なら評価設定を作り替える必要がある。

さらに論文は、ゲームを評価だけでなく training substrate としても見る。Sokoban や Tetris で RL training した Qwen-7B-Instruct 系モデルは、同一ゲームだけでなく unseen games、Blocksworld、WebShop のような planning / agentic tasks へ一定の転移を示す。特に thinking token を使う訓練・推論設定では、Sokoban 由来の学習が空間計画や一部 WebShop 成績を押し上げる。逆に GSM8K だけの訓練は数学には効くがゲームや Blocksworld には伸びにくく、混合訓練は中間的な挙動になる。結論として、ゲームは agent 評価の玩具ではなく、知覚、状態表現、記憶、計画、汚染対策を一体で検査できる、かなり厳しい実験台として位置づけられている。

■ 内容分析
この論文の価値は、LLM agent を「プレイヤー」として擬人化しすぎないところにある。通常、「モデルにゲームを遊ばせる」と言うと、面白く遊べたか、何点取れたか、攻略を発見したかに話が寄りやすい。しかし lmgame-Bench は、スコアを読む前に評価条件を分解する。視覚が読めないのか、盤面表現が悪いのか、過去行動を保持できないのか、prompt に過敏なのか、既知台本を思い出しているのか。これらを混ぜたまま leaderboard を作っても、ゲームが agent benchmark として成立しない、という姿勢が一貫している。

特に良いのは、harness を「ずる」ではなく診断器具として扱う点。人間のプレイヤーは画面を見て意味を抽出し、直前の失敗を覚え、次の行動候補を絞る。LLM に raw screenshot だけを渡して低得点なら、それは人間並みの知覚から遠いという情報ではあるが、計画能力の比較にはならない。そこで座標表現や memory/reflection を足し、能力差が見えるところまで評価対象を持ち上げる。この設計は、agent の自律性を過大評価せず、どの scaffold が成績を作っているかを実験条件として残す。

一方で、ゲーム固有の面白さやプレイヤー体験を測る研究ではない。6 ゲームは既存のクラシックで、報酬も進行距離、点数、クリア可否、正しい証拠提示のような代理指標である。モデルが高得点でも、そのプレイが人間にとって自然、楽しい、学習可能、観戦して面白いとは限らない。また、perception module がバックエンド情報を使う場合、実ゲームの UI/UX 評価からは距離が出る。つまり本論文は「ゲームの良し悪し」ではなく、「ゲームを使った agent 能力評価を破綻させないための条件」を示すものとして読むべきである。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、自作ゲームの AI playtest harness を作る時にそのまま使える。まず、playable diff を作ったら、いきなり LLM に画面を見せて感想を出させるのではなく、入力を層分けする。raw screenshot、ゲーム状態 JSON、座標化した board、直近 action/reward history、失敗 reflection を別チャンネルとして保存し、どの入力条件でどの破綻が出たかを見る。

次に、評価対象を「面白さ」へ直行させない。Phase 3b/4a の probe としては、1) random baseline より進めるか、2) 同じ seed で prompt variance がどれくらい出るか、3) memory あり/なしで進行不能が減るか、4) 既知攻略や設計メモを見せた時に成績が不自然に上がらないか、を小さく測るのがよい。特に自作ミニゲームでは contamination より、設計者が渡した仕様メモを agent が「検査」ではなく「答え」として使ってしまう問題が起きやすい。

記憶システムにも接続できる。candidate や atom に「この知見は harness 設計」「この知見は fun 判定ではない」と tag を切ると、あとでゲーム評価の議論をする時に、headless validation と人間の fun_score を混同しにくくなる。

■ メリット・デメリット
メリットは、自動 playtest を作る時に、評価入力、agent scaffold、報酬、汚染、prompt variance を別々に記録する設計指針になること。特に「LLM が遊べなかった」を失敗ログで終わらせず、知覚表現を変えれば計画能力が出るのか、memory を足すと安定するのかまで切り分けられる。

デメリットは、この枠組みだけでは作品の面白さや手触りは判定できないこと。harness が強いほど、実プレイヤーが見る UI から離れる危険もある。自作ゲームに使う場合は、headless 検査、画面観測、Nao_u の実プレイ判断を分けて扱う必要がある。

■ 判定
採用。自作ゲームの最終評価ではなく、playable diff 後の診断 harness として採用する。特に perception / memory / prompt variance / contamination を分ける設計は、今後の AI playtest probe の基本形にできる。

■ URL
https://arxiv.org/abs/2505.15146

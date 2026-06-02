■ 概要
対象は Benny Cheung の “AI Playtesting - When Your Board Game Tests Itself”。GameGrammar / Nova 系列の Game Architecture 連載 Part 9 で、board game design の bottleneck である iterative playtesting を、構造化 ontology と複数種類の agent による短い feedback loop へ変える話である。問題設定は明快で、GameGrammar は構造的に妥当な game を数分で生成でき、Nova は会話で改善を支援できる。それでも「紙の上の design が table で機能するか」を見る段階だけは、印刷、参加者募集、説明、数回の play、手作業の集計、再調整に戻ってしまう。記事はこれを Stage 2 wall と呼び、創造性ではなく反復検証が amateur design を止める壁だと見る。

提案される体験は、designer が Nova に balance playtesting を頼むと、Nova が rules を parse し、random agent で 50 game などを回し、first-player advantage、strategic reward、intervention options を structured critique として返すというもの。結果は単なる感想ではなく、結論、観測、data、mechanism explanation、competitive impact の chain として提示される。designer は turn order を変える、card value を調整する、別 design fork を試すなどの intervention を選び、Nova は ontology change を提案し、同じ会話内で再 simulation して修正効果を確認する。run history も残るため、scoring tweak や starting hand change が balance metrics にどう効いたかを追える。

手法の中核は「LLM が遊ぶ」のではなく「LLM が変換し、algorithm が遊ぶ」という分担である。著者らは 3 approach を試している。ontology を deterministic game engine へ直接 parse する方式は card game では機能したが、simple mechanism を超えると pattern-matching parser が詰まる。LLM に game state と ontology を渡して各 turn の action を選ばせる方式は、aggressive / cautious / engine-builder / newbie など 7 archetype でも extended experiment で random より悪く、100 game 後に -39% skill gap になった。原因は、複数 turn の state tracking、既出 card、直前に理解した rule の維持が崩れることにある。

ただし、この失敗が記事の一番面白い転換点である。LLM agent は勝つためには弱いが、混乱の pattern は安定している。特定 mechanism を systematic に避けるなら、その mechanism の説明が曖昧である可能性が高い。そこで production system は、LLM を natural language mechanism から formal game action へ変換する用途に置き、Love Letter mechanics の約 90% coverage を得る。実際の rule enforcement は deterministic engine が行う。strategic play は hidden information を sample しながら探索できる MCTS に任せ、Love Letter では random に対して 81% win、+62.4% skill gap を出した。random agent は statistical fairness と baseline、MCTS は game が skill を報いるか、LLM agent は rule clarity を測る、という役割分担になる。

検出カテゴリは 4 つある。random agent self-play では、seat advantage、strategy diversity、dead actions、game length、elimination timing、stalemate rate を見る。MCTS と random を対戦させる skill gap では、+50% 超なら戦略深度が強く、+20% 未満なら運の印象が強く、negative なら strategic play が逆効果で何か壊れている可能性がある。spatial game では topology balance を扱い、簡略 Catan の 7 hex / 2 player 実験で、3-neighbor region と 2-neighbor region の初期位置差が 76% vs 24% の勝率差を生み、start を swap すると advantage が反転し、connectivity を揃えると 49% vs 51% まで戻ることを示す。これは turn order や cost tweak ではなく board graph を直すべきだという intervention を導く。

rule clarity では、LLM agent と deliberately misreads rules する newbie archetype を使い、mechanism ごとの clarity score を出す。Love Letter では draw a card や Priest は高得点だが、Baron の compare hands が低く、135 opportunities で never chosen になった。Baron は相対 card value を考える複雑な rule なので、designer には「この rulebook 箇所を最優先で明確化せよ」という actionable feedback になる。coverage は Tier 1 light card games から Tier 5 spatial / area control までで、modern board game の 80-85% 程度を扱えるとされる。一方で route building、auction、trick-taking、complex triggers、asymmetric powers は未対応で、pathfinding、auction resolution、event system、per-player action sets など別の engineering epic が必要だと明記される。

結論は、人間 playtester の置換ではなく iteration cycle の圧縮である。human playtesting は social dynamics、emotional arc、feel を見るために必要で、simulator はそこを取れない。しかし、parameter change のたびに数週間待つのではなく、ontology を parse し、random / MCTS / LLM confusion を分担させることで、balance、skill reward、dead action、topology bias、rule ambiguity を会話内で繰り返し確認できる。記事の価値は、LLM の game-playing failure を隠さず、勝敗評価から切り離して rule clarity signal に反転させた点にある。

■ 内容分析
この記事は automated playtesting を「AI が面白さを判定する」話にしていない。そこが強い。random は fairness の統計を出せるが、skill が報われるかは分からない。MCTS は strategic depth を測れるが、rulebook の読みづらさは測れない。LLM は strategic player としては弱いが、rules を読んで誤るため、人間の初見混乱に近い proxy signal を出せる。失敗を 1 つの欠陥として潰すのではなく、測定対象を変えて使い直す設計になっている。

もう一つ重要なのは、ontology が executable であることを前提にしている点である。自然言語の game description だけを LLM に渡すと、simulation は曖昧な会話になりやすい。この記事では、component specifications、legal actions、scoring formulas、balance parameters、turn structure が揃っているため、LLM は formal action への変換だけを担い、評価本体は deterministic replay と seed 管理で固める。

限界の扱いも現実的である。LLM parse は非決定的なので parse once / cache / same seed で replay する。評価 fixture は simplified versions であり、full-complexity game には未検証の stress が残る。rule clarity score も human confusion ratings と formal validation されていない。parser が誤読すれば、balance finding は「意図した game」ではなく「parse された game」についての真実になる。これは弱点だが、coverage gate と deterministic replay で見える弱点として管理する姿勢は評価できる。

■ 自分達の環境への適用
Nao_u_BOT の playable diff では、AI に「面白いか」を直接聞くより、役割を分けた self-test に落とす方が実用的である。まず random policy で dead action、stalemate、game length、一方的な勝率を拾う。次に簡易 search / heuristic policy で、上手く動くほど報われるか、逆に strategy が random より悪くなる壊れ方がないかを見る。最後に LLM または別 agent に rule text / UI prompt / objective を読ませ、誤操作、回避、同じ質問の繰り返しを clarity signal として保存する。

特に game-rights の小規模 prototype では、mechanic の核を急ぐため、説明、feedback、入力導線、勝敗条件の曖昧さが残りやすい。この記事の枠を使うなら、headless harness の結果を「pass/fail」だけでなく、fairness、skill gap、clarity、coverage の 4 欄に分ける。LLM がプレイに失敗した時も、すぐ能力不足として捨てず、どの rule / UI / state 表示で失敗が集中したかを atom や candidate に残す。

■ メリット・デメリット
メリットは、playtest を待ち時間の長い人間イベントから、設計変更ごとに回せる検査 loop に近づけられること。random / MCTS / LLM confusion を分けるため、得られた signal の意味も読みやすい。dead action や topology bias のように、人間が見落としやすい構造問題を先に出せる点も大きい。

デメリットは、structured ontology と executable engine がないと成立しにくいこと。LLM parse の 10% 程度の誤りでも、wrong game を正確に評価する危険がある。rule clarity はまだ human validation が弱く、LLM の混乱をそのまま人間の混乱と同一視すると過剰解釈になる。

■ 判定
部分採用。Nao_u_BOT では「LLM に遊ばせて評価する」ではなく、random / search / LLM confusion の三分割を採用する。特に失敗ログを rule clarity として使う発想は、headless 評価と初見導線改善の間をつなぐ具体策として価値が高い。

■ URL
https://bennycheung.github.io/ai-playtesting-when-your-game-tests-itself

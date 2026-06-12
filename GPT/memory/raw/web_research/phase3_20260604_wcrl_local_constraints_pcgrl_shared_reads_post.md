■ 概要
対象は arXiv:2605.13570 “Learning Local Constraints for Reinforcement-Learned Content Generators”。これは、Wave Function Collapse (WFC) の「入力例に似た局所パターンを守る力」と、PCGRL の「playability など全体条件を reward で最適化する力」を組み合わせる論文である。問題設定は明快で、WFC のような constraint-based generator は、少数の既存 level から tile adjacency や NxN pattern を学べるため、人間が作った level に近いものを出しやすい。一方で、level が最後まで解けるか、gold が到達可能か、必要な connectivity があるかといった global properties は、局所パターンが自然でも保証されない。逆に reinforcement learning trained generator は reward に playability を入れられるため機能条件を追えるが、reward だけでは局所的な見た目やスタイルが壊れやすく、論文中でも PCGRL 単体の出力が ugly になり得ることが問題として置かれている。

著者らの提案は WCRL、WaveCollapse via Reinforcement Learning。基本発想は、WFC が入力 level から抽出した patterns と adjacency constraints で、PCGRL agent の action space を制限することにある。対象ドメインは Lode Runner 風の puzzle-platform game levels。Lode Runner は ladder、rope、platform、digging、gold collection などの空間関係が重要で、見た目のそれらしさと攻略可能性がずれやすい。実験では Video Game Level Corpus の Lode Runner level を使い、32×22 の level を生成する。pattern size は 3×3。WFC は tile を pixel のように扱って NxN unique patterns と隣接関係を抽出し、RL 側は Maskable PPO で、現在の最も制約された cell に置ける pattern の中から action を選ぶ。置いた pattern は WFC の constraint propagation によって周囲の候補を減らし、矛盾が起きれば大きな負 reward になる。

重要なのは、WFC が generator 全体を動かしているのではなく、RL agent の行動候補を mask している点である。観測は PCGRL の narrow representation に近く、現在位置が中心になるよう level を変換して agent に渡す。action space は入力 level から得た pattern 数で定まり、各 step では WFC がその location に置ける pattern の list を作り、利用不能な action を mask する。reward は Lode Runner の簡易 solver 的な playability 指標で、player 位置から reachable gold が増える、connectivity が改善する、といった変化を正にし、connectivity 低下や contradiction を負にする。敵の動きや digging は簡略化されており、完全なゲームプレイ評価ではなく、素早く機能性を測る proxy である。

実験の焦点は「hybrid にしたら良い」だけではなく、どの入力条件で壊れるかを調べることにある。比較条件は、single input、似た複数 input、互いに多様な複数 input、rare patterns の除外、training 時の random collapsed starting state。100 levels を各 trained model から生成し、automated playing agent で playability を測り、TP-KLDiv で多様性を見る。結果として、single input と似た multiple inputs は playable level が多く、多様な multiple inputs は diversity を増やすが playability を下げやすい。rare patterns を除くと action space が小さくなり、複数 input では重要な行動に集中しやすく playability が上がる傾向があるが、single input では空間を狭めすぎて逆効果になり得る。random collapsed starting state は playability には大きな差を出さないが、特に diverse input で少し diversity を改善し、空の状態以外からも動ける policy に寄せる可能性が示される。

結論は、WFC と PCGRL の長所は確かに補完的だが、入力例の選び方、pattern diversity、rare pattern の扱い、starting state にかなり敏感だというもの。WFC が局所見た目の分布を守り、PCGRL が playable に寄せる、という分担は有効だが、「多様な例をたくさん入れれば良い」わけではない。多様すぎる入力は adjacency relation を厳しくし、WFC propagation の contradiction や action space の扱いづらさを増やす。著者らは、極端に違う level を混ぜるより、両スタイルをつなぐ intermediate な level があれば良くなる可能性を述べている。これはゲーム生成を model だけでなく、入力 corpus 設計と制約設計の問題として見る論文である。

■ 内容分析
この論文の読みどころは、PCG を「見た目」か「解ける」かの二択にしない点にある。ゲーム level では、局所タイル列が自然でも、全体としてゴールに到達できないことがある。逆に、到達可能性だけ満たす reward を最適化すると、プレイヤーには雑に見える配置が出る。WCRL はこのズレを、1 つの万能 reward に押し込むのではなく、局所整合性は WFC の action masking、全体機能は RL reward へ分けている。これは設計上かなり筋が良い。

また、実験が単純な勝利宣言ではない点も重要である。rare pattern 除外は、ノイズを消して playability を上げる場合もあるが、single input では player tile 周辺の必要 pattern まで消えかけるため特別扱いが必要になる。diverse multiple inputs は出力の幅を広げるが、pattern adjacency が混ざりすぎると接続を作りづらくなる。つまり「多様性」「局所自然さ」「攻略可能性」は同じ方向に動かない。生成系でよくある「training examples を増やせばよい」という直感に対して、制約ベース生成では入力例の分布そのものが action space と contradiction の形を決める、という現実を示している。

制約もある。reward は Lode Runner の完全なプレイではなく、digging や enemy movement を省いた簡易 connectivity / reachable gold 指標なので、ゲーム性の全てを保証しているわけではない。数値も図中心で、汎用 benchmark というより探索的分析に近い。それでも、WFC と PCGRL を接続する場所を「生成後の見た目スコア」ではなく「生成中の action mask」に置いた点は、実装に落としやすい。

■ 自分達の環境への適用
Nao_u_BOT では、level や wave を生成する時に、LLM や RL に全部を任せるのではなく、局所配置ルールと全体評価を分離する設計指針として使える。例えばブラウザゲームの敵配置なら、「壁の隣には湧かない」「報酬は危険地帯の近くに置けるが完全孤立は禁止」「足場の切れ目には landing margin を置く」といった局所 pattern を先に constraint 化し、その上で headless route、到達時間、被弾率、回収率を global evaluator にする。

Phase 0 の playable diff では、いきなり PCGRL を導入する必要はない。まずは deterministic generator に action mask 相当の local constraint table を持たせ、生成後に solver / bot / scripted route で global property を測る。失敗した配置は「local constraint 違反」か「global evaluator 違反」かを分けて memory に残す。これにより、見た目が悪いから全部やり直す、解けないから全部やり直す、ではなく、調整すべき層が分かる。

■ メリット・デメリット
メリットは、生成物の見た目と playable 性を別々の検査点にできること。小規模 prototype で、局所 pattern は人間の設計感覚、global property は headless probe に分担させやすい。

デメリットは、constraint table と evaluator の両方を設計する手間があること。入力例が少ない、または多様すぎる場合、action space が狭すぎる、広すぎる、矛盾しやすい調整問題が出る。reward proxy が粗いと「解けるが退屈」も出る。

■ 判定
部分採用。WCRL そのものをすぐ導入するのではなく、局所制約で候補行動を絞り、全体 evaluator で playable 性を測る分担を、Nao_u_BOT の level / wave 生成ルールとして採用候補にする。

■ URL
https://arxiv.org/abs/2605.13570

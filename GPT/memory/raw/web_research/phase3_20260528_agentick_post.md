■ 概要
対象: Agentick: A Unified Benchmark for General Sequential Decision-Making Agents
URL: https://arxiv.org/abs/2605.06869

Agentick は、RL agent、LLM agent、VLM agent、hybrid agent、人間を同じ土俵で比較するための sequential decision-making benchmark である。論文の問題意識は、現在の agent 評価が分断されていることにある。RL は環境で学習する前提、LLM は事前学習済み知識と推論を使う前提、VLM は観測表現の扱いが違う。個別の benchmark では強く見えても、同じ課題群、同じ interface、同じ score で比較しない限り、何が sequential decision-making の能力差なのか見えにくい。

Agentick はこの比較のために、37 個の procedurally generated tasks を用意し、6 つの capability category、4 段階の difficulty、5 種類の observation modality に分けている。すべて Gymnasium-compatible interface で提供されるため、RL 系の agent も、LLM/VLM 系の agent も、同じ環境 API に接続できる。加えて Coding API、全 task に対する oracle reference policies、SFT dataset、composable agent harness、live leaderboard も提供する。つまり単なる問題集ではなく、agent 実装、学習、比較、公開評価までを一体にした基盤を狙っている。

評価は 27 configurations、90,000 episodes 以上で行われている。結果の読みどころは、単一の方式が全体を支配しないことだ。abstract によれば、全体の oracle-normalized score では GPT-5 mini が 0.309 で先行する一方、planning や multi-agent tasks では PPO が強い。LLM では reasoning harness によって performance が 3-10 倍に伸びる。また、ASCII observation が natural language observation より安定して強いという報告もある。これは、自然言語で詳しく説明すれば LLM に有利になる、という単純な想定に反する。観測形式そのものが agent の行動品質を大きく変える。

この benchmark の中核は、総合点よりも分解された比較にある。task category、difficulty、observation modality、oracle-normalized score を組み合わせることで、「この agent は何ができるのか」「失敗は能力不足なのか、観測形式が悪いのか、task family との相性なのか」を切り分けやすくする。oracle reference policy があるため、単純なクリア率ではなく、理想的または参照可能な方策に対してどの程度近いかを見られるのも重要である。

ゲーム制作・ゲーム AI の観点では、Agentick は playable prototype の headless evaluation を考える時のよい参照になる。多くの自作 eval は clearRate、score、time-to-clear だけに寄りがちだが、それでは「視覚情報の読み取りが苦手」「長期計画が苦手」「道具使用はできるが multi-agent coordination が弱い」といった差がつぶれる。Agentick は、agent の能力を task family と modality に分けて測ることで、評価を game-specific な一発勝負から、再利用できる capability map に変える。

結論として、Agentick は「最高性能 agent を決める benchmark」より、「agent 評価の設計を capability decomposition と observation modality の問題として捉え直す枠組み」と読むのがよい。ゲーム制作では、ゲームが完成してから AI に遊ばせるのではなく、制作中の prototype がどの能力を要求しているのかを明示するための評価 schema として使える。

■ 内容分析
Agentick の価値は、agent の比較対象を広げるだけでなく、比較の失敗原因を分けるところにある。RL と LLM を同じ点数表に置くと、しばしば「どちらが賢いか」という雑な話になる。しかしこの論文では、task category、difficulty、observation modality、oracle policy を揃えることで、賢さではなく適合条件を見る。たとえば PPO が planning や multi-agent で強いなら、環境に密着した試行から得られる方策が効いている可能性がある。LLM が reasoning harness で大きく伸びるなら、モデル単体ではなく、推論手順や状態整理の wrapper が性能の一部であることが見える。

ASCII observation が natural language よりよいという点も、ゲーム eval では特に重要だ。人間に説明しやすい観測が agent にとって最良とは限らない。自然言語説明は余計な曖昧さや長さを持ち込み、状態変化の差分を見えにくくする場合がある。逆に ASCII や structured observation は、見た目には貧弱でも、行動決定に必要な情報が安定している。これは headless game bot の観測設計にそのまま刺さる。

弱点は、benchmark 化そのものの圧力である。評価しやすい task、oracle を書ける task、Gymnasium interface に載る task が中心になるため、ゲームの触感、驚き、意地悪な誘導、プレイヤーの解釈変化のような要素は落ちやすい。Agentick をゲーム制作の唯一の評価軸にすると、作品性よりも benchmark 適性の高いゲームだけを作る危険がある。使うなら、作品評価ではなく agent 能力評価の土台として限定するのが妥当だ。

■ 自分達の環境への適用
Nao_u_BOT の game eval harness では、clearRate だけでなく、`task_family`、`required_capability`、`observation_modality`、`oracle_or_reference_behavior`、`failure_bucket` をログ schema に入れるとよい。たとえば shmup なら回避、誘導、リソース管理、敵パターン認識を分ける。puzzle なら局所操作、長期計画、状態可逆性、罠検出を分ける。これにより、bot が失敗した時に「ゲームが難しい」ではなく「観測形式が足りない」「探索はできるが長期計画が弱い」のように残せる。

また、prototype candidate の段階で「このゲームはどの capability を測る遊びか」を明示できる。全ゲームを benchmark にする必要はないが、評価ログに能力軸を持たせると、shared-reads、memory atom、Phase 0 の playable diff が接続しやすくなる。Agentick の考え方は、Nao_u_BOT の作品を sterile な benchmark に寄せるためではなく、制作中の判断を説明可能にするために使う。

■ メリット・デメリット
メリットは、agent の失敗を総合点から分解できること。観測、難度、能力カテゴリ、oracle との差を分けることで、次に直すべき場所が見えやすくなる。

デメリットは、評価設計が重くなること。schema を増やしすぎると、実験前の記録作業が増え、遊びの改善より benchmark 管理が目的化する。また、oracle を書けない面白さは扱いにくい。

■ 判定
部分採用。Nao_u_BOT では Agentick 全体を再現するのではなく、headless eval のログ schema と candidate 評価軸に `capability / modality / oracle-normalized thinking` を入れる。

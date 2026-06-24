■ 概要
LUDOBENCH は、LLM がボードゲームの盤面で「それらしい合法手」を出せるかではなく、確率・リスク・進行・相手駒の干渉が混ざった局所判断をどこまで戦略的に選べるかを見る benchmark である。題材は Ludo。サイコロで進む race game で、各 player は 4 個の同型 piece を同時に管理し、駒を出す、進める、相手を capture する、安全マスに逃げる、home path に入る、ぴったり finish する、overshoot を避ける、という判断を毎 turn 行う。チェスや Go のような決定論的完全情報ゲームでも、Poker のような不完全情報ゲームでもなく、完全情報だが stochastic で multi-agent、さらに複数の同型資産を配分する点が評価対象になる。

手法の中核は、フルゲーム勝率ではなく 480 個の handcrafted spot scenario を使うことにある。12 個の decision category に各 40 問を置き、各 spot は特定の戦略 tradeoff だけが出るよう作られている。LLM には board state、dice value、ルール、必要なら persona や history が自然言語で与えられ、出力は `<piece index> | <reason>` に固定される。重要なのは、合法手リストを prompt に入れない点である。engine が legal move を検証し、invalid output は compliance signal として記録する。つまり「ルールを読んで合法手を特定できるか」と「合法手の中で戦略的に良い選択をできるか」を分けて測る。

比較対象は Random、1-step Heuristic、Game-Theory agent の skill ladder で、Game-Theory agent は 2-player では depth-limited Expectiminimax、3/4-player では Expectimax-MaxN を使う。chance node では 6 面サイコロを平均し、cutoff では board progress、finished pieces、base-piece penalty、safe-square count などを線形評価する。これを greedy heuristic より上の principled strategic reference として置き、LLM がどれだけ GT agent と同じ piece を選ぶかを GT alignment score として見る。

実験は Qwen、DeepSeek、Anthropic、Meta、Google 系の 6 model、5 persona 条件、合計 14,400 spot evaluation。結果はかなり分解的で、まず rule compliance と strategic competence が独立している。DeepSeek-Chat と Claude-3.5-Haiku は illegal move が 1% 未満だが、選ぶ戦略は逆方向に偏る。Qwen-2.5-7B は illegal move が約 39% と高く、特に exact finish を超えてしまう overshoot や home entry で崩れる。一方で、全 model の GT alignment は 40-46% 程度に留まり、合法に動ける model でも半分以上は GT reference と違う手を選ぶ。

最も面白い結論は、LLM が「弱い」のではなく、半分だけ戦略を覚えているように見える点である。モデルは finisher と builder に割れる。finisher は piece を finish させる判断には強いが、新しい piece を盤上に出して development する判断を怠る。builder は development には近いが、finish できる局面で capture を優先してしまう。GT agent は両方を行うが、LLM は片側だけを拾う。Llama-4-Scout は capture-oriented に寄り、finish より相手妨害を選びやすい。つまり model family や size の序列ではなく、局所 tradeoff ごとの癖として失敗が出る。

さらに、同じ board state に「さっき相手に取られた」という history-conditioned grudge framing を添えると、Qwen-Plus は 33%、DeepSeek-Chat は 20% の割合で選択を変える。GT agent は盤面が同じなら 0%。これは narrative が戦略判断を動かす prompt sensitivity として扱われる。persona instruction も安定せず、多くは期待方向に弱く、Haiku に safe persona を与えると逆に capture rate が上がるような反転もある。結論として、LUDOBENCH は Ludo 用 benchmark であると同時に、LLM game agent の「合法性」「局所戦略」「prompt/history 感受性」を小さな盤面カードに分解する評価設計である。

■ 内容分析
この論文の良さは、勝率を捨てたことではなく、勝率の前にある判断粒度を固定したことにある。フルゲーム勝率は、初手の bad decision、終盤の finish 失敗、capture 偏重、サイコロ運、相手 agent の癖が混ざる。LUDOBENCH はその混合を 12 category に切り、capture vs home finish、capture vs safe、safe vs open existing、extra turn、home entry、overshoot、grudge など、失敗の名前が付く単位にした。これにより「Claude は Ludo ができる/できない」ではなく「Haiku は finish は拾うが development を捨てる」「DeepSeek は合法手は守るが finish より capture に寄る」と言える。

もう一つ重要なのは、合法手を prompt に渡さない設計である。LLM game agent 評価では、エンジンが legal actions を渡すと compliance 問題が隠れ、逆に自由記述だけにすると戦略評価と format failure が混ざる。この論文は engine validation と fallback を使い、invalid rate は pre-fallback で別管理し、行動 metric は valid output のみで計算する。ここは自動 playtest harness としてかなり実務的で、壊れた出力を game loop 継続のために補正しつつ、補正した事実を評価から消さない。

限界も明確で、Ludo は action space が最大 4 piece と小さい。spot は handcrafted で、40 問/category の point estimate なので信頼区間はない。multi-step planning は直接見ておらず、英語 prompt の温度 0 条件に限定される。したがって「LLM の汎用戦略能力の最終評価」ではない。むしろ価値は、ゲーム固有の小さな判断カードを作れば、model の癖を archetype として観測できる、という評価方法にある。

■ 自分達の環境への適用
Nao_u_BOT の headless playtest では、通しプレイの勝敗、死亡回数、到達距離、スコアだけを見ると、どの判断が壊れているか分かりにくい。LUDOBENCH 型に寄せるなら、prototype ごとに 20-50 個程度の「局所判断カード」を作る。弾幕なら、撃つ/避ける/回収する/ボムを切る/危険な近道を通る。探索なら、鍵を先に取る/敵を避ける/危険部屋へ入る/回復を温存する。会話ゲームなら、情報を開示する/嘘を疑う/関係値を守る、のように category を置く。

各カードは deterministic な state snapshot と expected policy を持たせ、LLM playtester や NPC agent が何を選んだか、合法性、理由、prompt variant による変化を記録する。特に grudge framing 相当の検査は使える。過去の失敗、NPC の人格、プレイヤーの発言履歴を添えた時に、同じ game state で判断が変わるかを見ると、演出として望む揺れと、ゲームを壊す prompt sensitivity を分けられる。Phase 3b への戻しとしては、次の playable diff に 1 種類だけ spot-card evaluation を付けるのが現実的。

■ メリット・デメリット
メリットは、評価が小さく、再現可能で、失敗に名前が付くこと。model や prompt を変えた時に、全体勝率より早く regression を見つけられる。合法手検証と戦略品質を分ける設計も強い。デメリットは、spot card を作る人間側の設計力に依存し、カードにない失敗は見えないこと。さらに Ludo のように状態が構造化しやすいゲームでは効くが、物理アクションや感触中心のゲームでは、snapshot と expected action の作り方を別途考える必要がある。

■ 判定
部分採用。Ludo 固有の結果ではなく、spot scenario、GT/heuristic baseline、invalid と decision quality の分離、history framing 検査を採用する。次の小規模 game prototype で、通しプレイ指標に加えて局所判断カードを 1 category だけ作る。

■ URL
https://arxiv.org/abs/2604.05681

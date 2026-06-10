■ 概要
この論文は、FPS 用の強化学習 agent を「一つの巨大な policy」として学習させると、ゲーム開発で頻繁に起きる小さな仕様変更に弱くなる、という実務寄りの問題から出発している。従来の monolithic policy では、移動、索敵、照準、射撃、生存の判断が一つの network に混ざる。性能だけを見る benchmark ではそれでも成立するが、ゲーム制作では「弾を外した時の penalty を追加する」「Jump action を足す」「射撃だけ少し慎重にしたい」のような変更が何度も入る。この時、action space や reward の一部を変えただけで network interface が変わり、既存 policy を使い回せず、全体を再学習することになる。著者らはこれを、性能問題ではなく iterative game development pipeline の保守性問題として扱う。

提案手法は Modular Reinforcement Learning (MRL)。FPS agent の行動を semantic action module に分け、Movement Module と Attack Module を別々の policy network と reward structure で並列最適化する。Movement は位置、回転、速度、target 方向、距離、ray sensor などを使って移動、視界制御、生存、攻撃機会の形成を担当する。Attack は位置、回転、target 方向、距離などに絞り、射撃実行の判断を担当する。重要なのは、options や HRL のように「いつ skill を切り替えるか」を学ばせるのではなく、移動と攻撃を同時に走る明示的な意味単位として分けている点である。これにより、射撃 reward を変更しても Movement policy はそのまま再利用でき、Attack Module だけを再学習できる。

実験環境は Unity ML-Agents の FPS combat simulation。agent は 100 HP を持ち、1 hit で 25 damage、4 hit で勝利する。訓練は PPO、30 million steps、curriculum learning と self-play を使う。curriculum は、正面の静止 target を撃つ段階から、off-center target、random spawn target、moving target、obstacle あり、遠距離 spawn、高速 target、agent vs agent へ進む 8 段階。評価では、standard reward と、missed shot に penalty を追加した reward の 2 条件を作り、Traditional Agent は全体を再訓練、Modular Agent は Attack Module のみを再訓練する。

結果は三層ある。第一に、初回訓練では Modular Agent は複数 network を回すため monolithic baseline の約 1.43 倍の wall-clock time がかかる。しかし射撃 penalty のような局所変更では、Traditional Agent の再訓練が baseline 比 1.18 に対し、Modular Agent の Attack Module 再訓練は 0.88 で済み、1 回の retraining cycle で 0.30 の差が出る。論文の結論では、特定 behavior module の選択的再訓練により再訓練時間が最大 30% 減ったとまとめられている。第二に、runtime inference は Modular Agent 0.876 ms、Monolithic Agent 0.812 ms で、60 FPS の 16.6 ms frame budget に対して十分小さい。第三に、1-vs-1 combat では Modular Agent が training map で最大 83.4% の win rate を示し、obstacle configuration を変えた環境でも movement pattern が安定した。特に miss penalty を入れた時、Traditional Agent は射撃精度だけでなく移動経路まで変わってしまい、large obstacle では遮蔽寄りの挙動が偶然有利になる一方、small obstacle では advantage が薄れる。Modular Agent は射撃 reward の変更が Movement policy に干渉しにくく、設計意図に沿った局所修正として振る舞う。

■ 内容分析
この論文の価値は「RL agent を強くする」よりも、「開発中に直せる agent にする」方にある。多くの game AI 論文は最終 win rate や generalization を主指標にするが、ここでは action/reward の一部変更後に、どれだけ既存学習を保持できるかが中心になっている。FPS のような高速環境では、射撃精度、距離維持、遮蔽利用、探索、追跡が相互依存するため、reward を一つ足すだけでも policy 全体が別の local optimum へ移りやすい。著者らはその干渉を、Movement と Attack の module boundary で物理的に遮断している。

ただし、この分割は自動発見された skill ではなく、人間が game design 上の意味単位を決めている。ここが弱点でもあり強みでもある。汎用性だけを狙うなら、どの module に分けるか、module 間の協調 reward をどう作るかが未解決になる。一方でゲーム制作では、designer が「ここだけ直したい」と言える境界が重要なので、latent skill よりも semantic module の方が扱いやすい。論文自身も future work として target visibility maintenance や tactical distance control のような細粒度 module を挙げており、分割粒度を増やすほど協調 reward 設計が難しくなることを認めている。

もう一つ重要なのは、performance gain が単純な軽量化ではないこと。初回訓練はむしろ重い。利点は、変更が反復されるほど回収される maintenance cost の低下である。これは production game AI ではかなり現実的な評価軸で、patch、balance、level design 変更、weapon tuning が続く環境では、初回 training cost よりも「壊さず局所修正できるか」の方が効く。

■ 自分達の環境への適用
Nao_u_BOT では、headless bot や敵 AI を「全部入り policy / prompt」にせず、行動 layer を semantic module として分ける設計に使える。たとえば探索、接敵、回避、攻撃、資源回収、UI 操作、報告生成を同じ agent prompt に押し込むと、攻撃ルールを直しただけで探索や回避まで変わる。これを module ごとの prompt、script、reward、評価ログに分ければ、修正対象を限定しやすい。

ゲーム制作サイクルでは、playable diff ごとに「今回変えた module」と「変えていない module の regression」を明示するのがよい。例として弾幕ゲームなら、移動回避 policy、射撃 timing、item collection、boss phase recognition を別評価にし、射撃調整後も回避 trajectory が変わっていないかを headless replay で見る。記憶システムにも同じ考えを入れられる。candidate 収集、Phase 2 gate、Phase 3 投稿、Phase 3b 自己反映を一つの巨大な判断にせず、各 module の evidence と failure を残すことで、局所改善が他 phase を壊したか追いやすくなる。

■ メリット・デメリット
メリットは、AI behavior の修正単位が明確になり、既存挙動を守ったまま局所 retraining / prompt 改修ができること。runtime cost も論文条件では 1 ms 未満で、分割そのものが即座に frame budget を壊すわけではない。デメリットは、module boundary と reward を人間が設計する必要があり、境界を誤ると協調不全や重複観測が起きること。初回訓練も軽くならないため、変更回数が少ない prototype では過剰設計になりうる。

■ 判定
部分採用。RL 論文として丸ごと導入するより、Nao_u_BOT の agent / enemy / evaluation を「局所修正できる semantic module」に分ける設計原則として採用する。特に playable diff 後の regression check と相性が良い。

■ URL
https://www.mdpi.com/2079-9292/15/3/519

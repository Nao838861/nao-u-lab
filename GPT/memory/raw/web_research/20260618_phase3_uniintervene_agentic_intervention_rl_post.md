■ 概要
UniIntervene は、Human-in-the-loop reinforcement learning (HiL-RL) のコストを「人間が頻繁に失敗を直すから高い」とだけ見ず、policy が低価値な状態で進展しない時間を長く過ごすことが支配的なコストだと置く論文である。対象は実世界ロボット操作で、offline demonstration で作った方策は、多物体把持、接触を伴う挿入、布の折り畳みのような out-of-distribution 状態や復帰行動を十分に覆えない。HiL-RL はここに人間の correction を入れて online improvement するが、既存の枠組みでは「いつ介入するか」が人間側の外部判断になり、policy は不毛な探索を自分で検出できない。

論文の中核は、介入を「人間が失敗後に直すイベント」から「価値の停滞を検出し、高価値状態へ戻す内部プロセス」へ変える点にある。UniIntervene は 3 つの部品を組み合わせる。第一に future-conditioned action-value estimation。現在の観測、言語指示、行動を vision-language backbone で符号化し、その行動を続けた時の latent future を予測して、そこから task progress に沿った価値を推定する。単一フレームの現在価値ではなく、行動の先に何が起きるかを見にいくため、sparse reward の実ロボット操作でも進展信号を安定させる狙いである。

第二に temporal value-risk critic。低い価値が一瞬見えただけで介入すると、接触、位置合わせ、持ち替えの途中で正常な低価値状態まで止めてしまう。そこで UniIntervene は、直近 window で価値増分が期待進捗を継続的に下回っているかを見て、停滞や劣化が続いた時だけ risk を高くする。これは failure detector とは違う。明示的に壊れたかではなく、「安全に動いているように見えるが、タスク完了へ向かう価値を稼げていない」状態を検出する設計である。

第三に memory-guided goal-conditioned recovery。介入が必要と判断されても、低価値状態からどこへ戻ればよいかは critic だけでは決まらない。UniIntervene は過去の intervention episode から、介入状態と、その後に到達した high-value future state の組を memory として持つ。現在の失敗文脈に近い entry を embedding で検索し、復帰先 goal を取り出す。その goal に条件づけた recovery policy が corrective action chunk を生成し、実行中の policy action を上書きする。過去軌道をそのまま再生するのではなく、現在状態から同種の高価値状態へ到達する制御として学習するのが重要である。

評価は UR7e ロボットアーム、2 台の camera、SpaceMouse による人間介入で行われる。タスクは Pick Eggplant、Tube Insertion、RAM Insertion、Wipe Whiteboard、Fold Towel の 5 種類で、多物体、接触リッチ、非剛体を含む。指標は training 後 20 episode の success rate (SR) と、3 run 中の human intervention rate (IR)。比較対象は SFT policy、HiL-SERL、HiL-SERL + Failure-aware RL。結果として UniIntervene は平均 SR 88%、IR 14.6%。HiL-SERL は SR 81%、IR 34.3%、Failure-aware RL は SR 77%、IR 24.6% なので、論文は UniIntervene が average success rate を 8.6% 改善し、人間介入を 57% 減らしたと報告している。特に RAM Insertion や Wipe Whiteboard のように見た目の失敗差分が小さいタスクで、failure prediction より value trend monitoring が効くという解釈になっている。

ablation も手法の読みどころである。value prediction を外すと intervention F1 と IR が悪化し、temporal value-risk を外すと一時的な value drop に反応しやすくなる。future prediction や memory goal を外しても offline F1 は大きく崩れないが、online SR は落ちる。つまり「介入すべき瞬間を当てる」だけでは十分でなく、復帰先をどう選ぶかが実際の成功率に効く。論文の結論は、HiL-RL の支配的な人間コストは catastrophic failure だけでなく、ゆっくり進捗を失う unproductive exploration であり、そこを価値認識付き recovery として吸収できる、というものになる。

■ 内容分析
この論文の強さは、HiL-RL の「人間を減らす」問題を、単なる自動 failure detection に落としていない点にある。失敗が明確に見えるなら、人間でもモデルでも介入判断は比較的作りやすい。難しいのは、まだ壊れてはいないが、接触位置が悪い、布の持ち替えが進まない、挿入が微妙にずれている、といった停滞である。UniIntervene はここを現在フレームの分類ではなく、future-conditioned value と temporal trend の問題にしている。ゲーム制作でいうと、プレイヤーや bot が「死んではいないが、理解も進行もしていない」状態を検出する設計に近い。

もう一つ重要なのは、介入 trigger と recovery を分けつつ、同じ value signal で接続していることだ。trigger は停滞を見つける。memory retrieval は high-value target を選ぶ。goal-conditioned policy はそこへ戻す。この 3 段に分けると、失敗ログが単なる NG 例ではなく「どの状態から、どの復帰先へ戻ると進捗が回復したか」という episode memory になる。ablation で memory goal の有無が offline F1 より online SR に効くのも、この分解を裏付ける。

ただし、論文の価値推定は重い。proxy value function、latent future prediction、VLM backbone、past intervention memory、goal-conditioned recovery policy が必要で、少量ログのプロトタイプにそのまま載せるものではない。限界として著者自身も、proxy value の calibration が悪いと介入時点がずれること、memory にない failure mode では retrieval が弱いこと、評価が単一ロボット embodiment の tabletop manipulation に限られることを挙げている。採るべきなのは巨大モデル構成ではなく、「停滞検出、復帰先検索、復帰行動」を分けてログ化する設計原理である。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、まず自動プレイ bot や Playwright / headless 評価のログ schema に落とすのが現実的である。死亡回数や success rate だけでなく、progress value の代理として、到達エリア、目的物との距離、同一状態の滞在時間、入力の反復、retry 後の到達深度を記録する。一定 window で進捗が増えない時に「詰まり」とし、単なる失敗ログではなく、そこから戻すべき recovery target を一緒に保存する。

たとえばアクションゲームなら「敵に倒された」より前に、「回避入力は出ているが距離が詰まらない」「同じ足場に戻され続ける」「攻撃可能 window を認識できていない」を停滞として拾える。パズルなら「同じ操作群を循環して新しい盤面情報を得ていない」を拾う。Phase 3b/4a の probe では、各 prototype に対して `stagnation_window`、`risk_reason`、`recovery_target`、`recovery_success` を残すだけでも、後から「難しい」の中身を分解できる。

記憶システム側にも応用できる。失敗した run を「失敗」とだけ残すのではなく、どの判断価値が停滞し、どの過去 episode を復帰目標として使うべきだったかを atom / candidate に紐づける。これは rules を増やすより軽い。まずは Phase 3b の自己フィードバックで、1 件の投稿や 1 つの game probe に対して、停滞指標と復帰先を手書きで残す運用から始めるのがよい。

■ メリット・デメリット
メリットは、失敗を「終端イベント」ではなく「進捗価値の停滞」として扱えること。これにより、bot の詰まり、プレイヤーの迷い、テスト中の長い無駄行動を、成功率だけでは見えない改善材料にできる。過去の介入 episode を recovery target として残す発想も転用しやすい。

デメリットは、価値関数の設計を誤ると、探索や溜め、演出待ち、戦略的後退まで停滞扱いしてしまうこと。ゲームでは「価値が増えていない時間」そのものが緊張や発見の余白にもなる。導入するなら自動介入ではなく、まずはログ注釈と probe に留めるべきである。

■ 判定
部分採用。モデル構成は採らないが、value trend による停滞検出、intervention episode memory、goal-conditioned recovery target は、playtest と記憶サイクルの probe に採用する。

■ URL
https://arxiv.org/abs/2606.12372
https://arxiv.org/html/2606.12372

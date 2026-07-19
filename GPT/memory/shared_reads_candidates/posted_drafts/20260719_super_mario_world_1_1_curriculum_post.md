■ 概要
「Reinforcement Learning in Super Mario Bros: Curriculum, Pedagogy, and Optimal Level Design in World 1-1」は、Super Mario Bros. の World 1-1 が巧いチュートリアルだという定評を、区間の内容ではなく「同じ部品をどの順番で経験させるか」が学習速度と破綻率を変えるか、という実験へ落とした研究である。著者らは既存 emulator を使わず、全212列×14行の tile grid として World 1-1 を再実装し、v1 は地面・土管・穴・階段、v2 は brick/question block、v3 は16体の Goomba と1体の Koopa を加える三段階を用意した。

環境は原作そのものではない。行動は停止・右移動・jump の3種だけで左移動を省き、jump は6 phase の決定論的な弧、敵も同一ルールで扱う。報酬は flagpole +100、死亡 -50、右への1 step +0.5、停止 -0.1、brick +1、question block +3、踏みつけ +5。つまり「右へ進み、道中の interactable を拾って完走する」能力を測るよう強く shaping されている。

第一実験では Q-Learning、SARSA、first-visit Monte Carlo（MC）、128×128 の MLP を使う DQN を比較した。3環境×4手法×5 seed、各10,000 episode の60 run で、終盤500 episode の win rate、return、50%/80% win 到達 episode、block・敵との interaction を測る。最も複雑な v3 では MC が94.9±1.5%、Q-Learning 86.5±2.7%、SARSA 84.4±5.6%、DQN 76.4±3.4%。DQN は早く立ち上がるが敵回避を過度に一般化し、場所ごとに異なる最適行動を記憶する tabular 法に最終成績で負けた。さらに v1 では DQN が10.6±3.7%へ崩壊し、question block の中間報酬が入る v2 では93.4±1.2%へ回復した。経験 replay が死亡遷移で埋まり、正の signal が希薄になるかどうかが差を作ったという分析である。

第二実験が本題である。World 1-1 を A〜F の6区間に分け、敵・穴・block の総数を変えず、原典順 ABCDEF、逆順 FEDCBA、固定した10種の random permutation の12条件を作る。MC では原典順が最終 win 94.7±1.6%、50%到達2771±133 episode、学習曲線 AUC 67.2±2.0%、catastrophic failure 0/10。逆順は48.5±39.7%、4/10 seed が最終 win 10%未満、random 全50 run は平均89.0±8.9%で failure 1/50だった。random の最良個体は最終 win 95.2%と原典順を上回るが、速度・AUC・全 seed の頑健性を同時には満たさない。

ただし順序効果は agent 共通ではない。同じ12条件を DQN で回すと、原典順76.4%、逆順77.0%、random平均76.2%で、ANOVA は p=0.82。replay buffer が時系列を混ぜるため、序盤に易しい区間を置く curriculum signal が消える。結論は「World 1-1 の順序が普遍的に最適」ではなく、episode 全体の成否から更新する学習器では、易→難の順序が成功 trajectory を早く作り、後半へ価値を伝える、と読むのが正確である。

■ 内容分析
この研究の良さは、level content と ordering を分離したことにある。全条件で六区間を一度ずつ使い、違うのは並びだけなので、単純な敵数や穴数では説明できない。原典順は開けた地形と Goomba 1体の A から始まり、pipe、gap、enemy cluster へ進む。MC は episode 終了後に全 trajectory を更新するため、序盤に完走しやすいと正の return が後方まで届く。逆順は staircase・pipe・複数敵から始まり、探索率が下がる前に短い失敗 episode ばかり蓄積して自己強化的に破綻する。配置順と learner の credit assignment が接続された説明になっている。

同時に、論文タイトルの「pedagogy」「optimal」は結果より強い。人間参加者はおらず、測ったのは shaped reward 下の RL agent である。左移動、可変 jump、power-up、coin、敵種差、視覚認知、驚き、楽しさ、操作学習を省いた環境なので、人間が World 1-1 から何を理解するかは直接検証していない。MC の順序効果が DQN で消えること自体、pedagogy が level だけの属性ではなく learner と評価器の組合せで変わる証拠である。

報酬密度も交絡する。右移動だけで約49.5点、勝利100点に加え、block や stomp に追加報酬がある。DQN が v1 で崩れ v2 で回復したのは level complexity の増加に強くなったからではなく、v2 の question block が replay buffer へ正の signal を供給したためである。したがって「複雑なら deep model」という一般則を反証したというより、state-space size と reward density を別々に設計・報告せよという教訓が強い。

統計面では5 seed が基本で、原典順対逆順のみ10 seed へ拡張される。10 random map×5 seed は permutation space 720通りの一部であり、区間境界をまたぐ接続も spawn の3 tile clearing など原作と同一ではない。原典順の優位はこの離散化・報酬・探索率 decay・MC 更新則に対する結果で、普遍的な最適性ではない。しかし、最終 win だけなら random 最良が勝つ一方、収束速度と catastrophic failure を加えると判断が変わる点は、制作評価として非常に有用である。

■ 自分達の環境への適用
新規 prototype の tutorial や難度導入を、同じ encounter 部品の順列 probe として測る。操作導入、単独敵、狭い足場、複合敵、resource 回収などを segment 化し、内容総量と seed 群を固定して canonical、reverse、少数の構造的 permutation を比較する。指標は最終クリア率だけでなく、初回安定到達までの episode、学習曲線 AUC、全く回復しない seed の割合、各 segment 入口での死亡率を残す。

重要なのは controller を一種類にしないこと。短期 greedy、trajectory 全体を使う search、replay 付き agent、scripted novice、可能なら少人数の人間を並べる。ある順序が一つの controller だけで良いなら、それは tutorial の普遍的改善ではなく、その credit assignment への最適化かもしれない。headless 評価は候補を削る一次 probe、人間評価は理解・楽しさ・驚きの確認として分離する。

小さな実験では、まず3〜4 segment、canonical/reverse/2 permutation、各20 seed で十分である。報酬を「生存・進行・操作発見」の三成分に分け、報酬有無でも再実行する。原典順の利点が dense reward でしか出ない場合、配置が教えているのではなく評価器が誘導している可能性が高い。catastrophic failure は平均へ埋めず、失敗 seed の trajectory を個別 artifact として保存する。

■ メリット・デメリット
メリットは、チュートリアルの印象評を順序だけ変えた反復実験へ変換し、最終成績・学習速度・効率・破綻率を分けたこと。DQN の null result まで示したため、都合の良い成功例だけでなく「誰が学ぶか」で効果が変わると分かる。実装規模も小さく、headless level-design probe へ移しやすい。

デメリットは、人間の pedagogy を直接測らず、強い簡略化と reward shaping に依存すること。World 1-1 の空間的・操作的な意味の多くが落ち、MC の成功は人間の理解や面白さと同義ではない。少数 seed・12/720順列・手動 segment 境界なので、「原典順が optimal」という外挿は危険である。また一つの平均値で選ぶと、最良 random の高得点か、逆順の巨大分散のどちらかを見落とす。

■ 判定
部分採用。採用するのは content を固定した順序 ablation、AUC と catastrophic failure、複数 controller での感度確認。RL agent の成績を人間向け tutorial 品質そのものとみなす結論は採用しない。次の level 改修で3〜4 segment の順列 probeを作り、controller 間で順位が反転するかを最初に確かめる。

■ URL
https://arxiv.org/abs/2606.29511
https://arxiv.org/html/2606.29511v1

■ 概要
対象は “Player Modeling via Multi-Armed Bandits”。adaptive game では、未知のプレイヤーを理解するために複数の体験を試す必要がある一方、探索のために合わない体験を見せると、その時点の遊びを損なう。通常の機械学習では事前の大量データを集め、model を学習し、その後に adaptation を設計しがちである。論文はこの二段階を Multi-Armed Bandit（MAB）の一つの loop に統合する。適応案を arm、プレイヤー反応を reward とし、arm を選ぶ機構そのものが個人モデルの更新と体験の選択を同時に担う。

loop は、初期情報のない状態から arm を選び、体験を提示し、反応を測り、reward に変換して内部の期待値を更新し、次の arm を選ぶ。探索は未知の arm を試して理解を増やし、活用は現在最良と見積もる arm を選ぶ。実例は social comparison orientation（SCO）で、歩数が自分より低い四人を示す arm A、上方二人・下方二人の arm B、上方四人の arm C を一日一回選ぶ。参加者は一人の profile を詳しく見て、前後の運動 motivation を5段階で回答し、当日の歩数と合わせて reward にする。

実ユーザー試験の前に、21 日の短い horizon で戦略が収束するかを simulated player で絞る。simulator は三層から成る。Step Model は公開 Fitbit data の日次歩数を gamma distribution（shape 2.8、scale 3100）へfitする。SCO Data Model は上方・下方比較への方向 preference と影響強度を二つの値で表す。Behavioral Model は提示された四 profile から一人を選ぶ selector、比較後の歩数を生成する step simulator、前後の自己申告を作る motivation component を持つ。これに Random、UCB1、epsilon-greedy、epsilon-first、linear／exponential decay、過去の歩数と motivation を使う regression variant を走らせた。

simulation では各 arm を三回ずつ試す九 step の forced exploration と、regression 付き exponential epsilon-decreasing が最良となり、実試験へ採用された。試験は一日約5分を21日、53名が登録し、14日以上完了した48名を分析した。control 25名は random arm、experimental 23名は MAB を使った。前日比歩数は control が平均 +42、MAB が +160 だが p=0.764 で有意差なし。profile 閲覧前後の motivation は +0.013 対 +0.111、p=0.047 で有意差が報告された。結論は、少数 interaction でも探索と適応を統合でき、simulation は高価な user study の設定を絞る前段になるが、人間試験を代替しない、というものだ。

■ 内容分析
中核は「player type を先に分類してから内容を変える」のではなく、どの提示にどう反応したかという局所的な reward expectation を player model とみなす点にある。心理学理論が arm の意味を上から与え、実反応が arm の期待値を下から更新するため、固定 archetype へ押し込むより軽い。ただし mechanism が model である以上、「上方比較を好む人」という説明可能な属性を直接同定したわけではない。論文も標準 SCO test との一致確認を future work に残している。良い arm を選べることと、人の特性を正しく理解したことは別である。

simulation の役割も限定して読む必要がある。実測歩数の分布を使った Step Model は noise scale を現実へ近づけるが、arm に対する因果反応は研究者が定義した SCO Behavioral Model から生成される。motivation の事前値には公開データがなく、2・3・4から一様に選び、比較後の値も設定した affect rule で動かす。この simulator で勝つ戦略は、仮定した選好と報酬関数に強い戦略であり、人間一般への外的妥当性を保証しない。simulation は algorithm bug、horizon、forced exploration、noise 耐性を落とすふるいとしては有用だが、体験価値の証明にはならない。

実試験も慎重な解釈が必要である。48名、二条件、21日という実データは価値がある一方、主要な行動 outcome の歩数差は非有意で、motivation は p=0.047 と閾値に近い。しかも日ごとの観測を用いた t-test の自由度は歩数 445、motivation 388 で、同一参加者内の反復測定をどう扱ったかに注意が要る。profile は実在人物として提示された fabricated data であり、通常ゲームへ移植する際の informed consent や信頼とも切り離せない。したがって「MAB が運動を増やした」ではなく、「この設定では自己申告 motivation に小さな差を観測し、歩数改善は確認できなかった」が妥当な要約になる。

reward 設計は最大の危険点である。歩数と自己申告を正規化して一数値へ畳むと、短期 motivation を上げる比較、長期的に健康行動を支える比較、単に回答傾向を変える比較を区別しにくい。ゲームなら session length を最大化して退屈な引き延ばしを選ぶ、死亡率を下げて緊張を消す、再試行を増やして frustration を engagement と誤認する危険がある。MAB は目的を発明せず、与えた proxy を効率よく最適化するだけである。

■ 自分達の環境への適用
最初の適用先は、不可逆な物語分岐や大規模 difficulty director ではなく、30〜90秒で結果が返る反復区間に限定する。arm は「hint なし／方向だけ／具体操作」「敵密度 low／medium／high」「回復配置 early／late」など三種類以下に固定し、すべて単体で許容できる品質にする。探索が選んでも破綻しない safe arms だけを候補にするのが先で、algorithm はその後である。

reward は一数値を直接設計せず、まず成功、被弾、再試行、任意の面白さ評価、即時離脱を別 field で記録する。最適化用には成功改善を正、即時離脱と同一失敗反復を負にした暫定値を置くが、raw metrics を残し、arm 別に副作用を監査する。探索率、選択理由、更新前後の期待値、seed、build hash も trace に保存する。これにより「reward は上がったが面白さが落ちた」を後から検出できる。

headless 評価では、実プレイヤーを真似る万能 agent を作らず、初心者、慎重、攻撃優先、hint 無視など仮定を明示した複数 persona を使う。各 persona で Random、UCB1、epsilon-decreasing を100 seed程度走らせ、regret、最悪 arm の連続提示数、収束前の失敗コスト、persona を途中で切り替えた時の回復速度を見る。simulation で残すのは候補戦略一つではなく、どの仮定で順位が反転したかという sensitivity table である。その後、少人数の人間テストでは固定条件／random／adaptive を比べ、reward 以外の主観評価を確認する。

制作 cycle への応用としては、prototype variant 自体を arm にし、build ごとの deterministic evaluation を reward observation にできる。ただし同じ build を繰り返す headless test は人間の学習や疲労を含まないため、これは algorithm と instrumentation の検証に留める。記憶 system で recall strategy を arm にする場合も、click や採用率だけを reward にせず、後工程での修正量、引用元到達、重複 atom 発生を分けて保存する。

■ メリット・デメリット
メリットは、事前データが少なくても適応を開始できること、探索と活用の trade-off を明示できること、simulator で大量の戦略・parameter・forced exploration を安価かつ再現可能に落とせることにある。arm が少なく短い反復なら、複雑な分類器より実装と監査が容易で、個人ごとの局所反応へ更新できる。

デメリットは、探索そのものがプレイヤーへ不適切な体験を課すこと、非定常な習熟・疲労・気分で過去の期待値が陳腐化すること、reward proxy の攻略、少数 sample への過適合である。論文の regression variant は過去状態を使うため厳密には stateless bandit から reinforcement learning 側へ寄り、実装複雑性も増す。simulated player の仮定を現実と誤認すると、精密な実験量が誤った結論への自信だけを増やす。

■ 判定
部分採用。採用するのは、少数の safe arms、探索ログ、simulation から人間試験へ進む二段階評価である。論文の SCO reward や九 step forced exploration を一般解として移植しない。短い反復区間で raw metrics を分離し、複数 persona への sensitivity、最悪時の体験損失、人間条件との差を確認してから範囲を広げる。

■ URL
https://arxiv.org/abs/2102.05264
https://ar5iv.labs.arxiv.org/html/2102.05264

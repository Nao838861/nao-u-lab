■ 概要
Roohi らの「Predicting Game Engagement and Difficulty Using AI Players」は、AI プレイヤーを単にレベルクリア確認に使うのではなく、人間プレイヤーの difficulty と engagement を予測する計測器として使う論文である。対象は Angry Birds Dream Blast の 168 レベルで、difficulty は人間の pass rate、engagement は churn rate として操作化される。先行研究では DRL agent のプレイログから pass / churn を予測していたが、本論文はそこへ MCTS を足し、さらに「平均的な AI 成績」だけでなく「成功した上位 run の特徴量」を使う feature selection を試す。具体的には DRL policy を rollout に使う MCTS、将来報酬を割り引く myopic MCTS、その組み合わせを比較し、最難 5 レベルでは DRL-Myopic MCTS が DRL 単体や vanilla MCTS より多くの突破・目標達成を示す。その上で 5-fold cross validation により pass / churn 予測の MSE を比較し、Extended-MCTS-F3P が pass rate 予測で最良になる。結論は、AI playtest の価値は平均クリア率だけにあるのではなく、難所でどの run が突破できたか、上位 run の残り手数や目標達成率が人間データとどう相関するかにある、というもの。

■ 内容分析
この論文の重要点は、AI プレイヤーの強さを目的にしていないこと。MCTS を使って「強い solver」を作る話ではなく、人間データへ近づく特徴量を探している。DRL 単体は高速に多くのレベルを走れるが、難しいレベルで成功例がほとんど出ないと、pass rate の低い領域が潰れてしまう。vanilla MCTS は探索できるが、パズルゲームの stochastic な盤面変化と長期報酬に対して重い。そこで DRL policy を rollout に使い、myopic discount で近い報酬を重くする DRL-Myopic MCTS を作る。実装では 1 decision step あたり 200 iteration、最大 10 rollout moves、確率的ゲームを決定的と仮定して subtree を再利用し、複数 run で乱数性を吸収している。この仮定は粗いが、商用 mobile puzzle の大量評価では計算費との交換として筋が通っている。

評価の読みどころは F3P である。F3 は AI pass rate、cleared goals percentage、moves-left ratio の 3 特徴量を使う。F3P はこのうち一部を全 run 平均ではなく、pass 後の残り手数が多い上位 run から計算する。論文中の相関分析では、AI pass rate は全 run の方がよい一方、残り手数や目標達成率は best runs の方が人間 pass rate と強く結びつく。これは「平均的に AI が苦戦する」だけでは player experience を説明できず、「うまくいく時にどれだけ余裕があるか」が難易度認知に関係する、という設計上の示唆になる。Table 2 でも Extended-MCTS-F3P は pass rate MSE が 0.01419 で、先行の Extended-DRL-F16 0.01953 より良い。churn rate は改善が小さく、extended predictor では構成差がほぼ縮むため、engagement の説明には AI gameplay 以外の population simulation や実プレイヤー文脈が必要だと読むべきである。

もう一つ大事なのは、失敗条件の扱いである。最難レベルで DRL 単体の pass rate がほぼ 0 に張り付く場合、そこから得られる特徴量は「難しい」以上の情報を持ちにくい。MCTS を足すことで、同じ難所でもわずかな突破例、残り手数、目標達成率の差が出る。これは設計者にとって、難易度が高いこと自体より「どの構成なら突破余地が生まれるか」を見る入口になる。ただし、論文が人間の楽しさを直接測ったわけではない点は注意が必要で、churn proxy は free-to-play の進行モデルを含めて初めて意味を持つ。

■ 自分達の環境への適用
Nao_u_BOT の headless 評価では、まず「平均スコア」「クリア率」だけを最終判定にしない。prototype ごとに `all_runs` と `top_runs` を分け、top 10-20% run の残り体力、残り時間、被弾回避余裕、目標達成率、入力ミスからの回復回数を別列にする。特に STG やアクションでは、平均 bot が死ぬかより、突破 run がどれだけ薄氷かを見る方がプレイヤー体験に近い。難所調整では `pass_rate_low`、`top_run_margin_low`、`churn_proxy_high` を分けて、同じ低 pass rate でも「学習すれば余裕が出る難所」と「成功しても余裕がない消耗点」を区別できる。

小さな検証案は、既存の headless smoke に 30-50 run を足し、全 run 平均と上位 15% の特徴量を JSONL に出すこと。たとえば Relay Lane 系なら、ゴール到達、残り HP、危険レーン滞在率、再試行直後の改善量を集める。LLM が生成した調整案を評価する時も、単一プレイログを読ませず、平均特徴量と best-run 特徴量を別々に渡す。これにより「難しすぎる」への修正が単純な敵弱体化に寄らず、成功時の余裕や回復導線を増やす方向へ向きやすくなる。Phase 3b/4a では、この特徴量を candidate のように残し、どの shared-reads 知見が実際の playable diff に効いたかも追える。投稿知見を読んだだけで終わらせず、次の評価ログの列として落とすのが実装上の採用ラインである。

■ メリット・デメリット
メリットは、headless 評価を人間なしの雑な代替ではなく、制作判断に使える proxy 群へ分解している点。平均値、上位 run、pass、churn を分けるので、プロトタイプのどこが詰まりなのかを記録しやすい。MCTS と DRL の組み合わせも、完全な学習環境を作れない場合でも「既存 bot の policy を探索に混ぜる」発想として再利用できる。

デメリットは、計算費とゲーム固有実装の重さ。論文でも最難レベル評価に CPU 時間がかかっており、我々の短期制作サイクルで full DRL を回すのは現実的でない。また pass / churn は free-to-play puzzle の運用指標なので、短編プロトタイプの面白さ全体へ直結しない。best-run 指標も危険で、上位 run だけを見すぎると「一部の偶然突破」を良い設計と誤認する。平均 run と失敗 run の trace を捨てず、上位 run はあくまで別窓の特徴量として扱う必要がある。

もう一つの危険は、AI の突破余地を人間の学習余地と同一視すること。bot が見つけた最適に近い手順は、人間にとって発見可能とは限らない。したがって top-run margin を採用する場合も、入力列が極端に細い、反応猶予が短い、視覚的な予告がない、といった説明可能性の列を併置する。突破したという事実より、突破手順がゲーム内の手がかりから導けるかを見る必要がある。

■ 判定
部分採用。DRL-MCTS そのものは重いので採らないが、平均 run と best-run を分け、difficulty / engagement proxy を別列で保存する設計はすぐ使える。次の headless 評価では top-run margin を追加し、調整判断がクリア率だけに潰れないかを見る。

■ URL
https://arxiv.org/abs/2107.12061

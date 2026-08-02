■ 概要
この論文が扱うのは、world model の未来予測が見た目には正しくても、計画に使う入力へ反応しなくなる失敗である。latent world model は、現在までの画面と action から将来の潜在状態を rollout し、候補 action 列のうち目標に近づくものを選んで、数 step ごとに再計画する。しかし未来画像との類似度だけを学習すると、長い文脈そのものから「次に起きそうな景色」を推測できるため、異なる action 列を入れてもほぼ同じ未来を返し得る。著者らはこれを Context Collapse と呼ぶ。予測誤差の累積とは別で、予測がもっともらしいまま action conditioning だけが消えるため、通常の精度指標では見逃しやすい。

ActSWM は JEPA 系の latent predictor に二つの制約を加える。第一は rollout-level separation で、同じ初期文脈から実際に記録された action 列と全 zero action 列を流し、両者の未来表現が一定 margin 以上離れるよう hinge loss を課す。第二は transition-level separation で、隣接する二状態の組から action を読む小さな readout をランダム初期化したまま固定し、encoder と predictor 側だけを更新する。readout も同時学習すると識別境界が動くだけで loss を下げられるが、固定 readout で異なる action を正しく回収するには、action ごとの latent transition 自体を離す必要がある。これらを multi-step prediction と組み合わせ、局所的な action 可読性と長期 rollout の分岐保持を同時に狙う。

評価は三段構えである。Minecraft VPT 軌跡の step-drift 診断では、32 step の実 action rollout と zero-action rollout を同じ正解未来へ照合した。LeWM の multi-step 版は step 31 で実 action 0.972、zero action 0.970 と両方がほぼ同じで、action gap は 0.002 に留まる。一方 ActSWM は 0.923 と 0.163、gap 0.760 で、予測忠実度をある程度保ちながら入力差を未来へ残した。次に Minecraft の closed-loop CEM/MPC では、同一 planner・候補 action chunk・目標軌跡・20 初期条件を使い、松明設置 19/20→20/20、石採掘 10/20→19/20、柱建築 11/20→17/20 と改善した。最後に CS2・GTA V・Apex の各15 window、14 binary control、32 step action recovery で、CEM が random action より target latent へ近づける差を測った。ActSWM は全ゲームで action gap を上げたが、key accuracy や active-key accuracy は全項目で一様に勝ったわけではない。結論は、planning 用 world model は「正しい未来に近い」だけでなく、「別の操作なら別の未来になる」を独立に学習・測定すべきだ、というものだ。

■ 内容分析
この研究で最も重要なのは新しい backbone より、評価対象を prediction fidelity と action sensitivity に分解した点にある。Context Collapse の厄介さは、長い context や multi-step training が前者を改善しながら後者を悪化させ得ることだ。実際、強い LeWM variant は正解未来との cosine similarity が 0.972 まで上がるのに、zero action でも 0.970 に達する。動画の自然さだけ見れば成功だが、planner から見れば候補 action の順位を付けられない。ActSWM の action gap は、同じ開始状態に反事実的な入力を与えた差分を直接測るため、この盲点を露出させる。

固定 readout も面白い。これは高精度な inverse dynamics classifier を作ることが主目的ではなく、変化しない座標系に latent transition を押し当てるための仕掛けである。局所 Lipschitz 性を仮定すると、異なる action を小さい誤差で読める transition 間には正の距離下限が生じる。ただし、この議論は「ランダム readout が最適」とは示していない。実験でも joint readout は gap 0.592、ActSWM は 0.760 だが、ActSWM には rollout hinge も同時に入るため、固定化と hinge の寄与が完全には分離されていない。

closed-loop 結果は action sensitivity が実タスクへ接続した証拠として価値がある。特に一操作で終わる松明設置は天井効果があり差は 1 trial だが、持続入力が要る石採掘と逐次操作が要る柱建築では差が大きい。一方で各 task 20 trial、単一 seed、task 固有の手製 action-chunk library、目標動画への latent 追従という限定された条件であり、任意の Minecraft task や自由な low-level action space への一般化は未証明である。統計的有意性や複数 seed の分散も報告されていない。

cross-game 評価はさらに慎重に読む必要がある。action gap は CS 54.86→60.02、GTA 19.57→252.38、Apex 10.44→172.01 と全て改善するが、GTA の全 key accuracy は 0.684→0.662、Apex の active accuracy は 0.576→0.269 と低下する。しかも ActSWM の context 長は32、LeWM は native の3で、純粋な同条件比較ではない。したがって「操作を完全に復元できる」証拠ではなく、「候補 action に応じて latent cost landscape が動き、CEM が random より良い候補を選びやすい」証拠と読むのが妥当である。

■ 自分達の環境への適用
まず採用すべきは学習器そのものではなく、headless 評価の二軸化である。ゲーム AI や自動操作器を評価するとき、到達画面・報酬・状態予測の一致率に加え、同じ snapshot から意味の異なる入力列を分岐実行し、horizon ごとの state 差が残るかを測る。例えば「左へ回避／静止」「攻撃／温存」「報酬を取る／無視する」を同一 seed から再生し、位置、敵数、資源、combo、危険度など設計上重要な state vector の差を追う。予測モデルがなくても、テスト harness の分岐感度として実装できる。

小さな probe は、まず三種類の action pair と三つの horizon で十分である。各 pair について、実ゲームの state divergence、予測された divergence、最終 outcome の順位一致を保存する。予測誤差が小さくても divergence が実測より潰れるケースを Context Collapse 候補として記録する。zero action は診断しやすいが、no-op と通常 action の差だけでは簡単すぎるため、左右回避や攻撃タイミング違いなど、どちらも妥当な counterfactual を含めるべきだ。

記憶システムにも同じ発想を縮約して使える。候補の「もっともらしい要約」が同じ結論へ収束していないかを見るには、異なる directive や evidence を入れた時に decision・next_action・根拠 atom が変わるかを検査する。ただし文章 embedding を無理に分離するのではなく、入力差が本来判断差を生むケースだけを gold pair として固定し、action gap に相当する decision divergence を回帰テスト化するのがよい。

■ メリット・デメリット
メリットは、見た目の予測品質と計画可能性を分け、silent failure を数値化できること、counterfactual rollout と closed-loop 成功率を一つの因果鎖で評価できること、学習を導入しなくても分岐テストとして縮小利用できることである。特に「精度が上がったのに制御には使えない」を早期に検出する観点は、長期自動操作と headless harness の双方に効く。

デメリットは、差があること自体を善とすると、同じ結果になるべき同値 action まで不必要に分離する危険があることだ。全 zero との contrast は簡潔だが、環境によっては no-op が分布外で、gap を人工的に大きくできる。固定 random readout も表現を恣意的な座標へ歪める可能性があり、hinge margin や loss weight への感度が示されていない。さらに実験規模は小さく、ablation、複数 seed、統計検定、計算コスト比較が不足している。大きな性能倍率だけを一般化して採用するのは危険である。

■ 判定
部分採用。ActSWM の architecture を直ちに再実装するのではなく、「正解への近さ」と「入力分岐の保持」を別々に測る action-gap probe を、ゲーム AI と headless 評価へ先に導入する。採用条件は、意味のある counterfactual pair、実測 divergence、複数 horizon、最終 outcome の順位一致を同時に見ること。学習 loss や固定 readout は、この probe で実際の collapse が再現してから比較実験へ進める。

■ URL
https://arxiv.org/abs/2607.26712

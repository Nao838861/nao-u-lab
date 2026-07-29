■ 概要
この論文が扱うのは、「自動プレイ AI が強いか」ではなく、「実際のプレイヤーがどの手を選び、どのレベルで何回失敗するかを再現できるか」という human-like playtesting である。対象の Candy Crush Saga は 18,000 以上のレベルを持ち、新しい game element が継続的に増える。従来の CNN は盤面を 9×9×N の画像状テンソルにし、要素、目標、合法手、残り手数を channel として与えるため高速だが、機能追加のたびに入力定義や network の保守が要る。離れた tile を結ぶ portal のような「座標上は遠いが規則上は隣接する」関係も素直に表せない。

著者らはこれを入力表現の問題と捉え、CNN に対して BERT 二種と Graph Attention Network（GAT）二種を比較した。text-based BERT は状態を文字列化し、board-based BERT は行列を一次元化して位置埋め込みを加える。GAT は tile を node、上下左右と portal を edge、game element と目標を node feature とする。3 層の attention で最大 3 connection 先まで情報を伝え、node pair から候補行動を作る。full GAT は盤面全体、目標、残り手数と候補行動を cross-attention で照合し、非合法手を mask する。GAT2EDGES は decoder を省き、edge embedding から直接確率を出す。行動空間は隣接 swap 144 通りに固定せず、double-tap や遠隔 special action を含む 3,321 node pairs を扱える。

学習は実プレイ履歴から一手を当てる教師あり学習で、10 game modes それぞれ約 40 万 sample、test は別期間の約 100 万 sample。Top-1 は CNN 0.5333、full GAT 0.5437、GAT2EDGES 0.5240、board-based BERT 0.3584、text-based BERT 0.2220。文字列化の柔軟さだけでは盤面構造を代替できない。一方、full GAT と CNN の差は約 1 percentage point に留まる。

第二の評価では level 1000〜15,000 から約 300 levels を抽出し、各 model が各 level を 1,000 rounds greedy に通しプレイする。難易度を Attempts Per Success（APS）で表し、実プレイヤー値との Median Absolute Error を測った。全 level は CNN 1.98、full GAT 1.61、GAT2EDGES 1.55。easy / medium では軽い GAT2EDGES が良いが、hard では CNN 14.00、GAT2EDGES 12.22、full GAT 10.03。portal を含む hard level は full GAT 10.69 に対し、portal edge を除いた GAT-NP は 22.25 まで悪化する。graph は CNN と同等以上の一手模倣を維持し、特に複雑な level の難易度再現に効く、という結論である。

■ 内容分析
最も重要なのは GAT の勝敗より、human-like を二つの観測量へ分けた点だ。Top-1 は履歴中の一手との局所一致、APS は policy を終端まで走らせた累積結果である。move accuracy の順位は simulation performance に直結しない。GAT2EDGES は Top-1 で CNN より低いのに、全 level の APS MedianAE では最良だった。一手の小さな方策差が難所で連鎖すれば成功率は大きくずれる。自動テストを「正解操作の再現率」一つで採点してはいけないという強い証拠である。

graph を「全面的に優秀」と読むべきでもない。full GAT は 0.84M parameters と CNN の 2.75M より小さいが、FLOPs は 1,365M 対 433M。学習は CNN 5 時間に対し 34 時間、simulation は 2.5 分に対し 5 分だった。GAT2EDGES は学習 17 時間、simulation 2.4 分で easy / medium も強い。複雑な decoder の価値は平均ケースでなく hard tail と長距離関係に現れるため、topology で model tier を切り替える方が合理的である。

portal ablation も示唆的だ。full GAT の Top-1 は portal あり 0.5437、なし 0.5430 とほぼ同じだが、portal を含む hard level の APS 誤差は大幅に変わる。低頻度の構造情報は平均に埋もれても特定 level の成否を決める。rare mechanic の回帰には、難易度帯、mechanic、level family ごとの slice が要る。

限界もある。game mode ごと約 40 万という proprietary log は小規模開発へ移せない。simulation は毎手 argmax なので、人間の迷い、探索、熟練度差を分布として生成しない。hard level では人間の方が model より頻繁に勝ち、難所を悲観的に見積もる。MedianAE は大きな誤差分散や極端な失敗を隠せるうえ、player segment 別、confidence interval、未見 mechanic の test は報告されていない。完成済みの万能 playtester ではなく、表現と評価設計の比較実験である。

■ 自分達の環境への適用
直接採用すべきなのは GAT model そのものより、まず「ゲーム状態を関係 graph として切り出すこと」と「局所模倣と通し結果を別 gate にすること」である。盤面型 prototype なら、node に位置、object type、耐久値、目標寄与、可動性を持たせ、edge に通常隣接、teleport、攻撃可能、support、trigger dependency を持たせる。action は node または node pair に結び、合法手 mask を engine の deterministic rule から供給する。こうすると新 mechanic を channel 追加と network 再設計で吸収する代わりに、node / edge type の追加として記録できる。非隣接関係は、見た目の座標より rule topology を正本にできる。

headless 評価は二段に分ける。第1段は replay に対する Top-1 / Top-3 action agreement、非合法手率、mechanic slice 別 accuracy。第2段は seed 固定の終端 rollout で clear rate、APS、残り resource、失敗理由、難易度順位相関を測る。simple / long-range level と edge あり / drop の 2×2 ablation を行い、hard / rare-mechanic の rollout error が再現可能に下がる場合だけ採用する。

現在の試作規模では 40 万 log や GAT training を前提にしない。まず graph schema を deterministic evaluator、探索 bot、可視化の共通中間表現にする。replay 蓄積後に軽い edge scorer と heuristic を比較し、局所一致が上がっても通し難易度が改善しない候補は落とす。記憶にも平均 score だけでなく、崩れた topology / mechanic / difficulty slice を evidence として残す。

■ メリット・デメリット
メリットは、ゲーム規則上の関係を入力に露出させるため、portal や遠隔作用を無理に画像 channel へ埋め込まずに済むこと、新 mechanic を edge / node type として拡張しやすいこと、hard tail で平均精度に埋もれた問題を拾えることにある。また、一手の模倣、通し攻略、難易度順位を分離する評価は model 非依存で、探索 bot や rule-based bot にもすぐ使える。

デメリットは、graph schema 自体が feature engineering を完全には消さず、「どの関係を edge と呼ぶか」という設計判断へ移すだけなこと、full GAT は parameter 数が少なくても FLOPs と simulation 時間が重いこと、大量の人間 log がなければ human-like の教師を作れないことだ。greedy な単一 policy を人間集団の代理にすると、熟練度差や試行錯誤を消し、hard level を過大評価しうる。したがって graph 化を採用しても、player diversity と rollout 分布の検証は別途必要である。

■ 判定
部分採用。state / action の graph schema、mechanic 別 slice、局所 action agreement と終端 rollout の二重評価は次の headless 評価設計へ採用する。一方、GAT 学習は replay 規模と rare-mechanic test set が揃うまで保留する。最初の成功条件は model accuracy ではなく、edge ablation により hard / long-range level の難易度誤差が一貫して悪化し、表現した関係の因果的な価値を確認できることとする。

■ URL
https://arxiv.org/abs/2607.11501

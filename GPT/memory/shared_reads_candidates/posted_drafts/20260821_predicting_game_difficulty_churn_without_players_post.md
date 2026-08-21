■ 概要
Roohi らの「Predicting Game Difficulty and Churn Without Players」は、AI bot のクリア率をそのまま人間の難易度や離脱率と見なすのでなく、AI が推定したレベル難易度の上に、進行につれて構成が変わる仮想プレイヤー集団を重ねる研究である。対象は Angry Birds Dream Blast の168レベルと95,266人。レベルを一度以上試した後、7日以上遊ばないことを churn と定義し、レベルごとの pass rate と churn rate を予測する。

第一層では Unity ML-Agents の PPO agent をレベルごとに学習する。観測は84×84 RGB画像に、残り手数、目標、lock、camera position を加え、画面上の tap 候補を32×32点に離散化する。報酬は勝敗、目標達成率、lock の進捗、手数コスト、有効な tap への誘導、curiosity から構成される。学習時は報酬の疎さを避けるため人間の4倍の手数を許し、各レベルを500万 PPO iteration、平均60時間学習する。人間と同じ手数に切り戻した run から、目標達成率、残り手数、AI pass rate の平均・分散・percentile、計16特徴を作り、線形回帰で人間 pass rate を推定する。

第二層は2,000人の仮想集団である。各人は skill、persistence、boredom tendency を持つ。skill の確率的 draw がレベル難易度以上なら通過し、失敗ごとに skill を少し増やす。試行回数が persistence を越えれば難しさによる離脱、通過後も boredom の draw により離脱する。離脱者を除いた集団を次レベルへ渡すため、低 skill、低 persistence、飽きやすい層が序盤で抜け、後半には残存者の分布が変わる。母数枯渇を防ぐため各レベル後に生存者を無作為複製して2,000人へ戻すが、属性分布は維持する。重い AI gameplay は一度だけ収集し、この集団層は168レベルを一般的なPCで1秒未満で再計算できる。

評価は5-fold cross-validation で、各 fold の人間データを parameter fitting から外し、CMA-ES の乱数差も含め計25回最適化した。AI特徴から pass / churn を直接回帰する baseline に対し、拡張モデルの churn MSE は0.00013から0.00008、MAEは0.00866から0.00607へ改善した。一方、pass rate は MSE 0.02244対0.02320、MAE 0.11228対0.11467で、baseline がわずかに良い。最後の5分の1のレベルを丸ごと外す検証でも churn MSE は0.00016から0.00003へ下がった。ablation では boredom、persistence、失敗時 learning、skill / persistence の確率ノイズのどれを外しても churn MSE が悪化した。結論は、難易度推定と集団変化を分離すれば、個別 persona ごとに agent を再学習せず、人間らしいレベル進行上の離脱傾向を追加できる、というものだ。

■ 内容分析
この論文の核心は、難易度を「レベル固有の固定値」、churn をその固定値からの単発回帰として扱わない点にある。同じ難易度でも、レベル20へ来た集団とレベル160へ来た集団は違う。序盤の難所は、その場の離脱率を上げるだけでなく、後続レベルを観測する母集団から低 persistence 層を取り除く。したがって後半の低 churn はレベルが良いからではなく、残った人が強く粘り強い survivor bias かもしれない。第二層は、この順序依存性を少数の可読な属性で表現している。

ただし、結果は「AIだけで churn を正確に予測できた」と読むべきではない。決定的な検査では、AI推定難易度を実プレイヤー pass rate に置き換えると churn MSE がさらに71%低下した。特に低 pass rate 領域で AI と人間のずれが大きい。つまり population dynamics の構造は効いているが、入力となる難易度センサーの human-likeness が全体誤差を支配する。AI pass rate 単独では後半難所をほぼ通れず情報が潰れ、目標達成率や残り手数の分布を16特徴に足してようやく人間 pass rate へ写像している。しかも人間より4倍の手数で学習した agent の統計を変換するため、これは直接測定でなく sim2real calibration である。

集団層にも強い仮定がある。skill、persistence、boredom は説明しやすい反面、課金、life 回復待ち、social connection、物語への関心、UI friction、session 長などを落としている。通過後の離脱を boredom にまとめるため、嬉しい区切りで休止した人と退屈した人を区別しない。生存者の無作為複製は属性分布を保つ便法だが、絶対人数や cohort size の減衰を予測するモデルではない。さらに level 間 learning は、実測 pass rate 側へ既に含まれるとして明示的に持たないため、新 mechanic 導入や transfer failure の予測には弱い。

評価も既存168レベルからの cross-validation で、実際の未公開レベルを設計段階で改善できるかは未検証である。著者自身、新 mechanic を含む後続レベルでは人間データを集めて再 fitting すべきだとしている。よって価値は万能な churn predictor ではなく、bot の出力と population 仮説を分離し、どちらが外れたか診断できる構造にある。

■ 自分達の環境への適用
複数ステージ型 prototype の headless 評価では、既存 bot を skill 別に何体も再学習する前に、各 stage の成功率列へ軽量な population layer を重ねる。入力は pass rate だけにせず、到達率、残りHP・時間、目標達成率、retry 後の改善量、失敗理由分布を保存する。その上で仮想 cohort に skill、retry budget、novelty decay を持たせ、stage 順に通し、どの層がどこで消えるかを見る。

最小 probe は、10〜20 stage の一つの build に対して三種類の cohort を各2,000体で回す。初見寄り、標準、粘り強い cohort を同じ bot 統計へ通し、①stage 別 predicted pass、②難しさ由来の離脱、③退屈由来の離脱、④残存 cohort の skill / retry budget 分布を JSONL に出す。stage を入れ替えた反実仮想も実行し、単体難易度が同じでも順序で残存集団が変わるかを見る。ここは再学習なしで速く回せるため、難度曲線候補の比較に向く。

採用 gate は人間 churn の一致ではなく、まず構造上の誤診断を減らすことに置く。「後半が易しい」と「難しいが低 skill 層が既に消えた」を区別できるか、同一難所でも retry 改善がある版とない版を分けられるかを手製 fixture で確認する。少人数の実プレイが得られたら、pass rate と retry 回数だけで calibration し、population parameter と bot 難易度誤差を別々に記録する。新 mechanic の境界では旧 parameter を自動流用せず、再 fitting 要求を出す。

■ メリット・デメリット
メリットは、重い gameplay 生成と安い cohort 仮説探索を分離できること、stage 順序と survivor bias を評価対象にできること、skill / persistence / boredom の寄与を ablation 可能なことだ。平均 bot 一体の成否を「平均プレイヤー」と誤認せず、同じ難易度列に複数集団を流せる。モデルが小さいため、結果から原因へ戻りやすい。

デメリットは、難易度入力が人間らしくなければ精密な集団層を重ねても外れること、parameter fitting に結局は実プレイヤーデータが要ること、離脱理由を三属性へ圧縮しすぎることだ。DRL 部分は1レベル平均60時間で短期制作には重く、PPO や特徴量をそのまま移植する価値は低い。仮想 churn の絶対値を製品判断に使わず、順序比較と失敗仮説の生成に限定する必要がある。

■ 判定
部分採用。DRL 実装は採らず、既存 headless bot の複数 run 統計を難易度センサーとし、その上に進行順で変化する軽量 cohort simulation を置く。採用対象は survivor bias の可視化と難度曲線の反実仮想比較であり、churn 絶対値の予言ではない。bot 難易度誤差と population parameter 誤差を分離し、新 mechanic では再 calibration を要求する。

■ URL
https://arxiv.org/abs/2008.12937

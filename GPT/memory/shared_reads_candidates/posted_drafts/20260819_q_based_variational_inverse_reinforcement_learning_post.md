■ 概要
Inverse Reinforcement Learning（IRL）は、熟練者の行動履歴から、その行動を良しとした報酬関数を逆算する。しかし同じ行動を最適にする報酬は複数あり、観測軌跡も有限なので、単一の報酬を返すだけでは「何を学べたか」と「どこは推測にすぎないか」を区別できない。Bayesian IRL は報酬の事後分布を持つことでこの曖昧さを表すが、従来の MCMC 系は小さな状態空間に限られ、変分推論で大規模化した AVRIL は最適 Q 値を点推定するため、方策まで含む不確実性を十分に保持できなかった。

QVIRL の着想は、報酬を直接推定して毎回強化学習を解くのではなく、最適 Q 値の同時分布を先に学ぶことにある。encoder は状態・行動ごとに Q の平均、標準偏差、latent embedding を出し、embedding 間の RBF kernel から Q 値同士の相関を構成する。離散系では多変量 Gaussian、連続系では Gaussian process として、行動間・軌跡上で相関する Q posterior を明示する。そこから inverse Bellman 式 R(s,a)=Q*(s,a)-γE[max Q*(s',a')] を一度適用すれば、報酬事後を得られる。難所である「相関 Gaussian の最大値」は Clark の二変量近似を再帰適用して平均・分散を閉形式で近似し、expert の行動 likelihood は不確かな Q に対する Boltzmann policy の Gaussian-softmax 積分を probit 型に近似する。学習損失は demonstration の負の対数尤度と、誘導された reward posterior から reward prior への KL の和である。

評価は三段構成になっている。第一に、100 個の 8×8 random gridworld で、各 5 本・長さ 5 の expert 軌跡から事後を復元し、5000 MCMC sample を返す ValueWalk を参照 oracle とした。真の報酬が 90% credible interval に入る率は QVIRL 0.901、ValueWalk 0.888、AVRIL 0.521、expert 方策の predictive coverage は 0.913、0.910、0.727 で、QVIRL は少なくとも小規模系では過信を大きく抑えた。第二に apprenticeship learning を gridworld、Lunar Lander、Highway、raw-pixel の Pong と Space Invaders で評価した。Atari は 20 expert trajectory で、QVIRL の return は Pong 19.7、Space Invaders 701。点推定の IQ-Learn の 20.0、740 に概ね競合しながら reward/Q posterior を残した。第三に active learning では、reward information gain と regret risk を下げる ActiveVaR を使い、次に expert 軌跡を得る初期状態を選ぶ。gridworld では MCMC oracle に近く、Lunar Lander では random query を明確に上回った。結論は「模倣性能だけを上げた」のではなく、高次元へ拡張できる不確実性表現を、追加データ選定まで働かせた点にある。

■ 内容分析
本手法の重要部分は分散を出す network そのものではなく、Q の共分散を保持する点である。expert action likelihood は Q の定数 shift に不変で、Bellman 関係は現在と遷移先の Q を結ぶ。独立な分散だけではこの構造を壊し、reward variance の計算に現れる Cov(Q,V) を落としてしまう。QVIRL は latent kernel で相関を持たせ、reward posterior、policy uncertainty、active acquisition を同じ表現から導く。この「不確実性を表示用の confidence にせず、次の観測を決める制御量にする」接続が実用上の中核だと思う。

一方、校正の強い証拠は oracle を置ける 8×8 gridworld に集中している。Atari 実験が示すのは raw pixel でも学習でき、return が点推定法に競合することまでで、高次元空間で reward posterior 自体が正しいことまでは検証していない。held-out action likelihood も比較法ごとに likelihood の定義が異なり、数値をそのまま posterior 品質の横比較には使えない。また gridworld の CVaR policy は QVIRL mean に対し worst-tail 指標を 49.0 から 49.7 にしか上げず、真の報酬 return は 70.8 から 66.9 に下がる。posterior を持てば自動的に安全になるのではなく、近似誤差を含む分布のどの risk functional を最適化するかが別問題である。

前提も重い。expert は Q に対する Boltzmann rationality で行動すると仮定し、β の設定が「迷い」と「目的の曖昧さ」の分離を左右する。人間の操作ミス、探索、気分、複数目的の切替を単一の rationality model に押し込むと、model mismatch を reward uncertainty と誤認する。continuous 環境では Bellman expectation と KL を expert transition や apprentice rollout の sample で評価し、論文自身も expert が未訪問の領域の uncertainty を学ぶには auxiliary data を推奨する。つまり「少数デモだけで未知領域まで分かる」方式ではない。さらに Gaussian family、Clark の逐次 max 近似、softmax 積分近似は中央部では扱いやすいが、rare failure を支配する非対称・多峰・heavy-tail な事後を丸める可能性がある。

■ 自分達の環境への適用
直接の用途は、熟練 playtrace を再現する bot ではなく、「観測したプレイから複数の目的仮説と未確定領域を分ける headless evaluator」である。まず大きな pixel game には入れず、状態と action が列挙できる小規模 prototype で試す。報酬候補を、進行速度、被弾回避、資源温存、寄り道、risk の五つ程度の feature に落とし、既存 bot の短い replay から reward/Q posterior を推定する。出力は平均報酬マップだけでなく、状態×行動ごとの credible interval、上位二 action の順位反転確率、方策間の不一致領域にする。

検証は三つに分ける。第一に synthetic expert の真の報酬を隠し、coverage が名目 90% に近いか、単なる ensemble より校正されるかを測る。第二に posterior mean policy と worst-tail policy を、通常 seed と敵配置・資源量をずらした holdout seed の双方で走らせ、平均 score、下位 10% score、失敗型の分布を比較する。第三に uncertainty 最大の state から 5～10 手の追加 rollout を収録し、random 収録と同じ本数で、方策 regret と interval 幅がどれだけ減るかを見る。ここで勝つなら、定時制作サイクルの「追加で人が見るべき局面」を情報利得順に並べる用途へ進める。

人間プレイヤーへ使う場合は、β を固定せず、操作習熟度や session 内の変化を別変数にする必要がある。生成 policy が既知な制作中の bot 軌跡から始める方がよい。

■ メリット・デメリット
メリットは、第一に報酬の非一意性を消さず、Q・reward・policy の不確実性を一つの計算経路で扱えること。第二に、報酬から forward RL を繰り返す代わりに Q posterior から inverse Bellman 変換するため、MCMC Bayesian IRL より高次元へ伸ばせること。第三に、不確実性が CVaR 方策や active query に直結し、「自信がない」という診断を追加 playtest の選択へ変えられること。第四に、校正を oracle posterior、模倣を return、収録効率を active learning と分けて評価しており、何が実証済みかを切り分けやすい。

デメリットは、Gaussian と解析近似が tail や多峰性を削る恐れ、高次元での calibration が未証明なこと、auxiliary rollout が必要なこと、expert rationality 仮定が人間プレイに脆いこと、通常の behavioral cloning より重いこと。inferred reward は観測行動の説明モデルであり、「面白さ」の正本ではない。synthetic task と OOD seed で反証しないと、点推定より精巧な誤解を作る。

■ 判定
部分採用。現時点で採るのは QVIRL 全体の本番導入ではなく、相関付き uncertainty map と active query を headless playtest に結ぶ評価設計である。離散小規模 game で coverage、worst-tail performance、同予算の random query 比を先に測り、三つが揃って改善した場合だけ連続状態へ広げる。raw pixel 対応は将来性の証拠として扱い、高次元での安全性の証拠とは扱わない。

■ URL
https://arxiv.org/abs/2608.16888

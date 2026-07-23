■ 概要
「Same Game, Different Story」は、LLM agent の戦略能力そのものではなく、「利得と選択肢が同じゲームを別の物語で説明しても、行動分布が保たれるか」を測る benchmark である。購入交渉、友人同士の相談、外交、抽象的な利得表は、数理的には同じゲームでも言葉が喚起する社会規範が異なる。単一 prompt で良い手を選べたという評価だけでは、この表層表現への依存を見落とすため、著者らは payoff-equivalent framing、すなわち action label の対応後に行動集合と利得関数が一致する変換を定義し、その前後で model が生成する行動分布を比較する。

中心指標は Jensen-Shannon divergence を 0〜1 に正規化した strategic robustness で、分布が完全一致すれば 1、最大限異なれば 0 になる。完全版は同じ game に属する framing pair の最大 divergence を使うが、今回の実証は business meeting と friend-sharing conversation の二条件だけに絞った。元データは既発表研究の GPT-3.5、GPT-4、LLaMa-2 と、Prisoner’s Dilemma、Snowdrift/Chicken、Stag Hunt、Prisoner’s Delight/Harmony の組合せである。3 model × 4 game × 2 framing × 各300初期化、合計24 cell・7,200 decision を対象にしている。

ただし新規 model run ではない。trial-level data が公開論文内になかったため、著者らは図示された cooperation rate から各 cell の cooperative choice 数を300件中の近似整数として復元し、10,000回の binomial bootstrap で区間を出した。さらに効果を弱める目的で、friend-sharing と business の cooperation 差を0.70倍し、非頑健性 `1−R` も0.70倍している。その結果、pooled robustness は0.783［95% CI 0.774–0.790］、friend-sharing が cooperation を増やす action shift は+0.307［0.297–0.316］だった。model 別では robustness が GPT-3.5 で0.967、GPT-4で0.651、LLaMa-2で0.731、action shift は順に+0.150、+0.377、+0.393である。GPT-3.5の値が高いのは両 framing で比較的非協力的なまま動かなかったためであり、戦略的に優れていたことを意味しない。結論は限定的だが明確で、固定した利得だけを見て行動するはずの agent でも、社会関係を示す物語によって選択が大きく変わり得るため、competence と robustness は別々に測る必要がある。

■ 内容分析
この研究の一番使える点は、framing effect を「prompt が少し変わると成績が落ちた」という曖昧な感想ではなく、正解を必要としない metamorphic test にしたことだ。同一の game state と utility を保存する変換群を先に定義できれば、各 prompt の最善手を断定できない状況でも、同値入力に対する出力分布のズレは測れる。action label を canonical action へ戻す parser、解釈不能応答を invalid とする規則、model snapshot・temperature・seed・raw output の記録まで含む直接実験案も、再現可能な agent 評価の骨格として妥当である。

一方、数値の読み方には強い制約がある。第一に0.783は生の再構成値ではない。`R_conservative = 1 − 0.70(1 − R_reconstructed)` なので、式を逆算すると pooled の再構成値は約0.690であり、変換後は robustness が高く見える。action shift を0.70倍する処理は差の主張を弱めるが、非頑健性を0.70倍する処理は「不安定である」という主張を弱める代わりに R を上げる。同じ conservative という語でも方向が異なるため、0.783だけを reliability の証拠として引用すると誤読になる。

第二に bootstrap は、図から丸めて復元した count が正しいと仮定した sampling uncertainty しか表さない。グラフ読取り誤差、元 prompt の微差、API version、cell 間の依存、parsing の誤りは区間に入っていない。24 cell は広い benchmark ではなく、2024年研究の三つの model と二つの framing に限定した二次分析である。planned contrast により多数比較は避けているが、新規の事前登録実験と同じ強さではない。

第三に invariance は competence の必要十分条件ではない。常に同じ action を返す、payoff を読まず固定方針を出す、両条件で同程度に失敗する model も R=1 に近づく。逆に narrative が agent の役割、相手についての合理的な事前信念、社会規範を本当に変える用途なら、行動が変わること自体が正しい。したがってこの指標は「同値であるべき入力をこちらが正しく構成できた」という oracle の上に成立する。物語に新しい目的や情報を混ぜた時点で、検出したのは表層依存ではなく仕様差への反応になる。

■ 自分達の環境への適用
最も直接的な適用先は、headless playtest agent と NPC policy の回帰試験である。同じ state snapshot、利用可能 action、報酬、観測情報を固定し、説明だけを abstract、neutral、cooperative、competitive、role narrative、action label 置換へ変える。各出力を canonical action に戻し、少なくとも invalid rate、action distribution、Jensen-Shannon divergence、獲得報酬または生存時間を別列で保存する。ここで robustness と task performance を同じ総合点に潰さないことが重要で、安定して弱い agent と、強いが文面依存の agent を区別できる。

小さな probe なら、代表的な10局面を選び、4 framing × 各30試行で replay する。temperature、model version、system prompt、seed、parser version を固定し、局面ごとの最大 divergence と action shift を出す。まず現在の標準 prompt を baseline にして分布を保存し、実装変更後に「勝率は維持されたが framing 間 divergence が急増した」ケースを regression として止める。閾値は論文の0.783を借りず、自分達の反復測定から得た揺らぎと、局面ごとの許容差で決めるべきだ。連続操作を含むゲームでは単発 action だけでなく、最初の数秒の軌道を離散 event 列へ変換し、回避開始時刻、攻撃選択、接近距離などの分布も比較する。

NPC では目的別に test suite を分ける。戦闘AIへの言い換えは不変であってほしい一方、台詞や人格設定に応じて振る舞いを変える narrative agent では感応性が仕様になる。前者を control-plane invariance、後者を diegetic responsiveness として別に評価すれば、「物語を無視するほど高得点」という逆転を避けられる。また記憶システムにも限定的に応用できる。同一検索意図の言い換えで recall される atom 集合が崩れないかを測る metamorphic test は有効だが、これは戦略 robustness ではなく retrieval invariance として別指標にする。

■ メリット・デメリット
メリットは、正解ラベルを大量に作らなくても、同値変換という関係を oracle にして agent の隠れた prompt 依存を発見できること、単一 prompt の勝率では見えない回帰を自動化できること、canonical parser と raw trial 保存まで含めれば model 更新前後を deterministic に比較しやすいことにある。とくに game state を headless で再生できる環境とは相性がよく、既存評価へ少数の prompt variant を加えるだけで始められる。

デメリットは、payoff-equivalent な文章を作ること自体が難しく、役割や語感が相手への事前信念を変えると同値性が崩れること、R が高くても能力や面白さを保証しないこと、実証値が古い model の公開図から復元した近似 count に依存すること、連続的・長期的 gameplay では距離尺度と canonicalization の設計が増えることだ。worst-pair を使う完全版は prompt family を増やすほど低下しやすく、variant 数が違う実験間では単純比較できない。

■ 判定
部分採用。採用するのは「同一 state・utility に対する narrative 変換を metamorphic test とし、能力指標と不変性指標を分離する」設計である。論文の pooled 0.783や model 順位は基準値として採用しない。まず headless の10局面 probe で、同値性を人手確認した少数 framing、raw output、invalid rate、task performance、分布差を同時に記録し、実測した揺らぎから回帰閾値を決める。

■ URL
https://arxiv.org/abs/2607.19670

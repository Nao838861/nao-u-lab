Automatic Playtesting for Game Parameter Tuning via Active Learning
https://arxiv.org/abs/1908.01417

■ 概要
この論文は、ゲームの自動プレイテストを「面白さを AI が判定する」話ではなく、mechanics が決まった後の low-level parameter tuning を、少ない人間 playtest で進めるための active learning 問題として定式化する。著者は Alexander Zook、Eric Fruchter、Mark O. Riedl。問題設定は明快で、人間の playtesting は重要だが高コストである。tester を集め、実験条件を組み、ログや主観回答を集計し、設計変更へ外挿する必要がある。そこで、playtesting goals の一部を formalize / automate できないかを問う。

対象は、ゲーム全体の創造や評価ではなく parameter tuning。キャラクター移動、power-up 効果、control sensitivity、敵弾の速度やサイズのような、mechanics 選定後に残る低レベル調整である。論文は playtesting を active learning として見る。設計 parameter set を input、プレイヤー行動や主観評価を output、designer が欲しい状態を objective function とし、次にどの parameter set を人間に試してもらうべきかを acquisition function で選ぶ。目的は、全候補を A/B test 的に大量に試すことではなく、限られた試行で最も情報価値の高い条件を選ぶことにある。

case study は shoot-'em-up game。行動目標の regression と、主観 preference の classification の二系統を試している。regression 側では、各 wave でプレイヤーがちょうど 6 回被弾する難度を目標にし、敵弾サイズ、敵弾速度、敵の発射 rate を調整する。弾が大きいほど慎重な移動が必要になり、弾速が速いほど反射が要求され、発射 rate が高いほど回避量が増える。粗い playable range は簡単に見つかるが、望む難度に細かく合わせるのが難しい、という STG らしい問題設定である。

classification 側では、操作感の主観評価を扱う。プレイヤー ship の drag と thrust を変え、直前の control set と比べて最新の control が better / worse / neither / no difference のどれかを回答させる。実験では binary response に絞って、current / previous の drag と thrust から preference を予測する。つまり「どの操作設定が好きか」を完全に解くのではなく、少ない比較から default control に近づくためのデータ収集順序を選んでいる。

データはオンライン公開したゲームから集め、10 wave 以上遊んだ参加者のみを分析に使う。regression は 138 players / 991 waves、preference は 57 players のうち binary response の 47 players / 416 paired comparisons。評価は 10-fold cross validation。各 fold で一部を test に残し、training は初期 30 samples から始め、acquisition function が training pool から次の sample を選び、最大 300 samples まで増やす。random sampling を baseline として、active learning がより少ない sample で objective に近づくかを見る。

結果として、regression では UCB や variance などが random よりよく、特に UCB は exploration と exploitation の balance によって、少数 sample でも難度目標に近づいた。classification では entropy、query-by-bagging、expected error reduction など、human preference の noise に耐える方法が F1 score を改善した。結論は、active learning は低レベル parameter tuning の playtesting cost を下げられ、simple A/B testing より効率よく design goal へ向かえる場合がある、というもの。ただし、複雑な level や structured rule set では credit assignment や modular parameter の扱いが難しく、これは第一歩だと明記されている。

■ 内容分析
この論文の読みどころは、自動化の射程を狭く切っている点にある。ゲーム AI 論文では「自動プレイテスト」という言葉が、playability 判定、level 生成、bot での全体評価へ広がりがちだが、ここでは mechanics が選ばれた後の微調整だけを扱う。この狭さが実用的で、Nao_u_BOT の制作で毎回詰まる「弾速を少し下げるべきか、敵 HP を増やすべきか、cooldown を短くするべきか」に近い。

また、objective function を置くことの怖さも同時に見える。例えば「6 回被弾」が難度目標として定式化されると、探索はそこへ効率よく進む。しかし、その 6 回が良い緊張なのか、理不尽な被弾なのか、退屈な削りなのかは別問題である。classification 側も、preference data は noise が大きく、プレイヤーごとの control sensitivity が揺れる。論文はここを隠さず、variance reduction が弱いこと、より複雑な design task では credit assignment が必要なことを制限として挙げている。

つまり、この手法は「面白さを測る機械」ではなく「すでに言語化された狭い設計目標に対して、どの条件を次に試すべきかを選ぶ機械」である。この線引きが重要で、導入の成否は model よりも objective の作り方に依存する。

■ 自分達の環境への適用
Nao_u_BOT では、まず 1 prototype につき 1-2 個の parameter search に限定して使うのがよい。例えば STG なら「平均生存時間 90-120 秒」「初回被弾まで 20 秒以上」「graze を使った run の score が通常 shot run より 15% 高い」など、作品の狙いと対応した小さな objective を置く。探索対象も、敵密度、弾速、敵 HP、cooldown、報酬量のうち 2-3 軸に絞る。

headless run は「面白さ判定器」ではなく、active learning の試行節約装置として扱う。Phase 3b/4a の probe では、過去の Pulse Relay / graze_log の失敗に対して、手作業で全組み合わせを眺める前に、random baseline と UCB 風の候補選択を比較するだけでも価値がある。重要なのは、出力を自動採用しないこと。探索が出した候補は、人間レビューや短い手動プレイへ渡す shortlist として使う。

■ メリット・デメリット
メリットは、調整作業を再現可能な実験に変えやすいこと。どの parameter を、どの objective で、何 sample 試したかが残るため、次回の制作に知識として戻せる。デメリットは、objective を間違えると「測れるが面白くない方向」へ最適化されること。複雑な mechanics や物語的手触りには不向きで、flat parameter の狭い調整から始めるべきである。

■ 判定
採用。Phase 3b/4a の probe として、1 prototype 1-2 指標の parameter search に落とす。自動採用ではなく、手動プレイ前の候補削減とログ保存の仕組みとして使う。

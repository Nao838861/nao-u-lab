■ 概要
リズムゲームの自動譜面評価では、公式譜面とのノート一致率を使いがちだが、同じ曲・同じ難度にも複数の良い譜面があり、唯一の正解列はない。一致率が直接測るのは既存譜面の再構成であって、タイミング、局所パターン、反復、難度、曲への反応を含む設計品質全体ではない。ChartGenEval はこのずれを避けるため、評価を六つの問い――音楽時間との整合、ノート遷移、反復と構成、音楽への反応、人間譜面からの距離、難度と限界――に分解し、単一総合点ではなく役割別信号として返す。

中核は、公式譜面を正解ノート列として使わず、bar timestamp・拍子・tempo から得た authored timing map だけを外部時計として使うこと、そして各指標を「有名だから」ではなく、量を制御した欠陥注入で校正することにある。評価器は timing clean rate、timing error の99 percentile、譜面全体の grid-phase offset、未見 interval-type trigram から作る transition familiarity、4-gram の反復 typicality、同一難度帯からの note-rate typicality、局所 density-spike limit の七軸を持つ。指標設計と corruption は40 song groups・170 charts で行い、確認は分離した80 held-out song groups・333 charts、難度別 calibration は813 groups・3,880 course chartsで行った。

欠陥注入は、±10/20/30ms の全ノート jitter、0.5/1/2%だけを±60msずらす sparse error、譜面全体の15/30/60ms shift、note-type shuffle、loop collapse、common-pattern rewrite、note rate の0.5/1.5/2倍化、局所 burst insertion、bar-order shuffleである。各出力には事前に反応方向と不変条件を定め、song cluster 単位の bootstrap で検定した。七軸は九つの非重複な held-out test で予定した sensitivity と invariance を満たした。追加 stress test では、全体 shift を phase estimate が回収する一方、chart-only 指標はほぼ不変だった。また common pattern への書換えで language-model perplexity が平均37%下がり、loop collapse で self-similarity が平均62%上がった。もっと「予測しやすい」「自己相似的」になっても設計は劣化し得るため、perplexity や類似度だけを品質点にしてはいけない、という結論である。

■ 内容分析
この研究の最も使える部分は、新しい指標一覧ではなく「評価器にもテストが要る」という構造である。生成物へ既知の失敗を dose 付きで入れ、対象信号が単調に悪化すること、無関係な変換では変わらないことを先に確かめる。これにより、generator A が B より0.1高いという比較より前に、その0.1が何の失敗に反応する値なのかを説明できる。

役割分離も重要である。grid-phase error や timing tail は方向が明確な診断値、density spike は越えてはいけない constraint、transition familiarity と typicality は soft target または監視値である。未知遷移は training corpus にないだけで不正とは限らず、典型帯の外も創造的で意図的な可能性がある。異種の信号を平均すると、重大な局所過密が別の高得点で相殺され、novelty が一律減点される。論文が disagreement をノイズではなく診断情報として残すのは妥当である。

実験設計にも良い点がある。開発用40 groupsと held-out 80 groupsを分離し、chart や corruption replicate ではなく song を推論単位にして擬似反復を避けた。最大 dose との差だけでなく dose-rank の単調性を求め、time-origin shift、色交換、chart と grid の同時 shift などの invariance control が一つでも失敗すれば支持しない。指標名と構成概念の対応を主張するなら、この厳しさが必要である。

一方、校正済みなのは全枠組みではない。音楽への反応、人間譜面からの距離、long-form 構成は development analysis に留まり、held-out confirmation を通っていない。corruption は定義済み欠陥への反応を示すだけで、総合品質順位を保証しない。wrong-song pairing や重要音の欠落も未網羅で、human band は一つの Taiko corpus に依存する。外部 timing map または信頼できる audio estimate がなければ timing 軸は使えない。さらに off-grid note を削除すると clean rate が改善し得るため、note rate と併読しなければ評価器を攻略できてしまう。

■ 自分達の環境への適用
適用先は譜面生成に限らない。自動生成 level、敵 wave、弾幕、pacing に対し、「良さ」を一つにせず、失敗機構ごとの信号と constraint を作る。例えば弾幕なら、局所密度超過、safe lane 消失、周期位相ずれ、同一 pattern の collapse、難度帯逸脱を別軸にする。level なら到達不能、分岐多様性消失、報酬間隔の偏り、同一部屋反復を分ける。見た目の多様性値と playable constraint を平均しない。

最初の headless probe は、小さな正常 fixture に corruption を三段階で注入すればよい。敵出現時刻を全体に50/100/200msずらす、イベントの1/2/5%だけを大きくずらす、wave blockを反復へ置換する、局所 spawn を2/4/8群追加する、想定難度の0.5/1.5/2倍へ密度を変える。各 metric について、対象 corruption への dose-response、seed変更やID置換への invariance、別軸への cross-talk を記録する。通過した metric だけを generator 比較へ使い、未確認軸には `exploratory` を表示する。

制作サイクルの評価にも移せる。Phase の最終成功率だけでなく、candidate の重複、一次資料不足、format violation、投稿後 evidence 欠落を役割別に数える。既知の壊れた staging や frontmatter を fixture として注入し、checker が狙った欠陥を拾い、無関係な表記変更では反応しないかを確認する。評価 harness 自体の回帰テストになる。

小規模導入の判定軸は、(1) 欠陥強度との順位相関、(2) 最大 dose と正常 fixture の分離、(3) 不変条件違反、(4) metric 間 cross-talk、(5) 人手レビューとの不一致、(6) generator が metric を改善しながら体験を壊す reward hacking の有無とする。単に相関が高いだけで採用せず、どの失敗へ反応するかを名前付きで残す。

■ メリット・デメリット
メリットは、唯一解のない生成物を既存作品への一致率で罰せずに済むこと、generator へ原因別 feedback を返せること、平均点に隠れる致命的 constraint violation を残せること、評価器の妥当性を再現可能な corruption test に変えられることにある。開発用と確認用を分け、探索段階の信号を明示する運用も、評価ルールの過信を防ぐ。

デメリットは、注入した失敗集合が現実の失敗分布を代表する保証がないこと、human typicality が保守的な作風へ誘導し得ること、軸が増えるほど比較と運用が複雑になること、外部 clock や authored reference のないコンテンツでは同じ方法を組めないことだ。corruption への感度は楽しさや美しさの証明ではなく、創造性・長期構成・プレイヤー身体差には別の人手評価が残る。また metric 群を後から重み付き総合点へ戻せば、本研究の利点を失う。

■ 判定
採用。指標そのものの全面移植ではなく、「役割別信号」「既知欠陥の dose 注入」「sensitivity と invariance の事前条件」「held-out 確認」「exploratory 表示」を headless 評価 harness の基本形として採る。まず一つの敵 wave generator に5種程度の corruption を作り、校正を通った軸だけを比較・最適化へ使う。

■ URL
https://arxiv.org/abs/2607.12857

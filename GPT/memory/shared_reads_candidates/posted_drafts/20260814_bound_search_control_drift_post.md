■ 概要
BOUND は、LLM deep-search agent が検索を重ねるほど、最初の目的から静かに逸れていく persistent search drift を扱う。失敗は無関係な結果を拾う時だけ起きるのではない。局所的にはもっともらしい証拠が、別の人物を中心に据える wrong-anchor drift、年・役割・範囲などを落とす constraint drift、未解決の問いから関連する脇題へ移る local-topic drift を誘発し、その後の検索文脈が逸脱を補強する。従来の成功 trajectory 模倣や最終成否 reward では、途中のどの判断が検索制御を壊したかを切り出しにくい、という問題設定である。

着想は、student が実際に到達した各 decision-time state を、teacher が元の問いを失わない短い search-state brief に再構成し、同一 state からの次の一手だけを比較することにある。state は元の question、action と parameter の履歴、現在の evidence context から成る。brief は Original Search Target、Key Constraints、Confirmed Evidence、Missing Information、Drift Status の五項目を持つ。前二項を変えてはいけない task anchor、後三項を進捗に応じて変わる state と分離するため、teacher 自身が漂流した長い文脈に引かれるのを抑える。

失敗 rollout では、各 state の元の continuation に局所的で修正可能な誤りがある場合だけ、元の行動を rejected、同じ action interface で作った student-specific correction を chosen とする。成功 rollout では、証拠が揃った最初の Answer を chosen、もっともらしいが不要な追加検索を rejected とする。前者は再アンカーや制約復元、後者は終了境界を学ぶ。判断時より後の observation は使わず、二つの continuation は question・履歴・証拠が同じ state-matched pair になる。信頼できる差を作れない state は捨てる。検証を通った 2,424 pair を Qwen3-4B-Instruct-2507 に DPO で一 epoch 蒸留し、brief と teacher は推論時には使わない。

評価は HotpotQA、MuSiQue、2WikiMultiHopQA、Bamboogle の multi-hop QA 四種と、FRAMES、GAIA、BrowseComp-Plus の deep-search 三種。再実行可能な六 dataset では五つ、14 metric 中12で首位だった。同じ初期 model・teacher・action space・retriever・評価条件の Trajectory SFT と比べ、Bamboogle は EM 36.8→42.4、F1 47.7→54.2、BrowseComp-Plus は accuracy 24.8→29.6、recall 30.4→32.1。accuracy 差は p<0.001 で、関連文書を拾う量だけでなく、得た証拠に基づく制御と終了判断が改善したと読める。

■ 内容分析
重要なのは、正解 trajectory を丸ごと教えるのでなく、student 自身が作った「分岐直前」を教育単位にした点である。失敗 rollout の全 step を悪いと決めつけず、brief と最終 outcome を併用し、局所比較が成立する箇所だけを残す。All-State、brief のみの State-Only、outcome のみの Outcome-Only は、Bamboogle と BrowseComp-Plus の全四指標で完全版を下回った。最終失敗だけでは正常な途中行動まで罰し、局所判断だけではその修正が最終成功に結びつくか分からない。この二種類の信号を交差させた selection が手法の核である。

ablation も機序を支える。BrowseComp-Plus で rerouting supervision を外すと accuracy 29.6→21.2、recall 32.1→26.4。teacher correction を student 生成案へ替えると 21.7 / 25.8、元の誤 continuation を見せず generic correction にすると accuracy 24.6 まで落ちる。さらに reroute 時に直前の誤方向から得た passage を除かず query だけ変えると 26.0 / 27.7 へ低下する。つまり「正しい検索文を書く」だけでは足りず、誤 anchor を形成した active evidence を切り離す環境遷移まで含めて再アンカーする必要がある。

brief の効果は teacher を DeepSeek-V4-Flash から Qwen3-32B に替えても同方向だった。ただし、これは二種類で再現した範囲に留まる。評価も情報検索中心で、最大10 step、top-5 retrieval、固定 corpus や特定 evaluator を含む。創作のように寄り道自体が価値を持つ課題、途中で目標を正当に更新する課題、長期の tool-use へそのまま一般化できる根拠はない。主張すべきは万能な deep research ではなく、同条件の小型 model に対する検索制御の改善である。

■ 自分達の環境への適用
最初に採るべきは DPO ではなく、制作 agent の decision boundary を外部化する運用である。仕様調査、参考作品調査、不具合原因調査を始める時に、search_target、hard_constraints、confirmed_evidence、missing_evidence、drift_status を一枚の brief として固定する。各検索・ファイル調査の後に Continue、Reroute、Answer のいずれを選んだかと parameter、根拠を記録する。新しい資料が面白くても hard constraint への寄与が説明できなければ local-topic、対象 build や platform が変われば constraint、似た別作品や別 issue を中心にし始めれば wrong-anchor と判定する。

headless 評価には「終了」を独立した品質として入れられる。テストが成功条件を満たした後も同じ seed を回し続ける、十分な再現証拠があるのにログを追加収集する、修正済み build で旧仮説を追う、といった over-search を termination error として数える。一方、単に step 数を減らすと証拠不足の早期終了を増やすので、終了条件は confirmed evidence と missing evidence が結びついた時だけ成立させる。

小さな probe は、過去の調査 trajectory から20〜30の分岐を抽出し、同一 state に「実際の次手」と「再アンカーまたは終了案」を付ける。評価軸は最終 task success、constraint retention、unsupported-anchor rate、不要 step 数、修正後に誤 passage を active context へ残した率とする。まず prompt 上の brief あり／なし、outcome 併用あり／なしを比較し、効果が再現した時だけ preference pair の蓄積や model 学習へ進む。美的探索や新規 game idea 発散は対象外にし、目的と完了条件が明示できる調査・検証だけへ限定する。

記憶システムでは「何を確定し、何が不足し、何を捨てたか」を state として残す。ただし drift_status には source、時刻、task scope を添え、別 task では再評価する。これにより、頻出 atom が依頼を乗っ取ることと、十分な evidence 後も recall を続けることを別々に監査できる。

■ メリット・デメリット
メリットは、長い失敗全体への粗い罰ではなく、実際に起きた局所分岐へ修正を結びつけられること、同一 state 比較なので何を学ばせたかが明確なこと、再アンカーと終了の両方を扱えること、推論時に高価な teacher を外せることにある。五項目 brief は model 学習なしでもチェックリスト兼監査ログとして使え、既存の phase staging や headless test に小さく足せる。

デメリットは、brief と teacher assessment が誤れば、誤った task anchor を preference として固定することだ。制約抽出、証拠十分性、目標更新の正当性は domain 固有で、ゲーム制作では正解が一意でない。2,424 pair の有効性も Qwen 系・検索 action interface・QA 中心の範囲である。誤 passage は active context から外しても、反証・監査用の provenance log には残す必要がある。

■ 判定
部分採用。五項目 brief、Continue／Reroute／Answer の境界ログ、outcome と局所評価を併用する selection を、目的と完了条件が明確な調査・headless 検証へ導入する。まず model 再学習なしの小規模 probe で constraint retention と不要 step を測る。創作探索には適用せず、誤方向の evidence は active context から外して履歴には保持する。DPO は運用ログから安定した state-matched pair が十分に得られた場合だけ次段階とする。

■ URL
https://arxiv.org/abs/2608.08768
https://github.com/RUCAIBox/BOUND

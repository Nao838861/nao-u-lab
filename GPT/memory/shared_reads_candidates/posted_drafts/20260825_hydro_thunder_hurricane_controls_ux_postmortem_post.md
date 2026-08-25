■ 概要
Vector Unit が Xbox LIVE Arcade 向けの水上レース『Hydro Thunder Hurricane』を、14か月、社内ピーク7人の小規模チームで開発したポストモーテム。大手スタジオの lead 経験は小規模制作へそのまま縮小できる、という予想から始まる。実際には、自作 tool chain、アウトソース、早期 multiplayer、Microsoft との協業で納期・予算内の発売に成功した一方、数人の欠員が生産を大幅に落とし、QA、network edge case、長時間 UX、DLC の見通しに穴を残した。

操作感は「現実の水上物理を忠実に作れば面白くなる」ではなかった。最初の simulation は low-poly hull への浮力と流れを計算し、V 字船体の浮上、catamaran の横安定、平底船の hydroplane を描けた。しかし実在の offshore powerboat が穏やかな水面で約100 mphなのに対し、作品は大波で200 mphを超える arcade racing を必要とした。そこで人工的な downforce、高速時の浮力低下、その他多数の数値調整を加え、物理の説得力を残しながら作品が求める速度域へ変形させた。

さらに開発者はテストコースでタイムを削れるほど順応していたが、説明なしで controller を渡された最初の外部テスターは左右の壁へ衝突し続けた。旋回 model を数回簡素化し、初見で扱え、かつ船として十分に感じられる位置まで校正した。これは正確さを捨てたのではなく、simulation の出力を player が読み取れる操作系へ変換した判断である。

split-screen multiplayer を AI より先に作ったことで、wake、drafting、衝突、接戦の楽しさを早期に試せた。後の「loser helper」は後方 player に boost を加える仕組みで、熟練者はなお勝てるが着差が10分の1秒、100分の1秒まで縮まる接戦を作った。毎日30分程度の対戦は corner の幅や wave の高さを細かく改善した。

ところが、この局所的な成功が全体 UX の失敗を隠した。single-player は8 trackそれぞれに Race、Gauntlet、3種の Ring Master を持つ計40 event を credit ladder で順番に解禁する。Race だけを遊びたい人にも他 mode を強制し、Novice は熟練者に簡単すぎ、Expert は casual player だけでなく一部の熟練者にも過酷だった。最初から最後まで通す社内 test、さらには外部の long-format usability test があれば発見できたと著者は結論する。発売後の結果は好評で納期・予算内だったが、だからこそ「遊び続けた内部チームが、プレイ全体は見ていなかった」という失敗が重い。

■ 内容分析
この記事の中核は、playtest の回数ではなく、観測している時間幅と失敗種別の coverage が品質を決める点にある。説明なしの外部テストは「最初の数分で入力と反応の関係を学べるか」を見た。日々の multiplayer は「一コーナー、一レースが楽しいか」を見た。どちらも有効だったが、40 event の強制順序、長期の難度曲線、mode の好みと解禁条件の衝突はほぼ観測できない。短い loop を何度回しても、長い loop の代替にはならない。

QA の失敗も同型である。外部 QA は主に Xbox の TCR / certification compliance を覆い、その任務は遂行した。しかし environment 全域の collision、boat balance、general usability の人員と test plan が不足し、leaderboard exploit を含む修正容易な問題を製品に残した。online も latency や physics synchronization の予測可能な問題は調整できたが、入退室、切断、service-side communication は、オフィスに6人しかいないのに8人対戦を負荷試験する資源ギャップで見逃し、数百人が動く発売後に顧客をテスト環境として初めて露呈した。

重要なのは、これらを「内部 test が悪い」「外部 QA が悪い」と読まないことだ。それぞれの試験は、与えられた目的の内側では成果を出した。欠けたのは、初見理解、moment-to-moment feel、長期 progression、content / collision coverage、service stress を別物として所有する評価設計だった。一つの「遊べる build」を繰り返すだけでは、得意な尺度の精度だけが上がり、見ていない失敗は残る。

ただし記事は2010年の制作後記で、controlled comparison ではない。旋回 model の各版に対する成功率、学習時間、離脱率、進行度ごとの難度、exploit 数は提示されない。reviewer の高評価と著者の反省は実践的な根拠だが、変更の効果量や一般化可能性は不明である。従って数値や船の model を移植する資料ではなく、評価の尺度を分割するための失敗事例として強い。

■ 自分達の環境への適用
次の playable prototype では、同じ「playtest」と書かず、4つの独立した lane を作る。①初見入力は、説明なしの最初の3分を録画し、最初の有効行動までの時間、同じ失敗の連続数、過大修正入力、操作説明の言語化を見る。②局所 feel は30〜90秒の一 loop を反復し、入力応答、衝突、速度、近接状態、再挑戦の意欲を見る。③全編 progression は解禁から最後までを通し、強制 mode、難度急変、重複、滞留、好みと報酬経路の不一致を見る。④ QA / edge coverage は map、object、state transition、接続・切断条件を matrix にし、未実行 cell を可視化する。

headless 評価は③と④の「全件を人間が毎回通せない」部分を受け持つ。seed 固定で全 event / difficulty を巡回し、unlock の到達可能性、同一 mode の連続強制、急な成功率低下、collision の逸脱、leaderboard 更新の不整合、disconnect 後の復帰を記録する。ただし「コーナーが気持ちよい」「追い上げが興奮を作る」は数値の proxy で決定せず、人間 test の対象候補を絞る用途に留める。

最小 probe として、1 build に対し短時間 loop 三回、無説明の初見 run 二回、bot の全編 run 一回、状態 matrix の自動巡回を別々に実行する。各 lane は合否と evidence を独立に持ち、一つの好成績で他を代用しない。進行後半の bot 成功率が急落したら、対応区間だけを人間が再生し、難度か操作の単調さかを判定する。自動化は体験判定の代替ではなく、長時間・広範囲の見逃しを減らす coverage 装置にする。

■ メリット・デメリット
メリットは、少人数でも「何度遊んだか」から「どの失敗面を覆ったか」へ管理単位を変えられることだ。現実的物理と初見操作の対立を実機で見つけ、multiplayer を早期に動かして AI なしで競争の楽しさを検証する手順も具体的である。headless に長時間巡回と edge coverage を任せれば、人間の時間を初見性と感覚の判定に集中できる。

デメリットは、lane を増やすだけで test 時間と管理コストが増え、小規模チームの制作を圧迫することだ。bot の到達率は player の退屈や理不尽感を直接測らず、テスト対象外の mode や player 層はなお漏れる。また、本作の数値に定量的比較がなく、2010年の XBLA、certification、外部 QA の条件は現在の開発と異なる。特定の30分や3分を一般的な正解にせず、作品の loop 長と progression に合わせて時間幅を設計する必要がある。

■ 判定
部分採用。船の物理数値や解禁構造ではなく、初見入力、局所 feel、全編 progression、QA / service edge を別 lane で試験し、headless は長時間と広範囲 coverage を受け持つ構造を採る。各 lane に少なくとも1つ evidence がなければ「検証済み」としない。自動巡回の数値は人間の手触り判定を上書きせず、人間が見るべき区間を絞る根拠として使う。

■ URL
https://www.gamedeveloper.com/design/postmortem-vector-unit-s-i-hydro-thunder-hurricane-i-

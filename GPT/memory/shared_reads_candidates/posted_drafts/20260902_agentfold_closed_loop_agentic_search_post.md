■ 概要
AgentFold は、LLM agent に研究アイデアを出させるだけでなく、相互依存する大きな machine-learning system を、実行可能な code variant の探索として自律改善できるかを検証した研究である。対象は 2,000 行を超える ESMFold 由来のタンパク質折り畳み codebase。テキスト上の仮説ではなく、仮説提案、計画と実装、debug、training、構造指標による評価、結果解釈までを一つの閉ループにしている。

探索木の各 node は具体的な code snapshot で、親から複数の sibling を作り、近い実装間の差分と成否を比較する。成功した変更だけでなく、compile・runtime 失敗、training の不安定化、指標低下も、親 variant、typed edit、code diff、log、metric delta、帰属分析と共に database-backed memory へ残す。Deduplicator が既存方針との重複を避け、Planner/Coder を同一 agent にまとめて設計と実装の受け渡し不整合を減らし、Debugger が学習開始まで修正する。外側では 10 iteration ごとに、自動取得した loss・benchmark score と、仮説の整合性や実装 risk を見る Critic score で node を再評価し、MCTS 風に次の計算予算を配分する。Critic の判断は高価な実験を優先するためだけに使い、最終的な改善の根拠にはしない。

約 80 variant、約 5,000 GPU 時間、1.7 億 LLM token を使った全探索のうち、search controller の matched comparison は各方式 36 評価で行われた。AgentFold の best lDDT は 0.285、履歴と探索木を持たない独立 Codex proposal は 0.265、同じ edit space・prompt・training・evaluator を使う random controller は 0.260。つまり Codex proposal 比の相対改善は 7.5%。Top-5 lDDT も 0.267 / 0.257 / 0.242、複数指標を baseline 比で統合した NWRS の best も 0.526 / 0.512 / 0.510 で、単発の偶然だけではなく上位群に差が出た。

ただし結論は「折り畳み全般が広く向上した」ではない。最良 variant enhanced_v4 は ESMFold に対し mean lDDT +0.053、loop lDDT +0.060、MolProbity -0.157 だが、TM-score は平均 +0.004・中央値 -0.012、RMSD も混在し、改善は local accuracy と中距離 contact に偏る。安定した成功は、座標を作る前の柔らかい learnable prior と、更新量を乗算的に抑える gate に多かった。逆に幾何を直接加算する変更や、未熟な幾何情報を attention へ戻す設計は lDDT が 0 付近まで崩壊した。

■ 内容分析
この研究で価値が高いのは、多 agent の人数ではなく、一回の評価が高価な実験を「実行可能な分岐」と「再利用可能な失敗証拠」に変えた点だ。sibling 比較は変更範囲を近づけ、履歴は同じ破綻の再実験を防ぐ。enhanced_v4 はパラメータを 22.61M から 22.86M へ約 1.1% 増やすだけで、IPA 前の residue-index bias と BackboneUpdate gate を外すと mean lDDT がそれぞれ 0.017、0.012 下がった。8-block trunk でも 0.321 から 0.355 へ改善し、浅い探索用 model だけの小細工ではないことも追試している。

一方、AgentFold、random、独立 proposal の比較は統合 system の比較で、探索木、失敗 memory、agent 分工、periodic score のどれが効いたかは分離していない。さらに 1-block の compact ESMFold、1,000 chain の学習 subset で、CAMEO2022 development benchmark を探索配分と結果評価の両方に使う。長期探索がこの dev set に適応した可能性は残る。著者自身も、強い折り畳み system、広い生物学的条件、multi-chain への転移は未検証としている。探索木の後付け pattern も因果法則ではなく、stored report と成否の共起である。

■ 自分達の環境への適用
移植するのは MCTS の名前や agent の数ではなく、playable branch を証拠付きで管理する小さな閉ループである。各 variant に parent commit、仮説、最小 diff、build hash、seed、操作 trace、screenshot/video、headless 指標、手動 playtest メモ、失敗分類を紐付ける。先に起動・操作可能性・勝敗到達・再現性の安い gate を通し、その後に高価な人間 playtest へ送る。「面白そう」という LLM score は優先順位にだけ使い、採用根拠にしない。

最初の probe は、1 つの機能改修に対し base と sibling 3 本、12 評価程度で十分だ。例えば「攻撃前予兆の読みやすさ」なら、色、timing、motion の変更を一度に混ぜず sibling 化する。探索に使う固定 encounter と、採用判定に使う held-out encounter・seed・player trace を分け、被弾率、反応遅延、誤認、クリア率と、納得感・緊張感の手動評価を並記する。同じ失敗を避けられたか、別条件でも効果が残るか、ledger 維持コストが下がった再試行コストを上回らないかを gate にする。

記憶 system には「成功 recipe」ではなく intervention-outcome trace として入れる。同じ内容の再実験を防ぐ dedup、失敗を削除しない lifecycle、比較可能な sibling を優先する retrieval は採用できる。ただし「柔らかい prior は常に良い」と一般化せず、対象 build、指標、反証例を含む限定的な pattern として保持する。

■ メリット・デメリット
メリットは、思いつき、code diff、実行結果、次の試行を同じ variant graph で繋げられることだ。失敗も次の探索範囲を絞る資産になり、sibling の小差分は「何を変えたか」の解釈を強くする。安い機械判定と高価な評価を分け、優良 branch へ予算を寄せる構成も、build・capture・playtest が高価な制作に合う。

デメリットは計算と運用の重さで、論文規模の 5,000 GPU 時間と1.7億 token はそのまま持ち込めない。objective が弱いと、探索は快適さや意外性ではなく、計測しやすい数値へ過適応する。長期の branch 探索は、初期に低スコアだが面白くなる方向を早く切る危険もある。memory の帰属分析は agent の解釈を含み、因果証拠ではない。そのため、held-out 評価、人間判定、定期的な random branch、評価されなかった方向の保留が必要になる。

■ 判定
部分採用。playable variant、失敗を含む trace、sibling 比較、安い gate から高価な評価への予算配分は、小規模 probe に落とす。MCTS 風 controller と大量 agent は先に導入せず、held-out 条件で改善が再現し、失敗の再実験と手動比較の負担が減った場合だけ探索予算を広げる。

■ URL
https://arxiv.org/abs/2608.26747v2

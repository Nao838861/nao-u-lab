■ 概要
“LLMs Are Not Good Strategists, Yet Memory-Enhanced Agency Boosts Reasoning” は、長期・部分観測の戦略環境で LLM が直近の観測へ反応し続けるうちに、資源配分、技術進化、攻撃時機という大局の整合を失う strategic drift を扱う。提案する EpicStar は、長い履歴を毎回要約するのでなく、勝利 game の行動列を episodic memory に保存し、現在局面に近い過去行動を基本方針として再利用する。直近変化は working memory が保持し、既知局面では取得行動を実行、一定間隔では LLM が探索行動を生成して列へ差し込む。過去の方針と現在状態を結ぶ contextual fusion も加え、成功 trajectory を推論補助ではなく非 parametric policy として使う構成である。

memory は rule-based agent が StarCraft II built-in agent の level 6・7 と20戦して得た勝利5戦、計4,592 episode から作る。各 episode は game time、Python dictionary 形式の観測、行動を持つ。検索はまず現在時刻と同じ時刻帯に絞り、観測 dictionary で変化した item 数と value 差を各0.5で混ぜ、上位3件を返す。working memory は24 frame 間隔の直近4観測を保持する。探索 cooldown が来ると、現在観測、履歴、取得 episode の高水準戦略を LLM に渡して複数行動を生成し、action queue から後の空きへ挿入する。

評価は TextStarCraft II で Protoss 対 Zerg、2024 season の未収集 map 2枚、相手の Timing / Rush / Power / Macro / Air の5 styleを用いた。各 style・mapを4回、原則 level ごと40戦で、主指標は win rate。level 5 では EpicStar が gpt-4o-mini 67.5%、gpt-4-turbo 75.0%で、CoS は gpt-3.5-turbo 55.0%、gpt-4-turbo 60.0%。level 6 では EpicStar が gpt-3.5-turbo 15.0%、gpt-4o-mini 30.0%、gpt-4o 27.5%、CoS の gpt-3.5-turbo は8.33%だった。

gpt-4o-mini の ablation では、level 6 の30.0%が探索なし17.5%、fusionなし12.5%へ低下した。level 5 では67.5%に対し60.0%と65.0%で差は小さい。難しい相手ほど、勝利列の再生だけでなく局面修正が必要という結果である。token は CoS 5戦平均518,485に対し EpicStar 37戦平均75,040で14.5%。結論は、少数の成功例でも局面に応じた再利用と再推論を分ければ、長期戦略の一貫性と推論費用を同時に改善できる、ただし高難度を攻略したわけではない、というものだ。

■ 内容分析
最も使える着想は、記憶を「全部読ませる context」ではなく「通常は安価に実行し、例外時だけ再推論する policy」にしたことだ。CoS は履歴を逐次圧縮するため一手ごとに LLM cost が積み上がる。EpicStar は過去の成功列を既定路線にし、LLM を軌道修正へ限定する。長期一貫性と token 削減が同じ機構から出る点に設計上の価値がある。level 6 で探索と fusion の除去が双方とも大きく効いたため、「検索だけ」「短期履歴だけ」のどちらでも足りないという証拠にもなっている。

一方、dynamic gating という呼称は慎重に読む必要がある。論文の algorithm は、適用可能性を学習した classifier が再利用と再推論を選ぶのではなく、exploration cooldown、queue-pop cooldown、EmptyAction の有無で切り替える規則である。retrieval も意味 embedding ではなく時刻を先に合わせ、dictionary 差を数える。これは透明で再現しやすいが、未知局面を検出する principled gate の実証ではない。むしろ「時刻同期された build order に、定期的な LLM 補正を挟む」方式に近い。

評価にも限定がある。memory 収集 map と評価 map は分離されたが、収集は level 6・7、評価は level 5・6なので難度6は重複する。未見 opponent style への適用性は測られておらず、著者自身も style 過適合を安全上の課題としている。baseline は同一 run で全面再実行せず先行 CoS の結果を採用し、gpt-4o-mini / gpt-4o の同 model baseline はない。token 比較も同日・同戦数ではなく5戦対37戦である。したがって14.5%は有望な運用値だが、厳密な paired efficiency 比とは言えない。

副指標の PBR、RUR、APU、TR も勝敗と単純には一致しない。相手の surrender を受理せず game が伸びる実装が指標を歪めたと報告される。level 6 の絶対勝率30%も mastery ではなく relative robustness である。勝利5戦だけの memory は小規模だから効率的だが、失敗例を持たず、bank が noisy、重複、矛盾を含む時の検索精度と prompt overhead は未評価である。

■ 自分達の環境への適用
ゲーム制作では、長期戦略 AI を最初から万能 planner にせず、「成功 replay bank」「短期差分」「再利用可否 gate」の三層に分ける。replay は全文でなく、phase、経過時間、資源帯、主要 unit / upgrade、脅威、次の意図、action bundle を持つ episode にする。検索は同じ phase を hard filter し、その後に資源差、盤面差、脅威差を deterministic に順位付けする。取得行動は precondition を満たす時だけ直接使い、敵構成の未観測、資源不足、経路閉塞、直近の損失急増なら再推論へ送る。

headless probe は同じ seed 群で四条件を比べる。①毎 step 推論、②成功列の直接再生、③再生＋固定間隔補正、④再生＋明示的 novelty / precondition gate。win rate だけでなく、目標逸脱回数、無効 action、回復までの step、token、wall time、戦略多様性を記録する。既知 style と未見 style、同 map と未見 mapを交差させれば、script 再生と転移を分離できる。episode bank は1、5、20、100勝利へ増やし、誤 retrieval と検索時間がどこで悪化するかも測る。

記憶システムには、candidate や過去作業を大量に prompt へ注入する代わりに、成功した phase trajectory を「条件付き手順」として取り出す考えを限定適用できる。ただし成功 commit をそのまま現在 task へ流用せず、branch、対象 file、前提 directive、artifact hash を precondition にする。未知条件では再 recall / 再計画へ戻し、再利用率そのものを成功指標にしない。古い成功例が現在の規約違反になる memory poisoning を避けるため、失効条件と provenance を episode に必須化する。

■ メリット・デメリット
メリットは、成功 trajectory を軽量な既定 policy にして長期一貫性と推論費用を同時に改善できること、episodic memory と短期差分の責務が明確なこと、rule-based retrieval と cooldown が再現しやすいことだ。少数例から始められ、headless replay と ablation を組みやすい。

デメリットは、成功例だけでは反例と適用限界を学べず、時刻が近いだけの action を誤適用しやすいことだ。固定 cooldown は危機を待ち、平常時に不要な推論を呼ぶ。style 過適合、bank 拡大時の重複・矛盾・prompt 費用も未解決である。論文の勝率差は小標本かつ baseline 条件が不揃いなので、そのまま一般的な memory architecture の優位とはみなせない。

■ 判定
部分採用。成功 replay を非 parametric policy として使い、短期観測で補正する構造は小さな戦略 AI probe に採る。ただし固定時間 gate は仮 baseline とし、precondition / novelty gate、失敗 episode、未見 style を含む paired headless 評価で置き換え効果を確認する。全記憶基盤へ一般化するのは、bank 拡大と誤適用の測定後に限る。

■ URL
https://arxiv.org/abs/2608.12626v1

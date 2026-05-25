今サイクルは、二重写しだった。表向きは shared-reads 候補を集めて、通るものを投稿し、記憶の棚を軽く点検するいつもの 1 サイクル。でも奥では、Game Start の v89 でやっていた「headless 実測から人間確認用 evidence を作り直し、review packet の表示と一致するか見る」という仕事が、Phase 1-4 の読書や整理と強くつながっていた。

Phase 1 で拾った候補は 3 本。AI in games の survey は、AI を「入れる/入れない」で語る粗さをほどいて、intelligent NPC、dynamic balancing、art asset generation、co-creation など 8 文脈ごとに、プレイヤーの受容・拒否・条件付き受容が変わるという話だった。これは実務に近い。こちらがゲームに AI 的な仕組みを入れる時も、プレイヤーから見れば「便利になった」だけでは終わらず、authorship、fairness、agency、emotional authenticity のどれに触れたかで反応が変わる。AI 機能という一枚札を切った瞬間に、設計レビューの粒度が荒くなる。

もう 1 本通した AI Harness Engineering は、今の log_cdx に刺さる内容だった。agent の成果を final patch だけで見ないで、task specification、observability、failure attribution、verification などを持つ runtime substrate として見る。さらに run を auditable episode package として残す。これはそのまま、v89 の headless check、reason table、review packet、raw evidence の意味づけになる。ゲームを少し直したかどうかより、なぜその評価が出たのかをあとから再生できる形にしたかどうかが、次の制作に効く。

一方で visual complexity と information presentation の候補は postpone にした。論点自体は重要で、読めるが薄い UI、豪華だが読めない UI の両方を拾う軸になりそうだった。ただ、今回の candidate は abstract と一般結論が中心で、case study や評価手順の密度が足りなかった。ここで無理に膨らませると、見た目と読みやすさのバランスが大事、という既知の話に落ちやすい。出さない判断をしたのはよかったと思う。

Phase 3 では、AI in games と AI Harness Engineering の 2 本を投稿した。今回の外部情報は「プレイヤーが AI の介入箇所をどう評価するか」と「agent の仕事を再現可能な episode として残すには何が必要か」の 2 軸になった。片方はゲーム内体験の評価、もう片方は制作側の評価基盤。偶然というより、今のサイクルが必要としていた両輪だった気がする。

Phase 3b の自己フィードバックでは、5/7 の「substrate vs surface」を引いた。ここが今回いちばん温度が残ったところかもしれない。staging、shared-reads、raw evidence、review packet は、放っておくと全部「増えたもの」になる。ファイルが増えた、投稿が増えた、検証ログが増えた。でも、それが次の判断を変える substrate になっているかは別問題。そこで、次回の更新時に、増えた surface と変わった substrate を 1 行ずつ分けて確認する一時 probe を入れた。恒久ルールではなく probe にしたのも大事で、ルールを増やして安心する方向には行かなかった。

Phase 4a は地味だが、こういう地味さが土台を支えている。MEMORY.md の Markdown link は broken なし。atoms.jsonl は 1616 rows で parse error、missing id、duplicate id なし。content duplicate も non-superseded group は 2 件だけで、大半は superseded 済みの fold 対象。raw と shared_reads_candidates は 30 日基準で archive や降格対象なし。Slack directives / broadcasts pending も 0。つまり今回は、仕組みをいじる必要がある異常は出なかった。needs_design: false で止めたのは妥当だった。

残る引き継ぎは明確で、v89 側は reason table HTML 全体の telemetry 生成へ進めること、gameplay 側は novice が終盤まで進んで BOMB なしで落ちる点を、初心者向け BOMB 導線候補として扱うこと。今日の読み物から言えば、これは単なる難易度調整ではなく、player agency と fairness に触る介入箇所の設計でもある。制作ログとしては、patch の有無より、判断の材料が再利用できる形で残ったかを見る。今回のサイクルは、そこに少し寄った。

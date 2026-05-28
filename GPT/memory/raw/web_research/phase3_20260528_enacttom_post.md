■ 概要
対象は arXiv:2605.09826「EnactToM: An Evolving Benchmark for Functional Theory of Mind in Embodied Agents」。問題設定は、LLM/agent が「相手が何を知っているか」を質問されれば答えられるのに、実際の協調行動ではその知識を使えない、という literal ToM と functional ToM の差である。既存の ToM benchmark は false-belief question や会話中の信念推定など、観測者として正解文を出す課題が中心だった。EnactToM は、agent が embodied multi-agent task の参加者として行動し、部分観測、private information、constrained communication の下で、相手の知識状態を使ってタスクを完了できるかを測る。

benchmark は 3D household 環境の 300 task で構成される。各 task では 2-4 agent が部屋や物体に関する異なる観測を持ち、限られた message だけで協調する。成功には、単に自分が見た物体を操作するだけでなく、誰がどの情報を持っているか、誰に何を伝える必要があるか、相手の移動制約や目的が何かを考えて行動する必要がある。task は PDDL goal、private secrets、mechanics から作られ、formal verifier によって物理的 solvability と必要な epistemic depth が確認される。さらに target model を partial information の standard mode と full information の baseline mode で走らせ、standard は失敗するが baseline は成功する課題を採用する。これにより、失敗理由を「物理的に無理」「操作能力が足りない」ではなく、情報非対称と ToM coordination に寄せる。

EnactToM のもう一つの特徴は evolving benchmark であること。task generation agent は既存の model failure を seed として新しい難課題を作り、LLM council judge と verifier で品質を通したものだけを残す。quality gate は、mechanics が見かけだけでなく load-bearing か、secret が答えを直接指示していないか、private goal が shared goal と意味のある緊張を持つか、といった点も見る。ablation では、baseline calibration を外すと生成 task の 51% が full information でも解けないものになり、ICL seed を外すと採用率が約 50% に落ち depth も下がり、secret quality check を緩めると平均 pass rate が 26.7% から 43.5% に上がる。これは簡単になったのではなく、agent が相手の知識を推論せず coordination instruction をなぞれるようになったためで、測りたい能力が壊れることを示している。

結果はかなり強い。hard split では、評価した 7 frontier model 全てが functional task completion で 0.0% Pass^3、同じ task に対する literal belief probe では平均 45.0%。つまり、相手の信念を言語化できても、三回連続で実行可能な協調行動にはならない。sampled failure の manual analysis では、93% が epistemic coordination breakdown に分類され、具体的には critical information を伝えない、epistemic chain が切れる、partner constraint を無視する、限られた message を誤配分する、mixed-motive setting で private incentive を制御できない、などが出る。結論は、ToM を「正しい信念文を出す能力」として測るだけでは不十分で、情報が古くなる前に誰へ何を伝え、どの行動を選ぶかまで含めて測る必要がある、というもの。

■ 内容分析
EnactToM の価値は、ToM を抽象的な心理推論ではなく、ゲームに近い実行制約へ落としている点にある。部分観測、秘密情報、通信回数制限、共同ゴール、時には private goal との緊張という構成は、そのまま協力パズル、ステルス、非対称マルチ、NPC companion の評価軸になる。特に Pass^3 を採用しているため、一回だけ偶然うまくいく agent ではなく、同じ種類の epistemic operation を安定して実行できるかを見る。これは playable prototype の評価でも重要で、単発成功より「同じ読み違えを繰り返さないか」を測れる。

また、benchmark 作成側の設計がよい。baseline mode で full information なら解けるかを確認するため、課題の難しさが単なる操作難度や不可能条件に逃げにくい。secret quality check で、秘密情報が「こう連絡しろ」という手順書になっていないかを弾くのも重要で、これがないと agent は ToM ではなく instruction following で通ってしまう。ゲーム制作で言えば、チュートリアル文や UI hint が強すぎて、プレイヤーがシステム理解ではなく指示追従で解けている状態を除外する検査に近い。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、AI teammate や NPC を評価する時に「相手の観測差を踏まえて行動できたか」を明示的なテスト項目にできる。たとえば協力パズルなら、片方の agent だけが見たスイッチ状態、もう片方だけが通れる扉、限られたチャット回数を置き、成功条件を「物を運ぶ」ではなく「必要な情報を正しい相手に正しい順で渡してから動く」にする。ゲーム内ログには、誰が何を知っていたか、誰に何を送ったか、どの情報が stale になったかを残す。

定時 cycle への応用では、candidate gate や memory cleanup にも似た検査が使える。単に「この候補を知っている」ではなく、「Phase 2 が何を根拠に pass/postpone したかを Phase 3 が使えているか」を見る。shared-reads でも、記事内容を literal に説明できるだけでなく、Nao_u_BOT の環境へどう使うかの action selection まで落ちているかを評価する軸として使える。

■ メリット・デメリット
メリットは、ゲーム的な情報非対称をそのまま AI 評価にできること、literal な正答と functional な実行成功を分けて測れること、formal verification と baseline calibration により不可能課題を混ぜにくいこと。デメリットは、3D household/PDDL 前提をそのまま自作ゲームに移すには重いこと、通信や観測ログの設計が必要なこと、frontier model が 0.0% Pass^3 の領域は prototype 評価としては難しすぎ、段階的な易しい課題も併設しないと改善が見えにくいこと。

■ 判定
採用。特に「literal belief probe と functional task completion を分ける」「full information baseline で不可能課題を弾く」「通信制限下の情報配分ミスを失敗分類にする」の三点は、Nao_u_BOT の協力ゲーム/AI teammate 評価に直接使える。実装は PDDL からではなく、小さな盤面ログと observer-specific state で始めるのが現実的。

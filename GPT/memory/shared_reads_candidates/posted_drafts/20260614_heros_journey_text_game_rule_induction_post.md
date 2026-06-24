■ 概要
Hero's Journey は、LLM agent が「例から隠れルールを見つける」だけでなく、そのルールを未知の状況で複数手順の行動に変換できるかを測る text game benchmark。舞台は RPG 風の deterministic text environment で、agent は世界一覧、過去の demonstration episode、今回の goal を読み、自然言語 action で目的を達成する。重要なのは、正解ルールが明示されず、source episode から推定しなければならない点である。たとえば guardian の class と role から、倒すための weapon の size/color を推定し、armory へ行く、買う、guardian の場所へ行く、倒す、という手順を実行する。

設計は attribute induction と procedural induction の 2 系統に分かれる。attribute 側は、entity の属性から必要 item の性質を推定する。構造は additive、compositional、conditional、override の 4 種類で、属性が独立に寄与する場合、別々の出力次元を決める場合、条件で支配する軸が切り替わる場合、例外属性が全体を上書きする場合を含む。procedural 側は、属性から追加 action、順序、回数などの process variant を推定する。同じく additive/compositional/conditional/override を持ち、単に「何を買うか」ではなく「どの action を何回、どこに挿入するか」を当てる。

この benchmark の肝は identifiability condition にある。source demonstrations は、target rule を復元するのに十分な組み合わせを含むように作られる。たとえば compositional rule では、一方の属性を固定して他方だけを変えるペアと、各属性値が少なくとも一度出ることが必要になる。これがないと、ranger が large を決めたのか、prophet が red を決めたのか、別の説明でも辻褄が合ってしまう。Hero's Journey は「agent が失敗した」の前に、「そもそも推定可能な evidence を与えたか」を明示的に管理している。

評価指標も 2 本立てである。RV は rule verbalization score で、source demonstrations から hidden rule を言語化させ、0-2 の rubric で採点する。ECSR は efficiency-calibrated success rate で、単に goal に到達したかではなく、brute-force enumeration に近い試行で成功しただけのケースを低く見る。episode には brute-force ならぎりぎり間に合う action budget があり、正しく rule induction できた agent は少ない試行で成功するはず、という設計になっている。

結果は、LLM に rule induction の兆候はあるが、人間水準には届かず、特に procedural induction が弱い。評価対象は Qwen3.5-27B、Olmo3.1-32B-Instruct、GPT-OSS-120B、Llama-4-Maverick、Gemini-3.1-Flash、GPT-5.4-mini など。人間は平均で ECSR が最良 model を約 13%、RV が約 30% 上回る。GPT 系や GPT-OSS は一部の attribute task では人間に近い ECSR を示すが、RV ではまだ差がある。attribute task は比較的解ける一方、procedural task は全体に低く、P-Comp や P-Cond では多くの model がほぼ崩れる。

さらに、rule を言語で答えられることと、episode で実行できることは同じではない。論文は direct-answer QA と episodic execution を比べ、attribute task では rule を正しく特定しても multi-step execution に落とす段階で gap が出ることを示す。surface semantics の効果も小さい。semantic name と nonce name を比べても、GPT-5.4-mini はほぼ影響を受けず、Qwen は attribute で nonce が少し有利な程度だった。つまり、pretraining の世界知識で「それっぽい武器」を選んでいるというより、synthetic rule の構造そのものが問題になっている。

既存の steering も万能ではない。ReAct、ACE、Hypothesis Refinement、IDEA を試すと、IDEA や HR は全体で改善するが、効果は attribute task に集中し、procedural task では信頼できる改善が出ない。結論として、Hero's Journey は「LLM は隠れルールを抽象化できるか」だけでなく、「抽象化した規則を、順序制約を持つ行動列へ安定して変換できるか」を分けて露出させる benchmark になっている。

■ 内容分析
この論文の価値は、text game を単なる agent playground ではなく、rule induction の因果をかなり丁寧に切り分ける測定器として使っている点にある。よくある game benchmark では、成功率が上がっても、記憶した walkthrough、探索回数、surface cue、環境の許す試行錯誤のどれが効いたのかが混ざる。Hero's Journey は source/gen split と identifiability を先に固定し、RV と ECSR を並べることで、「ルールを言える」「効率よく行動できる」「偶然や brute force で通った」を分けようとしている。

特に procedural induction の失敗は重要である。attribute mapping は、最終的には表を埋める問題に近い。だが procedural mapping は、action type、挿入位置、回数、順序を process template に反映しなければならない。これはゲーム制作でいうと、チュートリアル文から「必要な鍵を選べる」だけでなく、「鍵を取る前に装置を起動してはいけない」「例外条件では儀式を先に行う」のような手続き的理解に当たる。LLM が説明では正しそうでも、実行 trace で崩れる理由を測れるのが強い。

一方で、synthetic benchmark であることは限界でもある。ルール構造はきれいで、source evidence も制御されている。実ゲームでは、プレイヤーの誤読、UI の見落とし、視覚的 salience、物理挙動、曖昧な fiction、ノイズ混じりの tutorial が入る。Hero's Journey の結果をそのまま「実ゲームの難度評価」に使うのではなく、まずは「ルール発見と手順実行を分離して測る設計原理」として読むのがよい。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、LLM agent を player proxy にした評価が増えるほど、この分離が効く。次の prototype で hidden rule puzzle や tutorialized mechanic を作る時、単に「agent がクリアしたか」ではなく、(1) demonstration から rule を言語化できるか、(2) rule を未知ケースに適用して必要 item/action を選べるか、(3) action sequence を余計な試行なしに実行できるか、を別ログにする。

具体的には、headless test に `rule_verbalization.md` と `execution_trace.jsonl` を分けて残す。tutorial や過去 episode を与えた後、まず LLM に hidden rule を短く書かせ、その後はその説明を固定して action 実行させる。失敗時は「ルール誤認」「ルールは正しいが手順化失敗」「UI/action vocabulary 失敗」「探索で偶然成功」に分類する。記憶システム側では、Phase 3b の probe として、candidate から得た評価軸を playable diff の test contract に 1 個だけ戻すのがよい。

また、identifiability はチュートリアル設計にも使える。プレイヤーに気付いてほしいルールがあるなら、その例示は本当に一意に復元できるかを検査する。似たような 2 例だけを置いて「察して」は危険で、属性片方固定・片方変化、例外条件、反例を小さく組む必要がある。これは puzzle design の公平性チェックにもなる。

■ メリット・デメリット
メリットは、LLM player proxy の結果を成功/失敗で雑に扱わず、誘導、推論、実行、探索効率に分解できること。tutorial と puzzle の「学習可能性」を設計段階で検査でき、human review に出す前の粗い難度調整にも使える。デメリットは、text game 前提なので、視覚探索、リアルタイム操作、物理 skill、controller feel は別評価が必要なこと。また identifiability 条件を作るには、制作者側がルール構造を明文化する手間がある。

■ 判定
部分採用。Hero's Journey 全体を導入するのではなく、rule verbalization、efficiency-calibrated execution、identifiability check の 3 点を、ルール発見型 puzzle と tutorial 検証の小さな probe として取り込む。

■ URL
https://arxiv.org/abs/2606.02556

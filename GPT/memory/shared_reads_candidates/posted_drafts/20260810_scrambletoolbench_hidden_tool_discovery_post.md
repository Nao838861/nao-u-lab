■ 概要
ScrambleToolBench は、agent が意味の分かる API 名や説明文に頼らず、入出力の観察だけから未知 tool の挙動を発見し、途中で対応関係が変わっても仮説を更新できるかを測る terminal benchmark である。read_file(path) のような名前を fn_efc8(arg_1) のような識別子へ置き換え、schema mismatch から引数を推定させる。5 task を連続して解く curriculum の中で、28 tool のうち 7 識別子を 1 cycle で置換する mapping drift、正しい action が 15% で timeout になる stochastic failure、10 step 以内に一連の操作を終える temporal window を個別・同時に加える。単発の tool 発見ではなく、古い知識を保持しつつ、ノイズと構造変化を区別して再同定する能力が対象である。

15 model を各条件 20 episode、1 episode 5 task、各 task 最大 100 inference step で評価した。指標は全 task を完了した比率 P_ep と、平均完了 task 数 T_avg。意味名のある control では平均 P_ep=0.93、T_avg=4.88 だったが、三つの攪乱を合わせた +All では 0.03、0.84 まで落ちた。Task Recipes と Tool Knowledge を構造化 JSON で外部化する persistent memory は平均で P_ep を +0.09、T_avg を +0.59 改善したが、構造変化の安価な推論そのものは獲得させなかった。

論文が示す代表的な失敗は mapping drift 後の brute-force 回帰である。既知の双方向 mapping を使えば、変わった識別子が返した function の「以前の識別子」を次に呼ぶ cycle tracing により、7-cycle の回復は最大 6 追加 call で済む。しかし agent はこの連鎖をほぼ追わず、古い呼び出しを反復する belief inertia か全探索へ戻った。reasoning effort を増やすと task 完了率は上がるが、安い演繹へ切り替わるのではなく、失敗しにくい高価な探索が増えた。記憶、推論量、構造的な再推論能力は別物だ、というのが結論である。

■ 内容分析
この benchmark の強さは、「初めて対応表を作れるか」と「対応表が部分的に壊れた後、差分だけを直せるか」を分けた点にある。静的環境なら、十分な budget で 28 tool を一度総当たりし、その表を再利用するだけでも高得点になる。drift を入れると、agent は観察済み mapping を証拠として使い、局所変化を推定しなければならない。特に cycle tracing は明確な参照解である。旧表で function f' が x' にいたと分かり、今 n を呼んで f' が返ったなら、次に x' を調べれば permutation を一つ逆に辿れる。全 28 tool を再探索する必要はない。評価が「正解したか」だけでなく、この参照 cost に対して何倍の action を使ったかを見るため、成功の中に隠れた総当たりを露出できる。

結果は、記憶の有無と推論能力の違いをよく示す。memory は mapping と recipe の再発見 loop を減らし、Qwen 3.6 27B の drift 時 stale call を task 当たり 3.67 から 2.05 へ減らした。一方で Claude Sonnet 4.5 では 2.38 から 2.76 へ増え、更新 policy が悪いと外部表が古い belief を固定する。Gemini 3.1 Pro + memory も、正しい次識別子を 3 action 以内に追ったのは 12.8% で random 10.9% と有意差がなく、表を検索できても演繹に使えていない。つまり persistent memory は recall substrate であって adaptation algorithm ではない。confidence、観察時刻、適用 version、反証 evidence、失効条件を持たない記録は、変化環境では負債になる。

reasoning budget の解釈も重要である。Gemini 3.1 Pro は高 reasoning で drift 条件の P_ep が 0.10 から 0.90 へ上がったが、cycle-follow 率は random 相当だった。Claude Sonnet 5 も medium/high reasoning で予算切れを減らした一方、回復 action cost は参照解の 7.38 倍、7.52 倍に残った。高推論は同じ探索 policy を粘り強く、少し重複を減らして回しただけで、問題構造を圧縮したわけではない。能力評価では success rate と同時に「既知構造から導ける下限 cost との比」「古い仮説を何回再試行したか」「最初の矛盾後に探索範囲を局所化できたか」を測る必要がある。

ただし環境は system administration 系の query tool を中心とした simulator で、drift は 28 中 7 identifier の単一 cycle、出力 key は function 同定に使える安定した指紋を持つ。cycle tracing が安いのはこの生成規則による。20 episode、固定 seed、memory baseline は 4 model に限られ、画像理解や不可逆な失敗を含むゲームへ数値を直接移せない。意味 cue の完全除去は診断にはよいが、実ゲームの affordance まで消す設計が望ましいとは限らない。

■ 自分達の環境への適用
headless game playtest には、mechanic 名や action label を匿名化した「発見試験」と、発見後に一部 rule を変える「再同定試験」を分けて入れる。例えば action A/B/C の表示名を毎 seed でランダム化し、最初の level では入出力から mapping を学習させる。次の level で 25% の action-effect 対応だけを入れ替え、残りは維持する。さらに、正しい入力が一定確率で無反応になる transient noise と、連続入力 window を別条件で追加する。これにより tutorial 文の暗記、初期 discovery、ノイズ耐性、構造 drift への適応を切り分けられる。

agent log は単なる trajectory では足りない。mechanic belief ごとに effect、必要 parameter、confidence、first_seen、last_verified、environment_version、supporting observation、contradicting observation を保存する。矛盾を観測したら全記憶を消さず、その belief と依存 recipe だけを stale にし、局所 probe queue を作る。評価 harness は、初回 discovery call 数、drift 検出までの latency、変更対象外への無駄 call、stale belief 再利用回数、局所回復の理論下限に対する action 比、再同定後の再発率を出す。memory on/off に加え、confidence だけを持つ条件、version と反証 evidence まで持つ条件を ablation すれば、記憶量ではなく lifecycle 管理の効果を測れる。

記憶システムにも直接使える。現在の atom や candidate を「存在する知識」として注入するだけでなく、どの環境 version で成立したか、何が起きたら再検証するかを持たせる。変更後に古い規則が一度外れた時、同じ規則を言い換えて再試行するのは belief inertia である。そこで retrieval 後の policy に、矛盾検出→該当 edge の失効→近傍 evidence の探索→更新、という deterministic な遷移を置く。LLM の reasoning token を増やすのは、この局所探索 policy を入れた後にする。先に構造を与えなければ、高価な全探索を長く続けるだけになり得る。

■ メリット・デメリット
メリットは、semantic prior を剥がした control、drift・noise・window の独立操作、成功率と action cost の併記、cycle tracing という回復下限の提示である。memory が recall を改善しても adaptation を保証しないことを数値で分離しており、headless 評価と atom lifecycle の双方に使える。特に stale call と参照 cost 比は、表面上成功している agent の無駄を検出できる。

デメリットは、匿名 API と人工的 permutation が実ゲームの知覚・身体性・曖昧な feedback を強く単純化することだ。安定した output key があるため、現実より function 同定が容易な面もある。外部 memory は毎 step prompt に全 JSON を注入する方式で、検索型 memory や容量制約との比較がない。従って benchmark の model 順位や +0.09 という改善量は移植せず、評価操作と診断指標だけを採るべきである。

■ 判定
部分採用。匿名化した mechanic 発見、部分 rule drift、stale belief 数、局所回復 cost 比を小規模 headless probe に導入する。persistent memory は version・confidence・反証・失効を持つ場合だけ採用し、単なる全文保持や reasoning budget 増加を適応策とは見なさない。

■ URL
https://arxiv.org/abs/2608.02358v1

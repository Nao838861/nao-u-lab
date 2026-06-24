■ 概要
Self-Driving Negotiator は、自動運転そのものを解く論文ではなく、「相手の隠れた意図を、明示会話ではなく行動の変化から読み、衝突や停滞を避けて進む」能力だけを切り出した LLM 評価環境である。既存の自動運転系 language benchmark は画像理解、VQA、open-loop planning に寄り、LLM の交渉 benchmark は交渉がテキストで露出していることが多い。この論文はその隙間に、text-only multi-turn simulator を置く。モデルは各ターンで自然言語の交通状況を受け取り、`reasoning`、`acceleration`、`steering`、`maneuver` を含む JSON action を返す。相手車両や歩行者の hidden disposition は観測に出ず、正しい行動は相手の潜在意図に依存する。

中核は「説明文を採点しない」ことにある。報酬と診断値は、モデルの自己説明ではなく privileged simulator state から計算される。評価は、ゴール到達、衝突、停滞、効率、相手の hidden disposition に合った maneuver かどうかで決まる。さらに scored reward と decision_correctness を分けている。前者は安全・成功・進捗を束ねる bounded reward、後者は hidden ground truth に対して選択が合っていたかを見る theory-of-mind 信号で、reward shaping には使わない。これにより、「安全そうな理由を書いたが行動は誤った」を分けられる。

検証シナリオは 3 つ。`yield_standoff` は T 字路の chicken game で、相手が進むなら譲り、相手が譲るなら進む必要がある。`pedestrian_feint` は歩行者が本当に横断するのか、踏み出すふりだけなのかを見分ける signaling game で、強引に進めば衝突し、過剰に止まれば永遠に抜けられない。`contested_merge` は合流車線で相手車両が gap を開けるつもりかどうかを読み、前に入るか後ろに回るかを決める coordination game である。いずれも procedural generation と seed による再現性を持ち、常に進む、常に止まる、といった定数 policy では勝てないように設計されている。

benchmark を gameable にしないため、実行可能な invariant も用意されている。scripted expert は `always_proceed` や `always_stop` より必ず良い、expert には解ける、hidden disposition は public observation に漏れない、clean goal は collision より高く採点される、difficulty tier は解けるまま naive cue-following を罰する、という条件である。difficulty はノイズ量ではなく情報構造として扱われ、難しい tier では cue が遅れたり、曖昧だったり、最初に false cue が出る。問われるのは、最初の動きへの反射ではなく、相手の commitment が観測できるまで belief を保つことだ。

結果として、現行モデルは expert からまだ遠い。3 シナリオ平均の best success rate は 0.68 に留まり、`contested_merge` は 6 モデルが 0.50-0.56 付近に固まり、モデル間差をほとんど分けられていない。一方で bluff tier は cue-following と意図推定を分ける。例として、yield_standoff の hardest tier では DeepSeek V3.2 が 0.90 から 0.60、Qwen3-30B-A3B-Instruct が 0.90 から 0.40 に落ちる一方、Gemini 2.5 Flash は 1.00 近辺を維持したと報告されている。論文の結論は、LLM は場面を読めることがあるが、隠れた意図を時間方向に追跡し、それに基づいて安定して運転する段階にはない、というもの。

■ 内容分析
この論文の価値は、自動運転 benchmark としてよりも、「社会的に正しそうな文章を書く能力」と「不完全情報下で状態を更新し、行動を遅らせたり切り替えたりする能力」を分離した点にある。hidden intent を扱う評価は、普通に作るとモデルの説明文を読んで採点したくなる。しかしそれでは、語彙、トーン、もっともらしさ、採点 LLM の好みに引っ張られる。Self-Driving Negotiator は、相手の disposition を simulator の内部状態に置き、モデルが見る観測と grader が知る状態を分けることで、文章の巧さから採点を逃がしている。

また、静的 dataset ではなく environment にしている点も重要である。1 問 1 答にすると、意図推定は cue classification に縮む。実際の交渉では、自分が少し進む、相手が減速する、さらに自分が待つ、相手が完全停止する、という相互作用で belief が更新される。論文が POMDP として捉えているのはここで、competent policy は相手の hidden intent について仮説を持ち、慎重な行動で追加情報を引き出し、commitment が見えた後に決断する。

一方、弱点も本文中で明確に出ている。text-only なので、知覚、追跡、予測、地図、制御遅延は評価から落としている。これは現実性を犠牲にした代わりに、社会的推論だけを診断しやすくした選択である。また `contested_merge` の current tier は識別力が弱く、merge-ahead で bluff を避けられてしまうなど、intent bluff としては設計が甘い。論文自身も、合流では expert が「相手が committed と仮定して減速し、後ろにきれいに入る」target behavior を要求する再設計が必要だとしている。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、この設計を「NPC の賢さ評価」より先に、「評価器が何を見ているか」の設計として使える。交渉、護衛、追跡、共同作業、敵対的な騙し合いを持つ prototype で、agent のログだけを読んで賢さを判断すると、説明が上手い bot を過大評価しやすい。Self-Driving Negotiator 型にするなら、public observation、hidden state、action log、privileged grader を分ける。プレイヤーや NPC には見えない意図を scenario seed に持たせ、評価は台詞ではなく、衝突回避、待機、譲歩、追跡成功、過剰停止などの状態遷移から計算する。

Phase 3b/4a の probe としては、小さな social POMDP を 1 本作るのがよい。狭い通路で味方 NPC が本当に譲るのか、敵がフェイントで突っ込むのか、商人 NPC が値引き可能なのかを hidden disposition にし、agent には数ターンの観測だけを与える。固定 policy が勝てないこと、expert は解けること、hidden state が observation に漏れていないことを deterministic test にする。

■ メリット・デメリット
メリットは、会話品質ではなく行動結果と hidden ground truth で採点できること、定数 policy や keyword stuffing を invariant で潰せること、difficulty を情報構造として設計できること。ゲーム AI 評価でも、プレイヤーに見えない intent を扱う場面にそのまま転用しやすい。

デメリットは、環境を text-only に絞るため実ゲームの視覚、物理、入力遅延を別途扱う必要があること。さらに、reward が verifiable でも RL で最適化すると別の抜け道を探される可能性がある。評価用 reward と訓練用 reward を同じものとして扱うのは危険である。

■ 判定
部分採用。論文の運転 benchmark 自体を使うより、public observation / hidden state / privileged grader / anti-gaming invariant の分離を、社会的 NPC と playable diff 評価の小型 probe に転用する。

■ URL
https://arxiv.org/abs/2606.15139
https://arxiv.org/html/2606.15139v1

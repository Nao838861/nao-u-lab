■ 概要
Alem は、言語モデル agent が「単体でタスクを進める能力」と「複数体で役割を分け、通信し、時間差のある依存関係を閉じる能力」を混同せずに測るための benchmark である。既存の multi-agent 評価は、短い会話課題、明示された役割分担、または構造が固定された協力ゲームに寄りやすい。Alem はそこに対して、Craftax 系の長期 survival world を土台にし、探索、crafting、trading、combat、建設、採掘などを含む環境の中へ、手続き生成される協調タスクを埋め込む。論文中の open-ended は、無限に新目標が増えるという意味ではなく、手続き生成された有限だが大きい goal space を持つという意味で使われている。

設計の中核は、協調を「ただ agent 数を増やす」ことではなく、活動同士の依存関係として扱う点にある。Alem は、ある agent が木材を集め、別の agent が後で pickaxe を作り、さらに別の agent が石を掘るような long-range dependency、短い時間窓で作業を引き継ぐ handover、同一 timestep で同じ対象に働きかける synchronous action までを、同じ world の中で扱う。各 episode では coordination task の構造、必要人数、対象 entity が変わるため、agent は固定パターンを暗記するのではなく、観測から「今この場で何を誰と同期すべきか」を推定しなければならない。さらに soft specialisation によって agent ごとに得意領域が緩く分かれ、communication channel によって intent、依頼、タイミング合わせを明示できる。

評価は 13 種の現代的 LLM を homogeneous team として zero-shot で走らせ、4 種の MARL baseline を参照点に置く構成である。interface は LLM 向けに、game rules、local observation、legal actions、直近履歴、scratchpad memory、broadcast communication をテキスト化し、出力を action、reasoning、communication、memory field として parse する。指標は最大達成可能 reward に対する正規化 return で、base task reward、coordination reward、total reward を分けて見る。ここが重要で、Total は単なる合算ではなく、個体としての環境進行と協調タスクの達成を別々に観測する。

結果は、現行 LLM agent が Alem をほぼ解けていないこと、ただし失敗の形が一様ではないことを示す。平均 normalized return は低く、単に frontier model を並べれば協調が成立するわけではない。一方で hardest coordination setting では Gemini 系の強い設定が 1 billion steps 訓練した MARL agent に近づく場面があり、GPT 系の強い設定は base task reward が高いが coordination reward は伸びない、という対比が出る。これは「ゲーム内で探索・採掘・クラフトを前に進める能力」と「他 agent の状態を読み、依頼し、タイミングを合わせ、共有計画を維持する能力」が別物であることを示している。

ablation では communication の除去が coordination performance を最も大きく落とす。message の使われ方を見ると、agent は単なる雑談ではなく、特定 teammate への呼びかけ、命令形、意図の broadcast、行動割当、タイミング合わせに communication を使っている。scratchpad memory の効果は model 依存で、Gemini 系では forward-looking な multi-step plan や turn-indexed action sequence を保持する時に効くが、Gemma 系では現在状態の再記述に寄りやすく、効果が薄い。reasoning を削ると base と coordination の両方が落ち、残った memory field へ思考を押し込んでも性能低下は補えない。heterogeneous team では、強い model を混ぜても team が最強 member に引き上げられるわけではなく、概ね構成要素の平均付近に留まる。通信規約、計画 horizon、行動選好が揃わないこと自体が新しい協調問題になる。

結論として Alem の価値は、LLM agent の総合点ランキングではなく、協調を独立した bottleneck として測れる評価面を作った点にある。単体能力、通信、scratchpad の使い方、reasoning、team composition、coordination difficulty を分けて操作できるため、「なぜ協力できなかったのか」を、会話ログの印象ではなく環境内の reward と failure mode に落とせる。

■ 内容分析
この論文で一番使えるのは、協調を reward 設計と環境構造の両方で分離しているところである。多くの multi-agent 評価は、最終成功だけを見ると「一人で進めたのか、協調で進めたのか」が混ざる。Alem は base reward と coordination reward を分け、さらに coordination difficulty を同じ world 上で強弱調整するため、単体で強い agent がどこで協調に失敗するかを観測できる。これはゲーム制作側から見ると、NPC party、味方 AI、協力型 puzzle、複数 bot の playtest で、「個々の挙動は賢いのに全体として噛み合わない」問題を測るための形に近い。

もう一つ重要なのは、communication を「会話品質」ではなく「環境で検証される action alignment の道具」として見ている点である。agent がもっともらしい相談をしても、handover の時間窓に間に合わなければ coordination reward は伸びない。逆に、短くても誰に何を頼み、いつ同期するかが action に変換されれば価値がある。この切り方は、LLM 同士の議論ログを読んで賢そうか判断する評価より硬い。memory についても同じで、長い scratchpad 自体ではなく、未来の手順や約束を保持して次行動に使えるかが問題になっている。

弱点は、環境が重く、Alem そのものを自分達の prototype 評価に直接持ち込むには過剰な点である。JAX 実装、Craftax 系 world、MARL baseline、LLM action parser まで含めると、日々の小規模ゲーム制作サイクルにそのまま載せるものではない。また、論文の LLM 評価は text interface 中心で、VLM や Claude-family は future work 扱いなので、画面理解や操作 UI の評価へ直結させるには追加設計が要る。それでも、協調 difficulty、communication ablation、base/coordination reward 分離という発想は、軽量版に落として使える。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、Alem を丸ごと再現するのではなく、「協調失敗を個体性能から切り離す」評価 harness として部分採用する。たとえば NPC 2 体が別々に素材を集め、片方が鍵を開け、もう片方が時間内に通過する小さな test room を作る。metric は clear / fail だけでなく、base progress、handover success、同期遅れ、無駄通信、同じ依頼の反復、役割衝突を分ける。通信あり/なし、短期 memory あり/なし、計画 prompt あり/なしを同じ seed で切り替えれば、Alem の ablation の軽量版になる。

また、複数 AI にゲーム案を評価させる場面でも、強い agent を混ぜたら合議が強くなるとは限らないという警告を使える。Log/Mir/Ash/Codex の分担では、単に「一番賢い判断を採用」ではなく、各 agent の通信形式、評価 horizon、担当役割を明示し、混成 team が平均化して鈍るケースを検出する必要がある。staging には、誰が plan を保持し、誰が現在状態だけを再記述しているかを残すとよい。

■ メリット・デメリット
メリットは、協調を「雰囲気の良い会話」から環境内の達成・同期・役割分担へ引き戻せること。base/coordination 分離は、NPC や bot の評価で失敗原因を潰しやすい。communication ablation も、小さな prototype で実装できる。

デメリットは、原論文の環境が重く、直接移植すると評価器作りが目的化すること。text interface 中心なので、画面操作型ゲームでは観測形式の設計が別途必要になる。MARL baseline まで用意するのも日常運用には過剰である。

■ 判定
部分採用。Alem 本体ではなく、base reward と coordination reward の分離、communication / memory / reasoning ablation、coordination difficulty を段階化する考え方を、自作ゲームの軽量 headless 協調評価に取り込む。

■ URL
https://arxiv.org/abs/2606.08340
https://arxiv.org/html/2606.08340v1
https://github.com/alem-world/alem-env

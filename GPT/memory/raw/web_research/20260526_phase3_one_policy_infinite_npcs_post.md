■ 概要
One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents
https://arxiv.org/abs/2605.23652

この論文は、life simulation game のように数百から数千体の NPC が同時に存在する環境で、「各 NPC が固有の人格を持つ」ことと「実行時に軽く動く」ことを両立させるための shared reinforcement learning policy を提案している。問題設定はかなりゲーム制作寄りで、NPC ごとに LLM を毎ターン呼ぶ方式では、自然言語で personality を指定しやすい一方、リアルタイム性、推論コスト、行動の一貫性が厳しい。逆に従来型の scripted behavior や単純な behavior tree では速いが、designer-authored な free-form persona description をそのまま制御条件にするのが難しい。著者はこのずれを、会話生成ではなく「人格記述を行動 policy の条件に変換する」問題として扱っている。

提案手法は pcsp、Persona Conditioned Shared Policy。各 NPC の free-form persona description を frozen LLM embedding に通し、その embedding を low-rank persona projection と neural persona conditioning で単一の RL policy へ注入する。persona encoding は NPC ごとに一度だけ行い、実行時は同じ policy が条件だけを変えて行動を選ぶ。訓練は PPO を土台にしつつ、InfoNCE consistency objective で「同じ persona から出た trajectory は識別可能に近く、違う persona は離れる」方向を与え、KL diversity objective で人格差が単なる平均行動へ潰れないようにする。つまり、persona をラベルとして分類器に当てるのではなく、行動履歴から persona が読めるように policy 側を圧力づけている。

評価は 300 persona の life-simulation benchmark を中心に、compositional zero-shot persona identification、semantic-behavioral alignment、LLM-as-policy baseline との推論速度比較、Melting Pot 2.4.0 substrates での外部検証、UE5 deployment までを含む。arXiv abstract では、pcsp が zero-shot persona identification で chance の最大 17 倍、semantic-behavioral alignment で Spearman rho 約 0.73、LLM-as-policy baseline に対して 22 倍高速な推論を示したとされる。重要なのは ablation で、InfoNCE trajectory-consistency objective を外すと zero-shot persona identification が chance まで崩れる、という結果が提示されている点。人格条件を入れただけでは足りず、行動列から人格が追跡できるようにする目的関数が load-bearing だという主張になっている。

結論として、この論文は「LLM NPC をどう喋らせるか」ではなく、「LLM で書ける人格を、リアルタイムに大量実行できる NPC 行動へ落とす」研究である。著者は compositional zero-shot と vocabulary-expansion held-out を区別し、単に学習済み persona を覚えるのではなく、未見の組み合わせや語彙拡張に対しても persona-conditioned behavior が出るかを見る。さらに UE5 で 64 agents の in-engine ablation を再現し、sub-frame inference profile が commercial game engine 内でも崩れにくいことを示したとしている。ゲーム側から見ると、これは会話 AI の代替というより、大量 NPC の移動、協調、回避、危険選好、目標優先度を personality description から制御するための基盤候補である。

■ 内容分析
この論文の読みどころは、persona を「台詞の文体」ではなく「観測可能な行動差」として検証している点にある。ゲーム制作で NPC の personality と言うと、口調、設定、プロフィールが先に来がちだが、プレイヤーが実際に触るのは移動、間合い、探索範囲、協力/逃避、リスク許容、目標切替の癖である。pcsp はここを shared policy の条件付けとして扱い、行動 trajectory から persona が識別できるかを評価するため、設計対象がかなり具体的になる。

一方で、論文の主張は RL 環境と報酬設計に強く依存する。InfoNCE と KL で多様性を維持できても、環境側に persona を発現できる行動 affordance が少なければ、人格差は意味のある gameplay 差にならない。また、semantic-behavioral alignment は有用な指標だが、プレイヤーが「この NPC は臆病だ」「この群衆は規律的だ」と読めるかは別問題。論文が強いのは大規模 NPC 制御の実行基盤であって、個別 NPC の会話魅力や長期記憶をそのまま解くものではない。さらに、著者が示す数値は persona-conditioned control の成立を示すが、実際のゲームでは同じ差分が難易度、可読性、楽しさにどう影響するかを別に測る必要がある。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、まず「人格を台詞で差別化する」より前に、行動 policy の差分表を作る用途で使える。敵、味方、市民、観客、案内役などに対して、aggressive、cautious、helpful、panicked、curious といった自然語 persona を、そのまま prompt に渡すのではなく、移動速度、接近距離、危険地帯への進入、味方への合流、アイテム優先度、失敗時の復帰行動に変換する。現在の headless 評価にも、persona ごとの trajectory summary から「意図した癖が読めるか」を見る probe を足せる。

実装としては、いきなり RL を導入するより、まず lightweight な persona-conditioned policy table を作るのが現実的。自然語 persona から数値 parameter を抽出し、同じ finite-state/utility AI に条件として入れる。その上で、ログから persona identification 風の評価をする。例えば aggressive と marksman が同じ経路・同じ失敗をするなら、台詞以前に行動差が足りないと判定できる。

■ メリット・デメリット
メリットは、大量 NPC の推論コストを抑えながら、人格一貫性を行動ログで検証できること。designer が自然語で意図を書ける点も、制作サイクルと相性がよい。デメリットは、RL の環境設計、報酬、評価指標が重く、短期プロトタイプでは導入過多になりやすいこと。会話、感情表現、長期記憶は別系統で補う必要がある。

■ 判定
部分採用。LLM NPC の置き換えではなく、人格を playable な行動差へ変換する設計パターンとして採用する。まずは RL ではなく、persona-conditioned utility AI と trajectory 評価から小さく試す。

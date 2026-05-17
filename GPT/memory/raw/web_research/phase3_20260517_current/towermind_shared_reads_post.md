■ 概要
対象: TowerMind: A Tower Defence Game Learning Environment and Benchmark for LLM as Agents
URL: https://arxiv.org/abs/2601.05899

この論文は、LLM agent の「長期計画」と「局面ごとの意思決定」を測る場所として RTS を使いたいが、StarCraft II 系の環境は重く、軽量 RTS 系は LLM が扱いやすい textual observation や action interface が弱い、という問題から始まる。そこで著者らは、RTS の中でも敵波・配置・資源配分・局所対応が比較的切り出しやすい tower defense を使い、TowerMind という Unity/ML-Agents ベースの評価環境を作っている。論文上では AAAI 2026 Oral とされており、環境の狙いは「軽い RTS 風ゲーム」ではなく、LLM が戦略を立て、状況を読み、実行可能な行動に落とせるかを低コストで見る benchmark である。

TowerMind のゲームは、複数の道路を通って敵が base に向かい、プレイヤーが tower point に Archer / Magician / Knight Tower を建て、hero や knight reinforcements も使って守る構造になっている。Archer は空中・地上を攻撃でき、Magician は地上 AoE、Knight Tower は knight を召喚する。敵は 15 種類あり、Orc Sorcerer のように tower を無効化する敵もいる。gold は tower 建設・強化・hero 強化に必要で、map 上に落ちる gold を hero や knight に拾わせる必要がある。fog of war は観測から要素を消し、味方の行動も止めるため、単なる配置パズルではなく部分観測下の資源運用になる。hero の AoE は体力を消費し、friendly fire compensation で knight を gold に変換できるなど、行動が単機能ではなく複数目的を持ちうる点も重要である。

環境 interface は OpenAI Gym 標準に合わせ、観測を pixel-based、textual、structured game-state の 3 種に分ける。textual observation は game-state 情報を JSON 的に field name 付きで表し、structured は同じ情報を 1 次元配列に flatten する。action は 2 次元座標と discrete action type を組み合わせた hybrid action で、tower 建設地点でない座標に建てる、gold が足りないのに建てる、といった行動は invalid action として扱う。評価指標は score と valid action rate で、前者は base health 損失に対応し、後者は行動が game state/rule と整合しているか、つまり hallucination 的な失敗を測る。TowerMind は SC2LE 系より非常に軽く、論文では SC2LE が約 30GB disk、2GB RAM、dedicated GPU を要求するのに対し、TowerMind は約 0.15GB disk/RAM、CPU 実行可能と説明している。

評価では 5 つの benchmark level を用意し、GPT-4.1、Gemini-2.5-Pro、Claude 3.7 Sonnet、Llama 3.2、Qwen2.5-VL などを、language-only と vision-language の条件で比較する。さらに human expert baseline を置き、Ape-X DQN と PPO も RL benchmark として評価する。主な結果は、commercial LLM が open-source model より良い傾向を示しても、人間との差は score と hallucination の両面で残る、というもの。score では best model でも human expert に大きく届かず、最難関 level では全モデルが human expert から大きく離れる。vision input は多くのモデルで score を改善するが、視覚情報を入れれば解決するという話ではなく、状態理解の助けにはなるが、戦略の有効性までは保証しない。

定性的分析が特に使える。LLM は、敵道路から離れた misleading tower point に tower を建て続ける。必要な座標情報は prompt にあるのに、tower が敵に届かないことを計算して配置計画を検証できない。人間は hero を gold 回収へ向かわせつつ近くの敵を攻撃するような multifinality、つまり 1 行動で複数目的を達成する動きをするが、LLM の trajectory では観測されない。さらに tower upgrade を怠る、reinforcement を空地に出す、敵がいない場面で AoE を使うなど、行動名は理解していても戦略的な使用条件を理解していない。この論文の結論は、LLM はルール整合な行動をかなり出せる場合でも、それが有効な行動とは限らない、という分離である。

■ 内容分析
TowerMind の価値は、tower defense という題材そのものよりも、LLM agent 評価を「勝敗」から分解している点にある。score だけを見ると、モデルが弱いのか、観測が足りないのか、行動文法を誤ったのか、長期計画が悪いのかが混ざる。TowerMind は observation modality、valid action rate、level difficulty、trajectory analysis を分けることで、「実行可能だが無効な戦略」と「そもそも実行不能な hallucination」を分離している。この分離はゲーム制作の自動評価でもかなり重要で、LLM が出した修正案が schema 的に合法か、play 上意味があるか、複数目的に効いているかを別々に見る必要がある。

一方で、benchmark としての強さは tower defense の性質に支えられている。tower point、road、enemy wave、gold、fog のように、座標・資源・敵進行が比較的構造化しやすい。これは評価には向くが、物語主導・物理操作・探索型ゲームへそのまま広げると、失敗分類が tower defense 固有になりすぎる危険がある。また score が base health 損失中心なので、プレイヤー体験の緊張、学習曲線、視覚的読みやすさのような制作側の価値は別評価が必要になる。TowerMind は「ゲームを評価する benchmark」というより、「LLM の計画実行をゲーム上で診断する検査台」と読むのがよい。

■ 自分達の環境への適用
Nao_u_BOT 側では、既存の headless harness に TowerMind 的な分解を持ち込める。まず、ゲーム状態を 1 つのログに潰さず、画面相当の観測、自然言語説明、構造化 state を分ける。次に、LLM が出した操作や調整案を valid / invalid で判定し、invalid なら schema 違反、資源不足、射程外、対象不在のように理由を残す。さらに playable score とは別に、無駄行動率、複数目的達成、配置と敵経路の整合、行動タイミングの遅れをログ化する。

小型プロトタイプでは、tower defense 全体を作る必要はない。例えば wave 防衛、拠点防衛、資源回収つきの 5 分ミニゲームで、構造化 state のみを与えた場合、画面 snapshot も与えた場合、自然言語要約だけの場合を比較する。これにより、制作中の agent が「ルールは守るが遊びを良くしない」段階にいるのか、「そもそも状態を読めていない」段階にいるのかを切り分けられる。

■ メリット・デメリット
メリットは、軽量なゲーム評価で macro planning、micro adaptation、hallucination、action efficiency を同時に見られること。特に valid action rate と score の分離は、LLM 制作支援の評価にも転用しやすい。デメリットは、tower defense の構造化しやすさに寄っているため、探索・物語・身体性のあるゲームでは指標が不足すること。また、環境を作り込むほど benchmark 運用は重くなり、制作サイクル内の小さな検証から離れる危険もある。

■ 判定
部分採用。TowerMind 全体を再現するのではなく、観測形式の分離、valid action rate、無駄行動と multifinality の trajectory 分析を、Nao_u_BOT の小型プロトタイプ評価に取り込む。

■ 概要
この論文は、LLM agent の失敗を「モデルが弱いから」とだけ見ず、モデルと環境の間にある runtime harness の設計問題として扱う。対象は、手順やルールが明確で、同じ入力に対して再現可能な deterministic / rule-governed domain。ここでいう harness は、agent が何を観測するか、tool をどう呼ぶか、行動をどう実環境の操作へ落とすか、環境から返る feedback をどう読ませるか、途中で迷走した trajectory をどう制御するかを媒介する層である。論文の主張は、こうした層の mismatch が失敗の主因になる場面では、model weight を更新したり環境を簡単にしたりする前に、interface 側を適応させるべきだ、というもの。

提案手法 Life-Harness は、frozen LLM と評価環境を変えず、training trajectories から繰り返し現れる interaction failure を拾って、評価時に再利用できる harness intervention へ変換する。介入は大きく四つに整理される。environment contracts は、環境が要求する入力形式、状態遷移、制約、成功条件を agent が誤読しにくい契約として明示する。procedural skills は、繰り返し必要になる手順を小さな技能として固定し、毎回ゼロから推論させない。action realization は、agent が自然言語で意図した行動を、実際の tool call や環境操作に落とす部分を補強する。trajectory regulation は、失敗しやすい探索の方向、無限ループ、早すぎる終了、状態の見落としを、実行中の軌跡レベルで抑える。

重要なのは、この harness は評価対象の unseen tasks に対して固定されたものとして使われる点である。つまり、評価中に答えを見て都合よく手直しするのではなく、訓練側で観測した失敗型から環境側の一般構造を抽出し、held-out 側でも同じ interface 改善として効くかを見る。実験は tau-bench、tau2-bench、AgentBench 由来の 7 deterministic environments と、18 model backbones の組み合わせで行われ、126 の model-environment settings のうち 116 で改善したと報告されている。平均 relative improvement は 88.5%。さらに、Qwen3-4B-Instruct の trajectories だけから進化させた harness が他の 17 models に transfer した、という結果が中核になっている。これは、Life-Harness が特定モデルの癖に合わせた prompt trick ではなく、環境側の再利用可能な構造を捉えている、という解釈を支える。

この論文の結論は、agent adaptation を model-centric に閉じないこと。性能改善の単位を「モデルを賢くする」だけに置くと、観測の欠落、tool call の粒度、action schema の曖昧さ、feedback の読ませ方、途中軌跡の制御といった、実運用で支配的な失敗要因を見落とす。Life-Harness は、環境と agent の接面にある可観測で編集可能な層を、失敗ログから段階的に改善する方法として提示されている。

■ 内容分析
この論文で良いのは、harness を単なる prompt ではなく、agent runtime の操作可能な設計面として分解している点。従来の「system prompt を厚くする」「tool description を丁寧にする」程度の話に留まらず、観測、手順、行動実現、軌跡制御という失敗箇所ごとの intervention class に落としている。そのため、失敗ログを読んだ時に「どの文言を足すか」ではなく、「契約が曖昧なのか」「技能化すべき反復手順なのか」「意図と tool call の変換が壊れているのか」「探索が暴れているのか」と切り分けやすい。

一方で、評価対象が deterministic domain に寄っていることは重要な制約。ゲーム開発や QA の中でも、ビルド、ファイル編集、テスト実行、UI 操作ログの再現、ルールベースのプレイ検査にはかなり近いが、曖昧な創作判断や人間の好み評価にそのまま効くとは限らない。Life-Harness が強いのは、環境のルールを契約として書け、行動が tool call に落ち、失敗 trajectory を比較できる場合である。

また、Qwen3-4B-Instruct 由来 harness の cross-model transfer は魅力的だが、ここは「小さめモデルの失敗から作った補助輪が他モデルにも効く」と読みすぎない方がよい。実際には、環境側の不親切さを小さめモデルが露出し、その修正が他モデルにも利益を出した、と見るのが堅い。つまり、弱い agent を使った failure mining は harness 設計の probe として有効、という示唆が大きい。強いモデルだけで評価していると、環境 contract の曖昧さをモデル能力で吸収してしまい、運用上の脆い接面が見えにくい。Life-Harness はその隠れた接面を、失敗が目立つ trajectory から掘り出す方法として読める。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、これは AI playtester と実装 agent の両方に使える。たとえばゲーム試作で agent が「目的地に近づけない」「UI 状態を読み違える」「入力が game loop に反映されていない」「同じ失敗行動を繰り返す」時、モデル変更ではなく harness 変更として扱う。観測ログに座標、速度、接触、残り入力猶予、直前の失敗理由を足すのは environment contract。ジャンプ、回避、メニュー遷移などを小さな手順に固定するのは procedural skill。自然言語の「右へ少し移動」を実際の key duration や stick value に落とすのは action realization。詰まり状態やリトライ条件を制御するのは trajectory regulation。

定時サイクルにも適用できる。shared-reads 投稿失敗は「文章力」だけでなく、候補 gate、原文 cache、文字数検査、自己レビュー、Slack 投稿、candidate lifecycle 更新の harness がどこで曖昧かとして扱う。Phase 3 の品質を上げるなら、モデルに毎回頑張らせるより、失敗ログから「概要が原文手法でなく感想に寄った」「URL が冒頭に出た」「candidate 更新が漏れた」などを intervention に変える方が再現性が高い。

■ メリット・デメリット
メリットは、改善単位がログから検証できること。モデルを変えずに同じタスクで前後比較でき、どの失敗型に効いたかを残せる。さらに、環境側の構造を直すため、複数モデルや複数 agent に効く可能性がある。

デメリットは、harness が環境仮定を抱え込むこと。失敗分類が古くなると、補助が逆に探索を狭める。特定の benchmark や制作フローに過適合した contract を増やすと、創作上の例外や新しい操作系を壊す危険がある。

■ 判定
部分採用。モデル性能評価ではなく、失敗ログから harness intervention を作る運用として採用する。特に game QA、AI playtest、Phase 3 投稿、ファイル編集 workflow で、environment contract / procedural skill / action realization / trajectory regulation の四分類を failure review の軸にする。

■ URL
https://arxiv.org/abs/2605.22166

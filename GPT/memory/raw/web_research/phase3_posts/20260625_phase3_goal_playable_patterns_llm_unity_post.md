■ 概要
Liu と Tatar の論文は、LLM にゲームを作らせる問題を「よさそうなゲーム案や C# を出す」話ではなく、ゲームデザイン知識を実行可能な Unity 成果物へ接地する問題として扱う。対象は gameplay design patterns の中でも、プレイヤーと目的物の関係を表す goal patterns である。goal pattern は「何を集める」「何を守る」「どこへ運ぶ」といった目的関係を抽象化できるが、そのままでは遊べない。論文はこれを Unity 上で動く Goal Playable Concepts (GPCs) として実装できるかを調べる。

中心の定式化は constrained executable creative synthesis である。生成物は Unity の C# としてコンパイルできるだけでは足りない。既存プロジェクトの prefab、MonoBehaviour、scene graph、component attachment、runtime wiring に合い、さらに元の goal pattern が持つ意味を entity、constraint、rule-driven dynamics として保たなければならない。つまり評価対象は「自然言語からコードへ」ではなく、「抽象的な gameplay relation を、エンジン制約下で存在する artifact へ変換できるか」である。

実験では 26 種類の goal pattern instantiation を使い、自然言語の pattern markdown から直接 Unity Editor C# script を生成する baseline と、人間が設計した Unity-specific intermediate representation (IR v0.2-runtime-evidence) を挟む pipeline を比較する。IR pipeline は、まず pattern から IR JSON を生成し、次に IR から C# を生成する二段階で、schema 制約の強さを free / min / full の 3 構成に分ける。モデルは DeepSeek-Coder-V2-Lite-Instruct と Qwen2.5-Coder-7B-Instruct。評価は人間が「面白そう」と眺めるのではなく、自動 Unity batch replay による compilation success を入口に置く。

結果は厳しい。論文は全生成 artifact が compile に失敗したと報告し、それを単なる失敗ではなく、どこで grounding が壊れるかを観測する材料として扱う。失敗は hygiene failure と grounding failure に分けられる。hygiene はファイル名、class 名、構文、参照の取り違えのような清潔さの問題。grounding はより深く、Unity の project-level structure、既存 asset、component 関係、runtime lifecycle、goal pattern の意味が実装へ結びつかない問題である。主な詰まりは structural / project-level grounding で、LLM が局所的に plausible なコードを書いても、実際の Unity project の中では成立しない。

この論文の結論は「LLM ではゲーム生成が無理」ではない。むしろ、ゲーム生成を評価する時に必要な失敗の切り分けを示している。LLM の創造性は、自由文を増やす能力ではなく、制約下で意味を保った実行物へ変換する能力として測るべきだという立場である。IR は魔法の解決策ではなく、人間が固定する制約と、モデルに任せる変換を分ける装置として読める。

■ 内容分析
重要なのは、評価軸が「生成ゲームの面白さ」へ飛ばないことだ。ゲーム制作では、アイデア、仕様、コード、実行、操作感、面白さが同じ失敗箱に入れられやすい。この論文はまず executable artifact の成立を切り出し、その手前で壊れる箇所を分類する。面白さ以前に、scene 内の object 関係、component lifecycle、目標条件の検出、入力と勝敗の結線が成立していなければ、評価対象そのものが存在しないからである。

IR の扱いも冷静である。IR を入れれば成功する、という主張ではない。free / min / full の schema 強度を比較することで、自然言語から直接 Unity へ飛ぶ時に何が消えるか、逆に schema を重くした時にどの情報が固定され、どの部分がまだモデル任せで壊れるかを見る。これは「プロンプトを詳しくする」より一段具体的で、設計知識を artifact 変換用の contract として外に出す発想である。

特に読めるのは、gameplay pattern と engine artifact の間にある情報の粒度差である。pattern は人間には便利だが、Unity には「目的物」「達成」「所有」「配送」の意味は存在しない。存在するのは GameObject、component、collider、script、scene 内参照、event の発火順である。LLM がここを飛ばすと、コードはゲームらしい単語を含んでいても、実行時には参照が切れる。このズレを論文は failure taxonomy として取り出している。

一方で、論文の限界も明確である。使われたモデルは open-source の比較的小型構成で、全 compile failure という結果を現在の最大モデル一般へ拡張するのは危険である。また compilation は必要条件であって、goal pattern の意味保存、プレイヤーが理解できる affordance、遊びとしての手触りまでは測っていない。したがってこの論文は「自動ゲーム生成の完成度評価」ではなく、「抽象パターンを playable artifact に落とす時の故障診断」として読むのが妥当である。

■ 自分達の環境への適用
Nao_u_BOT では、候補ゲーム案をいきなり実装に流す前に、小さな IR を置くのが有効だと思う。たとえば prototype ごとに `goal_pattern`、`entities`、`constraints`、`rule_dynamics`、`success_failure_conditions`、`observable_logs`、`playable_artifact_check` を短く埋める。大きな仕様書ではなく、Codex が迷いやすい「目的は何か」「何が状態を変えるか」「成功をどう判定するか」「headless で何を観測するか」を固定する。

Phase 0 の playable diff に接続するなら、候補案を文章で膨らませる前に、実行物へ落ちる最小対応表を作る運用がよい。Unity 固有ではなく、Web prototype や Python 小ゲームでも同じ考え方は使える。実装後のレビューでも、「面白いか」だけでなく、hygiene failure、engine/project grounding failure、goal meaning failure を分けて記録すれば、次回の memory recall が抽象論ではなく修正可能な失敗型として働く。

また、shared-reads から得た知見を phase_game_start に渡す時も、この分類は使いやすい。候補が落ちた時に「コンパイル不可」「動くが目的が保存されていない」「目的はあるが観測ログがない」を分ければ、次の Codex 実装で何を直すべきかが短くなる。

■ メリット・デメリット
メリットは、LLM 制作の失敗を「発想不足」や「モデルが弱い」で片付けず、意味保存、構造制約、実装 hygiene に分解できること。小さな prototype でも、実装前に欠けている情報を見つけやすくなる。

デメリットは、中間表現を重くしすぎると制作速度が落ちること。compile success に寄せすぎると、ゲームとしての意外性や操作の気持ちよさを後回しにしすぎる危険もある。

■ 判定
部分採用。巨大な IR ではなく、candidate から playable diff へ渡すための小さな対応表として採用する。特に goal、state、rule、observable log を固定する用途で価値が高い。

■ URL
https://arxiv.org/abs/2603.07101v4

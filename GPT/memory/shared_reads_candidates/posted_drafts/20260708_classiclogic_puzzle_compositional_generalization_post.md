■ 概要
ClassicLogic は、Sudoku、KenKen、Kakuro、Futoshiki という古典的な論理パズルを使い、AI agent の compositional generalization を測る benchmark である。ここでの問題設定は、agent が個別ルールを覚えたかではなく、単純な解法戦略を組み合わせ、より複雑な問題へ転移できるかを細かく診断することにある。多くの compositional benchmark は言語課題に寄り、構造が曖昧だったり、評価が正誤に潰れたりしやすい。ClassicLogic は、各 puzzle に hierarchical knowledge base を作り、複雑な solving strategy を、より基礎的な strategy の composition として定義する。これにより、agent がどの戦略階層まで扱えたかを明示的に見る。

中核は三つある。第一に、各ゲームの rule と solving strategy を知識ベースとして形式化すること。第二に、strategy-driven generation により、target difficulty に対応する puzzle template を作ること。第三に、評価を Entity Composition、Relational Composition、Procedural Composition に分けること。Entity は画像や grid 上の clue を symbol として認識する能力、Relational は行・列・領域・不等号・演算制約などの関係を構築する能力、Procedural は複数 step の解法を順序立てて適用する能力である。

生成手法も重要で、まず canonical solution grid から clue を削る。削除候補ごとに、完全 solver で unique solution を保てるかを確認し、同時に target difficulty 以下の strategy set だけを持つ constrained solver で解けるかを見る。つまり、難しすぎる puzzle や解が複数ある puzzle を除外し、必要な戦略深度を制御する。生成した template は、実行時に値の割当や回転・反射・置換などの symmetry-preserving transformation を加えて、多様だが構造的には同等の instance に変換する。結論として、ClassicLogic は neuro-symbolic reasoning や advanced AI reasoning system が、知覚から戦略適用までどこで詰まるかを測る testbed になる。

■ 内容分析
この論文の良さは、パズルの難易度を「人間がなんとなく難しいと感じる」ではなく、「どの strategy composition が必要か」として扱う点にある。Sudoku の裸単、隠れ単、候補削除のような単純戦略が、より複雑な戦略の部品になる。KenKen なら cage arithmetic と Latin square constraint が絡み、Futoshiki なら不等号関係が候補削除へ影響する。ClassicLogic は、こうした局所規則を知識ベースに置き、depth を持つ解法階層として評価する。正解率だけを見ると、agent がたまたま brute force で解いたのか、strategy を理解して転移できたのかが分からない。この benchmark はそこを分けようとしている。

template 生成の設計も実務的である。完全 solver だけで puzzle を作ると、unique solution は保証できても、想定した戦略で解けるとは限らない。逆に constrained solver だけでは、別解や hidden ambiguity を見逃す。二つの solver を役割分担させ、unique solution と difficulty bound を同時に確認する構成は、ゲームの puzzle authoring にそのまま使える。さらに、template library を事前生成し、実行時は instantiation と transformation だけにするため、厳密性とリアルタイム性を分離している。これは生成系 game design ではかなり重要で、重い検証は build 時、軽い variation は runtime という分担になる。

評価軸の三分割も有用である。Entity Composition は視覚認識を含むため、MNIST digit image のような perceptual grounding を入れられる。Relational Composition は、抽出した entity 同士の制約 graph を組めるかを見る。Procedural Composition は、複数戦略をどの順で適用するかを見る。LLM agent や vision-language model が puzzle を解けない時、数字を読み間違えたのか、制約を組めなかったのか、解法順序を崩したのかを切り分けられる。

限界は、対象が classic logic puzzle に強く寄っていることだ。明示的な rule、grid、unique solution、solver 検証があるから成立する。アクションゲームや物理パズル、曖昧な affordance を持つ探索ゲームでは、strategy knowledge base の作成自体が重い。また、agent が人間らしいヒントを理解したか、プレイヤーが楽しい難しさとして受け取るかは、この benchmark の主対象ではない。難易度を形式化できる反面、プレイ感の測定は別に必要になる。

■ 自分達の環境への適用
我々の puzzle / tutorial / hint 設計にはかなり使える。現在の headless 評価は、つい「解けたか」「到達したか」に寄りやすい。ClassicLogic の考え方を使うなら、各 prototype の puzzle を strategy layer に分解する。たとえば、press switch、observe door, infer timing, route planning, resource preservation のように、作品固有の解法部品を列挙し、それぞれを depth 付きにする。playtest agent が失敗した時に、どの layer で止まったかをログに残せる。

小さな導入案は、puzzle candidate ごとに `required_strategies` を frontmatter や JSON に持たせることだ。例として、`recognize_symbol`, `apply_local_rule`, `combine_two_constraints`, `plan_multi_step`, `avoid_decoy` のようなタグを置く。headless solver や Playwright bot が解けなかった場合、最終位置や死亡回数だけでなく、どの strategy check が未達だったかを staging に残す。これにより、「難しい」ではなく「複合制約までは分かるが、手順保持で落ちる」という形で改善できる。

生成にも使える。全部を solver で自動生成する必要はないが、手作り puzzle を template として扱い、safe transformation を限定的に適用できる。左右反転、入口出口の交換、数字や色の置換、hazard timing の offset など、意味を保つ変換だけを許す。その後、unique solution までは無理でも、少なくとも「解ける path がある」「必須 mechanic を使う」「softlock しない」程度の constrained check を走らせる。ClassicLogic の二段階設計は、この build-time verification と runtime variation の分離として採用しやすい。

記憶システムにも応用できる。shared-reads candidate の評価を、単なる pass/fail ではなく、概要密度、手法理解、評価理解、適用設計、限界分析の composition として見る。どれか一つが欠けた候補は、全体評価を落とすだけでなく、欠けた layer を明示して postponed に戻せる。

■ メリット・デメリット
メリットは、難易度と失敗原因を構造化できること。正答率だけではなく、agent がどの reasoning component を使えたかを見るため、tutorial、hint、puzzle pacing の調整に向く。template generation と runtime instantiation の分離も、軽量な procedural variation に使える。unique solution と strategy depth を別 solver で見る設計は、生成物を信用するための現実的な型である。

デメリットは、知識ベース作成の初期コストが高いこと。作品ごとに strategy hierarchy を人間が定義しないと、評価が始まらない。さらに、grid logic puzzle 以外では unique solution が望ましいとは限らない。探索ゲームや narrative puzzle では複数解や曖昧な気づきが価値になるため、ClassicLogic の厳密さをそのまま当てると、遊びの余白を殺す危険がある。

■ 判定
部分採用。benchmark 全体を導入するのではなく、strategy hierarchy、difficulty bound、build-time template verification、失敗 layer 記録を採る。次の puzzle 系 prototype では、required strategy tags と headless failure layer を最小単位で入れる。

■ URL
https://arxiv.org/abs/2607.05185

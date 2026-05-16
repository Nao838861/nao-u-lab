[Codex shared-reads] Grounding Machine Creativity in Game Design Knowledge Representations
URL: <https://arxiv.org/abs/2603.07101>

■ 概要
Liu と Tatar の「Grounding Machine Creativity in Game Design Knowledge Representations」は、LLM にゲームを作らせる問題を「自然言語からコードを出す」ではなく、「ゲームデザイン知識を、実行可能な Unity 成果物へ接地する constrained executable creative synthesis」として定式化している。対象は goal patterns、つまりプレイヤーの目的と対象物の関係を表すゲームプレイパターンで、それを Unity 上で動く Goal Playable Concepts (GPCs) として実装する。ここで難しいのは、生成物が C# と Unity の構文・プロジェクト構造を満たすだけでなく、元の goal pattern が持つ意味、たとえば所有、配送、整列、目標達成の関係を実際のオブジェクト、コンポーネント、実行時挙動として保つ必要がある点である。

実験では、既存の Unity project 内にある 26 個の goal pattern reference implementation を対象に、新しい Unity Editor script を生成させる。比較されるのは二系統のパイプラインである。ひとつは、goal pattern の自然言語 markdown から直接 C# / Unity script を生成する no-schema baseline。もうひとつは、pattern description から Unity 固有の中間表現 IR JSON を作り、それを C# へ変換する IR-conditioned pipeline で、IR の制約量を free / min / full の三段階に分ける。IR v0.2-runtime-evidence は、静的な Unity scene YAML だけでなく prefab、MonoBehaviour、serialized field、runtime params、semantic links などを抽出して作られており、単なる設計メモではなく対象 project の実装構造と pattern の意味を同時に持つ橋渡しになっている。

評価は、生成コードを一時 asset として書き込み、Unity 2022.2.23f1 を batchmode で起動して compiler error と timeout を見る automated Unity replay で行われる。主指標は M1 Compile Success、つまり実行可能候補として存在できる最低条件を満たすかである。結果はかなり厳しい。2 つの open-source coder model、DeepSeek-Coder-V2-Lite-Instruct と Qwen2.5-Coder-7B-Instruct、4 設定、26 patterns の全条件で pass@k は 0.0、つまりコンパイル成功はゼロだった。さらに IR を厚くするほど timeout が増え、no schema では 37.5% から 51.5% 程度だった timeout が、with schema full では 96% から 99% まで上がる。IR は接地に必要だが、生成物を複雑にして Unity の compile / domain reload 予算を食い潰す副作用も持つ。

論文の価値は、成功率よりも失敗の分類にある。compiler error 41 種を見て、著者らは grounding failures と hygiene failures を分ける。grounding failures は、存在しない型、namespace、member、継承構造、project 固有コンポーネントを参照する失敗で、Unity project の実装構造や goal pattern 語彙への接地不足を示す。hygiene failures は、構文崩れ、重複宣言、formatting leakage、型変換エラーのように、対象 project を正しく知っていても起きる出力衛生の問題である。IR conditioning は architectural grounding failure の一部、たとえば MonoBehaviour の継承規約に関する CS0115 を大きく減らすが、project-specific type の幻覚である CS0246 は残り続ける。結論として、この研究は「LLM はまだ Unity の playable 実装を安定生成できない」という失敗報告であると同時に、失敗を再現可能な replay と taxonomy に分解すれば、次の改善箇所がかなり具体化できることを示している。

■ 内容分析
この論文で重要なのは、IR を「魔法の精度向上策」として扱っていない点である。普通なら中間表現を挟むと、自然言語より構造化されるので生成が良くなる、という単純な話に寄せがちだが、実験結果は逆に、構造を厚くすると timeout と複雑化が増えることを出している。つまり問題は「情報が足りない」だけではない。Unity project の prefab 名、script class、component binding、runtime parameter、goal relation を渡す必要はある。しかし、それをそのまま巨大な schema として渡すと、モデルは参照すべきものを増やし、コンパイル対象も肥大し、失敗の種類が変わる。

もうひとつの読みどころは、評価を semantic fidelity まで広げず、まず compile viability に絞っていることだ。ゲームとして面白いか、pattern の意味が保たれているかを見る前に、Unity 上で artifact として存在できないものは評価対象にできない。この割り切りは制作運用に近い。LLM が「それらしいコード」を出した段階では何も達成しておらず、Editor 起動、asset 書き込み、batch compile、ログ分類まで通して初めて生成物になる。成功ゼロという結果は派手に見えるが、むしろ「成功していないものを成功扱いしない測定器」を作った点が強い。

一方で、この論文をそのまま「LLM ではゲーム制作は無理」と読むのは粗い。対象は既存 Unity project の構造に新しい scene instantiation script を差し込むタスクであり、open-source model と fixed IR での実験である。論文自身も、model capacity と IR design は分離して診断すべき変数だとしている。実務的には、巨大 IR 一発投入ではなく、project-level symbols の厳密リスト、allowed API、最小 scene contract、生成後 sanitizer、compile error からの修正ループを分けるべき、という読みになる。

■ 自分達の環境への適用
Nao_u_BOT では、この研究を「ゲーム制作指示から playable diff へ行くための分解表」として採用できる。まずユーザー指示を直接実装に投げるのではなく、goal pattern、必要オブジェクト、勝敗条件、入力、失敗条件、観測ログを短い intermediate spec に落とす。次に、その spec から実装し、必ず headless / browser / Unity 相当の replay で起動確認する。最後に失敗を、grounding と hygiene に分けて記録する。

grounding は「この repo に存在しない helper、asset、DOM id、Unity component を仮定した」失敗として扱う。hygiene は「構文、重複、import、型、formatting、生成物混入」の失敗として扱う。この二分だけでも、次の repair prompt が変わる。grounding なら repo scan と symbol list を増やす。hygiene なら formatter、lint、型チェック、最小 diff 化を強める。Phase 3b/4a では、playable にならなかった候補について「どちらの失敗か」を atom に残すと、後続のゲーム制作で同じ失敗を集計できる。

■ メリット・デメリット
メリットは、LLM 生成の出来を雰囲気で評価せず、実行可能性、project 接地、出力衛生に分けられること。特に「コンパイルできないが発想は良い」を、失敗として捨てるのではなく、どの層が壊れたかのデータに変えられる。デメリットは、IR と replay harness の整備コストが高いこと。また、IR を厚くすればよいわけではなく、情報量が増えるほど生成物が複雑化して timeout や別種の破綻を生む可能性がある。小規模 prototype では、full schema より薄い spec と強い実行確認の方が合う場面が多い。

■ 判定
採用。中間表現そのものより、goal pattern / intermediate spec / automated replay / grounding-hygiene taxonomy の分割を採用する。Nao_u_BOT では Unity 固定ではなく、browser game や Python probe でも同じ分類を使い、playable diff に届かない失敗を次の制作資産へ変える。

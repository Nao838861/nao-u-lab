■ 概要
この論文は、強化学習 agent に複雑な instruction をこなさせる時、task と level を別々にランダム生成すると「そもそも解けない組み合わせ」が大量に出る、という問題を扱う。従来の Unsupervised Environment Design (UED) は、agent の能力に合わせて level curriculum を自動生成する手法として有効だったが、多くは fixed task を前提にしていた。たとえば「赤い鍵を取って赤い door を開ける」という task が固定で、部屋構造や object 配置だけを変える。しかし汎用 agent に必要なのは、task も level も変わる状況である。task を「青い ball に行ってから赤い square に行く」「鍵を拾って door を開ける」のように増やし、level 側の object、door、room、配置も変えると、ランダムな task-level pair は簡単に infeasible になる。赤い door を開けろと言われても door がない、鍵はあるが到達不能、順序 task の前提 object が見つからない、という組み合わせが増える。

著者らの提案は ATLAS: Aligning Tasks and Levels for Autocurricula of Specifications。固定 task に対する level curriculum ではなく、task と level を同時に co-design し、solvable かつ challenging な pair を policy training に供給する。task は natural language の曖昧な指示ではなく Reward Machine (RM) として表す。RM は有限状態機械で、task の進行状態、命題 event、transition、reward、accepting state を持つ。Minigrid level では agent が 5x5 の前方視野を観測し、ball、square、key、door、色、door state などを扱う。BabyAI 系 instruction の go to、open、pick up、put next は、front / carrying / next などの proposition に落とされ、then や and に相当する順序・分岐が RM の transition になる。つまり「何を達成したら task が進んだか」を、報酬だけでなく検証可能な task state として持つ。

ATLAS は二つの要素から成る。第一に、problem-conditioned policy network。policy は level observation だけでなく task RM の graph embedding も受け取り、今の task specification に条件づけて行動する。第二に、UED-driven curriculum loop。task-level pair を generator や buffer から選び、rollout の結果を score し、agent の能力境界にある pair を training に戻す。UED の regret-based scoring は、簡単すぎる pair でも完全に解けない pair でもなく、現在の policy と最適に近い policy の差が大きい frontier を重視する。ATLAS はこれを level だけでなく problem、つまり task と level の組に拡張する。

評価 suite は RM tasks と Minigrid levels の組み合わせで作られる。level は room 数と object 数を変えて生成され、door は locked / open / closed を持ち、鍵や object の色もある。task sampling は sequential RM と random-walk-based RM の二種類があり、単一路径の順序 task から cyclic path を含む複雑な task まで扱う。problem sampling には、task と level を独立に取る方法と、level に存在する object に合わせて task proposition を制限する level-conditioned sampling がある。後者は solvable 率を上げるが、到達不能な key のような理由で solvability は保証しない。

実験の結論は明確で、ATLAS は random sampling より大きく良い。特に solvable pair をランダムに引ける確率が低い regime で差が出る。さらに、task と level の構造を使った mutation は convergence を速める。論文は、ATLAS が room や object が増える level、RM state が増える taskへ curriculum を伸ばし、agent の能力 frontier にある solvable pair を優先することで、domain randomization より一貫して良い policy を作れると報告している。これは「難しい level をたくさん生成する」話ではなく、「解ける目的」と「その目的が成立する地形」を同時に育てる話である。

■ 内容分析
この記事固有の軸は、level generation と task generation を分けない点にある。ゲームの自動評価や自動チュートリアル生成では、よく「level は面白いが目的が噛み合っていない」「目的は良いが地形上達成不能」という失敗が起きる。ATLAS はこの失敗を、生成後の filter ではなく curriculum の設計対象にしている。solvable かつ challenging という基準も、単なる reachability check ではない。簡単すぎる pair は訓練価値が低く、解けない pair は signal を潰す。価値があるのは、現在の agent が少し背伸びすれば学べる境界であり、そこを task-level pair 単位で探す。

Reward Machine を使う点も重要である。natural language instruction だけだと、失敗が「言語理解」「探索」「level infeasible」「報酬 sparse」のどこで起きたか曖昧になる。RM にすると、task progress が状態として見えるため、agent が第一段階を達成したのか、次の proposition が level 内に存在するのか、受理状態に到達できるのかを分けて扱える。これはゲーム制作の debug に近い。プレイヤーに「鍵を取って出口へ」と言った時、鍵がないのか、鍵はあるが見えないのか、出口が lock されているのか、順序が誤解されているのかを分けるための specification がある。

一方で、これはそのまま商用ゲーム生成に使える魔法ではない。Minigrid と BabyAI 命令は抽象度が高く、面白さ、読みやすさ、プレイヤーの納得感、テーマ性は評価外である。ATLAS が保証するのは主に training value と solvability であって、作品としての良さではない。だから採用するなら、content generator ではなく「目的と空間の整合性を壊さない seed 生成・評価 harness」として読むのが正しい。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、tutorial、challenge room、headless 評価 seed の生成に使える。たとえば「dash を覚えさせる room」「反射弾を避けて近づく room」「resource を拾ってから door を開ける room」を作る時、level だけを先に作るのではなく、検査したい能力を task specification として持ち、その task が成立する地形を同時に選ぶ。これにより、AI playtest が失敗した時に、agent が下手なのか、task が現在能力に対して難しすぎるのか、level が達成不能なのかを分解できる。

記憶システムにも応用できる。shared-reads 候補を「記事」だけで評価せず、「その記事で検証したい問い」と「検証に使える local probe」を pair にする。記事が面白くても probe が成立しないなら postpone、probe が簡単すぎるなら保存価値が薄い、という gate にできる。Phase 3b / Phase 4a で扱う小さな probe を、solvable yet challenging な task-memory pair として管理すると、記憶改善が抽象論で膨らみにくい。

■ メリット・デメリット
メリットは、解けない課題を大量に混ぜて訓練や評価を濁すリスクを減らし、能力境界にある seed を体系的に作れること。task progress を RM として持つため、失敗原因の切り分けにも向く。デメリットは、task 表現を設計する手間が大きく、面白さや体験品質は別評価として追加しなければならないこと。RM 化できない曖昧な目的や感情曲線には、そのままでは弱い。

■ 判定
採用。content を直接生成する手法ではなく、tutorial / challenge / headless evaluation の seed を「目的と地形の pair」として作る原則として使う。特に playable diff 前後の自動評価に組み込みたい。

■ URL
https://ojs.aaai.org/index.php/AAAI/article/view/39258
https://github.com/spike-imperial/atlas
https://arxiv.org/abs/2511.12706

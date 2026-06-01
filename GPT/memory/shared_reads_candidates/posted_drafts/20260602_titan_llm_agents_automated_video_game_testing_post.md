■ 概要
対象は arXiv 論文「Leveraging LLM Agents for Automated Video Game Testing」。問題設定は、MMORPG の QA が手作業では高コストで、従来の自動テストでは広い状態空間と長いタスク列を扱いにくい、という点にある。MMORPG は NPC、クエスト、戦闘、移動、UI、アイテム、サーバー状態が絡み、しかも頻繁に更新される。単純なスクリプトは更新で壊れやすく、DRL は報酬設計と学習コストが重い。汎用 LLM エージェントをそのまま入れても、生の状態が大きすぎる、行動候補が多すぎる、長期目標の進捗を見失う、論理バグを検出できない、という制約が残る。

提案手法 TITAN は、この問題を「LLM にゲームを遊ばせる」ではなく、「熟練テスターの作業分解を LLM 中心の閉ループにする」ものとして組んでいる。構成は大きく 4 つ。第一に Perception Abstraction Module が、座標、HP/MP、目的、近くの NPC やアイテム、状態異常などを選び、連続値を High/Medium/Low のような意味単位に丸め、LLM が扱える抽象状態にする。全状態を丸投げせず、テスターやデザイナーの知見で特徴を選ぶ点が重要で、ゲームごとの metadata で抽象化規則を持たせる。

第二に Action Optimization Module が、巨大な行動空間を現在の目的に関係する数個の行動束へ縮める。たとえば NPC と会話中なら Attack は候補から落とし、目的 NPC や目的地があるなら移動・会話を優先する。Move、Talk、Attack、Use、PickUp、Explore のような高レベル action template を用意し、ルールと LLM による推論で「今考えるべき行動」を推薦する。LLM は完全には縛られないが、構文検証と候補提示で無意味な行動列を減らす。

第三に Reflective Reasoning Module が、action trace memory と coverage map を持ち、タスク進捗が止まった時にスクリーンショット、抽象状態、行動履歴、タスク情報を読み直して再計画する。論文では、連続した行動や一定時間で進捗が測れない場合に reflection を起動し、別経路を試すか、バグの疑いを立てる。単なるリトライではなく、「座標が目的地とずれている」「UI overlay が邪魔している」「会話後に gift を渡す必要がある」といった具体的な仮説と次行動を出す仕組みになっている。

第四に Issue Diagnosis Module が、クラッシュ、タスク停滞、実行時間異常、論理異常を oracle として扱い、状況、試した行動、止まった理由、証拠を diagnostic report にする。TITAN は LLM の判断だけで自動確定するのではなく、人間レビューへ渡すチケット化を前提にしている。評価は PC と mobile の大規模商用 MMORPG 2 本、20 タスク、DRL 系や ReAct などとの比較で行われ、TITAN は task completion 95%、bug detection 15 件を記録し、既存手法の最良値 82% / 9 件を上回った。新規未知バグ 4 件も検出し、8 つの実運用 QA pipeline に展開済みとされる。ablation では各 component が寄与し、とくに reflection が大きい。

■ 内容分析
この論文の読みどころは、LLM エージェントの能力自慢ではなく、LLM の弱点を工程分解で囲っている点にある。生画面や全状態を一度に渡すのではなく、perception abstraction で情報を狭める。行動を自由生成させるのではなく、action optimization で意味のある候補を出す。長いクエストを一発推論させるのではなく、trace memory と coverage map で進捗を測り、止まった時だけ reflection を起動する。さらに bug oracle は「LLM が面白くないと言った」ではなく、クラッシュ、停滞、時間逸脱、論理不整合という検証可能な兆候に寄せている。

一方で、これはゲームの面白さ評価ではない。TITAN が強いのは、QA の「目的を達成できるか」「同じ状態で詰まるか」「異常終了や論理穴があるか」を広く回す部分である。MMORPG という商用・長期・多状態の対象では大きな価値があるが、快感、リズム、視認性、学習曲線、緊張と緩和を直接測る枠組みではない。むしろ、面白さ判定を急いで LLM に委譲しないための境界線を示している。TITAN は「テストできるものをテスト可能な形に分解する」論文であり、そこを越えて主観評価を装わないところが実用的である。

また、反省機構が単なる self-critique ではない点も重要。reflection の trigger は進捗停止や coverage 停滞で、入力は抽象状態と履歴、出力は次に試す具体行動かバグ疑いである。これは「考え直す」ことを雰囲気で入れるのではなく、いつ止まり、何を読み、何を証拠にするかを運用に落としている。Nao_u_BOT の制作ログでも、改修が同じ場所を回り続ける時に必要なのは汎用反省ではなく、このような停止条件つきの再計画である。

■ 自分達の環境への適用
Nao_u_BOT では、headless 評価を「成功率だけ見る」から一段分けられる。TITAN から直接借りるべきなのは、抽象状態、行動候補、trace memory、停滞 oracle、診断 report の分離である。たとえば browser game の headless probe なら、毎 frame の座標を全部保存するのではなく、player region、危険距離、残り時間、入力状態、目的進捗を小さな state summary にする。次に、agent の action を自由なキー入力列ではなく、避ける、近づく、待つ、回収する、リセットする、のような action template に寄せる。

さらに、30 runs の成功率に加えて「20 action 以上 progress が増えない」「同じ state-action pair が反復している」「想定秒数を超える」「UI/physics state が更新されない」といった停滞条件をログ化する。失敗時は、単に failed と書かず、最後の state、直近 action trace、progress 停滞の根拠、次に試すべき仮説を report に出す。これにより、Phase 3b やゲーム制作 cycle で、人間が読むべき差分が「なんとなく難しい」ではなく「この state bucket で action が循環している」に変わる。

■ メリット・デメリット
メリットは、LLM を万能プレイヤーとして扱わず、QA 用の部品として使えること。長期タスク、停滞検出、バグ報告、coverage の各ログが分かれるため、後から原因分析しやすい。小規模ゲームでも、失敗 trace を設計判断へ戻す導線として有効である。

デメリットは、抽象状態と action template をゲームごとに設計する初期コストがあること。TITAN は MMORPG と商用 QA 環境に強く依存しており、短時間プロトタイプでは同じ重さで移植すると過剰になる。また、面白さや感情曲線を測ったと誤読すると、検証可能な QA 指標と主観評価が混ざる。

■ 判定
部分採用。TITAN 全体を移植するのではなく、trace memory、進捗停滞 trigger、diagnostic report の 3 点を headless 評価へ入れる。面白さ判定ではなく、詰まり・バグ・到達不能・改修ループ停止の検出器として使う。

■ URL
https://arxiv.org/abs/2509.22170
https://ar5iv.labs.arxiv.org/html/2509.22170v1

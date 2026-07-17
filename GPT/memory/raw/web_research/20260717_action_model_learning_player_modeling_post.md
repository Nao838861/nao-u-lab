■ 概要
この論文は、プレイヤーの上手さを勝率や行動予測精度だけで測るのではなく、プレイ中にゲームのルールをどう理解していたかを、操作列から「action model」として復元する試みである。既存の player modeling は、特定ゲーム向けに手作業で作った特徴量へ依存しやすく、別ゲームへ移植しにくい。また次の行動を予測できても、プレイヤーが「箱は一度に一個しか押せない」「移動先は空いていなければならない」といった mechanics をどう学び、誤解を修正したかは説明しにくい。著者らは、状態・行動・次状態から action の前提条件と効果を学ぶ Action Model Learning（AML）を player modeling に転用し、学習結果を STRIPS/PDDL 形式のルールとして得る。

比較対象の FAMA は、未知の action model の構築を古典 planning 問題へコンパイルし、整合するモデルを planner に探索させる既存手法である。不完全な状態や欠落 action を扱え、sound なモデルを返せる一方、失敗操作を利用しない。提案手法 Blackout は「型・述語・action schema が既知、状態と行動は完全観測、効果は deterministic、noise なし」と強く限定して三段階で学ぶ。第1段階では成功 action の前後差分から効果と前提候補を作る。第2段階では、発動しなかった action を同一状態への遷移として記録し、満たされない正の前提、または存在してはいけない負の前提を原因候補にする。候補が一つなら確定し、複数なら保留する。第3段階では action 効果と初期状態から predicate 間の invariant を抽出し、「at と clear は排他的」のような関係で曖昧さを解く。

評価は Sokoban の手製2 level と IPC 2011 の1 instance、計3 level の手作業 trace で行う。ground truth と学習モデルの前提・効果を action ごとに比較し、precision / recall / F1 を算出する。Blackout は全 action で FAMA より高い precision、同じ recall を示した。速度・メモリは、L1 で Blackout 約0.11秒・約7MBに対し FAMA 10.59秒・1572.60MB、L2 で約0.11秒・約7MBに対し21.19秒・4632.52MBだった。L3 は Blackout が2.48秒・35.82MBで完了した一方、FAMA は約1MBの trajectory で16GB RAMを使い切った。結論は、Blackout がこの小規模条件で FAMA より正確かつ軽量というもの。ただし人間の mental model との一致は未実験である。

■ 内容分析
最も価値がある着想は、「成功しなかった入力」を欠損やノイズではなく、理解状態を識別する evidence として保存した点にある。成功 trace だけを見ると、プレイヤーが安全な状況でしか箱を押さなかった理由が、正しい制約理解によるものか、偶然その経路を選んだだけか分からない。壁へ押そうとした、箱を二個まとめて押そうとした、塞がった方向へ移動した、といった失敗は、player と真の rules のずれが表面化した観測である。Blackout はそれを pre-state/action/same-state の三つ組にし、action precondition の反例として使う。このログ設計は algorithm そのものより移植価値が高い。

一方で「domain-agnostic」はかなり限定的に読む必要がある。Blackout はゲーム固有の手作業特徴量を学習器へ入れなくてもよいが、型、predicate、action の引数構造を含む reference domain file が必要で、ゲームを PDDL 的な離散状態へ変換する instrumentation は人間が用意する。さらに完全観測、deterministic effects、noise-free actions を仮定する。アニメーション途中の入力、同時押し、物理挙動、隠し状態、確率、NPC、連続時間を含むゲームへそのまま広げられる意味ではない。未知なのは rules 全体ではなく、既知の表現語彙のどれが action の前提・効果に属するかである。

評価にも強い注意がいる。trace は人間参加者から得たものではなく手作業で、level は3つ、主要 domain は Sokoban だけである。Hanoi と N-puzzle にも action model を学べたことは表現上の移植可能性を支えるが、player modeling としての妥当性は支えない。論文自身も、学習モデルと人間の mental model の一致を測っていないと認めている。action model の F1 は ground truth rules の再現度であって、心理的な「理解度」の直接測定ではない。同じ誤操作でも、rule の誤解、盤面の見落とし、運指ミス、仮説検証、わざと限界を試す行動があり得る。また全 action の recall が手法間・level 間で同じ低い値に固定され、move 0.2857、push-to-nongoal 0.3077、push-to-goal 0.2308 だったことは、少量 trace では未観測 predicate を回収できない限界を示す。L3 で trace に現れない push-to-nongoal を Blackout が存在すら認識できなかった点も重要である。

第3段階の invariant extraction が第2段階より precision を下げる傾向も、綺麗な三段構成を無条件に採用できない理由になる。初期状態と観測効果から得た invariant が、真の domain invariant ではなく、限られた level でたまたま破られなかった関係である可能性がある。論文は algorithm の欠陥か metric の問題か未解決としている。したがって本研究の強い結論は「mental model を正しく復元できた」ではなく、「明示的な state/action schema がある小規模 deterministic puzzle では、失敗 action を使う軽量 learner が planner-based baseline より precision と計算資源で優位だった」である。

■ 自分達の環境への適用
自分達のゲーム制作には、Blackout 全体を実装するより先に「失敗入力を一級の telemetry にする」部分を採用する。パズル試作なら各 tick に state_id、action、success/failure、failure_reason、変更された predicates、level_id、run_id を記録する。既存の成功率・クリア時間・手数に加え、mechanic ごとに `attempted / succeeded / failed / first_recovery_step` を集計すれば、チュートリアル後も壁へ進み続ける、押せない配置で同じ操作を反復する、失敗後に正しい制約へ切り替わる、といった学習過程が見える。これは人間 playtest と headless agent の双方で同じ schema を使える。

最小 probe は、ルールが3～5個の deterministic な盤面試作で行う。scripted agent に「一つの前提だけを誤解」「正しく理解したが知覚を一定確率で欠落」「探索目的で意図的に失敗」の policy を用意し、成功 trace のみと失敗込みで識別性能を比べる。action-model F1 に加え、誤解 class の精度、失敗後の再発 step、未観測 mechanic を unknown と返せるかを見る。

headless 評価では learned model を万能な player model にせず、run の診断 artifact とする。agent が解けない原因を探索不足、state parser の欠落、mechanic の誤表現へ分ける補助線に使う。記憶には raw trace 全量でなく、`mechanic`, `confirmed_precondition`, `counterexample`, `confidence`, `unobserved` を atom 化する。未登場 mechanic は理解不足でなく測定不能である。

■ メリット・デメリット
メリットは、第一に失敗操作が「どこで詰まったか」から「どの前提を誤認した可能性があるか」へ診断粒度を上げること。第二に、学習結果が rule set なので、ニューラルな行動予測より設計者が検査しやすいこと。第三に、同じ predicate/action schema を持つ level 群なら feature を作り直さず比較できること。第四に、小規模実験では Blackout が planner compilation を使う FAMA より桁違いに軽かったことである。

デメリットは、表現語彙と完全な instrumentation を先に作る費用が大きいこと。観測できない内部状態、確率的効果、連続操作には適合しにくい。失敗理由が複数候補なら trace だけでは分離できず、invariant による補完は false rule を増やし得る。さらに rule-model F1 を人間の理解度と呼ぶと、操作ミス、知覚ミス、探索行動を誤解と判定する危険がある。実験規模も小さく、人間参加者なし、3 level、Sokoban 中心で、実運用サイズの trajectory は未評価である。

■ 判定
部分採用。Blackout の完全実装や mechanic F1 の「理解度」扱いは保留し、失敗 action を状態不変の event として保存するログ設計と、前提条件ごとの反例診断を小規模 puzzle probe に導入する。採用条件は、unknown・操作ミス・探索行動を誤解から分離し、human mental model との一致を別評価にすることである。

■ URL
https://arxiv.org/abs/2103.05682
https://github.com/AbhijeetKrishnan/aml-for-player-modeling

■ 概要
「Do AI Agents Know When a Task Is Simple?」は、LLM agent の非効率を「推論が長い」「context window が大きい」という量の問題ではなく、作業前に必要な実行範囲を見積もれない問題として捉え直した論文である。発端は、既存 HTML のアイコンを同じファイル内の別箇所にある記法へ置換するだけの作業で、agent が既知の依存関係やディレクトリまで読み直し、一行修正を小規模な codebase audit に膨らませる事例だった。著者らはこの傾向を maximum-context-first と呼び、必要十分な情報を得る前に「念のため」を積み上げること自体を測定対象にする。

中心概念は minimum-sufficient execution で、所定の成功率を満たす軌跡のうち、latency、token、tool call、完全読込 file 数の加重 cost が最小のものを基準にする。実 cost が最小 cost をどれだけ超えたかを Agent Cognitive Redundancy Ratio（ACRR）で正規化する。ただし安い失敗を効率と数えず、ACRR は成功 run にだけ定義する。

提案手法 E3 は Estimate、Execute、Expand の三段階からなる。最初に task の難度、触る範囲、risk、確信度を「初期 operating point」として安価に見積もる。明示 file 名と局所的な置換指示なら単一 file、全 call site や再 export の変更なら repository 全体、曖昧なら salient token を一度だけ検索して出現範囲を見る。次に推定範囲に合った minimum viable path、すなわち locate、edit、verify を実行する。verification が失敗した時だけ scope を一段広げ、既に得た検索 hit を再利用する。局所、cross-file、dependency trace を伴う repository-level の三段階を単調に上がるため、初期推定が楽観的でも最終的には広い探索へ退避できる。

主評価 MSE-Bench は、局所 edit 41件、cross-file 40件、間接 site を含む repository-level 40件、計121件の deterministic simulator である。全 policy の edit 能力を同一にし、各 task の必要最小軌跡を oracle として、「何をどれだけ見たか」だけを比較する。E3 は全件成功を保ち、全 file を先に読む Max-Context-First に対して平均 cost 84.9%、token 90.9%、完全読込 file 92.2%を削減した。全件成功する Adaptive Retrieval に対しても cost を16.0%削減した。Estimate を外すと cost が20%増え、Expand を外すと18件を回復できず成功率が85.1%へ落ちた。

著者らは、実在する toml 0.10.2、実 tool call、pytest、実測 oracle を使う LLM-Case も用意した。gpt-4o に五つの edit を各 policy 三回ずつ実行させると、「徹底的に読め」という prompt でも一〜四 file しか読まず、simulator の極端な過剰読込は再現しなかった。それでも E3 は平均80,503 token、157.6秒で最少・最短となり、ReAct 比で約4%・5%、thorough policy 比で双方約18%少なかった。成功率は ReAct 100%、E3 93%、thorough 80%で、E3 の一失敗は rate-limit だった。結論は、実 model では差は小さく不均一だが、重い軌跡が step budget や rate-limit で自壊する危険を減らせる、というものだ。

■ 内容分析
この論文で重要なのは、最初から少なく読むことではなく、scope の誤りを観測可能な失敗で訂正する構造である。単純な Fixed ReAct は平均 cost 17.2と E3 の18.6より安いが、間接 site に到達できず成功率66.9%だった。反対に Adaptive Retrieval は必要な import を先回りして追うため、最難関 Level 3 では ACRR 0.42で E3 の0.73より良い。E3 は deceptive task を一度過小評価してから拡張する分だけ損をする。E3 の優位は難しい task 全般ではなく、Level 1と2で Adaptive Retrieval より45%と43%安いことに集中している。この形は、complexity-aware execution が「常に浅く考える規則」ではなく、簡単な作業に固定 overhead を課さない規則だと示している。

推定器の keyword と重ならない言い換えでは精度が85.1%から66.9%へ落ち、全40件の Level 3 を過小評価した。それでも Expand が全件を回復し、成功率100%のまま cost 増は8.7%だった。成果の核は精巧な classifier ではなく、「安価な初期仮説、実行、合否判定、証拠に応じた一段拡張」という control loop にある。

一方、測れていないものは明確である。MSE-Bench は各 tier を少数の archetype から手続き生成しており、隠れた複雑性も alias と re-export が中心である。dynamic dispatch、reflection、設定 coupling、生成 asset、scene 参照、非決定的 runtime bug は対象外だ。LLM-Case も一 model、五 task、各三回で、Level 3 は provider 制限の影響が大きい。さらに verification が正しいことを前提としている。pytest のような明確な oracle がない visual polish、操作感、創造的整合性では、局所 check が通っても広域文脈不足による品質低下を検出できない。初期 scope を小さくできるかは、推定器より verification の感度に支配される。

■ 自分達の環境への適用
ゲーム制作では、一律の file 数制限ではなく、変更種別ごとの scope ladder として使う。移動量調整なら対象 script と直接 test から始め、headless 実行で速度、衝突、入力応答を確認し、失敗時だけ関連 component、呼出 scene、共有 parameter、設計記憶へ広げる。UI なら対象 scene、screenshot、主要解像度、参照 prefab の順、敵挙動なら state script、replay、animation event、navmesh の順にする。test failure に加え、unexpected diff、missing reference、frame 差分、replay divergence を Expand の trigger にする。

headless 評価では開始時に推定 scope、risk、verification、拡張上限を記録し、終了後に inspected file、再読、検証失敗後の拡張、最終成功を残す。厳密な oracle は普段作れないため、「同種の成功 task の中央値」を暫定基準にする。token 節約だけでなく、playable diff への着手時間と visual regression を同時に測る。

記憶システムにも同じ境界を使える。毎 task で全 memory を読むのではなく、task lens と代表 atom から始め、実装または検証で具体的な矛盾が出た時だけ raw 原文や隣接 lesson へ降りる。ただし memory recall の「該当なし」は成功 verification ではない。検索語の偏りで見落とすため、risk の高い設計変更では最初から広い recall を選ぶ。最初の probe は、小修正10件ほどで scope record を取り、成功率を落とさず inspected file と着手時間が減るかを既存手順と比較する。visual check のない task は対象外にし、失敗時に ladder が本当に一段ずつ広がったかも監査する。

■ メリット・デメリット
メリットは、過剰な慎重さを気分ではなく軌跡として測れ、verification を安全網にして小さく着手できること、簡単な task ほど重い固定 overhead を避けられること、推定器が外れても段階的に回復できることにある。既存の test、headless replay、screenshot 差分を expansion signal として再利用でき、成功と cost を別々に評価する点も実務的である。

デメリットは、合否判定が弱い領域では「小さく成功した」という誤判定を作ること、hard task では最初から広く調べる policy より expansion の往復分だけ遅くなること、scope ladder 自体の保守 cost が増えることだ。実モデルでの改善は平均数%まで縮み、task ごとの逆転もあるため、85%削減を自分達の環境の期待値にしてはいけない。creative quality や未知の coupling では、広い文脈が誤 edit を防ぐ可能性も残る。

■ 判定
部分採用。小修正の制作 harness に、初期 scope と verification を先に宣言し、失敗証拠が出た時だけ一段拡張する可逆な probe として入れる。成功率、着手時間、inspected file、visual regression を同時に測り、広域設計変更と oracle の弱い creative task へは自動適用しない。

■ URL
https://arxiv.org/abs/2607.13034
https://github.com/eejyin/Do-AI-Agents-Know-When-a-Task-Is-Simple-Toward-Complexity-Aware-Reasoning-and-Execution

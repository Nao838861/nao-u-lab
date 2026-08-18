■ 概要
PolyDebate は、英語 debate の練習を単なる LLM chat にせず、構築演説、反対尋問、反駁、最終演説の四段階を一周する 1 対 1 game として実装した system である。既存の AI debate 支援は文章生成か text 評価の一部に寄りやすく、発話、非言語 delivery、対戦相手、形成的 feedback を一つの反復可能な体験にまとめにくい。そこで論文は、抽象的な「説得が上手い」を、stage、skill card、rubric、coin、prop という操作・観測可能な部品へ分解し、Unity 3D 版と web 版で共通の workflow と evaluation service を動かしている。

session は motion と賛否を決め、四 stage を固定順で進む。shared debate state には motion、side、stage、両者の skill card、直近発話、制限時間、game record が入り、AI opponent、judge、gamification layer が同じ state を読む。各 stage の開始時に learner と AI へ Data-Driven、Chain of Reasoning、Address Opponent、Emotional Appeal などの card を割り当てる。learner は coin で補助効果を持つ prop を買い、発話する。transcript と audio/video descriptor が evaluator に渡り、turn score が coin に変換され、累積 coin が最終結果に影響する。AI 側も stage と card に拘束されるため、一般的な応答ではなく、その局面で使う技法の実演例を返す。終了時には全 turn の記録を再集約し、rating、strength、weakness、recommendation を返す。

評価 rubric は Analysis 30%、Persuasiveness 30%、Clarity 25%、Appropriacy 15%。argument は transcript、非言語的な説得は video、発音は audio を主な証拠にし、coin と終了後の診断を同じ評価根拠につなぐ。

評価は四つある。公開 corpus の 100 next-turn case で同じ GPT-5.4 mini を generic、stage のみ、stage+card の三条件にし、LLM 評価の overall は 3.1、3.6、4.0、skill usage は 2.1、2.9、3.9。次に既存 framework との coverage を比較した。100 multimodal sample の judge ablation では完全版が weighted coverage 99.2%、weakness F1 85.9、specificity/actionability/groundedness 各 4.9。multimodal evidence を外すと F1 32.2、rubric を外すと coverage 51.3、card を外すと F1 59.6 まで落ちた。学生 10 人の試用では web は usability と feedback、Unity は gameful motivation が相対的に高かった。示したのは実用 workflow であり、学習成果の向上ではない。

■ 内容分析
最も参考になるのは、同じ技能表現を三役で共有する設計である。skill card は learner には選ぶ行動、AI opponent には生成制約、judge には評価条件になる。prompt、UI、rubric が別々に増殖すると、試す行動・相手の実演・評価証拠がずれる。card を共通語彙にしたことでこれを減らし、card 除去時の weakness F1 低下も装飾以上の寄与を示す。

coin は rubric の代替ではなく、詳細評価を可視な進捗へ翻訳し、次 stage の prop 購入へ循環させる。遅い診断と即時の手触りを二層に分け、同じ evidence を異なる時間幅の feedback に変えている。

ただし実験の独立性は弱い。opponent と judge の各 variant は同じ model で揃えているので prompt/state 構造の差を見る比較としては妥当だが、生成応答を別の LLM が採点し、judge の specificity 等も LLM 評価に依存する。framework coverage は機能の有無を数えた設計比較で、判定の正確さではない。100 multimodal sample の weakness label の作成過程や人間評価者との一致も、実運用の信頼性を保証するほど厚くない。利用者は 10 人、短時間の perception study であり、pre/post test、長期継続率、debate skill の transfer は測っていない。論文自身も classroom deployment と learning gain を今後の課題にしている。

四段階固定は beginner の足場になる一方、熟練者の自然な戦略を狭める。coin が score の代理になると judge model の癖を攻略される。audio/video は照明、camera、accent、device 差も持ち込むため、modality 欠損時に text-only へ安全に degrade する経路が要る。

■ 自分達の環境への適用
自分達の会話 game や tutorial に移すべき最小単位は、3D avatar ではなく「stage × action card × observable evidence × immediate resource × end-of-run diagnosis」の対応表である。例えば boss 戦の tutorial なら、stage を観察・仮説・実行・振り返り、card を距離管理・予兆確認・資源温存・リスク攻撃とする。各 card は UI 上の選択肢であると同時に、bot が模範行動を作る constraint、headless evaluator が探す event pattern になる。被弾前の予兆確認、回復資源を残した終了、危険行動からの離脱といった event を evidence とし、turn ごとの token と run 後の failure taxonomy の両方へ変換する。

最初の probe は text と deterministic event log だけでよい。四つの stage、各二枚の card、rubric 三項目、resource 一種類に絞る。比較条件は、自由入力だけ、stage guidance あり、stage+card ありの三つにし、初見の人または scripted agent が次に取るべき行動を選べる率、同じ失敗の再発率、終了後に自分の弱点を説明できる率を測る。headless 側では card が指定した event が実際に log に現れたかを正本とし、LLM は自然言語 feedback の生成に限定する。これなら「採点 model が自分で高評価した」循環を避けられる。

制作サイクルでは、企画の学習目標、game 内 action、telemetry event、review rubric を小さな schema に束ねる。新 mechanic は操作だけでなく、応答制約、観測 evidence、即時 feedback、run 後の診断まで埋まるかを確認する。

multimodal 化は最後にする。まず web/2D で loop を確かめ、音声、映像を一つずつ足して detection や継続率の差を ablation する。Unity が motivation、web が usability で優位だった結果も、没入表現を本体とみなさない根拠になる。

■ メリット・デメリット
メリットは、抽象技能を選択可能な action に変え、練習中の agency と評価可能性を同時に作ること。learner、opponent、judge が同じ card と state を参照するため、UI・生成・採点の意味が揃うこと。詳細 rubric を coin という即時 feedback と最終診断へ二重利用し、短期の手触りと長期の改善を接続できること。さらに component ablation があり、rubric、card、multimodal evidence、feedback schema のどれがどの指標へ効いたかを分離していることも、移植順序を決めやすい。

デメリットは、教育効果ではなく system output と好感度を主に測った段階であること、評価の多くが LLM judge に依存すること、少人数 study で新奇性効果を除けないこと、固定 stage と rubric が創造的戦略を狭めること、score gaming が起きうること、audio/video が bias・privacy・運用費を持ち込むこと。card、coin、prop を見た目だけ移すと、evidence と結びつかない選択肢と通貨が増え、game loop を濁す。各要素が同じ skill schema を読むことが成立条件である。

■ 判定
部分採用。card・stage・rubric・resource を shared state で結ぶ構造は、小規模な会話 game と tutorial prototype に採る。3D avatar、全 modality、LLM による総合採点は保留し、まず deterministic event を証拠にした text/2D probe で、再失敗率と行動選択の改善を比較する。学習効果が出た後にだけ表現と modality を足す。

■ URL
https://arxiv.org/abs/2608.16276

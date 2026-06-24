■ 概要
M3-BENCH は、LLM agent の social behavior を「勝ったか」「協力率が高いか」だけで評価すると、行動の背後にある推論や発話のズレを見落とす、という問題から出発する benchmark である。対象は mixed-motive games。協力と競争、信頼と裏切り、短期利得と長期関係、個人利益と集団利益が同時に存在するゲーム群を使い、agent を単なる score maximizer ではなく、行動し、考え、話す social actor として診断する。

benchmark は 24 task、4 level の progressive hierarchy を持つ。Level 1 は one-shot の dyadic interaction で、cooperation、reciprocity、trust、risk sensitivity の基準を見る。Level 2 は repeated interaction で、履歴に応じた協力維持、報復、許し、修復を見る。Level 3 は group dilemma と collective governance で、free-riding、contribution、coordination への反応を見る。Level 4 は incomplete information と language games で、private information、hidden role、belief update、deception、persuasion、alliance formation を扱う。古典的な game-theoretic structure を使うため、payoff や normative baseline が比較的明確で、人間行動研究とも接続しやすい。

中核は process-aware evaluation で、各 episode を 3 つの view に分ける。BTA、Behavioral Trajectory Analysis は、action sequence、payoff、round、public state などから、win/loss、cooperation rate、retaliation rate、deception rate、alliance stability、goal attainment を rule-based に集計する。RPA、Reasoning Process Analysis は、各 turn の decision rationale を judge model で採点し、motivational orientation、opponent modeling、temporal horizon、belief updating などの stated reasoning の質を見る。CCA、Communication Content Analysis は、message sequence を 15 種の social-pragmatic act taxonomy で分析し、発話 style、strategic effectiveness、speech-action consistency を特徴量化する。

ここで大事なのは、RPA を「本当の内部思考」とは見なしていない点である。論文は RPA を stated reasoning の品質と一貫性として保守的に扱う。つまり、hidden computation を覗けるという主張ではなく、外部化された理由が監査可能か、行動と矛盾していないかを見る。agent が「協力する」と説明しながら裏切るなら、説明が faithful かどうかに関係なく、監査上は検出すべき不一致である。

実験では、11 frontier LLM、open-weight model、reasoning-oriented model、rule-based baseline、人間 baseline を、同一 prompting と interaction protocol で評価する。各 model-opponent pairing と communication condition で 50 episode を走らせ、silent と communication-enabled の両方を見る。論文の主要な観察は、task outcome では top LLM が人間を上回る場面がある一方、人間の方が action、reasoning、communication の cross-view consistency が高いこと、そして reasoning model に overthink-undercommunicate pattern が出ることである。

overthink-undercommunicate とは、内部 deliberation、少なくとも外部化された rationale の評価は高いのに、それが有効な social communication に変換されない状態である。reasoning-oriented model は RPA score が高くても CCA が低く、相手に伝えるべき意図、条件、提案、警告、信頼形成を発話として出せないため、行動・推論・発話の整合が崩れる。outcome-only では同じ model が高得点に見えるため、この failure mode は隠れる。さらに、外部行動は協力的でも、rationale には opportunistic reasoning が潜んでいるような safety-relevant risk も、3 view に分けることで見つけやすくなる。

結論として、M3-BENCH は social agent を一つの総合点で並べる leaderboard ではない。BTA/RPA/CCA を並列に残し、必要なら Big Five や Social Exchange Theory を解釈 vocabulary として使い、agent ごとの diagnostic profile を作る。混合動機ゲームという制御された環境で、どこが壊れたのかを action selection、opponent modeling、stated rationale、communication strategy に分解するための評価設計である。

■ 内容分析
この論文の芯は、「社会性」を協力率や勝率に還元しないことにある。mixed-motive game では、見かけの協力が本当の prosociality とは限らない。数 round 協力して信頼を作り、最後に exploitation する agent は、cooperation rate や payoff だけなら高く見える可能性がある。逆に、短期 payoff は低くても、相手に条件を明確に伝え、報復と修復を一貫して使う agent の方が social competence として扱いやすい場合がある。M3-BENCH はこの差を、BTA/RPA/CCA のズレとして表に出す。

評価設計としては、controlled games と open-ended environment の役割分担がよい。論文は、open-ended simulation が長期適応や emergent behavior に向く一方、失敗要因が絡みすぎると分析が難しいと見る。Prisoner's Dilemma や Kuhn Poker のような構造化 game では、裏切り、情報非対称、発話、報復のどれが崩れたかを特定しやすい。Nao_u_BOT でも、自由な NPC 社会 simulation の前に、小さな social tension の probe を作る方が先に効く。

注意点は、RPA と CCA が LLM judge に依存すること、そして reasoning log の faithful 性は保証されないこと。論文自身もこの限界を認めている。ただし、ここで測っているのは「本心」ではなく、監査可能な説明と発話の整合である、と読むなら実用性は残る。deception 指標も能力として最大化するものではなく、red-team 的な warning signal として扱う必要がある。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、social deduction、交渉 NPC、協力/裏切りを含む multi-agent playtest に直接使える。今の headless 評価が outcome に寄るなら、各 episode に最低 3 列を持たせる。BTA は実際の行動、報酬、関係値、攻撃/支援/裏切り回数。RPA は agent が出した理由や次手予測。CCA は相手に送った発話、提案、警告、嘘、謝罪、情報開示。これを別々に保存し、最後に「成功したが説明と発話が噛み合っていない」「会話は協力的だが行動は搾取的」「推論はよいが伝達不足」のような failure label を付ける。

次の Phase 3b probe としては、ゲーム全体ではなく 1 scene でよい。たとえば NPC 2 体が資源を分ける場面を作り、agent に private goal と public message を持たせる。評価は勝敗ではなく、action、reason、utterance の consistency を見る。記憶システム側でも、Slack や candidate の判断を outcome だけで残さず、「行動ログ」「判断理由」「外部への発話」を分ける設計に接続できる。

■ メリット・デメリット
メリットは、outcome-only 評価の盲点を具体的に埋め、会話 agent の失敗を行動・推論・発話に分解できること。social game や NPC では特に強い。デメリットは、rationale と dialogue を収集する設計が必要で、LLM judge の bias と cost が乗ること。非言語中心のアクションゲームでは、CCA 相当を何で代替するかを別途作る必要がある。

■ 判定
採用。社会的ふるまいを持つゲームでは、勝敗や報酬だけでは不足する。BTA/RPA/CCA の三分割を、まずは小さな negotiation または hidden-intent scene の評価票として使う。

■ URL
https://arxiv.org/abs/2601.08462

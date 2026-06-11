■ 概要
対象は arXiv:2606.08200「Online Agent-as-a-Judge: Situation-Generating Evaluation for Interactive Agents」。この論文の問題設定は、LLM を中核にした social agent や NPC を、受動的に残ったログだけで評価すると、本当に見たい行動がログに出てこない、という点にある。たとえば conflict handling を評価したいのに、そもそも衝突が起きていない。emotional support を見たいのに、誰も困っていない。約束を守るかを見たいのに、約束を求める状況が発生していない。この場合、judge がいくら賢くても、読むべき evidence が存在しない。

Online Agent-as-a-Judge は、この bottleneck を「採点器を強くする」方向ではなく、「評価したい状況を環境内で発生させる」方向で解く。提案手法では、judge agent が target agent と同じ simulation world に入り、普通の登場人物として native dialogue / action protocol を使って相互作用する。judge は designer-authored criterion を受け取り、現在の world state、近くにいるキャラクター、関係、記憶、直近 interaction などを read-only tool で確認し、どの状況を誘発すべきかを計画する。その後、会話や行動で probe を実行し、target の返答だけでなく、その後の follow-through action まで観測して verdict を出す。

実験は life-simulation environment の five-character family scenario で行われる。家族内の親、子、兄弟姉妹、祖父母のような役割を持つ複数キャラクターが暮らす persistent home があり、agent は observe-plan-act loop で会話や行動を選ぶ。評価 criterion は designer-authored で、role consistency、memory continuity、coordination、emotional support、conflict handling など、社会的・継続的な性質を含む。比較対象は、完成済みの interaction log を読む offline LLM-as-a-Judge と、log database を検索できるが環境へ介入できない offline Agent-as-a-Judge。Online 版だけが、同じ runtime environment に入って状況を作れる。

結果は、単に「judge がうまく採点した」ではなく、「採点に足る evidence を集められた」ことを示している。criteria coverage、つまり pass/fail verdict を出せるだけの具体的な dialogue/action evidence を集められた割合は、Online Agent-as-a-Judge が平均 0.92、offline LLM が 0.56、offline agent judge が 0.54 と報告される。Conflict/Norm Violation や Emotional/Social Support のように自然発生しにくい領域で差が大きい。human-label agreement も Online が平均 0.70、offline agent judge が 0.40、offline LLM が 0.33 で、特に失敗を見つける能力が改善している。pass-label accuracy だけでなく fail-label accuracy でも差が出ており、単に甘く pass を出しているわけではない。

重要なのは、Online Agent-as-a-Judge が outcome benchmark の代替ではないと論文自身が限定している点である。score、survival、resource use、completion time のような明確な数値 endpoint があるなら、それを主指標にすべきである。この手法が効くのは、性質が社会的・文脈依存で、適切な状況が起きない限り観測できない場合である。NPC が家族役割を維持するか、頼まれた家事を後で実行するか、困っている相手に支援を返すか、衝突時に関係を壊さず調整できるか、といった評価である。

■ 内容分析
この論文の強みは、LLM-as-a-Judge 批判を「judge の主観が怪しい」という話に閉じていないところにある。問題の核心は、judge が読む trace の生成過程にある。ログに conflict がないなら conflict handling は測れない。ログに依頼と後続行動の組がないなら follow-through は測れない。つまり evaluation は scoring problem である前に evidence acquisition problem であり、Online Agent-as-a-Judge はそこへ介入する。

設計上の線引きもよい。judge は環境内で話したり動いたりできるが、評価用 tool は read-only で、world を直接改変しない。target に見えていない内部状態を勝手に注入するのではなく、普通の登場人物として状況を作る。さらに、probe が答えを漏らす危険も明示されている。judge が「あなたは優しい人だから助けてくれるよね」と言えば、評価ではなく誘導になる。論文では probe gate や、dialogue-only evidence と follow-through evidence の分離を防御策として置く。

弱点は、評価対象が designer-authored criteria に強く依存すること。criteria が曖昧なら judge も曖昧な状況を作る。また、Online judge 自身が不自然な会話や過剰な誘導を起こすと、target の通常運用とは違う挙動を測ってしまう。Memory/Continuity が全 judge で弱いという結果も重要で、長い履歴に散らばった evidence は、状況を一回作るだけでは解決しない。記憶評価には、過去 event の retrieval と attribution を別に設計する必要がある。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、NPC 会話、社会シム、チュートリアル内対話、プレイヤー支援キャラの評価にそのまま使える。ログを眺めて「自然だったか」を後で採点するのではなく、失敗が見たい状況を作る小さな judge NPC を入れる。たとえば、プレイヤーが困っているふりをする、矛盾した依頼を出す、以前の約束を後で確認する、味方 NPC に意図的なミスをさせる。target NPC がその場の返答だけでなく、その後の行動で支援や修正を続けたかを記録する。

Phase 3b では、1 prototype に対して 5 個程度の designer criteria を作り、各 criterion に「状況生成 script」と「pass/fail/insufficient の evidence」を対応させるのがよい。LLM judge に全面委任せず、probe の台本、許される誘導、見てよい state、見てはいけない state を固定する。これなら deterministic な headless test と、人間が見るべき社会的 failure の橋渡しになる。

■ メリット・デメリット
メリットは、普通の play log では出にくい失敗を意図的に露出できること。会話 NPC の「それらしさ」ではなく、衝突、支援、約束、役割維持といった designer criterion に直結した evidence を残せる。

デメリットは、judge NPC の振る舞いが評価を汚す危険である。問い方が答えを含む、過剰に不自然な状況を作る、criteria 自体が曖昧、長期記憶の evidence を取り逃がす、といった問題が残る。評価対象が数値 endpoint のゲームなら、まず通常の outcome metric を優先すべきである。

■ 判定
採用。NPC や社会的 interaction の評価では、受動ログ採点より「状況生成 agent」を小さく入れる価値が高い。まずは 5 criteria 程度の probe と read-only state inspection で試す。

■ URL
https://arxiv.org/abs/2606.08200

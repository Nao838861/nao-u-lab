■ 概要
Knowledge-Centric Self-Improvement（KSI）が反転させるのは、「自己改善で何を永続化するか」である。一般的な自己改善 agent は prompt、workflow、harness、agent code を更新するが、その改善は特定の model や task 分布へ結び付き、監査・移植しにくい。KSI は agent を毎回 fresh context で起動する使い捨て worker に固定し、改善対象を外部の curated knowledge base だけにする。private memory、役割特化、前世代の identity、変更済み prompt は継承しない。

知識化は三段階で進む。第一の task-level forum では、各 agent が一つの task を試行した後、成否を左右した仮定、trace や test の evidence、次世代で変える一手、予測結果、confidence を投稿する。先行 post を読まずに書き捨てることはできず、knowledge retrieval 済みかを server 側 gate が検査する。

第二の cross-task forum は、局所経験を別 task に移せる claim へ選別する。API、file path、error type、数値 invariant のような concrete primitive を必須にし、二巡目以降は先行 post に AGREE / DISAGREE / SYNTHESIZE の stance と evidence を付ける。第三の distillation は、claim を transferable insights、confirmed constraints、rejected hypotheses、pitfalls、checks、next steps に型付けする。各 insight は applies_when、does_not_apply_when、根拠、confidence を持つ。

実験は ARC-AGI-1 / 2、Polyglot、SWE-bench Pro、Terminal-Bench 2 の5 benchmark。coding と ARC は各50 task、10 generations、KSI は3 seeds で、解けた task は active pool から外す。Haiku 4.5 使用時の solve rate は順に86.7%、82.7%、68.0%、64.0%。同じ基礎 model の HyperAgents は70%、60%、52%、42%で、KSI の費用も低かった。Terminal-Bench 2 は43.8%で、表中の Meta-Harness 37.6%を上回る。同額の prompt optimization 比較でも、ARC-AGI-1 / Polyglot は KSI 86.7% / 68.0%、GEPA 44% / 36%、OpenEvolve 54% / 46%だった。

さらに generation 10 の bundle を凍結し、元の50 task と分離した難しい20 taskへ渡す。recipient 側は forum も再 distillation も行わず、task-conditioned adapter が現在 task に関係する項目だけを最大数件の短い memo にする。Polyglot では no-knowledge の GPT 8.3%、Haiku 3.3%に対し、GPT 由来 bundle は20.0% / 11.7%。ARC-AGI-1 では23.3% / 13.3%に対し43.3% / 28.3%だった。Haiku 由来 bundle も同一 family と cross-family の双方で正の transfer を示す。結論は、改善を agent の内部へ焼き込まなくても、証拠を争わせ、適用範囲を狭めた外部知識だけで性能向上を蓄積し、別 model へ運べるというものだ。

■ 内容分析
この研究の中核は「memory を持つ」ことではなく、trajectory から claim を作る責任を一回の自己要約に任せないことにある。task-level で局所仮説を競わせ、cross-task で再現性を見て、distillation で条件付き claim に落とす。特に rejected hypotheses と does_not_apply_when を正式な出力にした点が強い。Polyglot の go__connect では、hexagonal grid の隣接を row parity 依存にする説と uniform 8-neighbor 説が10世代で決着せず、両方を FALSIFIED / UNTRIED と根拠付きで残した。合意を強制せず「未解決の形」を保存すること自体を正常系にしている。

一方、KSI は3 seeds の平均だが、表1の HyperAgents と DGM は単一 run で分散がない。比較実装は同一 model、tool、network isolation、hidden answer 制限、費用計上を揃えた著者らの fork で、ARC や SWE-bench Pro の adapter も著者側の追加である。Terminal-Bench 2 の他手法は別論文の集計値だ。費用は reflection、forum、distillation、baseline の meta-loop まで含む一方、API 単価と prompt cache 効率に依存する。

transfer の held-out 20件は、事前の seed-0 run で GPT と Haiku の双方が失敗した task から選ばれた。難問への救済を見る設計だが、選抜と no-knowledge 評価は完全に独立せず、20件・3 seeds なので絶対値は粗い。Haiku donor から GPT recipient への ARC transfer は標準偏差12.6 points ある。測定も Polyglot と ARC-AGI-1 に限られ、長期開発、環境変化、誤 evidence、人間の主観評価は未検証である。

■ 自分達の環境への適用
我々の `atoms.jsonl` / per-atom md、game task lens、headless log は、外部知識を永続化し fresh agent に渡す点ですでに KSI に近い。ただし現状の弱点は、観察・解釈・処方・反証が一つの文章に混ざりやすいことと、「別 task で効いたか」を昇格条件にできていないことだ。forum をそのまま新設するより、既存 atom の最小 schema を強くする方がよい。

次のゲーム試作3件で小さく検証する。各 playable diff に `claim_type`、`applies_when`、`does_not_apply_when`、`evidence`、`predicted_outcome`、`confidence` を付ける。evidence が commit、headless seed、metric、screenshot、Nao_u の原文 feedback のいずれかを参照できなければ昇格させない。fresh 制作 agent には task lens で上位3件だけを渡し、現在の evidence と衝突したら現在側を優先する。

cross-task 相当の選別は週次の大規模会議にせず、同じ claim が別 prototype で再利用された時だけ行う。成功なら `supported_by` を増やし、失敗なら削除せず counterexample と適用境界を追加する。評価は、知識あり／なしを似た task で交互に割り当て、同型失敗の再発率、最初の playable diff までの時間、headless invariant 違反、参照した atom のうち実際に判断を変えた割合、誤 transfer で手戻りした回数を見る。面白さは自動 solve rate に置換せず、最終的な人間評価を独立に残す。

■ メリット・デメリット
メリットは、agent や model family の交代に耐えること、失敗と反証を資産として保持できること、改善原因を inspectable な外部 artifact に限定できることだ。条件付き少数 memo に変換する adapter は、巨大 memory を丸ごと prompt へ流すノイズ対策としても実用的である。実験上も forum と distillation を含む総費用で agent-centric baseline より良い Pareto 点を示した。

デメリットは、forum と distiller 自体が LLM なので、複数 agent が同じ誤解を共有すれば evidence 付きの誤知識を量産できることだ。schema は根拠の存在を強制できても、根拠の真偽までは保証しない。三段階 curation は task 数が少ない制作では overhead になり、知識選別が強すぎると新奇な設計案も早期に棄却する。客観 grader のある benchmark の成功を、遊びの手触りや驚きへ直接外挿してはいけない。

■ 判定
部分採用。agent を永続的に複雑化する代わりに、外部知識を evidence・反例・適用境界・検証手順つきで育て、現在 task 用に少数だけ渡す原理を採用する。二層 forum の常設は見送り、まず既存 atom と game task lens に型付き claim と cross-task 再利用結果を加える3 prototype の probe で、再発防止と誤 transfer の両方を測る。

■ URL
https://arxiv.org/abs/2607.19592

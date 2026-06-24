■ 概要
対象は Oliver Withington, Michael Cook, Laurissa Tokarchuk による FDG 2024 論文 “On the Evaluation of Procedural Level Generation Systems”。主題は、ゲームの procedural level generation 研究で「生成器をどう評価すれば、本当に有用と言えるのか」を整理することにある。PCG 研究では、遊べるか、難易度が妥当か、見た目が自然か、多様性があるか、設計者が制御できるかなど、評価したい性質が多い。しかもジャンルやレベル表現が違うと同じ指標をそのまま使いにくい。そのため、著者らは「新しい生成器を既存研究と比較できる、頑健で一般化可能な評価法」への合意がまだ弱い、という問題設定から出発している。

論文の仕事は二段階である。第一に、PCG level generation の評価実践を分類する taxonomy を作る。第二に、その taxonomy を用いて近年の論文を survey し、現場で何が多く使われ、どこが弱いかを示す。調査対象は Web of Science で抽出した論文から、アクセス可能性、英語、novel PCG system を含むか、level/environment を生成するかを絞り込んだもの。最終的には 86 本を分類している。level の定義も広めで、2D/3D の navigable space を生成するものを対象にし、terrain のように現実のプレイヤーや NPC がまだいなくても、ゲームレベルとして利用できるなら含めている。

taxonomy の柱は四つある。一つ目は data collection method、つまり評価データをどう得るか。ここには、レベル表現から直接特徴量を計算する方法、agent に代理プレイさせる方法、人間プレイヤーのプレイや観察から取る方法、mixed-initiative creation 中または後に人間から取る方法が入る。二つ目は metrics and features、何を計算するか。Level fitness、solvability / win rate、validated questionnaire、custom questionnaire、biological readings、計算資源、生成サンプルの視覚的特徴、training data との類似、metric diversity、Expressive Range Analysis、controllability、agent curriculum としての性能などが並ぶ。三つ目は point of comparison、何と比べるか。アルゴリズムあり/なし、同一システムの別パラメータ、同一システム上の別アルゴリズム、過去研究のシステム、複数 generator の比較、expert content との比較などである。四つ目は game domain、どの環境で試すか。commercial game / mod / research clone、既存 research platform、custom domain に分け、Mario AI Benchmark や GVGAI のような反復利用される基盤も見る。

結果で目立つのは、評価自体への意欲は高いが、比較可能性が弱いことだ。評価なしの system description は 137 本中 5 本だけで、多くの研究は何らかの評価をしている。data collection では、表現から直接特徴量を計算する手法が 37 回と最多で、人間プレイヤーを使う評価も 27 回ある。これは研究者が評価の必要性を強く感じていることを示す。一方で comparison point を見ると、最も多いのは「自分のシステム内での比較」であり、既存研究のシステムと直接比較したものは 11 回にとどまる。つまり、論文中の数値は出ていても、それが分野全体に対する前進なのかは読み取りにくい。

metrics 側でも同じ問題がある。Level fitness は 33 回と多いが、単一の heuristic が「良いレベル」を代表しているように見せてしまう危険がある。ゲームレベルは機能性と美的性質の両方を満たす必要があり、その評価は主観を含む。したがって fitness は有用でも、生成器の価値全体を測るには部分的で、場合によっては誤解を誘う。一方で、生成サンプルの視覚的議論、questionnaire、controllability は、読者や設計者にとっての意味に近い。特に controllability は商業的な PCG で重要な「狙った性質のレベルを出せるか」に直結する。ただし validated questionnaire は 8 回しか使われず、custom questionnaire よりかなり少ないため、比較可能性を高める余地が残る。

domain の結果も重要で、47 本が custom domain または独自 level representation を使っていた。これは新しい表現を試せる利点がある一方、他研究との比較や再利用を難しくし、研究者ごとに新しい小環境を作るコストを増やす。著者らの提案は三つに集約される。第一に、十分に新しい生成器では、無理に定量評価を付けるより、評価なし system description として能力を明確に示す方がよい場合がある。第二に、Mario AI や GVGAI のような研究基盤をより多様なジャンル、特に 3D など未整備領域に広げる。第三に、コード、方法論、調査票、評価フレームワークを再利用し、自然な consensus を育てる。結論は、PCG 評価を単一スコア競争に寄せるのではなく、評価対象、方法、比較先、domain を明示して、何を主張できる評価なのかを狭く正確に扱うべき、というもの。

■ 内容分析
この論文の価値は「PCG 評価の正解」を出していない点にある。むしろ、評価という行為を四つの問いに分解し、論文中の数値がどの問いに答えているのかを可視化している。たとえば solvability は「壊れていないか」を見るには強いが、楽しいか、設計者が使えるか、既存 generator より良いかまでは言えない。fitness は search-based PCG の内部目的としては必要でも、外部読者に対する品質証明としては過剰に見えやすい。human evaluation は有用だが、サンプル数や質問設計が弱ければ、taxonomy 上は人間評価でも主張の強さは限定される。この論文は、評価カテゴリに入っていることと、評価が十分であることを混同しない。

特に鋭いのは、研究文化としての「quantitative results section への圧力」を問題化している点だ。新しい generator が既存の枠組みに合わないとき、比較可能な benchmark を作る方が生成器そのものより難しい場合がある。それでも数値を出そうとすると、内部比較や独自 fitness に寄り、評価らしい見た目だけが残る。著者らは、こうした場合に system description only を許すべきだと言う。これは評価を軽視する主張ではなく、主張可能な範囲を誠実に狭める提案である。

一方で、調査の限界も明確だ。WoS ベースで 86 本という sample は広いが網羅ではなく、PCG のサブドメイン差も大きい。DDA、mixed-initiative、RL curriculum では必要な評価が違うため、全体頻度だけでは「少ないから悪い」「多いから標準」とは言えない。それでも、custom domain の多さ、過去研究との直接比較の少なさ、validated questionnaire の少なさは、個別ジャンルを超えた再利用不足として読む価値がある。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作サイクルでは、headless score や scripted bot の pass/fail を「評価」と呼びがちだが、この論文に従うなら、それは data collection method と metrics の一部にすぎない。次の Phase 3b/4a では、prototype ごとに evidence package を四分割して残すのがよい。1. データ取得方法: representation check、bot play、human feedback、LLM review のどれか。2. 指標: solvability、route stability、視認性、controllability、fun proxy など。3. 比較先: 前版、別パラメータ、既存プロトタイプ、手作り基準、比較なし。4. domain: 既存ゲーム系、独自ミニゲーム、研究用 clone など。

これにより、「v14 は v13 より面白い」と雑に言う代わりに、「v14 は headless route stability と被弾回避では改善したが、人間 feedback 上の気持ちよさは未評価」のように主張を細くできる。特に自動生成レベルや wave 生成では、単一 score を採用条件にせず、生成サンプル画像、失敗例、solver 結果、Nao_u feedback を同じ candidate に束ねる。評価なし system description の許容も重要で、まったく新しい操作感の probe は、初回から勝敗数値を求めず「何を可能にしたか」を明確に記録する方が次の設計に残る。

■ メリット・デメリット
メリットは、ゲーム prototype の評価ログが、単なる点数や感想ではなく「何をどの範囲で言える証拠か」に変わること。失敗した生成器も、比較先や domain の不一致として再利用しやすくなる。デメリットは、毎回 taxonomy を丁寧に書くと運用が重くなること。小規模 diff では四項目を最小メモに圧縮しないと、評価のための評価になりやすい。

■ 判定
部分採用。taxonomy 全体を厳密運用するのではなく、Nao_u_BOT の prototype 評価に「データ取得方法 / 指標 / 比較先 / domain」を短く付ける。単一 headless score への過信を抑える基準として有用。

■ URL
https://arxiv.org/abs/2404.18657

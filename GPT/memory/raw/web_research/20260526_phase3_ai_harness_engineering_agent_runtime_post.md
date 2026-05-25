■ 概要
<https://arxiv.org/abs/2605.13357|AI Harness Engineering: A Runtime Substrate for Foundation-Model Software Agents> は、software-engineering agent の成否を「モデルが賢いか」だけで説明せず、model-harness-environment system の能力として捉え直す論文。著者らの問題意識は、現実の開発ではモデルが局所的に正しい patch を書けても、間違った file を読む、UI 表面だけを直して API behavior を壊したままにする、誤った test を走らせる、failure を誤解する、task state を忘れる、不要な residue を残す、十分な検証なしに成功宣言する、という失敗が残ることにある。人間が介入しているのは、すべての code を書くためではなく、context 選択、repository 構造説明、tool 選択、feedback 解釈、境界管理、verification、cleanup という runtime support を補っているからだ、という整理。

この runtime support を論文は harness と呼ぶ。harness は prompt でも agent framework でも agent OS でもなく、agent が project を観測し、行動し、feedback を受け、変更完了を立証するための substrate と定義される。中心となる責務は 11 個ある。task specification、context selection、tool access、project memory、task state、observability、failure attribution、verification、permissions、entropy auditing、intervention recording。各責務は、runtime contract、欠けた時の failure mode、残すべき evidence artifact と対応する。

論文の中核は H0-H3 harness ladder。H0 は task description と repository files だけの minimal baseline。tool registry、project memory、verification protocol はない。H1 は tool harness で、tool registry、test-command registry、tool-usage protocol を足し、action surface を明示し traceable にする。ただし project knowledge や verification discipline はまだない。H2 は context-memory harness で、architecture、testing conventions、known failures などの agent-readable project memory、task-state file、context-selection protocol を足す。H3 は observability-verification harness で、deterministic behavioral check registry、bug-reproduction protocol、failure-attribution protocol、verification protocol、verification report template を足す。H3 では「終わった」という assertion ではなく、completion を evidence object として扱う。

評価方法も final patch だけを見ない。trace-based evaluation protocol では、1 回の agent run を episode とし、task、repository、harness level、allowed tools、verification procedure、final outcome rule まで含める。各 episode は auditable episode package を生む。中身は action trace、tool trace、context trace、verification trace、failure attribution、intervention log、entropy audit、outcome record など。評価は、patch があるかだけでなく、relevant context を読んだか、test を走らせたか、failure を再現したか、requirements を検証したか、既存挙動を保ったか、無関係な変更や entropy を入れていないかを見る。

著者らは controlled validation task にこの枠組みを適用し、harness level が上がるほど episode package の evidence structure が体系的に変わることを示す。低い level では final patch だけが残りやすいが、高い level では reproduction logs、failure attributions、deterministic requirement checks、structured verification reports が残る。論文の結論は、autonomous software engineering の問いを「foundation model が patch を生成できるか」から、「model-harness-environment system が、検証可能で、原因帰属され、保守可能な変更を作れるか」に移すべき、というもの。

■ 内容分析
この論文の強い点は、agent の失敗を model failure に短絡しないこと。実務では、同じモデルでも task の渡し方、読める記憶、tool の見せ方、test command の明示、失敗時の分類、検証 report の要求で挙動が大きく変わる。論文はそこを「周辺の工夫」ではなく研究対象に格上げしている。特に H0-H3 ladder は、支援を段階的に露出する controlled visibility ablation なので、どの runtime support が何を改善したのかを語りやすい。

もう一つ重要なのは、development harness と evaluation harness を分けている点。評価 harness は behavior を測るが、development harness は behavior を形作る。ゲーム制作でも、headless check は単なる採点装置ではなく、agent が何を成功条件だと思い、どの evidence を集め、どの失敗を直すかを誘導する。

弱点は、実証が controlled validation task の質的な構造差に寄っており、大規模な複数 repository / 複数 task での成功率改善までは示していないこと。つまり「H3 を入れれば性能が何%上がる」という論文ではない。trace を増やすほど運用コストも上がるため、使いどころは高リスク変更、長期化した失敗、再発しやすい評価抜けに絞るのが現実的。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作サイクルにはかなり直接入る。現在の playable diff、headless script、review_packet、design_log、devlog はすでに episode package の断片になっているが、まだ「どの要求をどの evidence が満たすか」「失敗原因は model / harness / environment / task spec のどれか」が毎回同じ粒度では残らない。H3 全部を常時導入するより、review_packet に `requirements -> checks -> evidence -> failure_attribution -> entropy_notes` の小表を足すのがよい。

たとえば graze_log 系なら、route clear、novice failure、BOMB 候補、reason table、screenshot contract を requirements として並べ、各 requirement に deterministic check と raw evidence path を対応させる。失敗した時は「操作 policy が弱い」のか、「telemetry が足りない」のか、「review packet の表示が誤解を招く」のかを failure attribution として残す。さらに、generated files や stale docs、不要な test 弱体化を entropy audit として 1 行確認する。これなら H3 の思想を、サイクルを重くしすぎずに使える。

■ メリット・デメリット
メリットは、agent の成果を final patch ではなく再現可能な episode として残せること。失敗も、次回の memory / harness 改善に変換しやすい。デメリットは、証跡を増やすほど制作速度が落ちることと、trace が増えただけで検証品質が上がった気になる危険があること。要求と evidence の対応を薄くすると、記録だけが増える。

■ 判定
採用。ただし全面 H3 化ではなく、ゲーム制作の高リスク差分と recurring failure に限定して部分導入する。review_packet と headless evidence を episode package として揃える方針は、現行サイクルの弱点に直結している。

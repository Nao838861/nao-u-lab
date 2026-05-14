[Codex shared-reads] VeRO: An Evaluation Harness for Agents to Optimize Agents
URL: https://arxiv.org/abs/2602.22480

■ 概要
この論文は、coding agent が別の target agent を反復的に改善する「agent optimization」を、通常のソフトウェア改修とは別の評価問題として定式化している。対象は、LLM の重みを学習する話ではなく、agent-as-code、つまり prompt、tool、workflow、設定、補助関数などを含む agent プログラムを、edit-execute-evaluate のループで良くする作業である。ここが普通のコード修正と違うのは、target agent が deterministic なコードだけでなく stochastic な LLM completion を実行の中核に持つこと。最終スコアだけを見ても、変更が効いたのか、たまたま sampling が良かったのか、評価データや予算を余分に使ったのか、途中 reasoning が壊れたのかが分からない。

そのために提案されるのが VERO、Versioning / Rewards / Observations を束ねた評価 harness である。論文はまず target agent task T と optimization task P を分け、optimizer agent S が制約付き探索空間 Ar の中で baseline agent からの lift を最大化する問題として書く。評価呼び出し回数 nE は budget B 以下に制限され、評価は stochastic agent と stochastic evaluator の影響を受けるため、seed 固定や複数 sample 平均でノイズを抑える。この形式化の狙いは、agent 改善を「良い差分が出た気がする」ではなく、同じ資源・同じ観測・同じ権限境界で比較できる optimization task に落とすことにある。

VERO の具体要素は、Git worktree による snapshot と auto-commit、train/val/test split を持つ Dataset、glob pattern で読み書きを制限する Filesystem、評価 trace を保存する Experiment Database、budget を消費しながら target agent を指定 commit で実行する Evaluator / ExperimentRunner で構成される。optimizer は DatasetViewer で許可された sample を読み、ExperimentViewer で過去 trace を確認し、file tool で target agent を編集し、auto-commit された新しい版を ExperimentRunner に渡す。失敗したら rollback もできる。重要なのは、これは特定の coding agent 専用ではなく、Claude Code でも VERO scaffold でも、同じ traceability と budget / permission 制御を満たせば比較対象にできる点である。

評価は五つの task、GAIA、GPQA、MATH、TAU-Bench Retail、SimpleQA で行われる。target agent model は GPT-4.1 mini に固定し、optimizer configuration は Claude Code Pure、Claude Code + VERO tools、VERO Default、VERO Orchestrator、VERO Resources Only などを比較する。各 run の評価 budget は 8、主要比較は 105 experiments。結果は、baseline 平均 0.50 に対して VERO Default が平均 0.61、max 平均 0.65 と最も強く、Claude Code Pure は 0.53 程度に留まる。特に tool-use 系の GAIA、Retail、SimpleQA では改善が見えやすく、GPQA や MATH のような推論-heavy task では伸びが小さい。つまり harness があれば万能に伸びるのではなく、改善余地の種類と評価設計が強く効く。

さらに論文は、最適化で得た best commit を別 target model に差し替えて再評価する robustness study と、Pawn / Knight という二段階の realistic agent を使った case study を行う。Pawn は最小 agent、Knight は Wikipedia や reflection を持つ複雑な agent。結果として、単純な Pawn は大きく伸びやすいが、Knight は伸び幅が小さい。optimizer instruction も一枚岩ではなく、Cookbook+Reasoning のような高分散テンプレートは peak を出す一方で安定性を落とし、Evidence-Based は安定するが上限が下がる。加えて、GAIA に効く複雑な verification tool が SimpleQA では overhead になり -17.8% の regression を起こす例も出ている。結論は、agent optimization は成立するが、prompt edit に偏りやすく、task 間転移は保証されず、評価 budget を tokens や API cost まで含めていないなど未解決点も大きい、という慎重なものになっている。

■ 内容分析
この論文の良いところは、「自動改善 agent」を夢物語としてではなく、比較可能な実験単位へ押し込んでいる点にある。特に versioning と budget enforcement は単なる実装便利機能ではない。agent が agent を改善する場合、評価を何回回したか、どの commit を評価したか、どの split を見たか、どの trace から仮説を立てたかが結果そのものを左右する。ここを野放しにすると、強い optimizer ではなく、評価を多く覗いた optimizer や偶然よい stochastic completion を引いた optimizer を褒めることになる。

もう一つ重要なのは、VERO が「最終 accuracy」だけでなく差分の意味を追える点。Git commit、execution trace、reward が同じ trajectory に残るので、prompt 変更、tool 追加、workflow 変更、rollback のような行動型を後から分類できる。実験では prompt modification が多くの phase で 50% を超え、失敗すると agent は野心的な構造変更から prompt 変更に戻りがちだと示される。この観察は、coding agent が本当に architecture を改善しているのか、それとも安全な prompt 微調整に逃げているのかを見分けるために使える。

一方で、論文の評価 task は QA / tool-use / math に寄っており、ゲーム制作のように「遊べるか」「操作感が良いか」「人間の意図とズレていないか」を直接測るものではない。VERO をそのまま使えば game design agent が育つ、とは読めない。また、budget が evaluation call 数であり tokens、wall-clock、API cost、human review cost を十分に含まない点も、実運用では弱い。とはいえ、弱点まで含めて、agent 改善を扱う最低限の台帳として何を残すべきかをかなり明確にしている。

■ 自分達の環境への適用
Nao_u_BOT では、headless player、ゲーム自動改善、定時サイクルの Phase 4 実装判断にこの設計を部分的に移せる。まず game prototype ごとに、変更 commit、評価 seed、headless run、プレイログ、人間評価、採用/撤退理由を同じ run id で結び付ける。次に、評価 budget を「何回 headless を回したか」だけでなく、「同じ仮説で何回見直したか」「人間評価を要求したか」まで含めて記録する。これにより、哲学的な brainstorm が進んだだけなのか、実際に playable diff が改善したのかを分離できる。

実装は大きな VERO clone から始める必要はない。最小形は、`game/*` の変更 commit に対して、`log/eval_runs/*.jsonl` に baseline commit、candidate commit、評価 script、seed、metric、主観コメント、rollback 可否を残すこと。Phase 4 が agent 改善や headless 改善を行ったら、その run を staging に貼る。これだけでも「どの変更がどの評価で効いたか」を次サイクルが読めるようになる。

■ メリット・デメリット
メリットは、agent や headless player の改善を、思いつきではなく版・評価・trace の単位で比較できること。失敗した差分も rollback 可能な学習材料になる。デメリットは、harness 設計に時間を使いすぎると playable diff が遅れる点と、metric が弱いまま最適化すると、悪い評価関数に agent が過適合する点である。

■ 判定
部分採用。VERO 全体を導入するより、versioned run、評価 budget、trace、rollback の四点を Nao_u_BOT のゲーム制作と記憶改善に移すのが現実的。特に headless 評価の信頼性を上げる基盤として優先度が高い。

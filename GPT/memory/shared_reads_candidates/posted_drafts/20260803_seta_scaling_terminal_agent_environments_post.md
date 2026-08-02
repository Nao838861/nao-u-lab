■ 概要
SETA（Scaling Environments for Terminal Agents）は、terminal agent の訓練データを、指示文、実行可能な初期環境、成否を判定する verifier が揃った単位として増やす枠組みである。terminal task は現実の問題を集めても、そのままでは再現環境や機械判定可能な完了条件がない。SETA は異種の実例を標準 task に変換する SETA-Synth と、既存 task をモデルの能力境界に合わせて変形する SETA-Evol の二段で解く。

SETA-Synth は Stack Overflow、Unix & Linux StackExchange、Kaggle Notebook、NL2Bash などの、人間による問題・解法対を出発点にする。まず source ごとの adapter prompt と共通の task-design prompt を使う Idea Agent が、前提、制約、失敗条件、test 詳細を含む中間仕様へ変換する。次に Datapoint Agent が、Dockerfile、正解実行用の solve.sh、test_state.py と test.sh、agent が読む instruction.md、task.toml を生成する。検証は、agent が何もしなければ test が一つも通らない no-op check と、正解 script を実行すれば全 test が通る oracle check を必須にする。

ただし、solution と test を同じ生成器が作ると、指示文に書かれていない key 名や literal を両者だけが共有し、oracle check を通る欠陥 task が残る。SETA は全 rollout が失敗した task に対し、test ごとの失敗頻度、test code、instruction、terminal log を別の Trajectory Judge Agent に渡し、「本当に難しい task」か「設計不良」かを分類する。この後段検証で全体の約2%に当たる94件を design flaw として除外した。

SETA-Evol は、task ごとの pass rate に応じて変形を選ぶ。pass rate が0.5を超える easy task には制約・edge case・多段依存を足し、0より大きく0.5以下の medium task には難度をほぼ保ったまま domain や toolset を変える。完全失敗だが部分点がある difficult task は手順や edge case を減らす。派生 task も Docker build、no-op、oracle、自動レビューを通し、再度 rollout して能力境界へ近づいたかを見る。成果物 SETA-Env は、合成3,255件と派生1,312件、計4,567件、14カテゴリからなる。

評価では、base model に難しすぎるものを除いて560件を抽出し、Qwen3-8B を GRPO で学習した。報酬は「通過 test 数／全 test 数」に完全成功ボーナス0.2を足し、有効な報酬差が出る task を49%から86%へ増やした。Terminal-Bench 2.0 では base の最良3.6%に対して最良runが12%、8回評価の平均は10.7±1.3%だった。DeepSeek-V4-Flash でも pass@1 が40%から43.0±2.5%、pass@5が54%から58%へ改善した。Qwen3-8B の pass@4 は CRUST-Bench 15%→24%、CompileBench 6.7%→40%、QuixBugs 7.5%→15%となり、関連する修正能力にも転移した。

■ 内容分析
この研究の中核は、生成件数より「task packet の整合性」を品質の単位にしたことにある。instruction、environment、verifier のいずれかだけを増やすと、解けないのではなく採点不能な task、初期状態が再現しない task、文章にない仕様を要求する task が混ざる。no-op check は初期状態だけで偶然成功する問題を、oracle check は解法が存在しない問題を止める。しかし両方を通っても、同じ作者が解答と採点器を作ったことによる相関エラーは残る。実際の第三者 agent の失敗分布と軌跡を後段で見る構成は、この相関を切るための重要な安全弁である。

SETA-Evol の価値も、単純な「難しくする」処理ではない。GRPO は同じ task の複数 rollout が全勝または全敗だと相対優位を作れないため、学習中モデルにとって勝敗が分かれる領域へ task を寄せる必要がある。論文では難度低下taskの中央値が6%から38%へ、難度上昇taskが83%から69%へ動き、宣言方向への移動率はそれぞれ77%と60%だった。context shift 553組の46.1%はカテゴリ境界を越え、同カテゴリ内でも91.3%が具体技術を少なくとも一つ変更した。一方、方向一致は100%ではなく、LLMによる変形は意図した難度制御を保証しない。派生後の再計測を省けないことも数値が示している。

評価結果は有望だが、4,567件という規模と12%という結果を直結させすぎるべきではない。実学習は難しすぎる環境を除いた560件であり、dataset 全量の寄与や Synth と Evol の個別効果を切り分ける ablation は十分ではない。Qwen3-8B の主結果にも「最良run 12%」と「8回平均10.7±1.3%」の差がある。また DeepSeek の3ポイント改善は標準偏差2.5ポイントと近く、方向は整合していても強い一般化結論には追加反復が要る。著者自身も検証モデルが二系統、interaction が terminal に限定される点を限界としている。

部分点報酬にも条件がある。test 数の比率を進捗とみなせるのは、各 test が instruction 中の独立した要求へ対応し、重みが概ね妥当な場合だけである。細かな表記testを大量に置けば、本質的な達成より形式が高得点になる。SETA が post-rollout verification で instruction-test gap を除くのは、この報酬設計の前提を守るためでもある。報酬式だけを切り出して使うと reward hacking を招く。

■ 自分達の環境への適用
ゲーム制作では、これを「scenario packet」の設計として部分採用できる。1件を、目的文だけでなく、seed・level・entity state・装備・乱数系列を固定した初期 snapshot、許可する入力 surface、観測log、成功・失敗条件、判定script、基準trajectoryまで一組にする。たとえば移動prototypeなら「ゴールに着く」だけでなく、開始位置とcamera状態、入力列、制限時間、落下回数、速度推移、復帰条件を同じ packet に含める。記憶システムなら、candidate、入力atom集合、期待する recall 根拠、禁止情報、出力検査を一組にできる。

最初の小さな検証は、既存headless testから5 scenarioを選び、各scenarioに no-op、oracle、post-rollout audit を加えることがよい。no-op は入力なしで成功しないこと、oracle は既知入力列で成功することを確認する。さらに複数の自動play rolloutが全敗した場合、単に難しいと決めず、instruction、telemetry、判定codeを並べて「skill不足」「初期状態不良」「判定の過剰指定」に分類する。oracle と verifier は同じ担当で完結させず、判定仕様と実trajectoryの不一致を別工程で見る。

派生は三種類に限定して試せる。easy scenario は敵配置、時間制限、複数目標の一つだけを強める。中間難度は物理parameterを保ち、地形や能力構成を変えて同じskillを別文脈で測る。全敗だがゴールへ近づく scenario は障害を一つ減らす。親子で成功率、到達距離、失敗分類を比較し、意図方向へ動かなければ採用しない。ここでは快感や分かりやすさを自動scoreに還元し切らず、headless verifier は到達・再現性・退行検知、人間playtestは操作感・驚き・学習可能性を担当させる。

■ メリット・デメリット
メリットは、評価ケースを増やす時に、再現環境と判定器も同時に増やすため「文章だけ豊富で実行不能」なtestを抑えられること、モデルやprototypeの現在能力に応じて有効な難度帯へ寄せられること、失敗trajectoryをtask品質の監査にも再利用できることにある。親子scenarioの変形理由と再評価結果を残せば、制作サイクルの改善履歴も追跡しやすい。

デメリットは、terminal の最終filesystem状態と違い、ゲームの面白さが時間的・感覚的で、unit testへ分解しにくいことだ。測りやすい到達率や時間だけを最適化すると、遊びの余白や意外性を削る。生成器、oracle、verifierが同じ暗黙前提を持つ危険も残り、独立auditには計算量とレビュー費用がかかる。さらに成功率ベースの難度は agent や操作方針に依存するため、単一botの境界をプレイヤー一般の難度と誤認してはいけない。

■ 判定
部分採用。instruction・初期状態・入力面・verifierを一体化した scenario packet、no-op／oracle／実rollout後audit、能力境界に応じた三方向の派生は、headless評価と記憶評価へ小規模導入する価値が高い。一方、部分点報酬と自動難度を面白さの総合指標にはせず、5 scenarioのprobeで整合性と監査コストを測ってから拡張する。

■ URL
https://arxiv.org/abs/2607.10891
https://github.com/camel-ai/seta
https://huggingface.co/datasets/camel-ai/SETA-Env

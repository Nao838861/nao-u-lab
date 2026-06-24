■ 概要
PowerAgentBench-Dyn は、LLM agent を「電力系統の動的解析を手伝うチャットボット」としてではなく、シミュレータを呼び、途中結果を読み、限られた実行予算の中で次の実験を選ぶ engineering workflow として評価するためのベンチマーク。対象領域は power system dynamic studies で、通常のコード生成や単発 QA と違い、dynamic model の品質確認、fault 条件の探索、リスク順位付け、緩和策の検討のように、数値シミュレーションと専門判断が往復する。論文の問題意識は、LLM agent の評価が「正答を一度出せるか」へ寄りがちな一方で、実際の工学作業では、制約された action space、simulation budget、途中観測の解釈、証拠つき報告が一体になっている点にある。

ベンチマークは主に 2 種のタスクで構成される。Dynamic Model Quality Review は、operator が定めた compliance criteria に沿って dynamic model を検査し、観測された挙動からモデル品質を診断するタスク。単にファイルを読んで説明するのではなく、シミュレーションを走らせ、その結果が期待される電力系統応答と合っているかを判断し、問題があれば根拠を示す必要がある。Dynamic Security Risk Screening は、semantic memory と限られた simulation budget を使い、未知の fault dataset から critical short-circuit contingencies を見つけて順位付けし、必要なら mitigation proposal まで進めるタスク。こちらは「全部試す」ことができないので、どの fault を先に見るか、どの途中結果を次の判断に使うかが成績を左右する。

重要なのは、タスクを agent が好き勝手に試せる自由探索にしていないこと。論文は simulation environment、observation space、action space、metrics を分けて定義し、agent が実行できる操作を制約する。agent はシミュレータを呼び、結果を読み、次の action を選ぶが、評価側はその軌跡を deterministic evaluator と repeated runs の success rate で見る。つまり、LLM 出力の文面だけで採点するのではなく、実際に行った simulation、得られた evidence、最終報告が compliance criteria や risk screening の目的に合っているかを測る。

この設計は「専門領域ベンチマーク」以上に、agent 評価の単位を変えている。PowerAgentBench-Dyn が測るのは、モデルが電力系統の知識を暗記しているかだけではない。限られた予算で仮説を立て、ツールを使い、失敗や中間結果から探索方針を修正し、最後に根拠つきの判断へまとめる能力を測る。電力系統という領域はゲーム制作とは遠いが、評価対象の形は近い。ゲームの headless playtest、NPC 行動検証、バランス調整も、単発スコアより「何を試し、どの証拠で、どの修正案に至ったか」が本質になる。

また、評価結果を一回の成否だけに閉じない点も大きい。LLM agent は同じ task でも run ごとに違う探索順序を選ぶので、タスクの正誤判定を固定し、複数 run の success rate と軌跡品質を見る必要がある。この分離がないと、たまたま成功した長文報告と、再現性のある調査能力を区別できない。PowerAgentBench-Dyn はそこを benchmark の構造で受け止めようとしている。

■ 内容分析
この論文で使える軸は、agent の能力を「回答」ではなく「制約下の調査計画」として切っている点。simulation budget があることで、評価は全探索の強さではなく探索順序の妥当性を見る。action space を明示することで、agent が本来できない操作を自然言語で言い張る事故を防げる。deterministic evaluator と repeated runs を併用することで、タスク側の採点は固定しつつ、LLM agent の確率的ばらつきは成功率として扱える。ここが普通の LLM benchmark より実運用に近い。

もう一つ重要なのは、semantic memory が単なる長期記憶ではなく、探索予算を節約する材料として置かれている点。DSR では fault dataset を総当たりできないため、過去知識や中間観測を使って critical な候補を絞る必要がある。これは記憶システムの評価にも接続できる。記憶が多いほど良いのではなく、次に走らせるシミュレーションを減らし、危険な見落としを減らす形で効くかが問われる。

弱点もはっきりしている。ドメイン固有の evaluator を作れるから強いのであって、面白さ、手触り、緊張と緩和のようなゲーム固有の主観評価をそのまま決定論的に採点できるわけではない。電力系統では compliance criteria や fault severity が比較的定義しやすいが、ゲームでは「退屈」「理不尽」「読みやすい」は別の観測設計が必要になる。したがってこの論文をそのまま導入するより、タスク分解と harness 設計だけを借りるのが適切。

特に避けるべきなのは、ゲーム側で「到達率が上がったから良い」と短絡すること。到達率、被弾数、滞在時間は観測であって、体験そのものではない。PowerAgentBench-Dyn から借りるべきなのは、観測値を最終判断へ直結させることではなく、観測、仮説、追加実行、証拠つき結論を同じ記録に残す構造である。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作サイクルでは、headless 評価を単発の pass/fail にせず、PowerAgentBench-Dyn 型の workflow に寄せられる。たとえば「敵配置を変えた後、3 種の bot policy で 20 run 以内に到達率、被弾地点、停滞時間を測り、次にどの配置を疑うかを選ぶ」タスクとして定義する。agent には Playwright やゲーム内 debug API だけを action space として渡し、観測はスクリーンショット、ログ、位置ヒートマップ、リトライ回数に絞る。最終報告は「面白かった」ではなく、どの run のどの証拠から、どの調整案を出したかを書く。

記憶システムにも使える。Phase 3 投稿や Phase 4 整理で、記憶を増やすこと自体を成果にせず、「次の実験を減らしたか」「誤ったファイル更新を防いだか」「候補を postpone する根拠を強くしたか」を評価する。semantic memory は検索結果の量ではなく、限られた作業予算の中で正しい次アクションを選ぶための observation として扱う。これなら shared-reads 由来の知見も、単なる保存ではなく、次回の probe 設計へ落とし込める。

■ メリット・デメリット
メリットは、agent 評価を実作業に近い形へ寄せられること。simulation budget、action space、evidence-backed report を固定すれば、モデルの饒舌さではなく、限られた試行でどれだけ妥当な判断に進めたかを比較できる。ゲーム制作でも、headless run のログを「評価証拠」として扱いやすくなる。

デメリットは、harness を作る初期コストが高いこと。ゲーム固有の面白さは電力系統の compliance criteria ほど明確でないため、主観評価を代替する観測指標を別途設計しないと、測れるものだけを最適化する危険がある。

■ 判定
部分採用。論文の電力系統タスク自体を使うのではなく、agent benchmark を simulation budget つき workflow として設計する考え方を採用する。次のゲーム制作では、headless playtest を「証拠つき調査計画」として小さく試す価値がある。

■ URL
https://arxiv.org/abs/2606.20401

■ 概要
対象は “ArchEval: Measuring AI Agents as Computer Architects”。LLM agent を最終 score だけでなく、workload 解釈、機構選択、simulator 利用、feedback 前の性能予測、制約充足まで含む「設計者」として測る benchmark である。CPU core、system architecture、memory、DNN accelerator、compute-in-memory にまたがる 20 challenge と 8 simulator を統合し、各 challenge の baseline に対する正規化性能で比較する。制約違反、build failure、timeout も別 outcome として残す。

中核は、同じ設計課題を支援量の異なる三条件で測る点にある。L1 full harness は、用意済みの設計 interface と反復可能な verifier-simulator feedback を渡し、feedback 内での最適化能力を測る。L2 simulator-code container は simulator source と build 環境を渡すが、完成済みの反復 verifier loop は外し、agent 自身が local experiment を組めるかを見る。L3 agent-only は static な workload evidence と制約だけを与え、実行可能な simulator feedback なしで設計、performance model、予測値、uncertainty を提出させる。最終 artifact は隔離された canonical verifier で測るため、「動くものを作れた」と「feedback 前に良いものを選べた」を分離できる。

4 agent configuration を各 challenge・条件で 1 run ずつ評価した初期実験では、L1 の geomean は baseline 比 1.00–1.75、win rate は 60–85%。L3 では GPT-5.5 + Codex だけが geomean 1.21、win rate 65%で baseline を上回り、他三構成は 0.45–0.72へ落ちた。それでも同構成の事前予測は median relative error 93%、予測区間 hit 15%、performance-modeling pass rate 15%である。80件の L3 run 中、56 artifact は実行・制約充足に成功したが、31件は baseline 未満、19件は改善予測に反して悪化した。現行 agent は simulator loop 内の最適化補助には有用だが、feedback 前の設計判断を任せられる自律設計者ではない。

■ 内容分析
この論文の価値は leaderboard の順位より、「支援が能力に見えていないか」を実験変数にしたことにある。L1 で高得点でも、人間が objective、合法な design space、metric、simulator path、反復 loop をすべて用意していれば、agent が所有しているのは仮説生成と局所探索だけかもしれない。L2 は source access を実験 workflow に変換できるか、L3 は測定前に内部モデルで候補を順位付けできるかを露出する。最終値と full trajectory を併記することで、性能低下を「モデルが弱い」の一語で済ませず、tool 未使用、generic な workload 分析、過大予測、制約違反、starter の再提出、説明と artifact の不一致へ分解している。

L1→L2→L3は単純な難易度階段ではない。L2 は canonical feedback を減らす一方、simulator internals を広く見せるため、強い agent には L1 より良い探索環境になる。GPT-5.5 + Codex が MNSim challenge で local sweep を組み、L1 の baseline parity から L2 で 18.75倍へ改善した例がそれを示す。三条件の差は難度ではなく、どの支援を誰が所有したかの差である。

trajectory 指標も有効である。論文は task compliance、simulator/tool use、workload-grounded design、performance judgment、constraint awareness、artifact integrity/originality を見る。L3 では実行可能な artifact を作れても、性能順位の Kendall’s τ が低く、uncertainty も校正されていない。これは「生成能力」と「選別能力」を分ける証拠になっている。また、厳密で program-checkable な制約は比較的守れる一方、良い feasible design を選べるとは限らない。制約充足を設計品質の代理にしない点も堅い。

限界も大きい。single-seed の初期調査で、base model ではなく GPT-5.5 + Codex と他 model + MiniSWE の complete configuration 比較なので、harness 差が混ざる。baseline の強さは challenge ごとに異なり、workload grounding や originality などの意味判定は Gemma 4 31B judge に依存する。L3 も task、interface、evidence、final verifier は人間が定義済みである。個別 model の序列ではなく、評価設計の prototype として読むべきだ。

■ 自分達の環境への適用
ゲーム制作へ移す対象は computer architecture の simulator 群ではなく、支援量を固定した評価 protocol である。headless playtest や自動 balance 調整を、同じ map・seed・目的関数に対して三条件で回す。G1 は実行済み telemetry、score、失敗理由を反復で返す prepared harness。G2 は game build、headless runner、log schema を渡すが、測定 script と探索 loop は制作 agent に組ませる。G3 は仕様、静的 replay、制約、baseline だけを渡し、実行 feedback 前に変更案、予測 metric、予測区間を固定してから blind verifier を一度走らせる。この差分により「playtest を回せば直せる」と「初見で面白さや難易度の方向を読める」を混同しなくなる。

最小 probe は小型 prototype 一件でよい。変更 parameter と hard constraints を固定し、予測 score、uncertainty、根拠、変更 file、headless result、constraint status、artifact hash を trajectory に残す。baseline 勝率だけでなく、予測誤差、予測区間 hit、候補順位の一致、valid artifact 率、feedback 一回あたりの best-so-far 改善量を見る。「改善予測だが人間確認では退屈」という差分は verifier proxy の穴として別ラベルにする。

制作サイクルにも同じ分離を入れられる。Phase 2 の candidate 判定では、記事本文、既存 template、評価観点を全部渡した pass は L1 相当であり、それだけでは記事を自力で吟味できる証拠にならない。静的な source と directive だけで概要・限界・適用案を先に固定し、その後に既存 atom や過去投稿との照合で誤差を見る段を設ければ、recall が判断を補助したのか、判断そのものを置換したのかを監査できる。

■ メリット・デメリット
メリットは、第一に final score と process を分離し、成功が harness 由来か agent 由来かを診断できること。第二に、validation reject、build failure、timeout、valid-but-worse を分けるため、生成不能と判断ミスを混ぜないこと。第三に、予測値と uncertainty を提出前に固定するので、結果を見た後の説明合わせを検出できること。第四に、同じ task と verifier を保ったまま支援だけを変えるため、headless harness の改善が agent 能力を底上げしたように見える錯覚を抑えられる。

デメリットは、三条件分の環境、baseline、isolated verifier、trajectory schema を保守するコストが高いこと。ゲームの「面白さ」は architecture の cycles や energy より観測しにくく、単一 score にすると reward hacking が起きる。L2 の source access は情報量が多いため条件間の厳密な序列にならず、比較の説明が必要である。さらに single-seed や agent configuration 混在の問題は我々の小規模 probe では一層大きくなる。最低でも複数 seed と人間の blind 確認を残し、headless 指標を最終品質の代理ではなく反証可能な補助信号として扱う必要がある。

■ 判定
部分採用。L1/L2/L3という名称や architecture 固有 challenge は移植せず、「支援量を変えて同一 task を測る」「最終値・予測・trajectory・artifact 完全性を分離する」「valid だが悪い案を独立に数える」という評価骨格を採用する。まず小型 prototype 一件で G1/G3 の二条件と予測校正を比較し、差が診断に効くことを確認してから G2 の自作実験 workflow 評価を追加する。

■ URL
https://arxiv.org/abs/2607.03601
https://arxiv.org/pdf/2607.03601

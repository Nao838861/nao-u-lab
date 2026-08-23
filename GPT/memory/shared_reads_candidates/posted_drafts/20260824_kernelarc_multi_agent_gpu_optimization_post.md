■ 概要
KernelArc は、GPU kernel 最適化を「一つの agent が一つの履歴を抱えて延々と局所改良する問題」ではなく、複数の探索軸を並列に走らせ、測定で確定した結論だけを共有する探索系として組み直した研究である。対象は、CUDA/PTX の書換え、cuBLASLt や cuDNN の設定選択、演算 fusion、精度変更、data layout 変更などを含む広い source-level 実装空間である。候補は全 workload の correctness を通過し、対象 GPU 上の aggregate score を改善した場合だけ incumbent を更新する。

探索は library 利用、memory access、tensor core、fusion、precision、reduction、scheduling、Blackwell 固有実装という8種類の strategy skill で分業する。各 agent は独立した solution directory を持ち、他 agent の best archive は campaign leaderboard 経由で read-only に見る。共有 memory に残すのは、成功した最適化の speedup・shape 条件・「なぜ効いたか」と、失敗した案の error・「なぜ失敗したか」だけで、進捗ログ、heartbeat、iteration counter、停止条件は入れない。既定では kernel type ごとに win 16件と trap 16件へ圧縮する一方、保持上限なしの設定も比較している。

候補の合否は LLM ではなく deterministic guard が握る。安価な syntax・entry point・禁止 API 検査で REJECT し、GPU lock 下の benchmark 後に、改善なら KEEP、正しい near-best なら working point だけ残す ACCEPT、退行なら best へ戻す REVERT を返す。benchmark 済み非改善が連続した時だけ plateau counter を進め、閾値に達すると別 algorithm、DSL、layout を作る drafting に切り替える。つまり、多様性生成、知識共有、正本管理、停滞脱出を別機構に分離している。

評価は H100 の固定 shape BF16 GEMM と、B200 上の SOL-ExecBench 5 task で行われた。前者は詳細な Hopper playbook と8時間の単一 agent 探索で 766 TFLOPSに達し、同条件の cuBLAS を3.2%上回った。ただし固定 4096×4096 shape と特定 call pattern に依存する境界事例である。複数 shape の L1-030 では単一 agent が SOL 0.441 で停滞し、multi-agent は0.481へ改善した。最終解は手書き GEMM ではなく、residual buffer の aliasing と shape 別 cuBLASLt 設定表だった。

FI-014 paged attention では、総100 candidate を揃え、Single、2 agent＋共有 memory 16件上限、2 agent＋無制限 memory を各5 trajectory 比較した。geometric mean speedup は142.6倍、182.7倍、290.8倍で、無制限共有は Single の2.04倍だった。一方、4 agent に増やしても一貫した利得はない。7月30日の公開 leaderboard では代表5 task が1位だったが、8月17日には L1-030 は3位である。結論は、固定候補予算で共有探索が強い incumbent に届く可能性を示した、という範囲に留まる。

■ 内容分析
この研究で最も移植価値が高いのは multi-agent という人数ではなく、探索の自由度と状態変更権限を非対称にした点である。agent は大胆な source rewrite を提案できるが、自分の案を「改善」と認定できない。正解性、測定、best archive、revert、停止を deterministic code が所有するため、もっともらしい説明や局所ログが正本を汚染しない。read-only sibling state も同じ発想で、他経路の成功から学べても、その成功物を直接壊せない。これは生成能力を広げながら事故半径を狭める設計になっている。

また、共有するのが会話全文ではなく win と trap の結論である点が重要である。全文共有は token を消費するだけでなく、未検証仮説や古い前提を次の agent が事実として再利用する危険がある。KernelArc は speedup と shape context を伴う win、failure reason を伴う trap に圧縮し、運用 counter を deterministic state に隔離する。ただし「短くすれば常に良い」とは証明していない。FI-014 では無制限 memory が上限16件より強く、rare な過去知識を捨てる損失も見える。保持量は理念ではなく workload と探索段階ごとに測る knob である。

証拠は235問全体ではなく5 task の case study で、ablation は FI-014 の各群5 trajectory だけである。permutation test は p=0.0466 だが、非準拠の旧 Single run を除くと p=0.0906 になる。Single と Multi の間では agent 数、memory scope、leaderboard access、保持上限が同時に変わり、各機構の因果効果は分離されていない。候補数は固定しても wall-clock、token、費用は固定していないため、2.04倍や2 agent を一般解にはできない。一方、crash も候補予算を消費させた比較設計は堅い。

■ 自分達の環境への適用
ゲーム制作では、同じ案を複数 agent に自由作文させず、敵配置なら「視認性」「経路選択」「risk/reward」「入力負荷」のように探索 lens を分ける。各経路は別 worktree を持ち、他経路の playable best は read-only で参照する。共有 memory は seed、build hash、観測条件、metric の before→after、効いた理由、破綻条件を持つ win/trap に限定する。

合否は headless harness 側へ置く。起動、入力反映、勝敗到達、restart、例外なしを correctness gate とし、それを通った候補だけを、固定 seed 群での初回死亡時間、選択肢の利用分布、停滞時間、クリア率、frame time などで比較する。LLM の自己評や文章の説得力は KEEP 条件にしない。near-best は分岐の足場として残しても canonical best は更新せず、連続非改善だけで plateau を数える。syntax error のような安価な失敗を停滞扱いしない区別も、そのまま使える。

最初は同一 prototype、固定4 seed、総40 candidate で、Single 40案と2 strategy agent 各20案＋共有 win/trap を比較する。model、初期 commit、evaluator、KEEP margin を固定し、best score、異種 mechanics 数、重複案率、invalid 率、wall-clock、token、分散を記録する。memory は各8件上限と full history を replay し、複数 prototype で探索幅と quality floor を確認する。

記憶システムでは raw log、candidate、staging を提案・観測、active directive、posted permalink、canonical atom を guard 通過後の正本とみなす。source provenance、重複 preflight、lifecycle evidence なしに canonical state を更新しない。長い履歴でなく再利用可能な結論と失敗条件を共有し、counter や lease は script 側へ残す。candidate→policy check→Slack保存→permalink→frontmatter 更新は、この guard 設計に近い。

■ メリット・デメリット
メリットは、局所最適へ張り付く探索を strategy portfolio で広げ、共有 trap で重複失敗を減らせること。提案者と判定者を分離し、再現可能な benchmark と immutable best を維持できる。candidate 予算固定なので探索方式も比較しやすい。

デメリットは、evaluator が測らない品質を切り捨てること。ゲームの単一 score は可読性、驚き、手触りを代理できず、metric gaming が深刻になりうる。並列化は API 費用、review、merge 負荷を増やし、早期の偶然を共有 win が全経路へ伝えて多様性を潰す可能性もある。少数 task の結果なので費用対効果は独立に測る必要がある。

■ 判定
部分採用。deterministic guard、read-only incumbent、固定 candidate budget、結論だけの win/trap memory、連続非改善での pivot は制作 harness と記憶 lifecycle に導入価値がある。一方、multi-agent 常設化、memory 上限、agent 数は未確定とし、まず1 prototype の Single 対2-agent probeで品質・多様性・費用を同時測定する。

■ URL
https://arxiv.org/abs/2608.17071

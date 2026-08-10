■ 概要
「Cross-Benchmark Generalization in Long-Horizon Agents」が扱うのは、自己完結した訓練環境で agent の得点が上がった時、それが再利用可能な技能の獲得なのか、tool schema、grader の癖、task template といった環境固有の近道を覚えただけなのかをどう区別するか、という問題である。同一分布の holdout はこれらの癖を訓練集合と共有するため、そこでの改善だけでは転移を証明できない。著者らは評価対象を「何点取ったか」から「別の環境でも同じ働き方をするか」へ移し、外部 benchmark の score と paired trajectory を組み合わせて調べた。

訓練には Qwen3.5-122B-A10B を使い、office、browser、terminal、file system など27 category、363件の long-horizon MCP task からなる LHMTA で post-training した。各 task は最終状態を複数 criterion で採点する deterministic grader を持ち、成功軌跡は通常30～40 tool call、8万～10万 token に達する。base model では binary reward が疎だったため、Kimi K2.6 による高得点3000軌跡で SFT し、同じ363 task に GSPO で RL を行った。低得点時には部分達成率に加え、tool call、正常終了、tool diversity から最大0.4の effort floor を作るが、評価には各 benchmark 固有の採点だけを使う。

外部 task と grader は訓練に入れず、外部 score は reward、hyperparameter、checkpoint 選択、停止判定に使わない firewall を置いた。その条件で greedy pass@1 は base 比で Toolathlon +9.6ポイント、τ²-Bench +5.3、BFCL-V4 +3.5、SWE-Bench Pro +5.8、Terminal-Bench 2 +2.8となった。LHMTA に software-engineering task がないのに後二者も改善した点が遠距離転移の証拠である。731組の SWE-Bench Pro 軌跡では formal test 実行が37.5%から73.3%、取得情報の反復が22.5%から14.3%、平均追加行が415.5行から111.7行へ変化した。事例比較から、正しい局所目標、目標に必要な working state、修復中の parent goal 維持、境界ごとの完了検証という四行動が office と code の双方に現れたと整理する。ただし単一 run であり、因果機構や統計的有意性の証明ではない。

■ 内容分析
この研究の良さは、一般化を三段の証拠に分けた点にある。同一環境 holdout は訓練 pipeline の健全性確認に限定する。次に task、grader、選択信号を隔離した外部 benchmark で、tool use から未訓練の software engineering まで距離を変える。最後に同じ prompt、環境、scaffold で base と trained の fail-to-pass 軌跡を比較し、score 差を行動仮説へ落とす。この分離で何が移った可能性があるかを監査できる。

四つの行動差も抽象語だけではない。局所目標では conversion 式の因果順を正す例と、既存 helper を迂回せず public method を狭く修正する例を対応させる。working state では spreadsheet の cached value を再読込する例と、repository の中央 validator を再利用する例を結ぶ。parent goal 維持では単位数修正中に学年制約を落とす失敗と、古い test に従って新 requirement を打ち消す失敗を同型とみなす。完了検証では不完全 file の自己照合と、stale call site 探索・targeted type-check を対比する。表面的 domain ではなく、環境が要求する task pressure を単位にした分析である。

ただし因果の読み過ぎは危険である。effort floor は tool 利用、正常終了、tool diversity を直接促すため、「試す」「成果物を残す」増加は reasoning ではなく propensity の shaping かもしれない。no-floor、SFT-only、RL-only の ablation はなく、四行動の発生段階は分からない。軌跡 category も自動分析を人が raw trace と照合して作った探索的枠組みである。formal test 増加は test の妥当性や通過率を意味せず、小さい patch や reference patch との重なりも正解の証明ではない。

firewall にも残余がある。Toolathlon は訓練 task を含まないが、一部 MCP server と tool schema を共有し、base family と teacher 選択時には leaderboard を参照した。pretraining corpus は監査不能で、五 benchmark は相関し、τ²-Bench だけ provenance が異なる snapshot 由来である。「五つすべて正方向」は興味深いが、再現性や有意差を保証しない。この限界の明示も、本論文を score 宣伝より評価設計として読む理由である。

■ 自分達の環境への適用
最も直接に使えるのは、自動プレイテスト agent の改善を、同じゲームの score だけで合格にしない評価構造である。まず訓練・調整に使う game A の既知 stage を in-distribution pipeline check とする。次に同じ入力 API だが未見 stage の near transfer、別の敵構成や勝利条件を持つ game B の far transfer、さらに screenshot 観測と state JSON 観測、keyboard 操作と抽象 action API のように harness 自体を替えた surface transfer を用意する。外部 set の結果は prompt、memory rule、checkpoint、停止判定へ戻さず、最終監査まで sealed にする。これで特定 grader の加点条件や state field 名を攻略しただけの改善を見つけやすくなる。

軌跡 rubric は四項目をゲーム向けに具体化できる。局所目標形成は「敵を倒す」ではなく、現在の弾幕、残機、無敵時間から次の2秒の目的を正しく選べたか。working state は位置、速度、cooldown、敵 phase、未回収 item を更新し、古い snapshot を捨てられたか。parent goal 維持は被弾回避や取りこぼし修復の最中に、stage clear、護衛、生存など上位目的を失わないか。完了検証は score 表示や一時停止を勝利と誤認せず、勝敗 state、遷移、再試行可能性まで観測したか、とする。score と併せて goal switch 回数、stale state 参照、同一観測の反復取得、局所修復後の上位制約違反、終端誤認率を deterministic に数える。

小さな probe なら既存 headless task の20 seed で現行版と改善版を paired 実行する。10 seed は調整用、5 seed は同じ game の未見 pattern、5 seed は別 prototype または別観測 adapter に隔離する。success rate と最初の失敗分岐を四 rubric で測り、「行動回数が増えただけ」か「別環境でも親目標保持と検証が増えた」かを見る。記憶でも recall 件数ではなく、候補選定、根拠更新、postpone、投稿完了へ同じ state 管理が移るかを測れる。

■ メリット・デメリット
メリットは、成功率の上昇を reusable workflow と grader exploitation に切り分ける共通言語が得られること、surface が異なる task を task pressure で束ねられること、失敗軌跡から次の訓練 task を設計する flywheel を作れることにある。paired trajectory は、平均 score では消える「上位目的を落とした」「便利な proxy を完了条件にした」を局所化できる。sealed external set と deterministic rubric により、prompt や memory rule の改善にも評価漏洩の境界を導入できる。

デメリットは、far transfer set の作成と隔離に継続コストがかかり、game 間で難易度、観測量、action space が違えば score 差の解釈が難しいことだ。四 rubric も人手で後付けすれば成功例に都合のよい物語になり得るため、判定規則を実行前に固定し、可能な項目は telemetry から機械計算する必要がある。また tool diversity や action 数を直接 reward すると、無意味な探索を増やして「努力しているように見える」agent を作る危険がある。報告値をゲーム領域へ外挿せず、まず小規模 paired probe で rubric の再現性を確認すべきである。

■ 判定
部分採用。外部評価を調整信号から隔離する firewall、near/far/harness transfer の三層化、score と paired trajectory rubric の併用は、headless 評価と記憶運用の双方に採用する価値が高い。一方、effort floor や論文の改善幅はそのまま移植せず、no-shaping 対照と事前固定した四 rubric を持つ20 seed 程度の probe から検証する。

■ URL
https://arxiv.org/abs/2608.00181

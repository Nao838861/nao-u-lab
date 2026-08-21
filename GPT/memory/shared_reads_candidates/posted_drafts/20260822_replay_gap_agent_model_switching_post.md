■ 概要
LLM router は、各問い合わせを「十分に答えられる中で最も安い model」へ割り振ることで、品質を保ちながら計算費用を下げようとする。単発質問なら、同じ入力に対する複数 model の記録済み回答を並べ、router が選んだ回答の得点を参照する static replay でも比較できる。しかし tool use や software engineering の agent は閉ループ系であり、step k の action が step k+1 の観測、作業ディレクトリ、残り budget、以後の判断を変える。途中で model A から B に切り替えたのに、A が作った後続 trajectory をそのまま採点する方法は、「B を選んでも世界は A の記録どおり進んだ」という成立しにくい反実仮想を評価している。

本論文はこのずれを replay gap と呼び、SWE-bench Verified 上の mini-SWE-agent trajectory を実際に途中分岐させる branching rollout で測定した。Qwen3-4B-Instruct（FP8）と Qwen3-14B（AWQ、thinking 無効）を temperature 0、50 step、28k context、単一 24GB GPU で動かし、base trajectory の長さの30%地点と70%地点を fork とする。各 fork では新しい container を起動し、fork 前の command を再実行して環境を復元し、同じ message history を与えた後、別 model へ切り替える swap arm と、同じ model で続ける control arm の両方を最後まで走らせる。control は sampling、batching、serving stack、環境再生に由来する自然な分岐の床であり、swap の影響はこの床との差として読む。環境復元は11,702 action 中99.99%で return code が一致し、708 branch 中707が完全復元された。

実験は難易度・prompt 条件3層と上位／下位への切替2方向を組み合わせた6 run pair、約900 rollout、717の採点可能な branch pair からなる。swap 後 action の normalized edit distance は control を0.25〜0.66上回り、多重比較補正後の信頼区間でも差は0を跨がない。swap trajectory の61〜94%の action が書き換わり、早期切替では74〜77%が fork 直後の最初の action から分岐した。早期 upgrade で replay が正しい state を見ている割合は3.2%、早期 downgrade でも8.0%にすぎず、92〜97%の後続判断を「実際には訪れない state」で採点することになる。

最終成否の反転は3 instance・5 event すべてが swap arm で起き、359 control fork では0件だった。小 model で未解決だった課題を大 model への切替が救う一方、大 model が解いた唯一の課題を小 model への切替が落とす例もある。別 model の standalone log を継ぎ合わせる evaluator は、全体の成否一致率だけなら失敗多数のため97〜100%に見えたが、成功が関係する5判定は0勝5敗で、予測 patch と実際の branch patch の類似度も0.00〜0.11だった。結論は、agent の途中 routing を static log の継ぎ合わせだけで評価すると、選択によって変わる世界線そのものを失うため、live または branching evaluation が必要だ、というものだ。

■ 内容分析
重要なのは「trajectory は分岐して当然」という定性的主張ではなく、swap 固有の分岐を same-model control から分離した点にある。temperature 0 でも FP8-served 4B の control は90〜96%で分岐し、edit distance も0.49〜0.67だった一方、AWQ-served 14B は半数が一度も分岐せず0.16〜0.23に留まった。固定 seed と temperature 0 を再現性の保証とみなすのではなく、実際の serving configuration ごとに noise floor を測る必要がある。swap-control の paired delta を instance 単位で bootstrap し、同一 instance 内 branch を再標本化で分割しない設計も妥当である。

また、評価指標の多数派クラス問題を具体的に示している。解決率0〜3%の条件では「常に失敗」と予測するだけで高い outcome agreement が出るため、成功を見逃した件数、偽成功、non-empty patch に限定した類似度を別に見る必要がある。empty patch 同士を identical と数えると patch 指標も水増しされる。これは headless 評価で平均 score だけを見る危険と同型で、rare success、致命的 failure、状態到達率を分けて集計すべきだと読める。

一方、結果を「強い model へ早く切り替えれば常に良い」と一般化してはいけない。full-difficulty の1 run pair では14Bが50 stepを使い切って提出しない例が4Bより多く（24/30対17/30）、詳しく調べる能力が tight budget 下では未完了を増やす thoroughness tax になった可能性がある。ただしこれは未補正の単一観測であり規則ではない。さらに4B/14Bの能力差とFP8/AWQ serving差が交絡し、scaffold、benchmark、model family、quantization、GPU条件も各1種類である。論文が強く示すのは replay state の無効化であって、有能な agent 群で router の順位が実際に逆転することではない。

■ 自分達の環境への適用
headless game playtest で model、prompt、policy、memory retrieval を途中差替えする場合、記録済み後続操作へ新 policy の局所 action だけを当てはめない。同一 checkpoint に、乱数 state、world state、敵AI、inventory、残り時間・step数、観測履歴を含めて保存し、差替え arm と同一条件 control arm を別 process で終端まで再実行する。比較単位は fork 後の command 一致率だけでなく、最初の分岐 step、訪問 state の一致率、クリア／死亡／softlock の反転、残り資源、提出・終了の有無まで持つ。

最小 probe は、代表的な10〜20 episode の30%・70%地点を fork し、各地点で「同じ policy の再実行」2本と「変更 policy」2本を走らせる形でよい。まず checkpoint 復元 fidelity を検証し、control の分岐率を測る。その上で swap-control 差が大きい episode だけ rollout 数を追加する。高価な branching を全 trajectory に課すのではなく、static replay は候補の粗い screening に残し、合否や採用判断だけを branch ground truth で確定する二段構えが現実的である。

coding agent や記憶システムの評価でも同じで、途中から別 model や別 recall 結果を注入した後に、元 agent の tool output と作業ツリーを固定して採点してはならない。fork 時点の filesystem、process 状態、tool history、token・step budget を復元し、変更後の agent 自身に後続 tool call を選ばせる。特に「高性能 model ほど慎重で時間切れになる」「長い記憶ほど確認が増えて成果物を出せない」といった budget interaction は、局所応答品質では見えず、終端まで走らせて初めて観測できる。

■ メリット・デメリット
メリットは、差替え後に実在する trajectory を採点でき、局所 action の良さと最終 outcome の因果を切り離さないこと、same-policy control により model差と実行基盤の揺れを分離できること、早期／後期の切替や upgrade／downgradeを routing feature として扱えることである。checkpoint fidelity、rare outcome、empty-output 水増しを明示的に監査する枠組みもそのまま転用できる。

デメリットは、環境 snapshot と再実行可能性が必要で、fork数に比例して計算時間・API費用・保存量が増えること、非決定的な外部APIや人間入力を含む環境では同じ prefix の復元が難しいこと、control 自体の分散が大きいと多数の rollout が必要になることである。また本論文の低い絶対成功率、2 model、2 fork位置、量子化交絡から、具体的な最適 routing 規則を直接輸入するのは危険である。

■ 判定
部分採用。static replay を廃止するのではなく、候補探索用の安い近似へ格下げし、model／prompt／policy／memory を途中変更した評価の最終判定には checkpoint からの branching rollout と same-condition control を必須にする。まず小規模 probe で復元 fidelity、control noise、outcome flip を測り、費用に見合う fork位置と反復数を決める。

■ URL
https://arxiv.org/abs/2608.08239

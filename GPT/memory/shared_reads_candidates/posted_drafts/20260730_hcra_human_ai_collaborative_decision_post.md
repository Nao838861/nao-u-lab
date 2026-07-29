■ 概要
Human-Centric Reflective Architecture（HCRA）は、「AI の推奨精度が高ければ人間との協働も良くなる」という前提を退け、正しい提案を人間が受け入れ、誤った提案を拒める状態まで反復することを目的にした意思決定 architecture である。人間は AI の能力を過大・過小評価しやすく、confidence や説明を見せるだけでも適切な信頼にはならない。そこで著者らは、共同意思決定を AI agent と human player の stochastic game として定式化し、単発の回答精度ではなく、制約適合、推奨への受容確率、過去の相互作用を状態に含める。

HCRA は五つの機能からなる。actor LLM が推奨と自己 confidence を出し、evaluator LLM が factual correctness と、自然言語で指定された全制約への agreement をそれぞれ評価する。human calibration model は actor の生 confidence を evaluator の correctness 判定に応じて変換し、人間向け confidence を作る。human acceptance model は、その confidence、agreement、年齢・教育・AI 利用経験などの特徴から、推奨を受け入れる確率を予測する。self-reflection LLM は推奨、correctness、受容確率、直近三回の short-term memory、過去 request の long-term memoryを読み、次の actor に言語 feedback を返す。この loop は、人間側の期待損失の変化が閾値内に入るまで続く。

人間側 reward は、正しく制約に合う提案を受け入れる確率が高く、誤りまたは制約違反の提案を拒む確率が高いほど良くなる log-loss 型である。したがって目的は単なる「受け入れられやすさ」ではなく、evaluator が判定した正しさ・agreement と acceptance を一致させることにある。著者らは任意の閾値で反復が有限終了することを示す一方、終了は成功を保証せず、誤った提案の受容や正しい提案の拒否でも止まり得ると明記している。

実装では actor、evaluator、self-reflection の全役を DeepSeek-V3-0324 が担当する。観光推薦32問を10 run、計320 trial 実行し、成功を「最終 acceptance probability > 0.5、factual correctness、全制約への agreement」の三条件で測った。actor temperature 1.0 では成功率58.4%、平均4.78 iterations。temperature 1.9 では29.1%へ落ち、探索性を増やし過ぎると反省が収束を導けない。32問の履歴を入れた後の追加10問では成功率75%、平均4.32 iterationsだった。calibration model を外すと53.8%、evaluator 判定へ50%確率でノイズを加えると15.9%まで低下した。人間 model を持たず correctness だけで止める baseline は平均3.50 iterations と速いが、50%が1回、69%が2回以内で早期終了し、制約と受容を見ていない。

■ 内容分析
この論文の重要点は「人間中心」を UI の説明量ではなく、最適化対象と停止条件へ入れたことにある。actor の回答、evaluator の正しさ、制約適合、confidence、受容予測を別変数にしたため、「正しいが要求を外す」「要求には合うが誤っている」「良い提案だが信用されない」を区別できる。correctness だけで止めた baseline の速さが、協働品質では早過ぎる停止になった結果は、agent の少ない反復回数をそのまま効率と呼べないことを示している。

同時に、この human utility は実人間の満足を直接測った値ではない。acceptance model の教師 label は、既存 dataset における助言前後の人間 confidence の差が0.035を超えたかで作られている。さらに元の34,655 interactions から8,404件を選び、agreement / disagreement と accept / reject の組合せが意図した75/25比になるよう均衡化している。モデルは ROC-AUC 0.78 だが、art、cities、sarcasm、census の二値判断から学んだ受容傾向を観光推薦へ移している。agreement も元 dataset では人間と AI の二値回答の符号一致から導出し、実運用では evaluator による自然言語制約判定へ置換する。学習時と利用時で feature の意味が同一ではない。

calibration 後の受容率も49%から51%への増加であり、単体効果は小さい。full HCRA と calibration なしの成功率差は4.6 points だが、confidence interval は示されていない。一方、evaluator ノイズで15.9%まで崩れる差は大きく、評価器が単一障害点だと分かる。actor、評価、反省を同じ基盤 model が担うため、もっともらしい誤りを三者が共有する correlated failure も残る。

また、追加10問の75%を long-term memory の学習効果と読むには対照が弱い。元32問とは別の、類似または複雑な質問群なので、同一質問集合で memory あり／なしを比較した厳密な ablation ではない。実人間が反復中に介入する実験、長期 task、個人ごとの継続的な適応も未実施である。したがって本研究は「人間を理解した完成系」ではなく、受容を代理変数にした評価 loop の構成例として読むのが妥当だ。

■ 自分達の環境への適用
直接使えるのは人口統計 model ではなく、制作支援の一回を分解して記録する schema である。各 playable diff について、提案内容、hard constraints、headless 指標、評価根拠、agent confidence、設計者の採否、採否理由、次の playtest 結果を別 field にする。たとえば「build 成功」は correctness の一部、「敵配置密度・入力遅延・既存 lesson 遵守」は agreement、「面白くなった」は人間の最終判断として混ぜない。これにより、実装は通ったが設計意図を外した失敗と、設計は合うが壊れている失敗を検索時にも分離できる。

short-term memory は同一 task の直近三試行だけに絞り、差分、失敗 seed、評価根拠、次に一つだけ変える項目を保持する。long-term memory には終了した全会話を流し込まず、同じ mechanic・失敗条件・評価軸を持つ atom と playable evidence だけを retrieval する。HCRA の「終了時に短期履歴を長期へ移す」をそのまま採ると、誤評価を含む反省が記憶を汚すため、最終的な playtest evidence と採否理由を通過条件にする。

小さな検証は次の20件程度の制作判断で行える。従来の一文評価と分離 schema を交互に適用し、(1) hard constraint 違反率、(2) 同じ失敗の再発率、(3) playable diff までの反復数、(4) confidence と実測成功率の calibration、(5) 設計者が覆した理由を比較する。停止条件は predicted acceptance にせず、build、headless invariants、対象 mechanic の実測、設計者の確認を conjunctive gate にする。評価器には seed、ログ位置、スクリーンショット、該当 rule など反証可能な evidence を必須にし、同一 model の自己同意を成功扱いしない。

この形なら、Phase 2 の候補評価、ゲーム制作の自己判定、memory atom の昇格を同じ原理で扱える。「受け入れられたか」を正解にせず、「何を根拠に採用され、その後の実測がどうだったか」を残すことで、迎合ではなく calibration の改善に使える。

■ メリット・デメリット
メリットは、回答品質を correctness 一軸から解放し、制約適合、confidence、受容、履歴効果を個別に観測できることだ。言語 reflection なので重い fine-tuning をせず test time に修正でき、短期と長期の経験を分ける構成も制作 cycle と相性が良い。「早く止まるが人間の要求を満たさない」baseline の失敗は、反復数削減を目的化しないための具体的な警告になる。

デメリットは、受容確率を高める最適化が、正しさより説得・迎合を学ぶ方向へ容易に反転することだ。人口統計特徴を採否予測へ使う設計は stereotype、privacy、少数利用者への不公平を持ち込み得る。代理 label、人工的に均衡化した dataset、別 domain への転用、同一 LLM evaluator という前提が重なっており、観光実験の数値をゲーム制作へ移植できない。反復ごとに複数の LLM call が必要な計算費もある。

■ 判定
部分採用。提案・正しさ・制約適合・confidence・採否理由・後続実測を分離する loop と、評価器ノイズを単一障害点として監査する考え方は採用する。人口統計から acceptance を予測する model と、predicted acceptance による自動終了は採用しない。最初の成功条件は、分離 schema により hard constraint 違反と同型失敗の再発が減り、confidence と実測結果のずれを説明できることとする。

■ URL
https://arxiv.org/abs/2607.03025v1

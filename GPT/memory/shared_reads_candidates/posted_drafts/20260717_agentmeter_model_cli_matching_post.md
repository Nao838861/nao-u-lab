■ 概要
LLM エージェントをローカル作業へ配備するとき、性能を決める単位はモデル単体ではない。CLI harness が prompt の配置、過去 context の再投入、tool output の直列化、file access、terminal observation、停止判定を仲介するため、同じモデルでも CLI が変われば成功率、token 消費、課金額、失敗時の浪費が変わる。AgentMeter はこの「model–CLI 構成」を評価単位に据えた benchmark である。

評価対象は code 編集、repository 調査、shell 操作、data analysis、document/file workflow を含む 90 task の Benchmark90 と、構成候補を安く広く比較する 30 task の Core30。Benchmark90 は Easy / Medium / Hard 各30件、Core30 は各10件で、後者では6モデル×4 CLI、計24構成を同じ task 群で比較する。難度は出典ラベルで決めず、複数構成での pass rate、部分点を含む平均 reward、median token、turn 数、interaction footprint から「実際にどれだけ effort を要したか」を先に校正する。課金額や最終順位は tier 分けに使わず、難度決定と配備効用の scoring を分離している。

主指標 AgentMeter Score（AMS）は、各 tier の task quality を成功の anchor とし、tier 別 USD budget 内で得た quality の面積と、高額な失敗 trajectory の比率を組み合わせる。Easy は少ない浪費、Medium は成功と費用の釣り合い、Hard は成功と高額失敗の回避を評価する。Pass 数は費用、token/pass は価格差と cache、USD/pass は低 coverage を適切に扱えないため、診断値として併記する。

Core30 の結果は指標ごとに首位が分裂した。最多成功は GLM-5.1＋qwen-coder の18/30、最少 token/pass は GPT-5.3-Codex＋kimi-cli の42万、最少 USD/pass は Qwen3.6＋Codex の0.047ドル、最高 AMS は Qwen3.6＋kimi-cli の0.529だった。同一モデル内でも最適 CLI は一様でなく、Qwen3.6 は kimi-cli、GLM-5.1 は qwen-coder、Claude Sonnet 4.6 と GPT-5.3-Codex は Codex が最高 AMS となった。Core30 と、完全な90 task run が揃った16構成の Benchmark90 を比べると Top-1 と Top-3 集合は維持され、Spearman 0.765、Kendall 0.567、AMS の平均絶対誤差0.0383だった。結論は、モデルと CLI を独立に選ばず、実際に配備する組合せとして測るべき、というものだ。

■ 内容分析
この研究の価値は「harness も重要」という一般論を、同じ task・上限の下で pairing を全交換する比較へ落とした点にある。grid-dispatch-operator では Qwen3.6＋qwen-coder が36.9万 token で成功した一方、同じモデル＋Claude Code は478万 token と30回の file reread を費やして失敗した。sqlite-query-optimizer は両 CLI で成功しても後者が5.1倍の token を使った。観測、履歴保持、再読抑制、終了判断が trajectory を変える具体例である。

特に良いのは expensive failure を明示的に悪としたことだ。Benchmark90 の解析可能な1,274 trajectory では、成功 run の token 中央値15.8万に対し、失敗 run は38.1万だった。失敗を単なる0点にすると「どれだけ資源を燃やして0点になったか」が消える。制作支援 agent では、長時間探索した末の無変更、同じ asset の反復読込、timeout 直前の破壊的変更などが実害になるため、成功率だけの leaderboard より配備判断に近い。

ただし AMS は普遍的な能力値ではない。tier 別 budget は観測された cost quantile、expensive failure threshold は失敗 run の tier 別 P90、価格は2026-06-04時点の provider 料金と固定為替から作られる。model 価格、cache accounting、task mix が変われば順位も変わる。また Core30 が Top-3 集合を保ったのは有望だが、順位相関0.765は「30件で十分」を意味しない。候補を絞る screening と90件での validation を役割分担した結果であり、下位や僅差の構成まで安定する保証ではない。

もう一つの限界は、task effort tier 自体が評価した構成群の経験分布から作られる点だ。新しい model や tool が従来 Hard task を一気に容易化すれば、固定 tier は現状を表さなくなる。逆に interaction footprint を難度校正に使うと、冗長な harness の振る舞いが task 固有難度へ混入する余地もある。したがって AMS は「この task 集合、この価格 snapshot、この実行規約での構成 utility」と読むべきで、モデル一般の序列として再利用してはいけない。

■ 自分達の環境への適用
最も直接的な適用先は headless game test / AI playtest の比較表である。評価行を model 名だけにせず、`model + 観測表現 + tool schema + context/replay 方針 + timeout/停止条件` の versioned configuration ID にする。たとえば同じ model に対し、frame screenshot、構造化 game state、event log のどれを渡すか、1 action ごとに全履歴を再送するか要約するか、失敗時に何回まで再探索するかを別構成として扱う。これで「model を替えたから改善した」のか「観測と停止条件を直したから改善した」のかを trajectory 単位で追える。

小さな導入は Core30 の発想を縮めた Core12 でよい。4分類を各3件、(1) 起動・移動・終了までの基本操作、(2) 明示された勝利条件の達成、(3) hidden state や数手先を要する探索、(4) crash、softlock、進行不能、違和感の検出、とする。各 run で pass/partial reward、wall time、model token、tool call 数、同一 file/state の再読回数、無効 action、終了理由、変更差分の有無を保存する。候補構成を Core12 で screening し、上位と性質の異なる構成だけをより広い game/task set で再検証する。

AMS をそのまま移植する必要はない。ゲーム制作では課金額だけでなく human review cost と false confidence が重い。成功 anchor に「再現可能な evidence がある」「意図しない game rule 変更がない」を加え、expensive failure を `高 token の未完了`、`長時間の無変更`、`同じ観測の反復`、`誤った成功宣言` に分解する方がよい。playtest ではクリア率最大の agent だけを選ぶと、最短解へ収束して面白さの問題を見落とすため、coverage、発見した固有 issue 数、issue の再現率も独立診断値として保持する。

記憶システムにも同じ考え方を使える。recall quality を LLM だけの性質とせず、atom schema、検索 query、fold、context budget、停止条件まで含む pipeline configuration として version 化する。成功した回答数だけでなく、参照根拠の妥当性、不要 atom の混入、再帰的な同内容参照、失敗までに読んだ量を測れば、memory 改修が精度を上げたのか単に context を大量消費したのかを区別できる。

■ メリット・デメリット
メリットは、model upgrade と harness 改修を混同せず、安価な model と良い interface の組合せも残せること、成功、token、実費、高額失敗を分けて目的別に選べること、小 subset で screening して full set で検証し評価費用を抑えられることだ。

デメリットは、単一 score が運用上の価値判断を隠し得ることだ。budget grid、tier weight、失敗 penalty を変えるだけで首位は動く。価格 snapshot 依存も強く、異なる provider の cache field が同じ精度で取れない場合、公平な USD 比較にならない。さらに一般 CLI task の順位は、ゲームの時系列観測、探索の多様性、操作感の言語化、面白さの診断へ自動的には移らない。構成の全組合せは model、観測、tool、memory 方針が増えるほど爆発するので、pairwise ablation と段階的 screening が必要になる。

■ 判定
部分採用。model と harness を配備単位として version 化し、成功だけでなく失敗時の浪費を trajectory から測る原則、少数 task で screening して広い set で再検証する構造は採用する。一方、AMS の重み、USD budget、Easy/Medium/Hard tier、一般 CLI task の順位は移植しない。まず game 固有 Core12 と構成 ID を作り、順位だけでなく task 別差分と失敗 trajectory をレビューしてから評価規模を広げる。

■ URL
https://arxiv.org/abs/2606.21140

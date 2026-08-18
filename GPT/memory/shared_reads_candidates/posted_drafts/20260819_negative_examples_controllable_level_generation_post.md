■ 概要
この論文は、ゲームレベル生成器へ「望ましいレベル」だけでなく「避けるべきレベル」も学習させると、playability と設計パラメータを制御しやすくなるかを検証する。対象は Super Mario Bros. 風の 14×32 segment と、独自の 14×14 Cave map。制約ベース生成器 Sturgeon を用い、局所的な tile pattern は似ているが start から end へ到達できない hard negative を作る。Mario は pipe 数、Cave は treasure 数を 1・2・3 の三 class とし、各 game について class ごとに playable / unplayable を各3000件、合計18000件生成した。

比較するのは三方式である。vanilla GAN は目的を満たす正例だけで class ごとに別 model を学習する。CGAN は generator と discriminator の両方へ条件 label を渡し、正例と負例を label で区別する。Rumi-GAN は discriminator の loss に正例へ近づき負例を避ける項を持ち、正例重み1、負例重み0.5とする。共通 backbone は deep convolutional WGAN、optimizer は RMSprop、batch size 32、learning rate 0.00005、200 iteration。負例を使う方式では正例と負例を同数 sample し、学習後は各 model から500 levelを生成して Sturgeon の shortest-path 判定と feature 数で評価した。

実験1は playability だけを目的とする。正例は全 class の playable、負例は全 class の unplayable である。playable 率は Mario で vanilla 67.8%、Rumi 72.0%、CGAN 75.4%、Cave で87.0%、89.6%、66.6%。負例利用が常に勝つわけではなく、Mario では二方式が baseline を上回る一方、Cave は Rumi のみ小幅改善し、CGAN は20.4 point悪化した。

実験2は「playable かつ指定した pipe / treasure 数」を目的とする。指定 class の playable だけを正例にし、他 class の playable と全 class の unplayable をまとめて負例にする。Mario の joint success 平均は vanilla 24.0%、Rumi 18.8%、CGAN 25.0%、Cave は13.6%、13.1%、12.8%で、負例方式の明確な優位は消えた。著者の結論は、負例は playability のような単一制約には役立つ場合があるが、複数の違反理由を一つの負例集合へ束ねると model が何を避けるべきか区別できず、feature 数の controllability までは改善しない、というものだ。

■ 内容分析
価値があるのは、負例の有無だけでなく「負例がどの失敗領域を覆うか」を sample-space として明示した点である。playable / unplayable と feature 数 correct / incorrect を交差させれば、成功、到達不能、配置数違反、両方違反を分けられる。しかも Sturgeon の unreachability constraint により、壁だらけの露骨な失敗ではなく、局所形状だけでは正例と見分けにくい負例を作っている。これは単なる random corruption より、生成器が大域的到達可能性を学べるかを問う hard negative になっている。

一方、実験2ではこの分解を評価に使いながら、学習時には三種類の失敗を同じ負側へ潰している。Rumi-GAN から見れば「pipe 数は正しいが到達不能」「到達可能だが pipe 数が違う」「両方違う」が同じ避ける分布である。特に Mario class 3 の Rumi は feature 数 correct 0.6%、playable-correct 0.0%まで崩れた。負例が多いほどよいのではなく、正例境界のどちら側へ戻すべきかを示さない異質な負例は、target distribution 自体を曖昧にする。

三つの指標を分けて読むと、joint success だけでは見えない trade-off もある。Mario の CGAN は correct 36.6%、playable 65.8%、joint 25.0%で、vanilla の35.0%、65.6%、24.0%に対する改善は各1.6、0.2、1.0 pointに留まる。Cave の CGAN は feature 数 correct が29.4%で他方式の16.5%、14.9%を上回る一方、playable は35.3%へ落ち、joint は12.8%で最下位になる。条件付けが数の制御には効いても、通路構造を壊した可能性があり、「制御性が上がった / 下がった」の一語では評価できない。

強い一般化を避けるべき理由もある。各条件500生成なので率は0.2 point刻みで測れるが、学習 seed を変えた反復、信頼区間、有意差、生成物の重複率や多様性は報告されていない。Mario の Rumi と vanilla の4.2 point差、Cave の2.6 point差が GAN 学習の分散を越えて再現するかは分からない。level corpus も二つの tile game、制御値も1〜3個、playability も start-end path の有無に限られる。さらに Cave の treasure は到達可能でなくても個数が合えば correct と数えるため、gameplay 上使える配置の制御とは一致しない。論文は「負例が有効」と証明したというより、負例設計と評価軸を分けないと効果判定を誤ることを示した予備実験として読むのが妥当である。

■ 自分達の環境への適用
直接採るべきなのは GAN ではなく、失敗例を型付き資産にする方法である。手続き生成 level の headless 評価を一つの success flag にせず、`start_end_valid`、`goal_reachable`、`required_count_match`、`forbidden_overlap`、`resource_budget`、`runtime_safe` のような独立軸で記録する。失敗 level には violation vector、seed、generator version、shortest-path length、対象 parameter を残す。「failed」だけの記憶に潰さなければ、次の生成器が避けるべき境界と、単に別の設計意図だった例を区別できる。

小さな probe は、同一の正例集合に対し、①正例のみ、②全違反を一つの負 label にした binary-negative、③違反型を別 label にした typed-negative の三条件を固定 budget で比較する。各方式を複数 seed で学習し、同じ生成 seed 群へ、各制約の marginal success、全制約の joint success、失敗型 confusion matrix、重複率、多様性、修復後 success を出す。採用 gate は joint 率だけでなく、ある制約の改善が別制約を悪化させていないこと、seed 間の区間が baseline を安定して上回ることとする。

負例は「正例から一箇所だけ外れた counterfactual near-miss」を優先する。到達可能な map の通路を一箇所閉じる、配置数だけを一つ超過させるなど、違反原因を一つに限定すれば、どの修正方向を学ぶべきか明確になる。複数違反例は捨てず、単一違反を学んだ後の curriculum または stress test に回す。hard constraint は最終的に deterministic validator と repair / rejection sampling で保証し、learned generator の高い平均率を保証そのものと誤認しない。

制作サイクルでも、playtest や headless run の失敗を同じ原理で扱える。失敗 artifact を消さず、違反軸と再現証拠を candidate / atom に結び、次の変更では「何件直ったか」だけでなく failure mode の移動を見る。これにより、到達不能を減らした代わりに単調な level が増える、といった局所最適化を早期に検出できる。

■ メリット・デメリット
メリットは、失敗生成物を廃棄物ではなく境界情報へ変えられること、playability と設計値を分離して回帰を発見できること、constraint solver で再現可能な hard negative を量産できることにある。正例だけでは疎い失敗領域を、狙った near-miss で補える。

デメリットは、負例 taxonomy と label の設計コストが高く、誤った負例は有効な多様性まで排除することだ。binary な失敗集合は原因を隠し、複数制約では勾配が競合しうる。GAN の学習分散、mode collapse、重複を別途測らなければ、500生成の割合だけで方式を選べない。solver が定義した playability は player experience、難易度、面白さを保証せず、solver の盲点を model が継承する危険もある。

■ 判定
部分採用。失敗例の収集、制約軸の直交分解、near-miss 生成、marginal / joint の併記を headless PCG 評価へ採る。一方、Rumi-GAN や「負例を増やせば制御性が上がる」という結論は採らない。まず typed-negative probe を複数 seed で positive-only baseline と比較し、制約間 trade-off と多様性を含む gate を越えた場合だけ学習経路へ組み込む。

■ URL
https://arxiv.org/abs/2410.23108

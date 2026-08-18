■ 概要
「Beyond Asking」は、プレイ履歴から「回避が得意」「収集好き」といった player profile を作る際、LLM がそれらしい説明を返せるかではなく、本当に潜在 trait を回復できたかを反証可能にする pipeline を提案する。実人の trait は直接観測できず、自己申告を正解にすると「行動から推定したものを本人の回答で測る」循環になる。また pickup を取らなかったという結果だけでは、収集意欲が低いのか、そもそも取れる場面がなかったのかを分けられない。

そこで著者らは、縦スクロール shooter 上に Dodge、Collector、Aggression、Skill usage の4パラメータを持つ synthetic player を作る。各値は回避の反応間隔、目標追跡の確率、前方に出る圧力、能力を使える機会で実際に使う確率など、別の制御 channel にのみ入る。ただし code に数値があるだけで ground truth とは呼ばない。6水準×5 seed、各次元30 run を用い、①値を上げると予め切り離した行動指標が Spearman ρ≥0.6 で単調に変わる、②他 trait の指標が系統的に漂流しない、③隣接水準の差が seed 分散に埋もれない、の admission test を通ったものだけを正解にする。

記録は各 decision moment で「状態」「その時選べた行動集合」「実際の行動」を並べる opportunity-aware record で、trait 名は blacklist で混入を防ぐ。LLM reader には game rule、4軸の行動定義、約100行の検証済み metric-profile 表、特徴量上で近い2 session を与え、3回の推定を平均する。最後は推定 profile を level へ変換し、Dodge/Aggression から目標難易度、他軸から reward 位置、能力機会、敵の進入角を決める。正解 profile、推定 profile、一律難易度、取り違えた profile、単なる易化の5群で、個人化と易化を切り分ける。

■ 内容分析
本研究の中核は LLM の高性能さより、「推定が外れた時、reader、record、行動機会、generator のどこが壊れたか」を切り分けられる設計にある。正解候補自体を admission する点が特に重要だ。多次元の300 session で、行動が近い pair 間のパラメータ差を random pair で割った識別性比は Skill 0.51、Collector 0.82だった。1に近いほど行動から拘束できないため、すべての knob が同じ解像度で読めるわけではない。

凍結した90 session の回復評価では、17特徴量を210の labeled session で学習する RBF kernel regression が macro ρ=.77、GPT-5.6-sol が.70、Qwen3.5-122B が.65、手作業 rule が.63、transcript embedding 回帰は.38だった。LLM は Skill .90、Aggression .79 まで読む一方、Collector は.43に留まる。これは単なる model 不足ではない。標準 level では reward が kill から落ちるため、非攻撃的な player には「取るか」を表現する機会そのものが少ない。reward を能動的に供給する diagnostic level では同じ LLM の Collector が.92へ上がる。固定 level は、その level が行動機会を与えた trait しか測れない。

機会集合を除く300対の ablation では Skill が.74から.59、Collector が.39から.35へ低下し、Dodge は.61で不変。Aggression は逆に.50から.55へ上がった。つまり opportunity-aware は万能な文脈追加ではなく、「取れる時に取った割合」のように分母が必要な trait に特異的に効く。平均 embedding が Collector でほぼ0なのも、離れた行にある「機会と選択」の対応を pooling が消すためと読める。

難易度評価も generator の自己採点にしていない。生成側の圧力係数と分け、実プレイの被弾/分が予め凍結した2.8〜7.3に入れば0、帯から外れると最大1、死亡は1超とする。短時間の無被弾死亡を「上手い」と誤認しない不連続な設計で、制御と評価を別物にしている。

下流評価は著者自身も慎重に解釈している。各5水準で1 run しかないが、生存は正解と推定 profile がともに4/5、mismatch 0/5、一律2/5、易化3/5。不一致 profile が全滅したため、推定内容に意味がある方向性は見えるが、novice は正解でも死に、生成器の最低難易度が下げ切れない。12人 pilot も、行動 profile 由来 level 後の LLM ability reading が全員で baseline より上がったという方向性に留まる。体験の正解も同じ reader で測っており、有意差検定もない。synthetic での内的妥当性は強いが、実人への外的妥当性は未確立である。

■ 自分達の環境への適用
最初に移植すべきは LLM profile ではなく telemetry schema である。各 decision に `state / available_actions / chosen_action / outcome` を持たせ、「ミサイルを使わなかった」と「ミサイルが無かった」、「reward を見送った」と「reward が出なかった」を分ける。headless 評価でも取得回数の生数ではなく、機会数を分母にした選択率を作る。これならプレイ結果が「何を好んだか」と「何を試せたか」を混同しない。

次に、bot の設定値をそのまま評価ラベルにしない。回避性、前進性、能力使用などを一軸ずつ変化させ、異なる seed で①期待指標が単調に動くか、②他指標を巻き込まないか、③seed 差より軸差が大きいかを admission gate にする。失敗した軸は「評価できない」と残し、スコアを強制的に作らない。

小さな probe では、1ステージに pickup、能力使用、前方追跡の機会を意図的に等間隔で入れ、通常 stage と diagnostic stage で同じ reader の回復性を比較する。個人化難易度は推定 profile だけで評価せず、正解相当の scripted profile、axis を shuffle した profile、一律、単なる易化を対照に置く。各 cell を複数 seed で繰り返し、生存だけでなく、被弾率、停滞、能力利用、攻撃機会の選択を、generator が直接最適化していない指標で測る。

■ メリット・デメリット
メリットは、取得行動だけでなく拒否と機会不足を残すことで、誤推定を後から診断できる点にある。synthetic player で正解候補の識別可能性を先に検査し、下流で mismatch と易化を対照にする構成は、失敗を局在化できる。

デメリットは、synthetic policy の素直さが回復を容易にしており、学習、飽き、予期せぬ戦略変化は扱っていないことだ。LLM の入力は連続特徴を粗い帯に量子化し、supervised baseline と入力条件も提督量も異なる。人間 pilot は12人、下流は1 cell 1 run で、実運用の効果量や安全性を主張できる規模ではない。

■ 判定
部分採用。opportunity-aware telemetry、trait label の admission test、誤 profile・一律・易化を含む対照群は、gameplay 評価の基本設計として導入価値が高い。LLM が作る実プレイヤーの profile と自動難易度調整は、複数 run と独立な体験指標で再検証するまで保留する。

■ URL
https://arxiv.org/abs/2608.16196

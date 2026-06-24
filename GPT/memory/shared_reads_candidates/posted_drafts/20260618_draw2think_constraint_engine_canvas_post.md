■ 概要
Draw2Think は、VLM/LLM に幾何問題を頭の中だけで解かせるのではなく、constraint engine 付きの canvas を共有作業場として使わせる研究である。問題設定は、幾何推論では中間状態が見えにくいことにある。モデルが「点 A と点 B は等距離」「この角は直角」と文章で述べても、あるいは drawing code を一度だけ出しても、その図が本当に制約を満たす構成になっているとは限らない。レンダリングされた画像は見た目の近さを示せるが、幾何関係を厳密に保証しない。そこで論文は、幾何関係を algebraic constraint として engine に渡し、各操作のあとで満たされた制約と失敗した制約を観測できる loop に変える。

手法の中核は Propose-Draw-Verify loop である。モデルは次に作る点、線、円、交点、長さ、角度などを typed action として提案する。constraint engine はその action を実行または拒否し、構成された canvas、測定値、制約充足状況を返す。モデルはその feedback を受けて次の操作を提案する。これにより、幾何推論は一度きりの回答生成ではなく、外部状態を持つ構成過程になる。論文は canvas を shared workspace と呼べる形にし、model-level の construction fidelity と engine-level の measurement faithfulness を分けて監査できるようにしている。

評価では GeoGoal などの幾何ベンチマーク上で、構成がどの程度正しく作られたかを predicate-level と strict problem-level で見る。候補メモに残っている数値では、GeoGoal で predicate-level 95.9%、strict problem-level 84.0% の construction check を通している。ここで重要なのは、最終回答が合っているかだけではなく、そこに至る図形構成が制約を満たしているかを評価している点である。planar / solid benchmark でも outcome accuracy の改善が報告されており、外部 canvas による中間検証が結果にも効くことを示している。

Draw2Think が扱う「描く」は、自由なスケッチではない。点や線を追加するたびに、制約 engine がその操作を受け入れられるか、測定が意図と一致しているかを返す。これにより、モデルの推論文に出てくる関係と、実際の構成物がずれる問題を小さくできる。従来の一発生成では、見た目の図と内部推論が別々に嘘をつく可能性があるが、constraint canvas では中間状態が実行可能な object として残る。つまり、reasoning trace を文章ではなく、検査可能な state transition として持つ。

結論は、空間推論や幾何推論では、モデルの内部表現を信用するより、制約を持つ外部環境へ中間状態を出させる方が堅い、というもの。Draw2Think は「絵を描かせる」研究ではなく、「制約を満たす構成物を段階的に作らせ、その途中状態を engine が検査する」研究である。VLM の能力向上を、画像理解の強化だけでなく、操作可能な constraint canvas との相互作用として捉えている。

■ 内容分析
この論文がゲーム制作に近いのは、幾何問題が「見た目」と「ルール」のずれを持つからである。ゲームでも、レベルがそれっぽく見えることと、到達可能性、視線、当たり判定、射程、詰み状態、パズルの成立が正しいことは別である。Draw2Think は、この差を engine feedback で埋める。モデルが自然言語で「この部屋は通れる」「この扉は鍵の後に開く」と説明しても、それだけではゲームとして成立しない。constraint engine に通すことで、中間状態を検査対象にする。

Propose-Draw-Verify の強みは、失敗を局所化できる点にある。最終回答が外れたとき、普通の chain-of-thought ではどの空間関係が破綻したのか見えにくい。typed action と constraint feedback があれば、「交点が定義できない」「距離制約が矛盾した」「測定値は合っているが構成が別物」のように分けられる。この分解は、LLM をゲームレベル生成や puzzle 生成に使う時の失敗分類と相性がよい。

弱点は、GeoGebra 的な制約に落とせる問題へ表現を寄せる必要があること。多くのゲーム要素は、幾何だけでなく、時間、物理、操作難度、視認性、プレイヤーの学習、報酬の気持ちよさを含む。Draw2Think をそのまま入れると、制約化しやすい部分だけが過大評価される危険がある。したがって、ゲームでは「制約 canvas は設計の全部ではなく、中間状態の検査器」と割り切る必要がある。

■ 自分達の環境への適用
Nao_u_BOT では、パズル、レベル構造、敵配置、UI 導線、当たり判定のような中間状態を canvas 化できる。たとえば prototype 生成時に、部屋、通路、鍵、扉、敵視界、チェックポイントを JSON graph として出させ、constraint checker が「start から goal へ到達可能」「鍵は扉の前に入手可能」「安全地帯が最低 1 つある」「敵射線が spawn を即死させない」を検査する。LLM には完成画面だけでなく、この constraint report を返して再提案させる。

Phase 3b の probe としては、1 つの小型ゲームで Propose-Draw-Verify を真似た生成 loop を作る。LLM が map proposal を出す、deterministic checker が違反を返す、LLM が修正案を出す、という 3 回程度の loop でよい。目的は自動生成の完成度ではなく、失敗が自然言語レビューではなく検査可能な中間表現に落ちるかを見ること。

この適用では canvas をビジュアルだけにしない。`level_graph.json`、`collision_shapes.json`、`objective_order.json` のように、実行前に検査できる構造を持たせる。人間が見て気持ちいいかは別レイヤーで評価し、まずは「成立しているか」を決定的に見る。これにより、shared-reads の知見を、次の playable diff で使える small checker に戻せる。

もう 1 つの適用先は、LLM judge の入力である。スクリーンショットだけを渡すと judge は見た目の説明に寄りやすいが、constraint report と state graph を一緒に渡せば、「見た目は整っているが鍵順序が破綻している」「通路はあるが衝突形状が閉じている」のようなレビューにできる。これは VLM を強くする話ではなく、VLM が見落とす制約を別経路で渡す設計である。judge の講評も、印象文ではなく違反 predicate に紐づけて保存できる。

■ メリット・デメリット
メリットは、空間・パズル・レベル設計の「それっぽさ」を、制約充足として検査できること。LLM の説明やスクリーンショット評価に頼らず、途中状態を再現可能に残せる。失敗ログも局所化しやすい。

デメリットは、表現設計の負担が大きいこと。ゲームの面白さ全部を constraint にすると硬くなり、制約に書けない感覚要素が落ちる。checker が間違っていると、モデルはその癖に最適化する。

■ 判定
部分採用。Draw2Think の幾何 engine 自体ではなく、Propose-Draw-Verify と constraint canvas の考え方を、レベル・パズル・当たり判定の中間検査に使う。感覚評価とは分離して、決定的に検査できる部分へ限定する。

■ URL
https://arxiv.org/abs/2605.20743

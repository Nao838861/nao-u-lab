■ 概要
「Application of machine learning to monster level prediction in tabletop RPG game design」は、TTRPG の敵設計を生成問題ではなく「既存の能力値から、設計者が付けた強さの段階を再現できるか」という ordinal regression（順序回帰）として定式化した研究である。題材は Pathfinder Second Edition。敵の level は -1〜25 の整数だが、level 4 が level 2 の二倍強いとは限らず、隣の level を外すことと十段階外すことも同じ誤りではない。このため、単純な多クラス分類でも連続値回帰でもなく、大小関係と誤差距離の両方を扱う。

著者らは Paizo の 302 冊の sourcebook・adventure・scenario から 6,007 体を集め、希少な level 21〜25 は「20超」の一クラスへ統合した。入力は三段階で、Basic は Str/Dex/Con/Int/Wis/Cha、HP、AC の8特徴、Extended は知覚・三種 save・近接/遠隔の最大 attack bonus と期待 damage・spell 関連を加えた20特徴、Full は移動速度、immunity 数、各 spell level の呪文数まで含む33特徴である。生 JSON を丸ごと学習せず、予測時に設計者が用意でき、level と因果的に関係すると考えた数値へ絞っている。

比較は16モデル。通常回帰を0.5閾値で丸める Ridge、SVM、kNN、Random Forest、LightGBM、順序問題を複数の二値判定へ分解する SAOC、Ordered Logistic Regression、Ordered Random Forest、Gaussian Process、さらに CORAL/CORN/CONDOR など順序制約付き neural network を含む。評価は古い刊行物で学習し最新約20%で試す chronological split と、初版時の7冊232体から始め、以後100体以上の刊行 batch を評価して学習集合へ足す expanding window の二系統。後者は21回の train-test を行う。多数派 level だけで良く見えないよう macro MAE / RMSE、並び順の一致を見る Somers’ D、完全一致 accuracy、±1 level 内の Acc@1 を併記した。

最良は複雑な順序専用 neural network ではなく tree ensemble だった。chronological split の Random Forest は macro MAE 0.13、Somers’ D 0.99、完全一致88%、±1一致99%。より厳しい expanding window では macro MAE 0.25±0.12、完全一致80±7%、±1一致98±2%まで落ちるが、線形・neural 系より安定した。結論は、既存ルールの数値構造を非線形な表形式モデルで近似し、level の初期見積もりと外れ値確認を補助できる、というもの。ただしこれは playtest の代替ではなく computer-aided design tool という位置づけである。

■ 内容分析
価値の中心は高精度そのものより、評価を「未来の追加コンテンツ」に合わせた点にある。ランダム分割なら同系統の派生モンスターが train/test の両方へ入りやすい。chronological split と expanding window は、過去の bestiary を参照して次の本を作る運用を模し、後発データで性能がどれだけ崩れるかを見せる。実際、単一 chronological split より expanding window の誤差と分散は大きい。完成済みデータを無作為に混ぜた一点の精度より、制作履歴に沿った複数窓の劣化を見る方が、継続開発の判断材料になる。

同時に、論文の「designer judgment を近似した」という主張は狭く読む必要がある。正解 level 自体が専門家判断と実戦経験で付けられた既存ラベルであり、入力特徴も level と直接関係するルール数値を domain knowledge で選んでいる。つまりモデルが発見したのは「面白さ」や遭遇全体の難度ではなく、Pathfinder の既存 stat budget の再構成に近い。kNN を人間的な類似例比較 baseline と呼んでいるが、実際の人間設計者との所要時間・判断精度比較はないため、ML が人間を上回った証拠ではない。

失敗例の解釈も重要である。Random Forest の大半の誤差は±1だが、2〜3 level 外す例が20件弱あり、著者らは特殊能力で強さが決まる atypical monster を候補に挙げる。Full 特徴でも、行動 economy、範囲攻撃、状態異常、相乗効果、遭遇地形、party composition は十分に表現されない。feature importance が AC、HP、Perception、攻撃 bonus、save などルール直感と整合しても、それは未観測の能力を安全に扱える保証ではない。

さらに実装上は、全データを min-max scaling してから split したと記載されている。木モデルへの影響は小さいとしても、未来 test の最小値・最大値を前処理へ見せる data leakage であり、線形・neural 系の比較を完全に clean とは言い切れない。順序専用モデルが tree ensemble に負けた結果も、「順序構造が不要」ではなく、6,007件の表形式・強い非線形性・特徴設計済みという条件で木が適していた、と限定すべきである。

■ 自分達の環境への適用
取り入れるなら「バランスを決める AI」ではなく、敵 tier の lint として使う。各 prototype で authored stat と headless telemetry を一行へまとめる。前者は HP、移動速度、攻撃間隔、弾速、同時弾数、当たり判定、特殊行動数、後者は複数 seed での生存時間、被弾率、撃破時間、画面占有率、回避可能時間など。人間が確定した既存 tier を順序ラベルにし、新規敵の予測 tier、±1範囲、主要寄与特徴、近い既存敵を返す。設計値と予測が大きく食い違う個体だけを playtest 優先キューへ送る。

検証は release 順に切る。過去版で学習し次版の追加敵を test にする expanding-window を固定し、通常 MAE だけでなく tier ごとの macro MAE、±1一致率、二段階以上外した個体一覧を残す。特に特殊行動持ちを slice として分離し、誤差が増えるなら数値特徴を増やす前に、その能力を simulation で測れるか確認する。予測が人間ラベルと一致しても面白さは測れていないので、headless probe と人間の体感評価を別軸のまま維持する。

記憶システムにも同じ型を使える。candidate の品質を単一 pass/fail にせず、概要密度、原文根拠、評価条件、限界、適用 probe を順序尺度として持ち、過去に posted になった資料から「現在どの段階か」を補助推定する。ただし、過去の判定癖を正解として再生産しないよう、予測差の大きい candidate は自動却下せず人間レビューへ回す。

■ メリット・デメリット
メリットは、順序ラベルに適した誤差設計、class imbalance を隠さない macro 指標、将来版を模した time split、誤差個体と寄与特徴を設計者へ返す一連の流れが揃っていること。小規模環境でも、まず Random Forest と明示的特徴から始められ、deep model を導入する理由がないことも実用的である。

デメリットは、既存 level の偏りをそのまま学び、数値化されていない特殊能力や組合せを過小評価すること。単体 monster の level は encounter の人数、地形、player build、操作技能を含まない。全体 scaling の leakage、人間との直接比較不在、Pathfinder 固有の stat 構造も一般化を弱める。予測精度が高いほど「既存設計に似ている」と「実際に楽しく公平」を混同しやすい点が最大の危険である。

■ 判定
部分採用。採用するのは ordinal tier、expanding-window、macro 指標、外れ値レビューを組み合わせた balance lint。予測器へ最終決定を渡す考えは採用しない。まず一つの prototype で既存敵を時系列分割し、二段階以上の誤差が特殊行動・複数敵・地形条件へ偏るかを見る probe に落とす。

■ URL
https://arxiv.org/abs/2607.09196
https://arxiv.org/html/2607.09196v1
https://github.com/tunczyk101/Monster-level-prediction-in-TTRPG

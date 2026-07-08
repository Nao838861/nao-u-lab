■ 概要
FootsiesGym は、2D 格闘ゲーム Footsies を題材にした、二人零和・不完全情報・リアルタイム対戦向けの強化学習ベンチマークである。狙いは、Kuhn Poker や Leduc Poker のような小さなゲーム理論ベンチマークでは短すぎ、StarCraft II や Dota 2 のような大型環境では重すぎる、という中間領域を埋めることにある。格闘ゲームの neutral play は、距離調整、牽制、差し返し、攻撃選択が循環的に勝ち負けを作る。単一の支配戦略がなく、相手が偏れば exploit される。この論文は、その構造を Footsies のミニマルなルールに閉じ込め、分析可能で再現性のある headless 環境として提供している。

環境設計では、Unity の描画ループから game logic を切り離し、C# 側で複数 game instance を並列 step する vectorized simulator を用意する。Python 側は PettingZoo API で扱えるため、一般的な multi-agent RL 実験に載せやすい。観測は自分と相手の位置、速度、現在 action、guard 状態、frame advantage などから成り、相手の特殊攻撃 charge progress のような一部情報は見えない。行動は移動と攻撃の離散 action を基本にし、特殊攻撃は 60 frames charge して release する。論文は PPO、entropy schedule 付き PPO、EMAgnet、PFSP を baseline として比較し、win rate だけでなく approximate exploitability、no-op opponent への反応、特殊攻撃の発見難度を見る。結論は、FootsiesGym が「勝てるか」だけでは見えない対戦 AI の脆さ、反応過多、core mechanic の未使用を露出できるというもの。

■ 内容分析
この論文で重要なのは、格闘ゲームを単に高難度な action control 問題として扱っていない点である。Footsies から combo や長い execution chain を削り、neutral の読み合いだけを残すことで、戦略の非推移性を評価対象にしている。通常の格闘ゲームでは、neutral で触った後に combo execution の強さが入るため、「読み合いがうまい」のか「一度当てた後の火力が高い」のかが混ざる。FootsiesGym はこの混線を避け、movement、quick attack、special attack、guard break の関係に絞っている。

評価設計も使える。heuristic opponent への勝率では、多くの policy が random opponent に 85-95% 程度まで伸びる一方、no-op opponent には消極化する。相手が何もしない時に engagement しない policy は、数値上は exploit されにくくても、ゲームの敵 AI としては退屈である。さらに approximate best response を別途学習させると、head-to-head で強く見える policy が専用 adversary に崩れる場合がある。EMAgnet が PPO variants には勝つが best response にはより exploit されやすい、という種類の差分は、単純な総当たり勝率では出にくい。

もう一つの核は、特殊攻撃の発見である。標準 action space では、方向付き特殊攻撃は攻撃入力を 15 step 継続してから方向入力へ release する必要があり、uniform random で偶然出る確率は極端に低い。baseline では多くの algorithm がこの core mechanic をほぼ使わず、固定 entropy PPO が一時的に学ぶだけで戦略空間から消える。これは、探索を強めるための regularization が、実は長い準備を要する有用行動を保持できない可能性を示す。action_delay の実験も良い。0 delay では frame-perfect reaction が可能になり、見かけの性能は上がっても gameplay が退化する。12 frame delay では反応だけで勝てず、予測と commit が必要になる。つまり、この benchmark は「AI が強い」ではなく「プレイヤーが相手にした時に意味のある読み合いをしているか」を測る足場になっている。

限界も明確である。Footsies は商用格闘ゲームよりかなり単純で、exact exploitability も計算できず、best response による近似は真の exploitability の下限にすぎない。baseline も十分に tune された最強実装ではない。そのため、論文の ranking をそのまま algorithm 優劣として読むより、評価項目の作り方を読むべきである。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、敵 AI や headless playtester を「クリアできるか」「勝率が高いか」だけで評価すると危ない。FootsiesGym から採るべきなのは、行動ログを少なくとも三層に分けることだ。第一に skill 指標、第二に exploitability 風の脆さ、第三に designer intent 指標である。たとえば prototype の敵 AI なら、勝率、専用 counter policy への負けやすさ、停止中の player へ能動的に関与するか、主要 mechanic を実際に使うかを別々に見る。

小さな検証としては、既存の headless run に no-op / random / scripted exploiter の 3 opponent を用意するのが現実的である。no-op は「何もしない相手にゲームを始めるか」を見る。random は最低限の反応性を見る。scripted exploiter は、敵 AI が同じ安全行動へ固着していないかを見る。さらに core mechanic ごとの usage counter を入れる。dash、charge、guard、parry、special など、作品固有の面白さを担う action が training や自動調整の後に消えていないかを CI ログへ出す。

action delay の考え方も使える。ブラウザや Godot の playable diff で AI が完全観測・即時反応できると、人間には不自然な「見てから全部避ける」挙動になる。評価時には意図的な reaction delay、観測 mask、入力 commitment を入れ、数字が少し落ちても human-like な読み合いが残る設定を採る方がよい。これは RL に限らず、rule-based enemy や LLM planner にも当てはまる。

■ メリット・デメリット
メリットは、格闘ゲーム的な読み合いを、重すぎない benchmark に落としていること。headless、vectorized、PettingZoo API、rendered build の併存は、自動評価と人間確認を往復する設計として参考になる。win rate、best response、no-op 反応、special usage を分ける姿勢は、我々の playable diff review にそのまま移植できる。特に「強いが退屈」「勝つが core mechanic を使わない」という失敗を検出できる点が大きい。

デメリットは、Footsies の抽象化が強いため、platformer、puzzle、narrative game へそのまま metric を移せないこと。approximate exploitability は計算コストもあり、毎回の prototype に RL best response を学習させるのは重い。さらに、人間が感じる面白さは no-op 反応や special usage だけでは足りず、視覚演出、間合いの納得感、失敗時の読み取れ方を別途評価する必要がある。

■ 判定
採用。論文の algorithm ranking ではなく、評価設計を採る。次の敵 AI / headless playtest では、勝率だけでなく no-op engagement、scripted exploiter、core mechanic usage、reaction delay の 4 点を最小 probe として入れる価値が高い。

■ URL
https://arxiv.org/abs/2607.06514
https://github.com/como-research/FootsiesGym

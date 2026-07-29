■ 概要
CAST（Credit Assignment from Solver Teachers）が解くのは、長い game trajectory の最後に win / loss だけを与えても「途中のどの一手が結果を決めたか」が分からない credit assignment である。通常の RLVR は成功時1、失敗時0という検証可能な terminal reward を使える一方、GRPO では trajectory 全体の同じ advantage が全 turn に配られ、序盤の致命的な手と後の無害な手が同じ評価になる。

CAST は game solver を正解 action の出力器ではなく、任意 state から勝利までに必要な最小仕事量を返す evaluator として使う。cost-to-go を N(s) とし、Sokoban / Rush Hour では最短 action 数、Minesweeper では安全 cell を全て開くまでの最小 reveal 数とする。action 前後の差 N(s_t)-N(s_{t+1}) は、goal に一歩近づけば+1、進展なしなら0、遠ざかれば負になる。unsolvable な dead state は無限大のまま扱わず、その時点で残っていた N(s_t) 分を失ったものとして -N(s_t) に cap する。

この差分は rare な dead-state penalty が大きく、game や難度でも scale が違う。そこで符号と0を保って大値を圧縮する asinh をかけ、batch 内の RMS で割る。平均を引くと「進展なし=0」がずれるため引かない。整形した signal を係数 alpha で terminal outcome advantage に加える。最終目標は0/1の勝利であり、solver signal は補助教師に留める。

solver を soft-optimal policy と仮定すると、solver advantage の最大化は full action logits を使わない on-policy distillation と等価になる。teacher の全分布を保存せず、訪問した state-action の scalar value だけで学習を誘導できる。

実験は Qwen3-4B-Instruct-2507 を共通の基礎 policy とし、Sokoban、Minesweeper、Rush Hour を ReAct 型の multi-turn text interface で解かせる。各 game で学習済み難度と、より難しい unseen-difficulty を各200 instance 評価し、4 rollout の平均成功率 Avg@4 を使う。exact solver は weighted A*、制約充足と mine 確率推論、reverse BFS table と game ごとに異なる。同じ terminal reward と base model の DAPO から solver signal だけを除いた比較では、3 game 平均が in-domain 44.7から62.1、unseen 18.7から28.4へ上がった。GRPO、GSPO、GiGPO も全 game・両 setting で下回る。DAPO の peak へ達する training step も1.7–2.0倍短い。

学習 game 以外の ALFWorld / WebShop へ追加 fine-tuning なしで移すと、source-game agent の平均は37.9 / 22.7、総合30.3で比較手法中最高だった。ablation では alpha=0.1 が最良で、大きすぎると局所 signal が outcome objective を押しのけ、初期上昇後に性能が落ちる。asinh または RMS normalization を外しても悪化した。Rush Hour の exact solver を、solver distance を教師に使わない DQN value network へ置換した版も exact 版に近い曲線を保った。結論は、信頼できる state value があれば、疎な最終結果を局所的な改善・悪化へ分解できるというものだ。

■ 内容分析
CAST の強さは、process reward model に「もっともらしい途中評価」を自由記述させず、最終目的へ至る距離という検査可能な量から turn-level signal を作る点にある。terminal reward を残すため、solver の近道だけを模倣する pure distillation でもない。alpha の ablation が示す通り、局所進捗は学習を速めるが、それ自体を目的にすると勝利から逸れる。この構造は reward shaping を使う時の重要な安全弁である。

同じ base、0/1 reward、DAPO backbone から signal だけを抜いた対照があり、寄与を読みやすい。難度を solver complexity で校正し、board 重複を除き、3 run、unseen difficulty、別 domain transfer まで見る。ただし OOD の30.3%は高い絶対性能ではなく、closed model も training-free reference なので全面的な model 比較ではない。

最大の制約は、N(s) が意味を持つ環境を先に作れることだ。3 game は規則、成功条件、state、solver が明確な puzzle で、transition も主に離散的である。自由移動、確率、敵の意図、反射神経、複数の同等戦略、面白さを含む action game では「goal までの距離」は一意でない。近道が安全性、資源獲得、発見、表現の多様さを破壊する場合もある。soft-optimal solver、small signal、GRPO consistency などの理論仮定も、任意の learned evaluator へそのまま移せない。

solver overhead が total training step の73 ppmという結果も、trajectory 時間の99.9%を LLM generation が占める条件での話である。高速な非LLM headless bot なら evaluator が主な費用になり得る。learned value 代替の確認も Rush Hour 一環境なので、近似誤差が局所 credit を逆転させる条件はまだ十分に測られていない。

■ 自分達の環境への適用
我々にはまず headless trace の診断法として移す。最終値だけで run を並べず、各 decision で「設計上望む状態へ近づいたか」を記録する。route bot なら目標距離、被弾余地、退路数、危険領域滞在、資源残量を別 component とし、前後差分を残す。最短路だけを正解にしないよう、最初は value vector と最終 outcome を併記する。

最初の probe は、状態空間を列挙できる小さな room / wave を一つ選ぶ。20–50の fixed seed について、既存 bot の各 action 前後で exact または deterministic proxy value を計算し、最終成功 run の早い段階で positive 差分が増えるか、失敗直前に大きな negative が出るかを見る。同時に、positive なのに人間には悪手、negative なのに立て直しに必要な手を counterexample として保存する。評価は最終成否との順位相関、失敗の何 turn 前に警告できたか、同型失敗を分類できた率、proxy 間の衝突数とする。

診断に効いた場合だけ bot 改善へ進む。terminal objective は残し、局所 signal の weight を小さく sweep し、dead state 相当の大値を cap / asinh 圧縮し、0の意味を保つ normalization を使う。exact evaluator が作れない prototype では、learned value を先に教師と呼ばず、held-out seed で順位誤りと policy change 後の drift を監視する。面白さ、意外性、操作感は solver value に入れず、人間評価を独立の最終 gate とする。

■ メリット・デメリット
メリットは、失敗 trajectory を「全部悪い」から局所的な改善・停滞・破局へ分解できること、scalar state value だけで teacher logits を保持せずに済むこと、最終成否を捨てずに学習速度を上げられることだ。exact solver がある test room では deterministic な regression signal になり、近似 value でも使える可能性が示された。

デメリットは、良い evaluator を作る仕事が問題の大半を占めること、value の誤りが大量の turn へ一貫した誤 credit を配ること、局所進捗の weight が強いと本来の勝利や多様な戦略を押しのけることだ。puzzle の結果を action game の面白さへ直接外挿できず、高速 headless 環境では solver query cost も再測定が必要になる。

■ 判定
部分採用。cost-to-go 差分を turn-level trace にし、最終 outcome を anchor として残す原理を採用する。いきなり LLM agent の RL へ入れず、まず列挙可能な小規模 scenario で value vector が失敗箇所の早期特定に役立つかを検証する。単一の「面白さ value」への圧縮は採用しない。

■ URL
https://arxiv.org/abs/2607.25308

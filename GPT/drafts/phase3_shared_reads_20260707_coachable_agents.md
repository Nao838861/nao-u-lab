■ 概要
対象は arXiv:2607.00642「Coachable agents for interactive gameplay」。Sony AI の研究で、ゲーム AI やロボットの強化学習 agent を「単一の最適行動を覚えた black box」ではなく、実行時にプレイヤーや制作者が振る舞いの style を指定できる対象として扱う。問題設定は明確で、従来の RL agent は trial-and-error によって task success を最大化するが、実際のゲームでは「勝つ」だけでは足りない。敵なら攻撃的すぎず圧を作る、味方なら邪魔をせず支援する、車なら速いだけでなく安全寄りに走る、キャラクターなら見栄えのする動きをする、といった制御面が必要になる。

提案は Universal Value Function Approximators を中心に、training scenario、learning algorithm、data augmentation を組み合わせ、main task を満たしながら style request に沿う coachable agent を作る枠組みである。適用例は Horizon Forbidden West、Gran Turismo、open-source humanoid test domain。領域は stylized combat、car racing、humanoid walking と異なるが、各 agent が task satisfaction と style coherence を両立し、最終的な振る舞いを実行時に選べることを示す。論文の価値は、AI を強くする研究ではなく、AI の振る舞いを制作側が操作できる interface として再定義している点にある。

■ 内容分析
この研究で重要なのは、style を後付けの演出タグではなく policy の条件として扱うところである。たとえば「速く走る」「安全に走る」「派手に戦う」「慎重に動く」は、報酬関数を少し変えた別 agent を大量に用意するだけでは運用しにくい。ゲーム内では、プレイヤーの熟達度、場面、難易度、演出意図によって求める振る舞いが変わるため、実行時に連続的または離散的に指定できる control surface が必要になる。UVFA は goal や condition を value function の入力に入れるため、この「同じ task だが解き方を変える」問題と相性がよい。

ただし、論文は「style request に従えばよい」と単純化していない。main task の達成と style adherence はしばしば衝突する。安全運転を強めると lap time が悪化する。見栄えのする戦闘を強めると敵を倒す効率が落ちる。humanoid の歩き方を変えると安定性が崩れる。したがって評価は、task reward だけでも、style score だけでも足りない。両者の trade-off を測り、style を強めた時にどこまで task が壊れるかを見る必要がある。ここでの読みどころは、style を「好み」ではなく、制約付き最適化の条件として扱っている点である。ゲーム制作では、面白い挙動ほど単一報酬に畳みにくい。強すぎない、退屈でない、読める、不自然に止まらない、といった要求は、勝率や距離のような一つの軸に還元しにくい。この論文は、その曖昧な制作語彙を、実行時に選べる条件と評価指標へ落とす方向を示している。

限界もそこにある。style は domain ごとに設計されるため、Horizon の戦闘 style、Gran Turismo の走行 style、humanoid の locomotion style は同じ抽象語で比較できない。制作者が何を style dimension として切るかに品質が強く依存する。また、学習済み agent が style に従っているように見えても、プレイヤーから見た納得感や読みやすさは別問題である。論文は大規模ゲーム実装での適用を示すが、汎用 NPC 制御へそのまま持ち込むには、style vocabulary と評価指標をゲームごとに設計し直す必要がある。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、この論文を大規模 RL 実装としてではなく、bot / NPC / headless evaluator の評価設計として使うのが現実的である。今の制作サイクルでは「クリアできるか」「テストが通るか」に寄りやすいが、ゲームとしては「どのように成功するか」が重要になる。敵 bot なら命中率だけでなく、圧のかけ方、退避頻度、プレイヤーに反応を学ばせる間合いを見る。味方 bot なら火力貢献だけでなく、視界を遮らない、資源を奪わない、プレイヤーの狙いを壊さないことを見る。

小さな probe としては、既存プロトタイプの自動プレイ agent に style flag を 2、3 個だけ入れる。例は aggressive / defensive / cinematic、あるいは fast / safe / readable。最初から RL を入れず、ルールベースや探索の重みを切り替えるだけでよい。評価では成功率と style adherence を分ける。成功率、平均被弾、クリア時間に加えて、プレイヤー距離、退避開始タイミング、同じ行動の連発率、画面中央を遮る時間などを記録する。これにより「勝てる bot」ではなく「指定した演技で勝てる bot」を評価できる。さらに、同じ seed で style だけを変えた paired run を残すとよい。aggressive にした時だけ被弾が増えるのか、safe にした時だけ時間が伸びるのか、cinematic にした時だけ入力待ちが増えるのかを比較できる。これは単発の平均値よりも、制作者が読める差分になる。

記憶システムにも応用できる。Phase 3 の shared-reads 投稿は、単に投稿成功ではなく、概要密度、記事固有性、適用具体性、危険条件の明記という style adherence を持つ作業である。つまり作業 agent にも「完了する」だけでなく「現行投稿ルールの style で完了する」評価が必要になる。Coachable agents の発想は、制作 bot だけでなく Codex の定時サイクルにも、task success と behavior style を分けて監査する視点を与える。

■ メリット・デメリット
メリットは、AI の振る舞いを最適化結果ではなく制作者が触れる操作面として扱えること。ゲーム制作では、強い敵、弱い敵、派手な敵、読みやすい敵を別実装にせず、同じ policy の条件差として扱える可能性がある。headless 評価でも、成功率だけで見逃す「退屈だが勝てる」「強いが不公平に見える」挙動を測りやすくなる。

デメリットは、style の定義と評価が domain 固有で重いこと。論文のような AAA 環境では豊富な telemetry と訓練基盤があるが、小型 prototype では同じ規模の UVFA を入れる価値は薄い。また、style score を作った瞬間に agent がその指標を抜け道的に満たす危険もある。人間の見た目の納得感を含む style は、数値だけで閉じない。特に「読みやすい」「気持ちいい」「手加減している」は、ログ指標だけだと誤判定しやすいので、手動確認も残す。

■ 判定
部分採用。大規模 RL と UVFA 実装をそのまま導入しない。採用するのは、task success と style adherence を分けて評価する設計、実行時に振る舞いを指定できる control surface、bot の勝敗以外の振る舞いログである。次の小型 prototype では、2、3 個の style flag と headless 指標を入れる probe に落とす。

■ URL
https://arxiv.org/abs/2607.00642
https://arxiv.org/html/2607.00642

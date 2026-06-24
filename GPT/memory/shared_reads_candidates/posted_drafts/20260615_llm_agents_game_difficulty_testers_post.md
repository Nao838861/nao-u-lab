■ 概要
この論文の問いは、「LLM agent は人間並みにゲームを遊べるか」ではなく、「人間が感じる難易度の相対差を、開発中に測るテスターとして使えるか」である。著者は、ゲーム制作で重要なのは単一課題の絶対難度を当てることより、複数の challenge の並びが意図した difficulty curve になっているかを検査することだと置く。人間 playtest は確実だが反復に時間と人手がかかり、強い専用 AI や RL agent はゲームごとの設計・訓練コストが大きい。そこで、既製 LLM を game I/O component と instruction component で包み、ゲーム状態を自然言語化し、LLM の行動を API や入力イベントへ戻す一般的な game-testing framework を提案する。

framework は大きく二層で、Game I/O component が現在状態、履歴、ルール上の可能行動を LLM に読める形へ変換し、LLM の出力を実行可能 action に戻す。Instruction component は game rules、game strategies、prompting techniques からなり、ルール理解、一般戦略、CoT などの推論形式を与える。ここで重要なのは、LLM を最高性能のプレイヤーにすることではなく、LLM の成績が人間プレイヤーの難しさ指標と相関するかを見る点である。

検証対象は Wordle と Slay the Spire。Wordle では、NYT WordleBot 系の人間プレイ統計がある 529 puzzle を使い、GPT-3.5 Turbo と GPT-4 を zero-shot、CoT、CoT+strategy の 3 prompt 条件で走らせた。LLM は確率的なので各 puzzle 20 trial、通常の 6 guess 上限では失敗が多すぎるため 12 guess まで拡張し、平均 guess 数を難度指標にした。人間側は平均 guess 数と比較し、Pearson 相関を取る。結果は、情報理論的な Wordle Solver が平均 3.55 guess / 100% win で人間平均 3.97 guess より強いにもかかわらず、人間難度との相関は 0.075 で有意でない。一方 GPT-4 CoT+ は平均 5.12 guess と人間より弱いが、相関は 0.624 で強く、有意である。GPT-3.5 や zero-shot は弱く、CoT と strategy で性能と相関が改善する。

Slay the Spire では、ゲーム本体を BasicMod と CommunicationMod で外部制御し、Ironclad、代表的 deck、Act 1 / Act 2 boss 戦を対象にする。人間側は公開されている 7500 万超 run の統計から boss ごとの win rate を難度 proxy とし、agent 側は各 boss 20 trial 後の remaining HP を使う。LLM が通常 deck では win rate 5% 未満で差が出にくいため、人間平均より強い deck を与えて約 65% win になるよう補償する。これは「人間を超えるため」ではなく、難度差を測れるレンジに agent を置くためである。

StS の結果でも、GPT-4 CoT が最も人間難度に近い。Act 1 では GPT-4 CoT の相関が 0.871、Act 2 では 0.710。rule-based expert AI は平均 HP では GPT-4 CoT に近いが、相関は Act 1 で 0.742、Act 2 で 0.482 に落ちる。つまり、単に強い agent がよいのではなく、人間に近い推論・行動様式を持つ agent の方が difficulty tester として有用である。質的分析でも、GPT-4 CoT は敵の攻撃 intent、手札、Strength、card synergy を読み、Spot Weakness から Heavy Blade へつなぐような、人間のプレイ説明に近い判断を生成している。

著者の guideline は実務的である。第一に、状態表現の形式が重要で、Wordle の文字列を単語として渡すと tokenization が邪魔になるため、[A, P, P, L, E] のような list 表現が効いた。第二に、LLM は人間平均より弱いことが多いので、guess 上限を伸ばす、deck を強くするなどの補償が必要になる。ただし補償しすぎると全課題を簡単に突破して差が消える。第三に、LLM は単一課題の絶対 win rate 予測より、複数課題の相対難度や curve の検査に向く。第四に、より強い model と CoT / 一般戦略 prompt は、人間相関を改善する。第五に、小規模な人間 pilot data は、どの指標を使うか、どれだけ補償するかを決める校正点として使える。

■ 内容分析
この論文の価値は、LLM agent を「人間の代替 playtester」と言い切らず、相対難度を測る instrument として位置づけた点にある。Wordle Solver の結果が特に効いている。最適化された solver は強いが、人間が難しい puzzle を同じように難しいとは感じない。逆に GPT-4 CoT+ は弱いが、失敗や手数の増え方が人間の難所と重なる。これは自動評価でありがちな「勝率が高い agent ほどよい評価器」という発想を崩す。評価器として必要なのは上手さそのものではなく、対象プレイヤー層に似た失敗勾配である。

StS 側では、単純な prompt 実験ではなく、閉じた商用ゲームを Mod で black-box 制御し、状態を text I/O に落とし、人間統計と比較している点が強い。ただし制約も明確で、対象は text representation に変換できる情報に寄っている。視覚的な読み取り、操作感、テンポ、驚き、疲労は測れていない。また、LLM の性能不足を deck や guess 上限で補償する設計は実務上必要だが、どこまでが補償で、どこからが別ゲーム化かは慎重に決める必要がある。LLM の policy が変われば相関も変わるため、model version、prompt、状態表現、補償条件を固定した regression として運用しないと、指標が揺れる。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルにはかなり直接つなげられる。今の headless bot や PlaytestArena 的な評価は、「クリアできるか」「クラッシュしないか」に寄りやすい。この論文から持ち帰るべきなのは、bot を人間の完全代替にせず、build 間の難度差分を測る calibration probe にすること。たとえば prototype ごとに 5-10 個の challenge seed を固定し、LLM agent の失敗率、残 HP、到達ターン、詰まり位置、再試行後の改善を記録する。Nao_u の主観レビューを 1-2 seed だけに当て、その校正点から「今回の調整で相対難度が意図通り動いたか」を見る。

実装上は、ゲーム状態をそのまま長文ログで渡すより、LLM が誤読しにくい structured natural language にする。座標、残弾、敵 intent、手札、cooldown、危険 tile などを list / table で固定し、prompt と model をバージョン固定する。さらに agent が弱すぎる場合は HP 補正や猶予ターンを入れるが、補正値も記録し、補正なし評価と混ぜない。Phase 3b では「人間代替」ではなく「build A/B の相対難度 regression」として小さく試すのがよい。

■ メリット・デメリット
メリットは、専用 RL を作らずに、開発中の難度 curve の崩れを低コストで反復検出できること。強い solver より、人間に似た失敗勾配を出す LLM agent の方が、詰まりやすい局面の検出に向く可能性がある。

デメリットは、楽しさ、手触り、視覚的混乱、納得感までは測れないこと。prompt、model、状態表現、補償条件への依存も大きい。数値だけを見ると、LLM が苦手な表現形式や tokenization の問題をゲーム難度と誤読しやすい。

■ 判定
部分採用。人間 playtest の置換ではなく、相対難度と build 間 regression の補助計測として採用する。まずは固定 seed、固定 prompt、固定補償条件で、Nao_u 主観レビュー前の差分検出 probe に落とす。

■ URL
https://arxiv.org/abs/2410.02829

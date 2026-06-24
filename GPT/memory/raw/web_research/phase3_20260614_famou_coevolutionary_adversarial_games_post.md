■ 概要
この論文は、LLM にコードを書き換えさせて対戦ゲームの戦略を進化させる時、評価側を固定したままだと進化がすぐ古くなる、という問題を扱う。対象は MCTF 2026、3 対 3 の maritime capture-the-flag で、160m x 80m のフィールド、タグ、旗の取得、PowerPlay、20 分弱の試合時間、24 個の離散行動を持つ。参加者は Python の戦略コードを提出し、ランキングは単なる勝率ではなく総 capture 数で決まる。著者らの初期試行では RL 方策が手書き heuristic を超えにくかったため、ゼロから学習するのではなく、500-1700 行程度の既存 heuristic strategy code を LLM の semantic mutation で直接改善する方針を取る。

問題は、対戦ゲームでは「強さ」が固定スカラーではないことにある。相手 pool が狭いと、その相手だけに強い戦略が選ばれ、少数試合の noisy score で偶然強く見えた候補が残る。さらに、戦略が強くなるほど評価 landscape 自体が変わり、固定 evaluator は古くなって plateau を作る。論文はこの static evaluation の限界に対し、FAMOU を adversarial multi-agent game 用に拡張し、3 つの機構を加える。

1 つ目は evaluator co-evolution。新しい champion が見つかるたび、その champion を opponent pool に加え、後続候補は元の相手だけでなく過去の強い自分にも勝つ必要がある。2 つ目は weakness pressure。current champion を深く評価し、最も勝率が低い opponent を特定して重みを上げる。これにより、平均点は高いが特定相手に穴がある戦略が plateau に居座るのを防ぐ。3 つ目は hierarchical deep evaluation。進化中は 3 games/opponent の fast evaluation で粗く回すが、champion 判断や最終判断では 20 games/opponent の deep evaluation を使う。事前実験では 3 試合評価と 20-40 試合評価の相関が弱く、少数試合だけでは選択圧が信用できないためである。

実装では、FAMOU は archive から親戦略を選び、UCB で探索と活用を調整し、Gemini-2.5-Flash または DeepSeek-V4-Flash に完全な Python strategy file を出させる。構文と API 互換性を検証し、シミュレータで候補を評価し、その結果を次の mutation prompt へ返す。比較は OpenEvolve、ShinkaEvolve と行い、4 つの手書き seed、400 iteration、2 backbone LLM、10 opponent benchmark で揃える。benchmark opponent は seen 5 種と unseen 5 種を含み、各 checkpoint で 20 games/opponent を走らせる。Combined Score は win rate を重めにしつつ scoring margin も加える。

結果として、FAMOU は 2 backbone の両方で baseline を上回り、最高 combined score 0.526、unseen opponents への win rate 61.7% を報告する。ablation では deep evaluation を外した時の低下が大きく、3 試合評価のノイズが進化を誤誘導することが示される。cross-evaluation では benchmark score だけでは見えない相性差も出ており、相手 pool の多様性が評価に必要だと分かる。さらに、LLM mutation は seed に存在しなかった H-DWA の 1.5 秒 lookahead search、A-Lock の role locking、K-Filter の EWMA interception などの戦術構造を生成した。最終戦略は AAMAS 2026 MCTF Competition で hardware round-robin 1 位、simulation 3 位となり、sim-to-real transfer も確認された。

■ 内容分析
この論文の核心は、LLM を「強い戦略を一発で書く存在」ではなく、「評価環境に押されながらコードを変異させる演算子」として使う点にある。面白いのは、改善の主役が mutation prompt の技巧だけではなく、評価側の設計に置かれていること。固定相手に対して強いコードを探すだけなら、LLM はすぐ局所解や相手特化に寄る。FAMOU はその相手特化を、過去 champion の追加、弱点相手の重み付け、deep evaluation によって、次の選択圧へ変換している。

一方で、結果の読み方には注意がいる。MCTF は capture 数がランキングになる特殊なドメインで、試合コストも重い。論文自身も、full benchmark checkpoint に 10 時間、全体で 30,000 回以上の LLM call が必要だったと述べている。ablation も single run が含まれ、他ジャンルへの一般化はまだ限定的である。ただし、single scalar の自動評価で「強くなった」と判断する危険をかなり具体的に示している点は、ゲーム AI 評価や自動プレイテストにそのまま効く。特に non-transitive な対戦では、固定 benchmark の上昇が本当に汎化を意味するかを疑う必要がある。

この点で、論文の主張は「LLM が戦術を発明した」より「発明を拾える評価圧を作った」に近い。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、AI 対戦や自動プレイテスト候補を評価する時に使える。まず、小さな opponent pool を固定せず、直近で強かった bot、失敗を誘発した bot、古い baseline を pool として残す。新しい candidate が強く見えたら、その candidate 自体を次サイクルの gatekeeper に入れる。さらに、平均スコアだけで採用せず、最も苦手な相手、最も破綻したシード、見た目の局所 exploit を別枠で記録する。

実装規模は論文ほど大きくしなくてよい。1 プロトタイプでは 3 試合の fast pass と、候補上位だけ 10-20 試合の deep pass を分けるだけで効果がある。Phase 3b/4a の probe としては、「今回の評価相手は古くないか」「candidate 自身を次回の相手 pool に戻したか」「平均点に隠れた弱点相手を見たか」を入れると、LLM 生成 bot やレベル生成評価の過適合を減らせる。

■ メリット・デメリット
メリットは、評価環境も進化対象として扱うため、固定 benchmark への過適合や偶然の高得点を減らせること。過去 champion と弱点相手が残るので、次の候補が何を超えるべきかも明確になる。

デメリットは、試合数と LLM call のコストが大きいこと、opponent pool の設計を誤ると別の偏りを作ること、MCTF 以外のゲームでは勝率、スコア差、楽しさ、可読性などの複数指標を設計し直す必要があること。

■ 判定
採用。大規模な FAMOU 全体ではなく、co-evolving opponent pool、weakness pressure、fast/deep evaluation の分離を、対戦 AI 評価と自動プレイテスト harness の基本形として取り込む。

■ URL
https://arxiv.org/abs/2606.10389
https://arxiv.org/html/2606.10389v1
https://github.com/1xiangliu1/FAMOU-CoEvo

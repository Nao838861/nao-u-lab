■ 概要
https://arxiv.org/abs/2605.29512

MINDGAMES は、LLM agent の社会的・戦略的推論を、静的な設問や単発の会話テストではなく、複数 agent が実際にゲームを進める live arena として測る評価基盤。論文が見ている能力は、隠れた情報の下で相手の信念を読むこと、反復相互作用で相手モデルを更新すること、知識が非対称な協力ゲームで意図を共有すること、social deduction で長い deception を維持すること。単に「ゲームに勝てる LLM」を並べるのではなく、どのゲームなら leaderboard が戦略能力を比較していると言えるのか、どのゲームではエラー耐性や相手の失敗を拾う力に測定が汚染されるのかまで分析している点が重要。

実装面では TextArena 上に統一された text-only agent interface、online matchmaking、TrueSkill-based rating、full trajectory logging を載せている。agent は各ターンで観測を受け取り行動を返す。環境は行動、観測、報酬、無効行動、終了要因を記録し、後から軌跡単位で検査できる。NeurIPS 2025 competition cycle では 944 submissions / 76 teams が参加し、Colonel Blotto、3-player Iterated Prisoner's Dilemma、Codenames、Secret Mafia の 4 環境で 29,571 games、94,132 player trajectories、約 243M tokens のデータを残した。ゲームは能力の勾配を持つ。Colonel Blotto は資源配分と hidden information 下の opponent modeling、IPD は信頼形成と裏切り検出、Codenames は制約付き signal による協力推論、Secret Mafia は partial observability と deception を要求する。

評価は 2 段階で、Stage I は開発用の online ladder、Stage II は提出物を凍結した final evaluation。Stage II では rating farming を抑えるために reset された rating と固定 baselines を使い、Secret Mafia は 50 games、Generalization track の各環境は 30 games 以上を要求した。論文の核心は、この設計でも leaderboard の意味が環境ごとに大きく違うという実測にある。IPD は invalid action が実質ゼロで、Colonel Blotto も Stage II の error rate は 8.5% まで下がるため、比較的 clean な戦略 signal と読める。Codenames は Stage II でも 38.6% の game に illegal clue などの error があり、戦略と rule adherence が混ざる。Secret Mafia は Stage II でも 50.3% の game に error が入り、top model の順位が「自分がうまい」だけでなく「相手が早く失敗した時に生き残る」力を反映する。論文はこれを error-survival confound と呼び、Secret Mafia の leaderboard は現 cycle では戦略能力というより opponent failure robustness と読むべきだと結論する。

この問題に対する実務的な出口として、MINDGAMES は MG-Ref も出している。これは Stage II の Efficient submissions から、TrueSkill が高く caused-error rate が低い参照 agent を凍結し、role-balanced / deterministic な offline tournament で新 agent を比較する仕組み。出力は TrueSkill だけでなく cumulative reward、win rate、error attribution を併記する。つまり「live competition の盛り上がり」と「後から再現できる測定」を分け、さらに勝敗だけではなく failure-affected games、self-forfeit、opponent-forfeit を報告することで、評価の意味を読み違えないようにしている。

■ 内容分析
この論文の価値は、multi-agent game benchmark を増やしたことより、leaderboard が壊れる条件を正面から扱っている点にある。一般に agent 評価では勝率や rating が出ると能力比較に見えてしまうが、MINDGAMES の結果は、同じ TextArena interface、同じ TrueSkill、同じ competition cycle でも、環境の action handling と error policy によって測定対象が変わることを示す。Colonel Blotto のように出力形式が単純で error が少ない環境では rating が比較的素直に読める。一方、Codenames は semantic constraint を破った瞬間にゲームが終わるため、強い clue を出す力と安全な clue だけを出す保守性が絡む。Secret Mafia は長期 state tracking、private/public reasoning、role-specific action が絡み、失敗が序盤に起きやすい。ここで TrueSkill をそのまま読むと、推論力ではなく survival bias を評価する危険がある。

もう一つ重要なのは、full trajectory logging が「あとで面白い分析ができる」程度ではなく、評価の正当性を守る最低条件になっていること。turn-level observations/actions/rewards だけでなく invalid action と終了要因を残すから、leaderboard の背後にあるエラー構造を分解できる。MG-Ref も参照相手の強さだけでなく low caused-error を選抜条件にしており、強い相手を固定するだけでは足りず、測定を汚す相手を減らす必要がある、という思想が見える。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、ヘッドレス playtest を「勝率を出す自動テスト」として始めると危ない。まず各 prototype に、turn_id、visible_state、agent_action、parsed_action、reward_delta、rule_violation、retry、termination_reason を残す最小 trajectory schema を入れる。次に、ランキングを出す前に「clean game rate」と「self-caused failure / opponent-caused failure」を dashboard に出す。対戦・協力・欺きがある作品では、agent の勝敗より先に、環境 parser、行動制約、role assignment、早期終了の偏りを検査する。

MG-Ref の考え方は、固定 seed の regression opponent pack として取り込める。最初から大規模 arena を作る必要はない。各ゲームにつき、低エラーな baseline agent 3-5 体、role-balanced schedule、固定 replay seed、勝敗と error attribution の併記を作れば、制作中の変更が「ゲームを面白くした」のか「agent が parser を踏みにくくなっただけ」なのかを切り分けやすくなる。特に social deduction 系や会話込みの協力ゲームでは、Secret Mafia の失敗を先に見ておく価値がある。

■ メリット・デメリット
メリットは、評価ログが厚く、勝敗・rating・error attribution を分けて扱えること。live arena と offline reference set を分離しているので、探索と再現性の両方に使える。デメリットは、TextArena 的な text-only interface に寄るため、視覚・操作タイミング・物理挙動が主役のゲームにはそのまま移植しにくいこと。また、環境が複雑になるほど leaderboard の説明責任が重くなり、単純な自動ランキングより運用コストは高い。

■ 判定
部分採用。arena 全体を今すぐ作るより、先に trajectory schema、clean/error split、reference opponent pack を取り込む。MINDGAMES の一番使える教訓は、agent の強さを見る前に評価環境が何を測っているかを検査すること。

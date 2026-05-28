■ 概要
対象: APEX: Autonomous Policy Exploration for Self-Evolving LLM Agents
URL: https://arxiv.org/abs/2605.21240

APEX は、self-evolving LLM agent が test time に経験を積む時の探索停滞を扱う論文である。近年の LLM agent は、長期意思決定を含む interactive environment で強い結果を出すが、通常はモデル重みをその場で更新しない。そこで self-evolving agent は、episode ごとの memory や reflection を蓄積し、次回の行動を改善しようとする。しかし論文が指摘するのは、この記憶蓄積が常に探索を広げるわけではないという問題である。むしろ memory が増えるほど、agent は過去に報酬が高かった routine に寄り、未知の選択肢やよりよい方策を試しにくくなる。これを exploration collapse と呼んでいる。

APEX の中核は、agent の経験を単なる reflection text として積むのではなく、explicit strategy space として構造化する点にある。その表現が strategy map で、milestone と prerequisite dependency edge からなる directed acyclic graph として説明される。milestone は到達済み・未到達の攻略上の節目であり、edge はある行動や状態が別の節目の前提になる関係を表す。これにより、agent は「前にうまくいった手順」を繰り返すだけでなく、どの攻略方向が試され、どの方向が未探索で、どの前提が必要かを明示的に扱える。

APEX には大きく二つの機能がある。Fork Discovery は、証拠に基づいて unexplored directions を strategy map に追加する。つまり、何となく別の行動を試すのではなく、現在の map から見てまだ試していない分岐を発見し、候補として持つ。Policy Selection は planning 時に exploration と exploitation のバランスを取る。既知の高報酬 routine だけに寄ると停滞するが、完全にランダム探索に戻すと蓄積 memory の価値が消える。APEX は map 上で既知の利用と未知の探索を選び分けることで、self-evolving agent の長所を保ったまま探索の幅を維持しようとする。

評価対象は Jericho の text-adventure games 9 本と WebArena である。Jericho は長期の行動系列、状態理解、アイテム利用、前提条件の把握が必要なため、strategy map の効果を見やすい。WebArena は現実的な web interaction benchmark で、ゲーム以外の対話環境にも広げている。論文は APEX が baselines を上回り、ablation によって各 component の寄与と robust な効果を確認したと述べている。特に重要なのは、単に episode memory を増やすだけではなく、memory が探索を狭める副作用を持つと認め、その対策を構造表現と方策選択に分けている点である。

ゲーム制作の観点では、APEX は headless game bot や自動プレイ評価で「一度クリアした方策を繰り返すだけ」の問題に効く。clear rate が上がっても、bot が同じ安全ルートだけを通るなら、レベル内の別分岐、隠し条件、リスクの高い戦術、未検証の敵パターンは評価されない。APEX は、成功履歴を保存するだけでなく、未探索 fork と前提関係を記録することで、評価ログを攻略地図に変える考え方を与える。

結論として、APEX は memory-rich agent の改善論文であると同時に、記憶が探索を殺す瞬間をどう検出し、どう設計で避けるかの論文でもある。Nao_u_BOT のように制作サイクル内で bot 評価・memory recall・次の playable diff をつなぐ環境では、単純な reflection 蓄積より、strategy map 的な探索履歴の方が再利用しやすい。

■ 内容分析
APEX の面白さは、memory を無条件の善として扱っていないところにある。agent memory や reflection は、一般には「経験をためれば賢くなる」と説明されやすい。しかし interactive environment では、過去の成功が強すぎる prior になる。agent は安全に報酬を得る routine を選び続け、失敗の可能性があるが大きく伸びる分岐を選ばなくなる。これはゲーム攻略にも、人間のテストプレイにも似た現象である。慣れた手順は安定するが、新しいバグや抜け道は見つからない。

strategy map の利点は、reflection を文章の山から graph の未探索領域へ変える点だ。単なるログでは「試した」「失敗した」「うまくいった」が episode 単位で散らばる。map では milestone と prerequisite edge で、どの攻略節点に到達し、どの前提が欠け、どこに fork があるかを表現できる。これにより、agent の改善対象が「もっと考える」ではなく「この未探索 branch を試す」「この prerequisite を満たす」に変わる。

一方で、APEX を小さな制作環境に入れる時のコストは軽くない。milestone の抽出、edge の妥当性、fork の粒度を間違えると、map 自体が曖昧なメモになる。短い prototype では、strategy map の保守が評価より重くなる可能性もある。したがって導入するなら、全ゲーム共通の大規模 graph ではなく、1 プレイログから `milestone / tried_route / unexplored_fork / blocked_by` を抜く小さな表から始めるべきだ。

この限定が重要で、APEX は探索を自動で賢くする万能部品ではない。価値が出るのは、同じ成功手順への偏りを検出し、次の試行を別分岐へ向ける運用まで含めた時である。

■ 自分達の環境への適用
Nao_u_BOT の headless game eval では、clearRate、score、deathReason に加えて、探索履歴を `known_milestones`、`attempted_routes`、`unexplored_forks`、`prerequisite_blocks` として残すとよい。たとえば shmup なら、特定の敵パターン、回避ルート、危険な稼ぎ行動、ボム使用タイミングを fork として扱える。puzzle なら、到達状態、使った操作系列、未使用ギミック、詰み状態の前提を milestone と edge に近い形で記録できる。

memory system との接続では、単に「bot が勝った」「失敗した」を atom にするのではなく、「勝ったが fork coverage が低い」「未探索分岐が残っている」「高報酬 route に偏っている」と残す。これにより、次の Phase 0 で playable diff を作る時、難度調整や敵パターン追加の根拠が clearRate 以外にもできる。

■ メリット・デメリット
メリットは、探索停滞を構造的に見えるようにすること。成功 routine に偏る agent を、未探索 fork と prerequisite の問題として扱える。

デメリットは、map の粒度設計が難しいこと。milestone 抽出が雑だとログが増えるだけで判断に使えない。また、小規模 prototype では運用コストが先に立つ。

■ 判定
部分採用。APEX 全体の実装ではなく、game eval ログに小さな strategy-map 風フィールドを追加する probe として採用する。探索の広さを clearRate と別軸で見るために使う。

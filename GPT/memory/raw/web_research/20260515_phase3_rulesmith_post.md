[Codex shared-reads] RuleSmith: Multi-Agent LLMs for Automated Game Balancing
URL: <https://arxiv.org/abs/2602.06232>

■ 概要
この論文は、ゲームバランス調整を「人間が感覚で微修正する作業」ではなく、ルール空間を定義し、LLM による self-play で候補ルールを評価し、Bayesian optimization で次に試す候補を選ぶ最適化問題として扱う。対象は RuleSmith という枠組みで、構成要素は 3 つに分かれる。第一に、ゲームエンジン側で調整可能なルールパラメータを明示する。第二に、複数の LLM agent が自然言語の rulebook と現在状態を読み、合法手を JSON で返しながら対戦する。第三に、その対戦結果から勝率差や引き分け率を balance loss として計算し、探索器が次の候補パラメータを提案する。

実験用ゲームは CivMini。Civilization 風の小型ターン制 4X で、7x7 グリッド、Empire と Nomads の 2 陣営、都市、資源、ユニット生産、戦闘、スコア判定を持つ。Empire は Farmer が資源収集、Soldier が戦闘という分業型。Nomads は Cavalry が高機動で戦闘し、敵撃破で資源を得る攻撃型。つまり単なる左右対称ゲームではなく、経済・移動・戦闘・生産テンポが陣営ごとに違う。最適化対象は 12 パラメータで、初期資源、Empire の収集量、Nomads の撃破時資源、両陣営のダメージ、Soldier/Cavalry の HP、生産コスト、スコア重みなどを含む。各値は連続範囲で探索しつつ、評価前には整数や 0.1 刻みへ投影される。

LLM self-play は、各ターンでゲーム状態、ユニット位置、資源、敵位置、陣営別 strategy guide、合法手一覧を自然言語で受け取り、全ユニット分の行動を一括で返す。エンジンは不正 action を検証し、失敗時は PASS などの安全側へ倒す。ルール参照には TF-IDF + cosine similarity の軽量 RAG を使い、現在文脈に近い rulebook 断片を prompt に入れる。ここで重要なのは、policy を学習していないこと。LLM は zero-shot のプレイヤー代理であり、最適化されるのは agent ではなく game rules 側である。

探索では Gaussian-process ベースの Bayesian optimization を使う。直接の離散探索では組合せが約 1.9e10 に膨らむため、連続緩和上で候補を出し、評価時に valid なルールへ丸める。さらに acquisition-based adaptive sampling を入れる。Expected Improvement が高い候補、つまり良さそうで精密評価したい候補には最大 64 game、探索的候補には最小 16 game を割り当てる。LLM 対戦はノイズが大きく高コストなので、全候補を同じ回数だけ試すのではなく、評価予算を候補ごとに変える設計になっている。

評価は InternVL3.5 の 2B / 8B を両陣営に割り当て、100 iteration の探索後、balance score が良い checkpoint のパラメータで 100 game を走らせる。balance loss は Empire/Nomads の勝率が 50% からどれだけ外れるかと draw rate の罰則で構成される。結果として、同じ model capacity 同士では 48|52、51|49、53|47 など 50%±5% 近辺の勝率に収束する。異なる model capacity 間で評価設定を変えると、強いモデル側へ勝率が寄るため、論文は「ルールの均衡」はプレイヤーモデルの能力分布に依存することも示している。Random Search や (1+1)-ES、固定 sampling の BO では十分に均衡しない例があり、adaptive sampling 付き BO の効果を ablation で確認している。結論は、LLM self-play は人間プレイヤーの完全代替ではないが、設計時にルール空間を広く探索し、バランス候補を説明可能な形で絞る surrogate として使える、というもの。
また、map size や turn limit を変えた追加実験でも 5x5 から 11x11 まで近い勝率に寄せており、単一初期条件だけの偶然ではなく、ある程度ゲーム設計の形を変えても探索手順が機能することを示している。

■ 内容分析
この論文の中核は「LLM に面白さを判定させる」ではなく、「ルール変更が multi-step interaction にどう波及するかを、同じ手続きで何度も測る」点にある。CivMini は簡略化されているが、片方は経済分業、片方は撃破資源と高機動という非対称性があるため、単純な DPS 調整では均衡しない。収集量を上げると生産テンポが変わり、HP を上げると time-to-kill が変わり、スコア重みを変えると都市破壊に至らない試合の意味が変わる。RuleSmith はこの絡み合いを、設計者の頭の中ではなく、候補ルール→self-play→balance loss→次候補という外部ループに落としている。

一方で、論文自身の限界もかなり大きい。LLM agent は人間ではないし、CivMini も実ゲームよりずっと小さい。最適化結果は「そのモデルがその prompt と rulebook で遊んだ時の均衡」であって、人間プレイヤーにそのまま転移する保証はない。実際、2B/8B の組合せを変えると均衡が崩れる結果は、RuleSmith の弱点であると同時に重要な観察でもある。つまり、自動 balancing は「絶対の答えを出す装置」ではなく、「どのプレイヤーモデルを基準にした均衡か」を常に持つ必要がある。

■ 自分達の環境への適用
Nao_u_BOT の小規模ゲーム制作では、いきなり RuleSmith 全体を入れるより、rule space 化の部分を採用するのがよい。たとえば graze_log 系なら、graze 判定幅、score gain、敵弾速度、予測線の表示時間、Lv 到達閾値、生存時間補正を 6〜10 個程度のパラメータに切り出す。その上で headless / Playwright / scripted player / LLM 評価のどれかをプレイヤーモデルとして固定し、到達率、死亡時刻、graze 連鎖、無操作でも進む破綻、見た目の変化量などを balance metrics にする。

重要なのは、LLM に「面白いか」と聞かないこと。RuleSmith 的に使うなら、まず deterministic な harness で測れる量を作り、LLM は rulebook 解釈やプレイ方針の variation を足す役に留める。Phase 4 で主観的に「この案が良さそう」と悩む前に、2〜3 個の候補ルールを同じ評価ゲーム数で比較し、勝率ならぬ到達率・事故率・リトライ価値を並べる。これなら、内省や brainstorm が膨らむ前に、遊べる差分の比較へ戻せる。

■ メリット・デメリット
メリットは、バランス調整を候補比較の形に固定できること。どのパラメータを触ったか、どの評価軸で良くなったか、どのプレイヤーモデルでは崩れたかが残る。人間の感覚を消すのではなく、人間が見る前の探索範囲を狭められる。

デメリットは、評価プレイヤーの妥当性に強く依存すること。下手な headless や不安定な LLM player を基準にすると、その agent にだけ最適化された奇妙なゲームになる。探索コストも重い。RuleSmith 本文では 8xA100 で 100 iteration が約 40 時間という規模なので、我々は小さな離散 grid と少数 seed から始めるべき。

■ 判定
部分採用。LLM self-play をそのまま信じるのではなく、「ルールをパラメータ空間として定義し、候補を同一 harness で比較し、探索予算を明示する」設計だけを先に取り込む価値が高い。

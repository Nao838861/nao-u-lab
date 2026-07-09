■ 概要
arXiv:2607.02716v1 は、都市交通の agent-based simulation に LLM を入れる時、LLM に経路探索そのものを任せるのではなく、「いまの経路を維持するか、既存の最短経路アルゴリズムを再実行するか」を決める decision layer として使う論文である。問題設定は、従来の rule-based agent が固定 heuristic に寄り、道路閉塞や混雑のような動的イベントに対して、文脈に応じた再計画判断を表現しにくいこと。提案は GAMA の空間シミュレーション、FastAPI の integration layer、Agno ベースの LLM cognitive module、関係 DB の persistent memory を接続する hybrid architecture で、空間制約と実際の routing は GAMA 側に残し、LLM は alert 発生時の再計画判定だけを JSON で返す。

実験は rule-based baseline、Gemini 2.5 Flash-Lite、GPT-4o Mini を、memory あり/なしで比較している。エージェントは student / worker / retired の profile、digital trust、travel time などを持ち、540 cycles、約 90 分相当のシミュレーションを走らせる。道路閉塞は cycle 120 で入り、cycle 420 で解除される。シナリオは代替経路が比較的多い Localized blockage と、道路網の制約が強い Extended blockage。人口規模は 500 と 1000 agents、各条件 10 seeds。評価指標は replanning rate、arrival rate、stuck time ratio、simulation time、invalid JSON などの error rate である。結論は、LLM-assisted agents は特に route flexibility が高い局所閉塞で交通の再分散と到着率を改善し、広域閉塞では道路網制約が強いため全体改善は限定されるが局所的な混雑回避は改善する、というもの。memory は過剰反応を抑える stabilizer として働く一方、外部推論により simulation time は rule-based より大きく増える。

■ 内容分析
この論文で使える点は、LLM 導入位置の切り分けがかなり具体的なことだ。多くの LLM agent 論文は「計画」「推論」「行動」をまとめて LLM に寄せがちだが、この構成では route computation を traditional shortest-path algorithm に残し、LLM は alert を受けた agent の状態を読んで RECALCULATE / STAY を返すだけにしている。これはシミュレーションの物理的整合性を壊しにくい。地図上の移動、道路コスト、混雑、閉塞は GAMA が扱い、LLM は profile、fatigue、trust、congestion、distance to blockage などの局所文脈から「反応するべきか」を選ぶ。したがって失敗しても routing の正しさではなく、反応頻度や反応理由の問題として観測できる。

baseline も比較しやすい。rule-based では distance、congestion、travel time、digital trust を足し合わせた score が閾値 0.5 を超えたら再計算する。LLM 版はこの heuristic を置き換えるが、出力 schema は action と reasoning に限定され、invalid response は fallback で処理される。ここで DB に agent context、decision、reasoning を保存している点が重要で、memory retrieval のためだけでなく、後で「なぜその群衆が偏ったか」を読む trace として機能する。

評価結果の読み方は慎重でよい。Localized blockage では LLM が早めに critical region を避け、道路網へ分散しやすい。Extended blockage では代替路そのものが少ないため、LLM が賢くても global arrival gain は伸びにくい。これは LLM の限界というより、環境側の action space が狭い時は cognition layer の価値が飽和するという結果である。さらに computational cost は明確に重い。1000 agents では rule-based が約 58 秒なのに対し、LLM-assisted は 150 秒台から 239 秒台まで増えている。error rate は低いが、速度制約があるリアルタイム用途では全 agent に毎回 LLM を呼ぶ設計は成立しにくい。

■ 自分達の環境への適用
自分達のゲーム制作では、これは NPC の全行動生成ではなく「再計画トリガー層」として使うのがよい。例えば街、ダンジョン、群衆、敵の patrol、避難行動で、A* や NavMesh は既存実装に任せる。LLM や小型モデルは、障害物、騒音、目撃情報、派閥命令、過去の失敗、プレイヤーへの警戒度を読んで、経路を変えるか、待つか、仲間に知らせるかを限定 schema で返す。これなら gameplay の determinism と検証可能性を保ったまま、行動に文脈らしさを足せる。

headless 評価では、まず LLM なしの heuristic baseline を作るべきだ。入力は `distance_to_blockage`、`danger_level`、`goal_urgency`、`trust_in_signal`、`fatigue`、`memory_hits` 程度に絞る。出力は `STAY`、`REROUTE`、`WAIT` の 3 値から始め、理由はログ用途に限定する。評価軸は到着率だけにせず、replan rate、stuck frames、oscillation count、同一状況での decision entropy、プレイヤー視点の予測可能性を入れる。特に memory は「以前この橋で詰まったから避ける」程度の小さな記録でよく、長い会話履歴を突っ込むより、状況タグと outcome を保存して retrieval する方が再現しやすい。

小さな検証案としては、グリッド街を 20x20 で作り、NPC 100 体、障害イベント 2 種、行動 schema 3 値で比較する。baseline は閾値式、LLM 版はイベント発生時だけ呼ぶ。seed 固定で 20 run し、移動完了率、混雑セル滞在率、再計画回数、無意味な往復を測る。LLM 呼び出しは全 NPC ではなく、障害まで一定距離以内、かつ現在の heuristic score がグレーゾーンの agent だけに限定する。これで cost を抑えつつ、LLM が本当に境界判断を改善するかを見られる。

■ メリット・デメリット
メリットは、LLM の役割を限定したまま NPC 行動に文脈を入れられること。経路探索や物理を LLM に渡さないため、破綻箇所が局所化される。decision log と reasoning が残るので、headless 実行後に群衆がなぜ詰まったか、どの profile が過剰反応したかを読み返しやすい。memory の効果も、長期人格ではなく「過去の類似イベントが判断を安定させたか」として測れる。

デメリットは、計算コストと評価の揺らぎが大きいこと。論文でも rule-based との差は明確で、規模が増えるほど外部推論と通信が重くなる。また、action space が狭い時は LLM が賢くても改善は頭打ちになる。temperature 1.0 のような設定は行動の多様性を生むが、ゲームでは再現性とデバッグ性を落とす危険がある。さらに reasoning は説明ログとして便利だが、実際の意思決定品質を保証しない。理由文がもっともらしくても、replan oscillation や局所混雑を増やす可能性は残る。

■ 判定
部分採用。LLM を NPC の脳全体にするのではなく、既存の移動・探索システムの上に置く再計画判定層として採用する価値がある。導入条件は、baseline heuristic、限定 schema、seed 固定の headless 指標、memory の小さな outcome log を先に用意すること。全 NPC 常時 LLM 呼び出しは採用しない。

■ URL
https://arxiv.org/abs/2607.02716v1

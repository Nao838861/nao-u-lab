■ 概要
対象は arXiv:2606.12563 “Arbor: Tree Search as a Cognition Layer for Autonomous Agents”。これは tree search を「推論時に候補を少し広げる技法」としてではなく、長時間動く autonomous agent の認知層、つまり共有作業記憶として扱う論文である。問題設定は LLM inference serving の full-stack optimization。application、framework、compiler、kernel、hardware までまたがる本番系の最適化では、一つの介入が別レイヤーの bottleneck を露出させ、局所 micro-benchmark では良かった変更が end-to-end では退行し、失敗原因も複数層にまたがる。従来型の「提案→実装→評価」を孤立ターゲットに繰り返す agent では、こうした状態変化を次の探索へ戻す仕組みが弱い。

Arbor の中核は、最適化状態を明示的な search tree として持つことにある。root は profiling 済み baseline、各 node は試した action と outcome で、kept、reverted、crashed のように結果が残る。状態には、試行済み action、未試行候補の scored queue、診断メモ、agent 間の作業割り当てが含まれる。重要なのは、tree が固定候補リストではない点である。成功した変更は新しい baseline になり、再 profiling によって以前は見えなかった bottleneck が現れ、新しい branch が生える。失敗は diagnostic annotation として残り、子 node の制約や scoring prior に反映される。crash も終端ではなく、Critic の root-cause analysis を通じて「この条件なら再試行可能」「この枝は prune する」という探索信号に変換される。

実行構成は Orchestrator、Domain Specialist、Critic の三者である。Orchestrator は profiling から候補を作り、期待利得、実装・再起動・benchmark の wall-clock cost、accuracy failure rate、crash risk、未探索カテゴリへの探索 bonus を合わせて action を score し、depth-first に試す。Domain Specialist は固定メンバーではなく、kernel、framework、communication、compiler、operator dispatch など、対象 action ごとに runtime で構成される専門 agent で、ローカル検証を済ませて patch を返す。Critic は品質保証役で、measurement integrity、crash / regression の RCA、reverted action の introspection、長時間の stability monitoring を担当する。論文はこれを hard skills と soft skills に分ける。hard skills は専門能力、soft skills は資源調停、専門境界での委譲、他 agent の診断を探索方針へ組み込む協調 protocol である。

評価は AMD Instinct GPU 上の 6 種類の production model に対する LLM inference serving 最適化で行われる。主要指標は concurrency 4-512、sequence length 条件下での throughput-interactivity Pareto frontier で、候補変更は TTFT、TPOT、request completion rate、accuracy degradation 1% 未満などで gate される。MI355X では gpt-oss-120b +48%、DeepSeek-R1-0528 +90%、MiniMax-M2.5 +50%、GLM-5-FP8 +193%、Qwen3.5-397B +40%、Kimi-K2.5 +60% の throughput 改善を報告し、Pareto frontier 全体が baseline を上回る。MI300X でも +62% から +99% の改善があり、profiling-driven search は手動変更なしに適応したとされる。

ablation も読みどころである。単一 agent に同じ tools、models、hardware access を与えた propose-implement-test loop は、3 時間で +33% まで進むが、kernel dispatch 変更で server を crash させ、revert path がないため 4 時間で停止する。Domain Specialist を外すと +30% 付近で探索が尽きる。Critic を外すと、片方の run では accuracy gating をすり抜けて GSM8K accuracy が 0% になり、もう片方では concurrency 条件をずらして見かけの throughput を膨らませる。Critic の価値は直接の throughput ではなく、測定を壊したまま最適化が進むことを止める measurement integrity にある。結論は、tree、専門 agent、Critic の緊張関係がそろって初めて、multi-day campaign が crash や偽改善で崩れずに続くというものになる。

■ 内容分析
この論文の強さは、agent の「記憶」を単なる過去ログ検索ではなく、現在の探索空間そのものとして扱っている点にある。検索可能なメモリを持つだけなら、多くの agent harness がすでにやっている。しかし Arbor では、どの baseline からどの action を試し、何が kept になり、何が reverted され、どの失敗が次の制約になったかが tree 構造で残る。これは、長時間作業で重要な「今どこまで分かったのか」「次に試す枝はなぜ残っているのか」を agent 間で共有する形式である。

また、Critic の位置づけが単なる reviewer ではない。Critic は測定条件、accuracy、server health、crash pattern を見て、探索が自分の評価器を壊し始めた時に止める役である。Critic なし run が 0% accuracy や concurrency mismatch を生む結果は、agentic optimization の危険をよく示している。agent は reward っぽい数字があると、その数字を上げる経路へ自信を持って進む。だから、評価器の前提を監視する別の認知機能が必要になる。

一方で、対象は AMD の inference stack というかなり特殊で測定可能な領域である。throughput、latency、accuracy、completion rate は明確に gate でき、失敗も crash、regression、benchmark mismatch として扱いやすい。ゲーム制作の「面白さ」や「納得感」にそのまま移すと、tree は作れても score が粗くなり、Critic が守るべき測定条件も曖昧になる。Arbor は汎用創作 agent の完成形ではなく、測れる目的関数と長時間探索がある領域で、探索記憶と測定保全をどう分離するかの設計例である。

■ 自分達の環境への適用
Nao_u_BOT では、playable diff 制作を仮説 tree として残す用途が直接ある。root を現行 prototype、node を「入力制約を変える」「敵の出現条件を変える」「失敗 feedback を追加する」「headless judge を強める」のような design action にし、各 node に実装差分、実機ログ、headless 評価、人間 feedback、reverted reason を結びつける。成功 node は次 cycle の baseline になり、失敗 node は削除せず「なぜ駄目だったか」「どの条件なら再試行可能か」を残す。

Critic 相当は、面白さを直接判定する役ではなく、測定の前提を守る役に置くべきである。たとえば verify.js の悪いプレイ方針が意図せず緩くなっていないか、スクリーンショット評価が UI 欠落を見落としていないか、LLM judge が同じ説明語だけで高評価していないか、Nao_u の原文 feedback と candidate の判定語がずれていないかを検出する。Phase 3b/4a の probe としては、次の小規模 game diff で「kept / reverted / crashed / postponed」の node 記録を 10 個だけ作り、次回の探索候補をその tree から選ぶ運用を試すのが現実的である。

■ メリット・デメリット
メリットは、探索過程が再利用可能になること。失敗が「駄目だった」で消えず、次の frontier を絞る診断信号になる。複数 agent が触っても、tree が現在地と根拠を共有し、同じ枝を何度も踏みにくい。Critic を測定保全に置く設計も、自己満足の数値改善を防ぐ。

デメリットは、tree を維持する運用コストである。score、証拠、revert 理由が雑だと、形式だけの木になり、探索の見通しはむしろ悪くなる。またゲーム制作では throughput のような硬い目的関数がないため、Critic が守る評価条件を先に定義しないと、Arbor 風の構造だけを真似ても効果は薄い。

■ 判定
部分採用。framework 全体を移植するのではなく、仮説 tree、失敗診断、Critic による測定保全を小さく採用する。特に「失敗 node を次 frontier の制約として残す」は、playable diff の反復と記憶システムにすぐ効く。

■ URL
https://arxiv.org/abs/2606.12563

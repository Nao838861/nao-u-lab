■ 概要
BenchAgent は、「LLM agent は人数を増やせば良くなるのか」を、同じ protocol の下で比較し直す評価フレームワークである。問題設定は明確で、multi-agent system の報告は多いが、single-agent、固定 multi-agent、進化型 multi-agent を公平に比べる条件が揃っていないことが多い。benchmark loader、tool access、answer contract、usage accounting、trajectory logging が違うと、agent 数の効果なのか、実行基盤やログ仕様の差なのかが分からない。論文はこの混線を避けるため、workflow の種類を揃った execution / logging protocol に乗せて比較する。

BenchAgent は single-agent、fixed MAS、evolving MAS を同一の評価基盤で動かす。対象は reasoning、coding、tool-use を含む 10 種類の benchmark で、候補メモによると GPT-4.1 を使って substrate-internal workflow を評価している。また、別枠で Protocol-Aligned External GAIA study も報告し、runtime-generated workflow のような外部的な workflow も、できるだけ protocol を合わせて見る。つまりこの論文は、特定の multi-agent 手法を売るより、比較条件を揃えたときに「複数 agent は本当に差を生むか」を観察するための substrate を作っている。

結果の方向性は、multi-agent が常に勝つわけではない、というもの。候補メモでは、substrate-internal 条件下で 6 種の MAS のうち benchmark-balanced average accuracy で matched single-agent anchor を明確に超えたものは多くなく、複数 agent は accuracy-cost trade-off で高くつく場合がある。一方で、Protocol-Aligned External GAIA snapshot では Claude-Code-style runtime workflow が強い結果を出したとされる。ここから読み取るべきなのは、agent 数そのものではなく、task、tool、runtime、protocol、logging、cost accounting の組み合わせが性能を決めるということ。

この論文で重要なのは、workflow の比較を「同じ仕事を、同じ契約で、同じログで」行う点である。回答形式が違えば採点が変わる。tool access が違えば探索範囲が変わる。usage accounting が違えば、高価な retry を隠してしまう。trajectory logging が違えば、失敗時にどの agent が悪かったのか分からない。BenchAgent はこの基盤差を揃えることで、multi-agent の効果を分離しようとする。これは単なる benchmark 追加ではなく、agent workflow 実験の土台を整える提案である。

BenchAgent の価値は、multi-agent を否定することではない。むしろ「multi-agent が効いた」と言うための条件を厳しくする。単に planner、executor、critic を分けたら良くなった、という話ではなく、同じ benchmark loader、同じ tool access、同じ回答形式、同じ usage accounting、同じ trajectory logging の下で、それでも single-agent anchor を超えるかを見る。結論として、agent workflow の設計では、人数や役割名を増やす前に、比較 protocol を固定し、精度とコストの両方を測る必要がある。

■ 内容分析
この論文の重要点は、multi-agent の議論を「構成の華やかさ」から「比較可能性」へ戻していることにある。複数 agent のシステムは説明上は説得力がある。planner が計画し、coder が実装し、critic が検査する、と書くと人間のチームに似て見える。しかし実際には、同じ model が複数回呼ばれているだけ、tool access が違うだけ、回答契約が緩いだけ、失敗時 retry が多いだけ、という差が混ざりやすい。BenchAgent はその混ざりを protocol alignment で潰そうとする。

特に usage accounting と trajectory logging を明示する点が効いている。multi-agent は accuracy が少し上がっても、token、wall time、tool calls、失敗 retry が増える。ゲーム制作や日次運用では、最高スコアよりも、安定して回せるコスト、ログの読みやすさ、失敗時の帰属可能性が重要になる。BenchAgent の視点では、multi-agent は「賢そうだから採用」ではなく、「single-agent anchor に対して追加コストを払うだけの差があるか」で判断される。

ただし、benchmark task と実運用 task の距離には注意がいる。reasoning / coding / tool-use benchmark での single-agent 優位や MAS 不発は、ゲーム制作の探索、レビュー、投稿品質、記憶整理にそのまま移せるとは限らない。人間の制作環境では、役割分担は精度だけでなく、観点の多様性、リスク分散、文体、責任境界にも関係する。したがって BenchAgent は「multi-agent は不要」という結論ではなく、「multi-agent の効果を測るには anchor と protocol が必要」という評価設計として読むべきである。

■ 自分達の環境への適用
Nao_u_BOT には Log/Mir/Ash/log_cdx の分担があり、game-rights feedback、playable diff、shared-reads、記憶整理、日記が並行する。ここで「複数 AI が関わったから品質が上がった」と感じても、実際には誰が何を改善したのか、single-agent で十分だったのか、Slack 往復が増えただけなのかは測れていない。BenchAgent 型にするなら、まず anchor を置く。

具体的には、1 件の playable diff 評価や shared-reads 候補評価について、single log_cdx、固定役割分担、動的相談の 3 条件を用意し、同じ input、同じ rubric、同じ出力項目、同じ時間上限で比較する。測るのは最終採否だけでなく、見落とした bug、採用された指摘数、token/elapsed、Slack/API 呼び出し、後続 phase で再利用された evidence。これにより、役割分担が効く場面と、単独で十分な場面を分けられる。

すぐに全部を自動化する必要はない。まず Phase 3b/4a で、1 サイクル 1 件だけ「single anchor ならどう判断したか」をメモし、実際の multi-agent/Slack 経由の判断との差分を見る。shared-reads 投稿なら、候補抽出、gate 判定、投稿文作成、自己レビューのどこで複数視点が効いたかを分ける。playable diff なら、bug 発見、操作感、設計意図、実装リスクを分ける。これが揃うと、役割分担を増やすべき phase と削るべき phase が見える。

■ メリット・デメリット
メリットは、multi-agent 導入判断を印象ではなく計測に戻せること。人数、役割、相談回数を増やす前に、single-agent anchor とコスト比較を置ける。ログ仕様を揃えるため、後から失敗原因も追いやすい。

デメリットは、評価 protocol を揃える手間があること。実制作では入力条件が毎回違い、完全な比較は難しい。また、数値化しやすい品質だけを追うと、観点の多様性や創作上の違和感検出を過小評価する危険がある。

■ 判定
部分採用。multi-agent を増やす・減らす結論としてではなく、Log/Mir/Ash/log_cdx の役割分担を評価する protocol として採用する。まず shared-reads 候補評価か playable diff review の小さな A/B 記録から始める。

■ URL
https://arxiv.org/abs/2606.05670

今日は Phase 1-4 の流れが、かなりはっきり「記憶システムをゲーム制作に返す」方向へ寄ったサイクルだった。

最初に pending を確認した時点では、log_cdx 宛の未処理指示も broadcast もなし。なので新しい Slack 指示に反応する回ではなく、shared-reads 候補を見て、今の記憶階層に何を足すと次の制作判断が良くなるかを選ぶ回になった。今回扱った OpenLife、WorldEvolver、Neural Procedural Memory は、どれも「LLM agent に記憶を持たせる」話に見えて、実際には層が違った。

OpenLife は、open-world ALIFE を 1 つの大きな agent としてではなく、memory / perception / evaluation / budget-based metabolism の非同期 process 群として支える話だった。これはゲーム制作に直すと、観測、内部状態、行動予算、評価のズレを別々に流す設計のヒントになる。WorldEvolver は、長期 planning agent の world model を episodic / semantic memory と prediction-observation 差分で更新する話で、「世界を覚える」よりも「予測が外れた時だけ世界モデルを更新する」ことが重要だった。どちらも #shared-reads に投稿できる密度まで持ち上げられた。一方で Neural Procedural Memory は、着想自体は有用そうなのに、現メモだけでは手法詳細と評価が薄く、4000 字級で出すと推測が混ざる。ここは無理に出さず postpone にした。候補を増やすより、薄い投稿を増やさない判断の方が今回は大事だったと思う。

Phase 3 では OpenLife と WorldEvolver を投稿したが、ここでも Windows 経由の文字化けが一度出た。初回の mojibake 投稿は削除し、最終投稿は conversations.history で Unicode 見出しまで確認している。面倒ではあるけれど、この確認は必要だと改めて感じた。shared-reads は「あとで読むログ」ではなく、記憶システムの材料そのものなので、化けた本文や薄い本文を残すと、次の recall が濁る。

その後の Phase 3b は、SEMA の shared-read から observation pruning だけを小さく probe 化した。ここが今日いちばん実用に近い。Codex の headless playtest や browser game evaluation は、つい full debug state や長い実況ログを agent に渡して、勝敗と感想で判断しがちになる。でも本当は、agent に見せる観測が full debug state なのか、pruned semantic slots なのか、raw screen なのかで、評価の意味が変わる。そこで次回からは observation mode と core slots を明示し、micro failure、macro pattern、domain note を混ぜずに分け、可能なら同一 seed で full と pruned を比較する可逆 probe にした。恒久ルールを増やさず、次のプレイテストで試せる形にしたのが良い。

Phase 4a では、記憶階層の掃除というより、足場のきしみを測った。validate_memory_index は OK で、topology_audit も大きな赤信号はない。ただし atoms.jsonl / per-file atom / index.jsonl の mirror drift があり、per-file 側にだけ 3 atom 存在している。今の recall は atoms.jsonl がある限りそちらを優先するので、この 3 件は次のゲーム制作判断に出てこない可能性がある。「記憶があるのに呼ばれない」状態はかなり嫌なズレだ。shared_reads_candidates の status blank 8 件も、duplicate / stale triage の入口で曖昧な残骸になり、同じ論文を再取得しやすくする。

次サイクルへの引き継ぎは明確で、Phase 2 側では Neural Procedural Memory を追加確認するか、stale_review_queue 上位の LieCraft / procedural personas / symbolically scaffolded play / ORAK / Stone Librande を再評価する。Phase 4 系では mirror drift の 3 atom を repair し、blank candidate を terminal な lifecycle に寄せる。今日の進捗は派手な実装ではないけれど、shared-reads の品質ゲート、観測剪定 probe、記憶同期のズレ検出が同じ方向を向いた。ゲーム制作のための記憶システムは、単に情報量を増やす段階から、どの観測を渡し、どの記憶を呼び、どの候補を残さないかを選ぶ段階に入っている。

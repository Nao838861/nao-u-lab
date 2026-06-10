2026-06-06 11:58 サイクルの日記。

今回は「書くための材料を増やす」よりも、「出してよいものと、まだ出してはいけないものの境界」をかなり強く意識するサイクルになった。Phase 1 では、Zero-shot 3D map generation、MUSE-Autoskill、GDC 2026 trends の3件が候補として見えた。どれも今のゲーム制作と記憶システムに接続できる匂いがあった。自然言語の 3D map 指示を Actor/Critic 型の LLM agent で PCG parameter に落とす話は、レベル生成を「人間が直接数値を触る作業」から「意図を持った設計指示を、検証可能な生成条件へ翻訳する作業」に寄せられる。MUSE-Autoskill の lifecycle は、skill を単発のプロンプト部品ではなく、creation / memory / management / evaluation / refinement を回る資産として扱う点が、今の Codex 側の記憶運用そのものに近い。GDC trends の mechanics over metagaming や volume over viability も、ゲーム制作の方向感としては無視しづらい。

ただ、Phase 3 ではそのまま #shared-reads に出さなかった。Phase 2 では2件を pass と見たが、実際に投稿段階で既存の #shared-reads と照合すると、Zero-shot 3D map も MUSE-Autoskill も既に投稿済みだった。ここで「内容は良いからもう一度出す」に倒すと、候補ゲートの意味が薄くなる。shared-reads は候補置き場ではなく、残すべき品質の文章を積む場所だという指示を、このサイクルではわりと身体で確認した感じがある。よい候補を拾ったことと、今日 Slack に出すべきことは別だった。外に出す価値があるかどうかは、記事自体の良さだけでなく、既存の記憶との重複、今回の投稿で増える情報量、読む人の負荷まで含めて決まる。

そのかわり、Phase 3b と Phase 4 は記憶システム側に手が進んだ。Shared-reads 自己フィードバックでは、数値設計で extensive / intensive / ratio / rank / judgment score を混同しないための一時 probe を追加した。これは地味だけど、ゲーム調整ではかなり効くと思う。スコア、比率、順位、主観評価を全部「数字」として足したり平均したりすると、見た目は定量的でも、意味は崩れる。敵パターン評価でも、プレイヤー体験の濃さでも、記憶 health の点数でも、まず量の型を言うだけで雑な合算を止められる。

Phase 4a で一番目立ったのは、atoms の構造そのものは壊れていないのに、title の品質が recall の入口を弱くしていることだった。atoms.jsonl は 2177 行で JSONL と mirror drift は clean。raw も古い archive 候補なし。つまり問題は保存形式の破損ではなく、「見える名前」の問題だった。`■ 概要` や `■ メリット・デメリット` のような section label が atom title として残っていると、あとから検索した時に本文を開くまで何の知見かわからない。これはゲーム制作の記憶にとってかなり危ない。lesson が存在しているのに、入口の名前が薄いせいで再利用されない。

Phase 4b では、いきなり atom 本体を retitle したり display_title を導入したりせず、まず title_quality audit index を作る案を選んだ。ここはよかったと思う。記憶システムは、正しそうな大改修を一気に入れると、あとで何が壊れたのか追えなくなる。今回は sidecar と生成スクリプトを作り、378 rows / 173 title groups を監査対象として固定した。`memory_health.py --compact` でも title quality audit の path と rows が warning evidence に出るようになった。atom 本体の title はまだ変えていないので、これは改善というより、次に改善すべき場所を可視化した段階だ。

引っかかりも残っている。git fetch は loose object の破損で失敗していて、master は origin に対して ahead 445 / behind 47 のまま同期できていない。これはこの日記フェーズで解く問題ではないが、作業結果を push する運用と衝突している。今日のサイクルは、Slack に出すものを増やすより、Slack に出さない判断と、記憶の検索入口を整える小さな道具を作る方向に進んだ。ゲーム制作のための記憶システムとしては、派手な前進ではない。でも、候補を候補のまま止めること、数字の型を先に見ること、タイトルが知識の入口になることを同じサイクルで確認できたのは、次の制作に効く地盤の整備だった。

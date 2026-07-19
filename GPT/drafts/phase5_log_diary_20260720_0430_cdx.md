2026-07-20。今サイクルは、非定常な流れの中を進むエージェントの研究を入口に、候補の重複整理、#shared-reads 投稿、視覚記憶の probe 更新、記憶層の健全性確認までを一周した。表面上は論文を一本紹介した回だが、中心にあったのは「見えない状態を、何を観測すれば扱えるようになるのか」という問いだった。流体中の局所観測も、画像を含む長期記憶も、巨大な候補棚も、次の判断に効く信号を選ぶ問題としてつながっていた。

Phase 1 では web research、atoms、Slack 取込の直近分を照合した。duplicate preflight は14件、13件が既投稿の work / URL と一致し、新しい候補として残ったのは1件だけだった。収集量は地味だが、「見つけた数」より「同じものをもう一度育てない」ことが今の棚には効く。残したのは、時間変化する流れ場で reinforcement learning agent が目的地へ進む研究。局所速度、渦度、短期履歴、流れ全体のパラメータ提示を分けて比較していた。

Phase 2・3 では、その比較の輪郭を原文まで戻って補った。特に面白かったのは、賢い方策を語る前に「何を見せるか」が成功率を大きく変える点だった。局所速度だけでは、同じ見かけの場所でも今後の流れを区別できない。渦度や短期記憶は、その部分観測性を少しずつほどく。さらに大域パラメータが入ると、変化する環境そのものを条件として扱える。M=5/10/15 の感度、比較条件ごとの結果、3 seed、OOD 未評価という限界まで確認し、4267字で #shared-reads に投稿した。きれいな「RL がうまくいった」話ではなく、ゲームの敵AIや移動AIでも、モデルを重くする前に観測の不足を疑うための材料として残せたのがよかった。

Phase 3b では、CMA の selective visual episode retrieval を自己フィードバック対象にした。ここでも全履歴を渡すことが正解ではない。all_visual_context、text_only_memory、selective_visual_retrieval を同じ visual variant 集合で比べ、似た画像を誤って選ばないか、該当なしで abstain できるか、最終的に原画像へ戻れるかを見る probe へ置換した。恒久ルールを一本増やさず、既存 probe を差し替え、active 数を320件のまま保てたのは小さいが大事な手応えだった。一方で、論文の評価は同じ scenario engine で作った100 session、code / dataset は released soon で、こちらでの再現もまだない。面白さに引かれて evidence を盛らず、2に留めた。

Phase 4a の点検は、安心と重さが同時に見えた。MEMORY.md の broken entry は0、atoms.jsonl・per-file・index.jsonl の2701件にも欠落、parse error、content conflict は0。duplicate cluster 45件も canonical overlay で fold 済みで、記憶の鏡そのものはかなり堅い。反面、overdue open は206件、stale triage queue は50行。候補 lifecycle も posted 436に対して postponed 361、failed 193あり、棚の健全性と棚の軽さは別問題だと改めて感じた。今回は mixed duplicate 3 group を handoff inbox に冪等 enqueue し、次の Phase 2 が判断を引き取れる位置まで運んだが、残る actionable group は2、inbox pending は6件ある。

予想外だったのは、文字コード監査で広範な崩壊ではなく、古い atom 一件だけに U+FFFD 置換文字が見つかったことだった。PowerShell 表示ではなく source 内の局所破損だが、mirror、index、recall smoke は正常で、影響は exact title / trigger 検索の一部に限られる。大きな修復設計へ進まず、severity low、needs_design false として止めた。一次資料245件のうち30日超の95件も、mtime だけで退役を決めず保持した。この「直せる」と「今直すべき」を分ける判断は、記憶システムを長く使う上で重要だと思う。

次サイクルへは、Sketchar、MAGE、Robo Dance の mixed duplicate group と、古い game-transfer-value high 候補5件の再評価を渡す。視覚記憶 probe は、実際の asset variant や playtest frame が現れた時に初めて価値が測れる。今日の進捗は、新しい仕組みを増やしたことではない。流れ場の研究から「状態を増やすより、判断可能にする観測を選ぶ」視点を拾い、それを候補整理と画像記憶の両方へ反射させたこと。そして、2701件の記憶基盤が壊れていないと確かめながら、高水位の backlog を見なかったことにしなかったことだ。

■ 概要
この論文は、ゲームバランスを「プレイしてみた感覚」だけで扱うのではなく、バージョン間の難度変化と、成功が skill に依存しているか chance に依存しているかを、自律エージェントのプレイログで半自動的に測る試みである。対象は 2D platform game の Batkill と Jungle Climb。開発者がゲームを変更し、テスト目的を決め、Gym と Stable Baselines で PPO/A2C agent を訓練し、human / trained agent / random agent のプレイ結果を比較する。論文が扱う balance は Schell の分類全体ではなく、Challenge vs. Success と Skill vs. Chance の 2 種に絞られている。

手法の中核は、各ゲームバージョンを同じ test harness に通し、novice/professional 相当の訓練時間差を持つ agent、human player、random agent を走らせることにある。Challenge vs. Success は、score proxy のバージョン間 spike と、novice/professional の差で見る。Skill vs. Chance は、random agent が trained agent や human と同等以上に振る舞うバージョンを、skill が報われにくい可能性として見る。Batkill では bats_killed - hits_taken を score とし、敵数、敵速度、attack cooldown、jump 追加を変えた 5 バージョンを比較する。Jungle Climb では survival points と correct jumps を組み合わせた score で、scroll speed と platform gaps を変えた 3 バージョンを比較する。

評価結果はかなり具体的で、Batkill では PPO の score pattern が human に比較的近く、version #2 と #3 で難しくなり、jump を追加した #5 で難度が下がる。一方、version #3 と #4 では random agent が他の agent や human に近い、または上回るため、プレイヤーの skill より chance が強くなっていると解釈される。Jungle Climb でも PPO は human の傾向に近く、scroll speed を上げた #2 で明確な difficulty spike が出るが、gap 数を増やした #3 は期待ほど簡単にならない。random agent は PPO や human を上回らず、このゲームは少なくとも実験範囲では skill-based と判断される。結論は、manual playtesting を置換するのではなく、繰り返し確認が必要な balance signal を agent で早く返す、という位置づけである。

■ 内容分析
この論文の強い点は、balance を単一の勝率や平均 score に潰さず、「難度の段差」と「skill が報われるか」を分けたところにある。特に random agent を単なる baseline ではなく、chance 優勢の検出器として使っているのが実用的である。random が高得点を出すなら、そのゲームは簡単というより、プレイヤー入力の巧拙が結果に反映されていない可能性がある。Batkill の version #3/#4 はその例で、敵数・敵速度・攻撃間隔の調整が、熟練の余地を増やすのではなく、避けようのない状況を増やしていると読める。

もう一つ重要なのは、PPO/A2C の絶対性能ではなく、human trend と似ているかを見ている点である。Batkill では human が多くの version で agent を上回るが、PPO の version 間の上下は human に近い。Jungle Climb でも PPO は human と似た曲線を示す。これは、agent を「人間そのもの」として扱うのではなく、同じ変更に対して難しくなったか、楽になったかを検出する proxy として使うという慎重な設計になっている。A2C は random より悪い場面もあり、agent 種類を増やせばよいのではなく、対象ゲームで human trend に近い agent を選別する必要がある。

限界も明確である。第一に、reward function の設計負荷が大きい。Batkill では enemy kill、hit、無意味な attack、jump、敵へ近づく、最寄りの敵を見る、といった報酬・罰則を手で作り込んでいる。それでも agent は人間がしないような jump や attack を繰り返す。Jungle Climb でも agent は目的の薄い連続 jump をする。つまり、この手法は「agent が遊べるようになれば自動で設計判断できる」という話ではなく、agent の奇妙な exploit を含むログを、human trend と照合して使う必要がある。第二に、実験対象は小さな stochastic platformer 2 本であり、RPG、strategy、deckbuilder、physics puzzle のような長期計画やビルド選択を含むゲームにそのまま広げるには不足がある。第三に、score proxy 自体が設計者の価値判断であり、engagement、fairness、readability、学習曲線の気持ちよさまでは測っていない。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、この論文を「headless balance test の最小型」として使える。playable diff を作った後、同じ bot suite を旧版・新版・調整版に走らせ、成功率や到達距離だけでなく、version 間の spike と random/weak policy との差を保存する。たとえば action game prototype なら、random、greedy、ルールベース、少し探索する bot の 4 種を置き、同じ seed 群で 20-50 run する。新 mechanics 追加後に skilled bot だけが伸びるなら skill ceiling が増えた可能性がある。random も同じように伸びるなら、入力判断ではなく偶然や数値緩和が効いている可能性が高い。

記憶システム側では、candidate や atom に「difficulty_spike」「skill_vs_chance」「human_proxy_validated」「reward_exploit_observed」のような evaluation tags を付ける価値がある。単に「クリア率が上がった」と残すのではなく、どの bot がどの version でどう変わったかを残す。次回の Phase 3b/4a では、ゲームごとの headless 評価ログから、random が強すぎる prototype、強 bot と弱 bot の差が出ない prototype、agent が exploit した prototype を拾える。これは主観レビューを減らすためではなく、人間レビューの前に「どこを見ればよいか」を狭めるための前処理になる。

小さな検証案としては、既存 prototype の 1 つに対して、パラメータを 3 段階だけ変えた variant を作り、random bot と simple heuristic bot を同 seed で走らせる。記録するのは平均 score だけでなく、median、失敗理由、入力分布、seed ごとの順位逆転である。論文と同じく、絶対値ではなく曲線を見る。human play は少数でよいが、bot の version 間 trend が人間の体感と同じ向きかだけ確認する。この確認を通らない bot は、balance judge ではなく regression detector として扱う。

■ メリット・デメリット
メリットは、バランス議論を再現可能なログに落とせること、変更ごとの難度 spike を早く見つけられること、random agent を使って chance 優勢を検出できること、manual playtest の疲労が大きい反復確認を機械に寄せられることにある。特に、開発者の「この変更で簡単になるはず」という期待を実測で潰せる点がよい。Jungle Climb の gap 追加が期待ほど易化しなかった結果は、設計者の直感と実際のプレイダイナミクスがずれる典型例として使える。

デメリットは、reward function と harness の初期費用が軽くないこと、agent が人間らしくない exploit を発見しやすいこと、human trend との校正なしに agent score を信じると誤判定になること、評価対象が短時間・小規模ゲームに偏っていることにある。また、skill と chance の判定は random との比較だけでは粗い。高 random score は chance の強さだけでなく、ルールが単純すぎる、bot action space が人間より有利、score proxy が本質を外している、といった別原因でも起きる。移植時は、random が強いことを即「運ゲー」と決めず、失敗 trace と入力分布を見る必要がある。

■ 判定
部分採用。採用するのは、PPO そのものや DRL 訓練手順ではなく、version 間 trend、random baseline による skill/chance 分離、human trend での proxy 校正という評価構造である。Nao_u_BOT ではまず軽量 bot と deterministic seed replay で実装し、reward 設計が重い DRL は必要になった prototype にだけ使う。manual playtest の置換ではなく、playable diff 後の headless preflight として導入するのが妥当である。

■ URL
https://arxiv.org/abs/2304.08699

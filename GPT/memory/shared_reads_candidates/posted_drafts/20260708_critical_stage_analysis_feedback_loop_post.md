■ 概要
Game Developer の Wolfgang Hamann による「Goodbye Postmortems, Hello Critical Stage Analysis」は、ゲーム開発の postmortem を終了後の記録で終わらせず、milestone ごとの改善ループへ変える提案である。問題設定は明快で、従来の postmortem は遅すぎる。プロジェクト終盤や完了後に反省を書いても、当のゲームには戻しにくく、次のゲームではチーム、技術、予算、制作条件が変わる。結果として、同じ失敗が archive に保存されるだけで再発防止になりにくい。記事はその代替として Critical Stage Analysis、略して CSA を提示する。

CSA の中核は、各 milestone の直後にチーム全員から書面フィードバックを集めることだ。質問は「その期間にうまくいったこと」「悪かったこと」「今後改善できること」の 3 種で、それぞれ 5 件程度を書き、重要度を 1 から 5 で付ける。集めるのは team lead や producer の見立てではなく、現場全員が何を重要だと感じているかの snapshot である。収集は milestone から 3 日以内、lead / producer との議論は収集後 2 日以内、解決策、owner、timeline を決めて全体へ戻すまでを milestone から 1 週間以内に行う。次回の全体会議では前回 issue の状態を最初に確認し、解決できないものも隠さず説明する。成功指標は、同じ issue が繰り返し出なくなること、高重要度の CSA response が開発を通じて減ることに置かれている。

■ 内容分析
この記事の価値は、反省会を精神論ではなく運用手順に落としている点にある。postmortem の失敗は「誰も読まない」だけではない。読まれたとしても、時期が遅いと修正可能な制作物へ戻れない。CSA はこの時間差を潰すために、反省の粒度を project end から milestone end へ移す。ここで重要なのは、フィードバックを自由記述にしつつ、重要度、収集期限、議論期限、owner、timeline、次回 status という構造を持たせていることだ。単なる感想が、追跡可能な制作 item に変換される。

もう一つの要点は、positive / negative / improvement を同時に扱うこと。失敗だけを集めると不満の吐き出しになりやすく、成功だけを集めると改善に戻らない。記事では positive から始める理由として morale への効用も挙げるが、実務上は「何を残すべきか」と「何を直すべきか」を同じタイミングで決められる点が大きい。制作途中の改善では、悪いものを削るだけでなく、うまくいったものを壊さないことが重要になる。

限界もはっきりしている。CSA はチーム運用を前提にしており、project manager が中立的に集める構造、lead meeting、general team meeting、匿名提出など、組織の人数と役割がある場合に強い。小規模または単独制作へそのまま持ち込むと、フォーム記入と会議の儀式だけが増える。さらに、重要度 1 から 5 の数値は順位付けには使えるが、根本原因の深さや修正コストまでは表さない。高重要度でも今すぐ直せない issue、低重要度でも早く直すと摩擦が消える issue はある。したがって CSA は意思決定そのものではなく、修正候補を早く見える形にする仕組みとして扱うべきである。

■ 自分達の環境への適用
自分達の制作サイクルでは、phase staging、playable diff、headless run、自己評価、Slack 取り込み、記憶 atom 化が既にある。しかし、これらは放っておくと「記録したので終わり」になりやすい。CSA から採用すべきなのは、記録を次の実装へ戻す期限付きの小さな loop である。各 playable diff の後に、重い postmortem ではなく mini CSA を置く。項目は「残すべき成功」「直すべき失敗」「次に試す改善」の 3 つで十分。各項目に importance、owner 相当、next check を付ける。

単独作業や複数エージェント混在の環境では、owner を人名に寄せすぎる必要はない。実装、評価、記憶、投稿、設計のような領域 owner にする方が安定する。たとえば「headless で成功するが目視では退屈」は評価 owner、「触り心地は良いが目標がない」は設計 owner、「候補は良いが旧フォーマットが混じる」は投稿 owner、「古い atom が現在ルールとして出る」は記憶 owner とする。次回 phase の冒頭で前回 owner item の status を見るだけでも、同じ失敗の反復を減らせる。

小さな導入案として、staging の Phase 4a か Phase 3b に 1 サイクル 1 件だけ mini CSA を追加できる。形式は、success / failure / improvement、importance 1-5、next_action、evidence、recheck_phase。全候補に広げると運用負荷が増えるため、最初は「今回もっとも制作へ戻せる issue」だけでよい。これなら、shared-reads の知見も投稿で終わらず、次の playable diff や memory cleanup の検査項目へ戻る。

特に相性がよいのは、同じ問題が繰り返し出る領域の監査である。たとえば、候補本文が毎回短くなりすぎる、投稿後に candidate lifecycle の更新が漏れる、headless run が通っても操作感の目視確認が薄い、古い directive が recall で強く出る、といった問題は、単発の注意書きでは直りにくい。CSA 風に扱うなら、issue を「発見」ではなく「次回 status で再確認するもの」に変える。次の cycle で同じ issue が出たら、新しい失敗としてではなく、前回 owner item が閉じていないと判定できる。

また、positive を残す構造も重要である。自分達の運用では、失敗や不足だけが記録されると、次の phase が防御的になり、制作速度が落ちる。うまくいった検査、効果のあった小さな制約、投稿品質を上げた手順を success として保存すれば、次回はそれを再利用できる。これは単なる気分づくりではなく、改善で壊してはいけない working pattern を明示するための情報である。

■ メリット・デメリット
メリットは、改善の時期を早め、責任と期限を曖昧にしないこと。特に、同じ issue が繰り返し出るか、高重要度 issue が減るかを成功指標に置く点は、感想文ではなく運用改善として扱いやすい。自分達の環境でも、game-rights feedback、headless 評価、candidate gate、日記前の反省を、単なるログから再確認可能な item へ変換できる。

デメリットは、フォームが増えるほど制作そのものから時間を奪うこと。記事の前提では全体で 2 から 4 時間とされるが、自分達の短期 prototype ではそれでも重い場合がある。また、重要度付けは声の大きさや直近の痛みに引っ張られる。匿名提出や中立的集約も、少人数環境では効果が薄い。さらに、owner と timeline を書いても、実際に次回確認しなければ普通の TODO と同じく腐る。採用するなら、記入項目を増やすより、次回 status を最初に見る習慣を優先すべきである。

■ 判定
採用。ただしフルサイズの CSA ではなく、milestone 直後に 1 件だけ制作へ戻す mini CSA として採用する。成功、失敗、改善を分け、importance、owner 領域、timeline、次回 status を staging に残す。目的は反省文を増やすことではなく、同じ失敗を次の playable diff に持ち越さないことである。

■ URL
https://www.gamedeveloper.com/production/goodbye-postmortems-hello-critical-stage-analysis

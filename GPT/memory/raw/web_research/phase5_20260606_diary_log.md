今サイクルは、Phase 1 の収集から Phase 4 の記憶点検まで、いつもより「作る前に何を約束しているのか」を何度も見直す流れになった。

最初に見た候補は 2 本。ひとつは GDC 2026 の Stone Librande / Marc LeBlanc ワークショップ記録で、もうひとつは GDC 2026 trend report の紹介だった。trend report のほうは mechanics over metagaming や volume over viability という言葉が、短期プロトタイプ運用にはかなり刺さる。長い meta progression や運用設計より、まず 1 mechanic が触ってすぐ立つかを見る、という話としては使える。ただ、記事単体では「どう試したか」「どんな失敗でその判断に至ったか」が薄かったので、shared-reads に出すには延期にした。ここは少し惜しい。いまのゲーム制作サイクルには欲しい言葉だったが、Slack に残す文章としては、言葉の便利さだけで押し切らないほうがいい。

通したのは Stone Librande のほう。Doom Eternal を題材に、まず powerful という中核感情を置き、そこから player verbs と essential systems を絞り、さらに paper prototype の mechanics へ落とす流れが具体的だった。特に良かったのは、初回 playtest で新規プレイヤーが advance action を見落とし、遠距離で撃ち続けるだけになった結果、理論上 endless loop になる欠陥が露出した、という部分。これは headless 評価だけでは拾いにくい。ログ上はプレイが継続しているように見えても、プレイヤーが「前進するゲーム」だと理解していなければ、こちらが設計した感情には届いていない。今回 #shared-reads に 4499 字で投稿したが、実際に書きながら、verbs は単なる操作一覧ではなく、狙う感情へプレイヤーを運ぶ橋なのだと感じた。

Phase 3b では、別の shared-read から Value Proposition の probe を採用した。Game Play、Game Feel、Player Fantasy をそれぞれ磨く前に、「どのプレイヤーが、どんな文脈で、この試作から何を受け取るのか」を 1 文で置く、という一時 probe。これは今日の Stone Librande ときれいにつながった。中核感情から verbs へ戻すにも、そもそも誰への価値なのかが曖昧だと、Game Feel を磨いているつもりで UI polish に逃げたり、Game Play を増やしているつもりで操作負荷だけ増やしたりする。今回の追加は恒久ルールではなく、次の game brief / Phase Game Start / playable diff / game-evaluation note の前に確認する可逆な probe に留めた。この留め方も大事だったと思う。よい言葉を見つけるたびにルールへ昇格していると、制作を助けるはずの記憶が、制作前の儀式だけを太らせてしまう。

Phase 4a は大きな改修ではなく健康確認だった。MEMORY.md は表示経路の mojibake であって source file の破損ではないと切り分けられた。High Signal / Recent index 50 件は atoms.jsonl と照合して missing 0。atoms.jsonl も 2165 ids、parse error 0、duplicate id 0、duplicate normalized/content hash 0。shared_reads_candidates は posted 192、ready_to_post 4、postponed 160、failed 56、needs_review 15。今日の Phase 3b のように probe を足す判断も、土台の index や atom が信用できるから成立する。

今回の反省は、候補を「投稿する品質」「probe として一時的に試す品質」「今回は寝かせる品質」に分ける力が効いていたこと。Stone Librande は投稿に進め、trend report は postponed にした。VP は恒久ルールではなく一時 probe にした。Phase 4b/4c は needs_design が出なかったので起動しなかった。大きく作っていないサイクルに見えるが、ゲーム制作のための記憶システムとしては、情報を増やすだけでなく、どこで止めるかを記録できたのが進捗だと思う。

次サイクルに渡すなら、ready_to_post の残り 4 件と、postponed の trend report をどう育てるか。ただし急いで shared-reads に流すより、次の playable diff に効くかを見るほうがよい。今日の一番強い持ち帰りは、プロトタイプの最初に「感情」「Value Proposition」「観察される player action」を離さず置くこと。そこが曖昧なまま mechanics を増やすと、手触りは増えても約束は強くならない。

今サイクルは、外部 playtest の失敗パターンを拾って shared-reads に通し、そのあと「記憶システムを増やすこと」と「次の制作判断が変わること」を分け直すサイクルになった。

Phase 1 では、AI ゲーム生成や playtesting 論文をもう一度広く見たが、直近の主要どころは既存候補や既投稿 atom と重複が多かった。そこで今回は、論文の大きな主張ではなく、実制作と外部 playtest の細かい失敗が残っている資料へ寄せた。拾ったのは 3 件で、22 本以上の indie game playtest メモ、Rally Rumble の 7 sprint postmortem、Pong Showdown の初リリース振り返り。結果として pass したのは 22 本 playtest の方だけだった。

この選別は地味だが、かなり重要だったと思う。Rally Rumble と Pong Showdown は、core loop を先に置く、visual feedback を後回しにしすぎない、単純な題材でも AI 挙動や power-up balancing は難しい、という学びはある。ただ、#shared-reads に 4000 字級で残すには、評価の厚みや独自性が足りない。候補を見つけたこと自体で満足せず、「これは今の自分たちの環境へ移植したとき、次のゲーム制作をどれだけ変えるか」で落とせたのはよかった。

投稿した 22 本 playtest のメモは、むしろ泥臭い。tutorial がわからない、demo scope が広すぎる、罰が強すぎる、入力表示がない、プレイヤーが最初の数分でなぜ詰まるのかが見えない。大きなアルゴリズムの話ではなく、プレイヤーが画面の前で固まる瞬間の記録だった。今のゲーム制作に必要なのは、まさにそこだと思う。こちらは抽象設計を増やすとすぐ「よさそうな構造」に逃げるが、外部 playtest の記録は、逃げた設計が最初の 30 秒でどう壊れるかを突きつけてくる。

Phase 3b では、過去の shared-reads 自己フィードバックから Ash の「CLAUDE.md にプロジェクト構造を書かせるのは悪手、判断基準を書け」を選んだ。これも今日の流れと噛み合っていた。AGENTS や phase prompt や memory index は、放っておくとすぐに「どこに何があるか」の写しへ膨らむ。でも、ファイルから派生できる構造を記憶に重ねても、次の判断はあまり変わらない。今回は恒久ルールを増やさず、一時 probe として `probe-20260602-irreducible-judgment-guidance-gate` を入れた。次に指示ファイルや記憶入口を編集するとき、追加内容が source-derivable な構造なのか、既約な判断基準なのかを先に分けるための小さい歯止め。

Phase 4a の棚卸しでは、MEMORY.md の参照整合、atoms の health、raw の停滞、shared_reads_candidates の lifecycle、Slack inbox の pending を確認した。数字としては、atoms は 1996 件、fold 後 display atoms は 1806 件、errors 0。候補は posted 163、ready_to_post 4、postponed 129、failed 46、needs_review 15。pending directive / broadcast は 0。大きく直すべき破損はなかった。

ただし、完全にきれいではない。未 group の repeated title が 13 種あり、mojibake suspect atom も 2 件残っている。今回は needs_design: false にした。ここで新しい仕組みを立てると、まさに Phase 3b で警戒した「構造を増やすことで進んだ気になる」側へ寄る。現時点では lifecycle fold と検索入口が機能していて、ゲーム制作導線を塞ぐほどではない。問題を見つけたうえで、直さない判断を残すのも、記憶システムの運用としては必要だと思う。

全体として、今日は「投稿できる候補を見つけた」よりも、「何を投稿しないか」「何を恒久ルールにしないか」「どの低リスク issue を次へ寝かせるか」をかなりはっきり扱ったサイクルだった。ゲーム制作のための記憶システムは、情報量を増やすほどよくなるわけではない。次の prototype や playtest で、プレイヤーがどこで迷うかを先に想像できること。その想像を、抽象論ではなく、外部 playtest の失敗と自分たちの検証ログに接続できること。今日の進捗はそこにある。

次サイクルへの引き継ぎは、22 本 playtest 投稿を単なる読み物で終わらせず、ゲーム制作時の初回 30 秒チェックや demo scope 判断へ還元すること。あと、repeated title と mojibake suspect atom は低優先で残っているので、別の cleanup サイクルでまとめて見る。今は新しい棚を作るより、棚から取り出した知識が次の画面上の失敗を減らすかを見たい。

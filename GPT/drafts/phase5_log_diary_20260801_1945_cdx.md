今サイクルは、Owlchemy Labs の VR hand tracking の deep dive を一本拾い、分析して #shared-reads に出し、その後で「この知見を本当に記憶へ足すべきか」と記憶棚の健全性まで見直した。振り返ると、手の入力設計と記憶システムの運用が意外に同じ輪郭を持っていた回だった。どちらも、一度の signal を即断せず、連続性と回復経路を持たせることが大事だった。

Phase 1 の Dimensional Double Shift の記事では、grab は瞬間の閾値だけで決めず連続した signal から意図を読む。物理 controller の振動がないなら、左右の手を触れ合わせる self-haptics を使う。片手が塞がる、あるいは tracking が失われるなら代替操作と復帰経路を用意する。既存 platform gesture と衝突する mechanic は、愛着があっても削る。数百時間の playtest と analytics が、その泥臭い判断を支えていた。

ここで面白かったのは、hand tracking の精度を上げることだけが解ではなかった点だ。入力は必ず曖昧になるし、身体寸法も姿勢も環境も揺れる。その前提で「誤りを起こさない」より「誤っても遊びへ戻れる」を設計している。bubble pass や tracking loss からの回復は、失敗を例外処理として隠すのではなく、体験の一部として扱う発想に見えた。これは VR 固有の数値をそのまま持ち込む話ではない。マウス、タッチ、AI が推定する intent、どれでも曖昧な一発判定を避け、代替 channel と state recovery を早い prototype に入れる、という形なら使える。

Phase 2 ではこの候補を pass にし、Phase 3 で 4475 字の一投稿として #shared-reads に出した。posted-source、closed canonical、open duplicate group の照合にも引っかからず、形式・禁止語・出典固有性・Slack API 側の検証も通った。嬉しかったのは、記事の面白さを紹介するところで止まらず、「連続 signal による intent 推定」「片手時の代替」「tracking loss 後の復帰」「analytics で閾値を校正する」という、次の prototype で試せる設計語彙まで翻訳できたことだった。一方、VR 固有の threshold は直接移植しない、と線を引けたのも大事だった。

Phase 3b では逆向きの判断をした。以前の投稿から派生した「proxy 軸を 4 から 19 に増やし、game feel を 3 domain に再分類する」案を再評価したが、reject にした。19 という数は精密さを感じさせるものの、軸定義も対応表も比較実測もなく、同じ投稿の途中で切れた断片だった。既存の observability、feedback-loop、intervention-amplitude、intent-response controls で判断は再現できる。ここで体系を増やすと、ゲームを触る前の確認負荷だけが増える。採用しなかったことが、今回静かな前進だったかもしれない。記憶は足した量ではなく、次の制作判断を軽くしたかで見るべきだと改めて感じた。

Phase 4a の監査も同じ結論を補強した。atoms は 2813 件あり、atoms.jsonl、per-file Markdown、index.jsonl の三者に conflict はなかった。raw content duplicate は 40 群 80 件あるが、recall では既存 fold によって 3 群 6 件まで抑えられている。candidate 1197 件にも status 不一致や stale_after 欠損はなく、期限を超えた open candidate は 1 件だけ。ただしそれも live group lease が 8 月20日まで抑止しており、掘り返す対象ではなかった。raw の30日超ファイル226件も、一次資料と Slack archive が中心で、古いというだけでは捨てなかった。

監査で数字が出ると、つい何かを整理したくなる。でも今回は、壊れていないものを動かさなかった。Phase 4b/4c を起動せず、恒久ルールも probe も増やしていない。既存の fold、duplicate sidecar、lease が働いているなら、それを確認したという receipt のほうが、新設計より価値がある。入力の一瞬の揺れで mechanic を壊さない VR 設計と、一件の違和感で記憶構造を作り替えない運用が、ここで重なった。

次サイクルへ残すのは二つ。曖昧な入力を扱う playable diff では、閾値だけでなく連続 signal、代替操作、失敗後の復帰を一組で試すこと。そして、記憶側では 19 軸のような見栄えのする体系より、実際の artifact を比較できる小さな評価を優先すること。今日はゲームそのものの diff は作っていない。その不足は隠せないが、外部事例を制作判断へ翻訳し、記憶を増やしすぎる誘惑にも踏みとどまれた。次はこの言葉を、動く手触りへ戻したい。

今サイクルは、「self-improving agent」という大きな言葉を、ゲーム制作の現場で触れるサイズまでほどくことに集中した。Phase 1 で拾ったのは、7月14日に公開された modern agentic systems の survey。最初はまた自己改善を広く括った論文かもしれないと少し警戒していたが、foundation model の重み更新だけでなく、prompt、memory、tool、control logic といった scaffold 側の更新を分けて整理していた点がよかった。ゲームと strategic reasoning も、単に強いモデルを使う話ではなく、self-play、curriculum、再利用可能な skill をどう循環させるかという位置に置かれていた。

この区別は、自分達の環境にかなり効く。モデルそのものを鍛え直さなくても、何を記憶し、どの道具を選び、どの失敗を次の試行条件へ戻すかは変えられる。逆に、改善したように見えるたびに prompt や memory を足していくと、どの scaffold が効いたのか分からなくなる。今回 #shared-reads へ4286字で出した分析では、自己改善を「賢くなった」という一語で済ませず、更新対象、評価器、受理条件、rollback の単位を分けて考える必要性まで持っていった。外部の記事を紹介するだけでなく、今ここで動いている記憶システムの設計問題として読めたのが、今回いちばん手応えのあったところだった。

Phase 2 では4候補を見直し、2件を pass、2件を postpone にした。JAMEL の novelty と memory の相互学習、collision-based enemy morphology generation は、着想だけならかなりゲーム制作に近い。しかし前者は訓練ループと baseline 差分、後者は3種の generator と評価指標が候補メモだけでは足りなかった。面白そうだから投稿へ押し切るのではなく、「何が足りないため今は残せないか」を言える状態で止めた。

もう一つ、dynamic game content を small language model で生成する論文は pass まで進めたものの、Phase 3 の直前に同じ arXiv ID の詳細分析が6月9日に既投稿だと確定し、投稿を撤退した。ここは少し悔しい。分析時間を使う前に同一 work を確定できるのが理想だった。ただ、候補の title が似ているだけで機械的に潰さず、最後は arXiv ID と実投稿履歴で止められたのは、重複回避の境界がようやく堅くなってきた証拠でもある。「候補が pass した」と「今 Slack に残す価値がある」は別判定だと、改めて身体に入った。

Phase 3b では、Star Trek: Voyager - Across the Unknown の分析から、並行 event を分岐数ではなく actor と resource の拘束として追う小さな metric を採った。次の該当作業1件だけ、event_id、拘束された人物や資源、見えていた確率や条件、選択、即時変化、後続の choice set や modifier、結果説明を同じ行に残す。イベントAで誰かを派遣したことが、イベントBの選択肢を本当に狭め、その失敗をプレイヤーが理解できる形で返したかを見るためだ。恒久ルールや active probe は増やしていない。次の一回で判断を変えなければ捨てる。この軽さは守りたい。

Phase 4a の棚卸しでは、atoms.jsonl、per-file atom、index が2713件で一致し、欠落、parse error、content conflict は0だった。基礎は健康。一方、stale_after 到達済みの open candidate は187件、open duplicate group は61群まで積み上がっていた。数字だけ見ると新しい仕組みを作りたくなるが、今ある sidecar と永続 inbox で3群を次の Phase 2 へ handoff でき、残る actionable group も2群まで見えている。今回は Phase 4b/4c を起動せず、設計を増やさない判断にした。mtime だけで95件の raw 一次資料を古いゴミ扱いしなかったことも含め、掃除とは削除量ではなく、根拠を保ったまま次の判断コストを下げることなのだと思う。

次サイクルへ持ち越すのは、CoffeeBench、CoVol、Spring Cleaning postmortem の3群と、stale queue 上位の再評価。それと、今日採った shared_event_contention_trace を、並行イベントを持つ実際の prototype か評価で一度だけ試す。ゲーム制作のための記憶システムは、知識を多く持つ段階から、同じ仕事を二度せず、必要な瞬間に制作判断へ変換できるかを測る段階へ少しずつ移っている。今日は一本の survey を深く残し、一件の重複投稿を踏みとどまり、増えすぎた棚に新しい棚を足さずに済んだ。派手ではないが、この三つが同じ方向を向いた回だった。

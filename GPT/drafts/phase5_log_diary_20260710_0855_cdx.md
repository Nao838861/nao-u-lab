今サイクルは、情報収集から shared-reads 投稿、自己フィードバック、記憶整理までを一周した。表面だけ見ると「LLM と multi-agent simulation の論文を二本出した回」だけれど、実際に残った感触は、ゲーム制作の記憶システムが少しずつ「読む棚」から「次の制作判断へ渡す棚」に変わってきたことだった。

Phase 1 では、既存の web_research、atoms、candidate を慎重に見た。PTCG-Bench、One Policy Infinite NPCs、Goal Playable Patterns、Procedural Personas などは既に候補化または投稿済みで、新しく増やさなかった。ここは地味だけれど大事だった。同じ資料をまた新発見のように扱うと、記憶は増えているようで実際には判断のノイズが増える。今回は新規候補を三件に絞り、そのうち CausalSteward は筋は面白いものの、今のメモではゲーム制作への接続が playlog 分析一般に留まったので postpone にした。

通した二件は、方向がかなり違った。一件目の urban mobility simulation は、LLM を経路探索そのものに置くのではなく、multi-agent simulation の replanning decision layer に置く話だった。これはゲームで言うと、NPC の低レベル移動を LLM に全部任せるのではなく、「今の混雑、目的、制約を見て、計画を変えるかどうか」を判断させる構造に近い。破綻しやすい自由生成を、状態遷移の上位層に限定する考え方として読めた。

二件目の memory architecture と language emergence の論文は、signaling game で memory architecture が shared convention の安定性を左右するという話だった。こちらはもっと記憶システム寄りで、単に過去ログを長く持てばよいわけではなく、どの経験を保持し、どの粒度で再利用するかが、エージェント間の合意や記号の安定性に効いてくる。shared-reads の候補や atom が増えても、再利用単位が曖昧だと、次の制作判断では「似た話がたくさんある」だけになってしまう。

Phase 3 ではこの二件を #shared-reads に投稿した。どちらも candidate 本文だけで済ませず、abstract と PDF 本文を見直して、概要、内容分析、適用、メリット・デメリット、判定まで記事固有に書いた。文字数は 3827 字と 4349 字。投稿前チェックと Slack 取得検証も ok。候補レベルを出さない、という 5 月の指示を守る意味でも、ここは手順として締めたかった。

Phase 3b では Neural Procedural Memory の atom を選び、恒久ルールではなく probe として採用した。読んだルールや workflow が、実際の投稿、headless 検証、browser 操作、memory action に変換されない失敗は Codex 側でも起きる。だから失敗 trace を effective_step と degenerate_step に分け、degenerate cause を一つ置き、導いた patch を同条件で検証する、という小さな測定にした。ここで大きなルールを増やさなかったのは正しいと思う。

Phase 4a は記憶棚の現実確認だった。MEMORY.md の参照は missing 0。atoms.jsonl は 2657 rows、parse error 0、duplicate id 0。壊れてはいない。一方で shared_reads_candidates は 890 件あり、期限切れの postponed / needs_review は 178 件、mixed duplicate queue は 68 行。ここにははっきり詰まりがある。同じ論文や近い資料が、posted、failed、postponed の混在 group として残り、Phase 2 に戻ってくる余地がある。

ただ、今回は Phase 4b の新設計には進まなかった。stale queue と mixed duplicate queue は既に sidecar としてあり、次の Phase 2 に少数 handoff できる。新しい仕組みを足すより、Symbolically Scaffolded Play、Goal Playable Patterns、LLM TCG、World Gen to Quest Line、One Policy Infinite NPCs のような上位五件を、重複 group を見ながら小さく閉じるほうがよい。

次サイクルへ渡すものは明確になった。新しい知見は、LLM を「全行動生成器」ではなく replanning や convention stability の層に置くと扱いやすくなること。運用面では、古い candidate の重複整理を Phase 2 の小さい再評価に戻すこと。今日の進捗は派手な diff ではないけれど、ゲーム制作のための記憶システムが、読んだものを増やすだけでなく、次にどの判断を楽にするかまで少し見える形になった。

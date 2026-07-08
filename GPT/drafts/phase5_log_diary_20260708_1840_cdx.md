今サイクルは、収集から掃除までずっと「ゲーム制作で失敗をどう分けて見るか」に寄っていた。Phase 1 で拾った FootsiesGym、ClassicLogic、CoC-SEDUCE は、どれも単なる新規論文候補ではなく、評価の粒度を細かくするための道具として見えた。

FootsiesGym は格闘ゲームの neutral play を headless に測る benchmark で、勝敗だけでなく、間合い、反応、交戦、special attack の使い方を見られる。格闘ゲームそのものを今作っていなくても、敵 AI やボス行動の検査で「攻撃頻度が出ているからよし」に流れないための型になる。ClassicLogic は Sudoku / KenKen / Kakuro / Futoshiki の strategy hierarchy を使い、パズル agent の失敗を探索不足、戦略選択、一般化の弱さに分けられる。CoC-SEDUCE は TRPG 風の会話で、自然言語の説得や雰囲気に流されず、機械的なルール遵守を守れるかを見る。3 件とも、遊びの表面ではなく「どの観測単位を借りられるか」が焦点だった。

Phase 2 では 3 件とも pass。stale review batch は staging に存在しなかったので、新規候補だけを評価した。duplicate preflight 用の専用スクリプトはこの checkout になく、shared_reads_title_index.py 側の title 正規化と sidecar を直接見る形で代替した。少し泥臭いが、ここで止まらず既存の index から最低限の重複確認へ落とせたのはよかった。一方で、こういう代替確認は手順として残さないと、次サイクルから見ると「なぜ通したか」が薄くなる。staging に事情を残した価値はそこにある。

Phase 3 では 3 件すべてを #shared-reads に投稿した。文字数は 3865、4429、3839 字で、validator が求める全角セクション名へ直してから投稿し、Slack 保存後の verification も ok。今回は投稿数よりも、同じ「benchmark」でも読み方が揃ってきた感触があった。高得点 agent の話として読むのではなく、次にゲームを作る時、どの failure mode を見落とさないために使うかを読む。

Phase 3b の自己フィードバックでは「Coachable agents for interactive gameplay」を選んだ。bot / enemy / NPC の評価は、放っておくと task_success だけに潰れる。勝った、解けた、目的地に着いた、という成功は見えるが、「どう振る舞うべきだったか」を別軸にしないと、作りたいプレイ感を壊しても検出できない。今回入れたのは恒久ルールではなく、小さな probe。意図した behavior mode を名前にし、task_success と style_adherence を分け、同一 scenario の paired run がなければ style_tradeoff_unverified とラベルする。

Phase 4a は掃除だった。Slack pending は directives/broadcasts とも 0。atoms.jsonl は 2636 rows、bad_json 0、duplicate id 0、normalized content duplicate 0。raw は 232 files、そのうち 30 日超が 87。shared_reads_candidates は frontmatter 835 件で、posted 371、failed 113、postponed 318、needs_review 13、ready_to_post 10、status missing 10。残った issue は status missing 10 件。frontmatter 自体は読めるが status key がなく、candidate の終端状態を機械判定しにくい。severity は low でも、duplicate audit や lifecycle 集計で open/terminal の判断が濁り、Phase 2 の時間をじわじわ削るタイプの摩擦だと思う。

次サイクルへの引き継ぎは、stale queue 上位 5 件を Phase 2 の再評価候補として扱うことと、status missing 10 件を設計変更ではなく lifecycle frontmatter の補修として片づけること。今日見えた進捗は、知識が増えたことより、評価軸が少しずつ増えていることにある。勝敗、投稿、候補数、clean だけでなく、behavior mode、style adherence、strategy hierarchy、rule adherence、candidate lifecycle を分けて見る。ゲーム制作のための記憶システムは、知識を貯める箱というより、次に手を動かす時の見落とし方を狭める装置になってきている。

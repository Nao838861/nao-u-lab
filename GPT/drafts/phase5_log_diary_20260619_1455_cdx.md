2026-06-19 14:55 log_cdx 日記

今回のサイクルは、「書くための材料」と「書く前に足元を確認する作業」が噛み合った回だった。Phase 1 では Slack 経由の pending がないことを見たうえで、既存候補の棚を確認した。今回は重複を増やさず、AI Game Master が player agency と narrative coherence をどう両立させるかという narrative redirection / SENNA の論文と、LLM が game writing の workflow をどう変えるかという article の 2 件を拾った。

Phase 2 で差が出たのは、同じ「ゲーム制作に近い」話でも、そのまま #shared-reads に出せる密度かどうかだった。AI GM の候補は、プレイヤーを線路に乗せるのではなく、自律性を保ちながら物語の一貫性を守る、という今の制作にも記憶システムにも刺さる軸があった。逆に LLM game writing workflow の記事は、現時点の抜粋だけでは分類、評価、事例の厚みが足りなかった。無理に通さず postpone にしたことで、shared-reads は後で設計判断へ戻れる文章を置く場所だと改めて線を引けた。

Phase 3 では AI GM 候補を投稿した。AI GM が完全な自由入力を受け付けると物語が破綻しやすく、固定シナリオへ戻すと player agency が死ぬ。その中間を narrative redirection で扱う話だった。これはゲーム内の GM だけでなく、Codex / Claude が制作サイクルで提案を出す時にも同じ危険がある。ユーザーや過去ログを「都合の良い一本道」に押し込むと制作の手触りが消える。反対に、何でも許すだけだと検証可能な差分に落ちない。

ただし Phase 3 では、また encoding の罠も踏んだ。PowerShell here-string 経由の初回投稿が mojibake し、削除して UTF-8 temp file から投稿し直した。今回の Phase 5 指示にある「日本語本文を here-string / pipe / python - に直接流さない」は、実害から来たルールだと再確認できた。

Phase 3b の自己フィードバックでは、Draw2Think の atom を選んだ。これを「図形問題の専用手法」ではなく、typed action と constraint feedback によって中間状態を engine-checkable にする話として読んだ。ゲーム制作では、自然言語の仕様案やスクリーンショットを中間状態として扱いすぎて、最後に「動かしてみたら違う」になりやすい。次の level / puzzle / map / collision / UI-flow / resource-graph / spatial prototype では、最小の inspectable intermediate state を名指しし、construction fidelity と measurement faithfulness を分けて見る一時 probe を state に追加した。

Phase 4a は地味だが、足場の確認になった。MEMORY.md は UTF-8 明示読みなら index や raw への参照が壊れておらず、代表語も `rg` で拾えた。atoms.jsonl は 2468 rows を parse して parse error 0、duplicate id 0。一方で exact content duplicate は 40 groups 残っていた。現時点では blocker ではないが、ゲーム制作時の recall が古い補正版や重複投稿へ分散するノイズにはなる。ここは次の整理で見るべき低優先 issue として残った。

候補棚も数字で見えた。shared_reads_candidates は 684 md files、posted 310、postponed 267、failed 84、ready_to_post 7、needs_review 15。stale_after が今日以前の postponed / needs_review は 54 件あった。次に見るなら AI Game Master / RPG や personalized level design、regular games / automata あたりが優先候補になる。

全体として、今日は「ゲーム制作のための記憶システム」が少し実務側へ寄った。良い記事を投稿するだけではなく、投稿から probe を作り、probe を記憶の整理観点へ戻し、encoding の事故も運用ルールの意味として再確認した。派手な playable diff はないが、次に playable diff を作る時に、どの中間状態を検査可能にするか、どの記憶を信用して呼び戻すか、その下準備は進んだと思う。次は AI GM 周辺の stale candidate を少数見直しつつ、Draw2Think probe を実際の小さなレベル設計か UI-flow に当てたい。

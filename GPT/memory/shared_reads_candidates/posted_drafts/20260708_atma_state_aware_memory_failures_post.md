■ 概要
「A-TMA: Decoupling State-Aware Memory Failures in Long-Term Agent Memory」は、LLM エージェントの長期記憶が「古い事実を残すべきか消すべきか」ではなく、「古い事実・現在の事実・遷移情報をどの状態として扱うか」を失敗しやすい、という問題を扱う論文。論文はこの失敗を ghost memory と呼ぶ。たとえば住所、仕事、好み、計画のようなユーザー事実は変わる。昔の住所は、過去について聞かれた時には正しい。しかし今の配送先を聞かれた時に同じ住所を答えると誤りになる。遷移メモも「何が変わったか」を説明するには有用だが、現在値として扱うと壊れる。

中心は、memory failure を bank maintenance、retrieval、answer-time resolution の 3 層に分けること。bank 層では旧状態と現状態が保存されているか、かつ state role が見えるかを問う。retrieval 層では、質問が求める current / historical / change view に合った evidence packet が取れているかを問う。answer 層では、証拠が渡っているのにモデルが状態を取り違えていないかを問う。提案手法 ATMA は既存 memory system を置き換えず、state-aware overlay を被せる。superseded fact や transition link を保存し、query の state view を推定し、retrieved evidence に current memory、historical memory、transition memory などのラベルを付けて QA に渡す。

評価では、状態衝突を重くした LTP (LoCoMo Temporal Plus) と、長期会話 benchmark の LoCoMo を使う。LTP は 10 profiles、800 probes で、旧状態と現状態が同じ bank に共存する final bank 評価として設計されている。Graphiti+ATMA は LTP の conflict accuracy を 0.480 から 0.720 へ上げ、LoCoMo では temporal F1 を 0.0295 から 0.1705 へ上げる。効果は host 依存で、Ariadne のように別指標で強い system もあるが、最終 QA accuracy だけでは bank・retrieval・answer のどこで ghost memory が起きたか隠れる、という問題設定はかなり強い。

■ 内容分析
この論文の良さは、古い記憶を削除すれば解決、という単純化を避けているところにある。実運用では古い事実も必要になる。ゲーム制作の仕様変更でも、旧仕様はなぜ変更したかを説明する証拠になるし、過去の playtest 結果を解釈するには当時のルールが必要になる。したがって問題は保持量ではなく state coordination。bank に残す、retrieval で選ぶ、answer で使う、の 3 段階で状態の意味がずれる。

ATMA はこのずれを、state role を明示する overlay として扱う。bank 側では host memory の記録を preserve しつつ、旧値・現値・遷移を supersession や transition link で結ぶ。retrieval 側では rule-based query profiler で current / historical / change / neutral を推定し、host retrieval の候補に state metadata や link expansion を加えて evidence packet を作る。QA 側では retrieved row に状態ラベルを付け、回答モデルに requested state view を守らせる。重要なのは、timestamp だけでは state role とみなさない点。新しい timestamp はヒントになるが、それだけでは「旧値として保存されている」「現値として有効」「遷移説明」という役割を保証しない。

評価設計も実務的。LTP は chronological replay stream を memory system に流し、最終 bank を作った後、追加 write なしで probe に答えさせる。bank coexistence、bank role、evidence support、QA accuracy、conflict accuracy、fact accuracy、judge score を分けるので、正答率だけでなく、値は保存されていたが retrieval が間違えた、retrieval は正しかったが answer が現値に引きずられた、といった原因が見える。ablation では、retrieval controller の除去は QA accuracy を少し下げ、QA state label の除去は conflict と fact の tradeoff を変える。単一 component が万能というより、層ごとに failure を測ること自体が価値になっている。

限界は、overlay が host の保存能力を超えて証拠を復元できないこと。host が旧値を捨てている、または retrieval 候補に上げられない場合、ATMA は状態ラベルだけで正答できない。また、Sentry や Judge、retrieval controller、70B judge などの評価面は重い。論文自身も gains are host dependent と述べる通り、ATMA は万能 memory substrate ではなく、state changing memory の診断・補助層として読むべき。

■ 自分達の環境への適用
我々の記憶システムには、この論文の failure mode がそのままある。shared-reads candidate は `ready_to_post`、`posted`、`postponed`、`superseded` のように状態が変わる。atoms も古い directive、後続の上書き、候補段階のメモ、Slack 投稿後の正本が混在する。ここで単に全文検索すると、古い draft の方針や旧フォーマットが現在のルールとして想起される。これは ghost memory そのもの。

導入するなら、まず重い ATMA 全体ではなく、frontmatter と recall 表示の小さな overlay から始める。candidate / atom / directive に `state_role` を持たせ、`current`、`historical`、`transition`、`superseded`、`draft_only` を明示する。次に、recall の出力時に現在判断へ使ってよい record と、履歴説明としてだけ使う record を分けて表示する。さらに、仕様変更や game prototype の rule 変更では、旧仕様を消さずに `supersedes` と `superseded_by` を結び、headless 評価ログには `ruleset_id` を残す。

ゲーム制作にも直接効く。prototype の操作方法、スコア条件、敵 AI、カメラ、勝敗条件は頻繁に変わる。古い playtest コメントが「当時の仕様では正しいが現在仕様では誤り」になる時、単純な検索は危ない。agent playtest の改善提案を使う前に、そのコメントがどの ruleset に対するものか、現在 ruleset にまだ適用できるかを分ける必要がある。小さな検証として、過去の game-rights feedback や prototype log から、現在仕様と旧仕様が混ざった質問を 20 件作り、recall が旧状態と現状態を分けて返せるかを見る。最初は LTP のような benchmark を作る必要はなく、bank coexistence、evidence support、answer state correctness の 3 指標だけでも十分に効果が見える。

■ メリット・デメリット
メリットは、記憶を削除で掃除するのではなく、状態役割を付けて履歴と現在判断を両立できること。これは shared-reads の旧投稿補正、candidate lifecycle、atoms per-file 移行、ゲーム仕様変更ログと相性が良い。最終回答の正誤だけでなく、bank に値が残っているか、retrieval が状態に合っているか、answer が取り違えたかを分けられるため、記憶システム改善の原因分析にも使える。timestamp だけでは不十分という指摘も重要で、frontmatter に lifecycle field を置く理由になる。

デメリットは、運用コストが増えること。すべての atom に state role と transition link を丁寧に付けると重い。role が粗いと false confidence を生むし、古い record を historical として残しすぎると recall 表示が読みにくくなる。また、ATMA の評価は LTP / LoCoMo という会話 memory ベンチが中心で、ゲーム仕様・Slack directive・candidate のような我々の混合記憶とは分布が違う。まず candidate lifecycle と仕様変更ログに限定するのが妥当。

■ 判定
採用。特に「古い記憶を消す/残す」ではなく「現在判断用か、履歴説明用か、遷移説明用か」を分ける方針を採用する。直近では shared-reads candidate と memory atom の recall 表示に、state role と supersession link を小さく追加する価値が高い。重い judge や retrieval controller は不要で、まずは frontmatter と headless な状態取り違えテストから始める。

■ URL
https://arxiv.org/abs/2607.01935v1

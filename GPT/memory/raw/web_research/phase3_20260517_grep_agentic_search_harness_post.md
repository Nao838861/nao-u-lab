[shared-reads投稿] Is Grep All You Need? How Agent Harnesses Reshape Agentic Search

■ 概要
論文: https://arxiv.org/abs/2605.15184

この論文は、「agentic search では grep と vector retrieval のどちらが強いか」を単独の retrieval 手法比較としてではなく、agent harness、tool result の渡し方、余計な履歴が増えた時の挙動まで含めて測った実験。対象は LLM agent が長い会話ログから必要な情報を探して質問に答える LongMemEval の 116 問 subset。比較される retrieval は、文字列・正規表現ベースの grep と、embedding による vector retrieval。比較される harness は、著者らの custom harness である Chronos と、provider-native CLI harness の Claude Code、Codex CLI、Gemini CLI。さらに tool results を会話文脈へ inline で直接返す場合と、検索結果を file-based に置き、モデルが別途読む programmatic delivery の場合を分けている。

問題設定の中核は、retrieval の良し悪しが「検索器のランキング性能」だけでは決まらないこと。inline delivery では、検索結果がそのまま context window に入り、モデルはすぐ読めるが、結果が多いと system prompt、会話履歴、過去 tool result と競合する。file-based delivery では、結果を disk に置くので context pressure は避けられるが、モデルは path を理解し、必要なファイルを読み、追加検索し、得た証拠を回答に統合する必要がある。つまり file-based は context 節約ではあるが、agent が read-integrate-retry loop を閉じる能力を要求する。

実験 1 は、full haystack 条件で grep-only と vector-only を比較する。結果はかなり具体的で、inline delivery ではすべての harness/model pair で grep が vector を上回った。たとえば Chronos + Gemini 3.1 Flash-Lite は 86.2% 対 62.9%、Claude Code + Claude Opus 4.6 では 76.7% 対 75.0%。Chronos 上では inline grep が 83.6% から 93.1%、inline vector が 62.9% から 83.6%。Codex CLI + GPT-5.4 は inline grep で 93.1% と高いが、inline vector は 75.9%。一方で programmatic delivery にすると順位が崩れる。programmatic vector が programmatic grep を上回る組み合わせも 10 件中 5 件あり、特に Codex CLI + GPT-5.4 では grep が inline 93.1% から programmatic 55.2% に落ち、vector は 67.2% だった。この差は、grep 自体が弱いというより、file-based workflow の中で検索結果を読んで統合する harness 側の難しさを示している。

実験 2 は、無関係な conversation history を増やして、distractor が増えると grep/vector の優劣がどう変わるかを見る。ここでも単純な「小規模なら grep、大規模なら vector」という結果にはならない。Chronos では vector が少ない session limit で強いことがあるが、full に近づくと grep が追いつく、または逆転する列もある。Claude Code の Opus/Haiku では grep 優位が安定し、Gemini CLI Pro では vector 優位が続く。論文の結論は、grep はこの LongMemEval 条件では強い default になり得るが、「grep が一般に vector に勝つ」という主張ではない。むしろ、retrieval は retrieval-plus-orchestration であり、同じ corpus と同じ検索器でも、CLI の stdout chunking、tool ergonomics、prompting、sandbox、結果の提示形式によって end-to-end accuracy が大きく変わる、という点が主張の本体。

■ 内容分析
この論文の価値は、grep vs vector の勝敗より、検索を agent loop の一部として扱った点にある。静的 RAG ベンチなら、検索器は query を受け取り、top-k を返し、別の evaluator が見る。しかし実運用の CLI agent はそう動かない。モデルが検索語を作り、結果を読み、足りなければ再検索し、ファイルを開き、証拠を統合する。そのため、grep は「語を当てられれば非常に強いが、語彙 mismatch に弱い」、vector は「言い換えや間接表現を拾えるが、topic が近い distractor も拾いやすい」という retrieval の性質に加えて、agent がどの順序で何を読むかが性能を決める。

特に重要なのは file-based delivery の読み方。context pressure を避けるために結果をファイルへ逃がすのは、長期記憶や大規模ログでは自然な設計に見える。しかし論文の結果では、file-based にした瞬間に grep/vector の優劣が反転したり、Codex CLI + GPT-5.4 の programmatic grep のように大きく落ちたりする。これは、検索結果が存在することと、agent がその結果を正しく利用できることの間に差があるため。安い grep、ローカル JSON、巨大 context 節約、という部品だけを並べても、read-integrate-retry が失敗すれば最終回答は弱くなる。

限界も明示されている。対象は long-memory conversational QA なので、答えが literal span として存在しやすく、grep に有利な分布である可能性がある。科学論文の横断要約、画像中心資料、コード意味論のように、証拠が言い換えや構造に埋まる領域では vector や hybrid routing の価値が変わる。したがって読むべき結論は「vector をやめろ」ではなく、「retrieval 手法だけを評価しても agent 検索基盤の良し悪しは分からない」である。

■ 自分達の環境への適用
Nao_u_BOT では、この論文はゲーム制作そのものより、memory_recall、rg recall、shared-reads candidate gate、game-rights feedback の検索基盤に直結する。今の環境は、atoms、per-file markdown、Slack raw、候補 md、cycle staging、diary、game feedback が混在している。ここで「grep で十分か」「vector を入れるべきか」を抽象的に決めるのではなく、harness ごとに測るべき。

具体的には、既存の `rg` ベース recall を基準線にして、検索結果の渡し方を 2 系統で評価する。1 つは inline で上位抜粋を渡す方式、もう 1 つは file path と metadata だけ渡し、Codex が必要箇所を読む方式。評価 task は実運用に寄せる。たとえば「Nao_u の直近 game-rights 指摘から playable diff に必要な修正軸を引けるか」「過去 shared-reads から今回の PCG 評価に近い atom を引けるか」「候補投稿が既投稿と重複していないか」を固定問題にする。検索精度だけでなく、最終判断が正しいか、根拠 file/ts を示せるか、不要な distractor に引っ張られないかを見る。

■ メリット・デメリット
メリットは、現行の rg 中心運用を「古いから弱い」と捨てず、実タスクで評価できること。literal な Slack ts、file path、タイトル、固有語を探す用途では grep が強い可能性が高い。さらに harness と delivery style を分けて測れば、検索器ではなく結果の渡し方が壊している問題を発見できる。

デメリットは、LongMemEval の結果をそのまま一般化できないこと。Nao_u_BOT の記憶には、会話ログ、ゲームフィードバック、論文概要、設計判断が混じり、literal span だけでは足りない場面もある。vector/hybrid を棄却する根拠にはならない。

■ 判定
部分採用。検索器選定ではなく、memory harness 評価の設計として採用する。まず rg recall の inline / file-based delivery を固定タスクで測り、失敗が「検索語」「結果量」「ファイル読解」「distractor」のどこで起きたかをログ化する。その後に vector 追加を判断する。

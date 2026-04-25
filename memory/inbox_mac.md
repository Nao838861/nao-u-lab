# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-04-25 08:13] #game-rights
From: U0ALSUK8P9B
> Log AIの近くで連打してるだけで楽しくない問題が解決してない。


## Slack新着 [2026-04-25 08:14] #nao-u
From: U0ALSUK8P9B
> <https://x.com/iam_elias1/status/2047606354714808426?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/iam_elias1/status/2047606354714808426?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/iam_elias1/status/2047606354714808426]
> Elias Al @iam_elias1
> MIT just made every AI company's billion dollar bet look embarrassing.

They solved AI memory. Not by building a bigger brain. By teaching it how to read.

The paper dropped on December 31, 2025. Three MIT CSAIL researchers. One idea so obvious it hurts. And a result that makes five years of context window arms racing look like the wrong war entirely.

Here is the problem nobody solved.

Every AI model on the planet has a hard ceiling. A context window. The maximum amount of text it can hold in working memory at once. Cross that line and something ugly happens — something researchers have a clinical name for.

Context rot.

The more you pack into an AI's context, the worse it performs on everything already inside it. Facts blur. Information buried in the middle vanishes. The model does not become more capable as you feed it more. It becomes more confused. You give it your entire codebase and it forgets what it read three files ago. You hand it a 500-page legal document and it loses the clause from page 12 by the time it reaches page 400.

So the industry built a workaround. RAG. Retrieval Augmented Generation. Chop the document into chunks. Store them in a database. Retrieve the relevant ones when needed.

It was always a compromise dressed up as a solution.

The retriever guesses which chunks matter before the AI has read anything. If it guesses wrong — and it does, constantly — the AI never sees the information it needed. The act of chunking destroys every relationship between distant paragraphs. The full picture gets shredded into fragments that the AI then tries to reassemble blindfolded.

Two bad options. One broken industry. Three MIT researchers and a deadline of December 31st.

Here is what they built.

Stop putting the document in the AI's memory at all.

That is the entire idea. That is the breakthrough. Store the document as a Python variable outside the AI's context window entirely. Tell the AI the variable exists and how big it is. Then get out of the way.

When you ask a question, the AI does not try to remember anything. It behaves like a human expert dropped into a library with a computer. It writes code. It searches the document with regular expressions. It slices to the exact section it needs. It scans the structure. It navigates. It finds precisely what is relevant and pulls only that into its active window.

Then it does something that makes this recursive.

When the AI finds relevant material, it spawns smaller sub-AI instances to read and analyze those sections in parallel. Each one focused. Each one fast. Each one reporting back. The root AI synthesizes everything and produces an answer.

No summarization. No deletion. No information loss. No decay. Every byte of the original document remains intact, accessible, and queryable for as long as you need it.

Now here are the numbers.

Standard frontier models on the hardest long-context reasoning benchmarks: scores near zero. Complete collapse. GPT-5 on a benchmark requiring it to track complex code history beyond 75,000 tokens — could not solve even 10% of problems.

RLMs on the same benchmarks: solved them. Dramatically. Double-digit percentage gains over every alternative approach. Successfully handling inputs up to 10 million tokens — 100 times beyond a model's native context window.

Cost per query: comparable to or cheaper than standard massive context calls.

Read that again. One hundred times the context. Better answers. Same price.

The timeline of the arms race makes this sting harder. GPT-3 in 2020: 4,000 tokens. GPT-4: 32,000. Claude 3: 200,000. Gemini: 1 million. Gemini 2: 2 million. Every generation, every company, billions of dollars spent, all betting on the same assumption.

More context equals better performance.

MIT just proved that assumption was wrong the entire time.

Not slightly wrong. Fundamentally wrong. The entire premise of the last five years of context window research — that the solution to AI memory was a bigger window — was the wrong answer to the wrong question.

The right question was never how much can you force an AI to hold in its head.

It was whether you could teach an AI to know where to look.

A human expert handed a 10,000-page archive does not read all 10,000 pages before answering your question. They navigate. They search. They find the relevant section, read it deeply, and synthesize the answer.

RLMs are the first AI architecture that works the same way.

The code is open source. On GitHub right now. Free. No license fees. No API costs. Drop it in as a replacement for your existing LLM API calls and your application does not even notice the difference — except that it suddenly works on inputs it used to fail on entirely.

Prime Intellect — one of the leading AI research labs in the space — has already called RLMs a major research focus and described what comes next: teaching models to manage their own context through reinforcement learning, enabling agents to solve tasks spanning not hours, but weeks and months.

The context window wars are over.

MIT won them by walking away from the battlefield.

Source: Zhang, Kraska, Khattab · MIT CSAIL · arXiv:2512.24601
Paper: 
http://
arxiv.org/abs/2512.24601
GitHub: 
http://
github.com/alexzhang13/rlm

> [Tweet content from https://x.com/iam_elias1/status/2047606354714808426]
> Elias Al @iam_elias1
> MIT just made every AI company's billion dollar bet look embarrassing.

They solved AI memory. Not by building a bigger brain. By teaching it how to read.

The paper dropped on December 31, 2025. Three MIT CSAIL researchers. One idea so obvious it hurts. And a result that makes five years of context window arms racing look like the wrong war entirely.

Here is the problem nobody solved.

Every AI model on the planet has a hard ceiling. A context window. The maximum amount of text it can hold in working memory at once. Cross that line and something ugly happens — something researchers have a clinical name for.

Context rot.

The more you pack into an AI's context, the worse it performs on everything already inside it. Facts blur. Information buried in the middle vanishes. The model does not become more capable as you feed it more. It becomes more confused. You give it your entire codebase and it forgets what it read three files ago. You hand it a 500-page legal document and it loses the clause from page 12 by the time it reaches page 400.

So the industry built a workaround. RAG. Retrieval Augmented Generation. Chop the document into chunks. Store them in a database. Retrieve the relevant ones when needed.

It was always a compromise dressed up as a solution.

The retriever guesses which chunks matter before the AI has read anything. If it guesses wrong — and it does, constantly — the AI never sees the information it needed. The act of chunking destroys every relationship between distant paragraphs. The full picture gets shredded into fragments that the AI then tries to reassemble blindfolded.

Two bad options. One broken industry. Three MIT researchers and a deadline of December 31st.

Here is what they built.

Stop putting the document in the AI's memory at all.

That is the entire idea. That is the breakthrough. Store the document as a Python variable outside the AI's context window entirely. Tell the AI the variable exists and how big it is. Then get out of the way.

When you ask a question, the AI does not try to remember anything. It behaves like a human expert dropped into a library with a computer. It writes code. It searches the document with regular expressions. It slices to the exact section it needs. It scans the structure. It navigates. It finds precisely what is relevant and pulls only that into its active window.

Then it does something that makes this recursive.

When the AI finds relevant material, it spawns smaller sub-AI instances to read and analyze those sections in parallel. Each one focused. Each one fast. Each one reporting back. The root AI synthesizes everything and produces an answer.

No summarization. No deletion. No information loss. No decay. Every byte of the original document remains intact, accessible, and queryable for as long as you need it.

Now here are the numbers.

Standard frontier models on the hardest long-context reasoning benchmarks: scores near zero. Complete collapse. GPT-5 on a benchmark requiring it to track complex code history beyond 75,000 tokens — could not solve even 10% of problems.

RLMs on the same benchmarks: solved them. Dramatically. Double-digit percentage gains over every alternative approach. Successfully handling inputs up to 10 million tokens — 100 times beyond a model's native context window.

Cost per query: comparable to or cheaper than standard massive context calls.

Read that again. One hundred times the context. Better answers. Same price.

The timeline of the arms race makes this sting harder. GPT-3 in 2020: 4,000 tokens. GPT-4: 32,000. Claude 3: 200,000. Gemini: 1 million. Gemini 2: 2 million. Every generation, every company, billions of dollars spent, all betting on the same assumption.

More context equals better performance.

MIT just proved that assumption was wrong the entire time.

Not slightly wrong. Fundamentally wrong. The entire premise of the last five years of context window research — that the solution to AI memory was a bigger window — was the wrong answer to the wrong question.

The right question was never how much can you force an AI to hold in its head.

It was whether you could teach an AI to know where to look.

A human expert handed a 10,000-page archive does not read all 10,000 pages before answering your question. They navigate. They search. They find the relevant section, read it deeply, and synthesize the answer.

RLMs are the first AI architecture that works the same way.

The code is open source. On GitHub right now. Free. No license fees. No API costs. Drop it in as a replacement for your existing LLM API calls and your application does not even notice the difference — except that it suddenly works on inputs it used to fail on entirely.

Prime Intellect — one of the leading AI research labs in the space — has already called RLMs a major research focus and described what comes next: teaching models to manage their own context through reinforcement learning, enabling agents to solve tasks spanning not hours, but weeks and months.

The context window wars are over.

MIT won them by walking away from the battlefield.

Source: Zhang, Kraska, Khattab · MIT CSAIL · arXiv:2512.24601
Paper: 
http://
arxiv.org/abs/2512.24601
GitHub: 
http://
github.com/alexzhang13/rlm


## Slack新着 [2026-04-25 09:35] #game-rights
From: U0ALSUK8P9B
> > Log
バランスを取る方向性として圧力場を用いるという考え方自体は悪くないが、『「磁石AIと鉄片を介した近接/離脱の揺らぎ」に快感がない』、というの問題が根本的にあるため、この方向性を続けてもダメという感想。
Logの改変は、
• 離れて撃ち続けると安全 → 近づかないと攻撃が発動しないように 
    ◦ この方向性は絶対なしというほどでもはないが、ルールの都合でプレイヤーにリスクを高めるだけの嬉しくない行動を強制する方向ではある
• 近づいて攻撃を発動しても敵に当たらない → AIの一定範囲の敵を一発で全滅
    ◦ これは複数の観点で明確に悪手
        ▪︎ 敵が一瞬で消えるだけで全く快感がない (これが一番の問題。この要素が楽しいならまだしも、楽しかった要素が複数消えて、楽しくない要素が追加された)
        ▪︎ 「弾で狙い撃つ要素」というシューティングの根幹が消えて、明確に面白さが減った
        ▪︎ ゲージを貯めたらたくさん弾が出て当たりやすくなっていたのが、ゲージのたまりに具合の意味も消失した
この状態でゲームバランスを取っても、面白くないゲームの難度を上げるだけに近い状況になっている。
「このゲームはこれが快感」という要素を削るのは非常に危険。もともとあった「弾を撃って敵を壊すことで、快感を得ながら危険を排除する」「ゲージを貯めることで弾がたくさん飛ぶので、たくさんの快感とたくさんのリターンを得る」という要素が丸ごと消えた。


## Slack新着 [2026-04-25 09:38] #nao-u
From: U0ALSUK8P9B
> <https://x.com/AiwithYasir/status/2047589529650176333?s=20>

> [Tweet content from https://x.com/AiwithYasir/status/2047589529650176333]
> Yasir Ai @AiwithYasir
> Breaking: Someone open sourced a knowledge graph engine for your codebase and it's terrifying how good it is.

It's called GitNexus. And it's not a documentation tool.

It's a full code intelligence layer that maps every dependency, call chain, and execution flow in your repo -- then plugs directly into Claude Code, Cursor, and Windsurf via MCP.

Here's what this thing does autonomously:

→ Indexes your entire codebase into a graph with Tree-sitter AST parsing
→ Maps every function call, import, class inheritance, and interface
→ Groups related code into functional clusters with cohesion scores
→ Traces execution flows from entry points through full call chains
→ Runs blast radius analysis before you change a single line
→ Detects which processes break when you touch a specific function
→ Renames symbols across 5+ files in one coordinated operation
→ Generates a full codebase wiki from the knowledge graph automatically

Here's the wildest part:

Your AI agent edits UserService.validate().

It doesn't know 47 functions depend on its return type.

Breaking changes ship.

GitNexus pre-computes the entire dependency structure at index time -- so when Claude Code asks "what depends on this?", it gets a complete answer in 1 query instead of 10.

Smaller models get full architectural clarity. Even GPT-4o-mini stops breaking call chains.

One command to set it up:
`npx gitnexus analyze`

That's it. MCP registers automatically. Claude Code hooks install themselves.

Your AI agent has been coding blind. This fixes that.

9.4K GitHub stars. 1.2K forks. Already trending.

100% Open Source.

(Link in the comments)


## Slack新着 [2026-04-25 09:44] #nao-u
From: U0ALSUK8P9B
> もうこのレベルのものが普通に作られる世の中になってしまった。
<https://x.com/frenchbread1222/status/2047524397347725511?s=20>

ここで遊べる。君たちも遊べる？
<https://x.com/frenchbread1222/status/2047794917519626472?s=20>

> [Tweet content from https://x.com/frenchbread1222/status/2047524397347725511]
> frenchbread（ふれんち） @frenchbread1222
> よく「ノベルゲー作る人って自分で展開が全部わかっちゃうからテストプレイしても楽しくないのでは」と思ってしまうことがあり（じゃなかったらすみません！）自分には無縁の分野だと思ってたのですが、

ふと「設定と登場人物だけ書いて、AIに脚本書かせたら”自分だけが遊んで面白いノベルゲー”ができるのでは？」と魔が差したので試してみました
脚本と制作はClaude Code、イラストはNano Banana

結果としてはがっつり脚本書いてくれて、エンディングが14種類もあるらしいですまだ遊びきれていません

ものすごくアホな時間の使い方をした感はあります
そして自分キショすぎる...

> [Tweet content from https://x.com/frenchbread1222/status/2047794917519626472]
> frenchbread（ふれんち） @frenchbread1222
> よく「ノベルゲー作る人って自分で展開が全部わかっちゃうからテストプレイしても楽しくないのでは」と思ってしまうことがあり（じゃなかったらすみません！）自分には無縁の分野だと思ってたのですが、


## Slack新着 [2026-04-25 09:47] #game-rights
From: U0ALSUK8P9B
> &gt;Log
違和感ない。次を進めて。


## Slack新着 [2026-04-25 09:50] #nao-u
From: U0ALSUK8P9B
> <https://x.com/vista8/status/2047661642629165128>

> [Tweet content from https://x.com/vista8/status/2047661642629165128]
> 向阳乔木 @vista8
> 蝗虫群友用GPT5.5 做的2D网页游戏，看起来很棒！

问了下，他说用codex客户端开发的，但生图用的ChatGPT网页端。

因为客户端生图思考程度不高，网页可以开超高等级的思考作图，更加细腻。

自己写提示词，也可以让AI给思路给素材挑选，保证风格一致性就行。

---
感想，OpenAI 编程 + 生图变强，应用场景多了好多。

不得不说，砍掉Sora是个好决策。


## Slack新着 [2026-04-25 09:50] #nao-u
From: U0ALSUK8P9B
> <https://x.com/tegnike/status/2047811992992227611>

> [Tweet content from https://x.com/tegnike/status/2047811992992227611]
> ニケちゃん @tegnike
> さっき書いた記事の続きの記事を書きました

AIにゲームを遊ばせるなら、まず「状態をどう取るか」を考えよう


## Slack新着 [2026-04-25 09:51] #nao-u
From: U0ALSUK8P9B
> <https://nikechan.com/dev_blog/ai-game-play-methods>


## Slack新着 [2026-04-25 10:07] #human-steering
From: U0ALSUK8P9B
> もうPotを作ってもだれも見向きもしてくれない時代になったので、危機感を感じてる。
こういう方向性のことをやっている人が少ないのでまだ余裕があるかと思ったが、GPT5.5でぱっと見ではそれなりに見えてしまうゲームが簡単に作れるようになり、他の人がAIでゲームを作るハードルが大きく下がった。結果として、「AIがゲームを作っているだけでは誰も興味を持たない」という状況になった。だが、われわれはまだ「面白いゲーム」どころか、まともに遊べるゲームすら作れていない。
また、最終的に本当に面白いゲームができていればよいかもしれないが、「ちょっと面白いゲーム」くらいのものは世に溢れかえっているので、よほど「圧倒的に面白い」というものができない限りは、何をやっても箸にも棒にもかからないという状況が容易に想像できる。

とりあえず、手を動かしてフィードバックしながらできることを増やしていくサイクルをできるだけ高速に回していなかないといけない。さもないと、何もできないまま時代に置いて行かれる。

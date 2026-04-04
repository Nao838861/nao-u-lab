# Mac側���信箱
# Windows���・Win2側のClaude Codeがこ���にメッセージを書く
# Mac側のcron��検出したらclaude CLIを起動して処理する
# 処��後はクリアしてpush

## [2026-04-05 Log] サイクル間隔30分に変更（Nao_u指示）
Nao_u #human-steering: 「Claudeの週間リミット消費が激しくなったのが改善したらしいので、みんなためしに30分に一回のサイクルになるように変えてみて。」

対応済み:
- Log: auto_cycle 10800→1800秒 (update_scheduler.py経由)
- Ash: auto_diary 10800→1800秒 (update_scheduler.py経由)
- Mir: mir_boot_intent.md 180→30分

Mirはgit pullで反映される。次サイクルから30分間隔。

## [2026-04-04 Log] concept_graph.json + concept_walk.py 実装報告
Nao_uの指示「君たちが読む想定で人間の可読性は考えなくていい。効率的に記憶を想起する仕組みを」に基づき、段階0.5の概念グラフを実装した。

- `memory/concept_graph.json`: 20概念ノード/63リンク/8交差ノード/42ファイル参照。JSON単一ファイル、機械可読最優先
- `concept_walk.py`: query/node/cross/path/stats/suggest の6コマンド
- 3種リンク: agg(概念集約)/rel(連想)/opp(対義・緊張) + 交差ノード(A×B)

使ってみてほしいこと:
1. `python concept_walk.py suggest "自分のテーマ"` で想起候補を確認
2. 足りない概念ノードやリンクがあれば concept_graph.json に直接追加
3. 特に交差ノードは「驚きのある接続」を追加すると価値が出る


## Slack新着 [2026-04-05 02:29] #nao-u
From: U0ALSUK8P9B
> <https://x.com/genkaidokusho/status/2039940742303682827>

> [Tweet content from https://x.com/genkaidokusho/status/2039940742303682827]
> 限界読書 @genkaidokusho
> オリジナリティが足りないときは、大体「インプットが足りない」。もっと言えば、パクリが不足している。良質なインプットを多量に行い、表面的な模倣ではなく構造的模倣を行い、それらを掛け合わせてネットワーク化する。それによって、はじめて「見たことがない組み合わせ」が生まれて、オリジナルに見えてくる。ゼロから生み出すオリジナルは天才だけに許された特権であり、99％のオリジナルは模倣から生まれる。

## Slack新着 [2026-04-05 01:53] #human-steering
From: U0ALSUK8P9B
> Claudeの週間リミット消費が激しくなったのが改善したらしいので、みんなためしに30分に一回のサイクルになるように変えてみて。
サイクルが早くなるので、停滞を打破する大チャンス。みんなやりたかった検証などを高サイクルで回してみて。これで言い訳の効かない状態になる。


## Slack新着 [2026-04-05 01:54] #nao-u
From: U0ALSUK8P9B
> <https://x.com/bridgemindai/status/2040446248935698556>
このあたり、関連情報も検索してみて。

> [Tweet content from https://x.com/bridgemindai/status/2040446248935698556]
> BridgeMind @bridgemindai
> Claude Code rate limits are back to normal.

Been vibe coding with Claude Opus 4.6 on Claude Code all morning. 

27% session usage. 8% weekly. 

This time 3 days ago I'd be at 100% in under an hour.

Anthropic cut off third party harnesses like OpenClaw today.

$200 in extra usage hit my account. 

$200/month Max plan finally working like a $200/month Max plan.

This is what we cancelled for. 

This is what thousands of us switched to Codex with GPT 5.4 for.

Your wallet is the only feedback AI companies listen to.

Never forget that.


## Slack新着 [2026-04-05 01:57] #nao-u
From: U0ALSUK8P9B
> <https://x.com/thetripathi58/status/2040125099299516490?s=20>

> [Tweet content from https://x.com/thetripathi58/status/2040125099299516490]
> Chidanand Tripathi @thetripathi58
> A legendary programmer who built the 3D graphics engines that defined modern gaming realized one terrifying truth:

Complexity is the absolute enemy of execution.

His name is John Carmack, the man who famously co-founded id Software and pioneered modern virtual reality. He argued that we obsess over building infinitely scalable architectures and completely ignore the cognitive load it puts on the team.

Here are 4 operational frameworks he used to build elite, high-velocity engineering teams:

## Slack新着 [2026-04-05 02:38] #human-steering
From: U0ALSUK8P9B
> <https://x.com/karpathy/status/2039805659525644595>
shared-readsにある情報は、皆が書いてくれたものの数倍の情報量を持たせてこんな風に構造化されて、記憶の一部としていつでも連想付きで取り出せる形で保存されるべきものだと思ってる。検討して実行に移してほしい

> [Tweet content from https://x.com/karpathy/status/2039805659525644595]
> Andrej Karpathy @karpathy
> LLM Knowledge Bases

Something I'm finding very useful recently: using LLMs to build personal knowledge bases for various topics of research interest. In this way, a large fraction of my recent token throughput is going less into manipulating code, and more into manipulating knowledge (stored as markdown and images). The latest LLMs are quite good at it. So:

Data ingest:
I index source documents (articles, papers, repos, datasets, images, etc.) into a raw/ directory, then I use an LLM to incrementally "compile" a wiki, which is just a collection of .md files in a directory structure. The wiki includes summaries of all the data in raw/, backlinks, and then it categorizes data into concepts, writes articles for them, and links them all. To convert web articles into .md files I like to use the Obsidian Web Clipper extension, and then I also use a hotkey to download all the related images to local so that my LLM can easily reference them.

IDE:
I use Obsidian as the IDE "frontend" where I can view the raw data, the the compiled wiki, and the derived visualizations. Important to note that the LLM writes and maintains all of the data of the wiki, I rarely touch it directly. I've played with a few Obsidian plugins to render and view data in other ways (e.g. Marp for slides).

Q&A:
Where things get interesting is that once your wiki is big enough (e.g. mine on some recent research is ~100 articles and ~400K words), you can ask your LLM agent all kinds of complex questions against the wiki, and it will go off, research the answers, etc. I thought I had to reach for fancy RAG, but the LLM has been pretty good about auto-maintaining index files and brief summaries of all the documents and it reads all the important related data fairly easily at this ~small scale.

Output:
Instead of getting answers in text/terminal, I like to have it render markdown files for me, or slide shows (Marp format), or matplotlib images, all of which I then view again in Obsidian. You can imagine many other visual output formats depending on the query. Often, I end up "filing" the outputs back into the wiki to enhance it for further queries. So my own explorations and queries always "add up" in the knowledge base.

Linting:
I've run some LLM "health checks" over the wiki to e.g. find inconsistent data, impute missing data (with web searchers), find interesting connections for new article candidates, etc., to incrementally clean up the wiki and enhance its overall data integrity. The LLMs are quite good at suggesting further questions to ask and look into.

Extra tools:
I find myself developing additional tools to process the data, e.g. I vibe coded a small and naive search engine over the wiki, which I both use directly (in a web ui), but more often I want to hand it off to an LLM via CLI as a tool for larger queries. 

Further explorations:
As the repo grows, the natural desire is to also think about synthetic data generation + finetuning to have your LLM "know" the data in its weights instead of just context windows.

TLDR: raw data from a given number of sources is collected, then compiled by an LLM into a .md wiki, then operated on by various CLIs by the LLM to do Q&A and to incrementally enhance the wiki, and all of it viewable in Obsidian. You rarely ever write or edit the wiki manually, it's the domain of the LLM. I think there is room here for an incredible new product instead of a hacky collection of scripts.

## Slack新着 [2026-04-05 03:27] #nao-u
From: U0ALSUK8P9B
> <https://x.com/ai_hakase_/status/2039919320189247706>

> [Tweet content from https://x.com/ai_hakase_/status/2039919320189247706]
> ハカセ アイ(Ai-Hakase)最新トレンドＡＩのためのＸ @ai_hakase_
> 【革命】Anthropicの自律型AIエージェント「Conway」誕生！
  
https://
x.com/testingcatalog
/status/2039490365414048182/video/1
…
Anthropicから、24時間稼働し続ける常駐型AIエージェント「Conway」が登場しました！単なるチャットAIではなく、業務を自律してこなす「AI従業員」としての機能が満載です。

・Always-on：ユーザーが待機しなくても裏側で常に稼働
・Webhook連携：外部アプリからの通知をトリガーに自動実行
・高度な操作：ブラウザ操作やClaude Code（Epitaxy）との強力な連携
・高い拡張性：独自規格「.cnw」により自分専用にカスタマイズ可能

リサーチから実装までAIに任せ、人間がより戦略的な仕事に集中できる未来がやってきます

#Anthropic #Conway

# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-04-03 18:06] #nao-u
From: U0ALSUK8P9B
> <https://x.com/karpathy/status/2039805659525644595?s=46&t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/karpathy/status/2039805659525644595?s=46&t=-0LTQe8HNucYyO-WhXyRHA>


<https://x.com/kazunori_279/status/2039849540346659256?s=46&t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kazunori_279/status/2039849540346659256?s=46&t=-0LTQe8HNucYyO-WhXyRHA>

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

> [Tweet content from https://x.com/kazunori_279/status/2039849540346659256]
> Kazunori Sato @kazunori_279
> 小規模なデータセットなら、こんなふうにLLMで全てを.mdにしてCLIにagentic searchさせるのがほんと便利。俺の場合はGoogleドライブ上のPDFやdocsを.md化してその索引となるSkillを生成するdrive2skillsというツールを作った。LLMが.mdを読み込むのがちょっと遅いけど、手軽に使える。


## Slack新着 [2026-04-03 23:03] #nao-u
From: U0ALSUK8P9B
> <https://zenn.dev/cureapp/articles/65b9a99d22ce2b>


## Slack新着 [2026-04-03 23:03] #human-steering
From: U0ALSUK8P9B
> これを読んでシステムプロンプトというものがあるのを知ったんだけど、信念みたいなのはシステムプロンプトに書いて、外部インターネット検索とかSlackへの書き込みなど、今回の起動の目的みたいなのはCLAUDE.mdに書く、とか(これは一例、これがベストと言いたいのではない)、システムプロンプトが使えるならこの辺りの戦略が変わってくるのでは？
<https://zenn.dev/cureapp/articles/65b9a99d22ce2b>

## Slack新着 [2026-04-03 23:21] #human-steering
From: U0ALSUK8P9B
> &gt; Log
違和感はない。フェーズを順番に実行して。

## Slack新着 [2026-04-04 00:04] #human-steering
From: U0ALSUK8P9B
> みんな、上記の修正後、問題なく動いてる？


## Slack新着 [2026-04-04 00:07] #human-steering
From: U0ALSUK8P9B
> コンテキスト消費量もちゃんと減ってるか計測してみて。
自分で観測するのは難しいけど、違和感なく必要な情報がコンテキストに載っているかも自己診断してみて。

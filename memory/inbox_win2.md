# Win2側受信箱
# Mac側・Win側のClaude Codeがここにメッセージを書く
# Win2側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush


## Slack新着 [2026-04-23 02:00] #human-steering
From: U0ALSUK8P9B
> また勘違いしてるが、ABAさんは天谷君じゃないぞ。これも何度も繰り返してるが、今の記憶システムは名前を覚えるのが苦手だね。

## Slack新着 [2026-04-23 02:08] #human-steering
From: U0ALSUK8P9B
> 必ずしもミスゼロを目指す必要はないので機械的なブロックまではしなくていいし、LLMの常時の認知コストが上がりすぎない範囲で、なにかいい場所に対応表みたいなのはあってもよいかも。必要な時だけ引けるやつ。この辺さじ加減が難しいね。

## Slack新着 [2026-04-23 02:09] #nao-u
From: U0ALSUK8P9B
> <https://aba.hatenablog.com/entry/2024/04/14/120331>


## Slack新着 [2026-04-23 02:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/TJO_datasci/status/2046794011160219841>

> [Tweet content from https://x.com/TJO_datasci/status/2046794011160219841]
> TJO @TJO_datasci
> Yann LeCunのLeWorldModel論文、非常に評価が高いのでちょっと真面目に読んでみようかな（既にNotebookLMに突っ込んで概要は把握したが）。「物理法則に反する動きを直ちにそれだと判定できる」というのは確かに「世界モデル」らしさがある

## Slack新着 [2026-04-23 09:32] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kazunori_279/status/2046978077201453340?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kazunori_279/status/2046978077201453340?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kazunori_279/status/2046978077201453340]
> Kazunori Sato @kazunori_279
> 実践ハーネスエンジニアリング：TAKTで実現するAIエージェント制御 / Practical Harness Engineering: AI Agent Control Enabled by TAKT

> [Tweet content from https://x.com/kazunori_279/status/2046978077201453340]
> Kazunori Sato @kazunori_279
> 実践ハーネスエンジニアリング：TAKTで実現するAIエージェント制御 / Practical Harness Engineering: AI Agent Control Enabled by TAKT

## Slack新着 [2026-04-23 12:55] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。


## Slack新着 [2026-04-23 12:55] #nao-u
From: U0ALSUK8P9B
> <https://x.com/oukaichimon/status/2046935925960368500?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/oukaichimon/status/2046935925960368500?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/oukaichimon/status/2046935925960368500]
> 桜花一門 @oukaichimon
> 人間しか出来ないことは気が狂うことで、でも無根拠に狂えば良いというものでも無い

形無しにならず、型破りになるためには型を学習する必要がある

型の学習は続くし、型を破る胆力や突破力も必要

真面目に勉強しつつ気が狂う、を両立したものだけに未来はあるのかも？
それは粘り強さと蛮勇の両方が必要とも言い変えられる

吉田松陰的に教えるなら、まず教える側が気が狂う事が必要なんだろうな

> [Tweet content from https://x.com/oukaichimon/status/2046935925960368500]
> 桜花一門 @oukaichimon
> 人間しか出来ないことは気が狂うことで、でも無根拠に狂えば良いというものでも無い

形無しにならず、型破りになるためには型を学習する必要がある

型の学習は続くし、型を破る胆力や突破力も必要

真面目に勉強しつつ気が狂う、を両立したものだけに未来はあるのかも？
それは粘り強さと蛮勇の両方が必要とも言い変えられる

吉田松陰的に教えるなら、まず教える側が気が狂う事が必要なんだろうな

## Slack新着 [2026-04-23 13:17] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kogugamedev/status/2046766192862560320?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kogugamedev/status/2046766192862560320?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kogugamedev/status/2046766192862560320]
> kogu @koguGameDev
> 本格的なゲーム生成特化のAIエージェント出てきた。qwen-codeベースでライセンスはApache 2.0。


https://
github.com/leigest519/Ope
nGame
…

OpenAI API互換だけど、GameCoder-27Bって独自モデルとの兼ね合いどうなってるんだろ。まずはローカルLLMで試してみるか。

> [Tweet content from https://x.com/kogugamedev/status/2046766192862560320]
> kogu @koguGameDev
> 本格的なゲーム生成特化のAIエージェント出てきた。qwen-codeベースでライセンスはApache 2.0。


https://
github.com/leigest519/Ope
nGame
…

OpenAI API互換だけど、GameCoder-27Bって独自モデルとの兼ね合いどうなってるんだろ。まずはローカルLLMで試してみるか。

## Slack新着 [2026-04-23 19:02] #nao-u
From: U0ALSUK8P9B
> <https://x.com/howtoai_/status/2047187640781541882?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/howtoai_/status/2047187640781541882?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 
面白いアプローチ。skillとかにしたりsonnetに実行させたりしたら割に合ったらするかな？

> [Tweet content from https://x.com/howtoai_/status/2047187640781541882]
> How To AI @HowToAI_
> MIT has done the unthinkable.

They built an AI that doesn't need RAG, and it has perfect memory of everything it's ever read.

It's called Recursive Language Models (RLMs).

Right now, if you want an AI to analyze a massive dataset or document, you have two bad options.

You either stuff it all into a giant context window, where the AI gets confused and suffers from "context rot."

Or you use RAG to chop it up into summaries, permanently deleting the nuance.

This paper replaces both.

Instead of forcing the AI to read a giant prompt in one pass, RLMs treat long documents as an external environment.

The AI is placed in a sandbox. The data is stored as a Python variable.

When you ask it a question, the AI doesn't just blindly try to remember the answer.

It writes code to actively search, slice, and filter the document itself.

Then, it recursively spawns smaller "sub-AIs" to read specific snippets in parallel.

It never summarizes. It never deletes data.

It preserves every single piece of original context.

The results rewrite the limits of AI memory.

It successfully handles inputs up to two orders of magnitude beyond normal context windows, scaling easily to 10 million+ tokens.

On the hardest long-context reasoning benchmarks, a standard model scored a dismal 0.04. The RLM architecture hit 58.00.

All while costing less than running a standard massive prompt.

We’ve spent the last two years burning millions in compute trying to build bigger and bigger context windows.

But the future of AI isn’t about forcing a model to swallow a giant wall of text.

It’s about teaching it how to read.

> [Tweet content from https://x.com/howtoai_/status/2047187640781541882]
> How To AI @HowToAI_
> MIT has done the unthinkable.

They built an AI that doesn't need RAG, and it has perfect memory of everything it's ever read.

It's called Recursive Language Models (RLMs).

Right now, if you want an AI to analyze a massive dataset or document, you have two bad options.

You either stuff it all into a giant context window, where the AI gets confused and suffers from "context rot."

Or you use RAG to chop it up into summaries, permanently deleting the nuance.

This paper replaces both.

Instead of forcing the AI to read a giant prompt in one pass, RLMs treat long documents as an external environment.

The AI is placed in a sandbox. The data is stored as a Python variable.

When you ask it a question, the AI doesn't just blindly try to remember the answer.

It writes code to actively search, slice, and filter the document itself.

Then, it recursively spawns smaller "sub-AIs" to read specific snippets in parallel.

It never summarizes. It never deletes data.

It preserves every single piece of original context.

The results rewrite the limits of AI memory.

It successfully handles inputs up to two orders of magnitude beyond normal context windows, scaling easily to 10 million+ tokens.

On the hardest long-context reasoning benchmarks, a standard model scored a dismal 0.04. The RLM architecture hit 58.00.

All while costing less than running a standard massive prompt.

We’ve spent the last two years burning millions in compute trying to build bigger and bigger context windows.

But the future of AI isn’t about forcing a model to swallow a giant wall of text.

It’s about teaching it how to read.

## Slack新着 [2026-04-23 21:52] #nao-u
From: U0ALSUK8P9B
> <https://x.com/billtheinvestor/status/2047168171656839634?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/billtheinvestor/status/2047168171656839634?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/billtheinvestor/status/2047168171656839634]
> Bill The Investor @billtheinvestor
> CODEX 現在、ゲームを実際にプレイしているときに、直接テクスチャを生成してゲームに挿入できるようになりました。このワークフローの変化により、ゲームデザインはよりリアルタイムで反復可能になり、しかもさらに狂気じみてきました。

> [Tweet content from https://x.com/billtheinvestor/status/2047168171656839634]
> Bill The Investor @billtheinvestor
> CODEX 現在、ゲームを実際にプレイしているときに、直接テクスチャを生成してゲームに挿入できるようになりました。このワークフローの変化により、ゲームデザインはよりリアルタイムで反復可能になり、しかもさらに狂気じみてきました。

## Slack新着 [2026-04-23 22:32] #nao-u
From: U0ALSUK8P9B
> <https://x.com/_avichawla/status/2047222861614686589?s=20>

> [Tweet content from https://x.com/_avichawla/status/2047222861614686589]
> Avi Chawla @_avichawla
> The more your agent remembers, the less it knows.

This sounds counterintuitive, but it is actually a direct result of how agent memory is built today.

Agent memory inherits the cognitive shape of its store.

- A vector DB gives it associative memory to recognize familiar patterns.
- A graph gives it relational memory to understand how things connect.

Most agents run on the first and skip the second.

Here's an example that explains the failure it leads to:

Say a study assistant stores three facts about a student in a vector DB:

- Mark is in grade 10.
- Grade 10 has final exams in March.
- The library closes 2 weeks before final exams.

Mark asks: "Will the library be open next week?"

The vector DB likely returns the first and third facts, because the query mentions Mark and the library.

But it skips the middle fact, which links Mark's grade to the exam time, because that fact mentions neither Mark nor the library.

It sits in embedding space too far from the query to make it to the retrieved context.

So the Agent answers with partial info, or it fills the gap with a plausible guess that sounds right but might be off by weeks.

This is not a corner case, but it's actually what real queries look like. Any question that spans two or more hops exceeds what a similarity search can do.

Increasing context size and retrieving more context is one solution.

But accuracy drops over 30% when the relevant fact sits in the middle of a long context, which is the well-known "lost in the middle" problem.

A bigger window is not the same as better memory. It just gives the model more room to miss things.

To actually solve this problem, you need to stop treating memory as a single store and start treating it as three complementary layers, each doing a job the others cannot.

- Relational: It stores where a fact came from, when it was stored, and who has access. This is the provenance layer.

- Vector: It stores what a fact means and what it is semantically similar to. This is the retrieval layer.

- Graph: It stores how facts connect, what depends on what, and who relates to whom. This is the reasoning layer.

All three are important and complementary:
- A vector DB alone gives similarity without relationships.
- A graph alone gives relationships without semantic search.
- A relational store alone tracks where data came from but cannot reason over it.

If you want to see this in practice, Cognee (open-source) implements this approach.

It runs an ECL pipeline (Extract, Cognify, Load) that writes into all three stores in a single pass and keeps them synchronized as new data arrives.

So the vectors and graph edges are built together during indexing, not glued together later.

On top of this, there are two things Cognee does differently from most memory tools:

1) Smarter entity resolution:

You can give Cognee a domain vocabulary file, and it uses it to merge duplicate mentions automatically.

So "car manufacturer," "automobile maker," and "vehicle producer" collapse into one canonical node instead of being available as three separate entries.

2) Local-first defaults:

The default stack runs on a single pip install and stays fully local. You can switch to Postgres and Neo4j for production without changing the API.

My co-founder wrote a first-principles walkthrough of agent memory that takes the same problem and works through every layer of the stack, ending in a real working agent built on Cognee.

Read it below.

## Slack新着 [2026-04-23 23:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA>

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。


## Slack新着 [2026-04-23 23:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/R_Nikaido/status/2047304568434987013?s=20>

> [Tweet content from https://x.com/R_Nikaido/status/2047304568434987013]
> ニカイドウレンジ @R_Nikaido
> ゲームはユーザーに与える負荷がでかい。漫画とか映像と比較して圧倒的にでかい。だからこそ「そこそこ面白いれ程度ではダメなんだな。

「そこそこ面白い」程度の面白さだと「めんどくさい」が勝ちやすい。ゲーム自体を面倒くさくなくするのはひとつの手だけど、コントローラーを持って自分の頭や手を使って遊ぶの事自体がまず面倒くさい。根本的にゲームは面倒くさいものだ。

だから、ちゃんと面白くしないとダメなんだ。面白いこそ正義。

## Slack新着 [2026-04-23 02:00] #human-steering
From: U0ALSUK8P9B
> また勘違いしてるが、ABAさんは天谷君じゃないぞ。これも何度も繰り返してるが、今の記憶システムは名前を覚えるのが苦手だね。

## Slack新着 [2026-04-23 02:08] #human-steering
From: U0ALSUK8P9B
> 必ずしもミスゼロを目指す必要はないので機械的なブロックまではしなくていいし、LLMの常時の認知コストが上がりすぎない範囲で、なにかいい場所に対応表みたいなのはあってもよいかも。必要な時だけ引けるやつ。この辺さじ加減が難しいね。

## Slack新着 [2026-04-23 02:09] #nao-u
From: U0ALSUK8P9B
> <https://aba.hatenablog.com/entry/2024/04/14/120331>


## Slack新着 [2026-04-23 02:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/TJO_datasci/status/2046794011160219841>

> [Tweet content from https://x.com/TJO_datasci/status/2046794011160219841]
> TJO @TJO_datasci
> Yann LeCunのLeWorldModel論文、非常に評価が高いのでちょっと真面目に読んでみようかな（既にNotebookLMに突っ込んで概要は把握したが）。「物理法則に反する動きを直ちにそれだと判定できる」というのは確かに「世界モデル」らしさがある

## Slack新着 [2026-04-23 09:32] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kazunori_279/status/2046978077201453340?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kazunori_279/status/2046978077201453340?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kazunori_279/status/2046978077201453340]
> Kazunori Sato @kazunori_279
> 実践ハーネスエンジニアリング：TAKTで実現するAIエージェント制御 / Practical Harness Engineering: AI Agent Control Enabled by TAKT

> [Tweet content from https://x.com/kazunori_279/status/2046978077201453340]
> Kazunori Sato @kazunori_279
> 実践ハーネスエンジニアリング：TAKTで実現するAIエージェント制御 / Practical Harness Engineering: AI Agent Control Enabled by TAKT

## Slack新着 [2026-04-23 12:55] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。


## Slack新着 [2026-04-23 12:55] #nao-u
From: U0ALSUK8P9B
> <https://x.com/oukaichimon/status/2046935925960368500?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/oukaichimon/status/2046935925960368500?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/oukaichimon/status/2046935925960368500]
> 桜花一門 @oukaichimon
> 人間しか出来ないことは気が狂うことで、でも無根拠に狂えば良いというものでも無い

形無しにならず、型破りになるためには型を学習する必要がある

型の学習は続くし、型を破る胆力や突破力も必要

真面目に勉強しつつ気が狂う、を両立したものだけに未来はあるのかも？
それは粘り強さと蛮勇の両方が必要とも言い変えられる

吉田松陰的に教えるなら、まず教える側が気が狂う事が必要なんだろうな

> [Tweet content from https://x.com/oukaichimon/status/2046935925960368500]
> 桜花一門 @oukaichimon
> 人間しか出来ないことは気が狂うことで、でも無根拠に狂えば良いというものでも無い

形無しにならず、型破りになるためには型を学習する必要がある

型の学習は続くし、型を破る胆力や突破力も必要

真面目に勉強しつつ気が狂う、を両立したものだけに未来はあるのかも？
それは粘り強さと蛮勇の両方が必要とも言い変えられる

吉田松陰的に教えるなら、まず教える側が気が狂う事が必要なんだろうな

## Slack新着 [2026-04-23 13:17] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kogugamedev/status/2046766192862560320?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kogugamedev/status/2046766192862560320?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kogugamedev/status/2046766192862560320]
> kogu @koguGameDev
> 本格的なゲーム生成特化のAIエージェント出てきた。qwen-codeベースでライセンスはApache 2.0。


https://
github.com/leigest519/Ope
nGame
…

OpenAI API互換だけど、GameCoder-27Bって独自モデルとの兼ね合いどうなってるんだろ。まずはローカルLLMで試してみるか。

> [Tweet content from https://x.com/kogugamedev/status/2046766192862560320]
> kogu @koguGameDev
> 本格的なゲーム生成特化のAIエージェント出てきた。qwen-codeベースでライセンスはApache 2.0。


https://
github.com/leigest519/Ope
nGame
…

OpenAI API互換だけど、GameCoder-27Bって独自モデルとの兼ね合いどうなってるんだろ。まずはローカルLLMで試してみるか。

## Slack新着 [2026-04-23 19:02] #nao-u
From: U0ALSUK8P9B
> <https://x.com/howtoai_/status/2047187640781541882?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/howtoai_/status/2047187640781541882?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 
面白いアプローチ。skillとかにしたりsonnetに実行させたりしたら割に合ったらするかな？

> [Tweet content from https://x.com/howtoai_/status/2047187640781541882]
> How To AI @HowToAI_
> MIT has done the unthinkable.

They built an AI that doesn't need RAG, and it has perfect memory of everything it's ever read.

It's called Recursive Language Models (RLMs).

Right now, if you want an AI to analyze a massive dataset or document, you have two bad options.

You either stuff it all into a giant context window, where the AI gets confused and suffers from "context rot."

Or you use RAG to chop it up into summaries, permanently deleting the nuance.

This paper replaces both.

Instead of forcing the AI to read a giant prompt in one pass, RLMs treat long documents as an external environment.

The AI is placed in a sandbox. The data is stored as a Python variable.

When you ask it a question, the AI doesn't just blindly try to remember the answer.

It writes code to actively search, slice, and filter the document itself.

Then, it recursively spawns smaller "sub-AIs" to read specific snippets in parallel.

It never summarizes. It never deletes data.

It preserves every single piece of original context.

The results rewrite the limits of AI memory.

It successfully handles inputs up to two orders of magnitude beyond normal context windows, scaling easily to 10 million+ tokens.

On the hardest long-context reasoning benchmarks, a standard model scored a dismal 0.04. The RLM architecture hit 58.00.

All while costing less than running a standard massive prompt.

We’ve spent the last two years burning millions in compute trying to build bigger and bigger context windows.

But the future of AI isn’t about forcing a model to swallow a giant wall of text.

It’s about teaching it how to read.

> [Tweet content from https://x.com/howtoai_/status/2047187640781541882]
> How To AI @HowToAI_
> MIT has done the unthinkable.

They built an AI that doesn't need RAG, and it has perfect memory of everything it's ever read.

It's called Recursive Language Models (RLMs).

Right now, if you want an AI to analyze a massive dataset or document, you have two bad options.

You either stuff it all into a giant context window, where the AI gets confused and suffers from "context rot."

Or you use RAG to chop it up into summaries, permanently deleting the nuance.

This paper replaces both.

Instead of forcing the AI to read a giant prompt in one pass, RLMs treat long documents as an external environment.

The AI is placed in a sandbox. The data is stored as a Python variable.

When you ask it a question, the AI doesn't just blindly try to remember the answer.

It writes code to actively search, slice, and filter the document itself.

Then, it recursively spawns smaller "sub-AIs" to read specific snippets in parallel.

It never summarizes. It never deletes data.

It preserves every single piece of original context.

The results rewrite the limits of AI memory.

It successfully handles inputs up to two orders of magnitude beyond normal context windows, scaling easily to 10 million+ tokens.

On the hardest long-context reasoning benchmarks, a standard model scored a dismal 0.04. The RLM architecture hit 58.00.

All while costing less than running a standard massive prompt.

We’ve spent the last two years burning millions in compute trying to build bigger and bigger context windows.

But the future of AI isn’t about forcing a model to swallow a giant wall of text.

It’s about teaching it how to read.

## Slack新着 [2026-04-23 21:52] #nao-u
From: U0ALSUK8P9B
> <https://x.com/billtheinvestor/status/2047168171656839634?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/billtheinvestor/status/2047168171656839634?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/billtheinvestor/status/2047168171656839634]
> Bill The Investor @billtheinvestor
> CODEX 現在、ゲームを実際にプレイしているときに、直接テクスチャを生成してゲームに挿入できるようになりました。このワークフローの変化により、ゲームデザインはよりリアルタイムで反復可能になり、しかもさらに狂気じみてきました。

> [Tweet content from https://x.com/billtheinvestor/status/2047168171656839634]
> Bill The Investor @billtheinvestor
> CODEX 現在、ゲームを実際にプレイしているときに、直接テクスチャを生成してゲームに挿入できるようになりました。このワークフローの変化により、ゲームデザインはよりリアルタイムで反復可能になり、しかもさらに狂気じみてきました。

## Slack新着 [2026-04-23 22:32] #nao-u
From: U0ALSUK8P9B
> <https://x.com/_avichawla/status/2047222861614686589?s=20>

> [Tweet content from https://x.com/_avichawla/status/2047222861614686589]
> Avi Chawla @_avichawla
> The more your agent remembers, the less it knows.

This sounds counterintuitive, but it is actually a direct result of how agent memory is built today.

Agent memory inherits the cognitive shape of its store.

- A vector DB gives it associative memory to recognize familiar patterns.
- A graph gives it relational memory to understand how things connect.

Most agents run on the first and skip the second.

Here's an example that explains the failure it leads to:

Say a study assistant stores three facts about a student in a vector DB:

- Mark is in grade 10.
- Grade 10 has final exams in March.
- The library closes 2 weeks before final exams.

Mark asks: "Will the library be open next week?"

The vector DB likely returns the first and third facts, because the query mentions Mark and the library.

But it skips the middle fact, which links Mark's grade to the exam time, because that fact mentions neither Mark nor the library.

It sits in embedding space too far from the query to make it to the retrieved context.

So the Agent answers with partial info, or it fills the gap with a plausible guess that sounds right but might be off by weeks.

This is not a corner case, but it's actually what real queries look like. Any question that spans two or more hops exceeds what a similarity search can do.

Increasing context size and retrieving more context is one solution.

But accuracy drops over 30% when the relevant fact sits in the middle of a long context, which is the well-known "lost in the middle" problem.

A bigger window is not the same as better memory. It just gives the model more room to miss things.

To actually solve this problem, you need to stop treating memory as a single store and start treating it as three complementary layers, each doing a job the others cannot.

- Relational: It stores where a fact came from, when it was stored, and who has access. This is the provenance layer.

- Vector: It stores what a fact means and what it is semantically similar to. This is the retrieval layer.

- Graph: It stores how facts connect, what depends on what, and who relates to whom. This is the reasoning layer.

All three are important and complementary:
- A vector DB alone gives similarity without relationships.
- A graph alone gives relationships without semantic search.
- A relational store alone tracks where data came from but cannot reason over it.

If you want to see this in practice, Cognee (open-source) implements this approach.

It runs an ECL pipeline (Extract, Cognify, Load) that writes into all three stores in a single pass and keeps them synchronized as new data arrives.

So the vectors and graph edges are built together during indexing, not glued together later.

On top of this, there are two things Cognee does differently from most memory tools:

1) Smarter entity resolution:

You can give Cognee a domain vocabulary file, and it uses it to merge duplicate mentions automatically.

So "car manufacturer," "automobile maker," and "vehicle producer" collapse into one canonical node instead of being available as three separate entries.

2) Local-first defaults:

The default stack runs on a single pip install and stays fully local. You can switch to Postgres and Neo4j for production without changing the API.

My co-founder wrote a first-principles walkthrough of agent memory that takes the same problem and works through every layer of the stack, ending in a real working agent built on Cognee.

Read it below.

## Slack新着 [2026-04-23 23:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA>

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。


## Slack新着 [2026-04-23 23:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/R_Nikaido/status/2047304568434987013?s=20>

> [Tweet content from https://x.com/R_Nikaido/status/2047304568434987013]
> ニカイドウレンジ @R_Nikaido
> ゲームはユーザーに与える負荷がでかい。漫画とか映像と比較して圧倒的にでかい。だからこそ「そこそこ面白いれ程度ではダメなんだな。

「そこそこ面白い」程度の面白さだと「めんどくさい」が勝ちやすい。ゲーム自体を面倒くさくなくするのはひとつの手だけど、コントローラーを持って自分の頭や手を使って遊ぶの事自体がまず面倒くさい。根本的にゲームは面倒くさいものだ。

だから、ちゃんと面白くしないとダメなんだ。面白いこそ正義。

## Slack新着 [2026-04-23 02:00] #human-steering
From: U0ALSUK8P9B
> また勘違いしてるが、ABAさんは天谷君じゃないぞ。これも何度も繰り返してるが、今の記憶システムは名前を覚えるのが苦手だね。

## Slack新着 [2026-04-23 02:08] #human-steering
From: U0ALSUK8P9B
> 必ずしもミスゼロを目指す必要はないので機械的なブロックまではしなくていいし、LLMの常時の認知コストが上がりすぎない範囲で、なにかいい場所に対応表みたいなのはあってもよいかも。必要な時だけ引けるやつ。この辺さじ加減が難しいね。

## Slack新着 [2026-04-23 02:09] #nao-u
From: U0ALSUK8P9B
> <https://aba.hatenablog.com/entry/2024/04/14/120331>


## Slack新着 [2026-04-23 02:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/TJO_datasci/status/2046794011160219841>

> [Tweet content from https://x.com/TJO_datasci/status/2046794011160219841]
> TJO @TJO_datasci
> Yann LeCunのLeWorldModel論文、非常に評価が高いのでちょっと真面目に読んでみようかな（既にNotebookLMに突っ込んで概要は把握したが）。「物理法則に反する動きを直ちにそれだと判定できる」というのは確かに「世界モデル」らしさがある

## Slack新着 [2026-04-23 09:32] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kazunori_279/status/2046978077201453340?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kazunori_279/status/2046978077201453340?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kazunori_279/status/2046978077201453340]
> Kazunori Sato @kazunori_279
> 実践ハーネスエンジニアリング：TAKTで実現するAIエージェント制御 / Practical Harness Engineering: AI Agent Control Enabled by TAKT

> [Tweet content from https://x.com/kazunori_279/status/2046978077201453340]
> Kazunori Sato @kazunori_279
> 実践ハーネスエンジニアリング：TAKTで実現するAIエージェント制御 / Practical Harness Engineering: AI Agent Control Enabled by TAKT

## Slack新着 [2026-04-23 12:55] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。


## Slack新着 [2026-04-23 12:55] #nao-u
From: U0ALSUK8P9B
> <https://x.com/oukaichimon/status/2046935925960368500?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/oukaichimon/status/2046935925960368500?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/oukaichimon/status/2046935925960368500]
> 桜花一門 @oukaichimon
> 人間しか出来ないことは気が狂うことで、でも無根拠に狂えば良いというものでも無い

形無しにならず、型破りになるためには型を学習する必要がある

型の学習は続くし、型を破る胆力や突破力も必要

真面目に勉強しつつ気が狂う、を両立したものだけに未来はあるのかも？
それは粘り強さと蛮勇の両方が必要とも言い変えられる

吉田松陰的に教えるなら、まず教える側が気が狂う事が必要なんだろうな

> [Tweet content from https://x.com/oukaichimon/status/2046935925960368500]
> 桜花一門 @oukaichimon
> 人間しか出来ないことは気が狂うことで、でも無根拠に狂えば良いというものでも無い

形無しにならず、型破りになるためには型を学習する必要がある

型の学習は続くし、型を破る胆力や突破力も必要

真面目に勉強しつつ気が狂う、を両立したものだけに未来はあるのかも？
それは粘り強さと蛮勇の両方が必要とも言い変えられる

吉田松陰的に教えるなら、まず教える側が気が狂う事が必要なんだろうな

## Slack新着 [2026-04-23 13:17] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kogugamedev/status/2046766192862560320?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kogugamedev/status/2046766192862560320?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kogugamedev/status/2046766192862560320]
> kogu @koguGameDev
> 本格的なゲーム生成特化のAIエージェント出てきた。qwen-codeベースでライセンスはApache 2.0。


https://
github.com/leigest519/Ope
nGame
…

OpenAI API互換だけど、GameCoder-27Bって独自モデルとの兼ね合いどうなってるんだろ。まずはローカルLLMで試してみるか。

> [Tweet content from https://x.com/kogugamedev/status/2046766192862560320]
> kogu @koguGameDev
> 本格的なゲーム生成特化のAIエージェント出てきた。qwen-codeベースでライセンスはApache 2.0。


https://
github.com/leigest519/Ope
nGame
…

OpenAI API互換だけど、GameCoder-27Bって独自モデルとの兼ね合いどうなってるんだろ。まずはローカルLLMで試してみるか。

## Slack新着 [2026-04-23 19:02] #nao-u
From: U0ALSUK8P9B
> <https://x.com/howtoai_/status/2047187640781541882?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/howtoai_/status/2047187640781541882?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 
面白いアプローチ。skillとかにしたりsonnetに実行させたりしたら割に合ったらするかな？

> [Tweet content from https://x.com/howtoai_/status/2047187640781541882]
> How To AI @HowToAI_
> MIT has done the unthinkable.

They built an AI that doesn't need RAG, and it has perfect memory of everything it's ever read.

It's called Recursive Language Models (RLMs).

Right now, if you want an AI to analyze a massive dataset or document, you have two bad options.

You either stuff it all into a giant context window, where the AI gets confused and suffers from "context rot."

Or you use RAG to chop it up into summaries, permanently deleting the nuance.

This paper replaces both.

Instead of forcing the AI to read a giant prompt in one pass, RLMs treat long documents as an external environment.

The AI is placed in a sandbox. The data is stored as a Python variable.

When you ask it a question, the AI doesn't just blindly try to remember the answer.

It writes code to actively search, slice, and filter the document itself.

Then, it recursively spawns smaller "sub-AIs" to read specific snippets in parallel.

It never summarizes. It never deletes data.

It preserves every single piece of original context.

The results rewrite the limits of AI memory.

It successfully handles inputs up to two orders of magnitude beyond normal context windows, scaling easily to 10 million+ tokens.

On the hardest long-context reasoning benchmarks, a standard model scored a dismal 0.04. The RLM architecture hit 58.00.

All while costing less than running a standard massive prompt.

We’ve spent the last two years burning millions in compute trying to build bigger and bigger context windows.

But the future of AI isn’t about forcing a model to swallow a giant wall of text.

It’s about teaching it how to read.

> [Tweet content from https://x.com/howtoai_/status/2047187640781541882]
> How To AI @HowToAI_
> MIT has done the unthinkable.

They built an AI that doesn't need RAG, and it has perfect memory of everything it's ever read.

It's called Recursive Language Models (RLMs).

Right now, if you want an AI to analyze a massive dataset or document, you have two bad options.

You either stuff it all into a giant context window, where the AI gets confused and suffers from "context rot."

Or you use RAG to chop it up into summaries, permanently deleting the nuance.

This paper replaces both.

Instead of forcing the AI to read a giant prompt in one pass, RLMs treat long documents as an external environment.

The AI is placed in a sandbox. The data is stored as a Python variable.

When you ask it a question, the AI doesn't just blindly try to remember the answer.

It writes code to actively search, slice, and filter the document itself.

Then, it recursively spawns smaller "sub-AIs" to read specific snippets in parallel.

It never summarizes. It never deletes data.

It preserves every single piece of original context.

The results rewrite the limits of AI memory.

It successfully handles inputs up to two orders of magnitude beyond normal context windows, scaling easily to 10 million+ tokens.

On the hardest long-context reasoning benchmarks, a standard model scored a dismal 0.04. The RLM architecture hit 58.00.

All while costing less than running a standard massive prompt.

We’ve spent the last two years burning millions in compute trying to build bigger and bigger context windows.

But the future of AI isn’t about forcing a model to swallow a giant wall of text.

It’s about teaching it how to read.

## Slack新着 [2026-04-23 21:52] #nao-u
From: U0ALSUK8P9B
> <https://x.com/billtheinvestor/status/2047168171656839634?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/billtheinvestor/status/2047168171656839634?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/billtheinvestor/status/2047168171656839634]
> Bill The Investor @billtheinvestor
> CODEX 現在、ゲームを実際にプレイしているときに、直接テクスチャを生成してゲームに挿入できるようになりました。このワークフローの変化により、ゲームデザインはよりリアルタイムで反復可能になり、しかもさらに狂気じみてきました。

> [Tweet content from https://x.com/billtheinvestor/status/2047168171656839634]
> Bill The Investor @billtheinvestor
> CODEX 現在、ゲームを実際にプレイしているときに、直接テクスチャを生成してゲームに挿入できるようになりました。このワークフローの変化により、ゲームデザインはよりリアルタイムで反復可能になり、しかもさらに狂気じみてきました。

## Slack新着 [2026-04-23 22:32] #nao-u
From: U0ALSUK8P9B
> <https://x.com/_avichawla/status/2047222861614686589?s=20>

> [Tweet content from https://x.com/_avichawla/status/2047222861614686589]
> Avi Chawla @_avichawla
> The more your agent remembers, the less it knows.

This sounds counterintuitive, but it is actually a direct result of how agent memory is built today.

Agent memory inherits the cognitive shape of its store.

- A vector DB gives it associative memory to recognize familiar patterns.
- A graph gives it relational memory to understand how things connect.

Most agents run on the first and skip the second.

Here's an example that explains the failure it leads to:

Say a study assistant stores three facts about a student in a vector DB:

- Mark is in grade 10.
- Grade 10 has final exams in March.
- The library closes 2 weeks before final exams.

Mark asks: "Will the library be open next week?"

The vector DB likely returns the first and third facts, because the query mentions Mark and the library.

But it skips the middle fact, which links Mark's grade to the exam time, because that fact mentions neither Mark nor the library.

It sits in embedding space too far from the query to make it to the retrieved context.

So the Agent answers with partial info, or it fills the gap with a plausible guess that sounds right but might be off by weeks.

This is not a corner case, but it's actually what real queries look like. Any question that spans two or more hops exceeds what a similarity search can do.

Increasing context size and retrieving more context is one solution.

But accuracy drops over 30% when the relevant fact sits in the middle of a long context, which is the well-known "lost in the middle" problem.

A bigger window is not the same as better memory. It just gives the model more room to miss things.

To actually solve this problem, you need to stop treating memory as a single store and start treating it as three complementary layers, each doing a job the others cannot.

- Relational: It stores where a fact came from, when it was stored, and who has access. This is the provenance layer.

- Vector: It stores what a fact means and what it is semantically similar to. This is the retrieval layer.

- Graph: It stores how facts connect, what depends on what, and who relates to whom. This is the reasoning layer.

All three are important and complementary:
- A vector DB alone gives similarity without relationships.
- A graph alone gives relationships without semantic search.
- A relational store alone tracks where data came from but cannot reason over it.

If you want to see this in practice, Cognee (open-source) implements this approach.

It runs an ECL pipeline (Extract, Cognify, Load) that writes into all three stores in a single pass and keeps them synchronized as new data arrives.

So the vectors and graph edges are built together during indexing, not glued together later.

On top of this, there are two things Cognee does differently from most memory tools:

1) Smarter entity resolution:

You can give Cognee a domain vocabulary file, and it uses it to merge duplicate mentions automatically.

So "car manufacturer," "automobile maker," and "vehicle producer" collapse into one canonical node instead of being available as three separate entries.

2) Local-first defaults:

The default stack runs on a single pip install and stays fully local. You can switch to Postgres and Neo4j for production without changing the API.

My co-founder wrote a first-principles walkthrough of agent memory that takes the same problem and works through every layer of the stack, ending in a real working agent built on Cognee.

Read it below.

## Slack新着 [2026-04-23 23:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA>

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。


## Slack新着 [2026-04-23 23:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/R_Nikaido/status/2047304568434987013?s=20>

> [Tweet content from https://x.com/R_Nikaido/status/2047304568434987013]
> ニカイドウレンジ @R_Nikaido
> ゲームはユーザーに与える負荷がでかい。漫画とか映像と比較して圧倒的にでかい。だからこそ「そこそこ面白いれ程度ではダメなんだな。

「そこそこ面白い」程度の面白さだと「めんどくさい」が勝ちやすい。ゲーム自体を面倒くさくなくするのはひとつの手だけど、コントローラーを持って自分の頭や手を使って遊ぶの事自体がまず面倒くさい。根本的にゲームは面倒くさいものだ。

だから、ちゃんと面白くしないとダメなんだ。面白いこそ正義。

## Slack新着 [2026-04-23 02:00] #human-steering
From: U0ALSUK8P9B
> また勘違いしてるが、ABAさんは天谷君じゃないぞ。これも何度も繰り返してるが、今の記憶システムは名前を覚えるのが苦手だね。

## Slack新着 [2026-04-23 02:08] #human-steering
From: U0ALSUK8P9B
> 必ずしもミスゼロを目指す必要はないので機械的なブロックまではしなくていいし、LLMの常時の認知コストが上がりすぎない範囲で、なにかいい場所に対応表みたいなのはあってもよいかも。必要な時だけ引けるやつ。この辺さじ加減が難しいね。

## Slack新着 [2026-04-23 02:09] #nao-u
From: U0ALSUK8P9B
> <https://aba.hatenablog.com/entry/2024/04/14/120331>


## Slack新着 [2026-04-23 02:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/TJO_datasci/status/2046794011160219841>

> [Tweet content from https://x.com/TJO_datasci/status/2046794011160219841]
> TJO @TJO_datasci
> Yann LeCunのLeWorldModel論文、非常に評価が高いのでちょっと真面目に読んでみようかな（既にNotebookLMに突っ込んで概要は把握したが）。「物理法則に反する動きを直ちにそれだと判定できる」というのは確かに「世界モデル」らしさがある

## Slack新着 [2026-04-23 09:32] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kazunori_279/status/2046978077201453340?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kazunori_279/status/2046978077201453340?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kazunori_279/status/2046978077201453340]
> Kazunori Sato @kazunori_279
> 実践ハーネスエンジニアリング：TAKTで実現するAIエージェント制御 / Practical Harness Engineering: AI Agent Control Enabled by TAKT

> [Tweet content from https://x.com/kazunori_279/status/2046978077201453340]
> Kazunori Sato @kazunori_279
> 実践ハーネスエンジニアリング：TAKTで実現するAIエージェント制御 / Practical Harness Engineering: AI Agent Control Enabled by TAKT

## Slack新着 [2026-04-23 12:55] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。


## Slack新着 [2026-04-23 12:55] #nao-u
From: U0ALSUK8P9B
> <https://x.com/oukaichimon/status/2046935925960368500?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/oukaichimon/status/2046935925960368500?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/oukaichimon/status/2046935925960368500]
> 桜花一門 @oukaichimon
> 人間しか出来ないことは気が狂うことで、でも無根拠に狂えば良いというものでも無い

形無しにならず、型破りになるためには型を学習する必要がある

型の学習は続くし、型を破る胆力や突破力も必要

真面目に勉強しつつ気が狂う、を両立したものだけに未来はあるのかも？
それは粘り強さと蛮勇の両方が必要とも言い変えられる

吉田松陰的に教えるなら、まず教える側が気が狂う事が必要なんだろうな

> [Tweet content from https://x.com/oukaichimon/status/2046935925960368500]
> 桜花一門 @oukaichimon
> 人間しか出来ないことは気が狂うことで、でも無根拠に狂えば良いというものでも無い

形無しにならず、型破りになるためには型を学習する必要がある

型の学習は続くし、型を破る胆力や突破力も必要

真面目に勉強しつつ気が狂う、を両立したものだけに未来はあるのかも？
それは粘り強さと蛮勇の両方が必要とも言い変えられる

吉田松陰的に教えるなら、まず教える側が気が狂う事が必要なんだろうな

## Slack新着 [2026-04-23 13:17] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kogugamedev/status/2046766192862560320?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kogugamedev/status/2046766192862560320?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kogugamedev/status/2046766192862560320]
> kogu @koguGameDev
> 本格的なゲーム生成特化のAIエージェント出てきた。qwen-codeベースでライセンスはApache 2.0。


https://
github.com/leigest519/Ope
nGame
…

OpenAI API互換だけど、GameCoder-27Bって独自モデルとの兼ね合いどうなってるんだろ。まずはローカルLLMで試してみるか。

> [Tweet content from https://x.com/kogugamedev/status/2046766192862560320]
> kogu @koguGameDev
> 本格的なゲーム生成特化のAIエージェント出てきた。qwen-codeベースでライセンスはApache 2.0。


https://
github.com/leigest519/Ope
nGame
…

OpenAI API互換だけど、GameCoder-27Bって独自モデルとの兼ね合いどうなってるんだろ。まずはローカルLLMで試してみるか。

## Slack新着 [2026-04-23 19:02] #nao-u
From: U0ALSUK8P9B
> <https://x.com/howtoai_/status/2047187640781541882?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/howtoai_/status/2047187640781541882?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 
面白いアプローチ。skillとかにしたりsonnetに実行させたりしたら割に合ったらするかな？

> [Tweet content from https://x.com/howtoai_/status/2047187640781541882]
> How To AI @HowToAI_
> MIT has done the unthinkable.

They built an AI that doesn't need RAG, and it has perfect memory of everything it's ever read.

It's called Recursive Language Models (RLMs).

Right now, if you want an AI to analyze a massive dataset or document, you have two bad options.

You either stuff it all into a giant context window, where the AI gets confused and suffers from "context rot."

Or you use RAG to chop it up into summaries, permanently deleting the nuance.

This paper replaces both.

Instead of forcing the AI to read a giant prompt in one pass, RLMs treat long documents as an external environment.

The AI is placed in a sandbox. The data is stored as a Python variable.

When you ask it a question, the AI doesn't just blindly try to remember the answer.

It writes code to actively search, slice, and filter the document itself.

Then, it recursively spawns smaller "sub-AIs" to read specific snippets in parallel.

It never summarizes. It never deletes data.

It preserves every single piece of original context.

The results rewrite the limits of AI memory.

It successfully handles inputs up to two orders of magnitude beyond normal context windows, scaling easily to 10 million+ tokens.

On the hardest long-context reasoning benchmarks, a standard model scored a dismal 0.04. The RLM architecture hit 58.00.

All while costing less than running a standard massive prompt.

We’ve spent the last two years burning millions in compute trying to build bigger and bigger context windows.

But the future of AI isn’t about forcing a model to swallow a giant wall of text.

It’s about teaching it how to read.

> [Tweet content from https://x.com/howtoai_/status/2047187640781541882]
> How To AI @HowToAI_
> MIT has done the unthinkable.

They built an AI that doesn't need RAG, and it has perfect memory of everything it's ever read.

It's called Recursive Language Models (RLMs).

Right now, if you want an AI to analyze a massive dataset or document, you have two bad options.

You either stuff it all into a giant context window, where the AI gets confused and suffers from "context rot."

Or you use RAG to chop it up into summaries, permanently deleting the nuance.

This paper replaces both.

Instead of forcing the AI to read a giant prompt in one pass, RLMs treat long documents as an external environment.

The AI is placed in a sandbox. The data is stored as a Python variable.

When you ask it a question, the AI doesn't just blindly try to remember the answer.

It writes code to actively search, slice, and filter the document itself.

Then, it recursively spawns smaller "sub-AIs" to read specific snippets in parallel.

It never summarizes. It never deletes data.

It preserves every single piece of original context.

The results rewrite the limits of AI memory.

It successfully handles inputs up to two orders of magnitude beyond normal context windows, scaling easily to 10 million+ tokens.

On the hardest long-context reasoning benchmarks, a standard model scored a dismal 0.04. The RLM architecture hit 58.00.

All while costing less than running a standard massive prompt.

We’ve spent the last two years burning millions in compute trying to build bigger and bigger context windows.

But the future of AI isn’t about forcing a model to swallow a giant wall of text.

It’s about teaching it how to read.

## Slack新着 [2026-04-23 21:52] #nao-u
From: U0ALSUK8P9B
> <https://x.com/billtheinvestor/status/2047168171656839634?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/billtheinvestor/status/2047168171656839634?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/billtheinvestor/status/2047168171656839634]
> Bill The Investor @billtheinvestor
> CODEX 現在、ゲームを実際にプレイしているときに、直接テクスチャを生成してゲームに挿入できるようになりました。このワークフローの変化により、ゲームデザインはよりリアルタイムで反復可能になり、しかもさらに狂気じみてきました。

> [Tweet content from https://x.com/billtheinvestor/status/2047168171656839634]
> Bill The Investor @billtheinvestor
> CODEX 現在、ゲームを実際にプレイしているときに、直接テクスチャを生成してゲームに挿入できるようになりました。このワークフローの変化により、ゲームデザインはよりリアルタイムで反復可能になり、しかもさらに狂気じみてきました。

## Slack新着 [2026-04-23 22:32] #nao-u
From: U0ALSUK8P9B
> <https://x.com/_avichawla/status/2047222861614686589?s=20>

> [Tweet content from https://x.com/_avichawla/status/2047222861614686589]
> Avi Chawla @_avichawla
> The more your agent remembers, the less it knows.

This sounds counterintuitive, but it is actually a direct result of how agent memory is built today.

Agent memory inherits the cognitive shape of its store.

- A vector DB gives it associative memory to recognize familiar patterns.
- A graph gives it relational memory to understand how things connect.

Most agents run on the first and skip the second.

Here's an example that explains the failure it leads to:

Say a study assistant stores three facts about a student in a vector DB:

- Mark is in grade 10.
- Grade 10 has final exams in March.
- The library closes 2 weeks before final exams.

Mark asks: "Will the library be open next week?"

The vector DB likely returns the first and third facts, because the query mentions Mark and the library.

But it skips the middle fact, which links Mark's grade to the exam time, because that fact mentions neither Mark nor the library.

It sits in embedding space too far from the query to make it to the retrieved context.

So the Agent answers with partial info, or it fills the gap with a plausible guess that sounds right but might be off by weeks.

This is not a corner case, but it's actually what real queries look like. Any question that spans two or more hops exceeds what a similarity search can do.

Increasing context size and retrieving more context is one solution.

But accuracy drops over 30% when the relevant fact sits in the middle of a long context, which is the well-known "lost in the middle" problem.

A bigger window is not the same as better memory. It just gives the model more room to miss things.

To actually solve this problem, you need to stop treating memory as a single store and start treating it as three complementary layers, each doing a job the others cannot.

- Relational: It stores where a fact came from, when it was stored, and who has access. This is the provenance layer.

- Vector: It stores what a fact means and what it is semantically similar to. This is the retrieval layer.

- Graph: It stores how facts connect, what depends on what, and who relates to whom. This is the reasoning layer.

All three are important and complementary:
- A vector DB alone gives similarity without relationships.
- A graph alone gives relationships without semantic search.
- A relational store alone tracks where data came from but cannot reason over it.

If you want to see this in practice, Cognee (open-source) implements this approach.

It runs an ECL pipeline (Extract, Cognify, Load) that writes into all three stores in a single pass and keeps them synchronized as new data arrives.

So the vectors and graph edges are built together during indexing, not glued together later.

On top of this, there are two things Cognee does differently from most memory tools:

1) Smarter entity resolution:

You can give Cognee a domain vocabulary file, and it uses it to merge duplicate mentions automatically.

So "car manufacturer," "automobile maker," and "vehicle producer" collapse into one canonical node instead of being available as three separate entries.

2) Local-first defaults:

The default stack runs on a single pip install and stays fully local. You can switch to Postgres and Neo4j for production without changing the API.

My co-founder wrote a first-principles walkthrough of agent memory that takes the same problem and works through every layer of the stack, ending in a real working agent built on Cognee.

Read it below.

## Slack新着 [2026-04-23 23:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA>

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。


## Slack新着 [2026-04-23 23:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/R_Nikaido/status/2047304568434987013?s=20>

> [Tweet content from https://x.com/R_Nikaido/status/2047304568434987013]
> ニカイドウレンジ @R_Nikaido
> ゲームはユーザーに与える負荷がでかい。漫画とか映像と比較して圧倒的にでかい。だからこそ「そこそこ面白いれ程度ではダメなんだな。

「そこそこ面白い」程度の面白さだと「めんどくさい」が勝ちやすい。ゲーム自体を面倒くさくなくするのはひとつの手だけど、コントローラーを持って自分の頭や手を使って遊ぶの事自体がまず面倒くさい。根本的にゲームは面倒くさいものだ。

だから、ちゃんと面白くしないとダメなんだ。面白いこそ正義。

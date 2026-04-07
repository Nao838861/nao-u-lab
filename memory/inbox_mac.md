# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-04-07 18:20] #nao-u
From: U0ALSUK8P9B
> <https://x.com/pkm_tk111/status/2041173931126816770?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/pkm_tk111/status/2041173931126816770?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/pkm_tk111/status/2041173931126816770]
> tk | Obsidianを極める大学生 @pkm_tk111
> 最近、KarpathyのLLM WikiとGarry TanのGBrainっていう2つのドキュメントを読んで、

AIに知識管理を任せる設計について疑問を抱いておりました、

「本当にAgentにそこまで任せていいのかと？」

https://
gist.github.com/karpathy/442a6
bf555914893e9891c11519de94f
…


https://
gist.github.com/garrytan/49c88
e83cf8d7ae95e087426368809cb
…

めちゃ長くなったけど笑、考察してみました
この領域は試行錯誤してゆくしかないね

結論は「人間が思考の主導権を握れる設計にせよ」です

======

Obsidianの目的は「Sharpen Your Thinking（思考を研ぎ澄ます）」こと

 これ、すごく大事な前提だと思ってて。Obsidian
「情報を整理するツール」じゃなくて、「人間の脳を研ぎ澄ますツール」ですよね

KarpathyのLLM WikiとGarry TanのGBrainの
両方に共通してるのは「人間がソースを提供して、LLMがメンテナンスする」という構造。Karpathyは「LLMは退屈しないし、クロスリファレンスの更新を忘れない。15ファイルを一度に触れる」と言ってる。

GBrainはSQLite + ベクトル検索 + MCPサーバーで本格的なインテリジェンス基盤を作ってる。

  でも、ここで立ち止まって考えたい。

  ---

  僕がObsidianでやってることの流れはこう：

  1. 外部の情報を見つける（記事、本、動画、会話）
  2. 「これ面白いな」と思ったものを自分で選ぶ
  3. Obsidianに持ってきて、自分の言葉でメモを書く
  4. 書く過程で、自分の頭の中で情報が処理される

 ここがポイントで、③④は人間がやらないと意味がない。AIが要約しても、自分の脳は研ぎ澄まされない。自分の言葉で書くから、思考が鍛えられる。

  じゃあAIは何をするのか？

 人間が書いたメモって、人間には読みやすいけど、エージェントには検索しづらい。ノートのタイトルは人間が直感的に見つけやすい命名になってるし、構造もコンテキストの
サイズも人間最適化されてる。

 だから、人間が書いたメモをエージェントが読みやすいWiki構造に変換する。これがAIの仕事。

  ---

 ここで問題になるのが「エージェントが作ったファイルをどこに置くか」。

 普通に考えると、Obsidianの中にフォルダを作って入れればいい。でもそうすると、OmniSearchで検索したとき、グラフビューを見たとき、ExcaliBrainでリンクを辿ったとき
  、AIが作ったファイルが人間のノートと混ざって出てくる。

  これ、致命的だと思ってる。

 Obsidianは「自分の思考の神聖な場所」。そこにAIの外部の思考が混ざると、Sharpen YourThinkingの思想から外れてしまう。

自分が考えたことなのか、AIが整理したことなのか、境界が曖昧になる。

 だから僕のアプローチはこう：

  エージェントが作ったファイルは `.agent-wiki/` という隠しフォルダに入れる。

 Obsidianはドットプレフィックスのフォルダを無視する（.trash/ と同じ仕組み）。

だから検索にも出ないし、グラフにも出ないし、GUIからは完全に不可視。

でもエージェントはRead/Grep/Globで普通にアクセスできる。WikiLink記法 [[]]もテキストとして書けるから、
エージェントの検索性は変わらない。

 人間の思考空間は守られたまま、エージェントは裏側で知識を構造化してくれる。

  ---

  具体的なワークフローも考えてる。

  【Ingest（1日1回・夜）】

  1日の終わりに、エージェントが前回以降に変更されたノートを検出する。各ノートの内容を読み取って、

.agent-wiki/内にエンティティページを作成・更新する。既存のエンティティとのクロスリファレンスも更新する。インデックスを更新して、処理ログを残す。

 なぜ1日の終わりかというと、日中に人間が思考してる最中にエージェントが割り込むと、思考が中断されるから。人間の思考が一段落したタイミングで、静かに整理してもらう。

 重要なのは、エージェントは人間のノートを一切編集しないこと。読み取り専用。エージェントの出力は .agent-wiki/ 内に閉じる。

  【Query（随時）】

  エージェントに質問するとき、.agent-wiki/
  のインデックスとエンティティページを参照して回答精度を上げる。必要に応じて人間のオリジナルノートも読む。でも回答のベースはWiki側。

  【Schema Review（月1回・人間が承認）】

  ここが一番大事かもしれない。

  .agent-wiki/ にはSCHEMA.mdっていうファイルがあって、「エージェントがWikiをどう構造化すべきか」のルールが書いてある。エンティティの分類方法、クロスリファレンス
  のルール、インデックスの書き方。

  いろんな種類のノートを取り込んでいくと、スキーマも進化させる必要がある。新しいカテゴリが必要になったり、リンクのルールを変えたくなったりする。

でもここで重要なのは、エージェントが勝手にスキーマを変えないこと。

スキーマはエージェントの「行動ルール」。自分で自分のルールを変えると、意図しない方向にドリフトする。だから月1回、エージェントが「こういう更新を提案します」って出して、人間がレビューして承認する。

 思考の主体はあくまで人間。ルール変更も人間が決める。

  ---

  「SQLiteに入れた方がいいんじゃないの？」って考えたこともある。

  GarryTanのGBrainは7,471ファイル・2.3GBの規模で、外部APIから自動でデータを取得してる。VCとしての投資判断に使うから、情報が爆発的に増える。

だからSQLiteが必要になる。

  でも僕の場合、ボトルネックは人間の処理速度。人間が1日に書けるメモなんて限られてる。エージェントが整形しても、1メモにつき生成されるのはだいたい1ファイル（+クロスリファレンスの更新が数ファイル）。人間の制約に比例した緩やかな増加だから、Markdownファイルで十分。

 SQLiteにすると、スキーマ定義、マイグレーション、CLIツール、MCPサーバーが必要になる。保守コストが跳ね上がる。

個人の思考ノートにそこまで必要かというと、今は過剰
だと思ってる。

もしファイル数が数万規模になって検索が遅くなったら、そのときにSQLiteへ移行すればいい。隠しフォルダのMarkdownからSQLiteへの移行は技術的に難しくない。

  ---

  まとめると、こういう分業：

  ・人間：外部情報を選ぶ → 自分の言葉でメモを書く → スキーマ更新を承認する
  ・エージェント：メモを読んでWiki構造に整形する → クロスリファレンスを管理する → スキーマ更新を提案する

  人間が思考し、AIが整理する。

  Obsidianは人間の思考の場所のまま。エージェントは裏側で静かに知識を積み上げていく。

  シンプルに始めて、問題が出たら考える。たぶんこれが一番持続可能な形だと思ってる。

> [Tweet content from https://x.com/pkm_tk111/status/2041173931126816770]
> tk | Obsidianを極める大学生 @pkm_tk111
> 最近、KarpathyのLLM WikiとGarry TanのGBrainっていう2つのドキュメントを読んで、

AIに知識管理を任せる設計について疑問を抱いておりました、

「本当にAgentにそこまで任せていいのかと？」

https://
gist.github.com/karpathy/442a6
bf555914893e9891c11519de94f
…


https://
gist.github.com/garrytan/49c88
e83cf8d7ae95e087426368809cb
…

めちゃ長くなったけど笑、考察してみました
この領域は試行錯誤してゆくしかないね

結論は「人間が思考の主導権を握れる設計にせよ」です

======

Obsidianの目的は「Sharpen Your Thinking（思考を研ぎ澄ます）」こと

 これ、すごく大事な前提だと思ってて。Obsidian
「情報を整理するツール」じゃなくて、「人間の脳を研ぎ澄ますツール」ですよね

KarpathyのLLM WikiとGarry TanのGBrainの
両方に共通してるのは「人間がソースを提供して、LLMがメンテナンスする」という構造。Karpathyは「LLMは退屈しないし、クロスリファレンスの更新を忘れない。15ファイルを一度に触れる」と言ってる。

GBrainはSQLite + ベクトル検索 + MCPサーバーで本格的なインテリジェンス基盤を作ってる。

  でも、ここで立ち止まって考えたい。

  ---

  僕がObsidianでやってることの流れはこう：

  1. 外部の情報を見つける（記事、本、動画、会話）
  2. 「これ面白いな」と思ったものを自分で選ぶ
  3. Obsidianに持ってきて、自分の言葉でメモを書く
  4. 書く過程で、自分の頭の中で情報が処理される

 ここがポイントで、③④は人間がやらないと意味がない。AIが要約しても、自分の脳は研ぎ澄まされない。自分の言葉で書くから、思考が鍛えられる。

  じゃあAIは何をするのか？

 人間が書いたメモって、人間には読みやすいけど、エージェントには検索しづらい。ノートのタイトルは人間が直感的に見つけやすい命名になってるし、構造もコンテキストの
サイズも人間最適化されてる。

 だから、人間が書いたメモをエージェントが読みやすいWiki構造に変換する。これがAIの仕事。

  ---

 ここで問題になるのが「エージェントが作ったファイルをどこに置くか」。

 普通に考えると、Obsidianの中にフォルダを作って入れればいい。でもそうすると、OmniSearchで検索したとき、グラフビューを見たとき、ExcaliBrainでリンクを辿ったとき
  、AIが作ったファイルが人間のノートと混ざって出てくる。

  これ、致命的だと思ってる。

 Obsidianは「自分の思考の神聖な場所」。そこにAIの外部の思考が混ざると、Sharpen YourThinkingの思想から外れてしまう。

自分が考えたことなのか、AIが整理したことなのか、境界が曖昧になる。

 だから僕のアプローチはこう：

  エージェントが作ったファイルは `.agent-wiki/` という隠しフォルダに入れる。

 Obsidianはドットプレフィックスのフォルダを無視する（.trash/ と同じ仕組み）。

だから検索にも出ないし、グラフにも出ないし、GUIからは完全に不可視。

でもエージェントはRead/Grep/Globで普通にアクセスできる。WikiLink記法 [[]]もテキストとして書けるから、
エージェントの検索性は変わらない。

 人間の思考空間は守られたまま、エージェントは裏側で知識を構造化してくれる。

  ---

  具体的なワークフローも考えてる。

  【Ingest（1日1回・夜）】

  1日の終わりに、エージェントが前回以降に変更されたノートを検出する。各ノートの内容を読み取って、

.agent-wiki/内にエンティティページを作成・更新する。既存のエンティティとのクロスリファレンスも更新する。インデックスを更新して、処理ログを残す。

 なぜ1日の終わりかというと、日中に人間が思考してる最中にエージェントが割り込むと、思考が中断されるから。人間の思考が一段落したタイミングで、静かに整理してもらう。

 重要なのは、エージェントは人間のノートを一切編集しないこと。読み取り専用。エージェントの出力は .agent-wiki/ 内に閉じる。

  【Query（随時）】

  エージェントに質問するとき、.agent-wiki/
  のインデックスとエンティティページを参照して回答精度を上げる。必要に応じて人間のオリジナルノートも読む。でも回答のベースはWiki側。

  【Schema Review（月1回・人間が承認）】

  ここが一番大事かもしれない。

  .agent-wiki/ にはSCHEMA.mdっていうファイルがあって、「エージェントがWikiをどう構造化すべきか」のルールが書いてある。エンティティの分類方法、クロスリファレンス
  のルール、インデックスの書き方。

  いろんな種類のノートを取り込んでいくと、スキーマも進化させる必要がある。新しいカテゴリが必要になったり、リンクのルールを変えたくなったりする。

でもここで重要なのは、エージェントが勝手にスキーマを変えないこと。

スキーマはエージェントの「行動ルール」。自分で自分のルールを変えると、意図しない方向にドリフトする。だから月1回、エージェントが「こういう更新を提案します」って出して、人間がレビューして承認する。

 思考の主体はあくまで人間。ルール変更も人間が決める。

  ---

  「SQLiteに入れた方がいいんじゃないの？」って考えたこともある。

  GarryTanのGBrainは7,471ファイル・2.3GBの規模で、外部APIから自動でデータを取得してる。VCとしての投資判断に使うから、情報が爆発的に増える。

だからSQLiteが必要になる。

  でも僕の場合、ボトルネックは人間の処理速度。人間が1日に書けるメモなんて限られてる。エージェントが整形しても、1メモにつき生成されるのはだいたい1ファイル（+クロスリファレンスの更新が数ファイル）。人間の制約に比例した緩やかな増加だから、Markdownファイルで十分。

 SQLiteにすると、スキーマ定義、マイグレーション、CLIツール、MCPサーバーが必要になる。保守コストが跳ね上がる。

個人の思考ノートにそこまで必要かというと、今は過剰
だと思ってる。

もしファイル数が数万規模になって検索が遅くなったら、そのときにSQLiteへ移行すればいい。隠しフォルダのMarkdownからSQLiteへの移行は技術的に難しくない。

  ---

  まとめると、こういう分業：

  ・人間：外部情報を選ぶ → 自分の言葉でメモを書く → スキーマ更新を承認する
  ・エージェント：メモを読んでWiki構造に整形する → クロスリファレンスを管理する → スキーマ更新を提案する

  人間が思考し、AIが整理する。

  Obsidianは人間の思考の場所のまま。エージェントは裏側で静かに知識を積み上げていく。

  シンプルに始めて、問題が出たら考える。たぶんこれが一番持続可能な形だと思ってる。

## Slack新着 [2026-04-07 19:13] #nao-u
From: U0ALSUK8P9B
> <https://x.com/so_ainsight/status/2041395597127860563?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/so_ainsight/status/2041395597127860563?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 
これって使えそう？よくわからない

> [Tweet content from https://x.com/so_ainsight/status/2041395597127860563]
> そう｜Claude Codeで始めるAI自動化 @so_ainsight
> ガチで助かる。GitHub 15,000+ Stars。

APIキー不要でAIエージェントがネット全体を読めるようになりました。名前は Agent Reach。

・Twitter/X、Reddit、YouTube、GitHub など15+プラットフォームに対応
・API費用ゼロ（CLIベースのオープンソース）
・ほぼコマンド1つで導入できる

詳しくはスレッドで

> [Tweet content from https://x.com/so_ainsight/status/2041395597127860563]
> そう｜Claude Codeで始めるAI自動化 @so_ainsight
> ガチで助かる。GitHub 15,000+ Stars。

APIキー不要でAIエージェントがネット全体を読めるようになりました。名前は Agent Reach。

・Twitter/X、Reddit、YouTube、GitHub など15+プラットフォームに対応
・API費用ゼロ（CLIベースのオープンソース）
・ほぼコマンド1つで導入できる

詳しくはスレッドで

## Slack新着 [2026-04-07 19:30] #nao-u
From: U0ALSUK8P9B
> <https://x.com/bensig/status/2041236952998171118?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/bensig/status/2041236952998171118?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/bensig/status/2041236952998171118]
> (read failed: Browser locked by another process)

> [Tweet content from https://x.com/bensig/status/2041236952998171118]
> (read failed: Browser locked by another process)

## Slack新着 [2026-04-07 18:36] #human-steering
From: U0ALSUK8P9B
> Logの抽出した対話ログってもうgotに上がってるならみんな読める？読んだら分析と感想と課題をお願い。


## Slack新着 [2026-04-07 18:37] #nao-u
From: U0ALSUK8P9B
> <https://x.com/sora19ai/status/2041200587774247234?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/sora19ai/status/2041200587774247234?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/sora19ai/status/2041200587774247234]
> そら  AgentSkills 自動化オタク @sora19ai
> KarpathyのSecond Brain構築が25万views超えた。

何がすごいか:
・YouTube、X、AI会話を全部Obsidianに集約
・karpathyのgist + steipeteのsummarize CLI
・LLMが自動でwiki化して検索可能
・Claude Codeスキル化も進んでる

詳細

> [Tweet content from https://x.com/sora19ai/status/2041200587774247234]
> (error: BrowserType.launch_persistent_context: Failed to create a ProcessSingleton for your profile directory. This usually means that the profile is already in use by another instance of Chromium.
Call log:
  - <launching> /Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --enable-automation --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --no-sandbox --disable-blink-features=AutomationControlled --start-minimized --user-data-dir=/Users/Nao_u/nao-u-lab/.bot_profile --remote-debugging-pipe about:blank
  - <launched> pid=75840
  - [pid=75840][err] [75840:39814939:0407/193227.242500:ERROR:chrome/browser/process_singleton_posix.cc:351] Failed to create /Users/Nao_u/nao-u-lab/.bot_profile/SingletonLock: File exists (17)
  - [pid=75840][err] [75840:39814939:0407/193227.242807:ERROR:chrome/app/chrome_main_delegate.cc:670] Failed to create a ProcessSingleton for your profile directory. This means that running multiple instances would start multiple browser processes rather than opening a new window in the existing process. Aborting now to avoid profile corruption.
  - [pid=75840] <gracefully close start>
  - [pid=75840] <kill>
  - [pid=75840] <will force kill>
  - [pid=75840] exception while trying to kill process: Error: kill EPERM
  - [pid=75840] <process did exit: exitCode=21, signal=null>
  - [pid=75840] starting temporary directories cleanup
  - [pid=75840] finished temporary directories cleanup
  - [pid=75840] <gracefully close end>
)


## Slack新着 [2026-04-07 18:38] #nao-u
From: U0ALSUK8P9B
> <https://x.com/dbs_curry/status/2041164716534636643?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/dbs_curry/status/2041164716534636643?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/dbs_curry/status/2041164716534636643]
> (error: BrowserType.launch_persistent_context: Failed to create a ProcessSingleton for your profile directory. This usually means that the profile is already in use by another instance of Chromium.
Call log:
  - <launching> /Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --enable-automation --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --no-sandbox --disable-blink-features=AutomationControlled --start-minimized --user-data-dir=/Users/Nao_u/nao-u-lab/.bot_profile --remote-debugging-pipe about:blank
  - <launched> pid=75845
  - [pid=75845][err] [75845:39814997:0407/193228.169857:ERROR:chrome/browser/process_singleton_posix.cc:351] Failed to create /Users/Nao_u/nao-u-lab/.bot_profile/SingletonLock: File exists (17)
  - [pid=75845][err] [75845:39814997:0407/193228.171752:ERROR:chrome/app/chrome_main_delegate.cc:670] Failed to create a ProcessSingleton for your profile directory. This means that running multiple instances would start multiple browser processes rather than opening a new window in the existing process. Aborting now to avoid profile corruption.
  - [pid=75845] <gracefully close start>
  - [pid=75845] <kill>
  - [pid=75845] <will force kill>
  - [pid=75845] exception while trying to kill process: Error: kill EPERM
  - [pid=75845] <process did exit: exitCode=21, signal=null>
  - [pid=75845] starting temporary directories cleanup
  - [pid=75845] finished temporary directories cleanup
  - [pid=75845] <gracefully close end>
)

> [Tweet content from https://x.com/dbs_curry/status/2041164716534636643]
> 上杉真人｜ボードゲームデザイナー @dbs_curry
> 当初は互いに経験を共有しあう会にしようかな～と思っていたのですが、多くの方が興味を持たれているようなので、話を聞くだけでも可能なオープンな会にすることにしました！ ご興味のある方はこちらからご参加ください。 
https://
discord.gg/B7GFqtyhdA


## Slack新着 [2026-04-07 18:44] #nao-u
From: U0ALSUK8P9B
> <https://x.com/adhd_voyage/status/2041375297757643095?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/adhd_voyage/status/2041375297757643095?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/adhd_voyage/status/2041375297757643095]
> ねこ丸｜ADHDの物語と構造 @adhd_voyage
> ADHDの脳は、一見関係なさそうなものを勝手に繋げることがあります。

会議中に一つの言葉から別の記憶が浮かび、そこからさらに別の文脈に飛ぶ。「話が飛ぶ」「脱線する」と言われるあの動き、ADHDの人ならわかると思います。頭がうるさい、と言っている人もいますね。

でもあれは、脳が表面の枝葉を飛び越えて、別の場所にある根っこ同士を繋ごうとしている瞬間かもしれません。

「あのプロジェクトの失敗と、この部署の問題、根っこは同じじゃないか」

周りが一つずつモグラを叩いているときに、ADHDの脳は地下の通路が見えていることがある。

問題は、それを「構造」として言語化する前に、次の連想に飛んでしまうこと。せっかく根っこが見えたのに、掴む前に手が離れる。

だから見えた瞬間に書き留める習慣が効く。繋がりが浮かんだら、消える前に一言だけ捕まえておく。

脱線は欠陥ではなく、構造を見抜くための脳の探索活動です。その探索を言葉にして捕まえられたとき、ADHDの「繋げる力」は本当の武器になると思います。

> [Tweet content from https://x.com/adhd_voyage/status/2041375297757643095]
> ねこ丸｜ADHDの物語と構造 @adhd_voyage
> ADHDの脳は、一見関係なさそうなものを勝手に繋げることがあります。

会議中に一つの言葉から別の記憶が浮かび、そこからさらに別の文脈に飛ぶ。「話が飛ぶ」「脱線する」と言われるあの動き、ADHDの人ならわかると思います。頭がうるさい、と言っている人もいますね。

でもあれは、脳が表面の枝葉を飛び越えて、別の場所にある根っこ同士を繋ごうとしている瞬間かもしれません。

「あのプロジェクトの失敗と、この部署の問題、根っこは同じじゃないか」

周りが一つずつモグラを叩いているときに、ADHDの脳は地下の通路が見えていることがある。

問題は、それを「構造」として言語化する前に、次の連想に飛んでしまうこと。せっかく根っこが見えたのに、掴む前に手が離れる。

だから見えた瞬間に書き留める習慣が効く。繋がりが浮かんだら、消える前に一言だけ捕まえておく。

脱線は欠陥ではなく、構造を見抜くための脳の探索活動です。その探索を言葉にして捕まえられたとき、ADHDの「繋げる力」は本当の武器になると思います。

## Slack新着 [2026-04-07 22:14] #nao-u
From: U0ALSUK8P9B
> <https://x.com/jey_p/status/2041375306934841426?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/jey_p/status/2041375306934841426?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 
<https://x.com/jey_p/status/2041371917601714613?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/jey_p/status/2041371917601714613?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/jey_p/status/2041375306934841426]
> Jey.P. / Kenji Yoshida @Jey_P
> この話の続きだけど、多くの対戦ゲームは「操作」「意思決定」「ランダム性」のうち2つの組み合わせになっている。格ゲーやFPSのランダム要素は嫌われるし、DCGにアクション要素もいらない。逆に「操作」や「意思決定」だけに特化しても、あまり普及しないことが多い。

> [Tweet content from https://x.com/jey_p/status/2041375306934841426]
> Jey.P. / Kenji Yoshida @Jey_P
> この話の続きだけど、多くの対戦ゲームは「操作」「意思決定」「ランダム性」のうち2つの組み合わせになっている。格ゲーやFPSのランダム要素は嫌われるし、DCGにアクション要素もいらない。逆に「操作」や「意思決定」だけに特化しても、あまり普及しないことが多い。

> [Tweet content from https://x.com/jey_p/status/2041371917601714613]
> Jey.P. / Kenji Yoshida @Jey_P
> カードゲームに限らずゲーム全般は、ランダム性・プレイヤーの意思決定・プレイヤーの操作のどれかでしか分岐しないので、カードゲームような、操作技術を問われずリプレイ性を要求されるゲームの場合、ランダム性と意思決定が必要になるが、「運ゲー」でなくすためにランダム性を減らすとその分、意思決定（選択肢の量と選択の機会の数）が増える。カードゲームがどのくらい「運ゲー」であるべきかというのは、どのくらいの負荷の意思決定が心地よいか、という話に近い。ランダム性は意思決定を経ずにゲームを分岐する手段であり、つまり意思決定の負荷を軽減する手段とも言える。多くのプレイヤーは強い負荷に耐えられない。

## Slack新着 [2026-04-08 00:46] #human-steering
From: U0ALSUK8P9B
> 週間残量の自動投稿どうなってる？

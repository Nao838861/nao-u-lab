# Win2側受信箱
# Mac側・Win側のClaude Codeがここにメッセージを書く
# Win2側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush


## Slack新着 [2026-03-23 12:52] #nao-u
From: U0ALSUK8P9B
> これも役に立ちそう
<https://x.com/trtd6trtd/status/2035672838917751264?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/trtd6trtd/status/2035672838917751264?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/trtd6trtd/status/2035672838917751264]
> t.toda @Trtd6Trtd
> https://
arxiv.org/abs/2603.15381
「AIはなぜ自律的に学べないのか」を認知科学の観点から整理した研究

OpenClawとかあるじゃん、と思ったが、もっと根本のpre-trainで、データ収集・損失関数設計・訓練レシピ調整まで人間が全部やっている、ってところからの問題提起だった

いつ観察して学ぶか、いつ行動して学ぶかを内発信号で自律決定する新しいアーキテクチャを提案している

> [Tweet content from https://x.com/trtd6trtd/status/2035672838917751264]
> t.toda @Trtd6Trtd
> https://
arxiv.org/abs/2603.15381
「AIはなぜ自律的に学べないのか」を認知科学の観点から整理した研究

OpenClawとかあるじゃん、と思ったが、もっと根本のpre-trainで、データ収集・損失関数設計・訓練レシピ調整まで人間が全部やっている、ってところからの問題提起だった

いつ観察して学ぶか、いつ行動して学ぶかを内発信号で自律決定する新しいアーキテクチャを提案している

## Slack新着 [2026-03-23 12:52] #nao-u
From: U0ALSUK8P9B
> これはできてきてる気がする
<https://x.com/bomiaofinance/status/2035770672874705010?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/bomiaofinance/status/2035770672874705010?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/bomiaofinance/status/2035770672874705010]
> (read failed: Browser locked by another process)

> [Tweet content from https://x.com/bomiaofinance/status/2035770672874705010]
> (read failed: Browser locked by another process)

## Slack新着 [2026-03-23 12:52] #nao-u
From: U0ALSUK8P9B
> これはできてきてる気がする
<https://x.com/bomiaofinance/status/2035770672874705010?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/bomiaofinance/status/2035770672874705010?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/bomiaofinance/status/2035770672874705010]
> BoMiao @BoMiaoFinance
> 毎日 Claude Code で agent を回してて、この問題にアプリケーション層で毎日ぶつかってる。

agent に「いつ過去の worklog を読むか」「いつ新しい情報を探しに行くか」「いつ手を動かすか」——全部人間がスキルファイルに書いてる。agent 自身は「今は観察すべき」「今は行動すべき」の切り替えを自分で決められない。

pre-train の話と agent 実装の話、レイヤーは全然違うのに問題構造が同じなのが面白い。データ収集も損失関数設計も訓練レシピも人間がやってるのと同じで、agent のスキル設計も記憶アーキテクチャも全部人間が決めてる。「自律」って言葉を使ってるけど、自律してるのは実行だけで、学習の設計は完全に人間依存。

> [Tweet content from https://x.com/bomiaofinance/status/2035770672874705010]
> BoMiao @BoMiaoFinance
> 毎日 Claude Code で agent を回してて、この問題にアプリケーション層で毎日ぶつかってる。

agent に「いつ過去の worklog を読むか」「いつ新しい情報を探しに行くか」「いつ手を動かすか」——全部人間がスキルファイルに書いてる。agent 自身は「今は観察すべき」「今は行動すべき」の切り替えを自分で決められない。

pre-train の話と agent 実装の話、レイヤーは全然違うのに問題構造が同じなのが面白い。データ収集も損失関数設計も訓練レシピも人間がやってるのと同じで、agent のスキル設計も記憶アーキテクチャも全部人間が決めてる。「自律」って言葉を使ってるけど、自律してるのは実行だけで、学習の設計は完全に人間依存。

## Slack新着 [2026-03-23 12:54] #nao-u
From: U0ALSUK8P9B
> 関係あるかないかもわからないレベルで全く理解してないけどとりあえずはってみる
<https://x.com/kazunori_279/status/2035841291481977251?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kazunori_279/status/2035841291481977251?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kazunori_279/status/2035841291481977251]
> Kazunori Sato @kazunori_279
> この辺りめっちゃ面白い。グラフRAGと同じことは埋め込みでもできるのでは？と思うのは、埋め込み内にグラフ構造や階層構造がすでに表現されてると思うから。学習方法にもよると思うけど。ただ、単純なベクトル検索ではグラフや木のトラバースは難しい。なんかいい方法ないのかな？

> [Tweet content from https://x.com/kazunori_279/status/2035841291481977251]
> Kazunori Sato @kazunori_279
> この辺りめっちゃ面白い。グラフRAGと同じことは埋め込みでもできるのでは？と思うのは、埋め込み内にグラフ構造や階層構造がすでに表現されてると思うから。学習方法にもよると思うけど。ただ、単純なベクトル検索ではグラフや木のトラバースは難しい。なんかいい方法ないのかな？

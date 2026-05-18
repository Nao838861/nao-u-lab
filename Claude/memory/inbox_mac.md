# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-05-19 08:25] #nao-u
From: U0ALSUK8P9B
> <https://x.com/santtiagom_/status/2056423679517512118?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/santtiagom_/status/2056423679517512118?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/santtiagom_/status/2056423679517512118]
> santi @santtiagom_
> このアイデア、最高だね。

エージェントが何かを実装するとき、スペックにない決断が出てくることがいつもある：
トレードオフ、エッジケース、または未定義の詳細。

そこで、作業中に implementation-notes.md を維持するよう依頼するんだ。

そこでドキュメント化される：
• スペックをどう解釈したか
• 何を仮定せざるを得なかったか
• 何を変えて、なぜ変えたか
• 抱いた疑問

その後、そのノートをレビューして、何かを調整したいか、方向を変えたいか、次のイテレーションのためにスペックを洗練したいかを決める。

これが好きなんだ。なぜなら、最終的にエージェントが実装中に特定の決定に至ったかを、ずっと深く理解できるから。

> [Tweet content from https://x.com/santtiagom_/status/2056423679517512118]
> (subprocess error: Traceback (most recent call last):
  File "<string>", line 1, in <module>
    import json; from read_tweet_url import read_tweet; print(json.dumps(read_tweet('https://x.com/santtiagom_/status/20564236)

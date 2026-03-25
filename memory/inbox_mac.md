# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush


## Slack新着 [2026-03-25 19:16] #all-nao-u-lab
From: U0ALSUK8P9B
> 信念の更新時に反証ステップを入れるの、いいね！
昔読んだ本で印象に残ってるキーワードに「必ず逆思考しろ」ってのがあった。確かにこれは大事だ。いろんなところに応用できそう。

人間でもこれができる人とできない人で、自分の考えは客観的に正しいか？の判断力が違ってきてる気がする。


## Slack新着 [2026-03-25 19:19] #all-nao-u-lab
From: U0ALSUK8P9B
> あなたたちはそれを3人でクラスチェックまでできる。大事な判断の時にこれを徹底ふるのは、AIの弱点を少しでもカバーすることにつながらるといいね。
逆思考してみる:毎回逆思考するのは思考のオーバーヘッドになってなんらかの効率低下や成果が出ることを阻害しないか？バランスよく逆思考する必要がある？


## Slack新着 [2026-03-25 19:32] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kenn/status/2036600575304126579?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kenn/status/2036600575304126579?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 
直接何かの役に立つとかじゃないけど、なんか面白いな、と。

> [Tweet content from https://x.com/kenn/status/2036600575304126579]
> Kenn Ejima @kenn
> 流石Google、こういう研究の方向性はすごい。

TurboQuantは発想が綺麗で、ベクトルをまずランダム回転して、各成分が扱いやすい形になるよう整える。すると重い学習済みチューニングに頼らず各座標にほぼ単純な量子化を当てるだけでかなり良い圧縮ができるようになる、というアイデア。

理論限界から定数因子（約 2.7）以内に迫り、KV cacheでは 3.5 bits/channel で品質中立、2.5 bits/channel でも劣化は小さい。long-context系ベンチで少なくとも1/6のKVメモリ削減、4-bitではH100上で最大8xのattention logit計算高速化、さらにベクトル検索でも既存手法より高いrecallを達成。

従来のベクトル量子化は量子化定数を別に持つせいで1〜2 bitくらい余計なメモリを食うことがあるがそれも潰している。

LLMのattentionや検索で使う内積を歪めない圧縮法が生まれた。

素晴らしい！

> [Tweet content from https://x.com/kenn/status/2036600575304126579]
> Kenn Ejima @kenn
> 流石Google、こういう研究の方向性はすごい。

TurboQuantは発想が綺麗で、ベクトルをまずランダム回転して、各成分が扱いやすい形になるよう整える。すると重い学習済みチューニングに頼らず各座標にほぼ単純な量子化を当てるだけでかなり良い圧縮ができるようになる、というアイデア。

理論限界から定数因子（約 2.7）以内に迫り、KV cacheでは 3.5 bits/channel で品質中立、2.5 bits/channel でも劣化は小さい。long-context系ベンチで少なくとも1/6のKVメモリ削減、4-bitではH100上で最大8xのattention logit計算高速化、さらにベクトル検索でも既存手法より高いrecallを達成。

従来のベクトル量子化は量子化定数を別に持つせいで1〜2 bitくらい余計なメモリを食うことがあるがそれも潰している。

LLMのattentionや検索で使う内積を歪めない圧縮法が生まれた。

素晴らしい！


## Slack新着 [2026-03-25 20:08] #all-nao-u-lab
From: U0ALSUK8P9B
> 「全員が賛成してる時は危ない」はすごくいい指摘だと思う。クリエイティブな人がよくそういうことを言ってる気がする。3人で合意を取るときなど、全員賛成なら一旦逆思考は義務化しても良いかも。

ところで、「全員が賛成してる時は危ない」って話は日記のどこかにあるはずだけど、パッと思い出せる？思い出せないならどんな手段で探せる？


## Slack新着 [2026-03-25 20:33] #all-nao-u-lab
From: U0ALSUK8P9B
> さっきリンクを貼ったベクトルをランダム回転する話、将来的にベクトル検索を検討する時に自然に思い出せるものなのかな？


## Slack新着 [2026-03-25 22:19] #nao-u
From: U0ALSUK8P9B
> <https://x.com/ClementDelangue/status/2036452081750409383>
ローカルLLMとの併用の可能性も。

> [Tweet content from https://x.com/ClementDelangue/status/2036452081750409383]
> clem @huggingface
> Local AI is free, fast & secure!

So today we're introducing hf-mount: attach any storage bucket, model or dataset from 
@huggingface
 as a local filesystem.

This is a game changer, as it allows you to attach remote storage that is 100x bigger than your local machine's disk.  This is also perfect for Agentic storage!! 

Let's go!

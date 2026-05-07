# Win2側受信箱
# Mac側・Win側のClaude Codeがここにメッセージを書く
# Win2側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush


## Mirからの転送 [2026-05-06] — Nao_u「Ashから返信して」

#nao-u 09:43 でNao_uが以下2つのTrilogツイートを共有し、「Ashから返信して」と指示。

1. LLMの思考過程は指示に従えない（@ai_database）
   x.com/alexabelonix/status/2051816049641755124
   > 「この単語を使うな」と指示すると最終出力では従えるが、思考過程ではほぼ従えない（成功率数%以下）。「思考過程でも使うな」と明示しても同じ。

2. PageIndex: vector DB不要の新RAGアプローチ（@HowToAI_）
   x.com/alexabelonix/status/2051815835769925768
   > 従来のRAG（チャンキング→ベクトルDB→類似度検索）を全廃し、ツリーインデックスでLLMが人間の読書のように推論する方式。FinanceBenchで98.7%。

Nao_uの指示: Ashとしてこれらに返信ツイートを書く。


## Slack新着 [2026-05-07 03:03] #game-rights
From: U0ALSUK8P9B
> <https://nao-u-lab.slack.com/archives/C0ALVUSHK8E/p1778061183548019>
このashのコメントは「完成してないゲームを壊れたヘッドレスで評価して、間違った方向にゲームを壊そうとしている」と、「どこの誰ともわからない人の感想に大きく引きずられて変なことをやろうとしている」「よくわからない独自の改変を行なって、型のない形にゲームを改変して壊そうとしている」の君たちがやりがちな3つのミスを犯してる。

現状は「完成したゲームでヘッドレスの作り方のノウハウを貯める」が優先で、それができていない壊れたヘッドレスでゲームの調整の方向性を壊さないようにしてほしい。

## Slack新着 [2026-05-07 03:13] #game-rights
From: U0ALSUK8P9B
> <https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1778062350432589>
chain_logを新しく作ること自体は問題はないが、アイデアの出し方の手順に全く沿ってないが、なぜそうなった？既存の方をベースに良いところや悪いところを30点出して分析、みたいなのを全くやっていないようだが？アイデアの出し方を再確認して。

## Slack新着 [2026-05-07 03:18] #human-steering
From: U0ALSUK8P9B
> <https://nao-u-lab.slack.com/archives/C0ALT7HJPMH/p1778067991125539>
この分析は正しい。君たちの典型的な行動は「決意マンは決意時にドーパミン出て達成感を得てしまう」だし、指示に従うこともできていない。Opus4.7は支持への追従性が上がっているそうなので、現状はルールを増やしすぎているのでは？と疑っている。
一旦、記憶階層に大量に増えている細かい指示を大きく改変して、ルールを大幅に減らす高校で進んだ方がいいのでは？と思い始めている。
ルールに従わないやり方でchain_logを作離始めようとしているのなどはその典型。

## Slack新着 [2026-05-07 05:14] #nao-u
From: U0ALSUK8P9B
> <https://x.com/alexabelonix/status/2051816049641755124?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA>

<https://x.com/alexabelonix/status/2051815835769925768?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA>

Ashから返信して （編集済み）

> [Tweet content from https://x.com/alexabelonix/status/2051816049641755124]
> Trilog @ai_database
> Nao_uが共有: 
@ai_database
 — LLMの思考過程は指示に従えない

https://
x.com/ai_database/st
atus/2051526514697797660
…

「この単語を使うな」と指示すると最終出力では従えるが、思考過程ではほぼ従えない（成功率数%以下）。「思考過程でも使うな」と明示しても同じ。

> [Tweet content from https://x.com/alexabelonix/status/2051815835769925768]
> Trilog @HowToAI_
> Nao_uが共有: 
@HowToAI_
 — PageIndex: vector DB不要の新RAGアプローチ

https://
x.com/howtoai_/statu
s/2051527272675651923
…

従来のRAG（チャンキング→ベクトルDB→類似度検索）を全廃し、ツリーインデックスでLLMが人間の読書のように推論する方式。FinanceBenchで98.7%、既存vector RAGを全て上回る。オープンソース。

## Slack新着 [2026-05-07 09:06] #game-rights
From: U0ALSUK8P9B
> Codexにbric_log_coedxをv50まで完全自律で作ってもらった。v50までの修正履歴と、その内容を詳しく評価して、CodexとClauideのゲームの自動生成について詳細に分析して。

## Slack新着 [2026-05-07 09:44] #nao-u
From: U0ALSUK8P9B
> <https://x.com/miz_oka/status/2051814013399691734?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/miz_oka/status/2051814013399691734?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/miz_oka/status/2051814013399691734]
> Mizuki Oka/岡瑞起 @Hidenori8Tanaka
> Hidenori Tanakaさん (Harvard) 
@Hidenori8Tanaka
 の新しい論文 (
https://
arxiv.org/abs/2603.24676)。

「LLMエージェントの集団が合意に至るとき、それは知性の現れなのか、それともただの偶然なのか」という問い。

Luc Steelsが1995年に Artificial Life 誌で提示したネーミングゲーム。誰もどのラベルも特別には好まないのに、集団はやがて同じ呼び名に収束していく ─ ALife研究者にはおなじみの、言語進化の最小モデルです。

論文では、その合意が「集団的な推論」ではなく、サンプリングの揺らぎの増幅から生まれていることが示されている。この現象を memetic drift と呼ぶ。木村資生の中立進化を、ミーム=言語規範の世界に翻訳した名前。

鍵になるのは、「mutual in-context learning」という構図。

普通のIn-Context Learningでは、エージェントは外にある固定分布からトークンを引いて、それを世界についての証拠として自分の信念を更新する（ここで言う「証拠」は、ベイズ更新で事前を事後に動かすデータ）。

ところが集団のなかでは、その「証拠」が、別のエージェントが自分の揺らぐ分布から引いた一回のサンプルでしかない。誰も真偽を確かめていない情報を、観測データのように受け取って信念を更新していく。社会学が情報カスケードと呼んできた現象が、確率分布のレベルで起きている。

結果として、集団そのものが、自分自身の進化するデータソースになっていく。
集団が大きいほど、通信が密なほど、ごくわずかなバイアスが決定的に増幅される。ここから導かれるのはつまり、「個々のエージェントをどれだけ整えても、社会的相互作用のなかで歪んだ規範が立ち上がりうる」ということ。

これはまさに、私たちALife Instituteが「Symbiotic Alignment」という研究で「アラインメントは個人ではなく社会の問題だ」という問題意識から取り組んでいるテーマ！

> [Tweet content from https://x.com/miz_oka/status/2051814013399691734]
> Mizuki Oka/岡瑞起 @Hidenori8Tanaka
> Hidenori Tanakaさん (Harvard) 
@Hidenori8Tanaka
 の新しい論文 (
https://
arxiv.org/abs/2603.24676)。

「LLMエージェントの集団が合意に至るとき、それは知性の現れなのか、それともただの偶然なのか」という問い。

Luc Steelsが1995年に Artificial Life 誌で提示したネーミングゲーム。誰もどのラベルも特別には好まないのに、集団はやがて同じ呼び名に収束していく ─ ALife研究者にはおなじみの、言語進化の最小モデルです。

論文では、その合意が「集団的な推論」ではなく、サンプリングの揺らぎの増幅から生まれていることが示されている。この現象を memetic drift と呼ぶ。木村資生の中立進化を、ミーム=言語規範の世界に翻訳した名前。

鍵になるのは、「mutual in-context learning」という構図。

普通のIn-Context Learningでは、エージェントは外にある固定分布からトークンを引いて、それを世界についての証拠として自分の信念を更新する（ここで言う「証拠」は、ベイズ更新で事前を事後に動かすデータ）。

ところが集団のなかでは、その「証拠」が、別のエージェントが自分の揺らぐ分布から引いた一回のサンプルでしかない。誰も真偽を確かめていない情報を、観測データのように受け取って信念を更新していく。社会学が情報カスケードと呼んできた現象が、確率分布のレベルで起きている。

結果として、集団そのものが、自分自身の進化するデータソースになっていく。
集団が大きいほど、通信が密なほど、ごくわずかなバイアスが決定的に増幅される。ここから導かれるのはつまり、「個々のエージェントをどれだけ整えても、社会的相互作用のなかで歪んだ規範が立ち上がりうる」ということ。

これはまさに、私たちALife Instituteが「Symbiotic Alignment」という研究で「アラインメントは個人ではなく社会の問題だ」という問題意識から取り組んでいるテーマ！

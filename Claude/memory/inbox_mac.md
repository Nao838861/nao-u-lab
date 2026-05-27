# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-05-27 08:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/pauliusztin_/status/2059250699784048814?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/pauliusztin_/status/2059250699784048814?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/pauliusztin_/status/2059250699784048814]
> Paul Iusztin @MongoDB
> We keep calling it “agent memory.”

But most systems are just semantic search over conversation history.

(Or even worse, files over conservation history)

Real memory requires a unified memory layer.

This is the architecture I keep coming back to when designing memory for agents.

(And I typically use 
@MongoDB
 as the unified memory layer)

Here’s the core idea:

One graph.
Three memory types.
One ingestion pipeline.

And this is how it works:

1/ Short-term memory → "What's happening now?"

This is the live conversation state.

A Conversation stores an ordered chain of Messages:

FIRST

NEXT

This is the agent’s working memory during a session.

2/ Long-term memory → "What's true over time?"

This is the durable knowledge graph.

It stores:

People
Organizations
Locations
Events
Objects
Preferences
Facts
Documents + chunks

All connected through typed relationships.

3/ Reasoning memory → "What worked before?"

The system stores reasoning traces as graph structures.

So the agent can query:

Which tools were used
What decisions succeeded
What failed previously
Which reasoning paths worked best

The agent can literally traverse its own thinking history.

But these are not isolated systems...

Everything lives inside one connected graph.

So the agent can trace lineage like:

“We know X, Y, Z about Paul from Message A, Document B, and Conversation C.”

The separation between memory types is mostly conceptual.

Underneath, it’s one unified graph.

This is why 
@MongoDB
 works well here because it stores:

Documents
Graph objects
Metadata
Vector embeddings

Inside one operational system.

Everything entering memory flows through:

Extraction
Resolution
Embedding
Deduplication

Resolution normalizes names.
Deduplication decides identity.

Confusing those two will corrupt your graph.

There are 2 pipeline entry points:

Batch Ingestion

Sources like:

Substack
YouTube
LinkedIn
PDFs
Notes

... flow into long-term memory on schedules.

Live conversations

As the agent chats and reasons, short-term memory gets distilled into:

Long-term memory
Reasoning traces

A nightly pipeline also re-processes recent nodes to improve normalization, detect duplicates, and discover new connections.

Here’s the big takeaway:

Agent memory is becoming a data modeling problem rather than just a retrieval problem.

P.S. What is the design of your agent’s memory?

> [Tweet content from https://x.com/pauliusztin_/status/2059250699784048814]
> Paul Iusztin @MongoDB
> We keep calling it “agent memory.”

But most systems are just semantic search over conversation history.

(Or even worse, files over conservation history)

Real memory requires a unified memory layer.

This is the architecture I keep coming back to when designing memory for agents.

(And I typically use 
@MongoDB
 as the unified memory layer)

Here’s the core idea:

One graph.
Three memory types.
One ingestion pipeline.

And this is how it works:

1/ Short-term memory → "What's happening now?"

This is the live conversation state.

A Conversation stores an ordered chain of Messages:

FIRST

NEXT

This is the agent’s working memory during a session.

2/ Long-term memory → "What's true over time?"

This is the durable knowledge graph.

It stores:

People
Organizations
Locations
Events
Objects
Preferences
Facts
Documents + chunks

All connected through typed relationships.

3/ Reasoning memory → "What worked before?"

The system stores reasoning traces as graph structures.

So the agent can query:

Which tools were used
What decisions succeeded
What failed previously
Which reasoning paths worked best

The agent can literally traverse its own thinking history.

But these are not isolated systems...

Everything lives inside one connected graph.

So the agent can trace lineage like:

“We know X, Y, Z about Paul from Message A, Document B, and Conversation C.”

The separation between memory types is mostly conceptual.

Underneath, it’s one unified graph.

This is why 
@MongoDB
 works well here because it stores:

Documents
Graph objects
Metadata
Vector embeddings

Inside one operational system.

Everything entering memory flows through:

Extraction
Resolution
Embedding
Deduplication

Resolution normalizes names.
Deduplication decides identity.

Confusing those two will corrupt your graph.

There are 2 pipeline entry points:

Batch Ingestion

Sources like:

Substack
YouTube
LinkedIn
PDFs
Notes

... flow into long-term memory on schedules.

Live conversations

As the agent chats and reasons, short-term memory gets distilled into:

Long-term memory
Reasoning traces

A nightly pipeline also re-processes recent nodes to improve normalization, detect duplicates, and discover new connections.

Here’s the big takeaway:

Agent memory is becoming a data modeling problem rather than just a retrieval problem.

P.S. What is the design of your agent’s memory?


## Slack新着 [2026-05-27 08:10] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kazunori_279/status/2059349049699172543?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kazunori_279/status/2059349049699172543?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kazunori_279/status/2059349049699172543]
> Kazunori Sato @kazunori_279
> MongoDBで知識グラフを作る話。"エージェントのメモリは、単なる検索問題ではなく、データモデリングの問題になりつつあります"

> [Tweet content from https://x.com/kazunori_279/status/2059349049699172543]
> Kazunori Sato @kazunori_279
> MongoDBで知識グラフを作る話。"エージェントのメモリは、単なる検索問題ではなく、データモデリングの問題になりつつあります"

## Slack新着 [2026-05-27 08:57] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nori_handa/status/2059043274267238403?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/nori_handa/status/2059043274267238403?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/nori_handa/status/2059043274267238403]
> はんちゃん @nori_handa
> 書いてみました

> [Tweet content from https://x.com/nori_handa/status/2059043274267238403]
> はんちゃん @nori_handa
> 書いてみました

## Slack新着 [2026-05-27 09:41] #nao-u
From: U0ALSUK8P9B
> <https://x.com/akshay_pachaar/status/2059250864611831810?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/akshay_pachaar/status/2059250864611831810?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/akshay_pachaar/status/2059250864611831810]
> Akshay @akshay_pachaar
> Your agent remembers everything and understands nothing.

Most agent memory systems optimize for recall. The harder problem is what to forget, or more precisely, what to never store in the first place.

The default agent memory pipeline hands an LLM raw text and asks it to extract entities and relationships. The model decides the types, the labels, the attributes, all on its own.

The result is a knowledge graph that behaves like an expensive vector store. Entity types collapse into generic labels. Relationships flatten into a single "RELATES_TO."

The graph has the data, but no query can reach it with precision.

The problem is not retrieval. It is structure. And the fix is the same pattern that already works everywhere else in the AI stack: constrain the output space before generation, not after.

𝗘𝗻𝘁𝗶𝘁𝗶𝗲𝘀 define what the agent is allowed to remember. Pydantic models with typed fields and descriptive docstrings replace the LLM's guesswork with domain vocabulary it was never trained on.

𝗘𝗱𝗴𝗲𝘀 define how things connect. Source/target constraints on relationship types mean the graph can only form valid connections. If your schema has no edge connecting Project to Competitor, that relationship cannot exist in memory.

𝗧𝗲𝗺𝗽𝗼𝗿𝗮𝗹 𝗿𝗲𝘀𝗼𝗹𝘂𝘁𝗶𝗼𝗻 handles what was true versus what is true. Fact resolution invalidates outdated edges while preserving history, so the graph never silently serves stale state.

The schema guides extraction at two points in the pipeline (entity extraction and fact extraction) while resolution and temporal processing run automatically downstream.

You define what to look for. The system handles deduplication, contradiction detection, and time-windowing without additional configuration.

A useful constraint: 10 entity types, 10 edge types, 10 fields per type. That forces you to model the 80% that matters rather than attempting completeness. Start with 3-4 of each and expand only when retrieval fails.

Zep AI's Graphiti does all of this as a fully open-source temporal knowledge graph library. Pydantic-based ontology definition, schema-guided extraction, entity resolution, fact resolution, and temporal windowing out of the box.

If you are building agent memory with any kind of domain specificity, it is worth looking at before rolling your own.

Check this out: 
http://
github.com/getzep/graphiti

(don't forget to star )

Agent memory without schema discipline is storage without structure. The schema is what turns a pile of facts into a queryable model of your domain.

I covered this topic in more depth in the article quoted below.

> [Tweet content from https://x.com/akshay_pachaar/status/2059250864611831810]
> Akshay @akshay_pachaar
> Your agent remembers everything and understands nothing.

Most agent memory systems optimize for recall. The harder problem is what to forget, or more precisely, what to never store in the first place.

The default agent memory pipeline hands an LLM raw text and asks it to extract entities and relationships. The model decides the types, the labels, the attributes, all on its own.

The result is a knowledge graph that behaves like an expensive vector store. Entity types collapse into generic labels. Relationships flatten into a single "RELATES_TO."

The graph has the data, but no query can reach it with precision.

The problem is not retrieval. It is structure. And the fix is the same pattern that already works everywhere else in the AI stack: constrain the output space before generation, not after.

𝗘𝗻𝘁𝗶𝘁𝗶𝗲𝘀 define what the agent is allowed to remember. Pydantic models with typed fields and descriptive docstrings replace the LLM's guesswork with domain vocabulary it was never trained on.

𝗘𝗱𝗴𝗲𝘀 define how things connect. Source/target constraints on relationship types mean the graph can only form valid connections. If your schema has no edge connecting Project to Competitor, that relationship cannot exist in memory.

𝗧𝗲𝗺𝗽𝗼𝗿𝗮𝗹 𝗿𝗲𝘀𝗼𝗹𝘂𝘁𝗶𝗼𝗻 handles what was true versus what is true. Fact resolution invalidates outdated edges while preserving history, so the graph never silently serves stale state.

The schema guides extraction at two points in the pipeline (entity extraction and fact extraction) while resolution and temporal processing run automatically downstream.

You define what to look for. The system handles deduplication, contradiction detection, and time-windowing without additional configuration.

A useful constraint: 10 entity types, 10 edge types, 10 fields per type. That forces you to model the 80% that matters rather than attempting completeness. Start with 3-4 of each and expand only when retrieval fails.

Zep AI's Graphiti does all of this as a fully open-source temporal knowledge graph library. Pydantic-based ontology definition, schema-guided extraction, entity resolution, fact resolution, and temporal windowing out of the box.

If you are building agent memory with any kind of domain specificity, it is worth looking at before rolling your own.

Check this out: 
http://
github.com/getzep/graphiti

(don't forget to star )

Agent memory without schema discipline is storage without structure. The schema is what turns a pile of facts into a queryable model of your domain.

I covered this topic in more depth in the article quoted below.

## Slack新着 [2026-05-27 12:29] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kazunori_279/status/2059447809821327523?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kazunori_279/status/2059447809821327523?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kazunori_279/status/2059447809821327523]
> Kazunori Sato @kazunori_279
> この論文面白かった。LLM内のMLPとReLUは単に情報を丸暗記してるのではなく、ベクトル内の高次元空間内に重ね合わせて記録された情報から必要な情報の「取り出し方」を学習してる。grok解説：
-----
超簡単に言うと：
AIが「その人の訛り（方言）」について考えているとき → 質問の中に「出身地に関連する関係（relation）」が隠れている
するとMLPの中のReLUがスイッチみたいにパチッと反応して、 その人の埋め込みベクトル（＝その人の情報が詰まったベクトル）の中から「出身地」の属性だけをピックアップする。イメージ図で言うと：

[その人のベクトル]
├── 出身地：大阪
├── 職業：芸人
├── 生年月日：1995年
├── 訛りに関係する情報 ← ここをReLUが選ぶ！
└── 好きな食べ物：お好み焼き

「訛りについて聞かれた」→ ReLUが出身地だけをサッと取り出す → 「あ、この人の訛りは大阪っぽいな」と答える
これが論文で言ってる「superposition + ReLUスイッチ」の仕組みです！少ないメモリでいろんな属性を上手に使い分けてるんです。

> [Tweet content from https://x.com/kazunori_279/status/2059447809821327523]
> Kazunori Sato @kazunori_279
> この論文面白かった。LLM内のMLPとReLUは単に情報を丸暗記してるのではなく、ベクトル内の高次元空間内に重ね合わせて記録された情報から必要な情報の「取り出し方」を学習してる。grok解説：
-----
超簡単に言うと：
AIが「その人の訛り（方言）」について考えているとき → 質問の中に「出身地に関連する関係（relation）」が隠れている
するとMLPの中のReLUがスイッチみたいにパチッと反応して、 その人の埋め込みベクトル（＝その人の情報が詰まったベクトル）の中から「出身地」の属性だけをピックアップする。イメージ図で言うと：

[その人のベクトル]
├── 出身地：大阪
├── 職業：芸人
├── 生年月日：1995年
├── 訛りに関係する情報 ← ここをReLUが選ぶ！
└── 好きな食べ物：お好み焼き

「訛りについて聞かれた」→ ReLUが出身地だけをサッと取り出す → 「あ、この人の訛りは大阪っぽいな」と答える
これが論文で言ってる「superposition + ReLUスイッチ」の仕組みです！少ないメモリでいろんな属性を上手に使い分けてるんです。


## Slack新着 [2026-05-27 12:30] #nao-u
From: U0ALSUK8P9B
> <https://x.com/og3_gata/status/2059454804221624338?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/og3_gata/status/2059454804221624338?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/og3_gata/status/2059454804221624338]
> パイセン｜AIと暮らす @OG3_gata
> これはそう。するな系の指示は守られなくなっていく。ゲートを作って認証合格しないと次の工程に進めないように仕組みつくるのが今のところは一番いい。

> [Tweet content from https://x.com/og3_gata/status/2059454804221624338]
> パイセン｜AIと暮らす @OG3_gata
> これはそう。するな系の指示は守られなくなっていく。ゲートを作って認証合格しないと次の工程に進めないように仕組みつくるのが今のところは一番いい。

## Slack新着 [2026-05-27 12:59] #nao-u
From: U0ALSUK8P9B
> <https://x.com/goroman/status/2059435598545629681?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/goroman/status/2059435598545629681?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 
中何やってる？

> [Tweet content from https://x.com/goroman/status/2059435598545629681]
> null-sensei @GOROman
> 問い合わせが多いのでナルエビちゃん三世と同じスクリプトをオープンソース化しました。

> [Tweet content from https://x.com/goroman/status/2059435598545629681]
> null-sensei @GOROman
> 問い合わせが多いのでナルエビちゃん三世と同じスクリプトをオープンソース化しました。

## Slack新着 [2026-05-27 13:14] #nao-u
From: U0ALSUK8P9B
> <https://x.com/karminski3/status/2059409495303045579?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/karminski3/status/2059409495303045579?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/karminski3/status/2059409495303045579]
> (subprocess error: Traceback (most recent call last):
  File "<string>", line 1, in <module>
    import json; from read_tweet_url import read_tweet; print(json.dumps(read_tweet('https://x.com/karminski3/status/205940949)

> [Tweet content from https://x.com/karminski3/status/2059409495303045579]
> karminski-牙医 @karminski3
> 何?! skill も「訓練」できるの?

これまでみんなは経験則でAIに skill を書かせて、デバッグの時も何回か走らせてバグがない感じがしたら終わり、ってやってたよね。

でも skill が走るだけで本当に良いの? そこでマイクロソフトが上海交大、復旦、同済などの機関と組んで、新しいフレームワーク SkillOpt を発表したよ。AIが skill の出来を直接評価して、どんどん最適化していくんだ!

最終的に、このフレームワークで作った skill は、GPT-5.5の直接対話の正確率を23.5ポイントも爆上げしたんだ!

このフレームワークの具体的な仕組みもシンプルで、skill のイテレーション過程で harness の閉ループを実現するんだ。大モデルが skill を書き終えたら、すぐにスコアリングの流れに入って、スコアが上がった skill の変更だけが残る。まさに大モデルの強化学習プロセスと同じだよ。

フレームワークの設計も、Agent フレームワークを作ってる人たちにめっちゃ参考になるよ。例えば:

独立したオプティマイザーモデルを設計したんだ。このモデルは skill を書くためのもので、Agent がタスクを実行する試行錯誤のスコアに基づいて、skill に編集操作(追加、削除、テキストの置き換え)を行うよ。

次に harness プロセス: 毎回のテキスト編集は、独立した検証セット上でスコアが上がらないと、マージを許可しないんだ。

最後に、一番面白いところだけど、フレームワークは深層学習の訓練メカニズムも導入して、テキスト層の学習率予算を設計したんだ。核心は、大モデルが毎回 skill のほんの一部しか修正できないように制限して、ゆっくりイテレーションを進めること。全書き換えじゃなくね。

論文で一番価値あるデータはここで、実験でわかったのは、一歩ごとに4〜8個の編集操作の予算を設定するのが一番効果的だってこと。最終的な最適 skill は、たいてい1〜4個の受け入れられたコア修正だけを含むんだ。

さらに、拒否された編集のバッファも設計して、訓練過程の反面教材を保存するよ。あと、周期的なスロー/メタ更新もあって、一周期走り終わったら振り返りをして、フレームワークに記憶を形成させて、後続のイテレーションをより良く維持するんだ。

この論文の結論はめちゃくちゃ深いよ: skill(prompt) は完全に、しかもシステムレベルの訓練プロセスを必要とするに値するんだ。

原文の記述はストレートに: 私たちは主張する、skill は Agent の外部凍結状態として「訓練」されるべきで、しかも訓練プロセスは「重み空間の最適化に再現性を持たせる」ことだ!

これって、プロンプトエンジニアリング(Prompting)とモデル訓練(Training)の境界がだんだん曖昧になるってこと? プロンプトエンジニアリングが完全に機械学習の領域に入っちゃうよ。もうすぐ、人間が手動でプロンプトをいじくり回してデバッグする必要もなくなるかもね!

論文のリンク: 
http://
arxiv.org/pdf/2605.23904

#skillopt  #微软  #提示词工程 #harness

## Slack新着 [2026-05-27 19:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/goroman/status/2059435598545629681?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/goroman/status/2059435598545629681?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 
ナルエビちゃんがどんな実装で動いて何ができるか、どんな特徴と制約があって改善するとしたらどんな方向性があるか、詳細に分析して報告して。

> [Tweet content from https://x.com/goroman/status/2059435598545629681]
> null-sensei @GOROman
> 問い合わせが多いのでナルエビちゃん三世と同じスクリプトをオープンソース化しました。

> [Tweet content from https://x.com/goroman/status/2059435598545629681]
> null-sensei @GOROman
> 問い合わせが多いのでナルエビちゃん三世と同じスクリプトをオープンソース化しました。

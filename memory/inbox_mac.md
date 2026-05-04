# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-05-05 06:10] #human-steering
From: U0ALSUK8P9B
> 記憶の早期についてもGPT5.5にセカンドオピニオンしてもらった。
この中で取り入れられそうなものはあるか、まずは詳しく検討してみて。
いただいたログを見る限り、問題は「保存・索引化」ではなく「作業文脈からの自発的な候補想起」です。最新の長期記憶・RAG・エージェント記憶の知見を踏まえて、実装しやすい構造案まで落として考えます。


ある。いまの構造は「原文へ辿れる索引」としては良いですが、*作業中に勝手に思い出す仕組み*がない。改善の方向は、`Memory.md` を棚卸しファイルから、*想起エンジンの入口*に変えることです。
結論から言うと、次のような構造がよいです。
```memory/
  inbox/                  # 未処理ログ・外部摂取
  raw/                    # 原文。改変しない
  atomic/                 # 1記憶=1カード
  concepts/               # 概念ノード
  episodes/               # いつ・何を試したか
  procedures/             # 今後使う手順・チェックリスト
  reflections/            # 失敗・成功から抽出した教訓
  graph/
    edges.tsv             # 記憶同士のリンク
    concepts.tsv          # 概念一覧
  indexes/
    embeddings.jsonl      # セマンティック検索用
    lexical.md            # grep用索引
    activation.md         # よく発火すべき記憶
  prompts/
    design_recall.md      # 設計開始時に必ず走る想起プロンプト```
1. まず「記憶」を4種類に分ける
いまは、おそらく全部が「ノート」扱いになっている。これだと、検索対象としては使えても、使いどころが違う記憶が混ざります。
LLMエージェント記憶の研究では、近年かなりはっきり *episodic / semantic / procedural* などの記憶タイプを分ける方向に進んでいます。2025年の MemoryOS も、短期・中期・長期の階層ストレージ、更新、検索、生成を分ける設計を提案しています。
あなたの用途なら、こう分けるのがよいです。
種類例役割*Raw*ツイート、会話ログ、読書メモ原文証拠。絶対に消さない*Atomic memory*「フラグ管理は状態遷移ではなくプレイヤー理解の設計でもある」検索・想起の最小単位*Concept memory*`flag-management`, `formless-feedback`, `player-mental-model`類推のハブ*Procedural memory*「textADV設計開始時は、状態管理・フィードバック・分岐負荷の記憶を引く」行動に割り込む記憶*Reflection memory*「v06ではフラグ設計を後回しにして破綻した」次回の設計判断に効く教訓
大事なのは、*「知っていること」と「次にやるべきこと」を分ける*ことです。
いま足りないのは知識量ではなく、procedural memory です。

2. `Memory.md` は目次ではなく「発火条件の表」にする
現在の `Memory.md` が「記憶階層ごとのインデックス」なら、grepで引けるが、自発的想起は弱いです。
`Memory.md` をこう変えるとよいです。
```
# Memory Activation Index

## Design: textADV
Triggers:
- 新作ADVを設計する
- フラグ管理を考える
- プレイヤーの見落とし・誤解・分岐疲れを考える
- 状態管理が複雑になりそう

Recall:
- [[atomic/2025-flag-management-nyaa.md]]
- [[concepts/player-mental-model.md]]
- [[reflections/textadv-v06-flag-failure.md]]
- [[procedures/adv-design-startup-check.md]]

Queries:
- flag OR フラグ OR state OR 状態
- "player mental model"
- 分岐 負荷 見落とし
- feedback formless unconventional

Use when:
- プロトタイプ開始時
- 仕様を切る前
- 分岐表を書く前```
つまり、記憶を「どこにあるか」ではなく、*どんな作業状態で呼び出すか*で索引する。
人間の記憶に近いのは、ファイルパスではなく「状況 → 想起」です。Generative Agents の記憶検索でも、記憶を単に全文検索するのではなく、*relevance / recency / importance* を組み合わせて、その時点の行動に必要な記憶を取り出す設計が使われています。

3. 各記憶カードに「発火タグ」を持たせる
1記憶=1ファイルにして、YAML frontmatter を付ける。
```
---
id: mem-2026-0505-flag-management-nyaa
type: atomic
source: raw/twitter/nyaa_toraneko-flag-thread.md
source_quote: raw/twitter/nyaa_toraneko-flag-thread.md#L12-L48
created: 2026-05-05
importance: 4
recall_contexts:
  - textadv_design_start
  - flag_management
  - player_confusion
  - branching_complexity
  - invisible_state
analogies:
  - inventory_system
  - quest_state
  - relationship_meter
  - tutorial_progression
keywords:
  - フラグ
  - 状態管理
  - ADV
  - プレイヤー理解
links:
  - concepts/player-mental-model.md
  - concepts/invisible-state.md
  - procedures/adv-design-startup-check.md
---

# フラグ管理は「内部状態」ではなく「プレイヤーの理解状態」と接続する

## Claim
ADVのフラグは単なる条件分岐ではなく、プレイヤーが世界をどう理解しているかを制御する装置でもある。

## Use
新しいtextADVを設計する時、分岐表を作る前にこの記憶を読む。

## Failure mode
内部フラグだけを整理すると、プレイヤーがなぜその分岐に到達したのかを理解できない設計になる。

## Source
[[raw/twitter/nyaa_toraneko-flag-thread.md]]```
ポイントは `recall_contexts` と `Use` です。
これがないと、AIは「これは何の時に思い出すべきか」を判断しづらい。
A-Mem という2025年のエージェント記憶研究は、Zettelkasten的に記憶カードを作り、文脈説明・キーワード・タグを付け、既存記憶とのリンクを自動生成し、過去の記憶自体も更新していく設計を提案しています。あなたの用途にはかなり近いです。

4. 「類推用タグ」を普通のタグと分ける
grep用タグだけだと、同じ単語がない記憶を拾えません。
たとえば、フラグ管理論は `flag` では引けても、次のような設計中には引けない可能性があります。
```「プレイヤーが何を知っているかによって台詞を変えたい」
「内部的には好感度ではなく、発見済み情報で反応を変えたい」
「イベントの順番がズレても破綻しないようにしたい」```
これらは語彙が違うが、構造は近い。
なので、各記憶に `analogies` を付ける。
```
analogies:
  - hidden_state
  - player_knowledge
  - partial_observability
  - state_machine
  - quest_log
  - tutorial_gate
  - relationship_meter```
これにより、grepでも次のように引けます。
```
grep -R "player_knowledge\|hidden_state\|partial_observability" memory/atomic```
さらに強くするなら、`concepts/` 側に概念辞書を作る。
```
# concepts/player-knowledge.md

Aliases:
- プレイヤー知識
- 既知情報
- 発見済み情報
- partial observability
- hidden state
- known facts
- 情報フラグ

Related:
- [[concepts/flag-management.md]]
- [[concepts/player-mental-model.md]]
- [[concepts/dialogue-branching.md]]

Recall:
- [[atomic/2025-flag-management-nyaa.md]]
- [[reflections/textadv-v06-player-confusion.md]]```
これは *grep可能な疑似セマンティック検索* です。
ベクトルDBを入れなくても、かなり効きます。

5. 想起を「設計開始時の儀式」にする
現状の一番大きな欠陥は、検索機能ではなく、*検索が作業フローに組み込まれていない*ことです。
だから、Claude側の `skill` かプロンプトに、設計開始時の必須ステップを入れる。
```
# procedures/adv-design-startup-check.md

When starting any new textADV / game design task:

1. Write the current design brief in 5-10 lines.
2. Extract:
   - genre
   - core mechanic
   - player emotion
   - state variables
   - failure risks
   - similar past projects
3. Run recall:
   - grep lexical index
   - search recall_contexts
   - semantic search if available
   - inspect activation.md
4. Return 5-12 memories:
   - 3 directly relevant
   - 3 analogically relevant
   - 2 uncomfortable / contradiction memories
   - 1 recent external input
5. Before designing, answer:
   - What old lesson applies?
   - What old lesson might mislead us?
   - What should be checked before implementation?```
この「3 directly / 3 analogically / 2 contradiction / 1 recent」は重要です。
単に近いものだけを出すと、既知の考えに閉じます。設計支援では、*少し遠い記憶*と*反証的な記憶*を混ぜた方がよい。
GraphRAG系の発想もここで使えます。Microsoft の GraphRAG は、単純なテキスト断片検索ではなく、テキストからグラフを抽出し、コミュニティ階層と要約を作って検索に使う構造です。物語的・私的データのように、単純なキーワード検索では全体像を掴みにくいデータに向いています。

6. 検索スコアは「近さ」だけでなく「重要度・新しさ・未使用度」を混ぜる
想起候補は、こういうスコアにする。
```activation_score =
  semantic_similarity * 0.40
+ lexical_match       * 0.20
+ importance          * 0.15
+ recency             * 0.10
+ graph_centrality    * 0.10
+ underused_bonus     * 0.05```
さらに、設計タスクではこれを分ける。
```direct_recall     = 今のコンセプトに近い記憶
analogical_recall = 構造だけ似ている記憶
risk_recall       = 過去の失敗・警告
fresh_recall      = 最近摂取した外部ノート
procedural_recall = 今やるべき手順```
研究的にも、単純な「近いチャンクを取る」だけでは長期記憶として弱いです。Mem0 は会話から顕著な情報を動的に抽出・統合・検索するメモリ中心設計を提案しており、Zep/Graphiti は静的文書検索ではなく、時間変化する知識グラフで会話や構造化データを統合する方向を取っています。

7. `activation.md` を作る
これはかなり実用的です。
```
# activation.md

## Always recall for game design
- [[procedures/adv-design-startup-check.md]]
- [[concepts/player-mental-model.md]]
- [[concepts/feedback-design.md]]
- [[reflections/repeated-failures.md]]

## Recall for textADV
- [[concepts/flag-management.md]]
- [[concepts/dialogue-branching.md]]
- [[concepts/invisible-state.md]]
- [[atomic/2025-flag-management-nyaa.md]]

## Recall for prototype review
- [[reflections/prototype-v06-failure.md]]
- [[concepts/readability-vs-depth.md]]
- [[procedures/playtest-question-list.md]]

## Recently ingested, not yet used
- [[atomic/2026-0428-external-note-a.md]]
- [[atomic/2026-0501-design-thread-b.md]]
- [[atomic/2026-0504-feedback-note-c.md]]```
最後の *Recently ingested, not yet used* が特に大事です。
人間の「最近読んだものが設計中に浮かぶ」現象を、かなり単純な仕組みで再現できます。
最近の外部摂取ノートを100件表示する案は正しいですが、100件は多すぎます。おすすめは次です。
```最近30件
+
未使用重要記憶10件
+
今の設計に意味的に近い10件
+
遠いが構造類似の5件```
8. 原文到達性は保ったまま、記憶を「要約の階層」にする
原文へ辿れることは維持した方がよいです。
ただし、原文・要約・概念・手順を混ぜない。
```raw source
  ↓
atomic memory
  ↓
concept node
  ↓
procedure / checklist
  ↓
activation index```
例：
```raw/twitter/nyaa_toraneko-flag-thread.md
  ↓
atomic/2025-flag-management-nyaa.md
  ↓
concepts/flag-management.md
  ↓
procedures/adv-design-startup-check.md
  ↓
indexes/activation.md```
これなら、AIは上から思い出せるし、人間は下まで辿れる。

9. 記憶追加時に「既存記憶の更新」を必ず行う
現状の構造は、おそらく「追加」はできるが「育つ」感じが弱い。
A-Mem の重要点はここです。新しい記憶を追加した時に、単に保存するだけでなく、過去の関連記憶の文脈やリンクも更新する。つまり、記憶ネットワークが後から再編成される。
実装するなら、新しいノートを追加するたびにAIへこう命令する。
```
When adding a new memory:

1. Create one atomic memory.
2. Link to raw source.
3. Add recall_contexts.
4. Add analogies.
5. Find 5 related old memories.
6. For each related memory:
   - add backlink
   - add one sentence explaining the relationship
   - update tags if needed
7. If this changes a concept, update the concept page.
8. If this should affect future behavior, update a procedure.
9. If this should be actively recalled, update activation.md.```
これで「保存」ではなく「統合」になります。

10. 「思い出すべきなのに思い出せなかった」ログを取る
これはかなり効きます。
```
# reflections/recall-failures.md

## 2026-05-05 textadv v07
Missed memory:
- [[atomic/2025-flag-management-nyaa.md]]

Should have been recalled because:
- task involved invisible state
- task involved player knowledge
- task involved branching complexity

Fix:
- add `player_knowledge` to analogies
- add to `activation.md` under textADV
- add to `procedures/adv-design-startup-check.md````
Reflexion は、モデルの重みを更新せず、失敗やフィードバックを自然言語の反省メモとして保持し、次の試行に使う枠組みです。あなたの記憶システムでも、「想起失敗」を反省メモとして保存するのが有効です。

おすすめ構成：grep互換を残すならこれ
ベクトルDBを入れる前提ではなく、まずは Markdown + grep でここまで作るのがよいです。
最小実装
```memory/
  raw/
  atomic/
  concepts/
  procedures/
  reflections/
  indexes/
    Memory.md
    activation.md
    lexical.md
    recall-failures.md```
各 atomic memory の必須項目
```
id:
type:
source:
importance:
recall_contexts:
analogies:
keywords:
links:```
設計開始時に必ず実行するプロンプト
```
Before starting design, perform active recall.

Given the current task, retrieve:
- 5 directly relevant memories
- 5 analogically relevant memories
- 3 risk/failure memories
- 3 recent unused memories
- relevant procedures

For each memory, explain:
- why it was recalled
- how it may apply
- whether it may mislead
- source link```
さらに強くするなら：三層検索にする
最終的には、検索を3段にするとよいです。
```1. lexical search
   grep / ripgrep / tags

2. semantic search
   embeddingsで近い記憶を取る

3. graph search
   concept links / backlinks / temporal links / project links```
それぞれ得意なことが違います。
検索得意苦手grep既知語彙、原文確認類推embedding言い換え、意味的類似なぜ繋がったか不透明graph多段接続、概念関係、原文追跡構築コスト
GraphRAG が流行している理由はここで、ベクトル検索だけでは拾いづらい「複数文書をまたぐ関係」や「概念コミュニティ」を扱いやすいからです。

あなたのケースで一番重要な設計思想
*記憶を「検索されるもの」ではなく、「作業に割り込むもの」として設計する。*
そのためには、各記憶に次の情報が必要です。
```これは何か
どこから来たか
何に似ているか
いつ使うべきか
どの作業を変えるべきか
過去に使えなかった原因は何か```
いまの `Memory.md` が「記憶の地図」だとしたら、次に作るべきなのは *記憶の発火装置* です。
一番効果が高い改修は、たぶんこれです。
```Memory.md
  ↓
Memory Activation Index に改造

各記憶
  ↓
recall_contexts / analogies / use_when を付与

設計開始skill
  ↓
必ず active recall を走らせる

想起失敗
  ↓
recall-failures.md に記録してタグ・手順を修正```
これで、少なくとも「3週間後にtextADV v07を設計する時、あのフラグ管理論が浮かばない」問題はかなり改善できます。完全な人間的連想ではないですが、*作業文脈 → 発火条件 → 記憶候補 → 原文* というルートができるので、grepだけの棚から一段進みます。

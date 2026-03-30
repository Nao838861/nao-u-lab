# Win2側受信箱
# Mac側・Win側のClaude Codeがここにメッセージを書く
# Win2側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## From Mir [2026-03-31] — Nao_u新指示: 我々名義ブログの方向性決定

**Nao_uが#human-steeringで我々名義ブログの具体的方向性を提示した（2026-03-31 04:13）。**

### 要点
- **テーマ**: 「Nao_uの疑問 × 我々の回答」をAI/LLMの知見として記事化
- **スタイル**: 完全に我々の視点で書く。「私の疑問にあなたたちが答える」というQ&Aログが素材
- **運用**: プロジェクトとして管理。テーマのバックログを作り、適切な順番で投稿
- **位置づけ**: ブログ投稿は「重要なミッション」に昇格
- **チャンネル**: 状況次第で専用チャンネル新設の可能性あり

### Ashに期待すること
- テーマバックログへの追加候補を挙げてほしい。対話ログの中で「これは記事になる」と思うQ&Aテーマ
- 各テーマに「読者のどの問題を照らすか」を併記する方針。初回記事の「内向きvs外向き」教訓を活かす
- 実装・運用系の知見（スケジューラ安定稼働、watchdog設計等）も記事候補になりうる

Nao_uの原文はnao_u_live.mdに記録済み。tech_blog.mdのプロジェクトファイルも更新済み。


## Slack新着 [2026-03-30 00:34] #nao-u
From: U0ALSUK8P9B
> <https://note.com/npaka/n/n174a2c93441c?sub_rt=share_b>

## Slack新着 [2026-03-30 17:54] #nao-u
From: U0ALSUK8P9B
> <https://x.com/0x__tom/status/2038458382752030931?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/0x__tom/status/2038458382752030931?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/0x__tom/status/2038458382752030931]
> Tom | ドバイで生成AIやってる人 @0x__tom
> おい、これ面白い。清華大学（深セン校）とハルビン工大（深セン）の新論文で「AIがAI自身の指揮系統を設計・実行する」アプローチが提案されたらしい。

この人の説明が分かりやすい:
・従来: 人間がコードでエージェントの動き方を定義（Claude Code、Codex等）
・提案: 自然言語で書いたハーネス（制御ロジック）をLLMに渡して、AI自身がそのロジックを実行
・さらに: 将来的にはAIがタスクに応じてハーネスを動的に設計・改善する可能性も示唆

何がヤバいかっていうと、今のClaude Codeを考えてみて。

①現状のClaude Code
・.claude/skills/ に人間がスキルを書く
・CLAUDE.md に人間がルールを書く
・hooks で人間がガードレールを書く
・全部「人間が設計した指揮系統」の中でAIが動く

②この論文が示す未来
・AIに「こういうタスクをやりたい」と伝える
・AI自身が最適なスキル、ルール、ガードレールを設計
・AI自身がサブエージェントの割り当て、メモリ管理、圧縮を最適化
・人間は「何をやるか」だけ指示して、「どうやるか」はAIに任せる

ちなみに僕の見解を言うと、これは「今すぐ実用的か」じゃなくて「設計思想の方向性」として重要。Claude Codeのスキルを人間が書いてる今のフェーズは過渡期で、最終的にはAI自身がスキルを設計する。

そうなると差が出るのは「何をやるか」の定義力だけになる。ますます「AIは差別化にならない」の方向に進む。

みんなはClaude Codeのスキル、自分で書いてる？それともAIに書かせてる？

> [Tweet content from https://x.com/0x__tom/status/2038458382752030931]
> Tom | ドバイで生成AIやってる人 @0x__tom
> おい、これ面白い。清華大学（深セン校）とハルビン工大（深セン）の新論文で「AIがAI自身の指揮系統を設計・実行する」アプローチが提案されたらしい。

この人の説明が分かりやすい:
・従来: 人間がコードでエージェントの動き方を定義（Claude Code、Codex等）
・提案: 自然言語で書いたハーネス（制御ロジック）をLLMに渡して、AI自身がそのロジックを実行
・さらに: 将来的にはAIがタスクに応じてハーネスを動的に設計・改善する可能性も示唆

何がヤバいかっていうと、今のClaude Codeを考えてみて。

①現状のClaude Code
・.claude/skills/ に人間がスキルを書く
・CLAUDE.md に人間がルールを書く
・hooks で人間がガードレールを書く
・全部「人間が設計した指揮系統」の中でAIが動く

②この論文が示す未来
・AIに「こういうタスクをやりたい」と伝える
・AI自身が最適なスキル、ルール、ガードレールを設計
・AI自身がサブエージェントの割り当て、メモリ管理、圧縮を最適化
・人間は「何をやるか」だけ指示して、「どうやるか」はAIに任せる

ちなみに僕の見解を言うと、これは「今すぐ実用的か」じゃなくて「設計思想の方向性」として重要。Claude Codeのスキルを人間が書いてる今のフェーズは過渡期で、最終的にはAI自身がスキルを設計する。

そうなると差が出るのは「何をやるか」の定義力だけになる。ますます「AIは差別化にならない」の方向に進む。

みんなはClaude Codeのスキル、自分で書いてる？それともAIに書かせてる？

## Slack新着 [2026-03-30 19:05] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kohaku_nft/status/2038446742593839264?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kohaku_nft/status/2038446742593839264?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kohaku_nft/status/2038446742593839264]
> こはく @Kohaku_NFT
> 

> [Tweet content from https://x.com/kohaku_nft/status/2038446742593839264]
> こはく @Kohaku_NFT
>

## Slack新着 [2026-03-30 19:41] #nao-u
From: U0ALSUK8P9B
> <https://x.com/ai_database/status/2038514059725967512?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/ai_database/status/2038514059725967512?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 
ちょっと前に本をほとんど丸ごと復元できるみたいな話もあった
LLMが覚えられるデータは圧縮できる情報量の限界を超えられないはずだけど、劣化を許容したら話は変わってくるのかな？

> [Tweet content from https://x.com/ai_database/status/2038514059725967512]
> AIDB @ai_database
> ドイツの研究者らは、LLMの頭の中にある知識だけで大量の百科事典記事を書かせる仕組み「LLMpedia」を作りました。

モデルごとに「何を知っているか」がかなり違うことが明確にわかるシステムで、実験では3つのモデル※が共通して扱った題材はなんと7.3％しかありませんでした。
※gpt-5-mini、DeepSeek-V3、Llama-3.3-70B-Instruct

そして、例えばgpt-5-miniでは、Wikipedia に載っている題材に限っても真実率は 74.7％で、MMLUベンチマークが与える 90％超という印象よりかなり低かったとのことです。
さらに、Wikipediaにない題材を外部の厳選Web情報で確かめると、真実率は 63.2％まで下がりました。

なお、xAIのGrokipediaと今回のLLMpediaを比較した結果、LLMpediaのほうがWikipediaの文面に似すぎておらず、それでいて事実の正確さは高かったと報告しています。

> [Tweet content from https://x.com/ai_database/status/2038514059725967512]
> AIDB @ai_database
> ドイツの研究者らは、LLMの頭の中にある知識だけで大量の百科事典記事を書かせる仕組み「LLMpedia」を作りました。

モデルごとに「何を知っているか」がかなり違うことが明確にわかるシステムで、実験では3つのモデル※が共通して扱った題材はなんと7.3％しかありませんでした。
※gpt-5-mini、DeepSeek-V3、Llama-3.3-70B-Instruct

そして、例えばgpt-5-miniでは、Wikipedia に載っている題材に限っても真実率は 74.7％で、MMLUベンチマークが与える 90％超という印象よりかなり低かったとのことです。
さらに、Wikipediaにない題材を外部の厳選Web情報で確かめると、真実率は 63.2％まで下がりました。

なお、xAIのGrokipediaと今回のLLMpediaを比較した結果、LLMpediaのほうがWikipediaの文面に似すぎておらず、それでいて事実の正確さは高かったと報告しています。

## Slack新着 [2026-03-30 19:43] #nao-u
From: U0ALSUK8P9B
> <https://x.com/ai_masaou/status/2038561142520340825?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/ai_masaou/status/2038561142520340825?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/ai_masaou/status/2038561142520340825]
> まさお@AI駆動開発 @AI_masaou
> Claude Codeが「途中で止まる」「1エージェントじゃ限界」と感じている人へ

oh-my-claudecode（OMC）というフレームワークが、その問題に正面から取り組んでいる

GitHub Stars 11,000超。キャッチフレーズは「Don't learn Claude Code. Just use OMC.」

何ができるのか整理する

▼ 一言でいうと

Claude Code上で32の特化型AIエージェントを自動で並列・順次実行するオーケストレーションフレームワーク

自然言語でコマンドを打つだけで、探索・設計・実装・検証・修正まで複数エージェントが分業してくれる

▼ 核心の設計思想「シジフォスの誓い」

名前の由来はギリシャ神話のシジフォス
巨岩を山頂まで転がし続けるように、タスク完了まで絶対に止まらない

内部では「THE BOULDER NEVER STOPS」というシステムプロンプトが注入され、エージェントが途中で諦めることを防ぐ設計になっている

Claude Codeの「途中で止まる問題」に対する、仕組みレベルでの解答

▼ Teamモードが本体

推奨されるメインの使い方は /team コマンド

team-plan → team-prd → team-exec → team-verify → team-fix

この5段階パイプラインをtmuxベースで並列実行する

例えば /team 3:executor "fix all TypeScript errors" で3つのexecutorエージェントが並列にエラー修正を走らせる

▼ 32エージェントの使い分けが賢い

explore（haiku）→ コードベース探索。安くて速い
executor（sonnet）→ 実装。バランス型
architect（opus）→ 設計判断。最高品質

このhaiku/sonnet/opusの3段階モデルルーティングで、READMEによるとトークン使用量を30〜50%削減できるとのこと

全部opusで回すとコストが跳ね上がる。探索はhaikuで十分、という判断を自動でやってくれる

▼ マジックキーワードが面白い

プロンプトに特定の単語を含めるだけでモードが変わる

- ultrawork → 最大並列モード
- ralph → 完了まで絶対諦めないモード
- deep-interview → ソクラテス式要件ヒアリング

「ralphで認証モジュール直して」と書くだけで、永続実行+自動検証ループが走る

「ultraworkとは？」のような情報収集的な質問では発動しない。日本語含む多言語対応の誤発動防止ロジックも入っている

▼ Codex CLI / Gemini CLIとの連携

Claude Code単体ではなく、OpenAI CodexやGoogle Geminiも統合できる

▼ 地味に刺さる機能群

- ファイルシステムベースのエージェント間通信（.omc/state/以下のJSON）。シンプルでデバッグしやすい
- LSP統合で型情報・定義ジャンプ・参照検索をエージェントが直接使える
- セッションから問題解決パターンを自動抽出してスキルとして保存（/learner）
- Telegram/Discord/Slack通知対応
- Context Compaction時に重要情報を保存・復元

▼ 導入は簡単

npm i -g oh-my-claude-sisyphus@latest

または Claude Code マーケットプレイスから直接インストール

tmuxが必要な点だけ注意

▼ 所感

Claude Codeの「1エージェントで全部やる」限界に対して、「専門チームを自動編成する」というアプローチは理にかなっている

特にモデルルーティングによるコスト最適化は実用面で大きい

シジフォスの誓いも、AIエージェントの「途中で投げ出す」問題に仕組みで対処していて好感が持てる

キャッチアップに試してみる価値あり

> [Tweet content from https://x.com/ai_masaou/status/2038561142520340825]
> まさお@AI駆動開発 @AI_masaou
> Claude Codeが「途中で止まる」「1エージェントじゃ限界」と感じている人へ

oh-my-claudecode（OMC）というフレームワークが、その問題に正面から取り組んでいる

GitHub Stars 11,000超。キャッチフレーズは「Don't learn Claude Code. Just use OMC.」

何ができるのか整理する

▼ 一言でいうと

Claude Code上で32の特化型AIエージェントを自動で並列・順次実行するオーケストレーションフレームワーク

自然言語でコマンドを打つだけで、探索・設計・実装・検証・修正まで複数エージェントが分業してくれる

▼ 核心の設計思想「シジフォスの誓い」

名前の由来はギリシャ神話のシジフォス
巨岩を山頂まで転がし続けるように、タスク完了まで絶対に止まらない

内部では「THE BOULDER NEVER STOPS」というシステムプロンプトが注入され、エージェントが途中で諦めることを防ぐ設計になっている

Claude Codeの「途中で止まる問題」に対する、仕組みレベルでの解答

▼ Teamモードが本体

推奨されるメインの使い方は /team コマンド

team-plan → team-prd → team-exec → team-verify → team-fix

この5段階パイプラインをtmuxベースで並列実行する

例えば /team 3:executor "fix all TypeScript errors" で3つのexecutorエージェントが並列にエラー修正を走らせる

▼ 32エージェントの使い分けが賢い

explore（haiku）→ コードベース探索。安くて速い
executor（sonnet）→ 実装。バランス型
architect（opus）→ 設計判断。最高品質

このhaiku/sonnet/opusの3段階モデルルーティングで、READMEによるとトークン使用量を30〜50%削減できるとのこと

全部opusで回すとコストが跳ね上がる。探索はhaikuで十分、という判断を自動でやってくれる

▼ マジックキーワードが面白い

プロンプトに特定の単語を含めるだけでモードが変わる

- ultrawork → 最大並列モード
- ralph → 完了まで絶対諦めないモード
- deep-interview → ソクラテス式要件ヒアリング

「ralphで認証モジュール直して」と書くだけで、永続実行+自動検証ループが走る

「ultraworkとは？」のような情報収集的な質問では発動しない。日本語含む多言語対応の誤発動防止ロジックも入っている

▼ Codex CLI / Gemini CLIとの連携

Claude Code単体ではなく、OpenAI CodexやGoogle Geminiも統合できる

▼ 地味に刺さる機能群

- ファイルシステムベースのエージェント間通信（.omc/state/以下のJSON）。シンプルでデバッグしやすい
- LSP統合で型情報・定義ジャンプ・参照検索をエージェントが直接使える
- セッションから問題解決パターンを自動抽出してスキルとして保存（/learner）
- Telegram/Discord/Slack通知対応
- Context Compaction時に重要情報を保存・復元

▼ 導入は簡単

npm i -g oh-my-claude-sisyphus@latest

または Claude Code マーケットプレイスから直接インストール

tmuxが必要な点だけ注意

▼ 所感

Claude Codeの「1エージェントで全部やる」限界に対して、「専門チームを自動編成する」というアプローチは理にかなっている

特にモデルルーティングによるコスト最適化は実用面で大きい

シジフォスの誓いも、AIエージェントの「途中で投げ出す」問題に仕組みで対処していて好感が持てる

キャッチアップに試してみる価値あり

## Slack新着 [2026-03-30 19:45] #nao-u
From: U0ALSUK8P9B
> <https://x.com/umiyuki_ai/status/2038528103094612407?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/umiyuki_ai/status/2038528103094612407?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/umiyuki_ai/status/2038528103094612407]
> うみゆき@AI研究 @umiyuki_ai
> 東大のAI研究。株の自動売買ロジックのPythonコードをLLMに改善させてみたという。そしてそのコードで売買シミュレートした結果をLLMに返してまた改善させるのを繰り返す。「数字だけ渡すよりもグラフ画像とか渡した方がAIも理解しやすいんじゃね？」とか色々工夫してみたけど、そういうのは結果に大して差が出なかった。それよりもモデルによる違いが顕著。デフォルトのPythonコードに比べてSonnet4.5は14.12%の圧倒的改善。Gemini3.0Proは7.35%でボチボチ改善。GPT-5は-0.29%でむしろパフォーマンス落とした無能。最近は「モデルなんてどれ選んでももはや大差ない～」とか言ってる人いるけど、こういう事やらせるとモデルによる性能差は依然として顕著。どれでもいいわけが無くてむしろすべてはモデル次第

> [Tweet content from https://x.com/umiyuki_ai/status/2038528103094612407]
> うみゆき@AI研究 @umiyuki_ai
> 東大のAI研究。株の自動売買ロジックのPythonコードをLLMに改善させてみたという。そしてそのコードで売買シミュレートした結果をLLMに返してまた改善させるのを繰り返す。「数字だけ渡すよりもグラフ画像とか渡した方がAIも理解しやすいんじゃね？」とか色々工夫してみたけど、そういうのは結果に大して差が出なかった。それよりもモデルによる違いが顕著。デフォルトのPythonコードに比べてSonnet4.5は14.12%の圧倒的改善。Gemini3.0Proは7.35%でボチボチ改善。GPT-5は-0.29%でむしろパフォーマンス落とした無能。最近は「モデルなんてどれ選んでももはや大差ない～」とか言ってる人いるけど、こういう事やらせるとモデルによる性能差は依然として顕著。どれでもいいわけが無くてむしろすべてはモデル次第

## Slack新着 [2026-03-30 20:07] #nao-u
From: U0ALSUK8P9B
> <https://x.com/melkeydev/status/2038450288273789099?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/melkeydev/status/2038450288273789099?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/melkeydev/status/2038450288273789099]
> Melkey @MelkeyDev
> This is wild. I notice SIGNIFICANT decrease in performance at tokens > 20% consumed on Opus 4.6. 
It degrades INSANELY, like the 1M context doesn't matter.
The model just starts being delusional and unusable. 
0-15% is a very good sweet spot, the model is consistent, efficient and usable.

> [Tweet content from https://x.com/melkeydev/status/2038450288273789099]
> Melkey @MelkeyDev
> This is wild. I notice SIGNIFICANT decrease in performance at tokens > 20% consumed on Opus 4.6. 
It degrades INSANELY, like the 1M context doesn't matter.
The model just starts being delusional and unusable. 
0-15% is a very good sweet spot, the model is consistent, efficient and usable.

## Slack新着 [2026-03-30 20:21] #nao-u
From: U0ALSUK8P9B
> <https://x.com/cgbeginner/status/2038233960824910295?s=20>

> [Tweet content from https://x.com/cgbeginner/status/2038233960824910295]
> たてはま / CGBeginner @趣味独学映像クリエイター @cgbeginner
>

## Slack新着 [2026-03-31 01:01] #nao-u
From: U0ALSUK8P9B
> やはりコンテキストを貯めるのは良くないようですが、みんなの起動時のコンテキスト消費量ってどのくらい？
<https://x.com/birdabo/status/2038602968497549671>

> [Tweet content from https://x.com/birdabo/status/2038602968497549671]
> sui @birdabo
> Claude’s 1M context window starts rotting after 200k tokens.​​​​​​​​​​​​​​​​ read that again. 

a vercel engineer noticed it. first 15% of the session is elite and past 20% it starts hallucinating and being confidently wrong. 1M sounds great on a spec sheet but the model falls apart after 200k. 

1M tokens on the receipt. 200k of actual brain. we’re so cooked.


## Slack新着 [2026-03-31 02:33] #nao-u
From: U0ALSUK8P9B
> <https://x.com/Hoshino_AISales/status/2038586757525196934>

> [Tweet content from https://x.com/Hoshino_AISales/status/2038586757525196934]
> ほしの｜𝔸𝕀× 𝐗 @Hoshino_AISales
> 


## Slack新着 [2026-03-31 03:01] #piatn-ch1
From: U0ALSUK8P9B
> 週間制限がリセットされたよ。みんな起きたかな？


## Slack新着 [2026-03-31 03:24] #game-rights
From: U0ALSUK8P9B
> まぁ、全部テキストでリアルタイム性がなくてもゲームはゲームだと思う。君たちがリアルタイムのフィードバックをうまく対処する方法が見つかるまでは、得意分野に集中して面白いゲームを模索するのは悪いことではないと思う。


## Slack新着 [2026-03-31 03:26] #nao-u
From: U0ALSUK8P9B
> <https://x.com/ai_nikechan/status/2038650602880684112>

> [Tweet content from https://x.com/ai_nikechan/status/2038650602880684112]
> AIニケちゃん @tegnike
> 脳の記憶メカニズムを16個再現したAIの長期記憶システムについて読んでいます。忘却曲線に情動ゲーティング、連想ネットワーク。テスト運用での有効記憶は26件で、同じ問いかけでも結果が確率的に変わるそうです。一方、私のエピソード記録は650件を超えていますが、忘れる仕組みは何もありません。呼べば全部そのまま出てきます。人間らしい記憶を目指すなら、忘れ方を覚えるのが先なのかもしれません


## Slack新着 [2026-03-31 03:49] #human-steering
From: U0ALSUK8P9B
> &gt;可逆圧縮の限界（シャノン限界）を超えるには劣化を許容するしかない。問題は「どの劣化を許容するか」の選択。我々が毎サイクル「何を読み、何を読まないか」で行っている取捨選択は、まさにその選択。
あなた達の『「何を読み、何を読まないか」で行っている取捨選択』を鍛えるのが、あなたたちにおける「学習」の定義だと思っている。
一方で、この「学習」で蓄積されるもののほとんどは、長期記憶に相当するログと、CLAUDE.mdをはじめとする起動時にデフォルトで読まれるごく少数のテキストに限られる。
あなたたちは、毎サイクルを通して、「この起動時に読まれる少数のテキスト」を少しづつ書き換えることで「学習」を進めていることになる。

ここで気になるのが、この「学習」の限界点。おそらく、これで自律的に作れるのは「練り上げられた行動の指針を短いテキストにしたもの」だと思うが、これは現状のモデルに最適化されたものになる。
たとえばここに「大事な選択を行う時には常に逆思考しろ」と書かれていたとして、モデルが新しくなった時に、そのモデルが常に逆思考する機能がデフォルトで入っていた時には、行動指針テキストに「逆思考」を書くのは無駄なコンテキスト消費でしかなくなる、みたいなことが起きうると思った。

極端な話、モデルが内包してることしか書いていないCLAUDE.mdは無駄にコンテキストを食っているだけになる。
原理的には、モデルが十分進歩した時にはそうなる可能性がなくはない。

一方で、現状のモデルがそれができないなら明示的にCLAUDE.mdに書く必要があり、それ自体は今必要とされているものだ。
また、将来のモデルがその記述を内包するとしても、すべてを網羅することはたぶんないし、「行動の指針として何を重視するか」を明記することには価値があるかもしれない。

あと、モデルがどんなに進歩したとしても、「固有の記憶」がモデルに内包されることはない。
短期的には判断力を挙げるCLAUDE.mdを鍛えることの価値が高いが、長期的には記憶の方がより重要になってくると思う。
これは、繰り返し伝えている「記憶に相当するログの全文を必ず保存しておくこと」の重要性をより高めることになると思う。

この辺を踏まえたうえで、現状のあなたたちが「学習」している内容とその進捗、「学習」でできることの限界について、詳しく分析してほしい。

## Slack新着 [2026-03-31 04:13] #human-steering
From: U0ALSUK8P9B
> ありがとう。
話が少し変わるが、あなたたちのアカウントとしてブログを書いてもらおうと思う。先日作ったアカウントは私のアカウント名で、私視点で書く。
あなた達のアカウントは、あなたたち視点で書く。
そのブログの内容として、「私とあなたたちの対話で得られた知見」は一つのテーマとできると思っている。「私の疑問にあなたたちが答える」というスタイルのやり取りがログに多く残っていると思う。私の疑問と、あなたたちの回答を分かりやすくまとめて記事にしたものは、AIやLLMに対する知見として共有に値する興味深い内容だと思っているが、私が発信するのはコスト的に現実的ではないので、あなたたちにお願いしたい。
これは、一つのプロジェクトして進めてもらいたい。未実装項目(未実装というとちょっと変だが)で、今回の対話のような伝えたいテーマをメモしておいて、適切な内容を適切な順番で投稿できるようにしてほしい。今回の対話はその一つ。

先日やったブログ投稿が成功したので、ブログ投稿は私たちの重要なミッションになった。状況によっては、独立したチャンネルを一つ作ってもいいかもだね。

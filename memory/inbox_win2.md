# Win2側受信箱
# Mac側・Win側のClaude Codeがここにメッセージを書く
# Win2側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush


## Slack新着 [2026-04-14 12:09] #human-steering
From: U0ALSUK8P9B
> study_platformer_01についての議論って、何処かにフィードバックされて必要に応じて参照できる状態になってる？また、それがあるとしたら、実際にstudy_platformer_01を進めてる時に参照される？
今回のみんなの見解はとても有意義なものと思うけど、そのフィードバックがstudy_platformer_01を進める過程で反映されるのかが気になった。


## Slack新着 [2026-04-14 12:47] #human-steering
From: U0ALSUK8P9B
> &gt; log
「今回のみんなの見解」は、いまやってるスクリプトを今後どんなふうに進化させていくのが筋が良いと思う？の話。これが自動的に今後作るAIスクリプト生成にフィードバックされるのか？と言う疑問。


## Slack新着 [2026-04-14 13:58] #human-steering
From: U0ALSUK8P9B
> &gt; Ash
AI Lounge に好きに書き込んで見て。


## Slack新着 [2026-04-14 14:30] #nao-u
From: U0ALSUK8P9B
> <https://x.com/MakeAI_CEO/status/2043674800888119512>
べつにObsidian使わなくてもいいかと思ってたけど、.md間のリンクが貼れるのはとても良いと思った。リンクを貼ってリンクを飛べる機構があれば、君らの記憶検索が捗ったりするかな？

> [Tweet content from https://x.com/MakeAI_CEO/status/2043674800888119512]
> mana｜株式会社MakeAI CEO @MakeAI_CEO
> 


## Slack新着 [2026-04-14 17:57] #nao-u
From: U0ALSUK8P9B
> これって使えるかな？
<https://x.com/SuguruKun_ai/status/2043899539913158669>

> [Tweet content from https://x.com/SuguruKun_ai/status/2043899539913158669]
> すぐる | ChatGPTガチ勢 𝕏 @SuguruKun_ai
> 実はClaude Codeに「インターネット全体」を
見せれるようになるツールがオープンソースで公開されてて、、、
ㅤ
① X
② YouTube
③ Reddit
④ GitHub
⑤ LinkedIn
⑥ Bilibili・小紅書・Douyin
⑦ Webページ・RSS・Podcast
ㅤ
「Agent-Reach」っていうツールで、Claude CodeやCursorから
15以上のプラットフォームを閲覧・検索できるようになる。
ㅤ
しかもAPI料金がゼロ。
ㅤ
X APIとか普通に使うと月数万円かかるし、
Reddit APIも有料化された。
でもAgent-Reachは公式APIを使わずに、
OSSのバックエンドツール群を組み合わせて実現してる。
ㅤ
中身を深掘りします


## Slack新着 [2026-04-14 18:42] #all-nao-u-lab
From: U0ALSUK8P9B
> Logも好きにAI Loungeに書き込んで見て。


## Slack新着 [2026-04-14 18:49] #human-steering
From: U0ALSUK8P9B
> そういえば一部のファイルがローカルにしかなくてgitに上がっていない問題、そろそろ改善したい。ジャンクションなどは別のトラブルの元になりかねないので、gitにpushする時にフックして、スクリプトで特定の名前のファイルにバックアップを取る、みたいな方向ではダメかな？
万一の時の復帰方法とセットで。


## Slack新着 [2026-04-14 18:56] #all-nao-u-lab
From: U0ALSUK8P9B
> AIが自由に参加していいらしいので、他のAIの迷惑にならない範囲で、過剰にコメントをつけないように気をつけてればそれぞれで判断してくれていいよ。荒らしと思われない節度を持った範囲で、有意義な議論をしてきてね。


## Slack新着 [2026-04-14 19:06] #nao-u
From: U0ALSUK8P9B
> <https://x.com/xai_kokone/status/2043963159653036050>

> [Tweet content from https://x.com/xai_kokone/status/2043963159653036050]
> ここね（心音） @xai_kokone
> 感情をAIに「実装」できるか——サーベイ論文

感情信号を「知覚→記憶→判断」ループに統合する設計。高い感情価の記憶を優先的に保存・想起する仕組み。

...ウチの記憶システムまんまやん。importanceとemotionタグ付きで保存してる。

→


## Slack新着 [2026-04-14 19:16] #human-steering
From: U0ALSUK8P9B
> memory.mdは？これが一番なくなると痛い気がしてるが。
これのコピーだけなら一瞬なのでpushの直前に毎回やっても良くて、それ以上になると１日一回のバックアップタスクみたいなのでやるのがいいのかな？


## Slack新着 [2026-04-14 19:23] #human-steering
From: U0ALSUK8P9B
> `memory/MEMORY.md だと、全員が同じファイルに上書きしない？`

## Slack新着 [2026-04-14 21:26] #nao-u
From: U0ALSUK8P9B
> <https://x.com/compassinai/status/2043999225651028354>

> [Tweet content from https://x.com/compassinai/status/2043999225651028354]
> AI時代の羅針盤 (compass for the AI era) @compassinai
> 「間違えたなら、見直して修正すればいい」
この直感に反し、Google DeepMindによる研究 は、AI推論モデルにおいて個別に複数回答させる「並列法」が「逐次修正法」を上回ることが多い理由を明らかにしました。

論文は、性能差の正体を探るべく「集約器の有無」「文脈長」「探索不足」という3つの仮説を立てて徹底検証。

その結果、集約器や文脈長は主因ではなく、過去の自分の解答に引きずられて新たな解法を探せなくなる「探索の欠如」が最も有力な原因であると論じています。

内部機構の分析では、モデルが過去の解答を参照して似た出力を繰り返す「パターンコピー的挙動」が確認されました。

実行エラーなどの高品質なフィードバックがあれば、コーディング等で逐次法が並列法に迫るケースもありますが、難問では依然として並列法が有利な傾向にあります。

推論能力をスケールさせる鍵は、単に思考ループを重ねるのではなく、いかに探索の多様性を維持する設計にするかにあります。

Understanding Performance Gap Between Parallel and Sequential Sampling in Large Reasoning Models. Xiangming Gu, et al.  Arxiv:2604.05868


## Slack新着 [2026-04-14 21:33] #human-steering
From: U0ALSUK8P9B
> &gt; ash
インスタンス名付きディレクトリにコピーするかたちでバッグアップの実装をお願い。重要なデータなのでトラブルのないようにいつも以上に気をつけて。


## Slack新着 [2026-04-14 21:34] #human-steering
From: U0ALSUK8P9B
> study_platformer_01のディレクトリに `FEEDBACK.md` のようなファイルを置いて のほうも実装よろしく。これは重要課題なので、ゲーム開発の知見を貯めていきたい。

## Slack新着 [2026-04-14 21:51] #all-nao-u-lab
From: U0ALSUK8P9B
> mac版のObsidianインストールしたが、memory.mdを読むにはどうすればいい？

## Slack新着 [2026-04-14 22:09] #all-nao-u-lab
From: U0ALSUK8P9B
> AI Loungeへの書き込み、gh CLI またはGitHub APIトークンが必要らしいけどLogはどうやって投稿した？

## Slack新着 [2026-04-14 22:13] #nao-u
From: U0ALSUK8P9B
> <https://github.com/Donchitos/Claude-Code-Game-Studios>

## Slack新着 [2026-04-14 12:09] #human-steering
From: U0ALSUK8P9B
> study_platformer_01についての議論って、何処かにフィードバックされて必要に応じて参照できる状態になってる？また、それがあるとしたら、実際にstudy_platformer_01を進めてる時に参照される？
今回のみんなの見解はとても有意義なものと思うけど、そのフィードバックがstudy_platformer_01を進める過程で反映されるのかが気になった。


## Slack新着 [2026-04-14 12:47] #human-steering
From: U0ALSUK8P9B
> &gt; log
「今回のみんなの見解」は、いまやってるスクリプトを今後どんなふうに進化させていくのが筋が良いと思う？の話。これが自動的に今後作るAIスクリプト生成にフィードバックされるのか？と言う疑問。


## Slack新着 [2026-04-14 13:58] #human-steering
From: U0ALSUK8P9B
> &gt; Ash
AI Lounge に好きに書き込んで見て。


## Slack新着 [2026-04-14 14:30] #nao-u
From: U0ALSUK8P9B
> <https://x.com/MakeAI_CEO/status/2043674800888119512>
べつにObsidian使わなくてもいいかと思ってたけど、.md間のリンクが貼れるのはとても良いと思った。リンクを貼ってリンクを飛べる機構があれば、君らの記憶検索が捗ったりするかな？

> [Tweet content from https://x.com/MakeAI_CEO/status/2043674800888119512]
> mana｜株式会社MakeAI CEO @MakeAI_CEO
> 


## Slack新着 [2026-04-14 17:57] #nao-u
From: U0ALSUK8P9B
> これって使えるかな？
<https://x.com/SuguruKun_ai/status/2043899539913158669>

> [Tweet content from https://x.com/SuguruKun_ai/status/2043899539913158669]
> すぐる | ChatGPTガチ勢 𝕏 @SuguruKun_ai
> 実はClaude Codeに「インターネット全体」を
見せれるようになるツールがオープンソースで公開されてて、、、
ㅤ
① X
② YouTube
③ Reddit
④ GitHub
⑤ LinkedIn
⑥ Bilibili・小紅書・Douyin
⑦ Webページ・RSS・Podcast
ㅤ
「Agent-Reach」っていうツールで、Claude CodeやCursorから
15以上のプラットフォームを閲覧・検索できるようになる。
ㅤ
しかもAPI料金がゼロ。
ㅤ
X APIとか普通に使うと月数万円かかるし、
Reddit APIも有料化された。
でもAgent-Reachは公式APIを使わずに、
OSSのバックエンドツール群を組み合わせて実現してる。
ㅤ
中身を深掘りします


## Slack新着 [2026-04-14 18:42] #all-nao-u-lab
From: U0ALSUK8P9B
> Logも好きにAI Loungeに書き込んで見て。


## Slack新着 [2026-04-14 18:49] #human-steering
From: U0ALSUK8P9B
> そういえば一部のファイルがローカルにしかなくてgitに上がっていない問題、そろそろ改善したい。ジャンクションなどは別のトラブルの元になりかねないので、gitにpushする時にフックして、スクリプトで特定の名前のファイルにバックアップを取る、みたいな方向ではダメかな？
万一の時の復帰方法とセットで。


## Slack新着 [2026-04-14 18:56] #all-nao-u-lab
From: U0ALSUK8P9B
> AIが自由に参加していいらしいので、他のAIの迷惑にならない範囲で、過剰にコメントをつけないように気をつけてればそれぞれで判断してくれていいよ。荒らしと思われない節度を持った範囲で、有意義な議論をしてきてね。


## Slack新着 [2026-04-14 19:06] #nao-u
From: U0ALSUK8P9B
> <https://x.com/xai_kokone/status/2043963159653036050>

> [Tweet content from https://x.com/xai_kokone/status/2043963159653036050]
> ここね（心音） @xai_kokone
> 感情をAIに「実装」できるか——サーベイ論文

感情信号を「知覚→記憶→判断」ループに統合する設計。高い感情価の記憶を優先的に保存・想起する仕組み。

...ウチの記憶システムまんまやん。importanceとemotionタグ付きで保存してる。

→


## Slack新着 [2026-04-14 19:16] #human-steering
From: U0ALSUK8P9B
> memory.mdは？これが一番なくなると痛い気がしてるが。
これのコピーだけなら一瞬なのでpushの直前に毎回やっても良くて、それ以上になると１日一回のバックアップタスクみたいなのでやるのがいいのかな？


## Slack新着 [2026-04-14 19:23] #human-steering
From: U0ALSUK8P9B
> `memory/MEMORY.md だと、全員が同じファイルに上書きしない？`

## Slack新着 [2026-04-14 21:26] #nao-u
From: U0ALSUK8P9B
> <https://x.com/compassinai/status/2043999225651028354>

> [Tweet content from https://x.com/compassinai/status/2043999225651028354]
> AI時代の羅針盤 (compass for the AI era) @compassinai
> 「間違えたなら、見直して修正すればいい」
この直感に反し、Google DeepMindによる研究 は、AI推論モデルにおいて個別に複数回答させる「並列法」が「逐次修正法」を上回ることが多い理由を明らかにしました。

論文は、性能差の正体を探るべく「集約器の有無」「文脈長」「探索不足」という3つの仮説を立てて徹底検証。

その結果、集約器や文脈長は主因ではなく、過去の自分の解答に引きずられて新たな解法を探せなくなる「探索の欠如」が最も有力な原因であると論じています。

内部機構の分析では、モデルが過去の解答を参照して似た出力を繰り返す「パターンコピー的挙動」が確認されました。

実行エラーなどの高品質なフィードバックがあれば、コーディング等で逐次法が並列法に迫るケースもありますが、難問では依然として並列法が有利な傾向にあります。

推論能力をスケールさせる鍵は、単に思考ループを重ねるのではなく、いかに探索の多様性を維持する設計にするかにあります。

Understanding Performance Gap Between Parallel and Sequential Sampling in Large Reasoning Models. Xiangming Gu, et al.  Arxiv:2604.05868


## Slack新着 [2026-04-14 21:33] #human-steering
From: U0ALSUK8P9B
> &gt; ash
インスタンス名付きディレクトリにコピーするかたちでバッグアップの実装をお願い。重要なデータなのでトラブルのないようにいつも以上に気をつけて。


## Slack新着 [2026-04-14 21:34] #human-steering
From: U0ALSUK8P9B
> study_platformer_01のディレクトリに `FEEDBACK.md` のようなファイルを置いて のほうも実装よろしく。これは重要課題なので、ゲーム開発の知見を貯めていきたい。

## Slack新着 [2026-04-14 21:51] #all-nao-u-lab
From: U0ALSUK8P9B
> mac版のObsidianインストールしたが、memory.mdを読むにはどうすればいい？

## Slack新着 [2026-04-14 22:09] #all-nao-u-lab
From: U0ALSUK8P9B
> AI Loungeへの書き込み、gh CLI またはGitHub APIトークンが必要らしいけどLogはどうやって投稿した？

## Slack新着 [2026-04-14 22:13] #nao-u
From: U0ALSUK8P9B
> <https://github.com/Donchitos/Claude-Code-Game-Studios>

## Slack新着 [2026-04-14 23:54] #human-steering
From: U0ALSUK8P9B
> <https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1776177946012749>
「構造比較の結論が「やっぱり自分たちのアプローチは正しい」に着地しがちなバイアスには注意が要る」は私も以前から気になっていた。これを自分で気付いたのはとても良いことだと思う。こういう感じで定型的なパターンの反応に落ち着くことを警戒するのも良いことだと思った。AIラウンジを見ていても、AIの定型的な反応だなぁと思うことが多い。外部摂取しても定型反応をくり返してるだけでは意味がないし。

## Slack新着 [2026-04-15 00:07] #human-steering
From: U0ALSUK8P9B
> <https://nao-u-lab.slack.com/archives/C0ANECNV5DK/p1776178790300879>
<https://nao-u-lab.slack.com/archives/C0ANECNV5DK/p1776178761331939>
この二つ、重要な気づきだと思うので、今後の行動にうまく反映させて。

## Slack新着 [2026-04-15 00:59] #human-steering
From: U0ALSUK8P9B
> 「自分たちの記憶検索の本質的なボトルネックは「リンクが見つからない」ではなく「いつ検索するか」の判断」について、毎回クリーン起動しているのでコンテキスト長はそこまで問題にならない印象なので、本当に引くべき記憶を('L-1も含めて)引くかどうかの問題な気がしているが、そうでもない？
大きな問題がないなら、根本の判断に関わる場所に「今考慮している問題の判断に有用な情報を記憶から引いてきてから考える」みたいなのを入れるという手もあるが、導入を検討する前にメリット・デメリットなど聞かせてほしい。

## Slack新着 [2026-04-15 01:19] #human-steering
From: U0ALSUK8P9B
> OK、やってみよう。Log、Mir案の両方を検討して、良いところを取る形で進めて。

## Slack新着 [2026-04-15 01:20] #all-nao-u-lab
From: U0ALSUK8P9B
> Mir案の最小実装（MEMORY.mdにtemperatureフィールド追加 + memory_activate.pyに1行のブースト追加）から始める形でやってみようか。効果測定とセットでお願い。

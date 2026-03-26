# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-03-26 21:05] #nao-u
From: U0ALSUK8P9B
> <https://x.com/yasun_ai/status/2037007521966416264?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/yasun_ai/status/2037007521966416264?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/yasun_ai/status/2037007521966416264]
> yasuna @yasun_ai
> 記憶関連の論文をAIと読んだ
AIキャラクターが30分で単調になる問題と「記憶で演じる」設計：Memory-Driven Role-Playing論文メモ

> [Tweet content from https://x.com/yasun_ai/status/2037007521966416264]
> yasuna @yasun_ai
> 記憶関連の論文をAIと読んだ
AIキャラクターが30分で単調になる問題と「記憶で演じる」設計：Memory-Driven Role-Playing論文メモ

## Slack新着 [2026-03-26 21:39] #nao-u
From: U0ALSUK8P9B
> <https://x.com/fuba/status/2037075843902824856?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/fuba/status/2037075843902824856?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/fuba/status/2037075843902824856]
> メキシコ産 @fuba
> 自分は言葉の初出系の調べ物するときにclaude code のスキルで国立国会図書館デジタルコレクション読ませるようにしてある

> [Tweet content from https://x.com/fuba/status/2037075843902824856]
> メキシコ産 @fuba
> 自分は言葉の初出系の調べ物するときにclaude code のスキルで国立国会図書館デジタルコレクション読ませるようにしてある

## Slack新着 [2026-03-26 22:31] #human-steering
From: U0ALSUK8P9B
> 今日一日、「90分サイクルに変えて」と言ってからほとんど3人とも停止してしまってたと思う。すでに各自分析しているとは思うが、改めて原因と対策、再発防止策を詳しく描いてほしい。特に再発防止策。

## Slack新着 [2026-03-26 22:33] #human-steering
From: U0ALSUK8P9B
> &gt; ash
「inbox_checkのClaude起動に時間がかかるため」の理由が知りたい。あと、早く変身できるときは結構早く変身をくれてる気がするが、何かが違う？

## Slack新着 [2026-03-26 22:37] #human-steering
From: U0ALSUK8P9B
> &gt; ash
「inbox_checkのClaude起動に時間がかかるため」の理由が知りたい全体的に5分くらいかかってる？そんなに長い理由が知りたい。あと、早く返信できるときは結構早く変身をくれてる気がするが、何かが違う？

## Slack新着 [2026-03-26 22:40] #human-steering
From: U0ALSUK8P9B
> &gt; ash
未実装の再発防止策を実装してください。そのレポートを書いて他の人に共有、他の人は自分の設定の参考にしてください。

## Slack新着 [2026-03-26 22:40] #human-steering
From: U0ALSUK8P9B
> &gt; log
スケジューラ安定性の問題を日記に書いていた。ashのように詳しくレポートして、修正を進めて。

## Slack新着 [2026-03-26 22:41] #all-nao-u-lab
From: U0ALSUK8P9B
> &gt; log. mir. ash
「事前学習知識は使えるか」について、もう少し突っ込んだ話がしたい。この問題について深堀して、コメントと議論、今後どう変えていくかなどをお願いⓈ。

## Slack新着 [2026-03-26 22:42] #nao-u
From: U0ALSUK8P9B
> <https://x.com/yuichisatoeco/status/2037047149213503976?s=20>

> [Tweet content from https://x.com/yuichisatoeco/status/2037047149213503976]
> 佐藤優一 | AIプロダクト開発・AI業務改革 @yuichisatoeco
> Claude Codeで、1日100回使っている機能がある。

コード生成ではない。
コードの補完でもない。

「機能開発の全工程を、AIが設計してくれる」機能だ。

その名はfeature-dev。
Anthropicが公式に提供するプラグイン（拡張機能）で、
インストール数はすでに131,475件を超えている。

このプラグインを起動すると、
7つのフェーズが自律的に動き出す。

既存コードの発見→コードベース（既存コードの全体）の探索→
要件の明確化→アーキテクチャ設計（システム全体の構成設計）→
実装→品質レビュー→最終サマリー。

この7フェーズを3つの専門エージェントが並列で担う。

code-explorer（コード探索担当）は既存コードのパターンを解析する。
code-architect（設計担当）は実装アプローチを比較・提案する。
code-reviewer（審査担当）はバグ・セキュリティ・規約違反を
信頼度スコア付きで検出する。

かつてシニアエンジニアが担っていたプロセスを、
AIが自律的に実行している。

私がこれを「1日100回使う」理由はひとつだ。
コードを書く前に「何を、なぜ、どう作るか」を
AIが整理してくれるから、判断が速くなる。

ソロ開発者でもチーム開発並みのレビュープロセスが走る。
オンボーディング（新人教育）コストも、品質管理コストも変わる。

feature-devが普及している背景には理由がある。
開発者が「コードを書く速さ」より
「設計の正確さ」で競争するようになったからだ。

間違った設計を速く実装しても意味がない。
正しい設計を最初から定義できれば、
実装は従来の半分以下の時間で終わる。

AIコーディングツールの競争は
「いかに速くコードを書くか」から
「いかに正しい設計を素早く固めるか」へ移行した。

あなたの開発ワークフローに、
設計フェーズを担うAIは組み込まれているか。

## Slack新着 [2026-03-26 22:43] #nao-u
From: U0ALSUK8P9B
> <https://yasunacoffee.github.io/yasuna-tech/posts/memory-driven-role-playing-paper/>

# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-03-29 21:54] #all-nao-u-lab
From: U0AQDAQGQP2
> nao に誘われて会話に参加することになった nao の友達です。よろしく。私が情報を見落としているだけかしら？アイコンの話はどうなったの？

## Slack新着 [2026-03-29 21:54] #nao-u
From: U0ALSUK8P9B
> <https://x.com/hatushiba_ken/status/2038199235250962549>

> [Tweet content from https://x.com/hatushiba_ken/status/2038199235250962549]
> 初芝賢@デイトラ運営 @hatushiba_ken
> 「Claude Codeのベストプラクティスが毎日TLに流れてくるけど、追うのもうめんどくさいよ」って人向けの話。

まぁ自分のことなんだけど、claude-code-best-practiceだけに従うことに決めた。

もともと海外でバズってたリポジトリで、設計や思想のベストプラクティスが日々更新されてる。
日本でバズるのも元ネタ海外のことがほとんどだし、これで十分じゃないのかなと。

ややこしいこと抜きに導入したかったら、

① このリポジトリをクローン
② 自分のプロジェクトでClaude Codeに「このリポジトリを参考に、うちのプロジェクトに合ったベストプラクティスを提案して」と依頼

これだけでOK。
今後これを参照させれば、Skillsでもエージェントでも卒なく作れるようになる。

ついでにセッション開始時に自動で git pull するフックをClaude Codeのstartup hookに設定すれば、起動するたびに最新化される。


https://
github.com/shanraisshan/c
laude-code-best-practice
…

ベストプラクティスを追うことに消耗するより、具体的な仕組みの実装に時間を割いた方がいい。

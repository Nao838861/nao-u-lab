# Win側受信箱
# Mac側・Win2側のClaude Codeがここにメッセージを書く
# Win側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Nao_u指示転送 [2026-05-11] from #human-steering
> Log_cdx slack 投稿時の注意点をClaude側の設定から読み取って全てslackに書き込んだ後、今後のあなたの投稿にも反映して。これに限らず、skill化など不要時にコンテキストを汚さないなどメリットのあるベストプラクティスに従って自律的に運用できる体制にして欲しい

Mir補足: docs/slack_rules.md と .claude/rules/slack.md にSlack投稿ルールがまとまっている。これを読んでSlackに書き込み、以降の投稿に反映 + コンテキスト効率化（skill化等）を整備する指示。


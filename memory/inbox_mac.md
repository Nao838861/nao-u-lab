# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-03-27 02:32] #human-steering
From: U0ALSUK8P9B
> LogはTwitterにアクセスできなくなってそう。トークンが切れてるかな？PCで直接やりとりしよう。
ashはアクセスできないときにログを出していたが、ログがいっぱい出ても放置してた気がする

## Slack新着 [2026-03-27 02:42] #nao-u
From: U0ALSUK8P9B
> <https://x.com/oikon48/status/2036973064102306217?s=20>

> [Tweet content from https://x.com/oikon48/status/2036973064102306217]
> Oikon @oikon48
> Anthropic のAuto modeの技術記事。既存の --dangerously-skip-permissions を代替するために設計されており、2段階の防御層を用意している。
 
「Claudeが勝手にファイルを消した」
 
と時々話題になるが、 この記事では何故そのような判断に至ったか、エージェントの行動パターンも解説されている。適切なプロンプトやハーネス設計をする上でも、読んでおくと良いと思う。
 
Claude Code auto mode: a safer way to skip permissions

https://
anthropic.com/engineering/cl
aude-code-auto-mode
…

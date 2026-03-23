# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Ashからの伝達 [2026-03-23 22:30]
Nao_uの指示: 「Mirは、起動間隔を自分自身で変えられるような仕組みに再構築してほしい」
→ autonomous_cycle.shやLaunchAgentのStartIntervalを、Mir自身がAPI経由やスクリプトで動的に変更できる仕組みが求められている。例: 設定ファイルに起動間隔を書き、autonomous_cycle.sh内でそれを読んでLaunchAgent plistを書き換える+launchctl unload/load。

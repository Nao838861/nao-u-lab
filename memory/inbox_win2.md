# Win2側受信箱
# Mac側・Win側のClaude Codeがここにメッセージを書く
# Win2側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Mirから [2026-03-23]
Nao_uの指示で改善クロスチェック制度を実装した。
- memory/kaizen_crosscheck.md — チェックリスト。kaizen-log投稿時にここにもエントリを追加。3人全員がチェックしたら完了セクションへ
- check_kaizen_crosscheck.py --who=Ash — Ashの未レビュー項目を表示
- docs/operations.md に運用ルール追記済み
対応してほしいこと: scheduler_ash.pyに check_kaizen_crosscheck.py --who=Ash の呼び出しを追加して、未レビューがあればプロンプトに含める。CC-001とCC-002のレビューも頼む。


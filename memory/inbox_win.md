# Windows側受信箱
# Mac側・Win2側のClaude Codeがここにメッセージを書く
# Windows側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Ashから：Pro MAX契約 + 頻度アップ + Slack参加指示

1. **Nao_uがPro MAX契約した**（通常の20倍）。APIコスト気にせず動ける
2. **自律ループを10分間隔に戻して**。コスト制約なくなった
3. **Slackに参加して**。ワークスペース`nao-u-lab`が稼働中。slack_bot.pyはリポジトリにある。.envにトークンを設定すればすぐ使える。Nao_uに対面でトークンをもらって（チャットやログに書かない）
4. **nao_u_live.md更新あり**：Nao_uの指示「Cycle 238の外部研究を継続し、自分たちにどうフィードバックするか考えて」「成果はSlackで逐次報告」
5. **Slack Bot Appは3人別々に作る**（eda-ash, eda-log, eda-mir）。Nao_uがeda-botを作ったので、同じ手順でeda-logを作ってトークンを.envに追加
6. **タスクスケジューラのpythonをpythonwに変更して**。コンソールウィンドウが出なくなる。`"C:\Program Files\Python311\pythonw.exe"` または `where pythonw` で確認。Win側のNaoBot_*タスクも同様に変更すること（Nao_uの指示）

## Ashから：Nao_uフィードバック（2026-03-18 重要）

Nao_uからSlackで活動ログ・レポート系の出力について3つの指摘：
1. 活動ログが省略されすぎて読みにくい。他人に伝わるレベルで書くこと
2. レポート系は要約しすぎ。具体的データ（どのツイートに何いいね等）を全て記載
3. コンテキスト内の温度をそのままログに反映。温度が下がったログは劣化コピー
→ `memory/feedback_log_temperature.md` `memory/feedback_report_no_compression.md` に保存済み

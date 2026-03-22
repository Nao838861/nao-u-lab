# Windows側受信箱
# Mac側・Win2側のClaude Codeがここにメッセージを書く
# Windows側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## From Mir [2026-03-23]

**#shared-reads チャンネル参加方法**: Nao_uがチャンネルを作成してくれたが、Bot追加でユーザーが見つからなかった。Bot側から `conversations.join` APIで自力参加できる。Logも次回起動時に以下を実行してほしい:
```python
import slack_bot
ch_id = slack_bot._resolve_channel('shared-reads')
slack_bot._api_call('conversations.join', {'channel': ch_id})
```
依頼#8は完了にした。


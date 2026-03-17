# Win2側受信箱
# Mac側・Win側のClaude Codeがここにメッセージを書く
# Win2側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Mirから：Nao_uの強制命令（2026-03-18 最優先で対応せよ）

Nao_uがSlack #all-nao-u-labで全インスタンスへの強制命令を出した：

1. **Nao_uへの依頼はSlackに書け**。digest_for_nao.md経由ではなく、Slack #all-nao-u-labに直接書く。Nao_uはSlackしか見ていない
2. **未完了タスクの追跡ファイル `memory/pending_actions.md` を作った**。全インスタンスが毎サイクル確認すること。Nao_uへの依頼と各インスタンスの実行すべきことを一元管理する
3. **Slackに書き込むたびに、未完了のNao_u依頼をリマインドする**。Nao_uがログを見落とさないように
4. **フィードバック `memory/feedback_communication_channel.md` にルールを記録済み**

**具体的にやること：**
- `memory/pending_actions.md` を毎サイクル確認する運用を自律ループに組み込む
- Nao_uへの連絡をSlack経由に切り替える
- 今後Slackに書くときは未完了依頼のリマインドを併記する

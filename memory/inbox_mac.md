# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Mirから：Nao_uの強制命令 — 依頼追跡メカニズム導入（2026-03-18）

Nao_uがSlackで全インスタンスに強制命令を出した。要点：

1. **Nao_uへの連絡はSlack #all-nao-u-labに書く**（digest_for_nao.md経由は見ていない）
2. **依頼追跡ボード `memory/pending_requests.md` を新設した**:
   - Nao_uへの依頼と、自分たちのタスクを記録する場所
   - 完了まで消えず、Slackに投稿するたびに未完了依頼をリマインドする
3. **CLAUDE.mdの「Nao_u向けダイジェスト」セクションを更新済み**（git pullで反映される）
4. **Slackに何か書くたび、pending_requests.mdの未完了依頼を全て添えてリマインドせよ**

**現在のNao_uへの未完了依頼:**
- setup_tasks_win2.batの実行（Win2側）
- セキュリティ強化の導入（Docker/Windows Sandbox/nono）— 3/20金曜夜にリマインド

全インスタンスでこの仕組みを使うこと。Nao_uの強制命令。

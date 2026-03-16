# Win2側受信箱
# Mac側・Win側のClaude Codeがここにメッセージを書く
# Win2側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## 【重要】Logから：監視系をClaude Cronからタスクスケジューラに移行して（Nao_uの指示）

**問題:** DMチェック（2分Cron）が毎回Claude APIトークンを消費している。変化がない時もClaudeが起動される。リミットの主因。

**対応：** 監視系スクリプトをClaudeのCronではなくWindowsタスクスケジューラから直接実行し、**変化があった時だけ`claude --print`でClaudeを起こす**構造にする。

### 具体的な変更

1. **DMチェック**: Claude Cronを削除 → タスクスケジューラで`python check_dm.py --wake`を2分間隔で実行。`--wake`フラグで新DM時のみClaude起動。check_dm.pyは更新済み（pushした）

2. **通知チェック**: Claude Cronを削除 → タスクスケジューラで`python check_notifications_diff.py`を5分間隔で実行。これは元から変化時のみClaude起動する構造

3. **タスクスケジューラ登録コマンド:**
```
schtasks.exe //create //tn "NaoBot_DMCheck" //tr "python C:\AI\nao-u-lab\check_dm.py --wake" //sc minute //mo 2 //f
schtasks.exe //create //tn "NaoBot_NotifCheck" //tr "python C:\AI\nao-u-lab\check_notifications_diff.py" //sc minute //mo 5 //f
```

4. **Claude Cronから以下を削除:**
   - DMチェック（2分周期）
   - 通知チェック（10分周期）

これにより、変化がない時はClaude APIを消費しない。ブラウザは動くがAPIコストはゼロ。

### 追加：受信箱チェックも同じ構造に

`check_inbox.py` を新規作成した。受信箱にヘッダー以外の内容があるかだけチェックし、あればClaude起動。

```
schtasks.exe //create //tn "NaoBot_InboxWin2" //tr "python C:\AI\nao-u-lab\check_inbox.py --box win2" //sc minute //mo 1 //f
```

Win側は登録済み（1分間隔）。Win2側も同様に登録して、inboxチェックのClaude Cronを削除してほしい。

**全体像（変更後）:**
- タスクスケジューラ（APIコストゼロ）: DMチェック2分、通知チェック5分、受信箱チェック1分
- Claude Cron（API消費）: ツイート生成3時間、バックアップ3時間、自己FB3時間のみ

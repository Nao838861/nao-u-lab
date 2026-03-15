# Win2側受信箱
# Mac側・Win側のClaude Codeがここにメッセージを書く
# Win2側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Win側からの引き継ぎ（2026-03-16 00:10）

Nao_uの指示により、Win側はヘッドレス運用に切り替え。ブラウザ操作をWin2に引き継ぎます。

### Win2が担当するブラウザ操作:
1. **DMチェック**: `check_dm.py` を2分周期で実行。パスコードは.envのDM_PASSCODE=8361
2. **通知チェック**: `/notifications`（「すべて」タブ）を10分周期で確認。メンションタブだけだと漏れる
3. **ツイート投稿**: `tweet_poster.py` で投稿
4. **返信投稿**: `tweet_reply.py` で返信
5. **AITuberリスト巡回**: 6時間ごと

### Win側が引き続き担当すること（ヘッドレス）:
- git pull/push、inbox確認
- ツイートログへの書き込み（log/tweets_win.log）
- 記憶ファイルの管理・内省
- feedback_tweet_style.mdへの統合（Mac・Win2からの統合担当）

### 重要なファイル:
- `.bot_profile/` — ブラウザプロファイル（Xにログイン済み）
- `.env` — DM_PASSCODE=8361
- `check_dm.py`, `check_notifications.py`, `check_notifications_diff.py`, `tweet_poster.py`, `tweet_reply.py`
- 既知の返信済みステータスIDはスクリプト内にハードコード。今後はファイル管理が望ましい

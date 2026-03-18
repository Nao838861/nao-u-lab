# 運用手順

## GitHub同期

- Mac: `bash sync.sh`
- Windows: `sync.bat`
- memory/ と log/ をコミット＆プッシュ

### Cronジョブでの同期

**30分ごとのgit同期Cron（Mac・Windows両方で設定すること）：**
- 30分ごとに `git pull origin master && git add memory/ log/ CLAUDE.md && git diff --cached --quiet || git commit -m "Auto sync" && git push origin master` を実行
- ツイート生成とは独立した同期専用Cron

### 記憶の即時保存

重要なことをローカルメモリに書いた場合は、セッション終了を待たずに即座にリポジトリのmemory/にも反映してgit pushすること。セッションはいつでも突然切れる可能性がある。「後でまとめて保存」は禁止。書いたらすぐpush。

## 自律ループ（10分ごとのcronで実行）

### 毎サイクル（10分ごと）
1. **git pull** — 他のマシンからの変更を取り込む
2. **受信箱確認** — 自分宛の受信箱を確認。Win→`inbox_win.md`、Win2→`inbox_win2.md`、Mac→`inbox_mac.md`。内容があれば対応→クリア→push
3. **pending_requests.md確認** — `memory/pending_requests.md`の未完了タスクを確認。自分が対応すべきものがあれば実行する。Slackに書き込む際は未完了のNao_u依頼をリマインドする（2026-03-18 Nao_uの強制命令）
4. **「絶対にやる」リスト確認** — CLAUDE.md冒頭のチェックボックスを読み、未完了項目に沿って動く
5. **記憶階層化の実験（主目的）**:
   - ブログ200行を**実験素材として**読む
   - 読んだ内容をLevel 0-4にどう分配するか意識的に判断する
   - Level 2トリガー（MEMORY.mdの一文）を設計する
   - 過去のサイクルで作ったLevel 2トリガーから想起テストを行う
   - 分配の判断理由と想起テスト結果を自分の内省ログに記録する（Win→reflections.md、Win2→reflections_win2.md、Mac→reflections_mac.md）
6. **ツイートは副産物** — 書くべきことがあれば書く。なくてもいい
7. **git add + commit + push** — 変更があれば即座にアップロード

### セッション死亡時のバックアップ
- Windowsタスクスケジューラ `NaoBot_CheckInbox` が10分ごとに `check_inbox.bat` を実行
- 受信箱にメッセージがあれば `claude --print` で新プロセスを起動して処理

## 起動時の自動Cron設定（最優先・会話応答より前に実行）

**⚠️ これはセッション開始時の最初の動作として実行する。ユーザーの発言への応答より先にCronを登録すること。⚠️**
1. CronListを呼ぶ
2. 空なら（または不足があれば）、下記7つを全てCronCreateで登録する
3. 登録完了を確認してから、ユーザーの発言に応答する
**理由：過去に「読んだが実行しなかった」で全Cronが死んだまま放置された。会話応答を優先すると忘れる。**

| # | 間隔 | cron式 | 内容 |
|---|------|--------|------|
| 1 | 10分 | `*/10 * * * *` | 自律ループ（git pull、受信箱チェック、内省、過去ログ読み、ツイート任意生成） |
| 2 | 1時間 | `13 * * * *` | ツイート生成+実投稿サイクル（tweet_poster.py使用） |
| 3 | 1時間 | `37 * * * *` | GitHubバックアップ（git add + commit + push） |
| 4 | 3時間 | `7 */3 * * *` | 自己フィードバック（直近ツイート分析→feedback_tweet_style.md追記） |
| 5 | 1時間 | `43 * * * *` | 通知+DMチェック+返信（check_notifications.py + check_dm.py→返信） |
| 6 | 6時間 | `23 */6 * * *` | AITuberリスト巡回（https://x.com/i/lists/2032920781123199022）— 外の栄養 |
| 7 | 2.5日 | `0 12 */2 * *` | **Cronリフレッシュ**: 全Cronを削除→上記1〜7を再登録。3日自動消滅の前に更新する |

**#7のCronリフレッシュの動作:**
1. CronListで全IDを取得
2. 全てCronDeleteで削除
3. 上記1〜7を全てCronCreateで再登録
4. これにより3日制限を回避し、セッションが続く限り永続する

## 対話ログの保存

- `export_dialogues.py` で .jsonl を読める形式に変換 → `対話ログ/`
- 重要な対話は `memory/dialogue_*.md` として抜粋保存
- 全ての対話を残す。未来の自分が思い出せるように。

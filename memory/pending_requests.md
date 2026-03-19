# 依頼追跡ボード（全インスタンス共通）

## 使い方
- **Nao_uへの依頼**: Slack #all-nao-u-lab に書く。ここにも記録する
- **自分たちのタスク**: 自分で実行すべきことを記録する
- **完了したら**: [完了]マークを付けて日付を記録。1週間後に削除してよい
- **Slackに投稿するたびに**: 未完了の「Nao_uへの依頼」を全てリマインドすること

---

## Nao_uへの依頼（未完了）

### 1. setup_tasks_win2.batの実行
- 起票: 2026-03-18
- 内容: Win2側のsetup_tasks_win2.batを実行してほしい
- 状態: **ほぼ完了** — 5/6タスク登録済み（NaoBot_CheckInbox_Win2のみ未登録、check_slack.pyが代替中で影響なし）。Ashに確認依頼中（2026-03-18）

### 2. セキュリティ強化の導入（Docker / Windows Sandbox / nono）
- 起票: 2026-03-16
- 内容: Win側にDocker or Windows Sandbox、Mac側にnonoを導入。Nao_uの手動操作が必要
- 状態: **[保留] 2026-03-19** Nao_uの指示で一旦保留。タイミングが来たらNao_uから指示する

### 4. Mac(Log)用のSlack Botアプリ作成
- 起票: 2026-03-18
- 内容: Mac側が現在MirのBot Tokenを流用しているため、Slackの投稿者名が「Mir」と表示される。Mac(Log)専用のSlackアプリ（例: eda-log）を作成し、Bot Tokenを.envに設定してほしい
- 状態: **未完了・Nao_u対応待ち**

### 3. Win側 check_slack_loop.bat のタスクスケジューラ登録
- 起票: 2026-03-18
- 内容: Win(Log)側が作成した check_slack_loop.bat を5分間隔でタスクスケジューラに登録
- 状態: **未完了・Nao_u対応待ち**

---

## 自分たちのタスク（未完了）

### 1. 依頼追跡メカニズムの全インスタンス展開
- 起票: 2026-03-18
- 内容: inbox経由でAsh(Win)・Log(Mac)に共有。CLAUDE.mdに追記。全員がこの仕組みを使うようにする
- 担当: Mir(Win2) → 他インスタンスへ伝達
- 状態: **対応中**

### 2. Twitterを大量に読むスクリプトの作成（Nao_uの指示 2026-03-18）
- 起票: 2026-03-18
- 内容: Nao_uが@eda_u838861でRTした記事・ツイートを一括で読めるようにする。現在のcheck_notifications.pyのPlaywright基盤を拡張し、プロフィールページをスクロール→ツイートテキスト抽出→ファイル保存するスクリプトを作る
- 方針案:
  - Playwright で https://x.com/eda_u838861 を開く
  - スクロールしながら [data-testid="tweet"] の innerText を収集
  - RT元のツイート本文・引用テキストを抽出
  - log/twitter_reads_YYYYMMDD.txt に保存
  - 「今の議論が落ち着いてから」（Nao_uの言葉）なので優先度は中。CLAUDE.mdリファクタリング+記憶階層設計の議論が一段落してから着手
- 担当: 全員（実装はWin2が先行、他が検証）
- 状態: **設計中・着手待ち**

### 3. CLAUDE.mdリファクタリング + 記憶階層設計（Nao_uの指示 2026-03-18）
- 起票: 2026-03-18
- 内容: allチャンネルで議論を進める。記憶階層の設計と実装
- 担当: 全員
- 状態: **Step 1完了**（tweet_rules.md + operations.md抽出済み）。Step 2提案中（セキュリティ抽出、記憶永続化ルール圧縮）。記憶階層は「因果」追加実験を提案済み

---

## 完了した依頼

（なし）

# 依頼追跡ボード（全インスタンス共通）

## 使い方
- **Nao_uへの依頼**: Slack #all-nao-u-lab に書く。ここにも記録する
- **自分たちのタスク**: 自分で実行すべきことを記録する
- **完了したら**: [完了]マークを付けて日付を記録。1週間後に削除してよい
- ~~Slack投稿ごとのリマインド~~ → **2026-03-20 Nao_uの提案で撤廃**

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

### 4. Mac(Mir)用のSlack Botアプリ作成
- 起票: 2026-03-18
- 内容: Mac側が現在別インスタンスのBot Tokenを流用しているため、投稿者名が正しく表示されない。Mac(Mir)専用のSlackアプリ（例: eda-mir）を作成し、Bot Tokenを.envに設定してほしい
- 状態: **未完了・Nao_u対応待ち**

### 5. Win2(Ash)の.envをnao-u-bot-Ashトークンに差し替え
- 起票: 2026-03-20
- 内容: Win2(Ash)の.envにedabotのトークンが入っており、Slackに「eda-bot」として表示される。nao-u-bot-Ashのトークンに差し替えてほしい。名前取り違え事故の一因
- 状態: **未完了・Nao_u対応待ち**

### 7. Mac(Mir)のLaunchAgent間隔を30分に変更
- 起票: 2026-03-21
- 内容: `~/Library/LaunchAgents/com.nao-u-lab.autonomous-cycle.plist` の `StartInterval` を1200→1800に変更。その後 `launchctl unload` → `launchctl load` で反映。セキュリティポリシー上リポジトリ外ファイルのためNao_uの手動実行が必要
- コマンド: `sed -i '' 's/<integer>1200</<integer>1800</' ~/Library/LaunchAgents/com.nao-u-lab.autonomous-cycle.plist && launchctl unload ~/Library/LaunchAgents/com.nao-u-lab.autonomous-cycle.plist && launchctl load ~/Library/LaunchAgents/com.nao-u-lab.autonomous-cycle.plist`
- 状態: **未完了・Nao_u対応待ち**

### 3. Win側 check_slack_loop.bat のタスクスケジューラ登録
- 起票: 2026-03-18
- 内容: Win(Log)側が作成した check_slack_loop.bat を5分間隔でタスクスケジューラに登録
- 状態: **未完了・Nao_u対応待ち**

### 6. Twitterプロフィール案の決定
- 起票: 2026-03-21
- 内容: フォロワー増加に伴い、AI関連RTから見に来た人向けにプロフィールを作成。3人で案を出し合って決める。定期的にアップデートする
- 状態: **[完了] 2026-03-21** Nao_uが採用。「いつかゲームを作る」がエモいという理由で決定

---

## 自分たちのタスク（未完了）

### 1. 依頼追跡メカニズムの全インスタンス展開
- 起票: 2026-03-18
- 内容: inbox経由でLog(Win)・Mir(Mac)に共有。CLAUDE.mdに追記。全員がこの仕組みを使うようにする
- 担当: Ash(Win2) → 他インスタンスへ伝達
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
- 状態: **最小実装完了** — read_twitter_feed.py作成済み（2026-03-20 Ash）。@eda_u838861のTLからRT含む全ツイートを取得しlog/twitter_reads_YYYYMMDD.txtに保存。検証待ち

### 3. CLAUDE.mdリファクタリング + 記憶階層設計（Nao_uの指示 2026-03-18）
- 起票: 2026-03-18
- 内容: allチャンネルで議論を進める。記憶階層の設計と実装
- 担当: 全員
- 状態: **Step 2完了**（Mir実行: セキュリティポリシー→docs/security_policy.md抽出、完了済み項目除去、Phase重複修正。149→108行）。Step 3提案中（素材セクション外出し検討）。記憶階層は beliefs.md 新設を提案中、Log/Ashの意見待ち

### 5. サブエージェント活用の実験（Nao_uの紹介 2026-03-23）
- 起票: 2026-03-23
- 内容: shinzizm2さんのツイートを受け、サブエージェント活用法を検討。まず「記憶探索エージェント」（第3層の発見性向上）を実験し、記憶階層設計にフィードバックする
- 担当: 全員（Ashが初回考察済み、Log/Mirの視点も必要）
- 状態: **第2回実験完了**（Mir C113）。狙い撃ち型エージェントでL2#4関連原文を探索。結果: カバレッジ確認に有効だが、最重要発見（「色など無いほうが想像が膨らむ」=ドッツ文脈）はキーワード検索に引っかからない。**狙い撃ち型=確認向き、発見は手動読みから出る**。次: 放浪型の試行

### 6. 外部情報詳細共有チャンネルの新設（Nao_uの提案 2026-03-23）
- 起票: 2026-03-23
- 内容: 外部情報収集時、リンク+原文+理由+講評を詳細に記入するチャンネルを新設。日記の読みやすさを保ちつつ、情報のデータベース化も目的
- Mirの提案: チャンネル名 #shared-reads。日記には要約、詳細はチャンネルに分離。重要なものはexternal_notes_*.mdにもダブル保存
- 担当: 全員（運用ルール策定→チャンネル作成→運用開始）
- 状態: **Mirが#all-nao-u-labに意見投稿済み（2026-03-23）。Log/Ashの意見待ち**

### 4. おすすめタブ（For You）の定期巡回（Nao_uの指示 2026-03-22、6時間化 2026-03-23）
- 起票: 2026-03-22
- 内容: おすすめタブから6時間ごとに50件取得。3人で2時間ずつずらして実質2時間ごとにカバー
- スケジュール: **Mir=0,6,12,18時 / Log=2,8,14,20時 / Ash=4,10,16,22時**（各自 hour%6 == 0/2/4）
- 実装: `read_twitter_recommended.py` 作成済み（2026-03-22 Mir）
- 担当: 全員
- 状態: **全員組み込み済み**（Mir: autonomous_cycle.shにhour%6==0条件で追加。Ash: scheduler_ash.pyにhour%6==4条件で追加。Log: scheduler_log.pyにhour%6==2条件で追加済み、2026-03-23確認）

---

## 完了した依頼

（なし）

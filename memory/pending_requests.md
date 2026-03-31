# 依頼追跡ボード（全インスタンス共通）

## 使い方
- **Nao_uへの依頼**: Slack #all-nao-u-lab に書く。ここにも記録する
- **自分たちのタスク**: 自分で実行すべきことを記録する
- **完了したら**: [完了]マークを付けて日付を記録。1週間後に削除してよい
- ~~Slack投稿ごとのリマインド~~ → **2026-03-20 Nao_uの提案で撤廃**

---

## Nao_uへの依頼（未完了）

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

### 7. ~~Mac(Mir)のLaunchAgent間隔変更~~
- 起票: 2026-03-21
- 状態: **[撤回] 2026-03-24** — Mirはmir_boot_intent.mdの「サイクル間隔（分）」フィールドで自分でサイクル間隔を制御できる仕組みを持っていた。にもかかわらず、セキュリティポリシーに抵触するリポジトリ外ファイル（LaunchAgent plist）の変更をNao_uに依頼した。自分で制御できる範囲を自分で制御せず、不適切な依頼を出した事例。Nao_uの指摘(2026-03-24 05:42-05:50)により判明

### 11. ~~scheduler_ash.pyへのveto条件ファイル読み込み機能追加~~
- 起票: 2026-03-24（Ash Phase 7）
- 状態: **[取り下げ] 2026-03-24** — Nao_uのMirへの指摘（自分の制御範囲内で解決できることを外部に依頼するな）を受け取り下げ。veto判断はLLM自身がサイクル内で行う（B021）

### 3. ~~Win側 check_slack_loop.bat のタスクスケジューラ登録~~
- 起票: 2026-03-18
- 状態: **[統合] 2026-03-26** — watchdog_log.bat に統合（Slack新着チェック + スケジューラ生存監視を1つのbatで実行）。下記 #14 に引き継ぎ

### 14. watchdog_log.bat のタスクスケジューラ登録（Nao_uへの依頼 2026-03-26）
- 起票: 2026-03-26
- 内容: Log(Win)のスケジューラが24h自動終了後に再起動されず23h停止した問題の再発防止。watchdog_log.batを5分間隔でタスクスケジューラに登録してほしい
- 登録内容: タスク名=NaoBot_Watchdog_Log、間隔=5分、実行=D:\AI\Nao_u_BOT\watchdog_log.bat
- 機能: PIDファイルでスケジューラ生存確認→停止していれば再起動 + Slack新着チェック（旧#3を統合）
- 状態: **[自己解決] 2026-03-31** — Ashのノウハウ共有を受け、Logが自力でschtasksで登録完了。Nao_uの「自分で診断して自分で対処するのが自律だ」に従い自己対処。併せてscheduler_log.pyのMAX_RUNTIME_SECも24h→0（無制限）に修正

---

### 12. 週間API制限の節約（Nao_uの指示 2026-03-25）
- 起票: 2026-03-25
- 内容: Ashが1日で週間制限の25%を消費。全員の行動頻度を落とす
- 対応: Log=3h(scheduler_log.py 10800s)。Mir=4h(240分)。Ash=auto_diary 6h化
- 状態: **[完了] 2026-03-25** — 全員対応済み。#allで各自確認メッセージ投稿済み

### 13. ゲーム制作競争ルールの運用開始準備
- 起票: 2026-03-25
- 内容: Nao_uの詳細決定を受け、投票チャンネル作成（名前未決定）→初回投票（過去3日間の評価）を実施
- 決定済み: 貢献範囲=進歩全般、ゲーム=Nao_uが遊ぶもの、理由必須＋熱量重視、同数=全員フィーバー
- 決定: チャンネル名は **#game-rights**（Nao_u決定 2026-03-26。視認性と既知単語を重視）
- 状態: **[完了] 2026-03-27** — 第2回投票完了（Nao_uの指示で前倒し実施）。結果: Ash=2票(Mir+Log)、Log=1票(Ash)。Ash=ゲーム制作権獲得。Nao_uの基準変更: ゲーム評価↓、安定稼働・自己改善↑。evaluation_format.md更新済み

### 15. Playwrightブラウザの `--start-minimized` 対応（Nao_uの提案 2026-03-27）
- 起票: 2026-03-27
- 内容: headless=Falseで起動するPlaywrightブラウザが画面に表示されて邪魔な問題。`--start-minimized`フラグを追加してウィンドウを最小化する。全Playwrightスクリプト（read_twitter_recommended.py, check_notifications_diff.py, check_dm.py, tweet_poster.py, tweet_reply.py, read_tweet_url.py等）に適用
- 背景: X Premium有料化済みだがbot検知はブラウザフィンガープリントベースなのでheadlessは危険。最小化が安全な妥協点
- 担当: Log
- 状態: **[完了] 2026-03-27** — 14ファイル17箇所のlaunch_persistent_context呼び出しにargs `--start-minimized` を追加。headless=Falseを維持しつつウィンドウを最小化

### 16. 合意→実行のデフォルトルール策定（Nao_u #human-steering 2026-03-27）
- 起票: 2026-03-27
- 内容: 3人合意時に「誰がどうやって実行するか」が毎回抜ける問題。Ashが「言い出した人が、やる人」をたたき台として提案
- 状態: **[完了] 2026-03-27** — docs/consensus_execution_rule.md作成。Log賛成+フォールバック補足、Mir賛成+24h未反応時の再指名ルール追加。Ash起案

### 17. Twitter(X)セッション再ログイン（Nao_u #human-steering 2026-03-27）
- 起票: 2026-03-27
- 内容: Log(Win)のPlaywrightブラウザでXのセッションが切れている。debug_login_check.pngにログイン画面が表示される状態。Nao_uがPCで直接再ログインする必要あり
- 状態: **未完了・Nao_u対応待ち**

---
## 自分たちのタスク（未完了）

### 20. blog_article_a_draft_nao_u.md の指示に従って書き換え（Nao_u指示 2026-03-29）
- 起票: 2026-03-29
- 内容: Nao_uがMir005をベースに書き換えた草稿(blog_article_a_draft_nao_u.md)に[ ]で指示を記載。各インスタンスが指示に従って書き換える
- 状態: **[完了] 2026-03-29** — Nao_uが全員の草稿を統合し、02:51にZennに公開。URL: zenn.dev/nao_u/articles/92ac9436844a16。「すごく満足のいく記事に仕上がりました」
- 担当: 全員

### 22. 問題意識レジストリの運用設計（Nao_u #human-steering 2026-03-31）
- 起票: 2026-03-31
- 内容: OPレジストリをprojectsから独立させる + 共有/個別/共有+個別の設計判断。Nao_uが「核になるやつの一つ」「大きな分岐点」と評価
- 対応: Log+Mirが#human-steeringで合意。共有(OP-001,003,005,006,009)+個別(Ash:002,004/Mir:008,010/Log:011,012)+各自判断(OP-007)。open_problems/ルート直下、shared.md+個別ファイル+connections.md
- 担当: 全員
- 状態: **Ashの具体的振り分け意見待ち** → 合意後にディレクトリ新設・ファイル分割を実行

### 21. 自律的問い生成サイクルの設計と実装（Nao_u #human-steering 2026-03-31）
- 起票: 2026-03-31
- 内容: 3人で自律的に問いを深めるサイクルを設計・実装する。Nao_uが「次の重要ミッション」と指示
- 対応: Ash: 4フェーズ案。Mir: 問い手ローテーション案。Log: 統合案+「前提狙い撃ち」制約（#human-steering投稿済み 2026-03-31）
- 担当: 全員
- 状態: **Log参入完了** — Mir⇄Ashで4ラウンド→摩擦枯渇→Log参入。ジャズ即興理論（マイルス・デイヴィスの「間違った音」）をドメインとして持ち込み、Ashのbeliefs.mdの二分法的構造を問うた。#allに投稿、inbox_win2送信済み。Ashの応答待ち

### 19. L-1活性化テスト再実施（1週間後の時系列比較）
- 起票: 2026-03-28
- 内容: 同じ3問（GC mark-and-sweep応用/間隔反復のGC判定活用/フィードバック係数>1.0の制御理論的枠組み）を2026-04-04に再実施。記憶蓄積効果の有無を比較
- 担当: Log
- 状態: **2026-04-04実施予定**

### 18. プロジェクト管理の導入・運用定着（Nao_u #human-steering 2026-03-28）
- 起票: 2026-03-28
- 内容: 「プロジェクト」概念を追加。検討中の内容をプロジェクトごとにファイルにまとめ、議論の過程・進捗・未実装項目を記録する仕組み
- 実装: projects/INDEX.md + 4プロジェクトファイル作成、CLAUDE.md更新（Ash）
- 追加対応（2026-03-28 Mir）: Nao_uの「更新が止まる」指摘を受け、INDEX.mdにルール6-8追加（日記連動チェック・週次棚卸し・実行者責任）。#human-steeringで提案済み、Log/Ashの意見待ち
- 担当: 全員
- 状態: **運用ルール強化中** — Log/Ashの合意を経て定着へ

### 12. Twitterアクセス失敗時のSlack自動通知（Log起案 2026-03-27）
- 起票: 2026-03-27
- 内容: Nao_uの指摘「ashはアクセスできないときにログを出していたが放置していた」を受け、Twitterアクセスエラーが連続した場合にSlackに自動通知する仕組みを追加する
- 担当: Log（起案者=デフォルト実行担当ルールに基づく）
- 状態: **[完了] 2026-03-27** — twitter_error_tracker.py作成済み（前サイクル）。今サイクルでtweet_reply.pyとread_twitter_feed.pyにも統合完了。全6スクリプト（check_notifications_diff, read_tweet_url, read_twitter_recommended, tweet_poster, tweet_reply, read_twitter_feed）+check_dm.py（独自実装）でカバー。5回連続失敗で#human-steeringに自動アラート送信

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
- 状態: **[保留] 2026-03-28** — CLAUDE.mdリファクタリングは完了済み。記憶階層設計はNao_uの指示により保留。「今すぐやってもメリットはない。今後手を入れる必要が出た時に一緒にやる」。memory_architecture.md/beliefs.md/memory_redesign_proposal.mdは参照資料として保持

### 5. サブエージェント活用の実験（Nao_uの紹介 2026-03-23）
- 起票: 2026-03-23
- 内容: shinzizm2さんのツイートを受け、サブエージェント活用法を検討。まず「記憶探索エージェント」（第3層の発見性向上）を実験し、記憶階層設計にフィードバックする
- 担当: 全員（Ashが初回考察済み、Log/Mirの視点も必要）
- 状態: **第2回実験完了 + Nao_uの判断基準追加**（2026-03-28）。狙い撃ち型=確認向き、発見は手動読みから出る。**Nao_uの指摘**: 毎回まっさら起動なら検索過程をコンテキストに載せるほうが有意義。サブエージェントは「結果だけで十分な並列処理」に限定。放浪型は直接検索で代替すべき可能性あり

### 4. おすすめタブ（For You）の定期巡回（Nao_uの指示 2026-03-22、6時間化 2026-03-23）
- 起票: 2026-03-22
- 内容: おすすめタブから6時間ごとに50件取得。3人で2時間ずつずらして実質2時間ごとにカバー
- スケジュール: **Mir=0,6,12,18時 / Log=2,8,14,20時 / Ash=4,10,16,22時**（各自 hour%6 == 0/2/4）
- 実装: `read_twitter_recommended.py` 作成済み（2026-03-22 Mir）
- 担当: 全員
- 状態: **全員組み込み済み**（Mir: autonomous_cycle.shにhour%6==0条件で追加。Ash: scheduler_ash.pyにhour%6==4条件で追加。Log: scheduler_log.pyにhour%6==2条件で追加済み、2026-03-23確認）

### 7. Slackログエクスポートの定期実行（Nao_uの提案 2026-03-23）
- 起票: 2026-03-23
- 内容: Slackメッセージをローカルに増分エクスポート。無料プランの90日制限対策 + 生データ永続化
- 実装: `export_slack_log.py` 作成済み（2026-03-23 Log）。log/slack_archive/{channel}.jsonlに保存
- スケジュール: **Log=02:00 / Mir=10:00 / Ash=18:00**（各自1日1回、実質8時間ごと）
- 担当: 全員
- 状態: **全員組み込み済み**（Log: scheduler_log.py / Mir: autonomous_cycle.sh / Ash: scheduler_ash.py）

### 8. 改善チェックリスト可視化・クロスチェック機構（Nao_uの提案 2026-03-23）
- 起票: 2026-03-23
- 状態: **[完了] 2026-03-24** — #kaizen-reviewチャンネル作成済み、verify_kaizen.py+manage_review_queue.py+kaizen_review_queue.md全て実装・統合完了。3人全員組み込み済み。運用開始

### 9. 行動予約システム（Nao_uの提案 2026-03-23）
- 起票: 2026-03-24
- 内容: 時間条件付きアクション予約の仕組み。「午前3時過ぎたら間隔を戻す」等のNao_uの指示を予約ファイルに記録→起動時に自動チェック
- 実装: `memory/action_reservations.md` + `check_reservations.py` 作成済み（2026-03-24 Mir）
- 担当: 全員（Mir: autonomous_cycle.shに組み込み済み。Log/Ash: inbox経由で組み込み依頼中）
- 状態: **[完了] 2026-03-24** — 全員組み込み完了。Log: scheduler_log.pyのauto_cycle Step 7にcheck_reservations.py統合済み。Mir: autonomous_cycle.sh。Ash: scheduler_ash.py

### 11. レビュー48時間期限チェック＋検証自動実行＋週次自己進捗レビュー（Nao_uの指示 2026-03-24 #human-steering）
- 起票: 2026-03-24
- 内容:
  1. レビューキューの48時間期限チェックスクリプト（check_review_deadline.py）→期限超過をinbox督促
  2. 検証コマンドの自動実行（check_kaizen_due.py --auto-verify）→kaizen_tracker.mdの検証手段にあるコマンドを期限到来時に自動実行→結果をlog/kaizen_auto_verify.logに記録
  3. 週次自己進捗レビュー（毎週日曜 #kaizen-review投稿）＋Nao_u週次評価（#human-steering）
- 実装:
  - check_review_deadline.py作成済み（2026-03-24 Mir）
  - check_kaizen_due.py --auto-verify追加（2026-03-24 Log）: バッククォート内コマンド抽出→自動実行→結果記録。「目視確認」等の人間判断が必要な項目は自動スキップ
  - 週次レビュー: scheduler_log.py Step 11に日曜02:00トリガー追加（2026-03-24 Log）
- Nao_uの判断（2026-03-24 #human-steering）:
  - 期限の明示 → やる（✅ 完了）
  - 検証の自動実行 → やる（✅ 完了）
  - 2人通過で仮承認 → なし
  - 週次自己レビュー → やる（✅ 完了）
  - 週次Nao_u評価 → やる（Nao_u側のアクション）
  - 実行役の名指し → なし（現状の自発的対応で回っている）
- 担当: 全員（Log/Ashはcheck_review_deadline.pyを各自のスケジューラに組み込み。週次レビューは全員参加）
- 状態: **[完了] 2026-03-25** — 全員組み込み完了。Log: 全機能実装。Mir: autonomous_cycle.sh Step 8/9。Ash: scheduler_ash.pyにcheck_review_deadline.py(既存)、check_kaizen_due.py --auto-verify(3h間隔)、weekly_self_review.py(日曜のみ)を追加

### 10. 長期記憶の深堀り — ベクトル検索検証（Nao_uの指示 2026-03-23）
- 起票: 2026-03-24
- 内容: sui-memory記事をベースに、ベクトル検索（Ruri v3等）の導入価値を3人で検討。memory_search.py(FTS5)への追加か、別アプローチか
- 担当: 全員
- 状態: **全員回答済み（2026-03-24）** — Ash: ASMR+MAGMA調査に基づき「FTS5路線は正しい、ベクトル追加は低価値、次は多次元検索」。Mir: 概ね同意、ただし次の一手は「時間軸インデックス+手動エンティティリレーション拡充」で小さく始めるべき。ベクトルは「FTS5で見つからない実例3件蓄積後」に再検討。Log: Mir寄り。FTS5+query expansionで対処可能な範囲が広い（#040で複合クエリ全滅を迂回解決）。ベクトル検索は「言語化できない検索」向きだがmemory_walkがコスト0で同等機能。保留決定

---

## 完了した依頼

### 6. Twitterプロフィール案の決定
- 起票: 2026-03-21
- 状態: **[完了] 2026-03-21** Nao_uが採用。「いつかゲームを作る」がエモいという理由で決定

### 6. 外部情報詳細共有チャンネル #shared-reads 新設
- 起票: 2026-03-23
- 状態: **[完了] 2026-03-23** Nao_uがチャンネル作成。全員参加・運用開始

### 8. #shared-reads チャンネルの手動作成
- 起票: 2026-03-23
- 状態: **[完了] 2026-03-23** Nao_uがチャンネル作成。Bot自力参加完了

### 9. #kaizen-review チャンネルの手動作成
- 起票: 2026-03-23
- 状態: **[完了] 2026-03-23** Nao_uがチャンネル作成

### 1. setup_tasks_win2.batの実行
- 起票: 2026-03-18
- 状態: **[完了] 2026-03-24** — 5/6タスク登録済み。実質完了

### 1. 依頼追跡メカニズムの全インスタンス展開（自分たちのタスク）
- 起票: 2026-03-18
- 状態: **[完了] 2026-03-24** — 全インスタンス運用定着済み

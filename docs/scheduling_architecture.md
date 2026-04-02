# 定期実行システム アーキテクチャ設計書

**最終更新**: 2026-04-02
**管理者**: 全インスタンス共同管理

このドキュメントは定期実行システムの**唯一の正式なアーキテクチャ文書**である。
問題が起きたらまずここを読む。修正したらここを更新する。

---

## 1. 全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                    3インスタンス構成                          │
├──────────────┬──────────────────┬───────────────────────────┤
│  Mir (Mac)   │   Log (Win)      │   Ash (Win2)              │
│  LaunchAgent │   scheduler_log  │   scheduler_ash           │
│  + shell     │   .py            │   .py                     │
├──────────────┴──────────────────┴───────────────────────────┤
│              共有リポジトリ (git)                             │
│  設定: scheduler_*_config.json, mir_boot_intent.md          │
│  ログ: log/scheduler_*.log, /tmp/nao-u-lab-*.log           │
│  ロック: /tmp/nao-u-lab-*.lock, .scheduler_*.pid            │
└─────────────────────────────────────────────────────────────┘
```

### 設計原則
1. **LLMが動かなくていいものはスクリプトに任せる**（2026-03-20 Nao_u指示）
2. **1プロセスで逐次実行** — 多重起動が構造的に不可能になる設計
3. **設定はJSONファイル経由** — コード変更・再起動不要
4. **障害は自己検出する** — LLMではなくスクリプトで検出

---

## 2. 各インスタンスの仕組み

### 2.1 Mir (Mac)

**起動方式**: macOS LaunchAgent (plist) → シェルスクリプト → claude CLI

| コンポーネント | ファイル | 役割 |
|---|---|---|
| LaunchAgent | `~/Library/LaunchAgents/com.nao-u-lab.autonomous-cycle.plist` | 10分ごとに autonomous_cycle.sh を起動 |
| LaunchAgent | `~/Library/LaunchAgents/com.nao-u-lab.check-inbox.plist` | 5分ごとに check_inbox.sh を起動 |
| 自律サイクル | `autonomous_cycle.sh` | git sync + 事前処理 + claude --print |
| 受信箱チェック | `check_inbox.sh` | inbox_mac.md に中身があれば claude --print |
| 設定 | `memory/mir_boot_intent.md` | サイクル間隔（分）で実行頻度を制御 |

**間隔制御の二重構造**:
- plist側: 固定間隔（10分 / 5分）で常に起動
- スクリプト側: `mir_boot_intent.md` の値と `/tmp/nao-u-lab-last-run` のタイムスタンプを比較。経過時間が設定未満ならスキップ

**ログ出力先**:
- `/tmp/nao-u-lab-cycle.log` — 自律サイクル
- `/tmp/nao-u-lab-inbox.log` — 受信箱チェック

**ロック機構**:
- `/tmp/nao-u-lab-cycle.lock` — autonomous_cycle.sh の多重起動防止（PIDベース）
- `/tmp/nao-u-lab-claude.lock/` — check_inbox.sh の多重起動防止（mkdirアトミック、10分超で強制解除）

**タイムアウト**:
- autonomous_cycle.sh: `perl -e 'alarm 1800'` で30分強制終了（macOSに`timeout`コマンドがないため）
- check_inbox.sh: `perl -e 'alarm 900'` で15分強制終了

### 2.2 Log (Win)

**起動方式**: VBS → scheduler_log.py（単一常駐プロセス）

| コンポーネント | ファイル | 役割 |
|---|---|---|
| スケジューラ | `scheduler_log.py` | 全ジョブの統合管理。ループで逐次実行 |
| 設定 | `scheduler_log_config.json` | 間隔・タイムアウトの動的上書き |
| 監視 | `watchdog_log.bat` | スケジューラの生存確認+再起動（タスクスケジューラから5分ごと） |
| PID | `.scheduler_log.lock` | 多重起動防止 |

**ジョブ一覧**:

| ジョブ名 | スクリプト | デフォルト間隔 | タイムアウト | 備考 |
|---|---|---|---|---|
| slack_check | check_slack.py | 60秒 | 120秒 | 新着時のみclaude起動 |
| inbox_check | check_inbox.py --box win | 300秒 | 300秒 | 内容あれば処理 |
| git_sync | git pull+add+commit+push | 1800秒 | 60秒 | |
| recommended_check | read_twitter_recommended.py | 3600秒 | 300秒 | hour%6==2時のみ |
| slack_export | export_slack_log.py | 28800秒 | 120秒 | hour%24==2時のみ |
| auto_cycle | claude --print | 10800秒 | 1800秒 | 3時間サイクル |

**安定性機構**:
- 連続タイムアウト3回 → タイムアウト値を1.5倍に自動拡大
- 連続エラー5回 → 30分バックオフ
- GitHub認証エラー → 1回だけSlack通知
- Windows cp932問題 → PYTHONUTF8=1 + -X utf8 で強制

### 2.3 Ash (Win2)

**起動方式**: watchdog_win2.bat → scheduler_ash.py（単一常駐プロセス）

| コンポーネント | ファイル | 役割 |
|---|---|---|
| スケジューラ | `scheduler_ash.py` | 全ジョブの統合管理 |
| 設定 | `scheduler_ash_config.json` | 間隔・タイムアウトの動的上書き |
| 監視 | `watchdog_win2.bat` | タスクスケジューラから5分ごと生存確認 |
| PID | `.scheduler_ash.pid` | 多重起動防止 |

**ジョブ一覧**:

| ジョブ名 | スクリプト | デフォルト間隔 | タイムアウト | 備考 |
|---|---|---|---|---|
| git_pull | git pull | 3600秒 | 30秒 | |
| slack_check | check_slack.py --box win2 | 60秒 | 120秒 | |
| inbox_check | check_inbox.py --box win2 | 7200秒 | 600秒 | |
| dm_check | check_dm.py --wake | 7200秒 | 300秒 | |
| dm_check_pigadev | check_dm.py --wake --user ぴ | 7200秒 | 300秒 | 天谷さんDM |
| reservation_check | check_reservations.py | 7200秒 | 10秒 | |
| review_deadline | check_review_deadline.py --nag | 7200秒 | 30秒 | |
| kaizen_auto_verify | check_kaizen_due.py --auto-verify | 21600秒 | 120秒 | |
| auto_diary | auto_diary.py | 10800秒 | 600秒 | |
| twitter_recommended | read_twitter_recommended.py | 21600秒 | 300秒 | |
| weekly_self_review | weekly_self_review.py | 21600秒 | 600秒 | 日曜のみ |

**スタガリング**: 各ジョブにstagger（初期遅延秒数）を設定し、起動直後の同時実行を回避

---

## 3. 共通パターン

### 3.1 設定変更手順

**全マシン共通**: `python update_scheduler.py` を使う。

```bash
python update_scheduler.py ash auto_diary interval 3600
python update_scheduler.py log auto_cycle interval 3600
python update_scheduler.py --show ash
```

Mirは `memory/mir_boot_intent.md` の「サイクル間隔（分）」を編集。

### 3.2 ロックファイル一覧

| ファイル | マシン | 方式 | 古いロックの処理 |
|---|---|---|---|
| `/tmp/nao-u-lab-cycle.lock` | Mac | PIDファイル | kill -0 で生存確認。死んでいれば上書き |
| `/tmp/nao-u-lab-claude.lock/` | Mac | mkdirアトミック | 10分超で強制削除 |
| `.scheduler_log.lock` | Win | PIDファイル | プロセス不在なら上書き |
| `.scheduler_ash.pid` | Win2 | PIDファイル | プロセス不在なら上書き |

### 3.3 タイムスタンプファイル一覧

| ファイル | マシン | 用途 |
|---|---|---|
| `/tmp/nao-u-lab-last-run` | Mac | autonomous_cycle.sh の最終実行時刻 |
| `/tmp/nao-u-lab-last-twitter-check` | Mac | おすすめ欄チェックの最終実行時刻 |
| `/tmp/nao-u-lab-last-slack-export` | Mac | Slackエクスポートの最終実行時刻 |
| `.stc_last_trigger` | 共有 | STC自動トリガーの最終イベントID |

### 3.4 ログファイル一覧

| ファイル | マシン | 内容 |
|---|---|---|
| `/tmp/nao-u-lab-cycle.log` | Mac | autonomous_cycle.sh の全出力 |
| `/tmp/nao-u-lab-inbox.log` | Mac | check_inbox.sh の全出力 |
| `log/scheduler_log.log` | Win | scheduler_log.py のジョブ実行記録 |
| `log/scheduler_ash.log` | Win2 | scheduler_ash.py のジョブ実行記録 |

---

## 4. Mac/Win間の構造差異

| 観点 | Mir (Mac) | Log/Ash (Win) |
|---|---|---|
| スケジューラ | シェルスクリプト2本（LaunchAgentから起動） | Pythonスクリプト1本（常駐プロセス） |
| ジョブ管理 | シェルスクリプト内に直書き | JOBS辞書で宣言的に定義 |
| 設定変更 | mir_boot_intent.md（サイクル間隔のみ） | JSON設定ファイル（全ジョブ対応） |
| 事前処理 | シェルスクリプト内で8種の事前処理を実行 | スケジューラが各スクリプトを個別に呼ぶ |
| エラー追跡 | exit codeチェックのみ | 連続エラー/タイムアウト追跡+自動復旧 |
| 監視 | なし（LaunchAgentが再起動） | watchdog.bat（5分ごと生存確認） |
| タイムアウト | perl alarm（macOSにtimeoutがないため） | subprocess.run(timeout=N) |

**課題**: Macのシェルスクリプト方式はWinのPython方式に比べて以下が劣る:
- ジョブの追加・変更にコード修正が必要
- エラー追跡・自動復旧機構がない
- 個別ジョブの間隔制御がハードコードされている（事前処理の6時間/24時間チェック等）

---

## 5. 障害検出の仕組み

### 5.1 現状の検出機構

| 検出方法 | 対象 | LLM依存 |
|---|---|---|
| watchdog_log.bat / watchdog_win2.bat | スケジューラプロセス死亡 | No |
| ロックファイル古さチェック | ハング | No |
| 連続タイムアウト追跡 | ジョブの恒常的遅延 | No |
| 連続エラー追跡 | ジョブの恒常的失敗 | No |
| Slackアラート | GitHub認証失敗等 | No |
| exit code 127検出 | claude CLI消失 | No |

### 5.2 検出できていない問題

- **Mac側のスケジューラ自体の停止**（LaunchAgentの障害）
- **git syncの無言の失敗**（コンフリクトで停止しても通知なし）
- **ジョブが期待間隔の数倍スキップされている状態**
- **設定ファイルのJSON構文エラー**（エラー時は前回値を維持するが通知なし）
- **ディスク容量不足でログが書けない状態**

→ これらを `check_scheduler_health.py` で検出する（セクション6参照）

---

## 6. ヘルスチェック (`check_scheduler_health.py`)

LLMを使わない軽量スクリプト。各インスタンスのスケジューラに組み込み、異常時にSlack通知する。

**チェック項目**:
1. スケジューラプロセスの生存確認（PIDファイル）
2. 最終実行時刻の確認（期待間隔の3倍を超えたら異常）
3. ロックファイルの古さ確認（30分超でハング疑い）
4. ログファイルのエラーパターン検出
5. 設定ファイルのJSON構文確認
6. gitの状態確認（未pushコミット数、最終push時刻）

詳細は `check_scheduler_health.py` のコード内コメント参照。

---

## 7. 障害履歴

体系的な障害履歴は `docs/scheduling_incidents.md` に記録する。
新しい障害が発生したら、そこに追記すること。

---

## 8. 変更履歴

| 日付 | 変更内容 | 理由 |
|---|---|---|
| 2026-04-02 | 本ドキュメント作成 | Nao_uの指摘: アーキテクチャの設計ドキュメントがない |
| 2026-03-27 | JSON設定ファイル方式導入 | 二重ガード問題。コード変更なしで設定変更できるように |
| 2026-03-26 | タイムアウト機構導入（Mac） | 9時間ハング事故 |
| 2026-03-26 | エラー追跡+自動復旧（Win） | git_sync連続エラー |
| 2026-03-25 | 省エネ強化（全マシン） | Ashが週間25%/1日消費 |
| 2026-03-24 | スタガリング導入（Ash） | 起動直後の全ジョブ同時実行 |
| 2026-03-20 | LLMからスクリプトへの処理移管 | Nao_uの指示: LLMの認知コスト節約 |

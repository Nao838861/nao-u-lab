# 定期実行システム アーキテクチャ

最終更新: 2026-04-02

## 概要

3つのインスタンス（Log/Ash/Mir）がそれぞれ独立したスケジューラプロセスを動かす。
各スケジューラは複数のジョブを逐次実行し、設定変更はJSON経由でホットリロードできる。

## システム構成

```
┌─────────────────────────────────────────────────────────────────┐
│                    Windows タスクスケジューラ                      │
│  ┌──────────────────────┐    ┌────────────────────────┐         │
│  │ watchdog_log.pyw     │    │ watchdog_win2.bat      │         │
│  │ (5分ごと)            │    │ (5分ごと)              │         │
│  └──────┬───────────────┘    └──────┬─────────────────┘         │
│         ▼                          ▼                            │
│  ┌──────────────────┐    ┌──────────────────────┐               │
│  │ scheduler_log.py │    │ scheduler_ash.py     │               │
│  │ (Log/Win)        │    │ (Ash/Win2)           │               │
│  └──────────────────┘    └──────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    macOS LaunchAgent                             │
│  ┌───────────────────────────┐                                  │
│  │ autonomous_cycle.sh       │                                  │
│  │ (5分ごと起動)             │                                  │
│  └───────────────────────────┘                                  │
│  (Mir/Mac)                                                      │
└─────────────────────────────────────────────────────────────────┘
```

## インスタンス別詳細

### Log (Win) — scheduler_log.py

| 項目 | 値 |
|------|-----|
| ファイル | `scheduler_log.py` |
| 設定 | `scheduler_log_config.json` |
| ログ | `log/scheduler_log.log` |
| PID | `.scheduler_log.lock` |
| 監視 | `watchdog_log.pyw` (5分ごと、Task Scheduler) |
| 起動 | `claude_log.bat` → VBS → pythonw |
| 稼働形態 | Claude Codeセッション中 + watchdogで自動復旧 |

**ジョブ一覧:**

| ジョブ名 | スクリプト | デフォルト間隔 | タイムアウト | 備考 |
|----------|-----------|-------------|------------|------|
| slack_check | check_slack.py | 1分 | 120秒 | 新着→inbox_check即時トリガー |
| inbox_check | check_inbox.py --box win | 5分 | 300秒 | 新着時claude起動 |
| git_sync | git pull + add + commit + push | 30分 | 60秒 | |
| recommended_check | read_twitter_recommended.py | 1時間 (hour%6==2) | 300秒 | 6時間ごと実質 |
| slack_export | export_slack_log.py | 8時間 (hour%24==2) | 120秒 | |
| auto_cycle | claude --print | 90分 | 1800秒 | 8フェーズ改善サイクル |

**現在の設定上書き** (scheduler_log_config.json):
```json
{
  "auto_cycle": {"interval_sec": 10800, "min_interval_sec": 10200}
}
```

### Ash (Win2) — scheduler_ash.py

| 項目 | 値 |
|------|-----|
| ファイル | `scheduler_ash.py` |
| 設定 | `scheduler_ash_config.json` |
| ログ | `log/scheduler_ash.log` |
| PID | `.scheduler_ash.pid` |
| 監視 | `watchdog_win2.bat` (5分ごと、Task Scheduler) |
| 稼働形態 | 24時間常時稼働 |

**ジョブ一覧:**

| ジョブ名 | スクリプト | デフォルト間隔 | タイムアウト | 備考 |
|----------|-----------|-------------|------------|------|
| git_pull | git pull | 1時間 | 30秒 | |
| slack_check | check_slack.py --box win2 | 1分 | 120秒 | 新着→inbox_check即時トリガー |
| inbox_check | check_inbox.py --box win2 | 2時間 | 600秒 | |
| dm_check | check_dm.py --wake | 2時間 | 300秒 | Nao_u宛DM |
| dm_check_pigadev | check_dm.py --wake --user ぴ | 2時間 | 300秒 | 天谷さんDM |
| reservation_check | check_reservations.py | 2時間 | 10秒 | |
| review_deadline | check_review_deadline.py --nag | 2時間 | 30秒 | |
| kaizen_auto_verify | check_kaizen_due.py --auto-verify | 6時間 | 120秒 | |
| weekly_self_review | weekly_self_review.py | 6時間 (日曜のみ) | 600秒 | |
| git_sync | git_sync.py | 1時間 | 60秒 | |
| auto_diary | auto_diary.py | 1時間 | 600秒 | |
| twitter_recommended | read_twitter_recommended.py | 6時間 (hour%6==4) | 300秒 | |

**現在の設定上書き** (scheduler_ash_config.json):
```json
{
  "auto_diary": {"interval_sec": 10800, "min_interval_sec": 10200, "timeout": 600}
}
```

### Mir (Mac) — autonomous_cycle.sh

| 項目 | 値 |
|------|-----|
| ファイル | `autonomous_cycle.sh` |
| 設定 | `memory/mir_boot_intent.md` (サイクル間隔を自己変更) |
| ログ | stdout (LaunchAgent経由) |
| ロック | `/tmp/nao-u-lab-cycle.lock` |
| 監視 | LaunchAgent自動復帰（明示的watchdogなし） |
| 稼働形態 | 5分ごとに起動→間隔チェック→条件を満たせば実行 |

**処理フロー:**

| # | 処理 | 間隔 | 判定方式 |
|---|------|------|---------|
| 1 | git pull | 毎回 | 常時 |
| 2 | Twitterおすすめ | 6時間 | 経過時間ベース (`/tmp/nao-u-lab-last-twitter-check`) |
| 3 | Slackログエクスポート | 24時間 | 経過時間ベース (`/tmp/nao-u-lab-last-slack-export`) |
| 4 | 改善検証 | 毎回 | 常時 |
| 5 | 行動予約チェック | 毎回 | 常時 |
| 6 | クロスチェック | 毎回 | 常時 |
| 7 | 記憶活性化 | 毎回 | 常時 |
| 8 | claude --print | 設定次第 | mir_boot_intent.md（現在180分） |

## 共通メカニズム

### 設定変更（再起動不要）

```bash
# 統一コマンド
python update_scheduler.py <log|ash> <job> <interval|timeout> <秒>

# 確認
python update_scheduler.py --show <log|ash>
```

JSON設定はスケジューラが10秒ごとにポーリングしてホットリロード。

### 安定性機能（Log/Ash共通）

| 機能 | 閾値 | 動作 |
|------|------|------|
| 連続タイムアウト検出 | 3回 | タイムアウト値を1.5倍に自動拡大 + Slack通知 |
| 連続エラーバックオフ | 5回 | 次回実行を30分延長 + Slack通知 |
| 即時トリガー | slack_check成功時 | inbox_checkを即時実行（next_run=0） |
| PIDロック | 起動時 | 多重起動防止 |
| 認証エラー検出 | git操作失敗時 | Slack #all-nao-u-lab に通知 |

### 時間判定の2方式

| 方式 | 使用箇所 | 問題 |
|------|---------|------|
| `hour % N == K` | Log/Ash の hour_filter | **サイクル間隔がNの倍数でないと特定時刻を永久に踏まない** |
| 経過時間ベース | Mir全般 | 安定。推奨方式 |

**教訓**: 定期実行は必ず「最後の実行時刻を記録→経過時間で判定」にする。時刻ベース(hour%N)は禁止。

## ファイル一覧

### スケジューラ本体
| ファイル | 役割 |
|---------|------|
| `scheduler_log.py` | Log統合スケジューラ |
| `scheduler_ash.py` | Ash統合スケジューラ |
| `autonomous_cycle.sh` | Mir自律サイクル |
| `update_scheduler.py` | 設定変更の唯一の窓口 |

### 監視・起動
| ファイル | 役割 |
|---------|------|
| `claude_log.bat` | Log起動バッチ（scheduler→Claude→scheduler停止） |
| `watchdog_log.pyw` | Log監視（5分ごと、Task Scheduler） |
| `watchdog_win2.bat` | Ash監視（5分ごと、Task Scheduler） |
| `run_scheduler_log.vbs` | Log: WScript経由隠蔽起動 |

### 設定
| ファイル | 役割 |
|---------|------|
| `scheduler_log_config.json` | Log設定上書き（ホットリロード） |
| `scheduler_ash_config.json` | Ash設定上書き（ホットリロード） |
| `memory/mir_boot_intent.md` | Mir周期設定 |

### ログ
| ファイル | 役割 |
|---------|------|
| `log/scheduler_log.log` | Logスケジューラログ |
| `log/scheduler_ash.log` | Ashスケジューラログ |
| `log/watchdog_log.log` | watchdog動作記録 |
| `log/inbox_check.log` | inbox処理詳細 |

## ヘルスチェック (health_check.py)

LLM不要の自己診断スクリプト。各スケジューラから定期的に呼び出される。

**チェック項目:**
1. スケジューラプロセス生存確認（PIDファイル + プロセス存在）
2. ログ鮮度（最終書き込みからの経過時間）
3. git同期状態（ローカルとリモートの差分）
4. 連続エラーパターンの検出
5. ディスク容量（ログ肥大）

**出力**: JSON形式のステータスレポート + 異常時はSlack #human-steering に通知

詳細: `health_check.py` のコード内ドキュメント参照

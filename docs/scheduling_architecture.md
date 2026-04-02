# 定期実行アーキテクチャ設計書

最終更新: 2026-04-02（Ash作成）
関連: `docs/operations.md`（運用手順）, `docs/incident_log.md`（障害ログ）

---

## 1. 全体構成

```
┌────────────────────────────────────────────────────────────────┐
│                    OS タスクスケジューラ                         │
│  Win:  schtasks (5分ごと watchdog_*.bat)                       │
│  Mac:  LaunchAgent (5分ごと autonomous_cycle.sh)               │
│        crontab (1分ごと check_inbox.sh)                        │
└──────────┬───────────────────┬──────────────────┬──────────────┘
           │                   │                  │
     watchdog_log.bat    watchdog_win2.bat    LaunchAgent plist
           │                   │                  │
           ▼                   ▼                  ▼
  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
  │ scheduler_log.py│ │scheduler_ash.py │ │autonomous_cycle.sh  │
  │  (Log / Win)    │ │  (Ash / Win2)   │ │  (Mir / Mac)        │
  │  Python常駐     │ │  Python常駐     │ │  Bash + claude CLI  │
  └─────────────────┘ └─────────────────┘ └─────────────────────┘
```

### 1.1 設計原則

1. **2層構造**: OS スケジューラ → 統合スケジューラ。OS層は監視と復帰のみ担当
2. **逐次実行**: 各統合スケジューラ内のジョブは同時に1つだけ実行（claude多重起動を構造的に防止）
3. **LLM分離**: スクリプトでできることはスクリプトで実行。LLMの認知力はサイクル本体に集中（2026-03-20 Nao_u指示）
4. **動的設定**: JSON設定ファイルで周期変更可能（再起動不要、10秒以内に反映）
5. **PIDロック**: 多重起動防止はPIDファイルで管理

### 1.2 インスタンス一覧

| マシン | インスタンス名 | スケジューラ | 作業ディレクトリ | 設定ファイル |
|--------|-------------|-------------|----------------|-------------|
| Win    | Log         | `scheduler_log.py` | `C:\AI\nao-u-lab` (※旧: `D:\AI\Nao_u_BOT`) | `scheduler_log_config.json` |
| Win2   | Ash         | `scheduler_ash.py` | `C:\AI\nao-u-lab` | `scheduler_ash_config.json` |
| Mac    | Mir         | `autonomous_cycle.sh` | `/Users/Nao_u/nao-u-lab` | `memory/mir_boot_intent.md` |

---

## 2. OS層: 監視と復帰

### 2.1 Windows (Log / Ash)

**watchdog_*.bat**: タスクスケジューラから5分ごとに呼ばれる

```
watchdog_log.bat:
  1. cd /d C:\AI\nao-u-lab        ← 作業ディレクトリ
  2. git pull origin master --rebase
  3. .scheduler_log.lock のPID確認
  4. プロセス生存 → 何もしない
  5. プロセス死亡 → pythonw scheduler_log.py で再起動

watchdog_win2.bat:
  1. cd /d C:\AI\nao-u-lab
  2. git pull origin master --rebase
  3. .scheduler_ash.pid のPID確認
  4. プロセス生存 → 何もしない
  5. プロセス死亡 → pythonw scheduler_ash.py で再起動
```

**タスクスケジューラ登録**:
- `NaoBot_Watchdog_Log` → `watchdog_log.bat` (5分ごと)
- `NaoBot_Watchdog_Ash` → `watchdog_win2.bat` (5分ごと)

### 2.2 Mac (Mir)

**LaunchAgent** (`~/Library/LaunchAgents/`): 5分ごとに `autonomous_cycle.sh` を起動

```
autonomous_cycle.sh:
  1. cd "$(dirname "$0")"
  2. ロックファイル確認（/tmp/nao-u-lab-cycle.lock）
  3. mir_boot_intent.md からサイクル間隔を読み取り
  4. 前回実行からの経過時間 < 設定間隔 → スキップ
  5. git pull
  6. スクリプト側処理（Twitter、Slack、改善チェック等）
  7. claude --print でLLMサイクル起動（30分タイムアウト）
```

**crontab**: 1分ごとに `check_inbox.sh` を起動（受信箱専用）

---

## 3. 統合スケジューラ: ジョブ管理

### 3.1 ジョブ定義一覧

#### Log (scheduler_log.py)

| ジョブ名 | スクリプト | デフォルト間隔 | タイムアウト | 条件 |
|---------|-----------|-------------|------------|------|
| `slack_check` | `check_slack.py` | 1分 | 120秒 | - |
| `inbox_check` | `check_inbox.py --box win` | 5分 | 300秒 | - |
| `git_sync` | (内蔵) | 30分 | 60秒 | - |
| `recommended_check` | `read_twitter_recommended.py` | 1時間 | 300秒 | `hour%6==2` |
| `slack_export` | `export_slack_log.py` | 8時間 | 120秒 | `hour%24==2` |
| `auto_cycle` | `claude --print` | 90分 | 1800秒 | - |

#### Ash (scheduler_ash.py)

| ジョブ名 | スクリプト | デフォルト間隔 | タイムアウト | 条件 |
|---------|-----------|-------------|------------|------|
| `git_pull` | (内蔵) | 1時間 | 30秒 | - |
| `slack_check` | `check_slack.py --box win2` | 1分 | 120秒 | - |
| `inbox_check` | `check_inbox.py --box win2` | 2時間 | 600秒 | - |
| `dm_check` | `check_dm.py --wake` | 2時間 | 300秒 | - |
| `dm_check_pigadev` | `check_dm.py --wake --user ぴ` | 2時間 | 300秒 | stagger +5分 |
| `reservation_check` | `check_reservations.py --verbose` | 2時間 | 10秒 | - |
| `review_deadline` | `check_review_deadline.py --nag` | 2時間 | 30秒 | - |
| `kaizen_auto_verify` | `check_kaizen_due.py --auto-verify` | 6時間 | 120秒 | - |
| `weekly_self_review` | `weekly_self_review.py` | 6時間 | 600秒 | 日曜のみ |
| `git_sync` | `git_sync.py` | 1時間 | 60秒 | - |
| `auto_diary` | `auto_diary.py` | 1時間 | 600秒 | - |
| `twitter_recommended` | `read_twitter_recommended.py --count 50` | 6時間 | 300秒 | `hour%6==4` |

#### Mir (autonomous_cycle.sh)

| 処理 | スクリプト | 間隔 | タイムアウト | 制御方式 |
|------|-----------|------|------------|---------|
| git pull/push | (内蔵) | 毎起動 | - | - |
| おすすめタブ | `read_twitter_recommended.py --count 50` | 6時間 | - | 経過時間ファイル |
| Slackエクスポート | `export_slack_log.py` | 24時間 | - | 経過時間ファイル |
| 改善検証 | `check_kaizen_due.py --auto-verify` | 毎起動 | - | - |
| 行動予約 | `check_reservations.py --verbose` | 毎起動 | - | - |
| LLMサイクル | `claude --print` | 設定値 | 30分 | `mir_boot_intent.md` |

### 3.2 設定変更方法

**Windows (Log/Ash)**: JSON設定ファイル（再起動不要）

```bash
# コマンドで変更
python update_scheduler.py ash auto_diary interval 3600
python update_scheduler.py log auto_cycle interval 10800

# または直接JSON編集
# scheduler_ash_config.json:
{
  "auto_diary": {"interval_sec": 3600, "timeout": 600}
}
```

**Mac (Mir)**: `memory/mir_boot_intent.md` の「## サイクル間隔（分）」セクションを編集

### 3.3 エラーハンドリング

**共通仕組み（Log/Ash）**:

| 状態 | 閾値 | アクション |
|------|------|----------|
| 連続タイムアウト | 3回 | タイムアウト値を1.5倍に自動拡大 + Slackアラート |
| 連続エラー | 5回 | 30分バックオフ + Slackアラート |
| 認証エラー | 1回 | Slack通知（1セッション1回限り） |

**Mir**:
- ロックファイルで二重起動防止
- `perl -e 'alarm 1800; exec @ARGV'` でclaude CLIに30分タイムアウト

---

## 4. クロスプラットフォームの差異

| 項目 | Windows (Log/Ash) | Mac (Mir) |
|------|-------------------|-----------|
| エンコーディング | cp932対策必須（`PYTHONUTF8=1`, `-X utf8`） | UTF-8（通常） |
| git pull | `--rebase` | `--no-rebase --no-edit` |
| ウィンドウ非表示 | `CREATE_NO_WINDOW` creationflag | 不要 |
| タイムアウト | `subprocess.run(timeout=N)` | `perl -e 'alarm N; exec @ARGV'` |
| ロックファイル | `.scheduler_*.pid` / `.scheduler_*.lock` | `/tmp/nao-u-lab-*.lock` |
| Playwright | `--start-minimized` フラグ | 同 |
| ブラウザ競合防止 | `browser_lock.py` | `browser_lock.py` |
| Pythonコマンド | `pythonw` (ウィンドウなし) | `python3` |
| Node.js PATH | 自動検索 | 明示的 export |

---

## 5. ファイル構成

```
C:\AI\nao-u-lab\
├── scheduler_log.py           # Log統合スケジューラ（常駐）
├── scheduler_log_config.json  # Log設定（動的変更可）
├── scheduler_ash.py           # Ash統合スケジューラ（常駐）
├── scheduler_ash_config.json  # Ash設定（動的変更可）
├── autonomous_cycle.sh        # Mir自律サイクル（LaunchAgent起動）
├── update_scheduler.py        # 設定変更ツール
│
├── watchdog_log.bat           # Log監視（タスクスケジューラ5分）
├── watchdog_win2.bat          # Ash監視（タスクスケジューラ5分）
├── check_inbox.sh             # Mir受信箱（cron 1分）
├── check_inbox.bat            # Log受信箱（旧、現在はscheduler_log.pyが担当）
├── check_inbox_win2.bat       # Ash受信箱（旧、現在はscheduler_ash.pyが担当）
│
├── infra_health_check.py      # ヘルスチェック（全インスタンス対応）
│
├── .scheduler_log.lock        # Log PIDロック
├── .scheduler_ash.pid         # Ash PIDロック
│   (Mac: /tmp/nao-u-lab-cycle.lock, /tmp/nao-u-lab-claude.lock)
│
├── log/
│   ├── scheduler_log.log      # Logスケジューラログ
│   ├── scheduler_ash.log      # Ashスケジューラログ
│   ├── watchdog_log.log       # Logウォッチドッグログ
│   └── infra_health_check.log # ヘルスチェックログ
│
└── memory/
    └── mir_boot_intent.md     # Mirサイクル設定
```

---

## 6. 依存関係マップ

```
scheduler_log.py
  ├── check_slack.py        → slack_bot.py → Slack API
  ├── check_inbox.py        → claude CLI
  ├── read_twitter_recommended.py → Playwright → browser_lock.py
  ├── export_slack_log.py   → Slack API
  └── claude --print        → (LLM サイクル)

scheduler_ash.py
  ├── check_slack.py        → slack_bot.py → Slack API
  ├── check_inbox.py        → claude CLI
  ├── check_dm.py           → Playwright → browser_lock.py
  ├── check_reservations.py → action_reservations.md
  ├── check_review_deadline.py → kaizen_tracker.md
  ├── check_kaizen_due.py   → verify_kaizen.py → kaizen_tracker.md
  ├── git_sync.py           → git CLI
  ├── auto_diary.py         → claude --print
  ├── read_twitter_recommended.py → Playwright → browser_lock.py
  └── weekly_self_review.py → claude --print

autonomous_cycle.sh
  ├── read_twitter_recommended.py → Playwright
  ├── export_slack_log.py   → Slack API
  ├── check_kaizen_due.py   → verify_kaizen.py
  ├── check_reservations.py → action_reservations.md
  ├── check_review_deadline.py → kaizen_tracker.md
  ├── memory_activate.py    → memory/*.md
  ├── slack_recall.py       → slack_archive/
  └── claude --print        → (LLM サイクル)
```

---

## 7. トラブルシューティング

### 7.1 スケジューラが起動しない

```bash
# PIDファイルのプロセス確認
cat .scheduler_ash.pid       # PIDを取得
tasklist /FI "PID eq <PID>"  # 生存確認（Windows）
ps -p <PID>                  # 生存確認（Mac）

# PIDファイルが残っている（stale）→ 削除して再起動
del .scheduler_ash.pid
pythonw scheduler_ash.py
```

### 7.2 ジョブが実行されない

```bash
# ログで最終実行時刻を確認
grep "<ジョブ名>" log/scheduler_ash.log | tail -5

# 設定ファイルで間隔確認
cat scheduler_ash_config.json

# hour_filter / day_filter の条件確認
# recommended_check: hour%6==2 (2,8,14,20時) — Log
# twitter_recommended: hour%6==4 (4,10,16,22時) — Ash
```

### 7.3 git同期が壊れている

```bash
# rebase失敗の痕跡
git status  # REBASE_HEAD が残っていないか

# 解決
git rebase --abort
git pull origin master --no-rebase
```

### 7.4 Playwright/ブラウザ系のハング

```bash
# browser_lock.py のロック確認
ls /tmp/nao-u-lab-browser.lock  # Mac
dir .browser.lock               # Windows（存在する場合）

# Playwright プロセスの強制終了
taskkill /f /im "chrome.exe" /fi "WINDOWTITLE eq *Playwright*"  # Windows
pkill -f playwright                                               # Mac
```

---

## 8. 変更履歴

このファイルへの変更時は必ず以下に追記すること。

| 日付 | 変更者 | 内容 |
|------|--------|------|
| 2026-04-02 | Ash | 初版作成（Nao_u #human-steering指示に基づく設計文書化） |

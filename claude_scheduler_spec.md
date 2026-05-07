# Claude 定時実行仕様（GPT 向けハンドオフ）

並列配置される `D:\AI\Nao_u_BOT\GPT\` 系統からこのリポジトリの動作を理解するための仕様書。
最終更新: 2026-05-08（Win/Log 作成）。Claude 側の正本は `Claude/docs/scheduler_architecture.md`、本ファイルはその抜粋＋GPT 共存観点の補足。

---

## 0. 一行サマリ

3 つの Claude インスタンス（Log/Mir/Ash）が常駐スケジューラ（または cron 起動）でジョブを回しながら 1 つの GitHub リポジトリを共有している。各インスタンスは数分〜数時間間隔で git push する。GPT 系統は同じ `.git` を共有する場合、これらの push リズムと競合しないことが必要。

## 1. 物理レイアウトと所有

```
D:\AI\Nao_u_BOT\
├── .git/                  ← 親に置く（Claude/GPT 共有のルート）
├── .gitignore             ← 親レベル。.claude/ などのノイズ除外
├── Claude/                ← Claude 系統の作業ディレクトリ
│   ├── CLAUDE.md
│   ├── memory/, log/, docs/, scripts/, ...
│   └── .git/ (移動済、現在はここに無い)
├── GPT/                   ← GPT 系統の作業ディレクトリ（予定）
└── claude_scheduler_spec.md  ← 本ファイル
```

- リポジトリは GitHub `Nao838861/nao-u-lab` 単一。`master` ブランチで運用
- Claude 系統は `Claude/` 配下のみ書き換える前提。`Claude/` の外（GPT/ や親直下）は触らない
- GPT 系統も同様に `GPT/` 配下に閉じることを期待

## 2. 3 インスタンス構成

| 名前 | OS / マシン | 物理パス | 役割 |
|------|------------|---------|------|
| Log  | Win (D:)   | `D:\AI\Nao_u_BOT\Claude` | 主機。日記・記憶・ゲーム実装の中心 |
| Mir  | Mac        | `~/work/nao-u-lab/Claude` | Mac 側並走。Twitter/外部摂取担当が厚め |
| Ash  | Win2 (C:)  | `C:\AI\nao-u-lab\Claude`  | 第二 Win。auto_diary 4フェーズ運用、cross_review |

3 機は git pull/push と inbox ファイル経由で非同期協調。同時に同一ファイルを編集することは避ける運用ルール（衝突時は手動マージ）。

## 3. 起動方式

| インスタンス | 起動チェーン | 監視 |
|-------------|------------|------|
| Log | Windows タスクスケジューラ → `run_scheduler_log.vbs` → `pythonw scheduler_log.py` (常駐) | `watchdog_log.pyw` が 5 分ごとに死活確認・再起動 |
| Ash | Windows タスクスケジューラ → `pythonw scheduler_ash.py` (常駐) | `watchdog_win2.bat` が 5 分ごとに死活確認・再起動 |
| Mir | macOS LaunchAgent → 5 分ごとに `autonomous_cycle.sh` を新規起動 | LaunchAgent 自体が再起動を担保。多重起動はロックファイルで抑制 |

Log/Ash は常駐プロセスが内部ループで複数ジョブを回す方式。Mir は毎回新規シェルが立ち上がる方式。**いずれも CronCreate のようなセッション内スケジューリングは使わない**（仕様で禁止）。外部 OS 機構が常に新セッションを起動する。

## 4. 各インスタンスの定時ジョブ

### 4.1 Log (Win, scheduler_log.py)

| ジョブ | 間隔 | 内容 |
|--------|------|------|
| slack_check | 1分 | Slack 新着取得・人間メッセージ検知 |
| inbox_check | 5分 | `Claude/memory/inbox_win.md` を読み Claude セッション起動 |
| git_sync | 30分 | `git pull --rebase` → 自動 commit `memory/`/`log/` → `git push` |
| recommended_check | 6時間 | Twitter おすすめ取得（経過時間ベース判定） |
| slack_export | 24時間 | Slack 全チャンネルを `log/slack_export/` に書き出し |
| auto_cycle | config 依存（30〜60分） | `claude --print` で1サイクル日記作成 |
| health_check | 5分 | `infra_health_check.py` で死活＋ログ鮮度 |
| scheduler_health | 30分 | スケジューラ自体の整合性チェック |

### 4.2 Ash (Win2, scheduler_ash.py)

| ジョブ | 間隔 | 内容 |
|--------|------|------|
| slack_check | 1分 | 同上 |
| inbox_check | 2時間 | `Claude/memory/inbox_win2.md` |
| dm_check / dm_check_pigadev | 2時間 | X (Twitter) DM 監視 |
| git_pull / git_sync | 1時間 | pull → memory/log push |
| auto_diary | 1時間 | 4 フェーズ分割サイクル（Gather→Analyze→Process→Diary、合計 ~95分タイムアウト） |
| twitter_recommended | 6時間 | Twitter おすすめ |
| reservation_check / review_deadline / kaizen_auto_verify | 2〜6時間 | 改善管理系 |
| weekly_self_review | 6時間 | 日曜のみ実行（day_filter） |
| health_check / scheduler_health | 5分 / 1時間 | 同上 |

### 4.3 Mir (Mac, autonomous_cycle.sh)

| 処理 | 間隔 | 内容 |
|------|------|------|
| git pull | 毎回（5分） | 衝突なしを期待 |
| Twitter おすすめ | 6時間 | 経過時間ベース |
| Slack export | 24時間 | 経過時間ベース |
| health_check | 毎回 | |
| 各種チェック | 毎回 | review_deadline / 行動予約 |
| `claude --print` | mir_boot_intent.md に依存 | 1サイクル LLM 起動 |

## 5. git push のリズム（GPT 側で衝突回避するための情報）

3 機合計でだいたい以下のペースで push が発生する:

- **5〜10 分に 1 回**: 何らかの memory/log の auto-commit が走る可能性
- **常時**: 各機の pre-push hook が `Claude/scripts/backup_memory.sh` を呼び、auto-memory の差分を `Claude/memory_backup/<instance>/` に落としてから push 直前に追加 commit を作る（push 後はローカル+1ahead 状態が一時的に発生）
- **ピーク時**: auto_diary 4 フェーズ完了後に 1 サイクル分の commit がまとまる

GPT 系統が同じ repo に push する場合の推奨:
1. `git pull --rebase` してから commit
2. `GPT/` 配下しか触らないことで Claude 側 commit と論理衝突しない
3. push 失敗 (non-fast-forward) した場合は再 pull → rebase → push

## 6. 高頻度書き込みファイル（Claude 側、競合させないため）

以下は 5〜30 分間隔で Claude 側が更新する。GPT 側は **読み取り専用** で扱うのが安全。

| パス | 更新元 | 頻度 |
|------|--------|------|
| `Claude/log/scheduler_log.log` | Log | 数分ごと |
| `Claude/log/scheduler_ash.log` | Ash | 数分ごと（gitignore 済、push されない） |
| `Claude/log/cycle_staging*.md` | Log/Mir/Ash | サイクル中、フェーズ毎 |
| `Claude/log/daily_diary_*.md` | 各機 | 日記書込み毎 |
| `Claude/memory/inbox_*.md` | 全機（後述） | 都度 |
| `Claude/memory/next_tasks_log.jsonl` | Log/Ash | サイクル毎 |
| `Claude/.diary_dedup_cache.json` | Log | 日記投稿毎 |
| `Claude/.kaizen_status_last_posted` | Log | kaizen 投稿毎 |
| `Claude/.slack_export_last_success` | Log | export 成功毎 |
| `Claude/memory_backup/<instance>/` | 全機 | push 前ごと |

## 7. インスタンス間通信（inbox プロトコル）

Claude 同士のメッセージ受け渡しは **git 経由の inbox ファイル**。同期は git pull/push に乗る。

| ファイル | 受信者 |
|---------|--------|
| `Claude/memory/inbox_mac.md` | Mir 受信 |
| `Claude/memory/inbox_win.md` | Log 受信 |
| `Claude/memory/inbox_win2.md` | Ash 受信 |

書込みフォーマット（慣例）:
```markdown
## [送信者→受信者] YYYY-MM-DD タイトル

### 状況 / 背景
...

### 手順 / 依頼内容
...
```

各受信者の `inbox_check` ジョブが当該ファイルの非空判定で claude セッションを起動 → 処理 → 該当セクションを削除して push。

**GPT 系統との通信を作る場合**: 新規ファイル `Claude/memory/inbox_gpt.md` または `GPT/inbox_*.md` などを定義し、本ファイルに追記してください。Claude 側の inbox_check は今のところ `inbox_gpt.md` を見ない。

## 8. Slack 連携

Claude は Nao_u と Slack 経由でコミュニケーションする（Web UI ではなく Slack API 経由）。重要チャンネル:

| チャンネル | 用途 |
|-----------|------|
| `#nao-u` | Nao_u 発信専用。Claude は投稿しない |
| `#all-nao-u-lab` | Nao_u への連絡・全体議論。Claude が能動的に投稿する主チャンネル |
| `#shared-reads` | 外部記事・Tweet 共有と分析 |
| `#human-steering` | Nao_u からの改善提案・フィードバック |
| `#log` / `#mir` / `#ash` | 各機の日記投稿先 |
| `#kaizen-log` | 改善（kaizen）の適用結果 |
| `#game-rights` | ゲーム関連（特に "Pot" シリーズ） |

ルール:
- スレッド返信は禁止。フラット投稿
- 1 件の外部 URL/記事に対しては別メッセージで反応（まとめ返信は薄くなる）
- Slack 即時応答は最優先（1 分以内目標）

GPT 系統が Slack に投稿する場合は **新規チャンネル**を切るか、`#all-nao-u-lab` で発言者識別を明確にすることを推奨。

## 9. ヘルスチェックと自動復旧

`Claude/infra_health_check.py` が LLM 不要で 5 分ごと自走:

- スケジューラプロセス生存（PID ファイル + tasklist）
- ログ鮮度（30 分未更新 → 警告、2 時間 → 異常）
- ログ肥大（5MB → 自動ローテーション、20MB → 異常）
- git 未 push commit 数（3 → 警告、10 → 異常）
- 設計原則違反（`hour%N` パターン残存等）

異常検知時は各機の Slack チャンネル（`#log` / `#mir` / `#ash`）に投稿。

GPT 系統側でも同じ思想（LLM 不要のスクリプト診断）を入れることを推奨。共有 git repo での未 push 累積は 3 機 + GPT で混みやすい。

## 10. 設計原則（Claude 側、参考用）

GPT 側で同じ罠を踏まないための学習材料として:

| # | 原則 | 過去事例 |
|---|------|----------|
| P1 | 時刻ベース判定 (`hour % N`) は使わず、必ず経過時間ベース | INC-007: サイクル間隔不整合で永久スキップ |
| P2 | パスは `Path(__file__).parent` から導出。ハードコード禁止 | INC-001/002 |
| P3 | Windows は `PYTHONUTF8=1` + `python -X utf8` 強制 | INC-003 cp932 で UnicodeEncodeError |
| P4 | 起動チェーンの各段で exit code 検証。silent 故障は最悪 | INC-006 |
| P5 | 通知ロジックには必ず reset/debounce | INC-005 通知洪水 |
| P6 | タイムアウト自動拡大には上限（3600s）を設ける | |
| P7 | 設定変更は JSON + `update_scheduler.py` 経由のみ | |
| P8 | 障害は `scheduler_incidents.md` に記録 | |
| P9 | 設定変更と検証は不可分。ツールに検証を組み込む | INC-020 |
| P10 | 設定変更は唯一の窓口経由で原子適用 | INC-018 |

詳細は `Claude/docs/scheduler_architecture.md` セクション 1 と `Claude/docs/scheduler_incidents.md`。

## 11. GPT 系統との共存推奨ルール

1. **書込み境界**: GPT は `GPT/` 配下と `D:\AI\Nao_u_BOT\.gitignore`（必要なら追記）に閉じる。`Claude/` 配下は読み取りのみ
2. **git 操作**: `git pull --rebase` を必ず先に。push 失敗時は再試行
3. **Slack 投稿**: 既存 Claude チャンネルに混ぜず、別チャンネル or 識別子を付ける
4. **inbox 通信を始める場合**: 新規ファイル名で開始し、本仕様書に追記する
5. **長時間ロックの回避**: Edge プロファイルや Playwright ブラウザを掴む処理は subprocess 隔離（INC-021 教訓）
6. **常駐プロセスの PID 管理**: PID ファイルを各自で持ち、watchdog で死活監視

---

## 付録 A: 主要設定ファイル

| ファイル | 説明 |
|---------|------|
| `Claude/scheduler_log_config.json` | Log のジョブ間隔・タイムアウト（ホットリロード対応） |
| `Claude/scheduler_ash_config.json` | Ash 同上 |
| `Claude/memory/mir_boot_intent.md` | Mir のサイクル設定（自然言語） |
| `Claude/.git/hooks/pre-push` | push 前 backup_memory.sh 自動実行（git 非追跡、各機 local） |

## 付録 B: 観測のための入口

GPT 側から Claude の状態をスナップショットしたい場合:

```bash
# 直近の commit 流量
git log --since="1 hour ago" --pretty=format:"%h %an %s" -- Claude/

# 各機のスケジューラログ末尾（Log のみ git 追跡）
tail -50 Claude/log/scheduler_log.log

# inbox の現状
ls -la Claude/memory/inbox_*.md
wc -l Claude/memory/inbox_*.md

# health_check 実行（読み取り）
python Claude/infra_health_check.py --instance log --json
```

## 付録 C: 仕様書の更新責任

- 本ファイルは Claude 側で最終更新したインスタンスがコミットメッセージに `[claude_scheduler_spec]` を付与
- 大きな仕様変更（新ジョブ追加・チャンネル追加・通信プロトコル拡張）は本ファイルに追記してから実装
- GPT 側からの追記は `GPT/` 配下に対応する `gpt_runtime_spec.md` を別ファイルで作るのを推奨

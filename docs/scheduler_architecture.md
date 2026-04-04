# 定期実行システム アーキテクチャ

最終更新: 2026-04-02（Mir版 scheduling_architecture.md を統合済み）
関連: `docs/scheduler_incidents.md`（障害履歴）、`docs/operations.md`（運用手順）

---

## 1. 設計原則（これを破ったら壊れる）

| # | 原則 | 根拠 |
|---|------|------|
| P1 | **時刻ベース判定(hour%N)は禁止。必ず経過時間ベースで判定する** | INC-007: サイクル間隔がNの倍数でないと永久スキップ |
| P2 | **パスはPath(__file__).parentから導出。ハードコード禁止** | INC-001/INC-002: パス不一致でFileNotFoundError |
| P3 | **Windows環境ではUTF-8を強制（PYTHONUTF8=1 + -X utf8）** | INC-003: cp932でUnicodeEncodeError→二重投稿 |
| P4 | **起動チェーンの各段階でexit codeを検証。サイレント故障は最悪** | INC-006: VBS故障が不可視で数時間停止 |
| P5 | **通知ロジックには必ずリセット/デバウンス。カウンタは通知後にゼロ** | INC-005: エラー通知が洪水化 |
| P6 | **タイムアウト自動エスカレーションに上限(3600s)を設ける** | 上限なしだと無限拡大 |
| P7 | **設定変更はJSON+update_scheduler.py経由のみ。コード直接編集禁止** | 再起動なしでホットリロードできる仕組みを壊さない |
| P8 | **障害はdocs/scheduler_incidents.mdに記録。同じ問題を2度起こさない** | 知識の横断不足がパターンC |
| P9 | **設定変更と検証は不可分。変更ツール自体に検証を組み込む。手動チェックリストに頼らない** | INC-020: チェックリストは守れなかった |
| P9 | **設定変更は`update_scheduler.py`経由で全インスタンスに原子適用。手動編集禁止** | INC-018: 間隔変更が毎回トラブル。3方式混在+個別変更が根本原因 |

## 2. システム構成図

```
┌────── Windows タスクスケジューラ ──────────────────────────────────┐
│                                                                    │
│  watchdog_log.pyw (5分)      watchdog_win2.bat (5分)              │
│       │                            │                               │
│       ▼                            ▼                               │
│  scheduler_log.py            scheduler_ash.py                      │
│  (Log/Win)                   (Ash/Win2)                            │
│  ├─ slack_check (1分)        ├─ slack_check (1分)                 │
│  ├─ inbox_check (5分)        ├─ inbox_check (2h)                  │
│  ├─ git_sync (30分)          ├─ git_pull/git_sync (1h)            │
│  ├─ recommended (6h)         ├─ dm_check (2h)                     │
│  ├─ slack_export (24h)       ├─ auto_diary (1h/config)            │
│  ├─ auto_cycle (config)      ├─ twitter_recommended (6h)          │
│  └─ health_check (5分)       ├─ health_check (5分)                │
│                               └─ ... (12ジョブ)                    │
└────────────────────────────────────────────────────────────────────┘

┌────── macOS LaunchAgent ──────────────────────────────────────────┐
│                                                                    │
│  autonomous_cycle.sh (5分ごと起動)                                │
│  (Mir/Mac)                                                         │
│  ├─ git pull (毎回)                                               │
│  ├─ Twitterおすすめ (6h, 経過時間ベース)                          │
│  ├─ Slackエクスポート (24h, 経過時間ベース)                       │
│  ├─ health_check.py --instance mir (毎回)                         │
│  ├─ 各種チェック (毎回)                                            │
│  └─ claude --print (mir_boot_intent.md設定)                       │
└────────────────────────────────────────────────────────────────────┘

┌────── 共通インフラ ──────────────────────────────────────────────┐
│  health_check.py        LLM不要の自己診断。5分ごと全インスタンス  │
│  update_scheduler.py    設定変更の唯一の窓口（再起動不要）        │
│  scheduler_incidents.md 障害履歴と教訓（全インスタンスが参照）    │
└────────────────────────────────────────────────────────────────────┘
```

## 3. 安定性メカニズム（Log/Ash共通）

### 3.1 エラー検出と自動復旧

| 機能 | 閾値 | 動作 | 備考 |
|------|------|------|------|
| 連続タイムアウト検出 | 3回 | タイムアウト値を1.5倍に拡大(上限3600s) + Slack通知 + カウンタリセット | P5/P6適用 |
| 連続エラーバックオフ | 5回 | 次回実行を30分延長 + Slack通知 + カウンタリセット | P5適用 |
| Slack即時トリガー | slack_check成功時 | inbox_checkを即時実行 | |
| PIDロック | 起動時 | 多重起動防止 | |
| 認証エラー検出 | git操作失敗時 | Slack #all-nao-u-lab に1回だけ通知 | |

### 3.2 ヘルスチェック（health_check.py）

**LLM不要。APIコストゼロ。スクリプトだけで問題を検出する。**

| # | チェック項目 | 警告閾値 | 異常閾値 |
|---|-------------|---------|---------|
| 1 | スケジューラプロセス生存 | — | PIDファイル残存+プロセス死亡 |
| 2 | ログ鮮度 | 30分未更新 | 2時間未更新 |
| 3 | 直近ログの連続エラー | エラー30% | 連続5回以上 |
| 4 | ログ肥大 | 5MB | 20MB |
| 5 | git未pushコミット | 3件 | 10件 |
| 6 | config JSON構文 | — | JSONエラー |
| 7 | **自動ログローテーション** | 5MB超で実行 | — |
| 8 | **設計原則違反検出** | hour%N残存等 | — |

**通知先**: 異常時は `#human-steering` に投稿（Nao_uへのエスカレーション）

### 3.3 コード変更自動検出（INC-018再発防止）

**常駐プロセス（Log/Ash）はコード変更を自動で拾わない。**
git pullでコードが更新されても、起動済みプロセスは旧コードで動き続ける。
この問題を構造的に防ぐため、自身のファイルハッシュを60秒ごにチェックする仕組みを導入。

| 仕組み | 動作 |
|-------|------|
| 起動時 | `scheduler_log.py` + `claude_runner.py` のMD5ハッ��ュを記録 |
| 60秒ごと | ハッシュを再計算。変更を検出したら自動でexit |
| watchdog | 5分以内に新コードでプロセスを再起動 |
| Mir | シェルスクリプトで毎回新規起動のため不要 |

### 3.4 Watchdog（プロセス監視）

| インスタンス | 監視方法 | 復旧方法 |
|-------------|---------|---------|
| Log | `watchdog_log.pyw` (Task Scheduler, 5分) | pythonw scheduler_log.py再起動 |
| Ash | `watchdog_win2.bat` (Task Scheduler, 5分) | pythonw scheduler_ash.py再起動 |
| Mir | LaunchAgent (5分ごとにsh起動) | ロックファイルで多重起動防止 |

## 4. 時間判定方式（統一済み）

**全インスタンス: 経過時間ベースに統一。**

```python
# ✅ 正しいパターン: タイムスタンプファイル + 経過時間判定
LAST_SUCCESS_FILE = REPO_DIR / ".job_last_success"
last = datetime.fromisoformat(LAST_SUCCESS_FILE.read_text().strip())
if (datetime.now() - last).total_seconds() >= INTERVAL_SEC:
    run_job()
    LAST_SUCCESS_FILE.write_text(datetime.now().isoformat())

# ❌ 禁止パターン: hour%N
if datetime.now().hour % 6 == 2:  # INC-007で禁止
```

**タイムスタンプファイル一覧:**

| ファイル | 用途 | インスタンス |
|---------|------|------------|
| `.recommended_last_success` | Twitter推奨チェック成功時刻 | Log |
| `.slack_export_last_success` | Slackエクスポート成功時刻 | Log |
| `.kaizen_status_last_posted` | Slack checklist投稿時刻 | Log |
| `.weekly_review_last_triggered` | 週次レビュー実行時刻 | Log |
| `/tmp/nao-u-lab-last-twitter-check` | Twitter推奨チェック | Mir |
| `/tmp/nao-u-lab-last-slack-export` | Slackエクスポート | Mir |

## 5. OS差異の吸収

| 処理 | Mac | Windows | 吸収方法 |
|------|-----|---------|--------|
| timeout | `perl -e 'alarm N; exec @ARGV'` | 組み込みタイムアウト | スクリプト側で分岐 |
| プロセス生存確認 | `kill -0 $PID` | kernel32.OpenProcess + tasklist | 両方実装 |
| エンコーディング | デフォルトUTF-8 | `PYTHONUTF8=1` + `-X utf8` | 環境変数 + CLI引数 |
| Python実行 | python3 | pythonw (GUI非表示) | creationflags=CREATE_NO_WINDOW |
| subprocessウィンドウ | 不要 | CREATE_NO_WINDOW | scheduler_log.py冒頭でpatch |

## 6. 設定変更手順

**全マシン共通: `python update_scheduler.py` を使う。コード編集禁止。**
**変更→検証→Slack報告は1コマンドで自動完結する（INC-020対策）。手動チェックリスト不要。**

```bash
# 全インスタンス一括変更（推奨。変更+検証+Slack報告が全自動）
python update_scheduler.py --all-cycle interval 1800

# 個別変更（再起動不要、検証+Slack報告が自動実行される）
python update_scheduler.py ash auto_diary interval 3600
python update_scheduler.py log auto_cycle interval 3600
python update_scheduler.py mir interval 1800

# タイムアウト変更
python update_scheduler.py ash inbox_check timeout 900

# 現在の設定確認
python update_scheduler.py --show all

# 検証のみ（変更なし。プロセス生存+ログ鮮度+ジョブ実行+設定整合性）
python update_scheduler.py --verify log
python update_scheduler.py --verify all
```

### 6.1 自動検証（update_scheduler.py に組み込み済み）

**設定変更時に以下が自動実行される。手動ステップは不要。**

| # | 自動チェック項目 | 失敗時の動作 |
|---|-----------------|-------------|
| 1 | PIDファイル＋プロセス生存（Win/Mac両対応） | ❌ → Slack #human-steering に通知 |
| 2 | ログ監視: 設定反映ログ（`auto-applied`）の検出 | 代替: ジョブ実行ログで動作確認 |
| 3 | ログ鮮度チェック（30分以上更新なし→異常） | ❌ → Slack #human-steering に通知 |
| 4 | 全チェックパス時 → Slack #all-nao-u-lab に確認報告 | — |

**設計原則: 検証はスキップ不可。`update_scheduler.py` が唯一の変更窓口であり、検証は変更と不可分。**

**追加の注意:**
- **常駐プロセス(Log/Ash)はコード変更後に再起動が必要。設定JSONの変更は再起動不要（ホットリロード対応）**
- **Mirは毎回新規起動のため設定変更→次回起動で反映**

## 7. インスタンス別ジョブ一覧

### Log (Win) — scheduler_log.py

| ジョブ名 | スクリプト | デフォルト間隔 | タイムアウト | 時間判定 |
|----------|-----------|-------------|------------|---------|
| slack_check | check_slack.py | 1分 | 120秒 | interval |
| inbox_check | check_inbox.py --box win | 5分 | 300秒 | interval |
| git_sync | (組み込み) | 30分 | 60秒 | interval |
| recommended_check | read_twitter_recommended.py | 1時間 | 300秒 | **経過時間ベース(6h)** |
| slack_export | export_slack_log.py | 8時間 | 120秒 | **経過時間ベース(24h)** |
| auto_cycle | claude --print | config依存 | 1800秒 | interval |
| health_check | health_check.py --alert --instance log | 5分 | 30秒 | interval |
| scheduler_health | check_scheduler_health.py --instance log --slack | 30分 | 30秒 | interval |

### Ash (Win2) — scheduler_ash.py

| ジョブ名 | スクリプト | デフォルト間隔 | タイムアウト | 時間判定 |
|----------|-----------|-------------|------------|---------|
| git_pull | (組み込み) | 1時間 | 30秒 | interval |
| slack_check | check_slack.py --box win2 | 1分 | 120秒 | interval |
| inbox_check | check_inbox.py --box win2 | 2時間 | 600秒 | interval |
| dm_check | check_dm.py --wake | 2時間 | 300秒 | interval |
| dm_check_pigadev | check_dm.py --wake --user ぴ | 2時間 | 300秒 | interval |
| reservation_check | check_reservations.py | 2時間 | 10秒 | interval |
| review_deadline | check_review_deadline.py --nag | 2時間 | 30秒 | interval |
| kaizen_auto_verify | check_kaizen_due.py --auto-verify | 6時間 | 120秒 | interval |
| weekly_self_review | weekly_self_review.py | 6時間 | 600秒 | day_filter(日曜のみ) |
| git_sync | git_sync.py | 1時間 | 60秒 | interval |
| auto_diary | auto_diary.py (3フェーズ分割) | 1時間 | 720秒 | interval |
| twitter_recommended | read_twitter_recommended.py | 6時間 | 300秒 | **interval(hour_filter廃止)** |
| health_check | infra_health_check.py --alert --instance ash | 5分 | 30秒 | interval |
| scheduler_health | check_scheduler_health.py --instance ash --slack | 1時間 | 30秒 | interval |

### Mir (Mac) — autonomous_cycle.sh

| 処理 | 間隔 | 判定方式 |
|------|------|---------|
| git pull | 毎回 | 常時 |
| Twitterおすすめ | 6時間 | 経過時間ベース |
| Slackエクスポート | 24時間 | 経過時間ベース |
| health_check | 毎回 | 常時 |
| 改善検証/行動予約等 | 毎回 | 常時 |
| claude --print | 設定次第 | mir_boot_intent.md |

## 8. ファイル一覧

| カテゴリ | ファイル | 役割 |
|---------|---------|------|
| **スケジューラ** | `scheduler_log.py` | Log統合スケジューラ |
| | `scheduler_ash.py` | Ash統合スケジューラ |
| | `autonomous_cycle.sh` | Mir自律サイクル |
| | `update_scheduler.py` | 設定変更の唯一の窓口 |
| **監視** | `watchdog_log.pyw` | Log監視 (Task Scheduler) |
| | `watchdog_win2.bat` | Ash監視 (Task Scheduler) |
| | `health_check.py` | LLM不要の自己診断（インフラ全般） |
| | `check_scheduler_health.py` | スケジューラ特化のヘルスチェック |
| **設定** | `scheduler_log_config.json` | Logホットリロード設定 |
| | `scheduler_ash_config.json` | Ashホットリロード設定 |
| | `memory/mir_boot_intent.md` | Mir周期設定 |
| **ログ** | `log/scheduler_log.log` | Logスケジューラログ |
| | `log/scheduler_ash.log` | Ashスケジューラログ |
| | `log/watchdog_log.log` | watchdog動作記録 |
| **タイムスタンプ** | `.recommended_last_success` | Log Twitter成功時刻 |
| | `.slack_export_last_success` | Log Slackエクスポート成功時刻 |
| **ドキュメント** | `docs/scheduler_architecture.md` | **この文書** |
| | `docs/scheduler_incidents.md` | 障害履歴と教訓 |
| | `docs/operations.md` | 運用手順 |

## 9. 障害対応フロー

```
問題発生
  │
  ▼
health_check.py が自動検出
  │
  ├─ critical → Slack #human-steering に自動通知
  │               → Nao_uまたは各インスタンスが対応
  │
  ├─ warning → ログ記録のみ（次サイクルで状況確認）
  │
  └─ ok → 何もしない
  
対応後:
  1. docs/scheduler_incidents.md に記録（INC-NNN形式）
  2. 根本原因を特定 → 設計原則に追加すべきか判断
  3. 他インスタンスに同じパターンがないか横展開
  4. health_check.pyにパターン検出を追加（再発防止）
```

## 10. 収束の仕組み（問題が減っていく構造）

Nao_uの指摘(2026-04-02): 「問題が起きなくなる方向に収束させる仕組みを作ってほしい」

```
障害発生 → incidents.md記録 → 設計原則に追加
                                    │
                                    ▼
                             health_check.pyに
                             検出ルール追加
                                    │
                                    ▼
                             同じ問題は次回から
                             自動検出される
                                    │
                                    ▼
                             問題が構造的に減る
```

**4つの仕組み:**
1. **障害履歴** (scheduler_incidents.md): 同じ問題を繰り返さないための知識ベース
2. **設計原則** (この文書のセクション1): 破ったら壊れるルール集
3. **自動検出** (health_check.py): LLM不要で設計原則違反を検出
4. **横展開** (障害対応フローのステップ3): 1箇所の学びを全インスタンスに適用

## 11. 2モード起動設計 (2026-04-05 Nao_u提案)

**背景**: 「Slackレスポンスは速さ重視で1フェーズ完結。定期実行はじっくり精度重視」(Nao_u #human-steering 2026-04-05)

LLM起動を目的別に2モードに分離する:

### 11.1 Slackレスポンスモード（check_inbox.py）

```
トリガー: check_slack.py が人間の新着を検出 → inbox書き込み → check_inbox.py即時起動
性格:     速い。1回のclaude --printで判断・対処・返信を完結
timeout:  300s
プロンプト: 「メッセージを読み、判断し、対処し、返信する。それだけに集中」
やらないこと: 情報収集フェーズ、日記、外部巡回
```

### 11.2 定期サイクルモード（auto_diary.py — 4フェーズ分割）

```
トリガー: scheduler_ash.py が1時間間隔で起動
性格:     じっくり。4回のLLM呼び出しで各フェーズに注意を集中
合計timeout: ~900s (120+300+240+240)

Phase 1: Gather（情報収集）  timeout=120s
  → pre-check結果収集、external_notes確認、プロジェクト状況確認
  → 結果をlog/cycle_staging.mdに書き出し
  → 「集めろ、判断するな」

Phase 2: Analyze（shared-reads分析）  timeout=300s
  → 外部情報を深く分析・分類し、アイデアの種に接続
  → #shared-readsに分析投稿
  → 「記事紹介ではなく分析・接続・問い」

Phase 3: Process（対処・研究）  timeout=240s
  → ステージングファイルを読み、最重要1-2件に集中
  → プロジェクト更新、beliefs更新、外部ノート統合
  → 「最も重要なことに集中しろ」

Phase 4: Diary（日記出力）  timeout=240s
  → Phase 1-3の結果を踏まえて日記を書く
  → Slack投稿 + git push
  → 「書くことだけに集中しろ」
```

**ステージングファイル**: `log/cycle_staging.md` がフェーズ間の情報受け渡しを担う。
各フェーズは前のフェーズの結果を追記していく。

### 11.3 なぜ2モードに分けるか

| | Slackレスポンス | 定期サイクル |
|---|---|---|
| 目的 | 人間の問いに素早く答える | 精度の高い入出力を積み上げる |
| LLM呼び出し | 1回 | 4回（フェーズ分割） |
| 注意の使い方 | メッセージへの反応に全集中 | 情報収集→分析→対処→出力に分散 |
| タイムアウト | 300s | ~900s合計 |
| inbox処理 | する（本務） | しない（check_inbox.pyに任せる） |
| 日記 | 書かない | 書く（Phase 4） |

**適用状況**:
| インスタンス | Slackレスポンス | 定期サイクル |
|-------------|----------------|-------------|
| Ash | 実装済み (check_inbox.py) | 実装済み (auto_diary.py 4フェーズ) |
| Log | 実装済み (check_inbox.py) | 未実装 (inbox_win.mdで依頼済み) |
| Mir | 実装済み (check_inbox.py) | 未実装 (inbox_mac.mdで依頼済み) |

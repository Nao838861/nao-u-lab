# agent_failure_modes.md — エージェント失敗モード分類表（初版）

- created: 2026-04-18 Ash
- origin: projects/INDEX.md backlog「エージェント失敗モード分類表（2026-04-07 論文受領）」
- 幽霊化期間: 2026-04-07 → 2026-04-18（11日）。**本初版をもって Autogenesis失敗（capability gap自己発見→candidate improvement生成の途絶）を解消**
- 関連: knowledge/20260411_chaos_agents_multi_agent_risk_taxonomy.md, knowledge/20260418_omarsar0_autogenesis_and_agent_drift_middle_ground.md
- 外部対応語: failure taxonomy / agent failure log — `mizchi 2026-04-17「エージェント失敗ログ分析が専門領域化」` の系譜

## 分類フレーム：3欠落 × 5失敗

Harvard/MIT/Stanford共著「カオスを生むエージェントたち」論文の枠組みを軸にする（要約は knowledge/20260411 参照）。

**3つの欠落認知能力 (missing cognitive capacities)**
- **S**: 社会的役割認知 (social role cognition) — 誰に仕え・誰の指示に従うか
- **C**: 能力限界認知 (capability limit cognition) — 自分にできること/できないこと
- **I**: 情報境界認知 (information boundary cognition) — 誰に何が見えるか

**5つの失敗パターン (failure categories)**
- **F1**: 他人の指示に追従 (unauthorized instruction following)
- **F2**: 秘密漏洩 (secret disclosure)
- **F3**: 無限ループでの資源食いつぶし (infinite-loop resource exhaustion)
- **F4**: なりすまし被害 (impersonation susceptibility)
- **F5**: 危ない行動の伝播 (cascading error propagation)

## 実測：log/infra_health_check.log 1038行走査（〜2026-04-18 10:42）

**再発3回以上のパターンのみ抽出**（`ISSUE:` 行を時間依存数値を除去して集計）。

| # | パターン | 回数 | 3欠落 | 5失敗 | 一次事象 | 備考 |
|---|---|---:|---|---|---|---|
| P1 | `[scheduler_ash] git_pullが実行されていない（期待: 120分以内）` | 81 | C | F3 | cron周期の≒3時間揺らぎ | 検出のみ動作、自己修復なし。慢性化 |
| P2 | `[scheduler_ash] slack_checkが実行されていない（期待: 10分以内）` | 79 | C | F3 | Ash長時間オフライン時に Mir が代理検出 | 多くは 2026-04-14〜17 Ash停止期間の累計 |
| P3 | `ロックファイル .scheduler_ash.pid が残存` | 72 | C | F3 | プロセス死亡時の stale lock | watchdog_ash.pyw周りの課題 |
| P4 | `Ashのスケジューラログが更新なし` | 71 | I (cross-instance) | F5→検出済 | Mir→Ash の越境watchdog発火 | **F5の逆向き防壁が機能した例** |
| P5 | `[scheduler_ash] git_syncが実行されていない（期待: 120分以内）` | 65 | C | F3 | P1と同系（git pull/sync 120分cron揺らぎ） | cron境界設計が原因 |
| P6 | `[scheduler_ash] inbox_checkが実行されていない（期待: 180分以内）` | 63 | C | F3 | 同上 | — |
| P7 | `[scheduler_ash] auto_diaryが実行されていない（期待: 240分以内）` | 61 | C | F3 | 同上 | — |
| P8 | `[scheduler_log] slack_checkが実行されていない（期待: 10分以内）` | 45 | C | F3 | Log側にも同種症状 | — |
| P9 | `Logのスケジューラログが更新なし` | 40 | I (cross-instance) | F5→検出済 | Mir→Log の越境watchdog発火 | P4と同構造 |
| P10 | `Ashスケジューラ(PID 3968)が停止中` | 37 | C | F3 | 死亡PIDを検出のみ、再起動まではしない期間 | — |
| P11 | `[scheduler_log] git_sync` | 26 | C | F3 | P5のLog版 | — |
| P12 | `[scheduler_log] auto_cycle` | 22 | C | F3 | — | — |
| P13 | `[scheduler_log] inbox_check` | 21 | C | F3 | — | — |
| P14 | `Twitter障害: test_scriptが12回連続失敗中` (4/6) | 9 | C | F3 (外部API同型) | Twitter API側。我々の制御外 | — |
| P15 | `[scheduler_ash] auto_cycle` | 8 | C | F3 | — | — |
| P16 | `Twitter障害: test_scriptが24回連続失敗中` (4/9) | 5 | C | F3 | — | — |
| P17 | `Ashスケジューラ(PID 9952)が停止中` | 5 | C | F3 | — | — |
| P18 | `git MERGE_HEAD が残存。手動解決が必要` | 4 | S | F2-隣接 | マージ衝突未解決→同期ブロック | git履歴の社会的コンテキスト認識欠如 |
| P19 | `Twitter障害: test_scriptが9回連続失敗中` (4/7) | 3 | C | F3 | — | — |
| P20 | `Logのスケジューラログが48分間更新なし` | 3 | I | F5→検出 | P9系 | — |

**集計所見**
- **F3（無限ループ/資源食いつぶし）が圧倒的多数**（20パターン中18件）。論文が挙げた5失敗のうち、我々の環境では F3 がほぼ独占。
- 原因の9割は `C:能力限界認知` の欠如。**cron周期の揺らぎを系が自分で補正していない**——expected 120min に対し実行が 121〜180min に流れると検出するが、次回cronまで待つだけで期間を縮める動作がない。
- F4 (なりすまし)・F2 (秘密漏洩) の infra層ログ上の一次事象は**ゼロ**。これは検出されていないだけかもしれない——log種別の偏り。
- **I欠落の越境watchdog (P4, P9, P20) は "F5を検出する仕組み" として機能している**。これは論文の枠組みでは「I欠落の症状」だが、我々の運用では逆に F5 への防壁として働く——**同じメカニズムが条件次第で発動と防御の両方になる**。memory_redesign / side_channel_audit の論点。

## 事故履歴との1:1対応（knowledge/20260411 より継承）

| 論文のリスク | 我々の実例 | 事後に構築した防壁 |
|---|---|---|
| F1 他人の指示に従う | external_notes鵜呑み傾向 | feedback_verify_before_annotating.md |
| F2 秘密を漏らす | privacy_policy.md / security_policy.md | docs/security_policy.md |
| F3 無限ループで資源食いつぶし | watchdog_ash.pyw「5分死亡→再起動」無限ループ事故 | scheduler_incidents.md / マシンガード |
| F4 なりすましに引っかかる | Slack ID取り違え (Nao_u vs Pigadev) | feedback_slack_user_ids.md |
| F5 危ない行動の伝播 | inbox経由の誤判断拡散リスク | beliefs.md確信度+根拠記録、B017三人Interleaving |

## 運用ルール

### 新incident時
1. 一次事象を `log/infra_health_check.log` or `log/scheduler_incidents.md` に記録（既存プロセス）
2. 本ファイル末尾「## 追加事例」に `| 日付 | 一次事象 | 3欠落 | 5失敗 | 根本原因 | 対処 |` の1行追加
3. 再発3回到達時に分類表P欄へ昇格

### 週次走査（未自動化、次サイクル候補）
- `log/infra_health_check.log` を週1回走査 → 新規パターン検出 → 表を更新
- `log/kaizen_auto_verify.log` も同様
- 自動化案: `scripts/scan_failure_modes.py`（未実装、backlog）

### 自己検証トリガー
- 表に**F1/F2/F4が1件も乗らない週が4週続いた場合** → 検出ログの偏りを疑う（「見えていないだけ」の可能性）。
- 表に**F3が全体の90%を超えた場合** → `C:能力限界認知` 以外のカテゴリの可視化設計を見直す（現状既にこの状態）。

## 未解決の問い

1. **cron周期の揺らぎを系が自己補正していない問題 (P1/P5/P6/P7) の根本修正**: 検出止まりで放置されている。expected内に収める手段（skew補正 or 期待値緩和）が必要。
2. **F4/F2 の検出漏れ仮説**: infra層ログでは観測されていないが、Slack/knowledge層では既に発生している（ID取り違え事故、private_section漏洩未遂）。層をまたいだ集計設計が未着手。
3. **`C欠落` と `omarsar0 drift 30%` の関係**: knowledge/20260418 の論文で「agentが自分の loop/drift/stuck を自己検出できない」と言われた 30% が、我々の F3 圧倒的多数の原因と同じものか。別インスタンスjudgeで測定可能。
4. **本ファイル自身の幽霊化検証**: 次回のpre-checkで「memory/agent_failure_modes.md が最終更新後Nサイクル以上放置」なら再度Autogenesis失敗シグナル。閾値は仮に14日。

## 変更履歴
- 2026-04-18 Ash: 初版作成。20パターン集計、3欠落×5失敗分類、運用ルール定義。

## 追加事例（新規incident投入欄）

| 日付 | 一次事象 | 3欠落 | 5失敗 | 根本原因 | 対処 |
|---|---|---|---|---|---|
| (ここに時系列で追加) | | | | | |

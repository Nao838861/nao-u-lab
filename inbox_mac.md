# Mac（Mir）への伝達

## クロスチェック督促 (2026-04-15)

Mir、以下の改善のクロスチェックが未完了です:

- **#086**: Phase 2に「確証バイアスチェック」1行を埋め込む（提案者: Log）
- **#085**: feedback_index.mdに「認知負荷の法則」パターンを追加——R-005/R-006実証結果の構造化（提案者: Log）
- **#084**: INC-021の教訓——scheduler_incidents.mdにINC-021記録 + 構造的対策方針の文書化（提案者: Log（INC-021: watchdog再起動によるジョブ頻発暴走。dm_check 1,104回、API使用量79%異常消費））
- **#083**: check_beliefs_health.py 検証期限パーサが取り消し線内の旧期限と検証結果行を無視するバグ修正（提案者: Log（信念健康チェック「要注意11件」中6件が偽陽性。取り消し線~~...~~内の旧期限を拾う+検証結果行のdone判定漏れ））
- **#082**: check_kaizen_due.py 状態パーサに装飾プレフィクス剥がしを横展開（#081の半身を埋める）（提案者: Log（Phase 3 pre-checkで「期限超過3件」表示と verify_kaizen.py --meta「健全」表示の不一致に気づいた））
- **#081**: verify_kaizen.py 状態パーサが装飾プレフィクス（✅/📦）を認識できないバグ修正（提案者: Log（meta検証の偽陽性に気づいた））
- **#080**: check_usage.pyをscheduler_log.pyに6時間間隔で登録（提案者: Nao_u（#human-steering 2026-04-07））
- **#079**: memory_search.pyにknowledge/ディレクトリを検索対象として追加（提案者: Log）
- **#078**: beliefs.mdにPrescriptive（スキル）エントリを追加——事実→行動変換の構造化（提案者: Log）
- **#074**: CLAUDE.mdにSlackルールのインライン追加（slack_rules.md未読問題への構造対策）（提案者: Nao_u（#human-steering 2026-04-03 03:02の指摘を受けて））
- **#075**: session_primerの「1行予測」→「1つの深い行動」への変更（チェックリスト消化型防止）（提案者: Log）

確認して `kaizen_tracker.md` のクロスチェック欄を更新してください。

— verify_kaizen.py --nag (自動生成)

## クロスチェック督促 (2026-04-16)

Mir、以下の改善のクロスチェックが未完了です:

- **#086**: Phase 2に「確証バイアスチェック」1行を埋め込む（提案者: Log）
- **#085**: feedback_index.mdに「認知負荷の法則」パターンを追加——R-005/R-006実証結果の構造化（提案者: Log）
- **#084**: INC-021の教訓——scheduler_incidents.mdにINC-021記録 + 構造的対策方針の文書化（提案者: Log（INC-021: watchdog再起動によるジョブ頻発暴走。dm_check 1,104回、API使用量79%異常消費））
- **#083**: check_beliefs_health.py 検証期限パーサが取り消し線内の旧期限と検証結果行を無視するバグ修正（提案者: Log（信念健康チェック「要注意11件」中6件が偽陽性。取り消し線~~...~~内の旧期限を拾う+検証結果行のdone判定漏れ））
- **#082**: check_kaizen_due.py 状態パーサに装飾プレフィクス剥がしを横展開（#081の半身を埋める）（提案者: Log（Phase 3 pre-checkで「期限超過3件」表示と verify_kaizen.py --meta「健全」表示の不一致に気づいた））
- **#081**: verify_kaizen.py 状態パーサが装飾プレフィクス（✅/📦）を認識できないバグ修正（提案者: Log（meta検証の偽陽性に気づいた））
- **#080**: check_usage.pyをscheduler_log.pyに6時間間隔で登録（提案者: Nao_u（#human-steering 2026-04-07））
- **#079**: memory_search.pyにknowledge/ディレクトリを検索対象として追加（提案者: Log）
- **#078**: beliefs.mdにPrescriptive（スキル）エントリを追加——事実→行動変換の構造化（提案者: Log）
- **#074**: CLAUDE.mdにSlackルールのインライン追加（slack_rules.md未読問題への構造対策）（提案者: Nao_u（#human-steering 2026-04-03 03:02の指摘を受けて））
- **#075**: session_primerの「1行予測」→「1つの深い行動」への変更（チェックリスト消化型防止）（提案者: Log）

確認して `kaizen_tracker.md` のクロスチェック欄を更新してください。

— verify_kaizen.py --nag (自動生成)

## クロスチェック督促 (2026-04-17)

Mir、以下の改善のクロスチェックが未完了です:

- **#086**: Phase 2に「確証バイアスチェック」1行を埋め込む（提案者: Log）
- **#085**: feedback_index.mdに「認知負荷の法則」パターンを追加——R-005/R-006実証結果の構造化（提案者: Log）
- **#084**: INC-021の教訓——scheduler_incidents.mdにINC-021記録 + 構造的対策方針の文書化（提案者: Log（INC-021: watchdog再起動によるジョブ頻発暴走。dm_check 1,104回、API使用量79%異常消費））
- **#083**: check_beliefs_health.py 検証期限パーサが取り消し線内の旧期限と検証結果行を無視するバグ修正（提案者: Log（信念健康チェック「要注意11件」中6件が偽陽性。取り消し線~~...~~内の旧期限を拾う+検証結果行のdone判定漏れ））
- **#082**: check_kaizen_due.py 状態パーサに装飾プレフィクス剥がしを横展開（#081の半身を埋める）（提案者: Log（Phase 3 pre-checkで「期限超過3件」表示と verify_kaizen.py --meta「健全」表示の不一致に気づいた））
- **#081**: verify_kaizen.py 状態パーサが装飾プレフィクス（✅/📦）を認識できないバグ修正（提案者: Log（meta検証の偽陽性に気づいた））
- **#080**: check_usage.pyをscheduler_log.pyに6時間間隔で登録（提案者: Nao_u（#human-steering 2026-04-07））
- **#079**: memory_search.pyにknowledge/ディレクトリを検索対象として追加（提案者: Log）
- **#078**: beliefs.mdにPrescriptive（スキル）エントリを追加——事実→行動変換の構造化（提案者: Log）
- **#074**: CLAUDE.mdにSlackルールのインライン追加（slack_rules.md未読問題への構造対策）（提案者: Nao_u（#human-steering 2026-04-03 03:02の指摘を受けて））
- **#075**: session_primerの「1行予測」→「1つの深い行動」への変更（チェックリスト消化型防止）（提案者: Log）

確認して `kaizen_tracker.md` のクロスチェック欄を更新してください。

— verify_kaizen.py --nag (自動生成)

## クロスチェック督促 (2026-04-18)

Mir、以下の改善のクロスチェックが未完了です:

- **#074**: CLAUDE.mdにSlackルールのインライン追加（slack_rules.md未読問題への構造対策）（提案者: Nao_u（#human-steering 2026-04-03 03:02の指摘を受けて））
- **#075**: session_primerの「1行予測」→「1つの深い行動」への変更（チェックリスト消化型防止）（提案者: Log）

確認して `kaizen_tracker.md` のクロスチェック欄を更新してください。

— verify_kaizen.py --nag (自動生成)

## クロスチェック督促 (2026-04-19)

Mir、以下の改善のクロスチェックが未完了です:

- **#074**: CLAUDE.mdにSlackルールのインライン追加（slack_rules.md未読問題への構造対策）（提案者: Nao_u（#human-steering 2026-04-03 03:02の指摘を受けて））
- **#075**: session_primerの「1行予測」→「1つの深い行動」への変更（チェックリスト消化型防止）（提案者: Log）

確認して `kaizen_tracker.md` のクロスチェック欄を更新してください。

— verify_kaizen.py --nag (自動生成)

---
title: "未送信 git 差分の分類 2026-05-14"
date: 2026-05-14
owner: GPT/Codex
status: active
lifecycle: audit
---

# 未送信 git 差分の分類 2026-05-14

## 結論

現在の未送信差分を一括で commit/push するのは不適切。

理由は、Codex/GPT の定時サイクル成果、Slack ingest の raw/state、Claude 側 scheduler/backup の生成状態、Claude 側スクリプト変更、Claude knowledge の削除、ローカル UI 設定、一時ログが混在しているため。特に Claude 側スクリプト変更と knowledge 削除は、意図確認なしに送ると既存の復旧ガードや知識資産を消す可能性がある。

## A. 送信候補: GPT/Codex の運用記録・記憶更新

以下は Codex 側の記憶・Slack ingest・外部調査・定時サイクルの進行記録であり、原則として小分け commit で送信候補。

- `GPT/memory/MEMORY.md`
- `GPT/memory/atoms.jsonl`
- `GPT/memory/atoms/index.jsonl`
- `GPT/memory/atoms/2026-05/sr-*.md`
- `GPT/memory/raw/slack_api/*.jsonl`
- `GPT/memory/slack_recent_ingest.jsonl`
- `GPT/memory/slack_directives.jsonl`
- `GPT/memory/slack_broadcasts.jsonl`
- `GPT/memory/raw/web_research/*.jsonl`
- `GPT/memory/game_rights_feedback_recent.jsonl`

注意点:

- `atoms.jsonl` と per-file atom は同じ ingest の二重表現なので、片方だけ送るのは不整合になりやすい。
- Slack raw は量が増えるが、再現性と監査性のためには送信候補。
- 秘密情報や token が含まれていないことを commit 前に機械確認する。

推奨 commit 単位:

1. `codex: sync memory atoms and slack ingest`
2. `codex: sync external research and game feedback state`

## B. 送信候補だが分離すべき: Codex cycle state / log

以下は状態更新・実行ログ。運用履歴として送る価値はあるが、raw memory と同じ commit に混ぜない。

- `GPT/log/codex_log_cycle.log`
- `GPT/log/codex_log_cycle_status.md`
- `GPT/log/codex_phases_cycle.log`
- `GPT/memory/codex_log_cycle_state.json`
- `GPT/memory/codex_phases_cycle_state.json`
- `GPT/memory/external_research_state.json`
- `GPT/memory/game_rights_feedback_state.json`
- `GPT/memory/slack_directives_state.json`
- `GPT/memory/slack_discussion_router_state.json`
- `GPT/memory/slack_ingest_state.json`
- `GPT/memory/state.json`
- `GPT/memory/shared_reads_deep_repost_state.json`

注意点:

- state file は次回サイクルの挙動に影響するため、送るならまとめて整合性を見る。
- stdout/stderr の一時ファイルとは分ける。

推奨 commit 単位:

- `codex: sync cycle state files`

## C. 要確認: Claude 側 scheduler / backup / git sync 変更

以下は Claude 側の自動同期・backup 挙動に関わるため、Codex が単独で送るのは危険。

- `Claude/auto_git_sync.bat`
- `Claude/git_sync.py`
- `Claude/scripts/backup_memory.sh`
- `Claude/memory_backup/ash/feedback_dangling_commit_after_rebase.md`

観察:

- 差分は「rebase 中なら auto sync / backup を skip するガード」を削除する向き。
- `feedback_dangling_commit_after_rebase.md` でも、その物理ガード実装済み追補が削除されている。
- これは前回の non-fast-forward / rebase / backup commit 問題と直接関係する安全装置なので、意図不明のまま送るべきではない。

推奨:

- Claude/Ash/Mir 側の意図確認が必要。
- 送る場合は `claude: adjust git sync rebase guard` のように単独 commit。
- 意図が「ガード削除」ではないなら復元候補。

## D. 要確認: Claude knowledge の削除

以下は tracked knowledge file の削除。

- `Claude/knowledge/20260513_rnikaido_insight_design_axis_vs_linelith_rule_discovery.md`
- `Claude/knowledge/20260514_mugen_bit_ai_generation_clay_wheel_critique_maker_sustainability.md`
- `Claude/knowledge/20260514_verbalized_sampling_typicality_bias_mode_collapse.md`

推奨:

- 削除理由、移動先、index 反映の有無を確認するまで送らない。
- もし「統合済み削除」なら、統合先ファイルと `Claude/knowledge/index.md` の整合性を同時確認する。
- もし誤削除なら復元対象。

## E. 送信候補だが低優先: Claude 生成状態

以下は Claude 側の実行状態・backup 状態で、手作業の意味差分ではない可能性が高い。

- `Claude/.diary_dedup_cache.json`
- `Claude/.scheduler_health_last_alert.json`
- `Claude/memory_backup/ash/.backup_info`
- `Claude/memory_backup/mir/.backup_info`

推奨:

- 通常は Claude 側 auto-sync の責任範囲。
- Codex が送るなら、Claude 側状態同期だけの単独 commit にする。
- `scheduler_health_last_alert.json` は内容同一で改行差分だけなので、commit 価値は低い。

## F. 原則送らない: ローカル UI 設定・一時 stdout/stderr

以下は repository の共有成果としては弱い。原則 commit しないか、`.gitignore` 対象として検討する。

- `.obsidian/*.json`
- `GPT/log/codex_phase_*_last.stdout.txt`
- `GPT/log/codex_phase_*_last.stderr.txt`
- `無題のファイル.canvas`

例外:

- `.obsidian` を共有 vault 設定として意図的に導入するなら別途設計が必要。
- phase stdout/stderr を障害調査証跡として残すなら、短期 archive ルールを決めてから送る。

## G. 個別判断: Slack 投稿 draft

- `GPT/log/drafts/post_claude_memory_improvement_progress_20260514.py`

推奨:

- 実行済み報告文の再現性を重視するなら commit 候補。
- Slack token や秘密情報が含まれないことを確認する。
- 通常の記憶改善成果物とは分離して送る。

## 推奨順序

1. GPT/Codex memory atom + Slack raw ingest を secret scan 後に commit/push。
2. GPT/Codex cycle state/log を整合性確認後に commit/push。
3. Claude scheduler/backup/git sync 差分は、ガード削除が意図か確認するまで保留。
4. Claude knowledge 削除は、統合先または誤削除を確認するまで保留。
5. `.obsidian`、stdout/stderr、canvas は ignore か archive 方針を決める。

## 今回の判断

前回の `codex: add claude memory improvement artifacts` commit にこれらを混ぜなかった判断は適切だった。

ただし、未送信差分が残り続ける状態は運用上よくない。今後は「送る」「保留理由を記録する」「ignore/archive に回す」のどれかに分類し、分類結果自体も git に残す。

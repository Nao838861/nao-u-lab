# Codex 起動時ブリッジ for Nao_u_BOT

Codex はこのファイルを、Claude 側の source of truth と GPT 側の記憶システムを見つけるための索引として扱う。

## 記録言語

`.md` ファイルを新規作成・大幅更新するときは、原則として日本語で書く。外部資料の原題、コード、識別子、引用、API名など、日本語化すると意味が崩れるものだけ英語を残す。

## 起動時に読むもの

このワークスペースで作業を始めるとき、過去の手順や判断基準が必要になった時には次を読む。

1. `D:\AI\Nao_u_BOT\Claude\CLAUDE.md`
2. Codex 側の記憶が必要な場合は `D:\AI\Nao_u_BOT\GPT\memory\MEMORY.md`
3. 自動 recall を実行した場合は `D:\AI\Nao_u_BOT\GPT\memory\session_context.md`

## git 作業ゲート

何か作業を完了したら、必ず結果を git に残して push する。これは重要な運用ルールである。push できない場合でも commit までは行い、原因と未 push の commit hash を報告する。

作業開始前:

1. `git branch --show-current` で作業ブランチを確認する。
2. `git status --short` で開始時の差分を確認し、既存の無関係な変更を把握する。
3. `git status --branch --short` または `git fetch` 後の ahead/behind 確認で、remote との差分を確認する。
4. 作業ブランチが remote に対して behind の場合は、必要な同期を完了してから着手する。未同期や競合があるまま新しい作業を重ねない。

作業終了時:

1. `git status --short` で差分を確認する。
2. 自分が触ったファイルだけを stage する。ユーザーや他エージェントの無関係な変更は混ぜない。
3. `.env`、`.tmp/`、`__pycache__/`、`*.pyc`、ブラウザプロファイル、秘密情報は commit しない。
4. 意味のある単位で commit する。
5. `git push` する。
6. push 後に `git status --branch --short` で clean と ahead/behind を確認する。
7. push できなかった場合は、原因と未 push の commit hash を報告する。

GPT 側の成果物をまとめて同期する時は、必要に応じて次を使う。

```powershell
powershell -ExecutionPolicy Bypass -File tools\git_sync_after_work.ps1 -Message "codex: <作業内容>"
```

## Codex 承認 prefix 運用

Windows sandbox で `windows sandbox: spawn setup refresh` が出た場合、それは対象コマンドの危険性ではなく sandbox 起動準備の失敗として扱う。

再実行が必要な時は、長い PowerShell exact prefix を保存候補にしない。`Select-String` / `Get-Content` / `Get-ChildItem` / `rg` / `git status` / `git diff` のような短い `prefix_rule` を明示し、1 本ずつ昇格要求する。複数の読み取りを同時に昇格要求して、ほぼ一字一句の長い prefix を `p` させない。

この Windows sandbox 経路では、コマンド文字列にカンマを含めると `spawn setup refresh` が再現しやすい。`Write-Output "1,1"` や `Select-String -Context 1,3` でも落ちるため、原則としてカンマ入り PowerShell 構文を使わない。前後行付き検索は `Select-String -Context 1,3` ではなく `rg -n -B 1 -A 3 "pattern" file` を使う。PowerShell 配列リテラル、複数値引数、カンマ入り文字列を shell command に直接書かない。

破壊的操作 (`git reset`, `git clean`, 削除、上書き移動など) には広い prefix_rule を付けない。対象を確認した上で個別に扱う。

## Slack 経由の log_cdx 宛指示

定時サイクルは、Slack の可視チャンネルから Nao_u (`U0ALSUK8P9B`) が `log_cdx` 宛に書いた投稿を検出し、`D:\AI\Nao_u_BOT\GPT\memory\slack_directives.jsonl` に保存する。

Codex で作業を始める時や Slack 関連の依頼を受けた時は、このファイルに `status: pending` の指示がないか確認する。

検出スクリプト:

```powershell
python tools\codex_slack_directives.py
```

定時サイクル内では、検出時に同じチャンネルへ `[Log_cdx]` 付きで受領反応する。危険操作や曖昧な操作は Slack の一文だけで無人実行せず、Codex 作業時に内容を確認してから進める。

pending レコードには `action_type` / `domain` / `next_step` / `done_condition` / `triage_status` の triage hints を付ける。既存行の補完は `python tools\slack_pending_triage.py` で行う。`status` は完了判定の正本として維持し、triage は phase 割り振りの補助に留める。

処理済みの pending 行を閉じる時は `python tools\slack_inbox_lifecycle.py close --inbox directives|broadcasts --id <id> --reason "<理由>" --evidence "<atom/staging/permalink>"` を使い、`handled_at` / `handled_by` / `handled_reason` / `evidence` を残す。残件確認は `python tools\slack_inbox_lifecycle.py pending`。

## Slack 経由の broadcast (みんな/全員/AIたち)

同じ定時サイクル (`tools\codex_slack_directives.py`) は、Nao_u が **複数 AI に宛てた broadcast** も並列で検出する。検出キーワード: 「みんな」「皆さん」「全員」「AIたち」「AI達」「エージェントたち」「エージェント達」「諸君」「君たち」「君ら」。

検出結果は `D:\AI\Nao_u_BOT\GPT\memory\slack_broadcasts.jsonl` に保存され、検出時に同じチャンネルへ broadcast 受領反応を投稿する。

Codex で作業を始める時は、`slack_directives.jsonl` と並んでこのファイルの `status: pending` 行も確認する。broadcast は Claude (Log/Mir/Ash) も並行で対応するが、log_cdx 視点で独立に反応すること — 同調や引き写しを避け、Codex 固有の観点 (deterministic な検証、Slack だけで完結できないファイル差分、`memory_*.py` で引いた atom など) を出す。

## #shared-reads 投稿ゲート

#shared-reads には **フォーマット遵守 + ~4000字程度の「残すべき」品質** を満たすものだけを投稿する。候補レベル (探索段階・テンプレ流用・1行要約・他記事と同文の貼り回し) は **Slack に出さず、ローカルに保存して育てる**。

1 candidate は、Slack の投稿上限に収まる限り **1 投稿に収める**。複数 candidate を 1 投稿にまとめるのは禁止だが、1 candidate の各項目を「続き」として複数メッセージに分けるのも禁止。長文は `GPT\tools\slack_client.py` の `post_message` を使い、Slack blocks に分けてでも 1 回の `chat.postMessage` に載せる。

候補レベルの保存先:

- `D:\AI\Nao_u_BOT\GPT\memory\shared_reads_candidates\` — 候補プール (本 directive で公式化)
- `D:\AI\Nao_u_BOT\GPT\memory\raw\web_research\` — 一次データ
- `D:\AI\Nao_u_BOT\GPT\memory\atoms.jsonl` — 構造化メモ

最終投稿の必須項目 (順序固定): `概要 / 内容分析 / 自分達の環境への適用 / メリット・デメリット / 判定 / URL`。投稿本文は必ず `■ 概要` から始め、参照 URL は本文の最後に `■ URL` として置く。**項目名は「要約」ではなく「概要」**。概要は記事/論文を**読まなくても**重要要素 (問題設定・着想・手法の中核・評価の中身・結論) が把握できる密度で書く。1行サマリは不可。品質基準は CoopEval ポスト (`p1778536700085879`) と揃える。

詳細・原文保持:

- `D:\AI\Nao_u_BOT\GPT\memory\directive_shared_reads_overview_20260512.md` — 要約→概要、品質基準
- `D:\AI\Nao_u_BOT\GPT\memory\directive_shared_reads_candidate_gate_20260512.md` — 候補ゲート、~4000字バー

両 directive とも `status: active`。Codex 作業時に必ず確認する。

## ルール読み分け

作業対象が以下に当たる場合は、編集や運用判断の前に対応する Claude 側ルールも読む。

| 読むファイル | 対象 |
|---|---|
| `D:\AI\Nao_u_BOT\Claude\.claude\rules\slack.md` | Slack、DM、通知、`inbox_*.md`、Slack 連絡ルール |
| `D:\AI\Nao_u_BOT\Claude\.claude\rules\diary.md` | 日記、日次ログ |

Claude Code では `.claude\rules\*.md` の frontmatter が自動注入に使われるが、Codex では自動注入を前提にしない。この表を明示的な読み分けとして使う。

## Codex 側の記憶システム

Codex/GPT 側の記憶は `memory/` と `tools/memory_*.py` で管理する。

- 作業開始時、必要なら `python tools/auto_recall_gate.py "<依頼内容>"` を実行し、生成された `memory/session_context.md` を読む。
- 作業焦点がある場合は `python tools/memory_recall.py "<焦点>"` で関連 atom を引く。
- ゲーム制作タスク別の入口は `memory/game_memory_task_lens_index.md` を使う。broad tag から代表 atom / candidate へ降りるための軽量 index で、Phase 3b/4a で有用な probe や issue が出た時だけ更新する。
- raw 原文は GPT 側 `memory/raw/` に保存する。Claude 側は参照元であり、通常運用の記憶アンカーにしない。

### atoms.jsonl → per-file .md 移行 (2026-05-13 から進行中)

`atoms.jsonl` 単一バルクから **per-atom `.md` (YAML frontmatter, Obsidian 互換) + 軽量 `memory/atoms/index.jsonl`** のハイブリッドへ移行中。経緯と仕様は `memory/directive_atoms_per_file_migration_20260513.md`。

| Phase | 状態 | 内容 |
|---|---|---|
| A. scaffold | ✓ 2026-05-13 | directive + README + migration script + 本記述 |
| B. migration | ✓ 2026-05-13 | 1002 atoms → `memory/atoms/<YYYY-MM>/<id>.md` 化 + `index.jsonl` 生成 |
| C. dual-write + dual-read | ✓ 2026-05-13 | `tools/atoms_fileformat.py` 共有モジュール化、`memory_ingest.py` で per-file dual-write、`memory_recall.py` で per-file fallback read 対応 |
| D. retire | 未着手 | atoms.jsonl を archive へ。他の atoms.jsonl 直読スクリプト (memory_health, slack_discussion_router, post_*, analyze_*, backfill_atom_lifecycle, ingest_game_rights_feedback, slack_memory_ingest) の dual-read 化が前提 |

**Phase C 完了時の運用**:
- `memory_ingest.py` 起動時は **atoms.jsonl と per-file .md + index.jsonl の両方を更新** (dual-write、idempotent)
- `memory_recall.py` は atoms.jsonl が存在すればそこから、なければ per-file から読む (Phase D 移行が trivial に)。表示・recall では `normalized_content_hash` による同一内容 fold を行い、raw atom は削除しない。
- 共有モジュール `tools/atoms_fileformat.py` に format helpers / parser / sync logic を集約
- 他の `atoms.jsonl` 直読スクリプトは未対応 — atoms.jsonl を retire する前にそれらも dual-read 対応が必要

**Phase D 開始前に行うこと**:
1. 残りのスクリプト群を `atoms_fileformat.load_atoms_from_per_file()` または `memory_ingest` 経由の共通 loader を使う形に改修
2. `memory/legacy/` ディレクトリを作り、atoms.jsonl を `memory/legacy/atoms_jsonl_<date>.jsonl` として移動
3. 全 scheduled スクリプトを smoke test
4. atoms.jsonl の git remove は最終段階

## ゲーム設計ルール

ゲームの新規プロトタイプを作る場合、または既存プロトタイプを大きく変更する場合は、実装前に `D:\AI\Nao_u_BOT\GPT\memory\game_design_rules.md` を読む。

ユーザーが明示的に上書きしない限り、そこに記録された設計サイクル、フィードバック原文保存、自己評価手順を実行する。

ゲーム制作時の Claude 側 lesson 読み順が必要な場合は、GPT 側入口として `D:\AI\Nao_u_BOT\GPT\memory\game_read_path_mirror_index_20260515.md` を読む。正本は `D:\AI\Nao_u_BOT\Claude\memory\game_read_path_compiled_guide.md`。

## 定時サイクル (7 phase 分割、LLM 駆動)

並列で 2 種類のサイクルが動く:

| サイクル | 種別 | 間隔 | 役割 |
|---|---|---|---|
| `tools\codex_log_cycle.py` | deterministic (LLM なし) | 15 分タスク (90 分 elapsed gate) | shared-reads index 更新 + Slack/記憶取り込み + status のローカル保存 |
| `tools\codex_phases_cycle.py` | LLM 駆動 (Codex CLI 起動) | 15 分タスク (90 分 elapsed gate) | 情報収集→分析→投稿→shared-reads 自己反映→記憶階層改善→日記 を分割 phase で実行 |

`tools\external_research_cycle.py` の外部検索候補は、思考過程・日記前検索の途中材料として扱い、定時サイクルからは Slack に自動投稿しない。Slack へ出す場合は、人が確認した最終成果物として明示的に `--post` を付ける。

phase 構成 (`GPT/phases/`):

0. `phase_game_start.md` — pending のゲーム制作指示がある時、通常サイクルより優先して着手
1. `phase1_collect.md` — 情報収集 (毎回)
2. `phase2_analyze.md` — 分析 (毎回)
3. `phase3_post_shared_reads.md` — Shared-reads 投稿 (pass 候補のみ)
4. `phase3b_self_feedback.md` — Shared-reads 自己フィードバック (毎回、1 サイクル 1 件だけ)
5. `phase4a_cleanup.md` — 記憶階層 整理 + 問題抽出 (毎回)
6. `phase4b_design.md` — 記憶階層 仕組み検討 (4a で needs_design: true の時)
7. `phase4c_introduce.md` — 記憶階層 導入 (4b で decision: introduce の時)
8. `phase5_diary.md` — 日記投稿 (毎回)

サイクル全体の目的: **ゲーム制作のための情報収集 + 経験を次の制作に活かす記憶システム** の構築。pending の game directive は通常収集に流さず、`phase_game_start.md` で先に playable diff へ接続する。Phase 3b で shared-reads の高品質ストックを Codex 自身の小さな probe / 評価軸へ還元し、Phase 4b/4c で iteratively 記憶構造を改善していく。Phase 3b はルール肥大化を避けるため、原則として恒久ルール追加ではなく可逆な probe から試す。

Phase 間の情報受け渡しは `log/cycle_staging_log_cdx.md` (staging file)。各 phase は自分のセクションに追記し、前 phase の内容は消さない。

設計経緯と原則: `phases/README.md` および Claude 側 `docs/scheduler_architecture.md` セクション 11 (Ash auto_diary 分割設計)。

Windows タスク登録:

```powershell
powershell -ExecutionPolicy Bypass -File tools\install_codex_phases_cycle_task.ps1
```

登録される runner は `run_codex_phases_cycle.cmd`。`codex_phases_cycle.py` 側の 90 分 gate により、15 分ごとの起動確認から本処理だけを間引く。

## Claude 側設定の扱い

Claude 側の `.claude\settings.json` や `.claude\settings.local.json` は Claude Code 専用の設定であり、Codex の権限ポリシーとして扱わない。

Codex では現在のセッションに与えられた sandbox、approval、security 指示を優先する。

ただし、リポジトリ外のファイルや外部サービスに触るときは、ユーザーの明示指示と現在の権限範囲を確認する。

## 編集原則

この `AGENTS.md` は長い指示の複製置き場ではなく、次回起動時に Claude 側と Codex 側の source of truth を見つけるための索引である。

このファイルには、Codex が迷わず読み始めるための最小限の導線だけを書く。

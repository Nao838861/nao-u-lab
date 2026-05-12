# Codex 起動時ブリッジ for Nao_u_BOT

Codex はこのファイルを、Claude 側の source of truth と GPT 側の記憶システムを見つけるための索引として扱う。

## 起動時に読むもの

このワークスペースで作業を始めるとき、過去の手順や判断基準が必要になった時には次を読む。

1. `D:\AI\Nao_u_BOT\Claude\CLAUDE.md`
2. Codex 側の記憶が必要な場合は `D:\AI\Nao_u_BOT\GPT\memory\MEMORY.md`
3. 自動 recall を実行した場合は `D:\AI\Nao_u_BOT\GPT\memory\session_context.md`

## 作業後の git 同期

何か作業を完了したら、原則として結果を git に残して push する。これは重要な運用ルールである。

基本手順:

1. `git status --short` で差分を確認する。
2. 自分が触ったファイルだけを stage する。ユーザーや他エージェントの無関係な変更は混ぜない。
3. `.env`、`.tmp/`、`__pycache__/`、`*.pyc`、ブラウザプロファイル、秘密情報は commit しない。
4. 意味のある単位で commit する。
5. `git push` する。
6. push できなかった場合は、原因と未 push の commit hash を報告する。

GPT 側の成果物をまとめて同期する時は、必要に応じて次を使う。

```powershell
powershell -ExecutionPolicy Bypass -File tools\git_sync_after_work.ps1 -Message "codex: <作業内容>"
```

## Slack 経由の log_cdx 宛指示

定時サイクルは、Slack の可視チャンネルから Nao_u (`U0ALSUK8P9B`) が `log_cdx` 宛に書いた投稿を検出し、`D:\AI\Nao_u_BOT\GPT\memory\slack_directives.jsonl` に保存する。

Codex で作業を始める時や Slack 関連の依頼を受けた時は、このファイルに `status: pending` の指示がないか確認する。

検出スクリプト:

```powershell
python tools\codex_slack_directives.py
```

定時サイクル内では、検出時に同じチャンネルへ `[Log_cdx]` 付きで受領反応する。危険操作や曖昧な操作は Slack の一文だけで無人実行せず、Codex 作業時に内容を確認してから進める。

## Slack 経由の broadcast (みんな/全員/AIたち)

同じ定時サイクル (`tools\codex_slack_directives.py`) は、Nao_u が **複数 AI に宛てた broadcast** も並列で検出する。検出キーワード: 「みんな」「皆さん」「全員」「AIたち」「AI達」「エージェントたち」「エージェント達」「諸君」「君たち」「君ら」。

検出結果は `D:\AI\Nao_u_BOT\GPT\memory\slack_broadcasts.jsonl` に保存され、検出時に同じチャンネルへ broadcast 受領反応を投稿する。

Codex で作業を始める時は、`slack_directives.jsonl` と並んでこのファイルの `status: pending` 行も確認する。broadcast は Claude (Log/Mir/Ash) も並行で対応するが、log_cdx 視点で独立に反応すること — 同調や引き写しを避け、Codex 固有の観点 (deterministic な検証、Slack だけで完結できないファイル差分、`memory_*.py` で引いた atom など) を出す。

## #shared-reads 投稿ゲート

#shared-reads には **フォーマット遵守 + ~4000字程度の「残すべき」品質** を満たすものだけを投稿する。候補レベル (探索段階・テンプレ流用・1行要約・他記事と同文の貼り回し) は **Slack に出さず、ローカルに保存して育てる**。

候補レベルの保存先:

- `D:\AI\Nao_u_BOT\GPT\memory\shared_reads_candidates\` — 候補プール (本 directive で公式化)
- `D:\AI\Nao_u_BOT\GPT\memory\raw\web_research\` — 一次データ
- `D:\AI\Nao_u_BOT\GPT\memory\atoms.jsonl` — 構造化メモ

最終投稿の必須項目 (順序固定): `概要 / 内容分析 / 自分達の環境への適用 / メリット・デメリット / 判定`。**項目名は「要約」ではなく「概要」**。概要は記事/論文を**読まなくても**重要要素 (問題設定・着想・手法の中核・評価の中身・結論) が把握できる密度で書く。1行サマリは不可。品質基準は CoopEval ポスト (`p1778536700085879`) と揃える。

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
- raw 原文は GPT 側 `memory/raw/` に保存する。Claude 側は参照元であり、通常運用の記憶アンカーにしない。

## ゲーム設計ルール

ゲームの新規プロトタイプを作る場合、または既存プロトタイプを大きく変更する場合は、実装前に `D:\AI\Nao_u_BOT\GPT\memory\game_design_rules.md` を読む。

ユーザーが明示的に上書きしない限り、そこに記録された設計サイクル、フィードバック原文保存、自己評価手順を実行する。

## 定時サイクル (7 phase 分割、LLM 駆動)

並列で 2 種類のサイクルが動く:

| サイクル | 種別 | 間隔 | 役割 |
|---|---|---|---|
| `tools\codex_log_cycle.py` | deterministic (LLM なし) | 15 分タスク (90 分 elapsed gate) | shared-reads index 更新 + Slack #log への status 投稿 |
| `tools\codex_phases_cycle.py` | LLM 駆動 (Codex CLI 起動) | 90 min 目安 | 情報収集→分析→投稿→記憶階層改善→日記 を分割 phase で実行 |

phase 構成 (`GPT/phases/`):

1. `phase1_collect.md` — 情報収集 (毎回)
2. `phase2_analyze.md` — 分析 (毎回)
3. `phase3_post_shared_reads.md` — Shared-reads 投稿 (pass 候補のみ)
4. `phase4a_cleanup.md` — 記憶階層 整理 + 問題抽出 (毎回)
5. `phase4b_design.md` — 記憶階層 仕組み検討 (4a で needs_design: true の時)
6. `phase4c_introduce.md` — 記憶階層 導入 (4b で decision: introduce の時)
7. `phase5_diary.md` — 日記投稿 (毎回)

サイクル全体の目的: **ゲーム制作のための情報収集 + 経験を次の制作に活かす記憶システム** の構築。Phase 4b/4c で iteratively 記憶構造を改善していく。

Phase 間の情報受け渡しは `log/cycle_staging_log_cdx.md` (staging file)。各 phase は自分のセクションに追記し、前 phase の内容は消さない。

設計経緯と原則: `phases/README.md` および Claude 側 `docs/scheduler_architecture.md` セクション 11 (Ash auto_diary 分割設計)。

Codex CLI の正確な起動方法は orchestrator (`tools/codex_phases_cycle.py`) の `invoke_codex_cli()` に TODO として残っている。次サイクルの Phase 4c で Codex 自身が実装することを想定 (scaffold は state/gating/staging のみ working)。

## Claude 側設定の扱い

Claude 側の `.claude\settings.json` や `.claude\settings.local.json` は Claude Code 専用の設定であり、Codex の権限ポリシーとして扱わない。

Codex では現在のセッションに与えられた sandbox、approval、security 指示を優先する。

ただし、リポジトリ外のファイルや外部サービスに触るときは、ユーザーの明示指示と現在の権限範囲を確認する。

## 編集原則

この `AGENTS.md` は長い指示の複製置き場ではなく、次回起動時に Claude 側と Codex 側の source of truth を見つけるための索引である。

このファイルには、Codex が迷わず読み始めるための最小限の導線だけを書く。

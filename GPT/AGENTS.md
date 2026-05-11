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

## Claude 側設定の扱い

Claude 側の `.claude\settings.json` や `.claude\settings.local.json` は Claude Code 専用の設定であり、Codex の権限ポリシーとして扱わない。

Codex では現在のセッションに与えられた sandbox、approval、security 指示を優先する。

ただし、リポジトリ外のファイルや外部サービスに触るときは、ユーザーの明示指示と現在の権限範囲を確認する。

## 編集原則

この `AGENTS.md` は長い指示の複製置き場ではなく、次回起動時に Claude 側と Codex 側の source of truth を見つけるための索引である。

このファイルには、Codex が迷わず読み始めるための最小限の導線だけを書く。

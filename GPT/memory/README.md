# Codex 記憶システム

Codex/GPT 側で、原文 raw を含めて記憶を閉じるための仕組みです。Claude 側は参照してよいが、通常運用で想起・利用する記憶の原文と atom は GPT フォルダ内に保存します。

## 目的

- `shared-reads`、`all-nao-u-lab`、`game-rights` などから、次回以降の Codex が使える検索可能な atom を生成する。
- 原文 raw を `memory/raw/` に保存し、`source_ts` と links から GPT フォルダ内で戻れるようにする。
- 要約だけでなく、「いつ使うべきか」を `trigger` として残す。
- 日記/Log 投稿前に外部検索や Slack 新規投稿確認を行い、有用な情報を記憶化する。

## 構成

| 層 | ファイル | 役割 |
|---|---|---|
| raw | `memory/raw/` | Slack 原文、外部検索結果、参照元 |
| atom | `memory/atoms.jsonl` | `title` / `trigger` / `tags` / `excerpt` / `source_ts` / optional lifecycle metadata |
| game-task facets | `tools/memory_game_task_facets.py` | atom 本体を書き換えず、制作タスク別の `Game Task Entry Points` を `MEMORY.md` に派生表示する |
| index | `memory/MEMORY.md` | 起動時に読む軽量索引 |
| recall | `tools/memory_recall.py` | 作業焦点から関連 atom を検索 |
| gate | `tools/auto_recall_gate.py` | 依頼文から関連 atom を `memory/session_context.md` に展開 |
| teacher | `memory/game_teacher_sources.md` | ゲーム開発用の教師情報索引 |

## 基本操作

```powershell
python tools/memory_ingest.py
python tools/memory_recall.py "記憶 システム shared-reads"
python tools/auto_recall_gate.py "新しいゲームを作る"
python tools/memory_health.py
```

## 90 分ごとの Log 投稿

`tools/codex_log_cycle.py` は 90 分ごとに次を行います。

1. 今の目的に合わせてインターネット検索を行う。
2. 複数の外部情報を取得し、価値判断を `memory/raw/web_research/` に保存する。
3. 共有すべき有用情報があれば `shared-reads` に投稿する。
4. `game-rights` から Nao_u のゲーム開発フィードバックを取得し、教師コメント atom として保存する。
5. Slack API で `shared-reads` と `all-nao-u-lab` の新規投稿を確認する。
6. 有用投稿を atom 化し、GPT 側 `memory/atoms.jsonl` に保存する。
7. #log に日本語で「何が面白いか」「どの判断に効くか」「次にどう使うか」を投稿する。

`game-rights` 由来の Nao_u 指摘は、通常の Slack atom とは別に `nao-u-feedback` / `game-dev-teacher` / `supervised-feedback` タグを付けます。

## atom lifecycle metadata

重複した定型投稿は削除せず、`atoms.jsonl` に optional field として lifecycle を付けます。

- `group_id`: 同じ重複クラスタを示す機械的 ID。
- `status`: `active` / `candidate` / `superseded` / `archived`。未指定は `active` 扱い。
- `canonical_id`: recall と index で優先表示する代表 atom。
- `duplicate_reason`: 重複扱いの理由。
- `supersedes` / `superseded_by`: 代表 atom と退役 atom の対応。

`tools/memory_recall.py` と `tools/memory_ingest.py` は canonical を優先し、`superseded` / `archived` は通常表示から折りたたみます。atom の `id` または `source_ts` を直接指定した検索では、退役 atom も確認できます。

## ゲーム開発の教師情報

ゲーム開発では次を優先して想起します。

- `game-rights` の Nao_u フィードバック atom
- `shared-reads` のゲーム開発関連記事 atom
- `memory/game_teacher_sources.md` に登録された分析ファイル
- 各ゲームの design_log と、ユーザーフィードバック原文

現在の追加教師情報:

- `memory/teacher_study_platformer_01_analysis.md`
- `memory/teacher_shot_log_v01_analysis.md`

## 作業後の git 同期

記憶やゲーム、運用スクリプトを変更したら、作業完了時に git に残して push します。秘密情報と一時生成物は除外します。

除外対象:

- `GPT/.env`
- `GPT/.tmp/`
- `__pycache__/`
- `*.pyc`

同期補助:

```powershell
powershell -ExecutionPolicy Bypass -File tools\git_sync_after_work.ps1 -Message "codex: <作業内容>"
```

## 設計判断

- 自動投稿は「取得できた」だけでは行わない。後で判断や制作に使える価値があるものだけを `shared-reads` に投稿する。
- 検索結果は、投稿しなかったものも `memory/raw/web_research/` に raw として保存する。
- Slack 投稿は GPT 側 `tools/slack_client.py` が担当する。Claude 側スクリプトは import しない。
- ベクトル DB や外部記憶サービスは使わない。今の規模では JSONL、rg、軽量スコアリングで十分とする。
- 行動に効いた atom は、最終報告で明示する。

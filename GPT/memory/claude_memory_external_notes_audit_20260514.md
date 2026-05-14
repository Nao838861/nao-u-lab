# Claude external_notes統合audit

作成日: 2026-05-14
対応タスク: CMI-011 external_notes統合audit
担当: GPT/Codex

## 目的

`external_notes_*` 系がrawとして滞留し、`reference`、`shared_reads`、`beliefs`、`project` へ昇格されない問題を観測する。

今回はauditのみ。Claude側の `external_notes_*` 本文、index、runtime stateは編集しない。

## 対象ファイル

| ファイル | サイズ | 行数 | 統合済系マーカー出現数 | URL数 | 備考 |
| --- | ---: | ---: | ---: | ---: | --- |
| `Claude/memory/external_notes_ash.md` | 329,639 bytes | 3,498 | 67 | 94 | 2026-03〜2026-05の外部観察。統合済マーカーは多いが、未統合候補も残る。 |
| `Claude/memory/external_notes_log.md` | 394,129 bytes | 2,992 | 261 | 189 | 2026-05の新しい外部読解が多い。統合済マーカーが多く、運用は比較的進んでいる。 |
| `Claude/memory/external_notes_mac.md` | 56,283 bytes | 607 | 0 | 10 | 小さいが統合済マーカーがない。古い外部摂取がrawのまま残っている可能性が高い。 |
| `Claude/memory/external_notes_mir.md` | 428,487 bytes | 4,127 | 35 | 157 | 最大。Mirの外部観察が長く蓄積し、未統合判定が難しい。 |

数値は2026-05-14時点の機械的カウント。統合済マーカー出現数はエントリ単位の正確な統合数ではなく、`統合済` / `integrated` 系文字列の出現数。

## writer / reader

### writer

主なwriterはClaude側の定時サイクル。

- `Claude/auto_diary.py`
  - Phase 1で `memory/external_notes_ash.md` の未統合エントリを読むよう指示。
  - Phase 2で外部情報から重要な1-2件を選び、shared-reads投稿やexternal_notes統合を促す。
  - Phase 2のコメントに「shared-reads分析＋external_notes統合」と明記されている。
- `Claude/autonomous_cycle.sh`
  - Mir側Phase 1で `memory/external_notes_mir.md` の未統合エントリを確認するよう指示。
  - Phase 2でTwitter推薦記事、#nao-u RT記事、external_notes未統合エントリを分析対象にする。
  - Phase 3で `external_notes_mir.md` の未統合エントリを1-2件選び接続・統合するよう指示。

### reader

直接のreaderは定時サイクルのPhase 1〜3。間接的には、次のindexや成果物へ昇格される。

- `Claude/memory/references_external_index.md`
- `Claude/memory/shared_reads/README.md`
- `Claude/memory/beliefs.md` / `beliefs_compact.md`
- `Claude/memory/project_*.md`
- `Claude/knowledge/*.md`
- `Claude/memory/game_dev_index.md`

## 既存の昇格先

### references_external_index

`references_external_index.md` は、architecture/設計改善時に引く外部観察の入口として機能している。

例:

- 記憶アーキテクチャ・コンテキスト工学
- プロンプト工学・エージェント設計
- マルチエージェント・cross_review・セキュリティ
- AIコミュニティ・発信
- 外部AIゲーム制作観察
- ローカルLLM・分散化

external_notesから昇格された外部理論・観察は、ここに載るとread pathが安定する。

### shared_reads

`shared_reads/README.md` は、Slack `#shared-reads` 投稿の永続コピーと、外部素材への解釈を集約する場所。

READMEには「単発のツイート紹介で温度が薄いものは `external_notes_*.md` 系の集約ファイルへ」とある。つまり、すべてのexternal_notesをshared_readsへ移す設計ではない。投稿・解釈・反応として独立価値があるものだけ昇格する。

### beliefs

`beliefs_compact.md` は信念の圧縮ビュー。external_notesから直接beliefsへ入れる場合は、単発情報ではなく、既存信念の確信度・因果・反証・補強に関わるものに限るべき。

### project

外部情報が特定プロジェクトの次アクションや判断に関わる場合は、`project_*.md` や `projects/` 側が昇格先になる。

## 観測された問題

### 1. 統合済マーカーの粒度が揺れている

`external_notes_*` には `[統合済 ...]`、`[統合済み ...]`、接続先付きマーカー、本文中の「統合済」などが混在している。

このため、単純な文字列カウントでは「何件が未統合か」を正確に出せない。現時点では、未統合量の測定自体が不安定。

### 2. external_notes_mac.md だけ統合済マーカーがない

`external_notes_mac.md` は小さいが、統合済系マーカーが0件だった。

古い外部摂取がそのままrawとして残っている可能性が高い。サイズが小さいため、最初の精密audit対象として扱いやすい。

### 3. external_notes_mir.md は最大で、manual auditに向かない

`external_notes_mir.md` は約428KB、4,127行。手で読むには大きい。

いきなり統合するより、見出し単位の抽出、日付、統合済マーカー、接続先、URL数を一覧化する検査が先に必要。

### 4. external_notes_log.md は運用が進んでいるが、新しい入力が多い

`external_notes_log.md` は統合済系マーカー出現数が多く、運用は比較的進んでいる。一方で2026-05-13〜2026-05-14の新しい外部読解があり、継続的に増える。

ここは「統合されていないから問題」というより、統合状態を機械的に一覧化できないことが問題。

### 5. shared_readsとexternal_notesの境界は既にある

`shared_reads/README.md` によって、shared_readsへ昇格するものとexternal_notesに残すものの境界はある。

ただし、その境界をexternal_notes側で判定・表示する仕組みは弱い。`external_notes` の各見出しに「rawのまま残す / shared_readsへ昇格 / referenceへ昇格 / beliefsへ接続 / projectへ接続 / discard」などの状態があると、manage層が強くなる。

## リスク判定

今回、Claude側のexternal_notes本文は編集しなかった。

理由:

- `external_notes_ash.md` と `external_notes_mir.md` は定時サイクルの入力であり、構造変更がcycle promptと競合しうる。
- 統合済マーカーの粒度が揺れており、機械的に未統合判定すると誤分類しやすい。
- raw evidenceを削除・移動する段階ではない。
- まず必要なのは統合ではなく、見出し単位の状態可視化である。

## 次の推奨

CMI-012は予定通り「次のfeedback canonical候補選定」に進める。

ただし、external_notes系については後続backlogとして次を追加する価値がある。

### 推奨後続: external_notes heading inventory

`external_notes_*.md` を見出し単位で一覧化するスクリプトまたはreportを作る。

列:

- file
- line
- heading
- date
- integrated marker有無
- connection targetらしき文字列
- URL数
- recommended route: raw / shared_reads / reference / beliefs / project / discard / unknown

最初の対象は `external_notes_mac.md` がよい。理由は小さく、統合済マーカーが0件で、auditの効果が見えやすいから。

## 検証

今回のauditではClaude側の本文・runtime stateを編集していないため、read-path検証のみ実行対象とする。

実行済み:

```powershell
python -m json.tool GPT\memory\claude_memory_improvement_state.json
python GPT\tools\validate_claude_read_paths.py
python GPT\tools\validate_claude_memory_artifact.py
```

検証結果はstate更新後に記録する。

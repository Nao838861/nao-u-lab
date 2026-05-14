# Claude validation coverage expansion

作成日: 2026-05-14
対応タスク: CMI-016

## 目的

`validate_claude_read_paths.py` と `validate_claude_memory_artifact.py` の対象拡張または統合を検討し、今後の定時サイクルで壊れやすい read-path / compiled artifact / canonical artifact を軽く検証できる状態にする。

## 判断

今回は validator を無理に1本へ統合しない。

理由:

- `validate_claude_read_paths.py` は「状況から読むべきファイルへ到達できるか」を検証する。
- `validate_claude_memory_artifact.py` は「active な compiled/canonical artifact 自体が正しい frontmatter、出典、pointer を持つか」を検証する。
- 目的が違うため、統合するとエラーの意味が曖昧になる。

代わりに、`validate_claude_memory_artifact.py` を単一 artifact 用から複数 artifact 用へ拡張した。

## 変更内容

変更:

- `GPT/tools/validate_claude_memory_artifact.py`

従来:

- `Claude/memory/memory_operation_compiled_guide.md` のみを検証。

今回:

次の3 artifact を検証対象にした。

| artifact | lifecycle | 検証すること |
|---|---|---|
| `Claude/memory/memory_operation_compiled_guide.md` | compiled | frontmatter、write/manage/read、raw/compiled、出典、CLAUDE/MEMORY pointer、session_primer 非接続 |
| `Claude/memory/feedback_rule_proliferation_canonical.md` | canonical | frontmatter、canonical_for、個別指摘/ルール追加/spec、出典、関連 raw/index からの pointer |
| `Claude/memory/game_read_path_compiled_guide.md` | compiled | frontmatter、新規 v01/改修/cross_review/Nao_u 評価受領、出典、game_dev_index pointer、MEMORY root 非接続 |

## 追加した検証軸

### 1. active artifact の frontmatter

`status: active` と `lifecycle: compiled | canonical` を検証する。

### 2. artifact の本文要件

各 artifact に最低限残っているべき語句を検証する。これは全文一致ではなく、役割が消えていないかを見るための軽いチェック。

### 3. 出典 path の存在

artifact 内に出典 path が書かれていること、かつ repo 内に実体が存在することを確認する。

### 4. pointer の期待/禁止

期待される入口から artifact へ到達できるかを見る。  
同時に、起動時負荷を増やしたくない artifact が `session_primer.md` や `MEMORY.md` root に入っていないかも確認する。

例:

- `memory_operation_compiled_guide.md` は `CLAUDE.md` と `MEMORY.md` から到達できる。
- `game_read_path_compiled_guide.md` は `game_dev_index.md` から到達できるが、`MEMORY.md` root や `session_primer.md` には置かない。

## read-path validator との役割分担

`validate_claude_read_paths.py` は CMI-014 で拡張済みで、現在 7 scenario を持つ。

- memory system improvement
- new rule or protocol
- new game v01
- game revision decision
- game cross_review
- Nao_u game feedback
- scheduler/runtime incident

CMI-016 ではこれを維持し、artifact validator 側を広げた。

## 検証結果

実行:

- `python GPT\tools\validate_claude_memory_artifact.py`
- `python GPT\tools\validate_claude_read_paths.py`
- `python -m json.tool GPT\memory\claude_memory_improvement_state.json`

結果:

- artifacts: 3
- artifact validator errors: 0
- artifact validator warnings: 0
- read-path scenarios: 7
- read-path errors: 0
- read-path warnings: 0
- state JSON: valid

## 次アクション

次は CMI-017 `external_notes heading inventory` に進む。CMI-016 の結果として、CMI-017 で作る inventory artifact が安定したら、将来の validator に「inventory report が存在し、対象 raw file と対応していること」を追加できる。

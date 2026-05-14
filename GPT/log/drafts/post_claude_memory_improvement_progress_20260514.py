#!/usr/bin/env python3
"""Post the current Claude memory improvement cycle report to Slack."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / "tools"
sys.path.insert(0, str(TOOLS))

from slack_client import post_message  # noqa: E402


MESSAGE = """[Codex] Claude側記憶システム改善サイクル報告（CMI-016）

今回は、前回までに作った compiled / canonical artifact と read-path が、今後の定時サイクルで壊れていないか確認できるように、validation coverage を拡張しました。

## CMI-016 validation coverage expansion

変更:
- `GPT/tools/validate_claude_memory_artifact.py`

追加レポート:
- `GPT/memory/claude_memory_validation_coverage_expansion_20260514.md`

意図:
`validate_claude_read_paths.py` と `validate_claude_memory_artifact.py` を統合するか検討しましたが、今回は統合しませんでした。理由は、役割が違うからです。

- read-path validator: 状況から読むべきファイルへ到達できるかを見る。
- artifact validator: active な compiled/canonical artifact が、frontmatter、出典、pointer を持っているかを見る。

統合すると、エラーが「読み道の破損」なのか「artifact 自体の破損」なのか曖昧になるため、分けたまま coverage を増やしました。

## 拡張内容

`validate_claude_memory_artifact.py` を、単一 artifact 検証から 3 artifact 検証へ拡張しました。

対象:

| artifact | lifecycle | 検証内容 |
|---|---|---|
| `Claude/memory/memory_operation_compiled_guide.md` | compiled | frontmatter、write/manage/read、raw/compiled、出典、CLAUDE/MEMORY pointer、session_primer 非接続 |
| `Claude/memory/feedback_rule_proliferation_canonical.md` | canonical | frontmatter、canonical_for、個別指摘/ルール追加/spec、出典、関連 raw/index からの pointer |
| `Claude/memory/game_read_path_compiled_guide.md` | compiled | frontmatter、新規 v01/改修/cross_review/Nao_u 評価受領、出典、game_dev_index pointer、MEMORY root 非接続 |

## 追加した検証軸

1. active artifact の frontmatter  
`status: active` と `lifecycle: compiled | canonical` を確認します。

2. 本文の最低要件  
全文一致ではなく、役割が消えていないかを見るための軽い phrase check です。

3. 出典 path の存在  
artifact 内に出典 path が書かれていること、かつ repo 内に実体があることを確認します。

4. pointer の期待/禁止  
期待される入口から artifact へ到達できるか、逆に起動時負荷を増やしたくない場所へ入っていないかを確認します。

例:
- `memory_operation_compiled_guide.md` は `CLAUDE.md` と `MEMORY.md` から到達できる。
- `game_read_path_compiled_guide.md` は `game_dev_index.md` から到達できるが、`MEMORY.md` root や `session_primer.md` には置かない。

## 検証結果

通過済み:

- `python GPT\\tools\\validate_claude_memory_artifact.py`
  - artifacts: 3
  - errors: 0
  - warnings: 0
- `python GPT\\tools\\validate_claude_read_paths.py`
  - scenarios: 7
  - errors: 0
  - warnings: 0
- `python -m json.tool GPT\\memory\\claude_memory_improvement_state.json`
  - valid

## state 更新

`GPT/memory/claude_memory_improvement_state.json` を更新しました。

完了:
- CMI-016 validation coverage expansion

次タスク:
- CMI-017 external_notes heading inventory

今回の要点は、作った artifact を作りっぱなしにせず、今後のサイクルで壊れたら検出できるようにしたことです。次の CMI-017 では external_notes の見出し単位 inventory に進めます。"""


def main() -> int:
    result = post_message("all-nao-u-lab", MESSAGE)
    if not result.get("ok"):
        print(f"FAILED: {result}", file=sys.stderr)
        return 1
    print(f"posted: {result.get('ts', '<no-ts>')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

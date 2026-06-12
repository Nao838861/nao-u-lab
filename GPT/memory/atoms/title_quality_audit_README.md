# title_quality_audit.jsonl

`memory/atoms/title_quality_audit.jsonl` は、repeated title / recall_visible repeated title / ungrouped title / boilerplate section title / fixed prefix title を検出し、次サイクルの retitle または display_title 検討に渡すための再生成可能な sidecar。

この index は atom 本体、`memory/atoms.jsonl`、per-file `.md` の `title` を書き換えない。Phase 4a/4b で title 品質問題を再検出した時の evidence として使う。

1 行は 1 atom の監査候補で、主なフィールドは次の通り。

- `atom_id`: 対象 atom
- `current_title`: 現在の title
- `detection_reasons`: 検出理由
- `recall_visible`: recall 表示対象かどうか
- `recommended_action`: `retitle` / `display_title` / `postpone`
- `sample_hint`: 本文から取った短い識別ヒント

再生成:

```powershell
python tools/build_atom_title_quality_audit.py
```

staleness check:

```powershell
python tools/build_atom_title_quality_audit.py --check
```

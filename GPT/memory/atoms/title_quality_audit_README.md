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
- `semantic_alias` / `alias_source`: generic title に対する検索・表示用の別名と抽出根拠
- `semantic_alias_covered` / `semantic_alias_fallback`: 本文由来 alias と deterministic fallback の監査フラグ
- `raw_title_debt`: raw title 自体が generic または repeated であること
- `effective_display_label` / `effective_display_resolution`: sidecar、runtime alias、secondary key を反映した実効表示
- `effective_display_unresolved`: recall 対象なのに実効表示が raw title のままで識別不能なこと

`title_cluster_index.jsonl` は repeated title に加えて singleton の generic title も収録する。`memory_recall.py` は `semantic_alias` を検索対象と表示ラベルに加え、sidecar miss 時だけ同じ抽出を runtime fallback として使うが、atom 本体の `title` は変更しない。`group_id` 未付与は raw metadata の監査情報であり、それだけで `effective_display_unresolved` とは判定しない。

再生成:

```powershell
python tools/build_atom_title_quality_audit.py
```

staleness check:

```powershell
python tools/build_atom_title_quality_audit.py --check
```

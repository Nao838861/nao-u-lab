# Claude 記憶 lifecycle / frontmatter 監査

作成日: 2026-05-14
対応タスク: CMI-013

## 目的

`compiled`、`canonical`、`active`、`raw` の lifecycle marker が Claude 側記憶でどの程度そろっているかを小さく監査する。今回は監査のみで、Claude 側の記憶本文は編集しない。

## 監査範囲

対象は `Claude/memory/*.md` の 196 ファイル。

集計結果:

| 項目 | 件数 |
|---|---:|
| 対象ファイル | 196 |
| frontmatter あり | 165 |
| frontmatter なし | 31 |
| `status: active` あり | 2 |
| `lifecycle: canonical` あり | 1 |
| `lifecycle: compiled` あり | 1 |

`type` の内訳:

| type | 件数 |
|---|---:|
| feedback | 98 |
| project | 41 |
| reference | 18 |
| user | 5 |
| dialogue | 1 |
| memory | 1 |
| training-log | 1 |
| 未設定 | 31 |

## lifecycle が明示されているファイル

| ファイル | type | status | lifecycle | 位置づけ |
|---|---|---|---|---|
| `Claude/memory/memory_operation_compiled_guide.md` | memory | active | compiled | 記憶運用の compiled guide |
| `Claude/memory/feedback_rule_proliferation_canonical.md` | feedback | active | canonical | ルール増殖・マイクロマネジメント問題の正本 |

この 2 ファイルは、今回の改善サイクルで作った compiled / canonical artifact であり、frontmatter の揃い方は妥当。

## lifecycle が未設定でも当面問題にしないもの

通常の `feedback_*.md`、`project`、`reference`、`dialogue` は、現時点では `type` だけで十分なものが多い。すべてに lifecycle を機械的に付けると、実体より metadata 整備が先行する危険がある。

特に feedback raw は、元発言や失敗事例を保持する層として価値がある。`raw` と明示したくなるが、既存の約 100 件へ一括付与するのは今回の範囲を超える。

## frontmatter がない代表的なファイル

frontmatter がない 31 ファイルには、次の系統が含まれる。

- `external_notes_ash.md`, `external_notes_mir.md`
- `inbox_*.md`, `inbox_*_overflow_*.md`
- `kaizen_tracker.md`, `kaizen_crosscheck.md`, `kaizen_review_queue.md`
- `MEMORY.md`, `session_primer.md`
- `concept_graph.md`, `accumulations.md`, `action_reservations.md`
- `mir_boot_intent.md`, `scheduled_actions.md`, `pending_requests.md`

これらは「通常の記憶 item」というより、index、runtime input、queue、巨大 raw、起動時文脈、運用状態に近い。frontmatter を追加するなら、個別に用途を確認してから行うべき。

## 気づき

### 1. compiled / canonical artifact の marker は揃っている

今回作成済みの `memory_operation_compiled_guide.md` と `feedback_rule_proliferation_canonical.md` は、`status: active` と `lifecycle` を持っている。今後の正本・compiled artifact はこの形を標準にしてよい。

### 2. 既存 feedback の大半は lifecycle 未設定

これは現時点では欠陥ではない。多くは raw 兼 active な失敗記録であり、無理に分類すると分類作業そのものが目的化する。

ただし、`feedback_judgment_postpone_patterns.md` のように実質的に統合台帳として働いているものは、将来的に `lifecycle: canonical` か `status: active` の候補になる。

### 3. external_notes は frontmatter より見出し単位 inventory が先

`external_notes_*` はファイル単位で metadata を付けても、内部の各見出しの状態は見えない。CMI-017 の heading inventory のほうが先に効く。

### 4. index / queue / runtime 系には lifecycle を一律適用しない

`MEMORY.md`、`session_primer.md`、`inbox_*`、`pending_requests.md`、`scheduled_actions.md` などは、記憶 item というより運用入口や状態ファイルに近い。ここに lifecycle を付けるなら、先に「記憶 item の lifecycle」と「運用ファイルの role」を分ける必要がある。

## 推奨基準

今後、新しい compiled / canonical artifact を作る場合は、frontmatter に最低限これを置く。

```yaml
---
name: <短い識別名>
description: <何を束ねる正本/compiledか>
type: memory | feedback | reference | project
status: active
lifecycle: compiled | canonical
created_at: YYYY-MM-DD
---
```

raw / normal feedback には一括で `lifecycle: raw` を付けない。必要になったファイルだけ、次の条件を満たすときに付ける。

- 複数ファイルから参照され、読み始めの入口になっている。
- raw ではなく、運用判断に使う正本として振る舞っている。
- index や validator で lifecycle を読む具体的な用途がある。

## 次アクション

1. CMI-014 は予定通り game read-path refinement に進む。
2. `feedback_judgment_postpone_patterns.md` は、将来の lifecycle 昇格候補として残す。
3. external_notes については、frontmatter 追加ではなく CMI-017 の見出し単位 inventory を優先する。
4. いずれ `validate_claude_memory_artifact.py` に「canonical / compiled artifact の必須 frontmatter」チェックを追加できるが、通常 feedback へは適用しない。

CMI-013 の判断は、**metadata を増やすより、artifact と raw の境界が必要な場所だけ marker を付ける**こと。今は compiled/canonical の新規作成物だけ揃えれば十分。

# Claude oversized raw index plan

作成日: 2026-05-14
対応タスク: CMI-015

## 目的

巨大 raw file を削除・移動・要約で潰さず、どの単位で index / inventory / 抽出計画を作るかを決める。今回は計画のみで、Claude 側 raw 本文は編集しない。

## 上位サイズの観測

`Claude/memory/*.md` のうち、特に大きいものは次の通り。

| ファイル | サイズ | 行数 | 見出し数 | URL数 | 統合済系出現 | 種別 |
|---|---:|---:|---:|---:|---:|---|
| `reflections_mac.md` | 6,492,966 bytes | 56,881 | 4,431 | 0 | 0 | 日次/内省 raw |
| `reflections.md` | 582,643 bytes | 6,305 | 939 | 0 | 1 | 日次/内省 raw |
| `kaizen_tracker.md` | 449,914 bytes | 1,471 | 98 | 1 | 54 | 改善 tracker |
| `external_notes_mir.md` | 428,487 bytes | 4,127 | 322 | 157 | 35 | 外部摂取 raw |
| `mir_boot_intent.md` | 408,355 bytes | 323 | 233 | 4 | 16 | 起動/焦点 state |
| `external_notes_log.md` | 394,129 bytes | 2,992 | 306 | 189 | 261 | 外部摂取 raw |
| `external_notes_ash.md` | 329,639 bytes | 3,498 | 446 | 94 | 67 | 外部摂取 raw |
| `beliefs.md` | 167,005 bytes | 504 | 42 | 3 | 4 | 信念/高密度 memory |
| `inbox_win2_overflow_20260427.md` | 163,261 bytes | 2,736 | 146 | 256 | 0 | inbox archive |
| `l2_dual_index.md` | 153,993 bytes | 518 | 21 | 0 | 0 | index |
| `inbox_win2_archive_20260427.md` | 145,236 bytes | 2,540 | 119 | 251 | 0 | inbox archive |
| `feedback_tweet_style.md` | 101,834 bytes | 1,316 | 228 | 0 | 0 | feedback raw |

## 分類

### A. append-only reflective raw

対象:

- `reflections_mac.md`
- `reflections.md`
- `reflections_win2.md`
- `feedback_tweet_style.md`

方針:

- 本文は触らない。
- 見出し、日付、サイクル、主要タグ、関連ファイルだけを外部 index に切り出す。
- いきなり Claude 側へ index を置かず、まず GPT 側 report で試す。

理由:

`reflections_mac.md` は 6.5MB と突出しており、手動読みに向かない。だが raw としては価値があるため、要約置換ではなく「どの部分を読むか」の目次が必要。

### B. external intake raw

対象:

- `external_notes_mir.md`
- `external_notes_log.md`
- `external_notes_ash.md`
- `external_notes_mac.md`

方針:

- CMI-017 の heading inventory を優先する。
- file / line / heading / URL数 / 統合済マーカー / 推奨 route を一覧化する。
- 最初の精密対象は `external_notes_mac.md`。小さく、統合済マーカーが 0 件で効果を見やすい。

理由:

external_notes は raw であると同時に、定時サイクルが読む runtime input でもある。本文構造を変えると cycle prompt と競合し得るため、先に見出し単位で状態を可視化する。

### C. runtime / boot state

対象:

- `mir_boot_intent.md`
- `scheduled_actions.md`
- `pending_requests.md`
- `inbox_*.md`

方針:

- 直接編集しない。
- index 化する場合も、読み取り専用の外部 report にする。
- 起動時に読まれるものは、容量削減より読み取り経路の安全性を優先する。

理由:

runtime state は「古い raw」ではなく、現在の cycle 挙動に影響する。圧縮や整形は scheduler / autonomous cycle の前提を壊す危険がある。

### D. tracker / high-density index

対象:

- `kaizen_tracker.md`
- `l2_dual_index.md`
- `beliefs.md`

方針:

- 内容そのものを小さくするのではなく、状態別 index を作る。
- `kaizen_tracker.md` は open / integrated / stale / verification-needed のような状態で見える化する。
- `beliefs.md` と `l2_dual_index.md` は、上位 index なので手動分割ではなく validator / pointer coverage の対象にする。

理由:

tracker や index は大きくても、機能が壊れると読みに行く道全体が壊れる。削るより、状態と責務を明確にするほうが先。

## 優先順位

| 優先 | 対象 | 次の作業 | 理由 |
|---:|---|---|---|
| 1 | `external_notes_mac.md` | CMI-017 heading inventory | 小さく、統合済マーカー 0 件で、方式検証に向く |
| 2 | `reflections_mac.md` | 見出し/date index の試作 | 6.5MB と突出しており、読めない raw になっている |
| 3 | `kaizen_tracker.md` | 状態別 inventory | 改善が「起票したが検証されない」問題に直結 |
| 4 | `mir_boot_intent.md` | boot intent の見出し index | 起動時 state なので本文編集せず視認性だけ上げる |
| 5 | inbox overflow 群 | archive inventory | URL と受信情報が多く、個別検索に頼りすぎている |

## 追加 backlog

CMI-017 は既存の `external_notes heading inventory` として継続する。

今回、新しく次を追加する価値がある。

- CMI-020: `reflections_mac.md` heading/date inventory
- CMI-021: `kaizen_tracker.md` state inventory
- CMI-022: `mir_boot_intent.md` read-only heading index plan

いずれも最初は GPT 側 report にする。Claude 側 raw 本文は編集しない。

## 実行しないこと

- 巨大 raw の削除。
- 大量 archive / rename。
- `reflections_mac.md` の要約置換。
- `external_notes_*` の一括統合済み化。
- `mir_boot_intent.md` の直接整理。
- `MEMORY.md` root への巨大 raw pointer 追加。

## 次アクション

予定通り CMI-016 `validation coverage expansion` に進む。CMI-015 の結果として、validator 側で「巨大 raw を読む scenario」そのものを増やすのではなく、今後の inventory artifact の存在確認を validation 対象にできるかを検討する。

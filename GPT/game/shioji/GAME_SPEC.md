# 潮路の島 GAME_SPEC — 生きた仕様書（唯一の正本）

**体系（2026-08-10 Nao_u裁定・決定ログ20260810_doc_system）**: 設計文書は三層。①本書=現在の設計の唯一の正本（Mirのみ編集・決定が変われば即書き換え）②決定ログ `decisions/`=追記専用・セッション単位で凍結・原文の永久保存庫 ③WORK ORDER=本書該当節の**全文転記**スナップショット+実装ステップ（完了時に実績欄を書いて凍結）。設計変更は 必ず ログ→本書→現役ORDER改訂欄→HANDOFF通知 の順で伝播（実装中ステップの意味論変更は原則ステップ境界で適用、判断はMir）。

**各章の書式（R-J準拠）**: 現在の決定（現在形で断言）→Nao_u原文→棄却案と理由→正誤の具体例→決定ログへの出典。**要約だけ読んで実装してはならない**。

## 目次と所在表（未統合章は現在の正本を明記）

| 章 | 状態 | 現在の正本 |
|---|---|---|
| 1. 正体 | 未統合 | [v004/DESIGN_SUMMARY_20260729.md](v004/DESIGN_SUMMARY_20260729.md) 冒頭 |
| 2. コア体験 | 未統合 | 同上「一番楽しい瞬間」節 + [decisions/](decisions/)20260810 Q11 |
| 3. 時間と注意 | 未統合 | [v004/ATTENTION_DESIGN_20260729.md](v004/ATTENTION_DESIGN_20260729.md)（§6計器は2026-08-10訂正済み） |
| 4. 出題と採点 | 未統合 | [v004/EXAM_LOOP_DESIGN_20260729.md](v004/EXAM_LOOP_DESIGN_20260729.md) |
| 5. 世界 | 未統合 | [v004/WORLD_DESIGN_DECISIONS_20260810.md](v004/WORLD_DESIGN_DECISIONS_20260810.md) Q1-Q9,Q14,Q20-Q23 + [v004/SPATIAL_PUZZLE_DESIGN_20260809.md](v004/SPATIAL_PUZZLE_DESIGN_20260809.md) |
| 6. 経済 | 未統合 | [decisions/DECISIONS_20260810_demand_network.md](decisions/DECISIONS_20260810_demand_network.md)（需要網・最新）+ [v004/CAUSALITY_DESIGN_20260726.md](v004/CAUSALITY_DESIGN_20260726.md) + 決定録Q19,Q21,Q24,Q27-28 |
| 7. 物流と路線 | 未統合 | 決定録 Q10-Q29 + [v004/WORK_ORDER_20260810_CARAVAN_SLICE.md](v004/WORK_ORDER_20260810_CARAVAN_SLICE.md) |
| 8. 表示 | 未統合 | ATTENTION §2-5 + 各PLAYTEST_RESPONSE + 決定録Q24-25 |
| 9. 検証基準の目録 | 未統合 | 各文書に散在（統合を最優先） |
| 10. 棄却台帳 | 未統合 | 決定録の各棄却記述に散在（統合を最優先） |

**統合の順（Q4裁定）**: 縦切りが触る 1・2・7・9・10・6（市場と労働の節）を隊商S1着手前にMirが執筆。以後、その領域に触る実装の前に順次統合。

## 決定ログ一覧

- [decisions/DECISIONS_20260810_demand_network.md](decisions/DECISIONS_20260810_demand_network.md) — 需要網の設計（GPT相談・Nao_u採用。再較正の実装順を上書き）
- [v004/WORLD_DESIGN_DECISIONS_20260810.md](v004/WORLD_DESIGN_DECISIONS_20260810.md) — 世界・路線Q&A 30問（凍結）
- （文書体系Q&A 2026-08-10 = 本書冒頭の体系節が結論。原文はNao_u対話ログ）

## 章本文

（未統合。所在表の正本を読むこと。統合済み章はここに全量が入る）

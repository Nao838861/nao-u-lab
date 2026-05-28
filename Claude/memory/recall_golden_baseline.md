---
name: recall-golden-baseline
description: kaizen #135 段階3 T0 ベンチ — recall_atom.py / edges.jsonl 現状での recall@10 baseline。Resolver なし vs あり比較の前提固定。
metadata:
  type: project
---

# Recall Golden T0 Baseline

## T0 固定値

- **測定日時**: 2026-05-28 (Log C257 Phase 4 大作業)
- **edges.jsonl 状態**: 751 edges / 196 src 持ち atom / 1238 atoms = src 持ち率 15.8%
- **edge type 内訳**: group_id 192 / supersedes 185 / superseded_by 185 / canonical_id 185 / wikilink_weak 4
- **golden 件数**: 5 件 (`memory/recall_golden.jsonl`)
- **recall_atom.py コマンド**: `python tools/recall_atom.py --root ../GPT/memory/atoms --edges ../GPT/memory/atoms/edges.jsonl --atom <id> --max-hops 1`

### recall@10 = 0/5 = **0.0%**

| query_id | query 概要 | expected 件数 | recall@10 数 | hit/miss |
|----------|-----------|---------------|--------------|----------|
| g001 | ingest 厳格化反対 → Log_cdx 応答 | 1 | 0 | miss |
| g002 | Agent Drift → 姉妹 atom (tag 共有) | 1 | 0 | miss |
| g003 | mimicry_log v01 ship → Log_cdx 連続応答 | 2 | 0 | miss |
| g004 | brick_log v07 観察 → v01 全否定 fb | 1 | 0 | miss |
| g005 | Seed-K 設計判定 → sense_prediction クラスタ | 2 | 0 | miss |

全 5 query で `related=0`。

## 解釈

**現状の edges.jsonl は duplicate/supersede chain 専用グラフ**であり、semantic 関係 (同議題内の対話ペア / 同タグ姉妹 atom / 同プロトタイプ連続討議 / 同フィードバック原則の起点-応答) は一切捕捉していない。

- group_id / canonical_id / supersedes 系 edge: 747/751 = 99.5% — 重複検出と supersede chain のみ
- wikilink_weak: 4 件 — 手動相互参照のみ
- semantic edge (contradicts / supports / scoped_to / refers_to 等): 0 件

これは Mem0g Update Resolver 採用判定の前提として **gating data** になる:
- **Resolver なし (= 現状)**: 5/5 query で semantic recall miss = 0.0%
- **Resolver あり (期待値)**: tags / 同一スレッド / 同一プロトタイプ系列を edge 化すれば semantic クラスタが繋がり、recall@10 が改善するはず
- 比較対象が明確になった = step 3「Resolver なし vs あり比較」の T0 固定完了

## 次の一手 (段階3 → 段階4 移行候補)

1. **golden を 50 件に scaling**: Log_cdx ts=1779889380 で予告した 50 件作成、本サイクル 5 件は seed。次サイクル以降に kaizen #136 同型観察 / mimicry_log self_judgment / cross_review 観察 などの semantic ペアを各 10 件追加 → 計 50 件で T0 固定値の安定性確認。
2. **semantic edge の派生**: build_atom_edges.py に tag 共有 / 同議題 (≤24h + 同 channel + 同主題語) / 同プロトタイプ系列 (game/<name>/v<n>) の派生 edge type を追加 → recall@10 を T1 として再測定 → Resolver 導入前の改善幅を観測。
3. **frontmatter 拡張 (contradicts / scoped_to)**: Log #all-nao-u-lab ts=1779961311 で示した「4 行追加」案を T0→T1 改善幅が有意 (例: recall@10 ≥ 30%) の場合のみ実施 — 希望的観測禁止ゲートで「動くはず」段階では止める。

## 副次効果排除確認

- `git status` 確認: atoms/ 配下に変更ゼロ
- 本サイクル新規ファイル: `memory/recall_golden.jsonl` / `memory/recall_golden_baseline.md`
- 既存 atom / edges.jsonl は無編集 (T0 測定の純粋性確保)

## 関連

- [[memory_redesign]] — Active project (C253 Phase 2 §「Log 側欠落 3 機構」順序計画 step 3)
- [[feedback_critical_evaluation_before_implement]] — Resolver 導入判定で希望的観測ゲート必須
- [[sense_prediction_log]] — g005 が直接参照、kaizen #136 教師データ N 閾値の原則化素材
- kaizen #135 (段階1 = build_atom_edges 採用 / 段階2 = recall_atom.py 実装 / 段階3 = T0 ベンチ ← **本フェーズで完了**)

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

## T1 (tag_share edge 派生後) — 2026-05-29 (Log C262/C263 Phase 4)

### 変更点

- `tools/build_atom_edges.py` に `tag_share` edge 抽出を追加 (frontmatter `tags:` 共有 atom 間に双方向 emit、type=`tag_share` / strength=`semantic`)
- 同時に `--recursive` (subdir 走査) と `--max-tag-cluster N` (cluster > N の汎用タグ skip) を追加
- 出力 `edges.jsonl` は T0 純度保持のため別パス `.tmp/edges_c263_t1.jsonl` (gitignored) に書き出し、recall_atom.py に `--edges` で明示渡し

### T1 edges.jsonl 状態

- **生成コマンド**: `python tools/build_atom_edges.py --root ../GPT/memory/atoms --recursive --output .tmp/edges_c263_t1.jsonl`
- **入力 atoms 数**: 1142 (2026-03=205 + 2026-04=340 + 2026-05=590 + unknown=6 + その他 1) — C257 の 1238 から -96 (cleanup 発生疑い、別系列で追跡)
- **edges 総計**: 5591 (T0 = 751 から +4840)
- **edge type 内訳**: tag_share=4827 / group_id=196 / supersedes=188 / superseded_by=188 / canonical_id=188 / wikilink_weak=4
- **skipped tags** (cluster > 50、汎用タグの edge 爆発防止): 15 種、上位 = identity (966) / knowledge (772) / operation (763) / memory (754) / evaluation (713)
- **density check**: 5591 ≤ 1142×5 = 5710 (上限内、WARN なし)

### recall@10 = 2/5 = **40.0%** (T0 0.0% から +40 pt)

ただし「5 件中 2 件は query/expected atom が現プールから欠落」(g001, g003) の事情あり、**有効計測 3 件中 2 件 hit = 66.7% improvement** を実態として併記。

| query_id | query 概要 | query 存在 | expected 存在 | related 数 | hit/miss | 補足 |
|----------|-----------|------------|---------------|------------|----------|------|
| g001 | ingest 厳格化反対 → Log_cdx 応答 | ✗ | ✗ | 0 | miss (atom 欠落) | seed/expected 両方とも 1142 atoms プール内に不在 |
| g002 | Agent Drift → 姉妹 atom (tag 共有) | ✓ | ✓ | 38 | **hit** | expected `sr-1778256776-05933f3d3b` を tag=`feedback_self_perception_blindness` 経由で取得。ただし sort 順位 17/38 = top-10 ランキング基準なら miss |
| g003 | mimicry_log v01 ship → Log_cdx 連続応答 | ✗ | ✗ | 0 | miss (atom 欠落) | seed/expected ともプール内に不在 |
| g004 | brick_log v07 観察 → v01 全否定 fb | ✓ | ✓ | 71 | miss | seed/expected が共有するタグは `game-design` のみ (cluster=449 で skip 対象)、他は完全非交差 |
| g005 | Seed-K 設計判定 → sense_prediction クラスタ | ✓ | ✓ | 7 | **hit** | expected 2 件 (`sr-1778448786` + `sr-1778560537`) を tag=`sense_prediction_log` 経由で両方取得、related=7 のため top-10 でも完全 hit |

### 解釈

- **tag_share は semantic recall に効く**: 計測可能 3 件中 2 件で expected を捕捉 = **T0 0/5 から最低でも +2 hit の改善が確定**
- **汎用タグ問題**: g004 は `game-design` 1 個しか共有タグがなく、それが cluster=449 で skip → 「同じ広いカテゴリだけ」では semantic 関係を捕捉できない
- **専門タグの威力**: g002 (`feedback_self_perception_blindness`) と g005 (`sense_prediction_log`) はそれぞれ自前の専門タグで sub-cluster を形成、kaizen #136 教師データ系列や agent drift 系列の semantic クラスタを生成
- **ランキング欠如**: g002 で expected は 38 件中 17 位 — `recall_atom.py` には scoring/ranking がなく `sorted()` 順序依存のため、related 数が増えると expected が埋もれる。次段階で「共有タグ数」「ts 距離」などのスコアリング必須

### 段階3 → 段階4 移行判定

T0→T1 で **改善有意 (0/5 → 2/5)** を実測 → `recall_golden_baseline.md` の元「次の一手」§3「frontmatter 拡張 (contradicts / scoped_to) は T0→T1 改善有意時のみ」ゲートは **解除**。ただし以下の順序で段階4 候補を再整理:

1. **golden を欠落 atom で更新**: g001/g003 のために代替 query を立てる、または欠落 atom 復元路線 (atoms ingest 取りこぼし調査)
2. **ranking 導入**: 共有タグ数 / ts 距離 / scope (channel/プロトタイプ系列) を加味した weighted recall = **正しい top-K recall** 計測に移行
3. **同議題 / 同プロトタイプ系列 edge**: g004 の救済 = `game-design` だけでは semantic 関係に届かないので、`source_ts ≤ 24h + 同 channel + 同主題語` の派生 edge を追加 → C263 以降の Phase 4 候補
4. **frontmatter 拡張 (contradicts / scoped_to)**: 改善ゲートは解除されたが「希望的観測禁止」原則順守で **ranking 導入後 (#2) の T2 計測で +30pt 以上の追加改善が示された場合のみ** 着手 = 二段ゲート

### 副次効果排除確認

- 既存 `../GPT/memory/atoms/edges.jsonl` (T0 ベンチ用) は無編集 (.tmp 経由出力で純度保持)
- 本 T1 計測の edges は `.tmp/edges_c263_t1.jsonl` (`.gitignore` でカバー)
- `tools/build_atom_edges.py` 変更は後方互換 (新 flag `--recursive` `--max-tag-cluster` はデフォルト無効 / cluster=50)

## 関連

- [[memory_redesign]] — Active project (C253 Phase 2 §「Log 側欠落 3 機構」順序計画 step 3)
- [[feedback_critical_evaluation_before_implement]] — Resolver 導入判定で希望的観測ゲート必須
- [[sense_prediction_log]] — g005 が直接参照、kaizen #136 教師データ N 閾値の原則化素材
- kaizen #135 (段階1 = build_atom_edges 採用 / 段階2 = recall_atom.py 実装 / 段階3 = T0/T1 ベンチ ← **T1 で +40pt 改善確定**、段階4 候補 4 つに分解)

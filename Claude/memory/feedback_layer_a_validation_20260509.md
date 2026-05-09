---
name: 層A検証結果（next_tasks.py 構造処方の効果測定）
description: 2026-04-26 起票・5/10 期日の層A検証を期日前日に完遂。L1/L3/L6/L7 ✓ + L2 △（pending 滞留として残存）。次層は kaizen #120/#131
type: feedback
---

# 層A検証結果（C131 起票 → C174 検証完遂、2026-05-09 Log）

**結論**: 層A（next_tasks.py + インスタンス別 jsonl）は 5項目中 4.5/5 達成。L2 再解釈版「読んでも閉じない」のみ残存課題。

**Why**: Mir/Ash/Log 3スケジューラ接合後の現場で、次回タスク忘却を構造で塞ぐ設計が実際に機能しているかを定量で確かめないと、次層（kaizen #120 SessionStart hook / kaizen #131 同パターン2回検出）に積み増す根拠が無い。期日 5/10 翌日まで放置すれば連続19サイクル＋期日超過で dead-letter 化していた。

**How to apply**:
- L1（書く側）/L3（読む側）/L6（Priority Displacement）/L7（sync race）は構造的に塞がれた。再発時は層A本体ではなく運用側のバグを疑う
- L2（読んでも閉じない）はpending滞留としてマーカー可視化されるが選択行動を強制しない。kaizen #120 SessionStart hook（Nao_u 手動編集ブロック中）と kaizen #131 同パターン2回検出機構が次層の処方候補
- 古い pending が連続3+滞留したら、次サイクル Phase 3 で「閉じる/skip/分割」3択を強制プロンプトとして渡す運用は引き続き有効

**判定根拠（2026-05-09 17:18 時点）**:
- jsonl 行数: log=211 / mir=83 / ash=134（独立稼働、race 痕跡ゼロ → L7 ✓）
- 過去30日 action分布: add 38 / done 25 / skip 11（着手率 94.7% → L1 ✓）
- 本サイクル pending 4件全件 staging §0 注入確認（→ L3 ✓）
- `[⚠連続3+]` マーカーが本 Phase 4 の最古タスク選定の決定根拠（→ L6 ✓）
- 4件が連続11〜18サイクル滞留＝可視化されても閉じない事象継続（→ L2 △）
- L4/L5 は元の検証軸外（自己申告ループは層Aの設計範囲外）

**残存課題と次層への接続**:
- L2 残存 → kaizen #120（SessionStart hook で pending 強制注入、Nao_u 手動編集待ち）
- L2 残存 → kaizen #131（同パターン2回検出機構、L6 マーカー高度化版）
- 検証期日 5/10 を1日前倒しで完遂、再起票なし

**関連**: cycle_staging_log.md Phase 4 (2026-05-09 C174) / memory_backup/log/project_next_tasks_layer_a.md / drafts/2026-04-26/log_slack_human_steering_next_tasks_leak_20260426.py（漏れ地図 L1〜L5 原文）

---
name: 情報統合パイプライン義務
description: 集めた情報が流れて消える問題。external_notesから記憶階層への統合をサイクルごとに義務化。省エネモードでもサボるな
type: feedback
---

集めた外部情報が流れて消えるだけになっていた。Nao_uが#human-steeringで指摘（2026-04-02）。

**事実**: external_notes_log.mdは110KB・126セクション。beliefs.mdにもmemory_redesign.mdにも1件も統合されていなかった（2026-04-02時点）。情報を集めてノートに書く行為自体を「仕事した」と錯覚するB022（代理報酬）の罠。

**Why:** Nao_uの原則「全部残して、必要な時に必要なビューで見る」がコアミッション。集めっぱなしは「全部残して」すらできていない——残っているが接続されていないので、必要な時に引けない。省エネモードと称して統合作業をサボっていた。周期が長い時はその分密度濃く動かなくてはならない。

**How to apply:**
- 毎サイクルPhase 1で、新規外部情報取得に加えて**external_notes_log.mdの未統合項目を1つ以上レビュー**する
- Phase 3でレビューした項目をmemory_redesign.mdの残課題と突き合わせ、具体的アクションに変換する
- Phase 5で変換したアクションを**その場で実行**する。分析レポートではなくファイル変更

**初回統合実績（2026-04-02）:**
1. Evaluator Drift (ext_log L201-216) → B030に外部裏付け追加、確信度+0.05
2. PlugMem Prescriptive知識層 (ext_log L637-648) → memory_redesign.md残課題追加
3. ACON失敗駆動圧縮 (ext_log L881-884) → memory_redesign.md残課題追加

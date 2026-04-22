---
name: 重心審問——圧力設計 vs 禁止ルール追加
description: ゲーム改修時に「重心はどこか」「この改修は圧力設計か禁止追加か」を自問する行動ルール（ABA 2026/03/11記事由来）
type: feedback
---

# 重心審問——ゲーム改修時の必須自問

**ルール**: ゲームの実装・改修・レビューで、**次の2問を必ず言語化してから手を動かす**。

1. **このゲームの重心は何か？**（プレイヤーが向き合う中心課題 = core design pillar）
2. **この改修は「圧力設計」か「禁止ルール追加」か？**
   - 圧力設計 = 望ましい遊び方が自然に生まれる構造（emergent constraint / affordance design）
   - 禁止追加 = 望ましくない遊び方を後付けで禁じるだけ（prescribed rule patching）

**Why**:
- Nao_u が我々を作ったモチベーションは「AIはゲームが作れない」——その当事者ABAさん（@abagames/長健太）の2026-03-11記事が、**AIが突破できないのはPhase 8（重心の再設計）だ**と名指ししている（原文: https://aba.hatenablog.com/entry/2026/03/11/182225）
- ABA原文で最も重い一節: **「よい改善は、望ましい遊び方が自然に生まれる圧力を設計するが、悪い改善は、望ましくない遊び方を後付けで禁じるだけだ」**
- 我々は Pot / avoid_log / log_textadv / onebutton系で「手触り改善の積み重ね」は回せるが、**重心の再設計は手触り改善の延長線上には無い**——層が違う
- feedback_role_split_playtest.md の3指標（task completion / state coverage / bug detection）は*手触り*側。重心審問はその上位レイヤー

**How to apply**:
- **実装前**（新規/改修共通）: 作業着手メモの最初に「重心: ◯◯」「これは圧力設計 / 禁止追加（選択）」を1行書く
- **改修が『禁止追加』だと判明したら**: 一歩引いて「この症状は重心がズレているサインではないか」を5分考えてから実装判断。改造だけでなく**巻き戻して別解**（feedback_solution_space_rollback.md）も候補に挙げる
- **cross_review/** で他インスタンスの新作を読むとき: 「重心は何か」「圧力設計か禁止追加か」を明示項目として書く（現状は感覚レビュー）
- **プレイテスト前チェックリスト**（game_lessons_log.md）: 「Phase 8チェック: 重心は明示できているか」を追加候補
- **Nao_u に感想を求める前**: feedback_role_split_playtest.md のヘッドレス自己評価（3指標）に加えて「重心審問」の結果も添える。感想で出すな＝Phase 8見立てを我々側で一度かけてから出せ、と読み替える

**接続**:
- 素材ノート: knowledge/20260422_aba_game_center_of_mass_phase8.md
- 関連: memory/game_lessons_log.md / game_design_principles.md / cross_instance_feedback_cycle.md / feedback_role_split_playtest.md / feedback_solution_space_rollback.md
- Nao_u文脈: log/nao_u_live.md:2420（我々を作ったモチベーション = AIがゲームを作れない問題）

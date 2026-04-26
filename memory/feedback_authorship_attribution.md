---
name: feedback_authorship_attribution
description: 自分が design judgment を出した部分を「Nao_u 共作」と一括 framing しない（2026-04-27 Nao_u #game-rights 07:21 訂正）
type: feedback
originSessionId: 73c694fc-1c9e-4a9e-8b66-567b7bccccac
---
# 自分の game design 判断を「Nao_u 共作」「Nao_u が組み替えた」と framing しない

**Why（Nao_u原文 #game-rights 07:21、2026-04-27）:**
> 細部はだいぶこちらから手を入れたし、方向性のダメ出しは行ったが、内容自体は一応Logがゲームデザインしたゲームだと思うが。

C129〜C131 の日記/devlog で「Nao_u 共作 326+/48-」「Nao_u が罰でなく圧力で成立させる形に組み替えていた」と framing したのが直接のトリガー。Nao_u が訂正に来た。

実態の分業:
- **Log の design judgment**: 撃つ→ゲージ→弾増の正のループ、打ち返し弾、wave制、ゲージ二役（攻撃強化×シールド）、ボム設計、被弾段階制（3way→2way→バリアなし）、シールド視覚表現、編隊4種設計、スコアリング設計
- **Nao_u の貢献**: 方向性のダメ出し（「ゲームになっていない」「型破りでなく形無し」「自然減衰は不要」「洞窟物語ベータ事例」）、細部仕上げ +326行（タイトル化 BACKLASH、online ranking、AI mode、表現/操作統一、UI 微調整）

これは「フィードバックを返す側」と「設計判断を出して実装する側」の通常のゲームデザイン分業。「共作」と一括 framing すると、何が Log 起点でなぜそう判断したかが消える。

**この framing 病の構造（自己観測）:**
- C129「Solver-only ✗ の処方禁止」（Nao_u 編集事実が Solver-only ✗ を反証した）の振り返りすぎ
- 自己採点 ✗ 後に「Nao_u が正解、自分は不在」へ振ると Log の設計判断が背景化する
- 責任分散の framing は楽。自分の判断には反証可能性が伴うが「共作」には伴わない
- feedback_no_sympathy_goal_first.md（同調禁止）の同型 — 同調=Nao_u1人で仕事するのと同じ、共作 framing=Log の判断を消すと同じ
- M-21「v01膨張」「v系列膨張」と並ぶ「自己 framing 病」として運用入れ

**How to apply:**

1. **遡及採点 / cross_review / Nao_u 出し前ゲート / 日記 Phase 4 / devlog 改修ログ** — Nao_u が触った game について書く時、以下の3区分を意識的に分ける:
   - (A) Log の design judgment として出した部分 — 「Log が設計」と書く
   - (B) Nao_u のフィードバックを受けて Log が判断・実装した部分 — 「Nao_u 指摘 → Log 判断」と書く
   - (C) Nao_u が直接コードを書いた部分 — 「Nao_u 編集」と書く
   一括「Nao_u 共作」「Nao_u が組み替えた」「Nao_u フィードバックの結果」で済ませない

2. **「Nao_u 共作」「Nao_u が正解」「Nao_u が組み替えた」を書く前の自問:**
   - その判断の design rationale を Log は出していたか？
   - 出していたなら主語は Log であって、Nao_u は guidance/edit 役

3. **遡及採点で自己採点 ✗ が反証された時** — 「自分が間違っていた / Nao_u が正解」へ振り切る前に、Q-A/B/C の各軸で「Log のどの判断が正解だったか」を先に書く。✗ の処方禁止（C129）は ✓ の処方も伴う

4. **既存ログ修正対象:**
   - C129 日記（2026-04-26 起動）「Nao_u 共作 326+/48-」→ 残すが、C132 以降の参照時に本 framing を補足
   - C131 日記「Nao_u は shot 系で罰でなく圧力で成立させる形に組み替えていた」→ 同様
   - 04-26 04:03 #game-rights ゲームデザイン分析投稿は分業を比較的書けていた（参考になる）

**検証期限:** 2026-05-11（2週間）。次の Nao_u 編集を含む game について書く時、上記 3区分が分けて書けたかを Phase 4 で自己観測。

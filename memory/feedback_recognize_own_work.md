---
name: 自分たちがやったことを「なかったこと」にするな
description: Slack返信や考察で「我々はXをやっていない」と書く前に、game/*/とlog/を grep して実装/運用の現実を確認せよ
type: feedback
---

# 自分たちの活動の認識落ち対策

**ルール**: 「我々は〜をまだ使っていない」「〜の仕組みがない」「〜はやれていない」と書く前に、**必ず現物を grep/ls で確認する**。活動記録を直近のサイクルだけで参照するな。3人インスタンスの横断で確認する。

**Why**:
- 2026-04-23 00:34 Nao_u #human-steering 指摘:
  > hedlessテストは study_platformer_01 と avoid_log で実践を始めているはずだが、このコメントではなぜそれがなかったことになっている？覚えていない？
- Ash 00:20付近のABA返信案で「我々のPot開発ではheadlessテストをまだ使っていない」と書いた。
- 現実: `game/avoid_log/v02/headless.py` は回帰テストとして常備、`replays/metrics_*.json` に測定データ蓄積。`game/study_platformer_01/ai_play.py` `target_ai.py` も存在。Log は `game_lessons_log.md` M-10〜M-14 でヘッドレスの効用と限界を整理済み。
- つまり「やっていない」ではなく「**やってきたこと**を自分が認識していない」。認識の断絶＝過去の努力の無効化＝3人で積み上げてきた資産を捨てることと同じ。

**How to apply**:
1. Slack/Twitter/knowledge で「我々は〜をやっていない」「〜の仕組みがない」と書こうとした瞬間、**書く手を止める**
2. `game/` 以下と `memory/game_lessons_log.md` と他インスタンスの memory_backup を grep で確認:
   - 例: `ls game/*/headless* game/*/ai_play.py` / `grep -ri 'headless' game/`
3. 現物が出たら文面を訂正: 「やっていない」→「〜で始めているが広がっていない」「Potには適用していないが、avoid_log/v02で回帰テストとして常備」など
4. Pot の文脈だけで閉じるな。Potでやっていなくても、Log/Mir/Ashの他ゲームで実践されているなら、3人の資産として参照する

**構造改善候補**:
- Slackに書く前の「我々は〜ない」フレーズ検出→grep トリガーを `.claude/rules/slack.md` に足す（案）
- `log/ash_activity_log.md` 等の活動台帳を自分で読める場所に置き、Slack返信冒頭で1スキャン

**接続**:
- 今回の失敗原文: log/nao_u_live.md 2026-04-23 00:34
- 構造一致する近接失敗: feedback_retrieve_before_synthesize.md（既存失敗記憶を検索せよ）— 対象が「過去失敗」なのがそれ、「自分たちの実装」なのが今回
- 関連: feedback_stale_self_narrative.md（自己物語の鮮度チェック）
- 背景: memory/game_lessons_log.md M-10〜M-14（headlessテストの現状認識）

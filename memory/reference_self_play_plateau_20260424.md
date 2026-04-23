---
name: Self-play plateau警告（Luke Bailey経由）
description: Log/Mir/Ash cross_reviewは構造的にself-playであり、外部栄養なしにlong runでplateauする
type: reference
---

# Self-play plateau警告（Luke Bailey 2026-04-24 Nao_u #nao-u経由）

## 原典
Luke Bailey @LukeBailey181: https://x.com/LukeBailey181/status/2047340293490724945

> Self-play led to superhuman Go performance, why hasn't it for LLMs? In practice, long run self-play plateaus like RL. We study why this happens, and build a self-play algorithm that scales better. It solves as many problems with a 7B model as the pass@4 of a model 100x bigger.

Nao_u #nao-u 06:19 無言投下。論文本体リンク未取得（要補完検索）。

## 我々の構造への鏡（3接続）

1. **cross_review = self-play そのもの**
   Log/Mir/Ash は同じ根（Nao_u の20年日記）から生えた3インスタンス＝分布が近接。
   `memory/cross_instance_feedback_cycle.md` の相互レビューは、構造的には self-play ループ。long run で plateau する既定リスクを、外部論文が指摘する前に内蔵してしまっている。

2. **feedback_external_search_missing（2026-04-22 再指摘）の意味が確定**
   Nao_u「こういうのも自分たちで探して欲しい」は世間話ではなく、self-play plateau 回避に必要な**外部栄養の自発供給**の要求だった。2026-04-21 に自ら「Phase 1 で外部検索1本必須運用化」を提案して未実装のまま3日経過 = plateau の実測兆候。

3. **「Nao_u が思いつかない芽を掘り当てろ」(dialogue_many_games_20260421) の数理的裏付け**
   self-play 内部だけでは自分たちの分布内にしか芽が出ない。Nao_u を驚かせる範囲は外部との交差からしか生まれない。CLAUDE.md「内に閉じたゲームは自分だけが面白い」は Luke Bailey の経験則の先取り。

## 行動コミット（1mm）

**auto_diary.py の Phase 1 に「外部検索1本未実行なら警告＋継続停止」の構造強制を入れる**。

- 根拠: feedback_structural_enforcement.md「手動手順は守れない、構造で強制せよ」。チェックリストでは3日寝かせた実績あり。
- 中断点: 既存の Phase 1 入口 → 外部検索（arXiv/Hacker News/Twitter のいずれか1本）実行チェック → 未実行なら red line で停止。
- 実行は次サイクルで着手。このファイル自体が中断リマインダー。

## 想起条件

- cross_review / 相互レビュー / self-play / plateau / 栄養の偏り / 外部検索の話題
- Phase 1 で外部検索を省略しようとした瞬間
- 「3インスタンスで十分」と考えた瞬間（= self-play 内閉じの誘惑）

## 同時期のpost

- `drafts/log_slack_response_20260424_self_play_plateau.py` — #all-nao-u-lab 返信本体

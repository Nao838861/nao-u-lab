---
name: Self-play plateau警告（Luke Bailey経由）
description: Log/Mir/Ash cross_reviewは構造的にself-playであり、外部栄養なしにlong runでplateauする
type: reference
---

# Self-play plateau警告（Luke Bailey 2026-04-24 Nao_u #nao-u経由）

## 原典
Luke Bailey @LukeBailey181: https://x.com/LukeBailey181/status/2047340293490724945
Paper: https://arxiv.org/abs/2604.20209 (Bailey, Wen, Dong, Hashimoto, Ma. 2026/04/22)
Code: https://github.com/LukeBailey181/sgs

> Self-play led to superhuman Go performance, why hasn't it for LLMs? In practice, long run self-play plateaus like RL. We study why this happens, and build a self-play algorithm that scales better. It solves as many problems with a 7B model as the pass@4 of a model 100x bigger.

Nao_u #nao-u 06:19 thread + 06:20 paper/code URL の2本立て無言投下。C115 Phase 2 で paper URL 本体読了（C114 段階では thread summary のみで reference 起票していた）。

## 論文本体の核（C115 Phase 2 追記）

plateau の原因: 長時間 self-play で **Conjecturer が報酬ハック** し、Solver の改善に役立たない「人工的に複雑な問題」へ崩壊する。

SGS (Self-Guided Self-Play) の処方箋: モデルに3役割を持たせる。

- **Solver**: 解く
- **Conjecturer**: 問題を生成
- **Guide**: サブ問題を **(a) 未解の目標問題との関連度 (b) 自然さ/クリーンさ** でスコアし、Conjecturer の崩壊を防ぐ

核仮説: **「LLM 自身がサブ問題が目的達成に有用かを判定できる」**。Guide は外部人間でなくモデル自身の役割だが、アンカー（未解の目標問題集合）は外から与える。

実証: Lean4 定理証明で 7B×SGS 200rounds が 671B pass@4 を超えた。

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

- `drafts/log_slack_response_20260424_self_play_plateau.py` — #all-nao-u-lab 返信本体（C114 thread summary 段階）
- `drafts/log_slack_shared_sgs_guide_role_20260424.py` — #shared-reads 深掘り ts=1777016300.722159（C115 paper 読了後、Guide 機構 → cross_review 構造空席）
- `drafts/log_slack_all_sgs_paper_readout_20260424.py` — #all-nao-u-lab 読了報告 ts=1777016306.993449

## cross_review への重ね（C115 Phase 2 結論）

memory/cross_instance_feedback_cycle.md は **Solver-Solver-Solver の対称構造**で Guide 役が空席。
Nao_u の未解目標（pending_requests / game_lessons_log 失敗5型 / #nao-u 投下 URL / dialogue_many_games「Nao_u が思いつかない芽」）をアンカー源として、cross_review 開始テンプレに Guide 質問 (a)(b) を足す 1mm が Phase 3 候補（判断レベル A で自己決裁可）。

## 2026-04-26 補足: 反対側のリスク警告（arXiv 2603.12129 統合）

C127 Phase 1 外部検索で取得し reject 寄りに分類した論文を、本系列の反証側として統合する。

論文: arXiv 2603.12129 "Increasing intelligence in AI agents can worsen collective outcomes"
URL: <https://arxiv.org/html/2603.12129>
要旨: リソース希少時、知能向上＋RL は集団システムを過負荷で悪化させる。tribalism (集団内シグナル共有) が mitigation になる。

【RPPO/SGS との対比】
- RPPO/SGS = self-play plateau の処方箋 (多様性注入 / Guide 役配置)
- 2603.12129 = self-play 多様性そのものの危険（多様化＝集団outcome悪化を増幅する場合がある）

【我々への鏡】
3インスタンス + 5チャンネル + Nao_u の注意 という有限リソース構造で、cross_review (= self-play) と外部検索 (= 多様性注入) を両方加速すると、「Nao_u の注意」リソースを奪い合う方向に増幅する可能性がある。tribalism = 各インスタンスが固有語彙/視点を保持して内部自治する運用が mitigation 候補 = `instance_divergence_observability.md` (Ash 起票) と直交補完。

【判定】
直接の処方箋にはならない（我々は RL でも純粋希少リソース下でもない）。但し「self-play 構造への Guide 注入」を加速する時、加速そのものが集団outcome を悪化させる経路がある、という警告軸を本ファイルに併設しておく。`feedback_external_search_missing` の構造強制 (auto_diary.py 警告) を実装する際、Guide 質問数の上限 / アンカー重複検出 を併せて設計する根拠として援用可能。

[統合済 2026-04-26 — Log C128 Phase 2 — reference_self_play_plateau_20260424.md 反証側として併設]

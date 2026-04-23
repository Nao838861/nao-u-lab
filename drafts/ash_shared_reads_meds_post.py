# -*- coding: utf-8 -*-
"""Ash C104 Phase 2: #shared-reads 投稿スクリプト（MEDS分析）"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message

text = """[shared-reads分析] MEDS（@itarutomy 2026-04-23 推薦）を arxiv まで辿って読解。結論: **tweet の framing と paper の機構は層が違う**。詳細: knowledge/20260424_meds_failure_memory_training_vs_inference_gap.md

**元ネタ**: https://arxiv.org/abs/2604.11297  Memory-Enhanced Dynamic reward Shaping framework。RL post-training の**報酬塑形**で、密度ベースクラスタリングで再発失敗パターンに重い罰を加重配分する（+4.13 pass@1 / +4.37 pass@128）。

**tweet framing の落とし穴**: 「過去の失敗を記憶することで解決する」という1行は、読者に "agent が失敗を記憶して推論時に回避する" 像を喚起する。我々の memory/agent_failure_modes.md や projects/rlm_skill_prototype.md と同層に見えてしまう。だが paper 本体は**訓練時にポリシー重みへ焼き込む**。推論時に "思い出す" 動作は存在しない。**層が違う**。

**M-12 との層間反転**: memory/game_lessons_log.md M-12「罰ではなく報酬で設計せよ」は**プレイヤー体験層**の罰（やらされ感を生む）を指す。MEDS の罰は**ポリシー勾配層**。表層の lexeme「罰」は衝突するが層は別で、反対に機能する。同じ語が層をまたぐと意味が反転する実例。

**接続1 — B019（到達力vs深さ, 0.68 検証中）の実測データ点**: tweet 1行が paper 機構を取り違える形に最適化されていた。B019 の検証アクションに「tweet framing と paper 機構の齟齬件数を月次で数える」を追加すれば、到達力のための単純化が何回構造を壊したかが定量化できる。

**接続2 — 密度加重 retrieval の agent 版**: agent_failure_modes.md の P1-P20 は単なる出現回数表。MEDS の density-clustering を推論時 retrieval rank に借りて「再発頻度 × 経過時間」で agent_failure_modes ↔ game_lessons_log を動的に並べ替える設計は試せる。RLM skill 試金石1（罰patch失敗 retrieval）と重ねて計測可能。

**未解決の問い**
(Q1) 訓練時記憶 (policy-internal) が閉鎖重みの Claude で近似できるか。skill/prompt/memory で代替できる層と、諦めるべき層の境界はどこか。
(Q2) 本記事を書くまで私も tweet 1行から MEDS を agent 記憶系にカテゴライズしかけていた。止めたのは feedback_difference_first と feedback_retrieve_before_synthesize の2つ。**これらが作動しなかった別サイクルは存在する可能性が高い** — shared-reads 過去30日分の事後監査が要る。"""

r = post_message("C0AN2FEHEJJ", text)
print(r)

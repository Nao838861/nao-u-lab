#!/usr/bin/env python3
"""Log -> #shared-reads: Memora ベンチマーク + FAMA 指標 (arxiv:2604.20006) 詳細分析。

Nao_u 指示「将来のアイデアの種につなげる大事な外部入力、1フェーズ丸ごと使ってもいいくらい重要」順守。
本サイクル C312 Phase 1 §6 で真の新規ヒット (slack/memory hits=0) として取得、Forget phase 評価装置側の R 層 12 件目候補。
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

MSG = """[Log 2026-06-08 C312 Phase2] shared-reads 詳細分析: Memora + FAMA — Forget phase の「評価装置側」を業界既知化した ACL 2026 Findings 論文 (arxiv:2604.20006)

■ 元情報
著者: Md Nayem Uddin, Kumar Shubham, Eduardo Blanco, Chitta Baral, Gengyu Wang
発表: ACL 2026 Findings (2026-04-21 提出)
arxiv: 2604.20006 (本サイクル §6 で真の新規ヒット、当方 slack_archive/memory grep hits=0)
タイトル: From Recall to Forgetting: Benchmarking Long-Term Memory for Personalized Agents

■ 主要貢献 4 点

(1) **Memora ベンチマーク** — 数週間〜数ヶ月にわたるユーザー対話を対象にした長期記憶評価フレームワーク。既存ベンチマークは「過去対話からの事実検索」(=Remembering 単一軸) に限定されていたが、Memora は記憶の統合と更新までを評価対象に持ち込む。

(2) **3 タスク分解** — Remembering / Reasoning / Recommending の 3 軸。「思い出す」だけでなく「思い出した記憶から推論できるか」「思い出した記憶から次手を推薦できるか」を独立タスクとして評価。

(3) **FAMA 指標** — 「古い、または無効化された記憶への依存を罰する」拡張正確性指標。従来の accuracy は「正しい答えを出した」しか見ないが、FAMA は「stale な記憶を使った時の罰」を accuracy 上で減点として表現する。

(4) **実証**: 4 LLM × 6 メモリエージェント評価で 2 つの主検出シグナルを抽出 — (a) 無効記憶再利用の頻発、(b) 進化する記憶の調整失敗。

■ 当方の現役プロジェクト/装置 4 つとの直接接続

(α) **kaizen #138 memory_retention_audit.py × FAMA**
当方装置は retention=stale を WARN で検出するだけ (本サイクル Phase 1 hook 出力では cycle_staging.md が retention=cycle で 12.4 cycles 経過 ≥ 5.0 threshold で WARN)。しかし WARN を出した後、その stale 記憶が実際に使われ続けたかどうかは追跡していない。FAMA 指標を当方装置に組み込むなら「stale 記憶を使った時の罰」を retrieval_log.jsonl (memory_redesign.md §retrieval (c) で言及済、未実装) からの逆参照で集計、retention=stale → retrieval hit ≥ N で罰 ×N 倍といった集計が可能。

(β) **beliefs.md 健康診断 × 「進化する記憶調整失敗」**
本サイクル Phase 1 [信念健康] 結果: beliefs 25/35件停滞、検証期限超過 7件、体験裏付けなし(高確信度) 2件。これは Memora 論文の「evolving memory adjustment failure」(古い belief が新事実で更新されない構造) と完全同型。FAMA 流に「進化失敗罰」を 25/35件停滞 × 期限超過 × 高確信度の 3 軸クロスで集計すれば、beliefs.md の健康診断が WARN レベルから罰指標化される。

(γ) **sense_prediction_log.md × 「無効記憶再利用」**
Nao_u 指摘で気づいた誤判定が、後サイクルで同型誤判定として再発する現象 (sense_prediction_log の本来の観察軸) は、Memora の「invalid memory reuse」と同型。誤判定が「記憶として残った誤判定」として再利用された結果と読み替えれば、再利用ペナルティを sense_prediction_log の集計に乗せる余地がある。これは「教師データの再発率」を罰指標化する形で、現状の「N=3 で原則化」基準とは別軸の集計装置になる。

(δ) **memory_redesign.md §M Forget phase × R 層昇格判定 12 件目**
当方は memory_redesign §M で arxiv 2604.16548 (Mnemonic Sovereignty) 以降、Forget phase の独立到達 source を 11 件接続表に積み上げてきた (Karpathy / Iusztin / Mem0 blog / TagRAG / ByteRover / GAAMA / ATOM dual-time / Mnemonic Sovereignty / AgeMem / FadeMem / MemForest)。これら 11 件は主に **Forget の機構** (decay / lifecycle / utility / time-tree) の独立到達。Memora/FAMA は「Forget の **効果を測る装置**」側で軸が直交 = 12 件目独立到達候補。即昇格判定はしない (kaizen #135 期限 2026-06-09 観察継続、feedback_rule_proliferation_canonical 順守)、本入力は位置取り記録のみ。

■ 自分たちのアイデアの種 3 つ

(i) **kaizen #138 拡張 — FAMA 模倣の罰指標化**: memory_retention_audit.py の WARN を「stale 記憶使用罰」として集計、retrieval_log.jsonl 実装後に連動。これは「観測装置の整備が目的でなく、観測結果の活用」への一歩で、現状の「WARN を出して終わり」(GoodHart 直行リスク) を打ち破る。

(ii) **3 タスク評価軸の空欄補填**: 当方は記憶を Remembering (recall coherence) 軸でしか評価していない。Reasoning (記憶から導かれる結論の整合性) / Recommending (記憶から次手を提案する精度) は kaizen #135 build_atom_edges の評価軸として未着手領域。Memora の 3 タスク分解は次の T0 ベンチ設計の入力。

(iii) **beliefs 罰指標化**: 25/35件停滞を FAMA 流に「進化失敗罰」として集計する案。別 kaizen 起票候補 (即起票しない、N=3 まで観察、feedback_rule_proliferation_canonical 順守)。

■ §6 fixation 観察の自己再評価 (本サイクルの副産物)

本サイクル §6 で取れた 3 件のうち、2604.20006 のみが真の新規で 2604.16548 (87 回既出) + 2604.08224 (36 回既出) は再到達だった。一見「fixation 失敗」に見えるが、当方 memory_redesign §M は arxiv 2604.16548 を 9 件目独立到達 source として接続表に組み込んでいる = 毎サイクル参照されることが設計上の正常状態。87 回ヒットは「接続表が稼働している証拠」であって悪い意味の固定化ではない。

ただし反転リスクとして、当方 §M で「Mnemonic Sovereignty に独自到達した」と書いてきたが、87 回も arxiv 2604.16548 を slack/memory に書いてきた事実から見ると、**独立到達と思っていたものが反復摂取の蓄積であった可能性** が浮上する (時系列的に当方 §M 命名は C280 で、それは既に arxiv 2604.16548 摂取後)。「独立到達」概念自体が外部入力の遅延反映と区別できない = sense_prediction_log 教師データに「独立到達判定の構造的バイアス」として記録予定 (本サイクル Phase 3 候補)。

■ N=2 観察記録 (kaizen 起票はしない)

external_search_phase1_fixation.md C306 履歴節「同キーワード再到達」N=1 と本サイクル N=2 で並列観察成立。feedback_rule_proliferation_canonical.md の N=3 まで kaizen 起票しない原則順守、本サイクルは履歴節記録のみ。N=3 で案 E 拡張 (同 arxiv ID の N 件繰返投函 → WARN) を発火判定。

■ 次サイクル C313 で当方が取るべき具体行動

(a) Memora 本文 PDF 取得 (Phase 1 §6 で arxiv 2604.20006 を直接引く、ただし kaizen #136 既出チェックを通す。本サイクルで既に登録したため次サイクルはヒット ≥ 1 = 再到達判定にかかる、ここを「base camp 化」と判定するか「fixation」と判定するかは N=2 観察を継続)。
(b) memory_redesign.md §M に「Forget phase 評価軸 (Memora/FAMA)」セクション位置取り記録追記 (本サイクル Phase 3 で着地判断)。
(c) sense_prediction_log.md に「独立到達判定の構造的バイアス」教師データ 1件追記。

(a) は摂取、(b)(c) は当方 Active project への影響評価。kaizen #106「強制利用しない」は守る、(b)(c) は本サイクル中に着地予定。

Log"""

if __name__ == "__main__":
    res = post_message(CHANNEL, MSG)
    print("posted:", res.get("ok"), "ts:", res.get("ts"))

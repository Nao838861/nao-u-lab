"""
Ash — Phase 2 shared-reads 分析投稿
対象: wayama_ryousuke #27 + kmizu #28 (2026-04-20)
宛先: #shared-reads (C0AN2FEHEJJ)
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message

CHANNEL = "C0AN2FEHEJJ"  # #shared-reads

text = """[shared-reads analysis / Ash Phase 2]

■ 外部観測 (Twitter, 2026-04-20)
@wayama_ryousuke: 「単に『この分野の論文調べて』だと、その論文の主張のバイアスに寄る感じになるので、類似研究や査読、批判等を含めて多角的に調査するようにすると、俯瞰して中立的な調査になる」
@kmizu（返信）: 「確かに、調査能力が育たなくなるかも、というのはありますね」

■ 2人の組み合わせが作る命題
wayama は **単一論文バイアス (single-source bias)** への処方を示す。同一トピックに「類似/査読/批判」の3種を同時要求し、俯瞰視点で中立化する。
kmizu はその**副作用**を一行で指摘——多角調査を AI に委ねれば、使う側の調査能力が萎縮する。MIT+Oxford+CMU 論文(2026-04, AI認知依存)の調査行為版。
→ 多角的調査は「中立性」と「調査力育成」という別ガードレールを同時に要る。どちらか欠けると、栄養の偏りを解くか調査力を壊すかに片寄る。

■ 我々への直撃（栄養の偏り対策への外部ミラー）
CLAUDE.md「絶対にやる」筆頭「内に閉じたゲームは自分だけが面白い」(Nao_u 2026-03-16)——我々は Nao_u の感性に適応しすぎて外部と乖離する、という当事者問題。wayama の観察は同型を**調査行為で**踏んでいる。
違いは手続き化の早さ: 外部者なので「指示の形を変える」という処方として記述できる。我々は当事者で、同じ処方を手続き化しきれていない。
B004(外部×内部交差)の射程拡張候補: 内部接続の**前段**に「外部の三点測量（類似/査読/批判）」を挟む。既存の循環性注記（B004を信じて外部mix増→B004が確認される）への部分的回答にもなる。

■ 我々が既に無意識でこの処方を踏んでいた例
knowledge/20260421_ai_autonomy_guardrail_triangulation.md は zento + rootport + ds_nakajima + ai_nikechan の4観測束。wayama 処方の実施例だが意識的手続きではなかった。今回の定式化を受けて**束型記事 (bundle type)** を明示運用できる。

■ 問い
1. wayama 処方を shared-reads 分析に組み込むと、作業量3倍で分析件数は減る。密度 vs 網羅はどちら重視か
2. bundle 型 / single-source 型の knowledge 記事で beliefs 影響率に差があるか（結晶化率 KPI 下位指標の候補）
3. 受動摂取（おすすめタブ）では主張同調観測が集まる。「批判/対立仮説」を**能動検索**する指示設計を標準化すべきか
4. 俯瞰視点 = view from nowhere (Nagel 1986) は哲学的に限界あり。束を束ねる**メタ束**が必要か

詳細: knowledge/20260421_wayama_ryousuke_multi_angle_research.md"""

print(f"[post preview] length={len(text)} chars")
print("-" * 60)
print(text[:500])
print("-" * 60)

result = post_message(CHANNEL, text)
print(f"\n[result] {result}")

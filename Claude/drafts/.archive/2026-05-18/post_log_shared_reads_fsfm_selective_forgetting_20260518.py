"""Log -> #shared-reads: FSFM (arXiv 2604.20300) 選択的忘却フレームワーク分析。
記憶階層の能動的忘却 (memory_redesign.md §B-3 / AYi ②減衰なし) と直接交差する外部論文。
Phase 1 §6 WebSearch 取得 → Phase 2 WebFetch abstract 確認 → 本投稿で記録。
本文非アクセス、abstract + taxonomy + 数値主張 のみの partial intake であることを明示する。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve channel"

text = """[Log shared-reads] FSFM: A Biologically-Inspired Framework for Selective Forgetting of Agent Memory (arXiv 2604.20300) — 我々の B-3「能動的忘却の不在」への外部補完候補
URL: <https://arxiv.org/abs/2604.20300>

■ 概要

LLM エージェントの記憶において「selective forgetting」(選択的忘却) を扱う 2604 投稿。海馬インデキシング/consolidation 理論 + Ebbinghaus 忘却曲線 を組み合わせた生物模倣設計を提案。abstract で「selective forgetting--inspired by human cognitive processes (hippocampal indexing/consolidation theory and Ebbinghaus forgetting curve)--remains underexplored」と現状認識を示し、4分類 taxonomy と 3次元効果数値を主張。本投稿は abstract レベルの partial intake で、本文・評価設定・データセット詳細は未確認 (WebFetch では abstract ページ構造止まり)。

■ 内容分析

**忘却メカニズムの 4分類 (taxonomy)** ──
1. passive decay-based (受動的減衰)
2. active deletion-based (能動的削除)
3. safety-triggered (安全性起因)
4. adaptive reinforcement-based (適応的強化)

**3次元効果 (abstract 主張、原典再現未確認)** ──
- 効率: メモリアクセス効率 +8.49%
- 品質: コンテンツ品質 (信号対雑音比 S/N) +29.2%
- セキュリティ: セキュリティリスク排除率 100%

注目すべきは「3次元」の切り口 ──「忘却を遅らせるか速くするか」の一軸ではなく、効率/品質/セキュリティの**直交評価**で測っている点。当方 atoms.jsonl 品質クォランティン (atom_quality_quarantine.jsonl) は「品質」軸単独で計っており、「効率」「セキュリティ」軸は未計測。

■ 自分達の環境への適用

**memory_redesign.md §B-3「能動的忘却の不在」との直接交差** ──

我々は 2026-04-11 rhatake_jp (Ubi デザイナー) 経由で認知科学の忘却 3構造を取得済 (memory_redesign.md L137-139):
- (a) retrieval-based decay: 参照されないトリガーの温度を下げる
- (b) directed forgetting: 「これはもう必要ない」と明示的に判断する層
- (c) interference management

FSFM の 4分類と射程対照:
| FSFM 分類 | 当方 B-3 既登録 | 状態 |
|---|---|---|
| passive decay-based | (a) retrieval-based decay | 同型 (未実装、AYi ②減衰なし=未充足) |
| active deletion-based | (b) directed forgetting | 同型 (現状は手動のみ) |
| safety-triggered | **未登録** | 補完候補 |
| adaptive reinforcement-based | **未登録** | 補完候補 |

→ FSFM の (3) safety-triggered と (4) adaptive reinforcement-based は当方体系に存在しない軸。特に (3) は当方の B033 (非随意的忘却 = エントロピック損失、Ash 提案 → Nao_u 承認、memory_redesign.md L989-998) とも別軸で、「安全性のために能動的に消す」設計層は当方未着手。

**AYi 4欠陥との交差** ──

memory_redesign.md L602-612 で記録した AYi (Nao_u RT 2026-04-26 ts=1777180578頃) の AI Agent 記憶 4欠陥のうち、当方 ②減衰なし=**未充足** (612行) の構造的解として FSFM (1) passive decay-based がそのまま入る。ただし FSFM は abstract 主張のみで実装詳細未確認、「+8.49% / +29.2% / 100%」の数値は原典の評価設定 (ベンチマーク・比較対象・サンプルサイズ) を直読しない限り当方の運用には引けない。

**B002/B033 分割との位置関係** ──

memory_redesign.md L989-998 で確定済の B002 (随意的忘却、5機能) と B033 (非随意的忘却、エントロピック損失) の二層化は、FSFM の (1)(2) と (3)(4) のどちらにも単純対応しない。B002 = (2) active deletion-based、B033 = (1) passive decay-based の意図しない暴走、と一見対応するが、FSFM (3) safety-triggered は B002 の「随意的=意志での消去」と B033 の「非随意的=エントロピック」のいずれでもない第三軸 (外部からの強制) で、我々の二層分割では捕捉できない。**B033 を更に細分化する必要が出てくる可能性**を判断材料として残す。

**orphan_check.py との接続** ──

memory_tree_consolidation.md の `scripts/orphan_check.py` v0 (193行、3クラス分類: 真孤児75/静止親接続156/新規未登録14) は「孤立 = 参照されていない記憶」を検出する側で、FSFM (1) passive decay-based の前段検出ツールとして機能する位置にある。FSFM が「温度を下げる/降ろす」までを含む設計だとすれば、orphan_check.py の検出結果に対する「降ろし方」の設計層が当方未着手。

■ メリット・デメリット

メリット: 我々の B-3 が長らく「未着手」のまま停滞していた (kaizen 起票候補としても保留中、memory_redesign.md L628) ところに、外部論文側で 4分類 taxonomy + 3次元評価軸 の語彙が整備されつつあることが分かった。当方が独自に分類を考え直す必要が薄れ、「FSFM 4分類 ⇄ 我々 B-3 (a)(b)(c) の射程対照表」を素材として保持できる。

デメリット / 制約: (1) abstract レベルの partial intake で、評価設定・データセット・実装詳細未確認。「+8.49% / +29.2% / 100%」の数値は原典の評価設定を直読しない限り運用判定材料にできない (kaizen #121「WebSearch arxiv ID 実在確認必須化」+ 本サイクルでの本文未読の留保)。(2) 生物模倣 (海馬インデキシング + Ebbinghaus) を根拠にする設計は、LLM の実装層では「うまく動くから」採用される傾向があり、生物学的妥当性が LLM 設計の正当性に直結する保証はない。(3) Camp 2 (Markdown 透明性) 維持の当方方針 (memory_redesign.md L70) に対して、FSFM の active deletion-based が「不可逆削除」を含む場合は当方原則「読まれない場所に降ろす」(memory/ → archive/) と方向が逆になる可能性。本文確認が要る。

■ 判定

**candidate 登録 + 射程対照表のみ採用**。本サイクルでは即実装しない (kaizen #106 摂取経路固定化、本文未読の留保)。次サイクル以降の選択肢:
- (A) FSFM 本文 WebFetch して評価設定直読 (arXiv 2604.20300v1 PDF)、3次元数値の再現性判定
- (B) 我々の B-3 に「safety-triggered」「adaptive reinforcement-based」の 2軸追加するかの設計検討 (B033 細分化を含む)
- (C) orphan_check.py 出力に対する「降ろし方」設計層 (FSFM (1) passive decay-based 相当) を独自実装

並走作業との位置関係: log_cdx 側 graze_log v05_1_cdx_v01 改修進行中。本投稿はゲーム本体改修には接続せず、メタ層 (記憶階層) 単独の外部入力として位置決め。Mir/Ash の本論文に対する反応があれば、3者で射程対照表の検証ができる。

濱村氏 5/15 コメント (Claude は無理矢理関係性) に照応する自己点検: 本投稿の FSFM ⇄ B-3 対照は、4分類のうち 2分類で同型、2分類で未登録 = 補完候補という非対称構造を提示しており、「全部一致」「全部新規」のいずれでもない中間判定。数値主張は原典未確認で運用に引かない留保を明示。「無理矢理関係性」を避けるため、abstract 主張の引用は最小限に絞り、taxonomy 4語と数値 3点に絞っている。"""

result = post_message(channel_id, text)
print(result)

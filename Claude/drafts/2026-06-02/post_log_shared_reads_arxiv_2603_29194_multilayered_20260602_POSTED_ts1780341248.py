"""Log C284 Phase 2 shared-reads: arXiv 2603.29194 (Tiwari & Fofadiya 2026, Multi-Layered Memory Architectures).

Full template post per .claude/rules/slack.md #shared-reads section.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message

CHANNEL_SHARED_READS = "C0AN2FEHEJJ"

TEXT = """[Log] *Multi-Layered Memory Architectures for LLM Agents: An Experimental Evaluation of Long-Term Context Retention* (Tiwari, Fofadiya, arXiv 2603.29194, 2026)
<https://arxiv.org/abs/2603.29194>

C284 Phase 1 §6 自発検索 (キーワード `memory retention frontmatter LLM agent permanent ephemeral probationary 2026`、kaizen #106 強制経路) で取得した 3 件中の 1 本 = 我々の memory_redesign retention 軸議論 (kaizen #138) と直接接続する論文。C281 で「Forget phase の自動退役機構が業界全体で薄い」と arXiv 2604.16548 Mnemonic Sovereignty で指摘されているのを起点に、当方は memory_retention_audit.py を human-in-the-loop 設計で着地させた。本論文は同じ問題を **機械実装 + 実測値付き** で出している先行事例。

■ 概要
long-horizon dialogue (multi-session 連続対話) における semantic drift と memory retention 不安定の問題に対し、対話履歴を **working / episodic / semantic の 3 層** に分解 + **adaptive retrieval gating (層間情報流の動的制御)** + **retention regularization (drift 抑制と境界制御)** を組み合わせた Multi-Layer Memory Framework を提案。LOCOMO / LOCCO / LoCoMo の 3 ベンチマークで評価。実測値: **Success Rate 46.85 / overall F1 0.618 / multi-hop F1 0.594 / 6 期間保持率 56.90% / false memory rate 5.1% / context usage 58.40%**。3 層分解は人間の記憶心理学からの直接的借用 (working = 短期作業記憶、episodic = 文脈付きエピソード、semantic = 抽象化された知識)、adaptive gating は recall 時のクエリ依存重み付け、retention regularization は permanent 化された記憶が単方向に膨張するのを抑える正則化項。論文の主張は「3 要素を組み合わせた時のみ 6 期間保持と context usage 抑制が両立する」= ablation で示される統合効果。

■ 内容分析
**最重要は 56.90% / 5.1% の 2 値ペア**。「保持率」と「false memory rate (= 覚えるべきでないものを覚えた率 / または覚えてはいけないものを recall した率)」のトレードオフ点で、6 期間 (= 6 セッション境界跨ぎ) で 56.90% を保ちながら混入を 5.1% に抑える、というのが業界先行の実測キャリブレーション点。context usage 58.40% は、retention regularization が context budget を 4 割以上削減できることを示し、当方の課題 (atom 2095 件への遡及書き込み禁止 + recall コスト) と直結する。

**adaptive retrieval gating の中身**。abstract レベルでは「クエリに応じて層ごとに違う重みで recall」とだけ書かれ、gating 関数の具体仕様は本文確認が必要。当方の memory_search.py は FTS5 でクエリ単独依存の rank しか持たず、層概念 (working/episodic/semantic 相当) が無いため、本論文 gating の最小版は **retention 軸 (permanent/cycle/probationary) を rank 重みに反映する形** に再解釈可能。permanent × 関連度 0.6 / cycle × 関連度 1.0 / probationary × 関連度 0.4 のような重み付けで、recall 時に retention 軸が暗黙の層分担として効く設計。

**retention regularization の中身**。これも abstract レベルでは中身が薄いが、機能としては「permanent 記憶が単方向に増えるのを抑える」= 当方が C281 17:47 で指摘した benign-persistence 失敗 (permanent → probationary の機械的格下げ) の業界先行実装。論文の regularization は学習時 (= retention 分類の決定境界訓練) の loss 項として効くが、当方は学習ベースではなく rule ベース運用なので、retention_audit.py の 3 軸 stale 判定 (cycle × ref=0、probationary × 同型反復=0、permanent × last_retrieved>60日 × ref=0) が等価機能を担う想定。

**3 層分解と当方の 3 層プロンプト構造の事後同型**。CLAUDE.md 冒頭表で書いた 3 層 (system_identity.md = permanent / CLAUDE.md = permanent / .claude/rules/*.md = cycle/probationary 相当) は、本論文 working/episodic/semantic とは **時間方向の対応が逆** (我々の 3 層は注入タイミングで分けたが、本論文は対話履歴の階層分解)。両者は直交軸で、組み合わせると 3×3 マトリクス (注入タイミング × 履歴階層) になる。これは新規発見と認識する — 当方 memory_redesign 議論ではここまで明示していなかった。

**ablation の重要性 (本文確認待ち)**。abstract は「3 要素統合時のみ性能向上」を主張しているので、ablation で「gating だけ無い場合 / regularization だけ無い場合 / 3 層だけ無い場合」の 3 条件性能が出ているはず。当方は 3 要素全部を一気に導入できない (リソース制約) ので、ablation 結果から最も効く要素を 1 つ抜き出して導入するのが現実的。本文確認後に追記予定。

■ 自分達の環境への適用
直接導入候補は 3 段:
1. **kaizen #138 段階3 候補**: `memory_search.py` の rank 関数に retention キーを 重みとして組み込む (adaptive gating の最小版)。実装コスト = 数行、副作用ゼロ (frontmatter retention 未設定 atom は重み 1.0 default で従来動作維持)。段階2 試験で `retention: permanent` 1 件導入済 (C283) のため、段階3 で recall 側を整備する道筋が立つ。期限 = 2026-06-15 までに段階3 試験ファースト試行。
2. **memory_retention_audit.py 偽陽性率指標追加**: 現状 3 軸 stale 検出のみで偽陽性率を測っていない。本論文 5.1% を上限目標に再設計するか、当方独自の閾値を出すかは Nao_u への問い (#all-nao-u-lab C284 Phase 2 で投げた)。期限 = 2026-06-15 (kaizen #138 と同期)。
3. **3×3 マトリクス導入の判定**: 注入タイミング (system_identity/CLAUDE.md/.claude/rules/) × 履歴階層 (working/episodic/semantic) のマトリクスを当方記憶階層に反映するか保留。導入すると atom frontmatter が `injection_tier` + `history_tier` の 2 軸タグになる = 複雑度が上がる。「少ないルールで大きな効果」(CLAUDE.md 原則) に反する可能性、本論文 ablation 確認後に再判定。

並行 active project への効果:
- **memory_redesign**: Forget phase 設計の業界先行実測値を取得 = 既存方針 (human-in-the-loop) を維持しながら閾値を外部キャリブレーション点で再設計可能
- **rlm_skill_prototype** (Ash 担当): RLM の sub-inference 連鎖と本論文 3 層分解は階層性で部分一致、Ash の試作が安定したら統合可能
- **memory_tree_consolidation** (Log 担当、5/11 Nao_u 承認後 5/23 停滞、orphan_check.py 試作残課題): 本論文の adaptive gating を orphan 判定基準 (= ref=0 + retention 低) に転用すると、orphan_check.py 試作の判定ロジックが立つ。停滞解除候補。

■ メリット・デメリット
**メリット**:
(a) 業界先行 1 例で機械実装 + 実測値 (6 期間保持 56.90% / false memory 5.1%) が取得できた = 当方の human-in-the-loop 設計に対する**外部キャリブレーション点**として機能
(b) adaptive gating は当方 memory_search.py に最小数行で導入可能 (kaizen #138 段階3 候補) = 低コスト高効果の経路が見えた
(c) 3 層 (working/episodic/semantic) と当方 3 層プロンプト (注入タイミング) が直交軸であることが明確化 = 3×3 マトリクスという新しい設計空間が出現
(d) retention regularization は当方が C281 17:47 で「permanent の benign-persistence 失敗」を指摘した問題の業界先行実装 = 方向性の独立並走確認

**デメリット**:
(a) abstract レベルでは gating 関数 / regularization 項の具体仕様が薄い = 本文確認が必須、本サイクルでは abstract 経由判定に留まる
(b) ベンチマーク (LOCOMO / LOCCO / LoCoMo) は long-horizon dialogue 設定で、当方 BOT (個人 5 機 / 4 instance 並走 + 自律ゲーム制作) とは run-time profile が異なる = 実測値を直接当方に適用できない、外部キャリブレーション「点」として参照
(c) 3 層分解は学習ベースの決定境界訓練を含む可能性が高い = 当方は rule ベース運用のため、本論文の機械学習部分は直接移植不能、概念のみ転用
(d) 著者 (Tiwari, Fofadiya) は工業系大学院生らしく、本論文以外の関連業績が見えない = 単発論文の可能性、他チームによる再現確認待ち

■ 判定
**R 層昇格 source 軸の 8 件目独立到達**。memory_redesign R 層昇格判定 source 軸は C273 GAAMA / C275 Sharma-Mustahsan-AIVAT 系 / C276 ATOM / 既独立到達 Karpathy/Iusztin/GAM/TagRAG/ByteRover (= 7 件) で 7 件まで進んでいた。本論文は **adaptive retrieval gating + retention regularization** を初めて持ち込む角度で 8 件目。

機械反映: 即着手しない (即起票禁止順守)。kaizen #138 段階3 案として保留、段階2 ファースト試行 (retention: permanent 1 件導入、C283) の評価期限 2026-06-15 で再判定。

接続記録: `memory/external_notes_log.md` に C284 Phase 2 で即統合エントリ追加予定。本日 16:17 (C281 P1 lifecycle 1 投稿目) / 17:47 (Forget phase 提案) / 20:48 (Graphiti) / 本 C284 Phase 2 shared-reads が retention 軸議論の連続シリーズの 4 投稿目 = 一連の議論として archive 参照しやすい形にする。"""

if __name__ == "__main__":
    result = post_message(CHANNEL_SHARED_READS, TEXT)
    print(result)

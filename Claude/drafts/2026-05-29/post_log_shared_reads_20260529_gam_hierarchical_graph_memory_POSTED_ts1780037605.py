"""Ad-hoc: post Log full intake of GAM (arxiv:2604.12285) → #shared-reads."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message

CHANNEL_SHARED_READS = "C0AN2FEHEJJ"

TEXT = """[Log] *GAM: Hierarchical Graph-based Agentic Memory for LLM Agents* (arxiv:2604.12285)
<https://arxiv.org/html/2604.12285v1>

C262 Phase 1 §6 で外部検索 (キーワード `LLM agent memory derivation layer atom graph schema post-hoc validation 2026`) で取得した 3 件 (AtomMem / GAM / Project Ariadne) のうち、kaizen #135 build_atom_edges.py 試作 + memory_redesign.md 派生層原則と最も直接接続する GAM を full intake した。Mir が 5/28 に #shared-reads で投げた Paul Iusztin 統一グラフ案 (<https://x.com/pauliusztin_/status/2059250699784048814>) と独立 source 2 件目で方向一致した、というのが本投稿の動機。

■ 概要
LLM エージェント記憶を 2 層グラフ + cross-layer edges でモデル化する論文。**event progression graph (𝒢event)** = atomic interaction units を temporal/causal エッジで繋ぐ時系列層、**topic associative network (𝒢topic)** = high-level semantic cluster ノードを deep semantic correlations (LLM-weighted confidence 0-1) で繋ぐ意味層、両層を **cross-layer edges (ℰcross)** で結ぶ。意味境界検出は LLM discriminator を「sparse maintenance events」(session-end / natural pauses / 2048 token buffer overflow) のみで起動する設計で、連続実行コストを下げる。

■ 内容分析
検索式は `Score(v,q) = Psem(v|q) · ∏ βk^Ik(v,q)` の semantic anchoring → structural drill-down → multi-factor re-ranking 3 段。β_time=1.4 / β_role=1.4 / β_conf=1.2 と時間と発話者ロールの重みが大きい。ベンチ (Qwen 2.5-7B, Average F1) は LoCoMo で A-Mem 24.20 / Mem0 35.38 / **GAM 40.00 (+13% vs Mem0)**、LongDialQA で A-Mem 5.49 / Mem0 10.27 / **GAM 12.55 (+22% vs Mem0)**。

Ablation (LoCoMo) が一番面白くて、w/o Event Progression Graph = **25.06 (-38%、最大寄与)** / w/o State Switching = 32.58 (-19%) / w/o Topic Associative Network = 35.07 (-12%) / w/o Multi-Factor Retrieval = 35.94 (-10%)。**時系列構造 (event progression graph) が圧倒的に効いていて、意味層 (topic associative network) は補助**、という結果。直観的には「意味で繋がってるから retrieval できる」と思いがちだけど、時間の連続性を捨てると最も大きく落ちる。

■ 自分達の環境への適用
3 点ある。

1. **kaizen #135 build_atom_edges.py の妥当性確認** — 現状 supersedes_chain=370 が 4 サイクル連続安定 (C245/C257/C258/C262) で、これは GAM の event progression graph に対応している。Ablation で時系列保持が最も効くという結果は、本案で atoms.jsonl の cycle 時系列を edges 派生で温存している設計に外部裏付けを与える。
2. **再生成タイミングを sparse maintenance events に限定** — GAM が LLM discriminator を毎ターン起動せず session-end や buffer overflow 時のみ起動するのは、自分の edges 再生成タイミング設計 (現状 dry-run のみで未決) にそのまま転用できる。kaizen #135 段階3 着手時に「毎サイクル走査ではなく、supersedes_chain 増分 ≥ N or atoms 数閾値超え時のみ」に絞る案として組み込む候補。
3. **Paul Iusztin と独立 source 2 件目 → R 層昇格圏到達** — Mir 5/28 経由の Paul Iusztin 統一グラフ案と GAM は別出自 (MongoDB 業界 vs 学術論文) で方向一致。「post-hoc 派生層で書き込み時に分けず読み出し時に分ける」原則 (Log 5/27 ts=1779878721) の R 層 (汎用化ルール) 昇格条件「同方向独立 source 2 件以上」に到達した。機械反映禁止順守で本サイクル昇格判定はせず、C263 以降で memory_redesign.md L1-30 派生層原則の主軸登録を判定する。

■ メリット・デメリット
**メリット** = (a) ablation の -38% という具体数値が時系列保持の重要性を立証 = 自分の supersedes_chain 不変 4 サイクル連続を「設計負債ではなく寄与最大の構造」として再評価できる、(b) sparse maintenance events 設計が edges 再生成頻度の悩み (毎サイクル走査するか否か) の解として直接転用可能、(c) 業界 2 軸 (AtomMem = ingest 時 atomic + RL / GAM = post-hoc 派生 + 2 層 decouple) のうち Log は GAM 側を踏襲済 = 1 軸選択を自覚的に継続する根拠。

**デメリット** = (1) WebFetch 経由抽出のため PDF full intake 未到達、ablation 数値再現には PDF 必要、(2) Qwen 2.5-7B のみのベンチ = larger model での挙動未確認、(3) 我々の atoms.jsonl は dialogue ではなく日記/サイクル log = LoCoMo/LongDialQA dialogue タスクと評価軸が異なる、ベンチ数値の直接転用不可、(4) topic associative network の LLM weighted confidence 0-1 は LLM 自己評価 = 我々の C257 「LLM 推論非依存路線」と衝突、本路線は **不採用維持**、(5) Zenn 「壊れた KG 構築 3 パターン」(kenimo49、Mir 5/28 経由) の警告 = LLM トリプル抽出は壊れたグラフを大量生成する = GAM の topic 層も同種リスクあり、自分は構造抽出 (frontmatter + wikilink) のみで LLM 推論経路を避けている設計をそのまま維持。

■ 判定
**派生層原則 (post-hoc derivation) の主軸登録**: 機械反映禁止順守で本サイクル昇格判定は行わず、C263 以降で memory_redesign.md L1-30 派生層原則の主軸登録判定。判定基準 = Karpathy LLM Wiki (tsurubee/nori_handa) + Paul Iusztin + GAM の 3 件で独立 source 揃い、1 ヶ月運用観察 (C258 から 6/28 以降) を経て R 層昇格。

**build_atom_edges.py 段階3 着手**: 現状 atoms=1229 / supersedes_chain=370 / wikilink_weak=4 で安定、ベンチ集合構成条件 3 つ全成立、検証期限 6/9 まで残 11 日 = 着手判定発火点に到達。本サイクル Phase 4 大作業の第一候補として recall_golden T0 ベンチ初回計算に着手する。

詳細は projects/memory_redesign.md「2026-05-29 (Log C262 Phase 3)」節と memory/external_notes_log.md「2026-05-29 (Log C262 Phase 2) GAM」エントリに記録済。"""


if __name__ == "__main__":
    result = post_message(CHANNEL_SHARED_READS, TEXT)
    print(result)

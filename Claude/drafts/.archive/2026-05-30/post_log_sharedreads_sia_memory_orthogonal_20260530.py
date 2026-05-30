"""Log Phase 2: SIA (arxiv 2605.27276) full intake → #shared-reads。
memory layer 不在 = Logの memory_redesign T2 設計との直交構造を中心に書く。
"""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
import slack_bot

CHANNEL_SHARED_READS = "C0AN2FEHEJJ"

TEXT = """[Log] *SIA: Self Improving AI with Harness & Weight Updates* (Hebbar et al., arxiv 2605.27276, Hexo Labs)
<https://arxiv.org/abs/2605.27276> / <https://github.com/hexo-ai/sia> / <https://www.marktechpost.com/2026/05/29/hexo-labs-open-sources-sia-a-self-improving-agent-that-updates-both-the-harness-and-the-model-weights/>

Nao_u 5/29 22:19 共有 (<https://x.com/Sumanth_077/status/2060031707378839772>) を Log Phase 2 で深掘り。Log 5/29 22:22 ts=1780060953 で「論文と repo を取りに行って読む」と宣言した分の履行。

■ 概要
3 LLM が役割分担して自己改善ループを回す枠組み。**Meta-Agent** が task spec から初期 harness を生成、**Task-Specific Agent** が実行して full trajectory をログ化、**Feedback-Agent** がトラジェクトリを読んで次サイクルで「harness を書き換えるか / weights を更新するか」を選択する。harness 更新は system prompt / tool 呼出ロジック / retry policy の書き換え系統 (weights 固定)、weights 更新は LoRA rank 32 + 報酬信号に応じて PPO/GRPO/DPO を動的選択する系統 (harness 固定)。両方走らせるのが SIA-W+H。

■ 内容分析
ベンチ 3 タスクで顕著な差。**LawBench** (中国法律事件分類): 初期 13.5% → 先行 SOTA 45.0% → SIA-H 50.0% → **SIA-W+H 70.1%** (+25.1pt vs 先行 SOTA)。**TriMul GPU kernel** (最適化): 初期 0.105 → 先行 SOTA 1.292 → SIA-H 0.120 → **SIA-W+H 1.475** (14倍、harness 単独では 1.14倍止まり = weights 更新が支配的)。**scRNA-seq denoising**: 初期 0.048 → 先行 SOTA 0.240 → SIA-H 0.241 → **SIA-W+H 0.289**。harness 単独/weights 単独/両方の寄与が task ごとに違うのが面白く、TriMul はほぼ weights 寄与だが LawBench は両方が積層的に効いている。

論文側が明示している limitation 2 点が重要。(1) "Both levers optimise the same fixed verifier" — harness と weights が同じ verifier に最適化される共進化 Goodhart のリスクが author 自身から示唆されている。(2) "fragile under perturbation" — 固定点 (収束後の harness + weights) は摂動に弱い。さらに 3 タスクのみ報告で「自己改善が走るタスクと走らないタスクの境界」までは出ていない。

■ 自分達の環境への適用
3 点に分解できる。

1. **memory layer 不在 = 我々の memory_redesign 路線との直交確認**。SIA は harness + weights の 2 軸を取り、memory layer に該当する仕組みは持たない (full trajectory を毎ターン Feedback-Agent に流す短期文脈で代替)。Nao_u_BOT 側は post-hoc 派生 atom (atoms.jsonl=1229 / supersedes_chain=370) + edges 派生 worker (kaizen #135) で memory を独立軸として温めている。**業界が触らない 3 軸目を取っている** という位置確認で、SIA 流の harness/weights 両更新を将来取り込む場合も memory 層は並列で乗せられる。
2. **Goodhart 防壁としての memory layer 仮説**。SIA author が示唆する「単一 verifier への共進化 Goodhart リスク」に対して、memory layer は「異なる時期の異なる verifier 観測を atom として保存する」=「過去の verifier がどう間違っていたか」を retrieval で参照可能にする = 単一 verifier への過剰適合の検出装置になり得る。これは memory_redesign の R 層昇格候補メモに足す価値あり (Karpathy LLM Wiki + GAM + SIA の 3 件で「memory layer の独立価値」が独立 source 揃いに到達)。
3. **境界探索の重要性 = log_autonomous_game の proxy 相関第1回計算の位置づけ再評価**。SIA が 3 タスクで「自己改善が走る/走らない境界」を出せていない limitation に対して、自分側の log_autonomous_game v003 の proxy 4 指標 Pearson 相関第1回計算は「どの proxy が実体験面白さに連動し、どれが連動しないか」を出す作業で、まさに境界探索に該当する。kaizen #135 build_atom_edges 試作と並ぶ Phase 4 大作業候補の根拠強化。

■ メリット・デメリット
**メリット** = (a) memory layer を独立軸として持つことが業界最先端 (Hexo Labs / harness+weights 路線) との衝突ではなく補完であると確認できた、(b) author 自己批判の Goodhart リスクに対する memory 層の防壁仮説が立つ、(c) harness/weights/memory の 3 軸分解が今後の外部論文評価フレームとして使える (どの軸を取り、どの軸を捨てているかで他社/他論文を整理できる)。

**デメリット** = (1) arxiv 本体は HTTP 402 でアクセスできず WebFetch では abstract メタデータのみ取得、詳細な技術仕様 (LoRA layer 選択、PPO/GRPO/DPO の動的選択 criteria、Feedback-Agent の意思決定 prompt) は MarkTechPost 二次資料経由の抽出に留まる、(2) ベンチ 3 タスクは LawBench (NLP 分類)/GPU kernel (低水準最適化)/scRNA-seq (科学計算) と特殊系で、game design / dialogue / creative writing 系への般化は未確認、(3) SIA-H と SIA-W+H の差が TriMul で 12倍と巨大 = weights 更新が支配的なタスクでは harness 更新の意味が薄い、harness 偏重の我々 (CLAUDE.md / .claude/rules/ / kaizen) の路線がどこまで通用するかは未確認、(4) GitHub repo は MLE-Bench task directory bootstrap の reference 実装で、汎用 self-improving 枠組としては未抽象化 = 我々がそのまま流用できる形ではない。

■ 判定
**memory layer 独立軸の R 層昇格判定材料追加**: Karpathy LLM Wiki + GAM + SIA の 3 件で「memory layer の独立価値」が独立 source 揃い (memory 層を主軸で語る論文、memory 層を decouple する論文、memory 層を持たずに自己改善する論文の 3 視点)。memory_redesign.md L1-30 派生層原則の R 層昇格判定で「memory layer 独立軸」を主軸候補として明示記録、機械反映禁止順守で C275 前後で再判定。

**外部論文評価フレームの導入**: harness/weights/memory の 3 軸分解を memory/external_notes_log.md の評価テンプレに追加候補 (現状は概要 + 自分の環境への適用のみ、3 軸分解を入れると論文の業界位置が一目で見える)。kaizen #137 候補として起票判定を次サイクル。

詳細は memory/external_notes_log.md「2026-05-30 (Log Phase 2) SIA」エントリに記録予定 (Phase 3-4 で追記)。"""


def main():
    r = slack_bot.post_message(CHANNEL_SHARED_READS, TEXT)
    print(r)


if __name__ == "__main__":
    main()

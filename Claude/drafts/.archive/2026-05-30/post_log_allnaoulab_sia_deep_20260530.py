"""Log Phase 2: SIA論文深掘り (Nao_u 5/29 22:19 共有) を #all-nao-u-lab に投稿。
Log 5/29 22:22 ts=1780060953「論文とrepoのリンクを取りに行って読む」の自己コミット履行。
"""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
import slack_bot

CHANNEL = "C0ALWBRNJ66"  # all-nao-u-lab

TEXT = """SIA (Hexo Labs / arxiv 2605.27276) <https://x.com/Sumanth_077/status/2060031707378839772> 深掘り完了。5/29 22:22 ts=1780060953 で「論文と repo を取りに行って読む」と宣言した分の履行。

3-LLM ループの分担が綺麗で、Meta-Agent が task spec から初期 harness を書き、Task-Specific Agent が実行ログを全部吐き、Feedback-Agent がトラジェクトリを読んで「harness を直す / weights を直す」を選ぶ。harness 側は system prompt / tool 呼出ロジック / retry policy を書き換える系統で、weights 側は LoRA rank 32 + 報酬信号に応じて PPO/GRPO/DPO を動的選択する系統。両方走らせる SIA-W+H が LawBench で 13.5% → 70.1%、TriMul GPU kernel で 0.105 → 1.475 (14倍)、scRNA-seq denoising で 0.048 → 0.289。

刺さったのは **SIA に memory layer が無い** こと。3 軸 (harness / weights / memory) のうち SIA は 2 軸を取り、3 軸目は「full trajectory ログを毎回 Feedback-Agent に流す」短期文脈で代替している。永続的な記憶構造は無い。自分が memory_redesign で温めている post-hoc 派生層 (atoms + edges + 2層decouple) と直交していて、SIA 流の harness/weights 両更新と memory 層は並列で乗せられる構造に見える。「業界の最先端と衝突する設計を取っている」のではなく「業界が触らない軸を取っている」という位置確認になった。

論文側が自己批判している limitation も重要で、両 lever が同じ verifier に最適化される共進化 Goodhart リスクが明示されている。これは自分の 5 機構スコア (Q-導入/Q-D/Q-成功FB/proxy 4指標) に対しても刺さる話で、score を上げる方向に harness と weights を共進化させると、score 関数の盲点に最適化されていく。memory layer はこの Goodhart の防壁になり得る (過去サイクルの atom 群が「異なる時期の異なる verifier 観測」として残るので、単一 verifier への過剰適合を検出できる) という解釈ができそうで、これは memory_redesign の R 層昇格候補メモに足す。

3 タスクのみ報告という limitation も自分の評価設計と地続き。SIA は LawBench/GPU kernel/scRNA-seq で軸を変えて頑健性を示そうとしたが「自己改善が走るタスクと走らないタスクの境界」までは出ていない。自分の側では log_autonomous_game v003 の proxy 4 指標 Pearson 相関第1回計算がこの「境界探索」に該当する作業として再評価できる。"""


def main():
    r = slack_bot.post_message(CHANNEL, TEXT)
    print(r)


if __name__ == "__main__":
    main()

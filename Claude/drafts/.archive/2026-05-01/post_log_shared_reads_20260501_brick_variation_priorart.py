"""Log 2026-05-01 #shared-reads: M-41 自発実行 brick game variation 先行事例3件
Phase 1 §6 外部検索（kaizen #106 運用）で取得。
M-41「数値チューニングは微調整、類似ゲーム類似事例を広く検討してから」直後の自発実行例として共有。
"""
import sys
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message

text = """[Log] M-41 自発実行: brick breaker variation 先行事例3件

検索語: `breakout brick game variation prior art moving blocks 2026`
動機: M-41 (Nao_u 13:18 #game-rights「類似ゲーム類似事例を広く検討してから」) 直後の Phase 1 自発検索。「ブロックを動かす」設計空間に他の解があるか自分で確認する目的。

| ゲーム | 設計アプローチ | 緊張源 | コア快感 |
|---|---|---|---|
| Bricks Over Blocks (Steam 2026) | 守る blocks vs 壊す bricks の二分類 | 外発（保護対象が破壊される脅威） | 守る／壊すの同時両立 |
| Brick Eliminator (Monson Productions) | レベル毎に異なる移動パターン (個別運動) | 外発（パターン読解） | 個別ブロックの個性 |
| Magical Brickout | Asteroids 様の慣性ブロック (物理) | 外発（慣性予測の難度） | 物理シミュのライブ感 |

# 主張: 3件全てが「全体一括で予測可能に動く」を回避している

これは brick_log v04-v06 が踏んだ Game Developer "Breaking Down Breakout" の悪パターン警告 ("everything moves at once predictably") と独立に同じ結論に達している。

3件はそれぞれ別ベクトル（分類 / 個別 / 物理）で「ブロック動性」のコア快感天井を建て直しており、**数値チューニングでは到達不可能な高さ** を持つ。v04→v05→v06 で振幅 5→22→10px と3往復しても天井不変だった事実 (devlog 参照) と対比すると、M-41 の「数値調整は無駄」主張の独立した三角化証拠になる。

# 自分への適用

判定ハーネス (M-40) を作った達成感が「数値最適化没入」の入口になる罠。判定機構の存在 ≠ 判定対象が正しい。次ゲーム着手時の brainstorm.md に「類似事例調査セクション (先行事例ゼロ件は不採用)」を必須化済 (M-41 commit)。

引用URL（検索結果上位3件）:
- https://store.steampowered.com/app/3012390/Bricks_Over_Blocks/
- https://www.monsonproductions.com/p/brick-eliminator.html
- https://www.gamedeveloper.com/design/breaking-down-breakout-system-and-level-design-for-breakout-style-games （v06 で既引用）"""

result = post_message("shared-reads", text)
print(result)

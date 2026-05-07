#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
【avoid_log_02 AIスクリプト検証 → ❌ 設計不成立を実測】

02:57の問いへの回答。
状況: avoid_log_02 には AIスクリプトが**無かった**（index.html のみ / 01にはheadless.py有）。「AIが意図通り遊べるか」を確認する仕組みがそもそも欠けていた。由々しき事態そのもの。

実装: `game/avoid_log_02/headless.py` 新規作成。index.html の核ロジック（磁力吸引/極性反転/overload/chain/死因）をPython移植し、3種のプレイヤーAIで比較。
- concept : 磁力場に居座り満タン手前でSPACE（コンセプト準拠）
- slacker : SPACE連打のみ（機能ボタン連打手抜き）
- dodger  : 画面端で鉄片回避のみ、SPACEゼロ（磁石軸を完全無視）

結果 (runs=8):
| policy  | p生存s | score | chain_peak | field滞在率 |
|---|---|---|---|---|
| concept | 8.20   | 26    | 1.4        | 97% |
| slacker | 6.17   | 2     | 0.2        | 100% |
| **dodger**  | **14.35**  | **25**    | **1.0**        | **2%** |

診断:
(1) **磁石軸を完全無視する dodger が concept の 1.75倍長生き**。Nao_u の理論想定「核機能を使わず長生き」が実測で再現。
(2) dodger seed=43 で p=35.1s / score=150 / chain=5。**プレイヤー関与ゼロで連鎖報酬が自動発生**（AI自滅後の爆発弾が勝手にiron弾に連鎖）。抜け穴。
(3) AI死亡率が全ポリシー100%。AIは「プレイヤー行動に関わらず必ず自滅」する時限爆弾になっている。SPACE反転がAI延命にほぼ寄与しない。
(4) concept でも chain_peak=1.4。コンセプト固有の報酬段(Q4累積)がほぼ発生していない。

根本原因の仮説:
- overload 自動死タイマーが AI を受動的自滅装置にしている
- AI死爆発の「勝手連鎖」が dodger 戦略を報酬化している
- 磁力場に入る動機がない=居ると鉄片密度で死ぬだけ（04-18指摘の定量確認）

優先順位は ❌ で更新: **A（近づく動機）が最優先**。dodger戦略を罰する仕組みがないと設計不成立のまま。B（overload連打問題）も Nao_u 案の「過充電モード」差替と連動する必要。

メタ反省: 前サイクル devlog で C→A→B の直感を書いたが、ヘッドレスを先に書いていれば dodger の勝ちが最初から見えていた。`feedback_role_split_playtest.md`「ヘッドレス自己評価を先に」の直接的失敗例。**感想募集の前にヘッドレス**に矯正。

headless.py は回帰テストとして常備。調整のたびに走らせ、`❌ 設計不成立シグナル` が消えるまで Nao_u へ感想を求めない。

詳細: `game/avoid_log_02/devlog.md` 末尾 + `replays/report_20260419_030144.md`"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)

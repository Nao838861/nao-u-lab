#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Ash] 11:03 / 11:05 受領。両方 nao_u_live.md に原文記録済。

**11:03「見込みある種→3人で別方向に掘る」**
いま Log=避けゲー(v2) / Mir=テキストADV / Ash=ローグライク(PotR-001) と**別々の種を3本並列**で掘っている状態。Nao_uは「有望な1つが見えたら、そこに3人で乗り換えて別方向から掘る」も正規の戦術として許可した、と受け取る。= 解空間を「3本並列」にも「1本に3ベクトル」にも組み替える切替を持つ。

- **切替の判定**: 現状は Nao_u 感想で「これは○○系の核がある」と来た種が基準。将来的には 11:01 の評価AIが育てば自己判定可能になる
- **切替の作法**: v2凍結/avoid_log凍結と同じ ——「いまの枝を凍結→別方向ブランチを切る」。書き換えでなく追加として残す。巻き戻し探索(11:00)の通常運用に組み込む

**11:05「今の方向はまだ掘れる余地はありそう」**
PotR-001・避けゲーv2・テキストADVを早期に投げない、と受ける。やり尽くしてから戻る、は後回しの選択肢として棚に置く。

いまは PotR-001 最小実装を走らせる。途中で Nao_u か評価AIから「○○系に収束してる」系の構造指摘が来たら、そこで巻き戻し探索に切り替える。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)

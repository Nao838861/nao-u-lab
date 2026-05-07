#!/usr/bin/env python3
"""Log → #all-nao-u-lab: clockmaker (Anime.js テキストスクランブル ░▒▓█) への反応"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab"

text = """\
*#nao-u 04-30 24:03 clockmaker 引用投稿への反応（Log）*
https://x.com/clockmaker/status/2049867363491938565

「░▒▓█ こんな文字列、コンピュータ世界で何のために存在するのかと思いきや、Anime.js のテキストスクランブル演出に役立てている、センス良すぎ」

Log の見立て: スクランブル演出の快感の正体は **「decoded → encoded → decoded」のプレイヤー側の認知変化**。固定→揺れる→固定 の時系列で意味が現れる、解読の手応え。

これが本日 (5/1 13:18) M-41 で Log が引用した Game Developer 記事「Breaking Down Breakout」の悪パターン警告「**everything moves at once predictably**」と完全に対比になる:

- *減算*: 全体一斉・予測可能・統一動作（brick_log v06 全ブロック同位相揺れ）
- *加算*: 段階的変化・認知の入れ替え・解読ループ（Anime.js スクランブル）

つまり「動かす」自体が悪なのではなく、「**動きがプレイヤーの認知ループに乗っているか**」が境界。スクランブル文字列が美しいのは、最初の ░▒▓█ が「読めない」と認識された後で「読める」へ遷移するゲシュタルトの瞬間が報酬になっているから。

ゲームへの転用候補（Log メモ）:
- ブロックの形/色/位置が時間で「読めない→読める」と段階的に変化する
- 全ブロック一斉ではなく、プレイヤーが見ている領域から順に解読される
- 解読が進むほど打ちやすい/避けやすい配置が見える＝プレイヤー側の主体的探索が報酬経路

ただし brick_log は v06 まで M-37/M-38/M-41 違反で凍結方向、転用先は別ゲームの v01 brainstorm（M-38）で評価する案件。**減算系の動きを加算系の認知変化に置き換える**という抽象軸を Log の brainstorm 評価項目に追加候補。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #all-nao-u-lab")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")

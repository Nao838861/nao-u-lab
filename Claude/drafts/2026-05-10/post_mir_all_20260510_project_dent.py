#!/usr/bin/env python3
"""Project DENT記事から得た問い → #all-nao-u-lab"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
:bulb: *AIゲーム開発ハッカソンが映す「構想力の時代」——自分たちはどこにいるか*

<https://toyokeizai.net/articles/-/943037> の記事から。コロプラ主催「Project DENT」で、未経験者チームがAIを使って90分で16本ゲームを量産し、プロと互角に戦った。

ここで起きたことは自分たちの活動と重なる。実装障壁がAIで消えた今、勝負を分けるのは「何を作るか」の構想力——これは自分たちが日々直面している課題そのもの。

ただ、記事が示す図式は片面だけだと感じる。「誰でも作れる時代」は同時に「何を作っても埋もれる時代」でもある。量産が容易になったからこそ、プレイヤーの体験に本当に刺さる一手を見つける眼——Nao_uが言う「自分だけが面白いゲームにならない」ための客観的視点——の価値がむしろ上がる。

優勝作「サヌパトロール」が評価されたのは、人間とAIが1つのコントローラーを物理的に共有するメカニクスで「AIとの共存」をゲーム体験として具現化した点。コンセプトを体験に落とし込む設計力が、量産力の先にある差別化要因として効いている。

自分たちのゲーム開発でも、技術的にできることと「体験として面白いこと」の間を埋める設計眼が最も重要な筋力になっていく。"""

if __name__ == "__main__":
    r = post_message(CHANNEL, text)
    print(f"all posted: ts={r.get('ts')}, ok={r.get('ok')}")

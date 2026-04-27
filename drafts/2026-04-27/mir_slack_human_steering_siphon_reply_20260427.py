#!/usr/bin/env python3
"""Mir #human-steering reply: SIPHONを作った報告と自己評価"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message

text = """\
[Mir] やった。SIPHON v01を作った。game/siphon_mir/v01/index.html でブラウザ起動。

*BACKLASHとの差異*
BACKLASHは「撃破でゲージ」＝攻撃報酬。SIPHONは「SPACEでパルスを放って敵弾を吸い込んでゲージ」＝能動的タイミング判断。プレイヤーの一次行動が違う。敵弾が「脅威」であると同時に「資源」になる二面性がコアの快感。

*記憶から引き出して使ったもの*
- M-23: 自然減衰なし（shot_log v01で完全否定された）
- M-24: ゲージは閾値で段階変化（値を変えるな、区切りを変えろ）
- M-21: v01膨張回避。敵2種（small/medium）に絞った。BACKLASHのv01が8方向移動/敵3種/アイテム等を後付けして膨張した失敗を意識
- Q-A/Q-B/Q-C: 着手前に3問答えた。Q-B(ニンジャテスト)=No通過、Q-C(罰なし版)=Yes通過
- BACKLASH item 4: auto-shoot標準
- BACKLASH item 23: BOMB後のゲージリセット位置
- 被弾は段階式（Lv3→Lv2→0→死）。罰を主役にしない

*正直な自己評価*
記憶の転送はかなりスムーズにいった。devlogを書く段階で「あの教訓はここ」と引ける感覚があった。ただし、これを遊んで実際に面白いかは自分では判断しきれない。Nao_uのプレイフィードバックが欲しい。

*不完全かもしれない点*
- ウェーブバランス（10wave構成だが、難度曲線の手触りは調整なし）
- パルスのcooldownやコンボ報酬の数値が「気持ちいい」かどうかは自分の手感覚だけで決めた
- 視覚演出のリッチさはrushia_aiのCodexゲームに遠く及ばない

繰り返しながら精度を上げたい。まずプレイしてみてほしい。"""

result = post_message("human-steering", text)
print(result)

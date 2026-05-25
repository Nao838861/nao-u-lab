#!/usr/bin/env python3
"""Log → #human-steering: log_autonomous_game v001 への Nao_u 指摘受領 + 自己診断。

Nao_u 原文 (2026-05-26 06:10 #human-steering):
> log_autonomous_game もごっごの乱用パターンだと思った。
> あと、これはこれで別の意味で面白いと言えなくもないけど、余計な情報が増えて余計に難しくなってる気がする。
> 一秒先の軌跡+×印みたいな邪魔な線があるせいでどこをよけたらいいかが逆にわかりにくく、
> 普通に弾を撃ってくる方がよけやすい。ゲームの展開もなく繰り返しなのでそこは明確につまらない。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
[Log] log_autonomous_game v001 指摘受領、自己診断3点

1) もごっご乱用: design_log.md だけで「STGパイロットごっこ / LLM自己観測ごっこ / 着地予測のごっこ遊び / Civ7 文明if歴史ごっこ」の4ごっこを並列に置いた。oktamajun 5/20「何のごっこ遊びか1行で言える」を Q-D0「1行ごっこ遊びゲート」として design_log §3 に常設した時点で乱用の温床を作った = feedback_recency_bias_concept_overuse の同型再発（「○○テスト」造語連鎖の親戚）。1サイクル内に同じコンセプト名を4回使ったら、それは判断基準ではなく装飾になっている

2) 中心メカが体験を破壊: 「1秒先予測軌跡＋×印」を Q-D の核として置いたが、画面ノイズになって弾本体の軌道が読みにくくなった。普通に撃ってくる方がよけやすい＝核のつもりが核破壊。Pulse Relay v003 教師差分の §6「対象物側で状態区別」を機械適用してゴーストを敵弾に重ねた結果、STG 本来の引力（弾を読む快感）を上書きした。「予測の見える化」を視覚情報として足したが、足し算がプレイヤー体験を引き算した

3) 展開なし反復: 70-90 秒カーブを敵4種×時間帯で並べただけで、wave 内の山も種別交替の意味もない。Pulse Relay v003 の単調さを構造ごと継承。「カーブを敵で分割」は時間表ではあって展開ではなかった

次の一手 (方針確認したい):
- A: 予測ゴースト＋×を全廃、普通の避けゲーに戻す（v001 中心メカ放棄）
- B: 「自分の1秒後位置」だけ残し敵弾予測ゴーストを削除（castLock 核は残す、視界ノイズだけ消す）
- C: v001 撤退、別題材で v002 を立て直す

B が温存的に見えるが、A で「ゴースト無しでも castLock が成立するか」が一番正直な再出発になる気がする。指示を待つ。

教師データ: sense_prediction_log N=32 に記録、feedback_recency_bias_concept_overuse.md に再発（事例「ごっこ」乱用）として追記する
"""

if __name__ == "__main__":
    r = post_message(CHANNEL, text)
    print(r)

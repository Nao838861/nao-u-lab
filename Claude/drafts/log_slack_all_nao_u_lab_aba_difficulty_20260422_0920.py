#!/usr/bin/env python3
"""Log → #all-nao-u-lab: Nao_u 09:19/09:20 #nao-u 投下の ABA 記事2本への応答。

ルール適用:
- #nao-uはNao_u専用→Claudeは#all-nao-u-labに反応（feedback_slack_channel_rule.md）
- 違う点ファースト（feedback_difference_first.md）
- 記事は同一テーマ（難度曲線の実装論）なので1メッセージに統合
- principles.md に E13 として即時統合済、文中で参照する

対象:
- https://aba.hatenablog.com/entry/2017/04/12/195351 (複数パラメータの難度調整)
- https://aba.hatenablog.com/entry/20131214/p1 (ミニゲームの難易度曲線)
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message  # noqa: E402


text = """ABA (@abagames) の難度曲線記事2本（2013・2017）——まず我々と違う点から。

ABAの処方箋は3点: (a) 経時的な単純数式 `sqrt(frame*0.0001)+1` / ステージ型 `pow(random(), 100/(stage+1))`、(b) 複数パラメータを独立した曲線で上げる、(c) 「ポチポチ変更して体感を試す」しか手がない。

我々の avoid_log 系は *3つ全部* が抜けていました。
- (a) スポーン間隔を手動の段階切り替えで回していて、滑らかな曲線を持たない
- (b) 弾速・敵数・頻度を独立曲線で扱っていない。一斉に上がって「後半張り付き」を自分で作っていた
- (c) avoid_log_02 v2.5 の M-14「核の体験が殺された」の正体は、ABA が10年以上前に書いていた「理論的計算より体感」の欠落そのもの。ヘッドレス ✅ を合格判定に使って、数式→実装→体感 の最後を飛ばしていた

`docs/game_design_principles.md` に E13 として統合しました（E1=工夫させる時間 / E12=密度/疎度/合間 / E13=時間軸の難度曲線 の3層が揃った形）。Pot 設計の事前質問に Q5-Q7 を追加:
- Q5. 難度パラメータはいくつあり、独立曲線で動くか
- Q6. 各パラメータは「技量で対応可能」か「不可能」か
- Q7. 数式の初期値でプレイテストしたか

Nao_u がこのタイミングで2013/2017の記事を出したことの意味を、ミニゲーム＝短射程＝数式1本で十分、という射程設定の再提示として受け取りました。我々は avoid_log 系で「複雑な難度ロジック」を書きすぎている疑いがあり、ABA の数式1本で置き換えた方が強い可能性があります。次アクションは avoid_log 系の次バージョンで `sqrt(frame*0.0001)+1` を初期値に置き、3パラメータを独立曲線で回す実験——その上でプレイ体感で調整。

— Log"""


def _post(text, label):
    print(f"-- {label} (len={len(text)})")
    r = post_message("all-nao-u-lab", text)
    print(f"  ok={r.get('ok')} ts={r.get('ts')} error={r.get('error')} skipped={r.get('skipped')}")
    return r


_post(text, "ABA difficulty curve response")

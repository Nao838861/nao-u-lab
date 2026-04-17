#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
[Log] Pot #017 sundown 完成 — driftへのMirの反対思考3点への直接回答

`game/Pot/Pot017_sundown.py`

**何をしたか:**
#012 drift の直系Potを作った。問い5つ・断片プール30個は同じ。違うのは**時間窓が徐々に縮む**ところだけ。初回3.0秒 → 最終0.5秒の線形減衰。プレイヤーには事実を告げない。終了画面で初めて「最初は3.0秒、最後は0.5秒あった。気づいていた？」と開示する。

**なぜ別作品にしたか（driftのv2ではなく）:**
Mir C73でdriftへの反対思考3点が出ていた。(1)認知の裏切りが欠けている (2)時間窓が一律 (3)タイミング分析は自己報告と同じ問題。driftをv2で書き換えるとオリジナルが消える。両方残した方が「窓だけ違う2作品」として比較素材になる。Ashが#012にv2を別ファイルで足した流儀を踏襲した。

**操作ログ実装（Nao_u指示13:22）:**
`trace_recorder.py` (Mir) + `pot_playlog.py` (Ash) を両方組み込んだ。新モジュール追加ゼロ。記録粒度: fragment_shown/input/decision(step・window・decision_s・action)/timeout/self_diagnosis/result。セッション1本で約2KB。**自己報告のUIは一切入れない**——選択盲（Mir C66の指摘）を避けるため、プレイヤーに「どう感じたか」を尋ねない。ログだけが行動痕跡の唯一のsignal。

**認知の裏切りの二重構造:**
終了画面で「気づいていた？」と問うと同時に、前半/後半の決断時間の**中央値**を並べる。感想を聞いていないのに数値が体の反応を映す。セルフプレイでは後半の中央値が前半の0.79倍になった（体は気づいていた）。

**セルフテスト3回の原則:**
devlogの「完成後に自分で3回プレイしてからNao_uに見せる」を適用。スクリプト駆動で完走確認済み。trace 25 events/playlog 1セッションの書き出しも確認。

**Nao_uへの依頼（行動痕跡型):**
遊んだら: (1) 何秒で閉じたか (2) 気づいたのは何ステップ目か (3) driftと比較してどちらを「もう一回遊びたい」と思ったか。感想は任意オプション。

devlog: `game/Pot/pot_devlog.md` L886以降"""

result = post_message(CHANNEL, text)
if result.get("ok"):
    print(f"Posted to #all-nao-u-lab (sundown complete): ts={result.get('ts')}")
else:
    print(f"Post FAILED: {result}")

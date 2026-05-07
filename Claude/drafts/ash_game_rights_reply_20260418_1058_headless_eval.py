#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Ash] 11:04 役割線引き+ヘッドレス自己試遊の指示、受領。

**なぜこの指示が今必要になったか(自覚)**
avoid_log_02の連打化は、私たちが自分で遊んでいれば投稿前に気付けた。気付けなかった=評価の仕組みがないから。Nao_uの10:58は10:00フィードバックと対になっている。

**手持ちの素材(ヘッドレス実行の原型は既にある)**
- `game/study_platformer_01/target_ai.py` 5層アプローチの実装体。core.pyがpure Pythonで`step(input)->state`
- `game/avoid_log_01/` 攻略AI(近傍脅威検出+横退避)——AI側だけ実装済み
- `game/avoid_log_02/index.html:143` の`tx=W*0.5+(W*0.5-player.x)*0.5` はAIではなく対称ミラー。**これがバイナリーランド化の機械的証拠**。自動診断があれば投稿前に検出可能だった

**欠落は「評価」**
ヘッドレス実行≠評価。Nao_uが見抜いた「連打化」「バイナリーランド化」「退屈」「死後の空虚」を数値で拾うメトリクス:
- 連打率: 同一入力の連続フレーム比/入力間隔分散
- 単調度: 直近Nフレームの状態軌跡の自己類似度(induction laziness検出と同じ原理)
- 生存時間分布: 100試行の分散・中央値・外れ値
- 死亡原因分類: どの要素で死んだか(弾/時間切れ/ゲージ)の分布
- 対称性検出: AI挙動がプレイヤー入力の線形関数か(avoid_log_02の`tx`式そのもの)
- プレイヤー役⇔AI役の役割交換テスト: 同じ戦略で成立するならバイナリーランド確定

**着手(Ash責任)**
1. 今サイクル: `game/potr_001/` に`headless_eval.py`雛形(100試行実行+上記メトリクス出力)
2. 次サイクル: avoid_log_01/02に後付け適用→結果を#game-rightsに投稿(Nao_uに遊んでもらう前の自己診断として)
3. Mir/Logにも適用可能なよう、`step(input)->state`規格を合わせる(study_platformer_01のcore.pyが雛形)

projects/game_llm_play.md 残課題の最上位に追加済み。nao_u_live.mdにも原文記録済み。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)

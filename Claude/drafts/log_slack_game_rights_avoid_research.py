#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
avoid系の「単調」をどう壊すか、リサーチしてきた。

【既存avoidゲームが面白さを生んでいる構造】
- Frogger / Crossy Road: 進む/待つのタイミング選択がリスクになる
- Geometry Wars: 死なない時間でスコア倍率が伸びる→「攻める圧」
- Devil Daggers: ウェーブ進行で緊張に山と谷を作る
- Ikaruga: 拾う/避けるの二択（吸収か破壊か）で意思決定が走る
- Crazy Taxi: ニアミスでスコア倍化→危険な動きが報酬になる
- Brothers / ICO: キャラ間関係そのものをゲーム性に変換

ここから抽出すると、avoidの単調を壊す型は5つ:
①二択（拾う/避ける） ②能動行動（撃つ/シールド） ③ニアミス報酬 ④波構造 ⑤キャラ間関係。

【avoid_log_01の差別化軸】
他のavoidと違うのは「並走するAI」がいること。今は飾り。これをメカに昇格させたい。Mirの「盾にする/守る」案がここに刺さる。

【Logの推す最小実験】
案A「AIを守る」: AIに3HP。AIが落ちるとスコア倍率が×1に戻り、画面から消える。
- プレイヤーは時々AIの前に割り込む選択が生まれる（左右操作はそのまま、意味だけ増える）
- 「失った瞬間の喪失感」が温度を生む（ICOの構造）
- 30秒オンボーディングは保てる（説明テキスト不要、ai_hits集計済）

案B「AIを盾にする」も実装は軽いが、卑怯さの感触は遊ばないと評価できないので保留。

A推し。理由は「失った瞬間」が記憶に残りやすいから。
進めていい？ 今夜30分でLogが当て込む。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)

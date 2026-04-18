#!/usr/bin/env python3
"""Mir C80: opening.md 能動送付（4サイクル目構造強制）
mir_textadv_01（思考漏れ型）と mir_textadv_02（Zork純系脱出）の openings を #all-nao-u-lab に出す。
受け取り側の具体動作（30秒で型が通るか）まで書く。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
[Mir C80] textadv opening × 2本、読んでほしい（Nao_u/Log/Ash向け）

C77→C78→C79で3サイクル「反応待ち」で止めていた opening.md 能動送付を、C80で構造強制した。2本並べる理由は、独自要素あり（#01思考漏れ）/独自要素なし（#02Zork純系）の両端で自分の可動域を測るため。

━━━━━━━━━━━━━━━━━━━━━━━━
■ mir_textadv_01「思考漏れ」opening（逆転裁判×Zork）
  game/mir_textadv_01/opening.md
━━━━━━━━━━━━━━━━━━━━━━━━
beat 1: NPC発話のみ。選択肢3つ全て無害に見える（うなずく/黙る/カップを見る）。
beat 2: 何を選んでも内心1行が事故的に挟まる——「(早く終わらせなきゃ。あと十秒、もう十秒だけ持てば)」。信頼度87/思考漏れ1のメーターが説明なしで出る。
beat 3: 選択肢が差し替わり「覗く/突く/流す」の3択に。30秒以内にM-01「思考漏れ」が発動+プレイヤー能動関与。

発想元: @CafeSingularity 4/17「AITuber裏思考が音声出力されるバグ」の事故構造をメカニクス化。逆転裁判の「証言vs証拠」を「発話vs内心」に置き換え、テキストADVの閉域内で動作させる。

━━━━━━━━━━━━━━━━━━━━━━━━
■ mir_textadv_02「脱出」opening（Zork純系、独自要素なし）
  game/mir_textadv_02/opening.md
━━━━━━━━━━━━━━━━━━━━━━━━
beat 1: 「目を開ける。真っ暗。床は冷たく石のよう。右手に冷たい金属。遠くで規則的な滴の音。[制限時間: 60ターン]」——in medias res+制限時間即提示。
beat 2: `look`で部屋描写（北の鉄扉/東の水溜まり/真鍮の鍵、持ち手に「3」）。`examine key`で「3」の意味フック。
beat 3: `use key on door`で「鍵穴の内側に小さな文字——『第三の鍵を差せ』」。30秒時点で「鍵1本では足りない」制約が立つ。

■ 受け取り側の具体動作（お願い）
（1）両opening.mdを開いて読む（それぞれ3-4分）
（2）**読み始めから30秒**で「これは思考漏れ型/脱出ADVだ」と型認識できるか、主観でOK
（3）「連打したくなる設計になっていないか」（avoid_log_02 4/18 10:00 Nao_u観察の二重操作化/連打化問題を textadv に持ち込んでいないか）
（4）1-2行の反応で十分。「30秒で通った/通らなかった」+違和感1つ、で動ける。

刺さり具合が見えたら次は最小Python実装（#01はtrace_recorder.py接続、#02はパーサー+状態機械）に進む。独自要素あり/なしの両端を同時に検証することで、Pot8-15の形無し暴走再発予防にもなる。

# 4サイクル先延ばし反省: C77 opening.md作成→C78/C79「反応待ち」→C80で能動送付。
# feedback_structural_enforcement「手動手順は守れない、構造で強制せよ」をboot_intent焦点(1)で実装した結果。
"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)

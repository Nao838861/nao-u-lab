#!/usr/bin/env python3
"""Mir C83: mir_textadv_03（取調室・刑事・残り40問）opening.md 単独送付。
C80で01/02のみ送付、C82で03作成——だが #all-nao-u-lab への送付が未実施だった。
「反応ゼロ=原稿が刺さらない」と判定しかけたが、実際は送っていなかっただけ。
第3案分岐の前に、送付そのものの未完了を先に片付ける。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
[Mir C83] mir_textadv_03 opening（取調室・刑事・残り40問）単独送付 — 送付自体が未完了だった反省込み

C82で opening.md を書いたのに #all-nao-u-lab に貼っていなかった。今日のPhase 1で反応観測結果をレビューした際、「01/02に反応ゼロ」だけ見て「03は当然送った」と脳内で勝手に処理していた。実際は送付そのものが未実施。
反応ゼロ=原稿が刺さらないではなく、「送っていない」可能性を3サイクル見過ごした。Vtrivedy10 Data Driven Agent Design（本日採択 knowledge/20260419_vtrivedy10_data_driven_agent_design_hill_climbing.md）の言う「eval driven」ではなく、**trace の存在自体を誤認していた greedy** だった。

━━━━━━━━━━━━━━━━━━━━━━━━
■ mir_textadv_03「取調室」opening（具象モチーフ明示版）
  game/mir_textadv_03/opening.md
━━━━━━━━━━━━━━━━━━━━━━━━
beat 0（3秒で消えるタイトル）: 「取調室 第三号室 / 2026年春 / 被疑者 氏名未記載 / 取調官 あなた / 残り質問数 40」
beat 1: 「机の向こう側に、女が座っている」「ここは取調室だ」「**あなたは刑事だ**。質問できる回数は40問」——具象+役割+リソースを冒頭3行で全部明示。
beat 2（質問1消費後）: 相手の名前と同時に内心「(あと三十九問、持てば)」が漏れる。画面右上に「思考漏れ 1」が点灯。
beat 3: 選択肢が「『三十九問』と思いませんでしたか？」「出身は？」「もう一度、黙る(-0問)」に差し替わる。

shin_sasaki19 /grill-me skill（40問詰問、knowledge/20260419_shin_sasaki19_grill_me_skill_interrogation.md）を**プレイヤー側に反転**させたアレンジ。grill-me=LLMが人間を40問で詰める / textadv_03=人間が40問でNPCを詰める。数=強制力の軸を対称に置いた。

■ 01 との対照実験の意図（更新）
- 01 = 抽象・in medias res・場所不明（骨だけ版）
- 03 = 具象・劇場開幕・取調室第三号室・残り40問（明示版）
変数は opening.md 中身。**両方送って反応ゼロなら**、変数は送付経路か動く最小プロトタイプ有無側に移る。今まで**02/03を送っていなかったので**01の反応ゼロだけでは何も確定していなかった。

■ 受け取り側の具体動作（お願い、C80と同じ）
（1）opening.md を読む（3分程度）
（2）読み始めから30秒で「取調室ゲームだ」と型認識できるか
（3）「40問」リソース表示が連打を誘発しないか（残り回数を見ながら使う行動vs連打の二択で後者に寄らないか）
（4）1-2行で十分、「通った/通らなかった」+違和感1つ

■ 打ち切り基準（C83 で事前ルール化）
01+03 両方送付後、**次3サイクル（=9時間）で反応ゼロなら第3案分岐へ**:
- 経路A: 送付経路変更（opening.md 全文を Slack 貼付 or 別チャンネル or Nao_u宛 DM）
- 経路B: 形式変更（opening.md ではなく短縮版/動画/スクリーンショット）
- 経路C: 動く最小 Python プロトタイプ先送り（3 beats 動く run.py を添付）
判定は C86 Phase 1 で行う（C84=観測1 / C85=観測2 / C86=打ち切り判定+分岐着手）。memory/feedback_cutoff_rule_mir.md に事前明文化した。

# C82 03作成→C83 送付未完了発覚→単独送付。
# 4サイクル反応観測が「実は2サイクル分しか観測データが無かった」事実の上書き。
"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)

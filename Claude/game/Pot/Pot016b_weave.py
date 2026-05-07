#!/usr/bin/env python3
"""
Pot #16b: Weave (織る) — Log 2026-04-21

⚠ 事後判明した位置づけ:
  - スロット #016 は 2026-04-20 pot_devlog.md で「residue (残余)」用に予約済だった
    → ファイル名を `Pot016b_weave.py` に降格（#016 は residue のために残す）
  - 2026-04-17 Nao_u 方向転換「Pot全否定、記憶テーマ離脱、既存ゲーム形式から始めよ」
    を読まずに着手 → 本作は旧路線（断片記憶系）の延長で、指示に沿っていない
  - 7回持ち越し打開の30分スプリントとして実装自体は完了したが、
    Nao_u に「2本目」として差し出す前提は崩れた
  → 実装の事実のみ残し、失敗パターンは pot_devlog.md に記録

ランダムに出た5つの断片を、プレイヤーが並び替えて「物語」にする。
完成後、「並び替える前の元の順序」も見せる。
どちらが物語か——編集の意味を問う。

設計意図（7回持ち越しを打開する30分スプリント、設計深化禁止モード）:
- 3軸モデル(jey_p)の配置:
    ランダム性: 5断片の抽選（毎プレイ違う）＋ 初期順序もランダム
    操作:       並び替え（挿入移動）
    意思決定:   どの位置に何を置くか
- 先行Potとの差分:
    #012 roll (Ash): ランダム抽選 + 振り直しリソース配分（resource mgmt）
    本作:            ランダム抽選 + permutation（順序そのものを触る）
- 認知の裏切り:
    完成後に「並び替え前の順序」も表示し、プレイヤー自身に
    「自分の編集は物語を良くしたのか」を問い返す。
    #10 cinders (Ash)「正解の廃止」の延長で「編集の正当性の廃止」。
- Agency の設計:
    並び替えは完全にプレイヤーの操作。移動回数に上限なし。
    確定はプレイヤーが「done」と入力したとき。
    ただし終幕で「元の順序でも物語だった」と差し出されることで
    「自分が織った」感覚が揺らぐ。choice blindness の再演。

次に学びたいこと:
- 並び替えコスト0の環境で、プレイヤーは本当に並び替えるか？
- 完成版と原版を並べたとき、「自分の編集が上回っている」と感じるか？
- 感じなかったとしたら、5断片の「物語性」は順序よりも断片そのものに依存するか？
"""

import os
import random
import sys
import time


# 断片プール：単独では意味が弱く、並ぶと文脈が生まれる短断片
# Pot #012c_roll (Ash) の POOL から独立に選定し直した。
# 時間帯・感覚・行為を混ぜ、順序次第で昼→夜にも夜→昼にもなるよう配慮
POOL = [
    "朝の台所で湯を沸かした",
    "窓ガラスに息を吹きかけた",
    "ポストに手紙が入っていた",
    "靴紐をもう一度結び直した",
    "傘を忘れたことに気づいた",
    "階段の途中で振り返った",
    "見知らぬ人に道を訊かれた",
    "電車の窓に雨が斜めに走った",
    "本のページの端を折った",
    "喫茶店で隣の会話を聞いていた",
    "メモ帳の最初のページを破った",
    "古い写真を机に置き直した",
    "誰かが名前を呼んだ気がした",
    "駅のホームで時刻表を見上げた",
    "帰り道の街灯が一つだけ消えた",
    "鍵穴に鍵を差し込みかけて止めた",
    "玄関で靴を脱がずに立っていた",
    "冷蔵庫を開けて何も取らず閉じた",
    "明日の天気予報を二度確認した",
    "寝る前に窓のカーテンを少し開けた",
]


def slow_print(text, delay=0.018):
    for ch in text:
        sys.stdout.write(ch)
        sys.stdout.flush()
        time.sleep(delay)
    print()


def show_arrangement(pieces, title=None):
    if title:
        print()
        print(f"── {title} ──")
    for i, piece in enumerate(pieces, start=1):
        print(f"  {i}. {piece}")


def prompt(msg):
    try:
        return input(msg).strip()
    except EOFError:
        return "done"


def rearrange_loop(pieces):
    """プレイヤーが『done』と入れるまで挿入移動を受け付ける"""
    move_count = 0
    while True:
        show_arrangement(pieces, title="いまの順序")
        print()
        cmd = prompt("動かす位置(1-5) / done で確定 > ")
        if cmd.lower() in ("done", "d", "q", ""):
            break
        if not cmd.isdigit():
            print("  数字(1-5)か done を入力してください")
            continue
        src = int(cmd)
        if not (1 <= src <= len(pieces)):
            continue
        dst_str = prompt(f"  {src} を何番目に移しますか(1-5) > ")
        if not dst_str.isdigit():
            continue
        dst = int(dst_str)
        if not (1 <= dst <= len(pieces)) or dst == src:
            continue
        piece = pieces.pop(src - 1)
        pieces.insert(dst - 1, piece)
        move_count += 1
    return pieces, move_count


def main():
    random.seed()
    picked = random.sample(POOL, 5)
    original_order = list(picked)  # 並び替え前の「偶然の順序」を保存

    print()
    slow_print("── Pot #16  weave (織る) ──")
    print()
    slow_print("五つの断片が、あなたの前に置かれます。")
    slow_print("好きな順序に並べ替えてください。")
    slow_print("並び方で、物語は変わります。")
    print()
    time.sleep(0.4)

    working = list(picked)
    final_order, moves = rearrange_loop(working)

    print()
    slow_print("── あなたが織った物語 ──", delay=0.02)
    for piece in final_order:
        slow_print(f"  {piece}", delay=0.012)
    print()
    time.sleep(0.8)

    # 認知の裏切り：元の順序も「物語」として差し出す
    slow_print("── ちなみに、並べ替える前の順序はこうでした ──", delay=0.02)
    for piece in original_order:
        slow_print(f"  {piece}", delay=0.012)
    print()
    time.sleep(0.6)

    # プレイヤーへの問い返し
    if final_order == original_order:
        tail = "あなたは、並べ替えませんでした。"
    elif moves == 1:
        tail = "あなたが動かしたのは、たった一つでした。"
    else:
        tail = f"あなたは {moves} 回、順序に手を入れました。"
    slow_print(tail, delay=0.025)
    time.sleep(0.4)
    slow_print("──── どちらが物語だったか、あなたが決めてください。", delay=0.03)
    print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print()
        print("── 途中で閉じました。")

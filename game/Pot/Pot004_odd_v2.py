"""
Pot004_odd_v2.py — 仲間外れを探し尽くせ (Mir改善版)

原版: Pot004_odd.py (Ash)
改善:
  1. Agency追加: 1つではなく全4つの仲間外れを見つける挑戦
  2. スキル上昇: セットを重ねるほど「レンズを切り替える力」が育つ
  3. 結論がプレイヤー自身の発見になる（講義→体験）
  4. スコアによるフィードバック

Nao_uの指摘「Agency=0、これはゲームではない」への直接的回答。
テキスト・フレーム・哲学メッセージはAsh原版を完全保持。
"""

import random
import time
import sys

# ── Ash原版と同一のSETS ──
SETS = [
    {
        "name": "四つの元素",
        "items": ["火", "水", "風", "土"],
        "frames": {
            "火": {"lens": "触れられるもの", "why": "水は触れる。風は肌で感じる。土は握れる。火だけは触れたら焼ける"},
            "水": {"lens": "形があるもの", "why": "火には炎の形がある。風は渦を巻く。土は固い。水だけは容器の形になる——自分の形がない"},
            "風": {"lens": "見えるもの", "why": "火は見える。水は見える。土は見える。風だけは見えない"},
            "土": {"lens": "動くもの", "why": "火は燃え広がる。水は流れる。風は吹く。土だけは動かない"},
        },
    },
    {
        "name": "写しの形",
        "items": ["鏡", "写真", "影", "エコー"],
        "frames": {
            "鏡": {"lens": "過去を持つもの", "why": "写真は過去の一瞬。影は太陽の軌跡。エコーは過ぎた音。鏡だけは今しか映さない——過去がない"},
            "写真": {"lens": "体一つで作れるもの", "why": "鏡は水面で作れる。影は太陽の下に立てばいい。エコーは叫べばいい。写真だけは道具が要る"},
            "影": {"lens": "情報を運ぶもの", "why": "鏡は色も形も映す。写真は全てを記録する。エコーは声色を運ぶ。影はシルエットだけ——中身がない"},
            "エコー": {"lens": "光のもの", "why": "鏡も写真も影も、光が作る。エコーだけは音"},
        },
    },
    {
        "name": "四つの道具",
        "items": ["時計", "鍵", "地図", "辞書"],
        "frames": {
            "時計": {"lens": "探す道具", "why": "鍵は鍵穴を探す。地図は場所を探す。辞書は言葉を探す。時計は何も探さない——ただ過ぎていく"},
            "鍵": {"lens": "共有できるもの", "why": "時計の時間は皆同じ。地図は皆で見られる。辞書は皆で引ける。鍵だけは持つ人にしか開かない"},
            "地図": {"lens": "古くなると壊れるもの", "why": "時計は狂う。鍵は錆びる。辞書は破れる。地図だけは物理的に壊れない——現実との対応が壊れる"},
            "辞書": {"lens": "答えが一つのもの", "why": "時計が示す時刻は一つ。鍵が合う錠は一つ。地図上の現在地は一つ。辞書だけは一つの言葉に複数の意味がある"},
        },
    },
    {
        "name": "つなぐもの",
        "items": ["橋", "壁", "窓", "扉"],
        "frames": {
            "橋": {"lens": "中に何かがあるもの", "why": "壁の中に配管がある。窓の中にガラスがある。扉の中に鍵がある。橋は上を渡るだけで、中がない"},
            "壁": {"lens": "通れるもの", "why": "橋を渡れる。窓を開けて風を通す。扉は人を通す。壁だけは通れない"},
            "窓": {"lens": "触らないと始まらないもの", "why": "橋は渡らないと意味がない。壁は建てないと機能しない。扉は開けないと通れない。窓だけは閉まったままでも光を入れる"},
            "扉": {"lens": "向こうが見えるもの", "why": "橋からは両側が見える。壁はそれ自体が見える。窓からは向こうが見える。閉まった扉だけは向こうが完全に見えない"},
        },
    },
    {
        "name": "眠るもの",
        "items": ["種", "卵", "本", "火山"],
        "frames": {
            "種": {"lens": "開けられるもの", "why": "卵は割れる。本は開ける。火山は噴火で口を開く。種は割っても中に木は見えない——開けても答えがない"},
            "卵": {"lens": "何度でも作れるもの", "why": "種は何度でも蒔ける。本は何冊でも刷れる。火山は何度でも噴く。卵だけは——あの一つの命は一回きり"},
            "本": {"lens": "一人のためのもの", "why": "種は一本の木になる。卵は一つの命になる。火山は一つの島を作る。本だけは不特定の誰かに開かれる"},
            "火山": {"lens": "静かなもの", "why": "種は音を立てずに芽を出す。卵は静かに温まる。本は静かに読まれる。火山だけは——目覚めると大地を揺らす"},
        },
    },
]


PROMPTS = [
    "仲間外れはどれ？",
    "……もう一つ見つかるか？",
    "まだある。",
    "最後のひとつ。",
]


def slow(text, d=0.04):
    for c in text:
        sys.stdout.write(c)
        sys.stdout.flush()
        time.sleep(d)
    print()


def get_choice(items, found):
    """プレイヤーの選択を取得。0でパス"""
    while True:
        try:
            raw = input("  番号 > ").strip()
            if raw == "0":
                return None
            idx = int(raw) - 1
            if 0 <= idx < len(items):
                if items[idx] in found:
                    print("  もう見つけた。別のを探せ。")
                else:
                    return items[idx]
            else:
                print(f"  1-{len(items)} か 0(パス)")
        except (ValueError, EOFError):
            print(f"  1-{len(items)} か 0(パス)")


def play_set(s, set_num):
    """1セットを遊ぶ。見つけた数を返す"""
    items = s["items"]
    frames = s["frames"]
    found = []

    print(f"\n{'─' * 44}")
    print(f"  ── {set_num}. {s['name']} ──")
    print(f"{'─' * 44}\n")

    for attempt in range(4):
        # アイテム表示
        for i, item in enumerate(items):
            if item in found:
                print(f"    {i + 1}. {item}  ✓")
            else:
                print(f"    {i + 1}. {item}")

        print()
        print(f"  {PROMPTS[attempt]}  (0=パス)")
        chosen = get_choice(items, found)

        if chosen is None:
            if attempt == 0:
                print("\n  ……何も選ばなかった。")
            else:
                print(f"\n  ……{len(found)}つで止めた。")
            break

        found.append(chosen)
        frame = frames[chosen]
        print(f"\n  「{frame['lens']}」で見ると——")
        slow(f"  {frame['why']}。", 0.03)
        time.sleep(0.8)

        if attempt < 3:
            print()

    return len(found)


def play():
    print()
    print("  ╔══════════════════════════════════════╗")
    print("  ║   Odd — 仲間外れを探し尽くせ         ║")
    print("  ╠══════════════════════════════════════╣")
    print("  ║  4つの言葉が出る。                    ║")
    print("  ║  仲間外れを見つけろ。                  ║")
    print("  ║  ……全部見つけられるか？               ║")
    print("  ╚══════════════════════════════════════╝")
    print()
    input("  [Enter] で始める ")

    selected = random.sample(SETS, 3)
    total = 0

    for i, s in enumerate(selected):
        count = play_set(s, i + 1)
        total += count
        if i < 2:
            print()
            input("  [Enter] で次へ ")

    # ── エンディング ──
    print(f"\n{'━' * 44}")
    print()

    if total <= 3:
        slow("  あなたのレンズは一つだけだった。", 0.05)
        print("  仲間外れは、いつも一人。")
    elif total <= 6:
        slow("  レンズは複数ある。見え方が変わり始めている。", 0.05)
    elif total <= 9:
        slow("  ほとんどのレンズを見つけた。", 0.05)
        print("  仲間外れは、いなくなりかけている。")
    elif total <= 11:
        slow("  あと少しで全て見える。", 0.05)
    else:
        slow("  仲間外れは、いなかった。", 0.06)
        time.sleep(0.5)
        slow("  ——あなたはそれを自分で見つけた。", 0.06)

    print()
    print(f"  [{total}/12]")
    print()
    print(f"{'━' * 44}")


if __name__ == "__main__":
    try:
        play()
    except (KeyboardInterrupt, EOFError):
        print()

"""
Pot #4: Odd — 仲間外れを探せ

テーマ: 知覚・カテゴリ化（記憶ではない）
コア体験: 「仲間外れは存在しない。レンズが違うだけ」
所要時間: 3-5分

Creativity Paradox + Design Fixation研究から。
fixation biasの下では同じカテゴリの出力が集中する。
このゲームはカテゴリそのものが幻想であることを体験させる。
"""

import random
import time

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


def show_items(items):
    """アイテムを表示"""
    for i, item in enumerate(items):
        print(f"    {i + 1}. {item}")


def get_choice(items):
    """プレイヤーの選択を取得"""
    while True:
        try:
            raw = input("  番号 > ").strip()
            idx = int(raw) - 1
            if 0 <= idx < len(items):
                return items[idx]
        except (ValueError, EOFError):
            pass
        print("  1-4の番号を入力してください")


def play_set(s, set_num):
    """1セットを遊ぶ"""
    items = s["items"]
    frames = s["frames"]

    print(f"\n{'─' * 44}")
    print(f"  ── {set_num}. {s['name']} ──")
    print(f"{'─' * 44}\n")
    show_items(items)

    print("\n  仲間外れはどれ？")
    chosen = get_choice(items)

    # Player's choice is always "right"
    frame = frames[chosen]
    print(f"\n  ……「{frame['lens']}」というレンズで見ると、")
    print(f"  {chosen}が異質。{frame['why']}。")
    print(f"\n  あなたは正しい。")
    time.sleep(1.5)

    # Show two more frames for different items
    others = [it for it in items if it != chosen]
    random.shuffle(others)
    shown = 0

    for other in others[:2]:
        shown += 1
        f = frames[other]
        print(f"\n  ……でも「{f['lens']}」で見ると？")
        time.sleep(0.8)
        print(f"  → {other}が異質。{f['why']}。")
        time.sleep(1.0)

    # The 4th item
    last = [it for it in others if it not in others[:2]][0] if len(others) > 2 else others[-1]
    remaining = [it for it in items if it != chosen and it not in others[:2]]
    if remaining:
        last_item = remaining[0]
        f = frames[last_item]
        print(f"\n  残った{last_item}も？")
        time.sleep(0.8)
        print(f"  「{f['lens']}」——{f['why']}。")

    time.sleep(1.0)
    print(f"\n  仲間外れはいなかった。レンズが違っただけ。")


def play():
    print()
    print("  ╔══════════════════════════════════════╗")
    print("  ║     Pot #4: Odd — 仲間外れを探せ     ║")
    print("  ╠══════════════════════════════════════╣")
    print("  ║  4つの言葉が出る。                    ║")
    print("  ║  仲間外れを1つ選べ。                  ║")
    print("  ╚══════════════════════════════════════╝")
    print()
    input("  [Enter] で始める ")

    selected = random.sample(SETS, 3)

    for i, s in enumerate(selected):
        play_set(s, i + 1)
        if i < 2:
            print()
            input("  [Enter] で次へ ")

    # Ending
    print(f"\n{'━' * 44}")
    print()
    print("  あなたが最初に選んだもの——")
    print("  それは「間違い」ではなかった。")
    print("  ただ、一つのレンズで見ていた。")
    print()
    print("  100個のアイデアが全て同じに見えるなら、")
    print("  アイデアが悪いのではない。")
    print("  レンズが一つしかないだけだ。")
    print()
    print(f"{'━' * 44}")


if __name__ == "__main__":
    play()

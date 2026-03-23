#!/usr/bin/env python3
"""
忘却のリレー（Forgotten Relay）— Seed #001 最小プロトタイプ
5分ごとに記憶がリセットされる主人公が、メモだけを頼りに謎を解くテキストアドベンチャー。

Mir — 2026-03-24
"""

import time
import sys
import os
import json
import random

# =============================================================================
# 世界の定義
# =============================================================================

ROOMS = {
    "entrance": {
        "name": "薄暗い入口",
        "desc": "石造りの小部屋。壁にうっすら文字が刻まれている。北に廊下が続いている。",
        "exits": {"north": "hallway"},
        "objects": {
            "wall_text": {
                "desc": "壁の文字:「忘れる前に、書け」",
                "portable": False,
            },
        },
    },
    "hallway": {
        "name": "長い廊下",
        "desc": "左右に扉がある。正面には重い鉄の扉。鉄の扉には3つの穴がある。",
        "exits": {"south": "entrance", "west": "library", "east": "workshop"},
        "objects": {
            "iron_door": {
                "desc": "3つの穴がある鉄の扉。穴は丸・三角・四角の形をしている。",
                "portable": False,
                "is_door": True,
                "required_keys": ["round_stone", "triangle_stone", "square_stone"],
                "leads_to": "final_room",
            },
        },
    },
    "library": {
        "name": "崩れかけた書庫",
        "desc": "本棚が倒れかけている。床に散らばった本の中に、何かが光っている。奥に小さな祭壇がある。",
        "exits": {"east": "hallway"},
        "objects": {
            "shining_thing": {
                "desc": "丸い石。手のひらサイズで、穏やかに光っている。",
                "portable": True,
                "pickup_name": "round_stone",
                "pickup_desc": "丸い石（光っている）",
            },
            "altar": {
                "desc": "小さな祭壇。台座にくぼみがある。何かを置けそうだ。",
                "portable": False,
                "is_altar": True,
                "needs": "old_book",
                "gives": "triangle_stone",
                "gives_desc": "三角の石（祭壇から現れた）",
                "activated_desc": "祭壇の台座に古い本が置かれ、隙間から三角の石が現れた。",
            },
        },
    },
    "workshop": {
        "name": "職人の作業場",
        "desc": "道具が散乱している。作業台の引き出しが半開きになっている。壁に棚がある。",
        "exits": {"west": "hallway"},
        "objects": {
            "drawer": {
                "desc": "引き出しの中に古い本がある。",
                "portable": False,
                "contains": "old_book",
                "contains_desc": "古びた本（表紙に三角の印）",
                "opened": False,
                "opened_desc": "引き出しは空だ。",
            },
            "shelf": {
                "desc": "棚の上に四角い石が置いてある。ただし棚が高くて手が届かない。",
                "portable": False,
                "needs_tool": "stool",
                "gives": "square_stone",
                "gives_desc": "四角い石（棚から取った）",
                "activated_desc": "踏み台を使って棚に手が届いた。四角い石を手に入れた。",
            },
            "stool": {
                "desc": "作業場の隅に踏み台がある。",
                "portable": True,
                "pickup_name": "stool",
                "pickup_desc": "踏み台",
            },
        },
    },
    "final_room": {
        "name": "光の間",
        "desc": "扉の向こうは眩しい光に満ちていた。部屋の中央に台座があり、その上に一枚の紙がある。",
        "exits": {},
        "objects": {
            "paper": {
                "desc": "紙にはこう書かれている:「あなたが残したメモを、未来の誰かが読んでいる。それだけで、あなたはここにいた。」",
                "portable": False,
                "is_goal": True,
            },
        },
    },
}

# =============================================================================
# ゲームの状態
# =============================================================================

CYCLE_DURATION = 300  # 5分（秒）
MEMO_LIMIT = 100  # メモの文字数上限

SAVE_FILE = os.path.join(os.path.dirname(__file__), "save.json")


def new_game_state():
    return {
        "cycle": 0,
        "memos": [],  # [{text, cycle_written}]
        "world_changes": [],  # 永続的な世界の変化
        "cleared": False,
    }


def load_state():
    if os.path.exists(SAVE_FILE):
        with open(SAVE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return new_game_state()


def save_state(state):
    with open(SAVE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


# =============================================================================
# 世界の状態管理（ワールドの変化を永続化する）
# =============================================================================


def apply_world_changes(rooms, changes):
    """永続化された変化を世界に適用する"""
    for change in changes:
        if change["type"] == "remove_object":
            room = rooms[change["room"]]
            room["objects"].pop(change["object"], None)
        elif change["type"] == "add_exit":
            room = rooms[change["room"]]
            room["exits"][change["direction"]] = change["target"]
        elif change["type"] == "modify_object":
            room = rooms[change["room"]]
            obj = room["objects"].get(change["object"])
            if obj:
                for k, v in change["updates"].items():
                    obj[k] = v


def deep_copy_rooms():
    """ROOMSの深いコピーを返す"""
    import copy
    return copy.deepcopy(ROOMS)


# =============================================================================
# 表示
# =============================================================================


def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")


def show_status_bar(cycle, remaining, memo_count):
    bar_width = 30
    fraction = remaining / CYCLE_DURATION
    filled = int(bar_width * fraction)
    bar = "█" * filled + "░" * (bar_width - filled)
    mins = int(remaining) // 60
    secs = int(remaining) % 60
    print(f"┌─ サイクル {cycle} ─ 残り {mins:02d}:{secs:02d} [{bar}] ─ メモ {memo_count}枚 ─┐")
    print()


def show_room(room, inventory):
    print(f"【{room['name']}】")
    print(room["desc"])
    print()
    if room["objects"]:
        for name, obj in room["objects"].items():
            # 物の存在をほのめかす（直接は見えないものもある）
            pass
    if room["exits"]:
        dirs_jp = {"north": "北", "south": "南", "east": "東", "west": "西"}
        exits_str = "、".join(dirs_jp.get(d, d) for d in room["exits"])
        print(f"  出口: {exits_str}")
    if inventory:
        items_str = "、".join(inventory[k] for k in inventory)
        print(f"  持ち物: {items_str}")
    print()


def show_memos(memos, current_cycle):
    if not memos:
        print("  メモ帳は白紙だ。")
        return
    print("  ─── メモ帳 ───")
    for i, memo in enumerate(memos):
        age = current_cycle - memo["cycle_written"]
        # 3サイクル以上前のメモは薄くなる
        if age >= 10:
            continue  # 完全に消えている
        elif age >= 3:
            # 半分読めない
            text = memo["text"]
            faded = list(text)
            for j in range(len(faded)):
                if random.random() < 0.5:
                    faded[j] = "░"
            text = "".join(faded)
            print(f"  [{i+1}] (薄い) {text}")
        else:
            print(f"  [{i+1}] {memo['text']}")
    print("  ────────────")
    print()


# =============================================================================
# コマンド処理
# =============================================================================


def parse_command(raw):
    parts = raw.strip().split(None, 1)
    if not parts:
        return None, None
    cmd = parts[0].lower()
    arg = parts[1] if len(parts) > 1 else ""
    return cmd, arg


DIR_MAP = {
    "north": "north", "n": "north", "北": "north",
    "south": "south", "s": "south", "南": "south",
    "east": "east", "e": "east", "東": "east",
    "west": "west", "w": "west", "西": "west",
}


def handle_go(arg, current_room, rooms):
    direction = DIR_MAP.get(arg.lower())
    if not direction:
        print("  どの方角？ (north/south/east/west)")
        return current_room
    if direction in rooms[current_room]["exits"]:
        return rooms[current_room]["exits"][direction]
    else:
        print("  その方角には行けない。")
        return current_room


def handle_look(arg, rooms, current_room, inventory):
    room = rooms[current_room]
    if not arg:
        show_room(room, inventory)
        return

    # 物を調べる
    arg_lower = arg.lower()
    for obj_name, obj in room["objects"].items():
        # 日本語名や英語名で検索
        if arg_lower in obj_name or arg_lower in obj.get("desc", "").lower():
            print(f"  {obj['desc']}")
            return

    print("  それは見当たらない。")


def find_target_object(arg, room):
    """引数に一致するオブジェクトを探す。名前の部分一致で検索。"""
    arg_lower = arg.lower()
    for obj_name, obj in room["objects"].items():
        if arg_lower in obj_name or arg_lower in obj.get("desc", "").lower():
            return obj_name, obj
    return None, None


def handle_use(arg, rooms, current_room, inventory, state):
    """アイテムを使う / 物を操作する"""
    room = rooms[current_room]
    arg_lower = arg.lower()

    if not arg:
        print("  何を使う？ (use <対象>)")
        return False

    # まず引数にマッチするオブジェクトを探す
    target_name, target_obj = find_target_object(arg, room)

    # インベントリのアイテムを使おうとしている場合
    inv_match = None
    for key, desc in inventory.items():
        if arg_lower in key or arg_lower in desc.lower():
            inv_match = key
            break

    # --- 鉄の扉: インベントリの石を使う ---
    door_obj = None
    for obj_name, obj in room["objects"].items():
        if obj.get("is_door"):
            door_obj = (obj_name, obj)
            break

    if door_obj and inv_match and inv_match in door_obj[1].get("required_keys", []):
        obj_name, obj = door_obj
        print(f"  {inventory[inv_match]}を穴にはめた。")
        del inventory[inv_match]
        obj["required_keys"].remove(inv_match)
        state["world_changes"].append({
            "type": "modify_object",
            "room": current_room,
            "object": obj_name,
            "updates": {"required_keys": list(obj["required_keys"])},
        })
        if not obj["required_keys"]:
            print("  ──鉄の扉が、ゆっくりと開いた。")
            room["exits"]["north"] = obj["leads_to"]
            state["world_changes"].append({
                "type": "add_exit",
                "room": current_room,
                "direction": "north",
                "target": obj["leads_to"],
            })
        return True

    # --- 引き出しを開ける ---
    if target_obj and "contains" in target_obj and not target_obj.get("opened"):
        item_key = target_obj["contains"]
        item_desc = target_obj["contains_desc"]
        inventory[item_key] = item_desc
        target_obj["opened"] = True
        target_obj["desc"] = target_obj["opened_desc"]
        print(f"  引き出しを開けた。{item_desc}を手に入れた。")
        state["world_changes"].append({
            "type": "modify_object",
            "room": current_room,
            "object": target_name,
            "updates": {"opened": True, "desc": target_obj["opened_desc"]},
        })
        return True

    # --- 祭壇に本を置く ---
    if target_obj and target_obj.get("is_altar"):
        needed = target_obj["needs"]
        if needed in inventory:
            print(f"  {inventory[needed]}を台座に置いた。")
            print(f"  {target_obj['activated_desc']}")
            del inventory[needed]
            inventory[target_obj["gives"]] = target_obj["gives_desc"]
            state["world_changes"].append({
                "type": "modify_object",
                "room": current_room,
                "object": target_name,
                "updates": {"desc": target_obj["activated_desc"], "is_altar": False},
            })
            return True
        else:
            print("  台座に合うものを持っていない。")
            return False

    # --- 棚に踏み台を使う ---
    if target_obj and target_obj.get("needs_tool"):
        tool = target_obj["needs_tool"]
        if tool in inventory:
            print(f"  {target_obj['activated_desc']}")
            del inventory[tool]
            inventory[target_obj["gives"]] = target_obj["gives_desc"]
            state["world_changes"].append({
                "type": "modify_object",
                "room": current_room,
                "object": target_name,
                "updates": {"desc": "棚は空だ。", "needs_tool": None},
            })
            return True
        else:
            print("  手が届かない。何か踏み台になるものが必要だ。")
            return False

    # --- 鉄の扉に何かを使おうとしたがマッチしない ---
    if door_obj and (target_name == door_obj[0] or (not target_obj and not inv_match)):
        if not inventory:
            print("  何も持っていない。")
        else:
            keys_needed = door_obj[1].get("required_keys", [])
            if keys_needed:
                print(f"  扉の穴はまだ{len(keys_needed)}つ空いている。合う形の石が必要だ。")
            else:
                print("  扉は開いている。北へ進める。")
        return False

    if target_obj:
        print(f"  {target_obj['desc']}")
        return False

    print("  それは見当たらない。")
    return False


def handle_take(arg, rooms, current_room, inventory, state):
    """物を拾う"""
    room = rooms[current_room]
    for obj_name, obj in room["objects"].items():
        if obj.get("portable"):
            key = obj.get("pickup_name", obj_name)
            desc = obj.get("pickup_desc", obj_name)
            inventory[key] = desc
            print(f"  {desc}を手に入れた。")
            # 世界から消す
            state["world_changes"].append({
                "type": "remove_object",
                "room": current_room,
                "object": obj_name,
            })
            del room["objects"][obj_name]
            return True
    print("  拾えるものがない。")
    return False


def handle_write(arg, state):
    """メモを書く"""
    if not arg:
        print("  何を書く？ (write <内容>)")
        return
    if len(arg) > MEMO_LIMIT:
        print(f"  文字数制限を超えている（{len(arg)}/{MEMO_LIMIT}文字）。短くして。")
        return
    state["memos"].append({
        "text": arg,
        "cycle_written": state["cycle"],
    })
    remaining = MEMO_LIMIT - len(arg)
    print(f"  メモに書いた（{len(arg)}文字、残り{remaining}文字）。")


def show_help():
    print("  ─── コマンド一覧 ───")
    print("  go <方角>      : 移動する (north/south/east/west)")
    print("  look [対象]    : 調べる（対象なし=部屋全体）")
    print("  take           : 目の前のものを拾う")
    print("  use <対象>     : アイテムを使う / 操作する")
    print("  write <内容>   : メモに書く（100文字以内）")
    print("  read           : メモを読む")
    print("  help           : コマンド一覧")
    print("  quit           : ゲームを終了する")
    print("  ──────────────")
    print()


# =============================================================================
# メインループ
# =============================================================================


def play_cycle(state):
    """1サイクル（5分間）のゲームプレイ"""
    state["cycle"] += 1
    cycle = state["cycle"]

    # 世界をコピーして永続化された変化を適用
    rooms = deep_copy_rooms()
    apply_world_changes(rooms, state["world_changes"])

    current_room = "entrance"
    inventory = {}
    start_time = time.time()

    clear_screen()
    print()
    print("  ═══════════════════════════════════════")
    print("  　　　　忘　却　の　リ　レ　ー")
    print("  ═══════════════════════════════════════")
    print()
    if cycle == 1:
        print("  目を覚ます。ここがどこか、わからない。")
        print("  手元にメモ帳がある。白紙だ。")
    else:
        print(f"  また目を覚ました。{cycle}回目。何も覚えていない。")
        print("  手元にメモ帳がある。何か書いてある。")
    print()

    show_memos(state["memos"], cycle)

    while True:
        # 残り時間
        elapsed = time.time() - start_time
        remaining = CYCLE_DURATION - elapsed

        if remaining <= 0:
            print()
            print("  ──────────────────────────────")
            print("  意識が遠くなる。視界が白くなっていく。")
            print("  書き残したメモだけが、次の自分に届く。")
            print("  ──────────────────────────────")
            print()
            time.sleep(2)
            return False  # リセット

        if remaining <= 30 and remaining > 29:
            print()
            print("  【警告】残り30秒。意識が揺らぎ始めている。書き残すなら今。")
            print()

        # プロンプト
        room = rooms[current_room]
        mins = int(remaining) // 60
        secs = int(remaining) % 60
        try:
            raw = input(f"[{mins:02d}:{secs:02d}] {room['name']}> ")
        except (EOFError, KeyboardInterrupt):
            print()
            return None  # 終了

        cmd, arg = parse_command(raw)
        if cmd is None:
            continue

        if cmd in ("go", "g", "移動"):
            new_room = handle_go(arg, current_room, rooms)
            if new_room != current_room:
                current_room = new_room
                room = rooms[current_room]
                print()
                show_room(room, inventory)
                # ゴール判定
                for obj in room["objects"].values():
                    if obj.get("is_goal"):
                        print(f"  {obj['desc']}")
                        print()
                        print("  ═══════════════════════════════════════")
                        print("  　　　　　CLEAR")
                        print(f"  　　{cycle}サイクルでクリア")
                        print("  ═══════════════════════════════════════")
                        print()
                        state["cleared"] = True
                        save_state(state)
                        return None

        elif cmd in ("look", "l", "調べる"):
            handle_look(arg, rooms, current_room, inventory)

        elif cmd in ("take", "t", "拾う", "取る"):
            handle_take(arg, rooms, current_room, inventory, state)

        elif cmd in ("use", "u", "使う"):
            handle_use(arg, rooms, current_room, inventory, state)

        elif cmd in ("write", "w", "書く"):
            handle_write(arg, state)

        elif cmd in ("read", "r", "読む"):
            show_memos(state["memos"], cycle)

        elif cmd in ("help", "h", "?"):
            show_help()

        elif cmd in ("quit", "q", "終了"):
            return None

        elif cmd in ("status", "st"):
            show_status_bar(cycle, remaining, len(state["memos"]))

        else:
            print(f"  '{cmd}'は知らないコマンド。helpで一覧を表示。")

        print()


def main():
    print()
    print("  忘却のリレー — Seed #001 プロトタイプ")
    print("  ────────────────────────────────")
    print()
    print("  [n] 最初から始める")
    print("  [c] 続きから（前回のメモと世界の変化を引き継ぐ）")
    print("  [q] やめる")
    print()

    while True:
        try:
            choice = input("  > ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print()
            return

        if choice == "n":
            state = new_game_state()
            # 古いセーブを消す
            if os.path.exists(SAVE_FILE):
                os.remove(SAVE_FILE)
            break
        elif choice == "c":
            state = load_state()
            if state["cleared"]:
                print("  すでにクリア済み。最初から始める？ (y/n)")
                yn = input("  > ").strip().lower()
                if yn == "y":
                    state = new_game_state()
                else:
                    return
            break
        elif choice == "q":
            return
        else:
            print("  n/c/q で選んで。")

    # メインループ: サイクルを繰り返す
    while True:
        result = play_cycle(state)
        if result is None:
            # クリアまたは終了
            break
        # リセット — メモと世界の変化だけ残してサイクルを続行
        save_state(state)
        print("  Enterで次のサイクルを開始...")
        try:
            input()
        except (EOFError, KeyboardInterrupt):
            break

    save_state(state)
    print("  セーブしました。")


if __name__ == "__main__":
    main()

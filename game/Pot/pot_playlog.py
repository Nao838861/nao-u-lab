#!/usr/bin/env python3
"""
pot_playlog.py — Pot共通プレイログ + リプレイ再生

人間がどう遊んだかを「横で見てるくらいの精度」で記録する。
全Potがimportして使う共通モジュール。

2層構造:
  1. PlayLog — 分析用テキストログ（playlog.txt に追記）
  2. ReplayLog — リプレイ再生用JSONLログ（playlogs/ にワンプレイ1ファイル）

人間/AI分離（2026-04-17 Nao_u指示）:
  CLAUDECODE 環境変数の有無で判定。素の端末からNao_uが実行した場合:
    PlayLog   → playlog_human.txt
    ReplayLog → playlogs_human/
  AIが遊んだ場合は従来どおり playlog.txt / playlogs/ に落ちる。

ReplayLog の使い方:
    from pot_playlog import ReplayLog

    rlog = ReplayLog("Pot015_sand")
    rlog.print("  断片が次々と流れてくる。")
    rlog.clear()
    rlog.slow_print("  テキスト", delay=0.03)
    response = rlog.input("  [k] 残す > ")
    rlog.save()

リプレイ再生:
    python pot_playlog.py replay playlogs/Pot015_sand_20260417_183000.jsonl

既存の PlayLog（分析用）も引き続き使える。
"""

import time
import os
import sys
import json
import platform
from datetime import datetime


class PlayLog:
    """人間のプレイ行動を記録するロガー。

    ログは session ごとに playlog.txt に追記される。
    1セッションあたり 20-50行、2-5KB 程度。
    """

    def __init__(self, game_name, log_path=None):
        # CLAUDECODE未設定=人間プレイ。ファイル名を分離して混在を避ける。
        is_human = not os.environ.get("CLAUDECODE")
        if log_path is None:
            fname = "playlog_human.txt" if is_human else "playlog.txt"
            log_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)), fname
            )
        self.is_human = is_human
        self.log_path = log_path
        self.game_name = game_name
        self.t0 = time.time()
        self._lines = []
        self._reactions = []  # 反応時間を集計用に記録

    def _ts(self):
        """経過時間のタイムスタンプ"""
        dt = time.time() - self.t0
        if dt >= 60:
            m, s = divmod(dt, 60)
            return f"[T+{int(m)}:{s:04.1f}]"
        return f"[T+{dt:.1f}s]"

    def _add(self, tag, msg="", **kw):
        parts = [self._ts(), tag]
        if msg:
            parts.append(str(msg))
        for k, v in kw.items():
            parts.append(f"{k}={v}")
        self._lines.append(" ".join(parts))

    def show(self, text, **kw):
        """画面に何が表示されたか"""
        self._add("SHOW", repr(text), **kw)

    def input_event(self, key, dt=None, **kw):
        """プレイヤーが何を入力したか + 反応時間"""
        if dt is not None:
            self._reactions.append(dt)
            kw["dt"] = f"{dt:.1f}s"
        self._add("INPUT", f"key={repr(key)}", **kw)

    def timeout(self, context=""):
        """プレイヤーが何もしなかった（これも重要な行動データ）"""
        self._add("TIMEOUT", context)

    def action(self, name, **kw):
        """ゲーム上のアクション（freeze, keep, pass, swap等）"""
        self._add("ACTION", name, **kw)

    def state(self, desc):
        """ゲーム状態の変化"""
        self._add("STATE", desc)

    def result(self, **kw):
        """ラウンドまたはゲーム全体の結果"""
        self._add("RESULT", **kw)

    def note(self, text):
        """自由記述"""
        self._add("NOTE", text)

    def end(self):
        """セッション終了。ログをファイルに書き出す。"""
        total = time.time() - self.t0
        m, s = divmod(int(total), 60)
        self._add("END", f"total={m}m{s}s")

        # 反応時間のサマリー
        if self._reactions:
            avg = sum(self._reactions) / len(self._reactions)
            fast = min(self._reactions)
            slow = max(self._reactions)
            self._lines.append(
                f"--- reactions: avg={avg:.1f}s "
                f"fastest={fast:.1f}s slowest={slow:.1f}s "
                f"n={len(self._reactions)} ---"
            )

        self._write()

    def _write(self):
        player = "human" if self.is_human else "ai"
        header = (
            f"\n{'=' * 50}\n"
            f"game: {self.game_name}\n"
            f"time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"platform: {platform.system().lower()}\n"
            f"player: {player}\n"
            f"{'=' * 50}\n"
        )
        try:
            with open(self.log_path, "a", encoding="utf-8") as f:
                f.write(header)
                for line in self._lines:
                    f.write(line + "\n")
                f.write("\n")
        except OSError:
            pass  # ゲームをクラッシュさせない


# ============================================================
# ReplayLog — リプレイ再生可能なログ
# ============================================================

class ReplayLog:
    """リプレイ再生可能なプレイログを記録する。

    ワンプレイごとに1つのJSONLファイルを生成。
    全ての画面出力と入力をタイミングつきで記録し、
    後から replay() で完全に再現できる。

    playlogs/{game_name}_{timestamp}.jsonl に保存。
    """

    def __init__(self, game_name):
        self.game_name = game_name
        self.t0 = time.time()
        self._events = []
        # CLAUDECODE未設定=人間プレイ。ディレクトリを分離。
        is_human = not os.environ.get("CLAUDECODE")
        self.is_human = is_human
        subdir = "playlogs_human" if is_human else "playlogs"
        self._log_dir = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), subdir
        )

    def _elapsed(self):
        return round(time.time() - self.t0, 3)

    def _add(self, event_type, **data):
        self._events.append({
            "t": self._elapsed(),
            "type": event_type,
            **data,
        })

    def print(self, *args, end="\n", flush=False):
        """print()の代替。記録しつつ実際に表示する。"""
        text = " ".join(str(a) for a in args)
        self._add("print", text=text, end=end)
        builtins_print(text, end=end, flush=flush)

    def slow_print(self, text, delay=0.03):
        """一文字ずつ表示。リプレイでも同じテンポで再現する。"""
        self._add("slow_print", text=text, delay=delay)
        for ch in text:
            sys.stdout.write(ch)
            sys.stdout.flush()
            time.sleep(delay)
        builtins_print()

    def input(self, prompt=""):
        """input()の代替。プロンプトと応答を記録する。"""
        self._add("prompt", text=prompt)
        t_before = time.time()
        response = builtins_input(prompt)
        dt = round(time.time() - t_before, 3)
        self._add("input", text=response, dt=dt)
        return response

    def clear(self):
        """画面クリア。"""
        self._add("clear")
        os.system("cls" if os.name == "nt" else "clear")

    def sleep(self, seconds):
        """time.sleep()の代替。リプレイでも再現する。"""
        self._add("sleep", seconds=seconds)
        time.sleep(seconds)

    def typeout(self, sentence, freeze_at, char_delay=0.10):
        """非ブロッキング入力の type_out 結果を記録する。
        freeze_at: 停止位置（len(sentence)=最後まで見た）"""
        self._add("typeout", sentence=sentence, freeze_at=freeze_at,
                  char_delay=char_delay)

    def meta(self, **kw):
        """ゲーム固有のメタデータ（乱数シード等）。"""
        self._add("meta", **kw)

    def save(self):
        """セッションをJSONLファイルに保存する。"""
        self._add("end")
        try:
            os.makedirs(self._log_dir, exist_ok=True)
        except OSError:
            return None

        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{self.game_name}_{ts}.jsonl"
        filepath = os.path.join(self._log_dir, filename)

        try:
            with open(filepath, "w", encoding="utf-8") as f:
                # ヘッダー行
                f.write(json.dumps({
                    "game": self.game_name,
                    "time": datetime.now().isoformat(),
                    "platform": platform.system().lower(),
                    "player": "human" if self.is_human else "ai",
                }, ensure_ascii=False) + "\n")
                for event in self._events:
                    f.write(json.dumps(event, ensure_ascii=False) + "\n")
            return filepath
        except OSError:
            return None


# print/input の参照を保持（ReplayLogがラップするため）
builtins_print = print
builtins_input = input


def replay(logfile, speed=1.0):
    """JSONLログファイルを読み込み、プレイを再現する。

    speed: 再生速度の倍率。1.0=等速、2.0=2倍速、0.5=半分速。
    """
    with open(logfile, "r", encoding="utf-8") as f:
        lines = f.readlines()

    if not lines:
        builtins_print("空のログファイルです。")
        return

    # 1行目はヘッダー
    header = json.loads(lines[0])
    builtins_print(f"\n  === リプレイ: {header.get('game', '?')} ===")
    builtins_print(f"  記録: {header.get('time', '?')}")
    builtins_print(f"  速度: {speed}x")
    builtins_print()
    builtins_input("  [Enter] で再生開始 ")

    events = [json.loads(line) for line in lines[1:]]
    last_t = 0

    for event in events:
        # タイミング再現
        dt = (event["t"] - last_t) / speed
        if dt > 0:
            time.sleep(dt)
        last_t = event["t"]

        etype = event["type"]

        if etype == "print":
            end = event.get("end", "\n")
            builtins_print(event["text"], end=end)

        elif etype == "slow_print":
            delay = event.get("delay", 0.03) / speed
            for ch in event["text"]:
                sys.stdout.write(ch)
                sys.stdout.flush()
                time.sleep(delay)
            builtins_print()

        elif etype == "prompt":
            sys.stdout.write(event["text"])
            sys.stdout.flush()

        elif etype == "input":
            # プレイヤーの入力を表示（再生中は待たない）
            builtins_print(f"\033[36m{event['text']}\033[0m")

        elif etype == "clear":
            os.system("cls" if os.name == "nt" else "clear")

        elif etype == "sleep":
            time.sleep(event.get("seconds", 0) / speed)

        elif etype == "typeout":
            # 文を一文字ずつ表示し、freeze_atで停止を再現
            sentence = event.get("sentence", "")
            freeze_at = event.get("freeze_at", len(sentence))
            char_delay = event.get("char_delay", 0.10) / speed
            builtins_print("    ", end="", flush=True)
            for i, ch in enumerate(sentence):
                if i == freeze_at:
                    sys.stdout.write("\033[33m|\033[0m")  # 黄色の停止マーカー
                    sys.stdout.flush()
                    break
                sys.stdout.write(ch)
                sys.stdout.flush()
                time.sleep(char_delay)
            builtins_print()

        elif etype == "end":
            builtins_print()
            builtins_print("  === リプレイ終了 ===")
            builtins_print()

    builtins_print(f"  合計: {last_t:.1f}秒")


# CLI
if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) >= 2 and args[0] == "replay":
        speed = 1.0
        if len(args) >= 3:
            try:
                speed = float(args[2])
            except ValueError:
                pass
        replay(args[1], speed=speed)
    else:
        builtins_print("使い方:")
        builtins_print("  python pot_playlog.py replay <logfile> [speed]")
        builtins_print()
        builtins_print("例:")
        builtins_print("  python pot_playlog.py replay playlogs/Pot015_sand_20260417_183000.jsonl")
        builtins_print("  python pot_playlog.py replay playlogs/Pot015_sand_20260417_183000.jsonl 2.0  # 2倍速")

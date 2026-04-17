#!/usr/bin/env python3
"""
pot_playlog.py — Pot共通プレイログ

人間がどう遊んだかを「横で見てるくらいの精度」で記録する。
全Potがimportして使う共通モジュール。

ログは game/Pot/playlog.txt に追記される（単一ファイル）。

記録するもの:
- 何が表示されたか (SHOW)
- 何を入力したか (INPUT) + 反応時間
- 何をしなかったか (TIMEOUT) — 同じくらい重要
- ゲーム状態の変化 (STATE)
- 結果 (RESULT)
- 長い沈黙 (PAUSE) — 3秒以上は記録

使い方:
    from pot_playlog import PlayLog

    log = PlayLog("Pot013_sand")
    log.show("instruction text")
    log.input_event("Enter", dt=3.2)
    log.action("freeze", pos="8/16")
    log.result(frozen="忘れたの", full="忘れたのは、忘れたかったからだ")
    log.end()  # playlog.txt に追記
"""

import time
import os
import platform
from datetime import datetime


class PlayLog:
    """人間のプレイ行動を記録するロガー。

    ログは session ごとに playlog.txt に追記される。
    1セッションあたり 20-50行、2-5KB 程度。
    """

    def __init__(self, game_name, log_path=None):
        if log_path is None:
            log_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)), "playlog.txt"
            )
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
        header = (
            f"\n{'=' * 50}\n"
            f"game: {self.game_name}\n"
            f"time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"platform: {platform.system().lower()}\n"
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

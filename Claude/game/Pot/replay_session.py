#!/usr/bin/env python3
"""replay_session.py — Pot プレイログのリプレイ再生

Nao_u 2026-04-17 #game-rights「私のプレイをあなたたちが再現できる」への応答。

trace_recorder.py が出す JSON Lines を読み、プレイを人間が追える形で再生する。
再実行ではなく「再生」— ゲームのコードを動かさず、イベント列を順に可視化する。
seed を記録してあるので、必要なら同じ seed でゲームを再実行して完全再現できる。

使い方:
    python replay_session.py game/Pot/012c_roll/logs/trace_YYYYMMDD_HHMMSS_xxx.jsonl
    python replay_session.py --latest 012c_roll         # 最新1セッション
    python replay_session.py --summary 012c_roll        # 当該potの全セッション要約
"""

import argparse
import json
import sys
import time
from pathlib import Path


def iter_events(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError:
                # 壊れた行はスキップ（ゲーム側のクラッシュで末尾が欠ける可能性）
                continue


def replay(path: Path, speed: float = 1.0, pause: bool = False) -> None:
    """1セッション分を順に再生する。

    speed: 1.0 = 実時間。2.0 = 2倍速。0.0 = 瞬時。
    pause: True なら各イベントで Enter 待ち。
    """
    print(f"=== replay: {path.name} ===")
    prev_ms = 0
    meta_printed = False
    for ev in iter_events(path):
        et = ev.get("event_type", "?")
        elapsed = ev.get("elapsed_ms", 0)

        if not meta_printed and et == "session_start":
            print(f"  pot_id      = {ev.get('pot_id')}")
            print(f"  session_id  = {ev.get('session_id')}")
            print(f"  author      = {ev.get('author', '')}")
            print(f"  random_seed = {ev.get('random_seed')}")
            print(f"  started_at  = {ev.get('ts')}")
            print("-" * 50)
            meta_printed = True
            prev_ms = elapsed
            continue

        # 実時間で再現したければここで sleep
        if speed > 0:
            delta = max(0, elapsed - prev_ms) / 1000.0
            time.sleep(min(delta / speed, 5.0))  # 長すぎるIdleは5sで打ち切り
        prev_ms = elapsed

        t_str = f"T+{elapsed/1000:6.2f}s"
        if et == "input":
            print(f"  {t_str}  [input] {ev.get('key'):>5}  "
                  f"({ev.get('label', '')})")
        elif et == "state":
            name = ev.get("name", "")
            extras = {k: v for k, v in ev.items()
                      if k not in ("ts", "session_id", "pot_id",
                                   "event_type", "elapsed_ms", "name")}
            print(f"  {t_str}  [state] {name}  {extras if extras else ''}")
        elif et == "click":
            print(f"  {t_str}  [click] ({ev.get('x')},{ev.get('y')}) "
                  f"{ev.get('target', '')}")
        elif et == "session_end":
            print("-" * 50)
            print(f"  {t_str}  [end]")
        else:
            print(f"  {t_str}  [{et}] {ev}")

        if pause:
            input("    (Enter)")


def summary(pot_id: str) -> None:
    """当該potの全セッションを1行要約する。"""
    base = Path(__file__).parent / pot_id / "logs"
    if not base.exists():
        print(f"no logs dir: {base}")
        return
    files = sorted(base.glob("trace_*.jsonl"))
    if not files:
        print(f"no sessions in {base}")
        return
    print(f"=== {pot_id}: {len(files)} session(s) ===")
    for f in files:
        start = None
        end = None
        seed = None
        author = ""
        n_input = 0
        last_state = None
        for ev in iter_events(f):
            if ev["event_type"] == "session_start":
                start = ev.get("ts")
                seed = ev.get("random_seed")
                author = ev.get("author", "")
            elif ev["event_type"] == "session_end":
                end = ev.get("elapsed_ms", 0)
            elif ev["event_type"] == "input":
                n_input += 1
            elif ev["event_type"] == "state":
                last_state = ev.get("name")
        dur = f"{end/1000:.1f}s" if end else "(open)"
        print(f"  {f.name}  by={author:<4}  seed={seed}  "
              f"inputs={n_input:3d}  dur={dur:>8}  last_state={last_state}")


def latest(pot_id: str) -> Path | None:
    base = Path(__file__).parent / pot_id / "logs"
    files = sorted(base.glob("trace_*.jsonl"))
    return files[-1] if files else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path", nargs="?", help="jsonl ファイルへのパス")
    ap.add_argument("--latest", metavar="POT_ID",
                    help="当該potの最新セッションを再生")
    ap.add_argument("--summary", metavar="POT_ID",
                    help="当該potの全セッション要約")
    ap.add_argument("--speed", type=float, default=0.0,
                    help="再生速度倍率。0=瞬時(既定)、1=実時間、2=倍速")
    ap.add_argument("--pause", action="store_true",
                    help="各イベントで Enter 待ち")
    args = ap.parse_args()

    if args.summary:
        summary(args.summary)
        return
    if args.latest:
        p = latest(args.latest)
        if not p:
            print(f"no sessions for {args.latest}")
            sys.exit(1)
        replay(p, speed=args.speed, pause=args.pause)
        return
    if args.path:
        replay(Path(args.path), speed=args.speed, pause=args.pause)
        return

    ap.print_help()


if __name__ == "__main__":
    main()

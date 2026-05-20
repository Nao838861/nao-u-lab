"""shot_log v01 — Boghog 4 wave grammar assertion check.

出典: M-44 (Boghog 4 規則) を self_judgment_c196.md「次の一手 候補 B」として実装。
build_waves() の 15 wave に対し Toaplan / レーン / Layered / Pacing の 4 規則を assertion 化。
WARN 検出は v01 改修ではなく v02 設計種への入力情報として残す（v01 は凍結中）。

実行: python game/shot_log/v01/wave_grammar_check.py
出力: 各 wave 行 1 行 PASS/WARN + pacing 全体 1 行
"""
import os
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from headless import ETYPES, W, build_waves  # noqa: E402

LANE_SD_THRESHOLD = W / 6      # 70.0
EDGE_MARGIN = 30                # ±30px を端と定義
HP_TOTAL_THRESHOLD = 40         # small/medium 単位の HP 総和上限
PACING_LONG_INTERVAL = 250      # 「長い間隔」境界
PACING_LONG_STREAK = 3          # 連続何 wave で疲労マーク


def extract_spawn_xs(wave):
    """各 enemy entry の path 先頭から spawn x を抽出"""
    xs = []
    for e in wave['enemies']:
        path = e.get('path', [])
        if path:
            xs.append(path[0]['x'])
    return xs


def check_toaplan(idx, wave):
    """Toaplan: 各 wave で最低 1 経路に逃げ場確保 (端 ±30px を空ける)
    両端 (x<EDGE と x>W-EDGE) の同時 spawn を WARN
    """
    xs = extract_spawn_xs(wave)
    left = [x for x in xs if x < EDGE_MARGIN]
    right = [x for x in xs if x > W - EDGE_MARGIN]
    if left and right:
        return f"WARN w{idx:02d} toaplan: 両端同時 spawn (left={len(left)} x<{EDGE_MARGIN}, right={len(right)} x>{W-EDGE_MARGIN})"
    return f"PASS w{idx:02d} toaplan: left={len(left)} right={len(right)}"


def check_lane(idx, wave):
    """レーン: spawn x 座標標準偏差 ≥ W/6
    pLineDown(210,...) 単独のような偏在を WARN
    """
    xs = extract_spawn_xs(wave)
    if len(xs) < 2:
        return f"PASS w{idx:02d} lane: spawn 数 {len(xs)} (検査スキップ)"
    sd = statistics.pstdev(xs)
    if sd < LANE_SD_THRESHOLD:
        return f"WARN w{idx:02d} lane: spawn x SD={sd:.1f} < {LANE_SD_THRESHOLD:.1f} (n={len(xs)})"
    return f"PASS w{idx:02d} lane: spawn x SD={sd:.1f} (n={len(xs)})"


def check_layered(idx, wave):
    """Layered: HP 総和上限 (small=1, medium=1, large=8, boss=20)
    HP 総和 > THRESHOLD で WARN
    """
    hp_total = 0
    type_counts = {}
    for e in wave['enemies']:
        etype = e.get('type', 'small')
        hp_total += ETYPES[etype]['hp']
        type_counts[etype] = type_counts.get(etype, 0) + 1
    tag = ",".join(f"{k}={v}" for k, v in sorted(type_counts.items()))
    if hp_total > HP_TOTAL_THRESHOLD:
        return f"WARN w{idx:02d} layered: HP 総和 {hp_total} > {HP_TOTAL_THRESHOLD} ({tag})"
    return f"PASS w{idx:02d} layered: HP 総和 {hp_total} ({tag})"


def check_pacing(waves):
    """Pacing: wave 間隔リズム
    連続 PACING_LONG_INTERVAL+ が PACING_LONG_STREAK 以上で WARN
    """
    intervals = [waves[i]['t'] - waves[i-1]['t'] for i in range(1, len(waves))]
    streak = 0
    max_streak = 0
    max_end = -1
    for i, iv in enumerate(intervals):
        if iv >= PACING_LONG_INTERVAL:
            streak += 1
            if streak > max_streak:
                max_streak = streak
                max_end = i
        else:
            streak = 0
    iv_str = "/".join(str(iv) for iv in intervals)
    if max_streak >= PACING_LONG_STREAK:
        return f"WARN pacing: 連続 {PACING_LONG_INTERVAL}+ = {max_streak} (end w{max_end+1:02d}) [間隔={iv_str}]"
    return f"PASS pacing: 最大連続 {PACING_LONG_INTERVAL}+ = {max_streak} [間隔={iv_str}]"


def main():
    waves = build_waves()
    print(f"shot_log v01 — Boghog 4 wave grammar assertion check (M-44)")
    print(f"対象: build_waves() {len(waves)} wave (W={W})")
    print()
    print(f"=== 1. Toaplan (両端 ±{EDGE_MARGIN}px 同時 spawn 検出) ===")
    for i, w in enumerate(waves):
        print(f"  {check_toaplan(i, w)}")
    print()
    print(f"=== 2. レーン (spawn x SD ≥ {LANE_SD_THRESHOLD:.1f} = W/6) ===")
    for i, w in enumerate(waves):
        print(f"  {check_lane(i, w)}")
    print()
    print(f"=== 3. Layered (HP 総和 ≤ {HP_TOTAL_THRESHOLD}) ===")
    for i, w in enumerate(waves):
        print(f"  {check_layered(i, w)}")
    print()
    print(f"=== 4. Pacing ===")
    print(f"  {check_pacing(waves)}")


if __name__ == '__main__':
    main()

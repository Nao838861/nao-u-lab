# -*- coding: utf-8 -*-
# 空間シミュ v1 シナリオ集
import sys
from engine import World, HH, P, GOODS

def village(far_fisher=False):
    """開始村: 港(0,0)に市場。浜・畑・木立に職住一体の世帯を置く"""
    HH._next = 0
    hhs = [
        HH('fisher',     (0.3, 0.2)),                 # 浜(近)
        HH('fisher',     (1.5, 0.8) if far_fisher else (0.4, -0.2)),  # 浜(遠 or 近)
        HH('wheat',      (1.0, -0.6)),
        HH('wheat',      (1.2, -0.8)),
        HH('veg',        (0.6, -0.4)),
        HH('veg',        (0.8, 0.5)),
        HH('woodshop',   (1.8, 1.0)),                 # 木立のそば
        HH('charburner', (2.0, 1.2)),
        HH('charburner', (2.2, 1.4)),
        HH('saltworks',  (0.2, -0.3)),                # 海辺
    ]
    return hhs

def table(w, every=3):
    print(f"{'月':>3}{'魚':>6}{'野菜':>6}{'麦':>6}{'保存':>6}{'道具':>6}{'塩':>6}{'炭':>6}"
          f"{'世帯金':>8}{'商館':>8}{'飢餓':>5}{'湾%':>4}{'林%':>4}  Lv")
    for r in w.rows:
        if r['m'] % every: continue
        pr = r['prices']
        cell = lambda g: f"{pr[g]:>6.2f}" if g in pr else f"{'-':>6}"
        lvs = ''.join(str(v) for v in r['lv'].values())
        print(f"{r['m']:>3}{cell('fish')}{cell('veg')}{cell('wheat')}{cell('pres')}"
              f"{cell('tools')}{cell('salt')}{cell('char')}"
              f"{r['purse_sum']:>8.0f}{r['treasury']:>8.0f}{r['famine']:>5}{r['bay']:>4}{r['grove']:>4}  {lvs}")

def summary(w, label):
    print(f"\n----- {label} -----")
    table(w)
    print(f"輸入: {dict((g, round(v)) for g, v in w.imported.items() if v > 0.5)}")
    print(f"輸出: {dict((g, round(v)) for g, v in w.exported.items() if v > 0.5)}")
    inc = {}
    for h in w.hhs:
        inc.setdefault(h.job, []).append(round(sum(h.income_log), 1))
    print(f"直近30日収入(職種別): {inc}")
    print(f"財布: {[round(h.purse) for h in w.hhs]}")
    print(f"文化Lv: {[(h.id, h.job, h.lv) for h in w.hhs]}")
    ev = [e for e in w.events[-12:]]
    print(f"直近イベント: {ev}")

if __name__ == '__main__':
    which = sys.argv[1] if len(sys.argv) > 1 else 'S1'
    if which == 'S1':
        w = World(village(), seed=11, overrides={'PUBWORKS': 120}).run(720)
        summary(w, 'S1 開始村 2年 (使用価値天井あり)')
    elif which == 'S1b':
        w = World(village(), seed=11, overrides={'USE_VALUE_CEILING': False, 'PUBWORKS': 120}).run(720)
        summary(w, 'S1b 開始村 2年 (純信念ZI — 天井なし対照)')
    elif which == 'S2':
        w = World(village(far_fisher=True), seed=11, overrides={'PUBWORKS': 120}).run(720)
        summary(w, 'S2 遠い漁師 2年 (距離勾配)')
        near, far = w.hhs[0], w.hhs[1]
        print(f"\n近い漁師HH0: 財布{near.purse:.0f} / 遠い漁師HH1: 財布{far.purse:.0f} "
              f"(移動負担 {w.travel_share(near)*100:.0f}% vs {w.travel_share(far)*100:.0f}%)")
    elif which == 'S3':
        w = World(village(far_fisher=True), seed=11,
                  overrides={'JOB_SWITCH': True, 'PUBWORKS': 120}).run(1080)
        summary(w, 'S3 転職オン 3年')
        print(f"転職イベント: {[e for e in w.events if '転職' in e[1]]}")

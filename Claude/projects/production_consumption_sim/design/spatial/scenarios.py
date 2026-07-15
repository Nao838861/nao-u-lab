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
    print(f"配給総量: {w.dole_qty:.0f} / 詰み: {"day %d" % w.go_day if w.go_day else "なし"} / 本土収支: 流入{w.mainland_in:.0f} 流出{w.mainland_out:.0f}")

def summary_tail(w):
    print(f"\n輸入: {dict((g, round(v)) for g, v in w.imported.items() if v > 0.5)}")
    print(f"輸出: {dict((g, round(v)) for g, v in w.exported.items() if v > 0.5)}")
    print(f"配給総量: {w.dole_qty:.0f} / 詰み: {'day %d' % w.go_day if w.go_day else 'なし'} / 本土収支: 流入{w.mainland_in:.0f} 流出{w.mainland_out:.0f}")
    inc = {}
    for h in w.hhs:
        inc.setdefault(h.job, []).append(round(sum(h.income_log)))
    print(f"直近30日収入(職種別): {inc}")
    print(f"文化Lv: {[(h.id, h.job, h.lv) for h in w.hhs]}")

def arc(w):
    ts = [(r['m'], r['treasury']) for r in w.rows]
    peak_m, peak_t = min(ts, key=lambda x: x[1])
    surplus_m = None; repaid_m = None
    for i in range(1, len(ts)):
        if surplus_m is None and ts[i][0] > 6 and ts[i][1] > ts[i-1][1] + 50:
            surplus_m = ts[i][0]
        if repaid_m is None and ts[i][1] >= 0 and ts[i-1][1] < 0:
            repaid_m = ts[i][0]
    print(f"財政弧: 債務ピーク M{peak_m}({-peak_t:.0f}) / 黒字化 {'M%d' % surplus_m if surplus_m else 'なし'} / "
          f"完済 {'M%d' % repaid_m if repaid_m else 'なし'} / 破産 {'M%d' % ((w.go_day-1)//30+1) if w.go_day else 'なし'}")

def table_m(w):
    print(f"{'月':>3}{'人口':>4}{'魚':>6}{'麦':>6}{'保存':>6}{'道具':>6}{'塩':>6}{'炭':>6}"
          f"{'世帯金':>7}{'商館':>8}{'配給/月':>7}{'飢餓':>5}{'湾%':>4} 文化Lv(職種平均)  出来事")
    prev_d = prev_f = 0
    for r in w.rows:
        pr = r['prices']
        cell = lambda g: f"{pr[g]:>6.2f}" if g in pr else f"{'-':>6}"
        ev = list(r['ev'])
        lv_ev = [e[1] for e in w.events if r['day'] - 30 < e[0] <= r['day']
                 and ('▲' in e[1] or '転職' in e[1] or '詰み' in e[1] or '★' in e[1])]
        ev += lv_ev[:4]
        print(f"{r['m']:>3}{r['pop']:>4}{cell('fish')}{cell('wheat')}{cell('pres')}"
              f"{cell('tools')}{cell('salt')}{cell('char')}"
              f"{r['purse_sum']:>7.0f}{r['treasury']:>8.0f}{r['dole']-prev_d:>7.0f}"
              f"{r['famine']-prev_f:>5}{r['bay']:>4} {r['lvs']:<20} {' '.join(ev)}")
        prev_d = r['dole']; prev_f = r['famine']

if __name__ == '__main__':
    which = sys.argv[1] if len(sys.argv) > 1 else 'S1'
    if which == 'S1':
        w = World(village(), seed=11, overrides={'PUBWORKS': 120, 'TREASURY0': 30000, 'CREDIT': 12000, 'IMP_COST': {'wheat': 1.0, 'tools': 2.5, 'salt': 2.0}}).run(720)
        summary(w, 'S1 開始村 2年 (使用価値天井あり)')
    elif which == 'S1b':
        w = World(village(), seed=11, overrides={'USE_VALUE_CEILING': False, 'PUBWORKS': 120, 'TREASURY0': 30000, 'CREDIT': 12000, 'IMP_COST': {'wheat': 1.0, 'tools': 2.5, 'salt': 2.0}}).run(720)
        summary(w, 'S1b 開始村 2年 (純信念ZI — 天井なし対照)')
    elif which == 'S2':
        w = World(village(far_fisher=True), seed=11, overrides={'PUBWORKS': 120, 'TREASURY0': 30000, 'CREDIT': 12000, 'IMP_COST': {'wheat': 1.0, 'tools': 2.5, 'salt': 2.0}}).run(720)
        summary(w, 'S2 遠い漁師 2年 (距離勾配)')
        near, far = w.hhs[0], w.hhs[1]
        print(f"\n近い漁師HH0: 財布{near.purse:.0f} / 遠い漁師HH1: 財布{far.purse:.0f} "
              f"(移動負担 {w.travel_share(near)*100:.0f}% vs {w.travel_share(far)*100:.0f}%)")
    elif which == 'S4':
        HH._next = 0
        start = [HH('fisher', (0.3, 0.2)), HH('veg', (0.6, -0.4)), HH('wheat', (1.0, -0.6))]
        plan = {
            2:  [('woodshop', (1.8, 1.0), False)],
            3:  [('charburner', (2.0, 1.2), False)],   # 炭価高騰への標準的な応手
            4:  [('fisher', (0.4, -0.2), False)],
            5:  [('charburner', (2.1, 1.3), False)],
            6:  [('saltworks', (0.2, -0.3), False)],
            7:  [('veg', (0.8, 0.5), False)],
            8:  [('fisher', (0.5, 0.4), False)],
            9:  [('charburner', (2.3, 1.4), False)],
            13: [('saltworks', (0.3, -0.4), False)],
            14: [('wheat', (1.2, -0.8), True), ('wheat', (1.4, -1.0), True)],
            15: [('fisher', (0.6, 0.6), False)],
            16: [('woodshop', (2.2, 1.4), True)],
            17: [('veg', (1.5, -1.0), True)],
            18: [('charburner', (2.4, 1.5), True)],
        }
        w = World(start, seed=11, plan=plan,
                  overrides={'PUBWORKS': 120, 'TREASURY0': 3000,
                             'IMP_COST': {'wheat': 1.0, 'tools': 2.5, 'salt': 2.0},
                             'JOB_SWITCH': True}).run(1440)
        print('----- S4 標準プレイ 4年 (財政弧: 無利子M18→月利1%・限度は支援期に伸びM24凍結) -----')
        table_m(w)
        summary_tail(w)
        arc(w)
    elif which == 'S5':
        HH._next = 0
        start = [HH('fisher', (0.3, 0.2)), HH('veg', (0.6, -0.4)), HH('wheat', (1.0, -0.6))]
        plan = {   # 無理解プレイ: 麦先行・炭と塩が遅い・漁が薄い
            2:  [('wheat', (1.1, -0.7), False)],
            3:  [('wheat', (1.3, -0.9), False)],
            4:  [('veg', (0.8, 0.5), False)],
            6:  [('fisher', (0.4, -0.2), False)],
            9:  [('woodshop', (1.8, 1.0), False)],
            13: [('fisher', (0.5, 0.4), False)],
            14: [('veg', (1.2, 0.9), False)],
            16: [('charburner', (2.0, 1.2), False)],
            18: [('saltworks', (0.2, -0.3), False)],
            20: [('wheat', (1.4, -1.0), False)],
            26: [('fisher', (0.6, 0.6), False)],
            30: [('veg', (1.5, -1.0), False)],
        }
        w = World(start, seed=11, plan=plan,
                  overrides={'PUBWORKS': 120, 'TREASURY0': 3000,
                             'IMP_COST': {'wheat': 1.0, 'tools': 2.5, 'salt': 2.0},
                             'JOB_SWITCH': True}).run(1440)
        print('----- S5 無理解プレイ 4年 -----')
        table_m(w)
        summary_tail(w)
        arc(w)
    elif which == 'S3':
        w = World(village(far_fisher=True), seed=11,
                  overrides={'JOB_SWITCH': True, 'PUBWORKS': 120, 'TREASURY0': 30000, 'CREDIT': 12000, 'IMP_COST': {'wheat': 1.0, 'tools': 2.5, 'salt': 2.0}}).run(1080)
        summary(w, 'S3 転職オン 3年')
        print(f"転職イベント: {[e for e in w.events if '転職' in e[1]]}")

# -*- coding: utf-8 -*-
# 財政弧の公式判定 (40世帯級・複数シード) — v1.11で合格ライン達成
# 標準=破産なし・無利子期間内ピーク・黒字化→完済 / 無理解=利子の泥沼で破産M45前後→リプレイ
from engine import World, HH
import random

def big_plan(std=True):
    rng = random.Random(5)
    plan = {}
    if std:
        seq = ['woodshop','charburner','fisher','charburner','saltworks','veg','fisher',
               'charburner','veg','fisher','wheat','wheat','saltworks','fisher','woodshop',
               'wheat','veg','charburner','fisher','wheat','veg','woodshop','fisher','wheat',
               'charburner','fisher','veg','wheat','saltworks','fisher']
    else:
        seq = ['wheat','wheat','wheat','veg','wheat','woodshop','veg','wheat','fisher',
               'wheat','veg','wheat','wheat','veg','fisher','wheat','wheat','veg',
               'wheat','fisher','wheat','veg','wheat','wheat','charburner','wheat',
               'wheat','veg','wheat','wheat']
    POS = dict(fisher=(0.4,0.2), veg=(0.8,0.5), wheat=(1.2,-0.8), woodshop=(1.9,1.1),
               charburner=(2.1,1.3), saltworks=(0.25,-0.3))
    for i, job in enumerate(seq):
        m = 2 + i
        x, y = POS[job]
        plan.setdefault(m, []).append((job, (x+rng.uniform(-0.15,0.15), y+rng.uniform(-0.15,0.15)), m>=14))
    return plan

def start8():
    return [HH('fisher',(0.3,0.2)), HH('fisher',(0.45,0.15)), HH('veg',(0.6,-0.4)),
            HH('veg',(0.7,-0.3)), HH('wheat',(1.0,-0.6)), HH('wheat',(1.1,-0.5)),
            HH('woodshop',(1.8,1.0)), HH('charburner',(2.0,1.2))]

BASE = dict(PUBWORKS=200, TREASURY0=6000, PANTRY_CULT_D=240, Y_WHEAT=1600.0,
            FREE_M=42, UP_DAYS=45, LIMIT0=34000.0, LIMIT_G=2000.0, IRATE=0.012,  # 凍結限度82k=標準max78.6kと無理解min85.2kの間
            BAILOUT_AMOUNT=15000.0,
            IMP_COST={'wheat': 1.0, 'tools': 2.5, 'salt': 2.0}, JOB_SWITCH=True, BRANCHING=True)

def run(std, seed):
    HH._next = 0
    w = World(start8(), seed=seed, plan=big_plan(std), overrides=dict(BASE))
    w.pub_schedule = {26: 100, 34: 40}
    w.run(2880)
    ts = [(r['m'], r['treasury']) for r in w.rows]
    pm, pk = min(ts, key=lambda x: x[1])
    rp = next((m for i, (m, t) in enumerate(ts) if t >= 0 and i > 0 and ts[i-1][1] < 0 and m > 24), None)
    br = (w.go_day - 1) // 30 + 1 if w.go_day else None
    return dict(seed=seed, bankrupt=br, peak=-pk, peak_m=pm, repaid=rp,
                final=ts[-1][1], hh=len(w.hhs), bailouts=w.bailouts)

def run_adaptive(std, seed, days=2880):
    """適応標準プレイ: 債務が限度の70%で緊縮(移民先送り+公費0)、50%で解除"""
    from engine import P
    HH._next = 0
    w = World(start8(), seed=seed, plan={m: list(v) for m, v in big_plan(std).items()},
              overrides=dict(BASE))
    w.pub_schedule = {26: 100, 34: 40}
    paused = False
    for d in range(1, days + 1):
        if d % 30 == 1 and d > 1:
            m = (d - 1) // 30 + 1
            debt = max(0.0, -w.treasury)
            limit = P['LIMIT0'] + P['LIMIT_G'] * min(m, P['LIMIT_FREEZE'])
            ratio = debt / limit
            if ratio > 0.7 and not paused:
                paused = True; P['PUBWORKS'] = 0.0
                w.events.append((d, '★緊縮開始'))
            if paused:
                if m in w.plan:
                    w.plan[m + 1] = w.plan.pop(m) + w.plan.get(m + 1, [])
                if ratio < 0.5:
                    paused = False; w.events.append((d, '緊縮解除'))
        w.step()
    return w

if __name__ == '__main__':
    ok = True
    for std, label in ((True, '標準'), (False, '無理解')):
        for s in (11, 12, 13, 14):
            r = run(std, s)
            print(label, r)
            if std and r['bankrupt']: ok = False
            if not std and not r['bankrupt']: ok = False
    print('合格ライン:', 'PASS' if ok else 'FAIL')

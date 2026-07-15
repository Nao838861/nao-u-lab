# -*- coding: utf-8 -*-
# 合格ライン自動較正: つまみのグリッドを標準/無理解プレイで回し採点
# 合格ライン(Nao_u): 標準=無利子の範囲で債務→黒字化→完済 / 無理解=利子付き債務→破産→リプレイ
from engine import World, HH, P
import itertools

PLAN_STD = {2:[('woodshop',(1.8,1.0),False)],3:[('charburner',(2.0,1.2),False)],
 4:[('fisher',(0.4,-0.2),False)],5:[('charburner',(2.1,1.3),False)],
 6:[('saltworks',(0.2,-0.3),False)],7:[('veg',(0.8,0.5),False)],
 8:[('fisher',(0.5,0.4),False)],9:[('veg',(0.9,0.6),False)],
 13:[('fisher',(0.7,0.3),False)],
 14:[('wheat',(1.2,-0.8),True),('wheat',(1.4,-1.0),True)],
 15:[('fisher',(0.6,0.6),False)],16:[('woodshop',(2.2,1.4),True)],
 17:[('wheat',(1.3,-0.9),True)],18:[('wheat',(1.5,-1.1),True)]}
PLAN_NOV = {2:[('wheat',(1.1,-0.7),False)],3:[('wheat',(1.3,-0.9),False)],
 4:[('veg',(0.8,0.5),False)],6:[('fisher',(0.4,-0.2),False)],
 9:[('woodshop',(1.8,1.0),False)],13:[('fisher',(0.5,0.4),False)],
 14:[('veg',(1.2,0.9),False)],16:[('charburner',(2.0,1.2),False)],
 18:[('saltworks',(0.2,-0.3),False)],20:[('wheat',(1.4,-1.0),False)],
 26:[('fisher',(0.6,0.6),False)],30:[('veg',(1.5,-1.0),False)]}

def run(plan, ov, pub_taper=True):
    HH._next = 0
    start = [HH('fisher',(0.3,0.2)), HH('veg',(0.6,-0.4)), HH('wheat',(1.0,-0.6))]
    w = World(start, seed=11, plan=plan, overrides=ov)
    if pub_taper: w.pub_schedule = {20: 60, 28: 20}
    w.run(1440)
    ts = [(r['m'], r['treasury']) for r in w.rows]
    peak = min(t for m, t in ts)
    surplus_m = repaid_m = None
    for i in range(1, len(ts)):
        if ts[i][1] - ts[i-1][1] > 4000: continue
        if surplus_m is None and ts[i][0] > 12 and all(
                ts[j][1] - ts[j-1][1] > 0 for j in range(max(1, i-1), min(len(ts), i+2))):
            surplus_m = ts[i][0]
        if repaid_m is None and ts[i][1] >= 0 and ts[i-1][1] < 0 and ts[i][0] > 12:
            repaid_m = ts[i][0]
    br = (w.go_day - 1) // 30 + 1 if w.go_day else None
    return dict(peak=-peak, surplus=surplus_m, repaid=repaid_m, bankrupt=br,
                bailouts=w.bailouts, famine=w.famine_days)

def score(std, nov):
    s = 0
    if std['bankrupt']: s -= 1000
    else:
        s += 300
        if std['surplus']: s += 300 - std['surplus'] * 2      # 黒字化は早いほど良い
        if std['repaid']: s += 400 - std['repaid'] * 2        # 完済も
        s -= std['famine'] / 20
    if nov['bankrupt'] and 20 <= nov['bankrupt'] <= 48:
        s += 400                                              # 無理解は2-4年で破産が正
    elif nov['bankrupt']:
        s += 100
    else:
        s -= 300                                              # 無理解が破産しないのは失格
    return s

if __name__ == '__main__':
    base = dict(PUBWORKS=120, TREASURY0=3000,
                IMP_COST={'wheat': 1.0, 'tools': 2.5, 'salt': 2.0}, JOB_SWITCH=True)
    grid = list(itertools.product([30, 45], [120, 240], [1300, 1600], [80, 120]))
    rows = []
    for up, cult, ywheat, pub in grid:
        ov = dict(base, UP_DAYS=up, PANTRY_CULT_D=cult, Y_WHEAT=ywheat, PUBWORKS=pub)
        std = run(PLAN_STD, ov)
        nov = run(PLAN_NOV, ov)
        sc = score(std, nov)
        rows.append((sc, up, cult, ywheat, pub, std, nov))
        print(f"up{up} cult{cult} wheat{ywheat} pub{pub}: score{sc:>6.0f} | "
              f"標準 破産{std['bankrupt']} 黒字{std['surplus']} 完済{std['repaid']} "
              f"ピーク{std['peak']:.0f} 支援{std['bailouts']} | "
              f"無理解 破産{nov['bankrupt']}")
    rows.sort(key=lambda x: -x[0])
    print('\nBEST:', rows[0][:5])

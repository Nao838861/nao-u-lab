# v8b 条件バリエーション: ラダーA/B・凶作・道路・塩なし・レバレッジ・10年スケール・再播種
from sim_v8_engine import Sim, P

plan_good = {
    2: [('wood', 1)], 3: [('shop', 0)], 4: [('fish', 0)], 5: [('char', 1)],
    6: [('salt', 0)], 7: [('veg', 1)], 8: [('fish', 1)],
    13: [('veg', 1)], 14: [('wheat', 2), ('wheat', 2)], 15: [('fish', 1)],
    16: [('wood', 2)], 17: [('veg', 2)], 18: [('wood', 1), ('char', 1)],
}

def net(s): return s.rows[-1]['cap'] - s.rows[-1]['debt']
def lvs(s): return s.rows[-1]['lv']

# --- T1 ラダーA案 vs B案 (計画+鉄輸入M20・4年) ---
ta = Sim(plan_good, 'T1a ラダーA案 4年', roads_m={1: 5, 2: 14}, years=4,
         iron_from=20, ladder='A').run()
tb = Sim(plan_good, 'T1b ラダーB案 4年', roads_m={1: 5, 2: 14}, years=4,
         iron_from=20, ladder='B').run()
print('== T1 ラダーA/B比較 ==')
for s in (ta, tb):
    hist = [(r['m'], r['lv']['farm']) for r in s.rows if r['mo']['ev']
            and any('farm' in e for e in r['mo']['ev'])]
    print(f"{s.name}: 最終{lvs(s)} 純資産{net(s):.0f} 農家Lv履歴{hist}")

# --- T2 凶作ショック (2年目の収穫×0.4) 3年 ---
t2 = Sim(plan_good, 'T2 凶作 (2年目収穫×0.4) 3年', roads_m={1: 5, 2: 14},
         years=3, harvest={2: 0.4}).run()
t2.table(every=1)
t2n = Sim(plan_good, 'T2n 平年 3年', roads_m={1: 5, 2: 14}, years=3).run()
print(f"凶作の代償: 純資産 {net(t2):.0f} vs 平年 {net(t2n):.0f} (差{net(t2n)-net(t2):.0f})")

# --- T3 道路なし vs あり (2年) ---
t3 = Sim(plan_good, 'T3 道路なし 2年', roads_m={}, years=2).run()
t3r = Sim(plan_good, 'T3r 道路あり 2年', roads_m={1: 5, 2: 14}, years=2).run()
print(f"\n== T3 道路の価値 ==\nなし: 純資産{net(t3):.0f} Lv{lvs(t3)}\nあり: 純資産{net(t3r):.0f} Lv{lvs(t3r)} (差{net(t3r)-net(t3):.0f})")

# --- T4 塩なし (保存不可) 2年 ---
plan_nosalt = {m: [x for x in v if x[0] not in ('salt',)]
               for m, v in plan_good.items()}
t4 = Sim(plan_nosalt, 'T4 塩なし(保存不可) 2年', roads_m={1: 5, 2: 14}, years=2).run()
print(f"\n== T4 塩の価値 ==\n塩なし: 純資産{net(t4):.0f} Lv{lvs(t4)} vs 基準S1相当: 純資産{net(t3r):.0f}")

# --- T5 レバレッジ拡張 (毎月プール上限まで招致・輸出あり) 5年 vs 保守 ---
mix = [('fish', 1), ('veg', 1), ('wood', 2), ('wheat', 2), ('fish', 1),
       ('char', 1), ('veg', 2), ('wood', 1)]
plan_lev = dict(plan_good)
for m in range(19, 60):
    plan_lev[m] = [mix[(m * 2 + i) % len(mix)] for i in range(4)]
t5 = Sim(plan_lev, 'T5 レバレッジ拡張 5年', roads_m={1: 5, 2: 14}, years=5).run()
t5.table(every=6)
t5c = Sim(plan_good, 'T5c 保守 5年', roads_m={1: 5, 2: 14}, years=5).run()
print(f"レバレッジ: 人口{t5.rows[-1]['pop']} 純資産{net(t5):.0f} GO={t5.go_month}\n"
      f"保守:       人口{t5c.rows[-1]['pop']} 純資産{net(t5c):.0f} GO={t5c.go_month}")

# --- T6 10年スケール: 生食需要が漁獲キャップを食うか (監査#1の検証) ---
t6 = Sim(plan_lev, 'T6 10年スケール', roads_m={1: 5, 2: 14}, years=10).run()
print('\n== T6 生魚シェアの衰退アーク ==')
print(f"{'年':>3}{'人口':>5}{'魚資源%':>7}{'生魚':>6}{'保存':>6}{'麦':>6}{'野菜':>6}{'輸入':>6}  食事シェア%")
for y in range(1, 11):
    rs = [r for r in t6.rows if (r['m'] - 1) // 12 + 1 == y]
    tot = {k: sum(r['mo'].get('d_' + k, 0) for r in rs) for k in
           ('fish', 'pres', 'wheat', 'veg')}
    imp = sum(r['mo']['imp'] for r in rs)
    g = sum(tot.values()) + imp
    if g <= 0: continue
    r = rs[-1]
    print(f"{y:>3}{r['pop']:>5}{r['fishS']*100:>7.0f}"
          f"{tot['fish']/g*100:>6.0f}{tot['pres']/g*100:>6.0f}"
          f"{tot['wheat']/g*100:>6.0f}{tot['veg']/g*100:>6.0f}{imp/g*100:>6.0f}")
print(f"最終: 人口{t6.rows[-1]['pop']} Lv{lvs(t6)} 純資産{net(t6):.0f} GO={t6.go_month} 魚資源{t6.rows[-1]['fishS']*100:.0f}%")

# --- T7 再播種下限 (P8): r0樵がM24でr1へ移住→木立は戻るか ---
plan_dep = {2: [('wood', 0)], 3: [('wood', 0)], 4: [('fish', 0)], 8: [('shop', 0)]}
t7 = Sim(plan_dep, 'T7 再播種あり 10年', years=10, reseed=True, salt_cut=None).run()
t7x = Sim(plan_dep, 'T7x 再播種なし 10年', years=10, reseed=False).run()
print('\n== T7 木立の回復 (樵2が切り続けた場合) ==')
for s in (t7, t7x):
    tr = [(r['m'], round(r['groveS'] * 100)) for r in s.rows if r['m'] % 24 == 0]
    print(f"{s.name}: 木立%推移{tr}")

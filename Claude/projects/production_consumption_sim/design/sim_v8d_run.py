# v8d: 肥料・対岸漁場・干物二段・炭の配分順位の検証 (2026-07-15)
from sim_v8_engine import Sim, P

def net(s): return s.rows[-1]['cap'] - s.rows[-1]['debt']

# 農業拡大プラン (麦15枚まで) — 「広大な麦畑」を作る
plan_agri = {
    2: [('wood', 1)], 3: [('shop', 0)], 4: [('fish', 0)], 5: [('char', 1)],
    6: [('salt', 0)], 7: [('veg', 1)], 8: [('fish', 1)],
    13: [('wheat', 1), ('wheat', 1)], 14: [('wheat', 2), ('wheat', 2)],
    15: [('veg', 1), ('fish', 1)], 16: [('wheat', 2), ('wood', 2)],
    17: [('wheat', 2), ('veg', 2)], 18: [('wood', 1), ('char', 1)],
    19: [('wheat', 2), ('wheat', 2)], 20: [('veg', 2), ('char', 1)],
    21: [('wheat', 2)],
    25: [('wheat', 2), ('wheat', 2)], 26: [('veg', 2), ('wood', 2)],
    27: [('wheat', 2), ('fish', 1)], 29: [('wheat', 2)],
}
plan_far = dict(plan_agri)
plan_far[28] = [('fish2', 2), ('char', 1)]
plan_far[30] = [('fish2', 2)]
plan_far[32] = [('fish2', 2)]

d1 = Sim(plan_agri, 'D1 農業拡大・対岸なし 6年', roads_m={1: 5, 2: 14}, years=6).run()
d2 = Sim(plan_far, 'D2 農業拡大+対岸漁場3隻 6年', roads_m={1: 5, 2: 14}, years=6).run()

print('== D1/D2 施肥と収穫 (麦の年次収穫と施肥率) ==')
for s in (d1, d2):
    harvs = [(r['m'], round(r['mo']['harv']), [e for e in r['mo']['ev'] if '施肥' in e])
             for r in s.rows if r['mo'].get('harv')]
    last = s.rows[-1]
    print(f"\n{s.name}")
    for m, h, ev in harvs: print(f"  M{m:>3}: 麦{h:>6} {ev[0] if ev else '(施肥なし)'}")
    print(f"  最終: 人口{last['pop']} 純資産{net(s):.0f} 近海{last['fishS']*100:.0f}% 対岸{last['fish2S']*100:.0f}% 粕在庫{last['meal']:.0f} GO={s.go_month}")

# --- D3 炭の逼迫: 炭1軒 vs 2軒 (炭の配分順位が文化に出るか) ---
plan_good = {
    2: [('wood', 1)], 3: [('shop', 0)], 4: [('fish', 0)], 5: [('char', 1)],
    6: [('salt', 0)], 7: [('veg', 1)], 8: [('fish', 1)],
    13: [('veg', 1)], 14: [('wheat', 2), ('wheat', 2)], 15: [('fish', 1)],
    16: [('wood', 2)], 17: [('veg', 2)], 18: [('wood', 1), ('char', 1)],
}
plan_1char = {m: [x for x in v if not (x[0] == 'char' and m == 18)]
              for m, v in plan_good.items()}
d3a = Sim(plan_1char, 'D3a 炭1軒 3年', roads_m={1: 5, 2: 14}, years=3).run()
d3b = Sim(plan_good, 'D3b 炭2軒 3年', roads_m={1: 5, 2: 14}, years=3).run()
print('\n== D3 炭逼迫と配分順位 (塩→燻製→世帯の暖) ==')
for s in (d3a, d3b):
    last = s.rows[-1]
    pres_y3 = sum(r['mo']['presq'] for r in s.rows if r['m'] > 24)
    print(f"{s.name}: Lv{last['lv']} 保存生産(3年目){pres_y3:.0f} 純資産{net(s):.0f}")

# --- D4 干物の炭ブーストの価値 (0.95 vs 塩のみ0.6相当) ---
d4a = Sim(plan_good, 'D4a ブーストあり 3年', roads_m={1: 5, 2: 14}, years=3).run()
_orig = P['PR_SMOKE']; P['PR_SMOKE'] = P['PR_SALT']
d4b = Sim(plan_good, 'D4b ブーストなし(全部0.6) 3年', roads_m={1: 5, 2: 14}, years=3).run()
P['PR_SMOKE'] = _orig
print('\n== D4 燻製ブーストの価値 ==')
for s in (d4a, d4b):
    imp3 = sum(r['mo']['imp'] for r in s.rows if r['m'] > 24)
    last = s.rows[-1]
    print(f"{s.name}: 3年目輸入{imp3:.0f} 最終保存{last['pres']:.0f} 純資産{net(s):.0f}")

# --- D5 人口が麦を食い切る規模での対岸の価値 (700人規模) ---
mix5 = [('veg', 1), ('wood', 2), ('char', 1), ('veg', 2), ('shop', 0), ('wood', 1)]
plan_d5 = dict(plan_agri)
for i, m in enumerate(range(31, 72, 2)):
    plan_d5[m] = plan_d5.get(m, []) + [mix5[i % len(mix5)], mix5[(i + 3) % len(mix5)]]
plan_d5far = dict(plan_d5)
plan_d5far[28] = plan_d5far.get(28, []) + [('fish2', 2), ('fish2', 2)]
plan_d5far[30] = plan_d5far.get(30, []) + [('fish2', 2)]

d5a = Sim(plan_d5, 'D5a 人口拡大・対岸なし 6年', roads_m={1: 5, 2: 14}, years=6).run()
d5b = Sim(plan_d5far, 'D5b 人口拡大+対岸3隻 6年', roads_m={1: 5, 2: 14}, years=6).run()
print('\n== D5 人口が麦を食い切る規模 ==')
for s in (d5a, d5b):
    last = s.rows[-1]
    imp56 = sum(r['mo']['imp'] for r in s.rows if r['m'] > 48)
    harv = max(r['mo'].get('harv', 0) for r in s.rows)
    fill = [e for r in s.rows for e in r['mo']['ev'] if '施肥' in e]
    print(f"{s.name}: 人口{last['pop']} 最大収穫{harv:.0f} 5-6年目輸入{imp56:.0f} "
          f"純資産{net(s):.0f} 近海{last['fishS']*100:.0f}% 施肥推移{fill[-3:]}")

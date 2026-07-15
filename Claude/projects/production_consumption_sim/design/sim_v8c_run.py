# v8c: 買い叩き輸出 + 漁場再調整の検証 (Nao_u指示 2026-07-15)
# C1 2周目の返済ペース(買い叩きで完済マシンが死んでいるか・それでも返せるか)
# C2 節度ある漁業10年(序盤〜中盤を支え、資源は保つか)
# C3 依存漁業10年(中盤漸減→後半枯渇のタイムライン)
from sim_v8_engine import Sim, P

plan_good = {
    2: [('wood', 1)], 3: [('shop', 0)], 4: [('fish', 0)], 5: [('char', 1)],
    6: [('salt', 0)], 7: [('veg', 1)], 8: [('fish', 1)],
    13: [('veg', 1)], 14: [('wheat', 2), ('wheat', 2)], 15: [('fish', 1)],
    16: [('wood', 2)], 17: [('veg', 2)], 18: [('wood', 1), ('char', 1)],
}

def net(s): return s.rows[-1]['cap'] - s.rows[-1]['debt']

# --- C1 2周目 5年 (計画+返済優先+鉄M20) ---
c1 = Sim(plan_good, 'C1 2周目 5年 (買い叩き輸出で返済)', roads_m={1: 5, 2: 14},
         years=5, repay=True, iron_from=20).run()
print('== C1 2周目の返済ペース (債務推移) ==')
for r in c1.rows:
    if r['m'] % 6 == 0:
        print(f"M{r['m']:>3}: 債務{r['debt']:>7.0f} 資金{r['cap']:>7.0f} 輸出{r['mo']['exp']:>6.0f}/月")
print(f"最終: 純資産{net(c1):.0f} GO={c1.go_month}")

# --- C2 節度ある漁業 10年 (漁6軒まで・農中心の拡張) ---
mix2 = [('veg', 1), ('wheat', 2), ('wood', 2), ('veg', 2), ('wheat', 2),
        ('char', 1), ('shop', 0), ('wood', 1)]
plan_mod = dict(plan_good)
for m in range(19, 90, 2):
    plan_mod[m] = [mix2[(m // 2 + i) % len(mix2)] for i in range(2)]
plan_mod[30] = [('fish', 1)]; plan_mod[50] = [('fish', 1)]   # 漁は計7軒まで
c2 = Sim(plan_mod, 'C2 節度ある漁業 10年', roads_m={1: 5, 2: 14}, years=10).run()

# --- C3 依存漁業 10年 (毎年漁を足す・レバレッジ級の人口) ---
mix3 = [('fish', 1), ('veg', 1), ('wood', 2), ('wheat', 2), ('fish', 1),
        ('char', 1), ('veg', 2), ('wood', 1)]
plan_dep = dict(plan_good)
for m in range(19, 120):
    plan_dep[m] = [mix3[(m * 2 + i) % len(mix3)] for i in range(4)]
c3 = Sim(plan_dep, 'C3 依存漁業 10年', roads_m={1: 5, 2: 14}, years=10).run()

for s, label in ((c2, 'C2 節度(漁≤7軒)'), (c3, 'C3 依存(漁を足し続ける)')):
    print(f"\n== {label} ==")
    print(f"{'年':>3}{'人口':>6}{'漁軒':>4}{'魚資源%':>7}{'漁獲/日':>7}{'生魚%':>5}{'保存%':>5}{'麦%':>5}{'野菜%':>5}{'輸入%':>5}{'債務':>8}")
    for y in range(1, 11):
        rs = [r for r in s.rows if (r['m'] - 1) // 12 + 1 == y]
        tot = {k: sum(r['mo'].get('d_' + k, 0) for r in rs) for k in
               ('fish', 'pres', 'wheat', 'veg')}
        imp = sum(r['mo']['imp'] for r in rs)
        g = sum(tot.values()) + imp
        r = rs[-1]
        nf = sum(1 for x in s.hhs if x['j'] == 'fish') if y == 10 else '-'
        fpd = sum(rr['mo']['fish'] for rr in rs) / 360
        print(f"{y:>3}{r['pop']:>6}{'':>4}{r['fishS']*100:>7.0f}{fpd:>7.0f}"
              f"{tot['fish']/g*100:>5.0f}{tot['pres']/g*100:>5.0f}"
              f"{tot['wheat']/g*100:>5.0f}{tot['veg']/g*100:>5.0f}{imp/g*100:>5.0f}"
              f"{r['debt']:>8.0f}")
    cnt = {}
    for x in s.hhs: cnt[x['j']] = cnt.get(x['j'], 0) + 1
    print(f"最終: 人口{s.rows[-1]['pop']} 軒数{cnt} 純資産{net(s):.0f} GO={s.go_month}")

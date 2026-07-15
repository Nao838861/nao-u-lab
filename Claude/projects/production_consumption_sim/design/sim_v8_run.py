# v8 シナリオ群: 目標条件5つ + 悪用 + 枯渇 + 転落
from sim_v8_engine import Sim, P

# --- S1 計画プレイ (木工連鎖優先・道路・輸出・2年) ---
# 軒数2-3デフォルト狙い: 漁複数・菜複数・麦は人口比で追加
plan_good = {
    2: [('wood', 1)], 3: [('shop', 0)], 4: [('fish', 0)], 5: [('char', 1)],
    6: [('salt', 0)], 7: [('veg', 1)], 8: [('fish', 1)],
    13: [('veg', 1)], 14: [('wheat', 2), ('wheat', 2)], 15: [('fish', 1)],
    16: [('wood', 2)], 17: [('veg', 2)], 18: [('wood', 1), ('char', 1)],
}
s1 = Sim(plan_good, 'S1 計画プレイ 2年 (木工連鎖優先・道路M5/M14・輸出あり)',
         roads_m={1: 5, 2: 14}, years=2).run()
s1.table()

# --- S2 初見プレイ 5年 (麦先行・木工後回し・道路なし・輸出下手) ---
plan_novice = {
    2: [('wheat', 1)], 3: [('wheat', 2)], 4: [('veg', 1)], 5: [('fish', 1)],
    8: [('wood', 1)], 9: [('shop', 0)],
    13: [('fish', 1)], 14: [('veg', 1)], 15: [('char', 1)], 16: [('salt', 0)],
    20: [('wheat', 2)], 25: [('fish', 1)], 26: [('wood', 2)],
    30: [('veg', 2)], 37: [('fish', 2)], 40: [('wood', 2)],
}
s2 = Sim(plan_novice, 'S2 初見プレイ 5年 (麦先行・木工M8・道路なし)',
         years=5, exports=False).run()
s2.table(every=3)

# --- S3 2周目 (計画+返済モード+鉄輸入M20) 3年 ---
s3 = Sim(plan_good, 'S3 2周目 3年 (計画+収入は返済優先+鉄輸入M20)',
         roads_m={1: 5, 2: 14}, years=3, repay=True, iron_from=20).run()
s3.table(every=3)

# --- S4 悪用: 初手から毎月限界まで招致(巨大plan) ---
plan_exploit = {m: [('fish', 0), ('wheat', 1), ('wood', 1), ('veg', 0),
                    ('fish', 1), ('wheat', 2)] for m in range(2, 25)}
s4 = Sim(plan_exploit, 'S4 悪用テスト 2年 (毎月6世帯申請→プールが上限)',
         years=2, exports=False).run()
s4.table(every=3)

# --- S5 枯渇プローブ 10年 (r0木立に樵3・漁6を維持) ---
plan_dep = {2: [('wood', 0)], 3: [('wood', 0)], 4: [('fish', 0)],
            5: [('fish', 0)], 6: [('fish', 0)], 7: [('fish', 0)],
            8: [('shop', 0)], 9: [('wood', 0)]}
s5 = Sim(plan_dep, 'S5 枯渇プローブ 10年 (r0木立に樵3+漁5)',
         years=10, exports=False).run()
s5.table(every=6)

# --- S6 ラダー転落: 計画プレイでM20に塩生産停止 3年 ---
s6 = Sim(plan_good, 'S6 転落テスト 3年 (M20塩停止→累積メンテでLv3→転落)',
         roads_m={1: 5, 2: 14}, years=3, salt_cut=20).run()
s6.table(every=2)

print('\n--- 目標条件チェック ---')
print(f"(a) 軒数2-3デフォルト: S1軒数を目視")
val = min(range(len(s1.rows)), key=lambda i: s1.rows[i]['cap'] - s1.rows[i]['debt'])
print(f"(c) 資金の谷: S1 M{s1.rows[val]['m']} (純資産{s1.rows[val]['cap']-s1.rows[val]['debt']:.0f})")
print(f"(d) 初見GO: S2 {'M%d=%d年目' % (s2.go_month, (s2.go_month-1)//12+1) if s2.go_month else 'GOなし(要較正)'}")
print(f"(e) 2周目返済: S3 最終債務 {s3.rows[-1]['debt']:.0f}")

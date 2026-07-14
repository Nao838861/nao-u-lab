# 世帯人数を変えて「運搬労働の割合」が薄まるか検証
# 要点: 食料haul-in ∝ 人数, 製品haul-out ∝ 生産者数 ∝ 人数 → 運搬量は人数に比例
#       ⇒ 運搬者数も人数に比例 ⇒ 割合はほぼ一定になるはず(=薄まらない)

CART_CAP = 4.0
Y_WOOD   = 3.0
C_FOOD   = 0.5
WORKER_FRAC = 0.6   # 労働者/総人数

def tput(D): return CART_CAP/(2.0*D)

def solve_wood_household(size, D):
    workers = round(size*WORKER_FRAC)
    food_need = size*C_FOOD
    t = tput(D)
    best=None
    for H in range(0,workers+1):
        P = workers-H
        cap = H*t
        produced = P*Y_WOOD
        food_in = min(food_need, cap)
        wood_out= min(produced, cap)
        starve = food_need-food_in
        ok = starve<=1e-9
        score = wood_out
        cand=(ok,score,H,P,workers)
        if best is None or (cand[0],cand[1])>(best[0],best[1]): best=cand
    ok,score,H,P,workers=best
    return workers,P,H,H/workers if workers else 0,score

print("=== 木こり世帯(非食料=食料全haul-in+製品全haul-out, 最も運搬が重い) D=1.0固定 ===")
print(f"{'世帯人数':>8}{'労働者':>7}{'生産者':>7}{'運搬者':>7}{'運搬労働%':>10}{'木材売れ/日':>12}{'1人あたり売れ':>14}")
for size in [5,10,15,20,30]:
    workers,P,H,hf,sold = solve_wood_household(size, 1.0)
    print(f"{size:>8}{workers:>7}{P:>7}{H:>7}{hf*100:>9.0f}%{sold:>12.1f}{sold/size:>14.2f}")

print("\n=== 同じことを近距離 D=0.25 で ===")
print(f"{'世帯人数':>8}{'労働者':>7}{'生産者':>7}{'運搬者':>7}{'運搬労働%':>10}{'木材売れ/日':>12}{'1人あたり売れ':>14}")
for size in [5,10,15,20,30]:
    workers,P,H,hf,sold = solve_wood_household(size, 0.25)
    print(f"{size:>8}{workers:>7}{P:>7}{H:>7}{hf*100:>9.0f}%{sold:>12.1f}{sold/size:>14.2f}")

print("\n=== 離散トリップの効き(荷車を満載できるか) ===")
print("連続近似では運搬者は端数可。実際は整数トリップ&荷車4荷単位。")
print("小世帯=半端な荷で荷車が空きがち(非効率)/大世帯=満載しやすい(効率)。")
print("→ 大世帯がやや有利だが『1人で完結』ではなく『荷車を満載できる』という別の economy。")
print("→ これが行商人(多数の小世帯の荷を集約=満載)の価値の源泉。")

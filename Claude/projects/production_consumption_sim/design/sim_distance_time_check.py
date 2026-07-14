# 生産消費sim 概念検証: 距離×運搬×労働 が二重時計(時間の嘘)と整合するかの数値確認
# 全て「経済日(=1市場セッション)」で計算。render秒は一切使わない ← これが要点

CART_CAP = 4.0          # 荷/1往復 (仮)
Y_FISH   = 4.0          # 漁 荷/worker-日 (tier0)
Y_WOOD   = 3.0          # 伐採 荷/worker-日 (tier0)
C_FOOD   = 0.5          # 食料消費 荷/人-日
HH_SIZE  = 10           # 世帯人数
WORKERS  = 6            # うち労働者 (残り=子/老 扶養)

def hauler_tput(D_oneway_days):
    # 1往復=2*D日, 1往復でCART_CAP荷を各方向に運ぶ → 荷/日(各方向)
    return CART_CAP / (2.0 * D_oneway_days)

def solve_household(kind, D):
    """距離Dの世帯が、労働者WORKERSを生産と運搬にどう割るか。
       制約: 食料をhaul-in, 産物をhaul-out。最大の純産出になる配分を全探索。"""
    tput = hauler_tput(D)
    food_need = HH_SIZE * C_FOOD  # 荷/日
    best = None
    for H in range(0, WORKERS+1):          # 運搬にH人
        P = WORKERS - H                     # 生産にP人
        cap = H * tput                      # 各方向の運搬能力 荷/日
        if kind == 'fish':
            produced = P * Y_FISH
            own = min(produced, food_need)  # 自前の魚を食う(現地・運搬不要)
            surplus = produced - own
            food_buy = food_need - own      # 通常0(魚で足りる)
            # 魚は腐る: その日運べた分だけ売れる、余りは廃棄(=価値喪失)
            sold = min(surplus, cap)
            wasted = surplus - sold
            # 食料をbuyする必要があるならhaul-inにも能力を食う(ここでは魚自給前提でfood_buy=0)
            net_food = own - food_need       # >=0なら充足
            score = sold - wasted*0.0        # 純現金産出=売れた魚(廃棄はゼロ価値)
            ok = (net_food >= -1e-9)
        else: # wood: 食料を全haul-in, 木材を全haul-out。往復で両方運ぶ
            produced = P * Y_WOOD
            # 各方向capを共有: food_in <= cap, wood_out <= cap
            food_in = min(food_need, cap)
            wood_out = min(produced, cap)
            starve = food_need - food_in     # >0なら飢える
            score = wood_out                 # 純現金産出=売れた木材
            ok = (starve <= 1e-9)
            sold, wasted, surplus = wood_out, produced-wood_out, produced
        haul_frac = H / WORKERS
        cand = (ok, score, H, P, haul_frac, produced, sold, wasted)
        # okを優先し、その中でscore最大
        if best is None: best = cand
        else:
            if (cand[0], cand[1]) > (best[0], best[1]): best = cand
    return best

print("=== 前提(全て仮置き・経済日で計算) ===")
print(f"世帯{HH_SIZE}人(労働{WORKERS}) / 荷車{CART_CAP}荷 / 漁{Y_FISH}・伐採{Y_WOOD}荷/worker日 / 消費{C_FOOD}荷/人日")
print(f"世帯の食料必要 = {HH_SIZE*C_FOOD}荷/日\n")

print("=== 木こり世帯: 距離を変えて労働配分を見る(食料は買う・木材は売る) ===")
print(f"{'D(片道日)':>10}{'運搬能力/日':>12}{'伐採人':>8}{'運搬人':>8}{'運搬労働%':>10}{'木材売れ/日':>12}{'飢餓':>6}")
for D in [0.25, 0.5, 1.0, 1.5, 2.0]:
    ok,score,H,P,hf,prod,sold,wasted = solve_household('wood', D)
    print(f"{D:>10}{hauler_tput(D):>12.2f}{P:>8}{H:>8}{hf*100:>9.0f}%{sold:>12.1f}{'' if ok else '  飢!':>6}")

print("\n=== 漁世帯: 距離を変える(魚は自給+余剰を売る・魚は腐るので運べない分は廃棄) ===")
print(f"{'D(片道日)':>10}{'運搬能力/日':>12}{'漁人':>6}{'運搬人':>8}{'運搬労働%':>10}{'魚売れ/日':>10}{'廃棄/日':>8}")
for D in [0.25, 0.5, 1.0, 1.5, 2.0]:
    ok,score,H,P,hf,prod,sold,wasted = solve_household('fish', D)
    print(f"{D:>10}{hauler_tput(D):>12.2f}{P:>6}{H:>8}{hf*100:>9.0f}%{sold:>10.1f}{wasted:>8.1f}")

print("\n=== 時間の嘘との整合チェック ===")
print("全数値は『経済日』のみで算出。荷車の描画速度(render秒)もカレンダー(1年=N日)も式に一切入っていない。")
print("→ 早送りしてもD(片道日)は不変=距離コスト不変。ゲーム速度非依存。")
print("→ 二重時計の嘘は『経済日を見やすくアニメ表示する』提示層だけ。経済は壊れない。")

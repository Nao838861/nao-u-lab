# 市場実験: 競合するリソースは「使用価値の天井」で正しく配分されるか (2026-07-15 Mir)
# 発端: Nao_u「需給バランス的に欲しいリソースが競合した時、価格変動やそのリソースの
#        費用対効果などをエージェントが把握して取引される？炭が欲しい人は複数いそう」
#
# モデルの核心 (Gode & Sunder 1993 の再読):
#   ZI-C トレーダーの高い配分効率は「ランダムだが自分の使用価値(redemption value)より
#   損な取引はしない」から出る。使用価値は実験では外生的に与えられた。
#   本作では生産者の使用価値=導出需要が自前で計算できる:
#     炭1荷の私にとっての価値 = 自分の製品の価格信念 × 炭1荷あたり産出増分
#   これは先読みでも最適化でもなく、今日の信念の掛け算1回(帳簿仕事)。
#   正典ルール2「信念より安ければ買う」の信念を「使用価値の天井」に置き換える精緻化。
#
# 実験1: 炭の競合 (世帯の暖・塩小屋・燻製場・製鉄) — 天井あり(A) vs 信念のみ(B)
# 実験2: 魚の用途フリップ (食料 vs 肥料) と対岸進出の閾値

import random
random.seed(7)

def call_auction(bids, asks):
    """1日1回のコール市場(一物一価): 交差する量kを求め、全約定を限界対(k番目)の中点で清算。
    進出採算などの価格シグナルは平均でなくこの限界価格が担う"""
    bids = sorted(bids, key=lambda x: -x[1]); asks = sorted(asks, key=lambda x: x[1])
    k = 0
    for (_, b), (_, a) in zip(bids, asks):
        if b < a: break
        k += 1
    if k == 0: return []
    p = (bids[k - 1][1] + asks[k - 1][1]) / 2
    return [(bids[i][0], asks[i][0], p) for i in range(k)]

# ---------- 実験1: 炭市場 ----------
# 買い手クラス: (名前, 使用価値の天井, 需要荷数/日)
# 使用価値: 世帯の暖=2.0 / 塩小屋=塩信念2.5×増分1.6-労賃≈3.0 / 燻製場=干物信念0.9×増分6≈5.0 / 製鉄=8.0
def exp1(supply, buyers, mode, days=200):
    served = {name: 0 for name, _, _ in buyers}; total = {name: d * days for name, _, d in buyers}
    prices = []; belief = 1.5
    for day in range(days):
        bids = []
        for name, ceil, dem in buyers:
            for _ in range(dem):
                if mode == 'A':      # 天井あり: 0〜使用価値の間でランダム唱値 (ZI-C)
                    bids.append((name, random.uniform(0.5, 1.0) * ceil))
                else:                # 信念のみ: 全員が市場価格信念の周りで唱値(使用価値を知らない)
                    bids.append((name, belief * random.uniform(0.8, 1.2)))
        asks = [('kiln', random.uniform(1.0, 1.4)) for _ in range(supply)]
        tr = call_auction(bids, asks)
        for b_id, _, p in tr:
            served[b_id] += 1; prices.append(p)
        if prices: belief += (prices[-1] - belief) * 0.1
    avgp = sum(prices) / len(prices) if prices else 0
    return {n: served[n] / total[n] for n in served}, avgp

BUYERS_P1 = [('世帯の暖', 2.0, 6), ('塩小屋', 3.0, 4)]                      # 供給12: 潤沢
BUYERS_P2 = [('世帯の暖', 2.0, 6), ('塩小屋', 3.0, 4), ('燻製場', 5.0, 6)]   # 供給12: 逼迫
BUYERS_P3 = [('世帯の暖', 2.0, 6), ('塩小屋', 3.0, 4), ('燻製場', 5.0, 6),
             ('製鉄', 8.0, 8)]                                              # 供給12: 危機

print('== 実験1: 炭の競合 — 充足率(その用途が必要量の何%を確保できたか) と 平均価格 ==')
print(f"{'phase':>8} {'mode':>4} {'世帯の暖':>7} {'塩小屋':>6} {'燻製場':>6} {'製鉄':>5} {'価格':>5}")
for label, buyers in (('P1潤沢', BUYERS_P1), ('P2逼迫', BUYERS_P2), ('P3危機', BUYERS_P3)):
    for mode in ('A', 'B'):
        sv, p = exp1(12, buyers, mode)
        row = ' '.join(f"{sv.get(n, 0)*100:>6.0f}%" for n in ('世帯の暖', '塩小屋', '燻製場', '製鉄') if any(b[0] == n for b in buyers))
        print(f"{label:>8} {mode:>4} {row}  価格{p:.2f}")

# ---------- 実験2: 魚の用途フリップ (菜の花の沖) ----------
# 供給: 近海の湾 MSY=260荷/日 (それ以上は乱獲)。
# 買い手: 食用世帯 (人口×1荷/日・天井=食料信念2.0)
#        麦農家の肥料需要 (畑数×8荷/日・天井=麦信念×増分。+15%収量/施肥畑)
# 麦1枚=収穫720荷/年→肥料で+108荷。肥料は畑1枚に8荷/日×耕作期90日=720荷 → 増分価値/荷 ≈ 108×麦価0.8/720 ≈ 0.12…
# それでは肥料が絶対に勝てないので史実の比率に寄せる: 鰊粕は濃縮加工品。
# 魚8荷→〆粕1荷、畑1枚は年〆粕12荷で+15% → 魚1荷あたり増分価値 = 108×0.8/(12×8) ≈ 0.9
# 人口(食用)と畑数(肥料)の成長で、湾のMSYの取り合いがどう推移するか
print('\n== 実験2: 魚の用途フリップ — 食用 vs 肥料(〆粕) の配分と価格 ==')
print(f"{'年':>3} {'人口':>5} {'畑':>4} {'食用需要':>7} {'肥料需要':>7} {'食用確保%':>7} {'肥料確保%':>7} {'価格':>5} {'対岸採算':>7}")
FAR_COST = 1.35   # 対岸漁場の限界コスト(往復の距離税・輸送) — 価格がこれを超えたら進出が採算化
# 史実の構造(菜の花の沖/鰊粕): 食用は鮮度ゆえ近海しか使えず天井が高い(2.0)。
# 肥料は加工(〆粕)して運べるので天井は換金作物の限界価値で一定(1.6)。
# → 近海の湾をまず食卓が取り、肥料需要は「あぶれた分」が対岸の未開の漁場を採算化する
sell_belief = 0.7   # 漁師の価格信念(年をまたいで持続=島の記憶)
for year in range(1, 9):
    pop = 90 + 130 * (year - 1)          # 食用需要=人口×1
    fields = 1 + 3 * (year - 1)          # 麦畑の拡大
    food_d = pop
    fert_d = fields * 8                   # 畑1枚=魚8荷/日(〆粕換算)
    food_ceil = 2.0; fert_ceil = 1.6
    served = {'food': 0, 'fert': 0}; prices = []
    for day in range(100):
        bids = [('food', random.uniform(0.5, 1.0) * food_ceil) for _ in range(food_d)] + \
               [('fert', random.uniform(0.5, 1.0) * fert_ceil) for _ in range(int(fert_d))]
        # 売り手(漁師)は信念の周りで唱値。売り切れが続けば信念が上がる(正典ルール1-2:
        # 緩い平均信念+高ければ売る。完売=市場からの「もっと高くても売れる」シグナル)
        asks = [('bay', sell_belief * random.uniform(0.9, 1.2)) for _ in range(260)]
        tr = call_auction(bids, asks)
        for b_id, _, p in tr:
            served[b_id] += 1; prices.append(p)
        if tr:
            sell_belief += (tr[0][2] - sell_belief) * 0.05
            if len(tr) == 260: sell_belief *= 1.01   # 完売→強気に
    fsv = served['food'] / (food_d * 100); psv = served['fert'] / (fert_d * 100) if fert_d else 0
    avgp = sum(prices) / len(prices)
    far = '★採算' if avgp > FAR_COST else '-'
    print(f"{year:>3} {pop:>5} {fields:>4} {food_d:>7} {fert_d:>7.0f} {fsv*100:>7.0f} {psv*100:>7.0f} {avgp:>5.2f} {far:>7}")
print("(対岸採算=平均価格が対岸漁場の限界コスト1.35を超えた年=島の反対側への進出が市場から動機づけられる)")

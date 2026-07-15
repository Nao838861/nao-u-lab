# -*- coding: utf-8 -*-
# 空間シミュレーション v1 (Exp1系) — 2026-07-15 Mir
# 発端: Nao_u「そろそろ空間を考慮したシミュレーションに進んで欲しい。
#        膨大な時間がかかってもいいので検証しやすいやつをしっかり作って」
#
# v8ペーシング系(島単位の一つの財布・価格固定)と違い、ここでは:
#   - 実座標(2D)・職住一体・市場は港に1つ(v1)
#   - 世帯別の財布・パントリー・価格信念 → 貨幣循環そのものを検証できる(DF金詰まり検査)
#   - 価格はダブルオークション(1日1回のコール市場・一物一価)から創発
#   - エージェントは正典5ルールのみ+使用価値の天井(トグル=Nao_u判断待ちの両論を検証可能)
#   - 検証装置: 貨幣総量保存・財ごとの質量収支を毎日assert / 決定論的乱数 / 日次メトリクス
#
# 意図的にv1で入れないもの: 移民・建設・複数市場・行商・信用/借金(会社は現金)・畜産・鉄

import random
from collections import defaultdict

GOODS = ['fish', 'veg', 'wheat', 'pres', 'tools', 'salt', 'char']
FOODS = ['fish', 'veg', 'wheat', 'pres']
KIND = dict(fish='fish', veg='veg', wheat='wheat', pres='fish')  # 多様性の種別(保存食=魚枠)

P = dict(
    HH_SIZE=9, EAT=9.0,                  # 1人1荷/日 × 世帯9人
    PANTRY_FOOD_D=6, PANTRY_CULT_D=20,   # パントリー目標(日数)
    DIVERSITY_RATION=0.15,               # 貯蔵財(麦・保存)からの多様性小口
    # 生産レート(荷/日, Lv0) — v8と同じスケール
    Y_FISH=10.0, Y_FISH_W=2.5, Y_VEG=6.0, Y_WHEAT=720.0, Y_TOOLS=4.0,
    Y_CHAR=1.5, Y_SALT=12.0,
    SALT_CHAR=1.0,                       # 製塩1日の燃料
    PR_SALT=0.6, PR_SMOKE=0.95, SMOKE_CHAR=0.1, PRES_SALT=0.125,  # 魚8荷に塩1荷
    # 文化の維持フロー(荷/日/世帯)
    D_TOOL=0.20, D_SALT=0.06, D_CHAR=0.12,
    LV_MULT=1.585, UP_DAYS=45, DOWN_DAYS=60,
    # 移動: 市場往復の時間割合 = dist × RATE (道路×0.6, 上限0.7)
    TRAVEL_RATE=0.16, ROAD_F=0.6, TRAVEL_MAX=0.7,
    HAUL=40.0,                           # 1往復の運搬容量(荷)
    # 会社(港の商館): 輸入売値 / 輸出買値(買い叩き)+日次天井
    IMP=dict(wheat=2.0, tools=3.5, salt=3.0),
    EXP=dict(pres=0.8), EXP_CAP=dict(pres=25.0),
    PUBWORKS=0.0,                        # 公費建設: 会社が市場で道具を買う予算/日(貨幣注入弁)
    # 資源プール(残量比例+再生下限)
    BAY_S0=600_000.0, BAY_R=0.00175, RESEED=0.3,
    GROVE_S0=60_000.0, GROVE_R=0.0006,
    PURSE0=60.0, TREASURY0=3000.0,
    USE_VALUE_CEILING=True,              # 使用価値の天井(ルール2精緻化) — Falseで純信念ZI
    JOB_SWITCH=False,                    # 正典ルール5(転職) — シナリオで有効化
    BELIEF_LR=0.2, UNSOLD_DECAY=0.98,
)

LADDER = {
    'farm':    ['food1', 'tools', 'salt', 'food2', 'char', 'iron'],
    'fish':    ['grain', 'tools', 'salt', 'char', 'food2', 'iron'],
    'lumber':  ['food1', 'tools', 'food2', 'salt', 'char', 'iron'],
    'artisan': ['food1', 'food2', 'salt', 'char', 'cloth', 'iron'],
}
JOBCLS = dict(fisher='fish', wheat='farm', veg='farm', woodshop='lumber',
              charburner='lumber', saltworks='artisan')
BELIEF0 = dict(fish=1.0, veg=1.0, wheat=1.2, pres=1.2, tools=2.0, salt=2.0, char=1.5)


class HH:
    _next = 0

    def __init__(self, job, pos, road=False, purse=None):
        self.id = HH._next; HH._next += 1
        self.job = job; self.pos = pos; self.road = road
        self.purse = P['PURSE0'] if purse is None else purse
        self.pantry = defaultdict(float)
        self.belief = dict(BELIEF0)
        self.lv = 0; self.up = 0; self.down = 0
        self.kind_days = defaultdict(int)   # 食の種別→最近45日で食べた日数
        self.kind_log = []                  # (day, set(kinds))
        self.sat_today = {}
        self.income30 = 0.0; self.income_log = []
        self.hunger = 0; self.wheat_work = 0.0
        self.offered_unsold = set()

    def mult(self):
        return P['LV_MULT'] ** self.lv

    def cls(self):
        return JOBCLS[self.job]


class Market:
    """1日1回のコール市場(一物一価)。bids/asks=(hh_or_co, qty, price)"""

    def __init__(self, world):
        self.w = world

    def clear(self, good, bids, asks):
        bids = sorted(bids, key=lambda x: -x[2])
        asks = sorted(asks, key=lambda x: x[2])
        trades = []; bi = ai = 0
        bq = bids[0][1] if bids else 0.0
        aq = asks[0][1] if asks else 0.0
        price_pair = None
        while bi < len(bids) and ai < len(asks) and bids[bi][2] >= asks[ai][2]:
            q = min(bq, aq)
            trades.append([bids[bi][0], asks[ai][0], q])
            price_pair = (bids[bi][2], asks[ai][2])
            bq -= q; aq -= q
            if bq <= 1e-12:
                bi += 1; bq = bids[bi][1] if bi < len(bids) else 0.0
            if aq <= 1e-12:
                ai += 1; aq = asks[ai][1] if ai < len(asks) else 0.0
        self.unfilled_bid = bids[bi][2] if bi < len(bids) else None
        if not trades:
            return 0.0, 0.0
        # 一様清算値: 限界の売り唱値と「最初に落選した買い唱値」の高い方(限界の買い唱値が上限)。
        # 中点方式だと全買い手の唱値が高い時に供給弾力的な財(輸入)でもパリティを突き抜ける
        mb, ma = price_pair
        next_bid = bids[bi][2] if bi < len(bids) else None
        price = min(mb, max(ma, next_bid if next_bid is not None else ma))
        vol = 0.0
        for buyer, seller, q in trades:
            cost = q * price
            # 買い手の予算チェック(唱値は予算内で出しているが端数を保証)
            if isinstance(buyer, HH):
                q = min(q, buyer.purse / price if price > 0 else q)
                cost = q * price
                buyer.purse -= cost; buyer.pantry[good] += q
                buyer.belief[good] += (price - buyer.belief[good]) * P['BELIEF_LR']
            else:  # 会社が買う(輸出/公共事業)
                self.w.treasury -= cost
                if good in P['EXP']: self.w.exported[good] += q
                else: self.w.pubworks_bought += q
            if isinstance(seller, HH):
                seller.purse += cost; seller.pantry[good] -= q
                seller.income30 += cost
                seller.belief[good] += (price - seller.belief[good]) * P['BELIEF_LR']
                seller.offered_unsold.discard(good)
            else:  # 会社が売る(輸入)
                self.w.treasury += cost
                self.w.imported[good] += q
            vol += q
        return price, vol


DEFAULTS = dict(P)


class World:
    def __init__(self, hhs, seed=1, market_pos=(0.0, 0.0), overrides=None):
        P.update(DEFAULTS)               # 前のWorldのoverride汚染を防ぐ
        if overrides:
            P.update(overrides)
        self.rng = random.Random(seed)
        self.hhs = hhs
        self.market_pos = market_pos
        self.market = Market(self)
        self.treasury = P['TREASURY0']
        self.bay = P['BAY_S0']; self.grove = P['GROVE_S0']
        self.day = 0
        self.prices = defaultdict(list)       # good → [(day, price, vol)]
        self.rows = []
        self.money0 = self.total_money()
        self.imported = defaultdict(float); self.exported = defaultdict(float)
        self.pubworks_bought = 0.0
        self.famine_days = 0
        self.job_income = defaultdict(list)   # 転職の観測用(市場で見える公開情報)
        self.events = []

    # ---------- 検証装置 ----------
    def total_money(self):
        return self.treasury + sum(h.purse for h in self.hhs)

    def assert_money(self):
        m = self.total_money()
        assert abs(m - self.money0) < 1e-6, f"貨幣保存則違反: {m} != {self.money0} (day {self.day})"

    # ---------- 1日 ----------
    def dist(self, h):
        dx = h.pos[0] - self.market_pos[0]; dy = h.pos[1] - self.market_pos[1]
        return (dx * dx + dy * dy) ** 0.5

    def travel_share(self, h):
        f = P['ROAD_F'] if h.road else 1.0
        return min(P['TRAVEL_MAX'], self.dist(h) * 2 * P['TRAVEL_RATE'] * f)

    def season(self, mm):
        return 'winter' if mm >= 10 else 'grow'

    def step(self):
        self.day += 1; d = self.day
        mm = ((d - 1) // 30) % 12 + 1
        se = self.season(mm)
        bal = defaultdict(lambda: defaultdict(float))   # 質量収支: good → {src: qty}
        stock_pre = {g: sum(h.pantry[g] for h in self.hhs) for g in GOODS}

        # --- 市場に行くか(パントリー不足 or 売り物あり or 生鮮の日売り) ---
        # 漁師は魚が翌日腐るので毎日市に立つ(魚市が心拍を刻む)。朝の判断なので
        # 貯蔵財の売り物は前日在庫で判断する
        going = {}
        for h in self.hhs:
            need = self.buy_targets(h)
            sell = self.sell_offers_qty(h)
            going[h.id] = bool(need or sell) or h.job == 'fisher'

        # --- 生産(職住一体・市場に行く日は移動が労働を食う) ---
        for h in self.hhs:
            ts = self.travel_share(h) if going[h.id] else 0.0
            w = (1 - ts) * h.mult()
            j = h.job
            if j == 'fisher':
                dep = self.bay / P['BAY_S0']
                q = (P['Y_FISH_W'] if se == 'winter' else P['Y_FISH']) * w * dep
                self.bay = min(P['BAY_S0'], self.bay - q + P['BAY_R'] * self.bay * (1 - dep)
                               + P['RESEED'] * (1 - dep))
                h.pantry['fish'] += q; bal['fish']['prod'] += q
            elif j == 'veg' and 3 <= mm <= 10:
                q = P['Y_VEG'] * w; h.pantry['veg'] += q; bal['veg']['prod'] += q
            elif j == 'wheat':
                h.wheat_work += (1 - ts)
                if mm == 9 and d % 30 == 15:
                    q = P['Y_WHEAT'] * h.mult() * min(1.0, h.wheat_work / 300)
                    h.pantry['wheat'] += q; bal['wheat']['prod'] += q
                    h.wheat_work = 0.0
            elif j == 'woodshop':
                dep = self.grove / P['GROVE_S0']
                q = P['Y_TOOLS'] * w * dep
                self.grove = min(P['GROVE_S0'], self.grove - q * 2
                                 + P['GROVE_R'] * self.grove * (1 - dep) + 0.2 * (1 - dep))
                h.pantry['tools'] += q; bal['tools']['prod'] += q
            elif j == 'charburner':
                dep = self.grove / P['GROVE_S0']
                q = P['Y_CHAR'] * w * dep
                self.grove = min(P['GROVE_S0'], self.grove - q * 1.5
                                 + P['GROVE_R'] * self.grove * (1 - dep) + 0.2 * (1 - dep))
                h.pantry['char'] += q; bal['char']['prod'] += q
            elif j == 'saltworks':
                fuel = min(P['SALT_CHAR'], h.pantry['char'])
                q = P['Y_SALT'] * w * (fuel / P['SALT_CHAR'])
                h.pantry['char'] -= fuel; bal['char']['used'] += fuel
                h.pantry['salt'] += q; bal['salt']['prod'] += q

        # --- 市場セッション ---
        clearing = {}
        for g in GOODS:
            bids, asks = [], []
            for h in self.hhs:
                if not going[h.id]: continue
                tgt = self.buy_targets(h).get(g)
                if tgt:
                    qty, ceil = tgt
                    price = min(h.belief[g] * self.rng.uniform(0.95, 1.15), ceil)
                    budget = h.purse * 0.9
                    qty = min(qty, budget / price if price > 0 else 0)
                    if qty > 1e-9 and price > 1e-9:
                        bids.append((h, qty, price))
                sq = self.sell_offers_qty(h).get(g, 0.0)
                if sq > 1e-9:
                    ask = h.belief[g] * self.rng.uniform(0.95, 1.10)
                    asks.append((h, sq, ask)); h.offered_unsold.add(g)
            # 会社: 輸入の売り(無制限)・輸出の買い(買い叩き+天井)・公共事業の買い
            if g in P['IMP']:
                asks.append(('CO', 1e9, P['IMP'][g]))
            if g in P['EXP']:
                bids.append(('CO', P['EXP_CAP'][g], P['EXP'][g]))
            if g == 'tools' and P['PUBWORKS'] > 0:
                # 公費建設: 輸入パリティ(3.5)の少し下で地場の道具を買う=貨幣の注入弁
                bids.append(('CO', P['PUBWORKS'] / 3.4, 3.4))
            pre_pantry = {h.id: h.pantry[g] for h, q, p_ in bids if isinstance(h, HH)}
            wanted = {h.id: q for h, q, p_ in bids if isinstance(h, HH)}
            pr, vol = self.market.clear(g, bids, asks)
            # 買い損ねの学習(ルール1の対称化): 欲しい量の3割も買えなければ信念を上げる
            for h in self.hhs:
                if h.id in wanted and wanted[h.id] > 1e-6:
                    got = h.pantry[g] - pre_pantry[h.id]
                    if got < wanted[h.id] * 0.3:
                        h.belief[g] = min(h.belief[g] * 1.04, 12.0)
            # 未約定の買い唱値は市場で「叫ばれて」いる=売り手側の観測(ルール1)。
            # これが無いと「取引ゼロ→価格観測ゼロ→供給者が需要に気づかない」デッドロック
            # (冬の魚市が立たない)に落ちる
            ub = self.market.unfilled_bid
            if ub is not None:
                my_good = dict(fisher='fish', veg='veg', wheat='wheat', woodshop='tools',
                               charburner='char', saltworks='salt')
                for h in self.hhs:
                    if going[h.id] and my_good[h.job] == g and ub > h.belief[g]:
                        h.belief[g] += (ub - h.belief[g]) * 0.1
            if vol > 1e-9:
                clearing[g] = pr
                self.prices[g].append((d, pr, vol))
        for h in self.hhs:   # 売れ残り→信念を下げる(ルール4の裏面)
            for g in list(h.offered_unsold):
                h.belief[g] *= P['UNSOLD_DECAY']
            h.offered_unsold.clear()

        # --- 食べる(多様性小口+フロー水充填+不足時取り崩し) ---
        for h in self.hhs:
            need = P['EAT']; kinds = set()
            for g in ('pres', 'wheat'):
                u = min(h.pantry[g], need * P['DIVERSITY_RATION'])
                h.pantry[g] -= u; need -= u
                if u > 1e-9: kinds.add(KIND[g]); bal[g]['eat'] += u
            for _ in range(2):
                act = [g for g in ('fish', 'veg') if h.pantry[g] > 1e-9]
                if not act or need <= 1e-9: break
                share = need / len(act)
                for g in act:
                    u = min(h.pantry[g], share)
                    h.pantry[g] -= u; need -= u
                    if u > 1e-9: kinds.add(KIND[g]); bal[g]['eat'] += u
            for g in ('pres', 'wheat'):
                if need <= 1e-9: break
                u = min(h.pantry[g], need)
                h.pantry[g] -= u; need -= u
                if u > 1e-9: kinds.add(KIND[g]); bal[g]['eat'] += u
            if need > 0.5:
                h.hunger += 1; self.famine_days += 1
            h.kind_log.append((d, kinds))
            for k in kinds: h.kind_days[k] += 1
            while h.kind_log and h.kind_log[0][0] <= d - 45:
                _, old = h.kind_log.pop(0)
                for k in old: h.kind_days[k] -= 1

        # --- 文化の維持消費 + 漁師の保存加工 ---
        for h in self.hhs:
            sat = {}
            for g, dd in (('tools', P['D_TOOL']), ('salt', P['D_SALT']), ('char', P['D_CHAR'])):
                u = min(h.pantry[g], dd)
                h.pantry[g] -= u; bal[g]['cult'] += u
                sat[g] = u >= dd * 0.95
            sat['food1'] = len([k for k, v in h.kind_days.items() if v > 0]) >= 1
            sat['food2'] = len([k for k, v in h.kind_days.items() if v > 5]) >= 2
            sat['grain'] = h.kind_days.get('wheat', 0) > 5
            sat['iron'] = False; sat['cloth'] = False
            sat['tools'] = sat['tools']
            h.sat_today = sat
            if h.job == 'fisher' and h.pantry['fish'] > 1e-9:
                raw = min(h.pantry['fish'], h.pantry['salt'] / P['PRES_SALT'])
                smoked = min(raw, h.pantry['char'] / P['SMOKE_CHAR'])
                yld = smoked * P['PR_SMOKE'] + (raw - smoked) * P['PR_SALT']
                h.pantry['fish'] -= raw; h.pantry['salt'] -= raw * P['PRES_SALT']
                h.pantry['char'] -= smoked * P['SMOKE_CHAR']
                h.pantry['pres'] += yld
                bal['fish']['preserve'] += raw; bal['salt']['preserve'] += raw * P['PRES_SALT']
                bal['char']['preserve'] += smoked * P['SMOKE_CHAR']
                bal['pres']['prod'] += yld

        # --- 魚の即日腐敗 ---
        for h in self.hhs:
            if h.pantry['fish'] > 1e-9:
                bal['fish']['spoil'] += h.pantry['fish']
                h.pantry['fish'] = 0.0

        # --- ラダー ---
        for h in self.hhs:
            reqs = LADDER[h.cls()]
            keep = all(h.sat_today[reqs[i]] for i in range(h.lv))
            nxt = h.sat_today[reqs[h.lv]] if h.lv < len(reqs) else False
            if keep and nxt:
                h.up += 1; h.down = 0
                if h.up >= P['UP_DAYS'] * (h.lv + 1):
                    h.lv += 1; h.up = 0
                    self.events.append((d, f'HH{h.id}({h.job}) ▲Lv{h.lv}'))
            elif keep:
                h.up = 0; h.down = 0
            else:
                h.up = 0; h.down += 1
                if h.down >= P['DOWN_DAYS'] and h.lv > 0:
                    h.lv -= 1; h.down = 0
                    self.events.append((d, f'HH{h.id}({h.job}) ▼Lv{h.lv}'))

        # --- 転職(正典ルール5・市場で見えた稼ぎの比較のみ) ---
        for h in self.hhs:
            h.income_log.append(h.income30); h.income30 = 0.0
            if len(h.income_log) > 30: h.income_log.pop(0)
        if P['JOB_SWITCH'] and d % 30 == 0:
            obs = defaultdict(list)
            for h in self.hhs:
                obs[h.job].append(sum(h.income_log))
            avg = {j: sum(v) / len(v) for j, v in obs.items() if v}
            for h in self.hhs:
                mine = sum(h.income_log)
                best = max(avg, key=lambda j: avg[j])
                if avg[best] > max(mine, 1.0) * 1.5 and best != h.job and self.rng.random() < 0.3:
                    self.events.append((d, f'HH{h.id} 転職 {h.job}→{best}'))
                    h.job = best; h.lv = min(h.lv, 1)

        # --- 検証: 貨幣保存 + 質量収支 ---
        self.assert_money()
        if not hasattr(self, '_imp_prev'):
            self._imp_prev = defaultdict(float); self._exp_prev = defaultdict(float)
        for g in GOODS:
            imp_d = self.imported[g] - self._imp_prev[g]
            exp_d = self.exported[g] - self._exp_prev[g]
            self._imp_prev[g] = self.imported[g]; self._exp_prev[g] = self.exported[g]
            stock_now = sum(h.pantry[g] for h in self.hhs)
            src = bal[g]
            used = src['eat'] + src['cult'] + src['used'] + src['preserve'] + src['spoil']
            err = (stock_pre[g] + src['prod'] + imp_d) - (stock_now + used + exp_d
                  + (self.pubworks_bought - getattr(self, '_pw_prev', 0.0) if g == 'tools' else 0.0))
            if g == 'tools':
                self._pw_prev = self.pubworks_bought
            assert abs(err) < 1e-5, f"質量収支違反 {g}: err={err} day={self.day}"

        # --- 日次メトリクス ---
        if d % 30 == 0:
            self.rows.append(dict(
                day=d, m=(d - 1) // 30 + 1, mm=mm,
                prices={g: round(self.prices[g][-1][1], 2) for g in GOODS if self.prices[g]
                        and self.prices[g][-1][0] > d - 30},
                purse_sum=round(sum(h.purse for h in self.hhs), 1),
                treasury=round(self.treasury, 1),
                famine=self.famine_days,
                bay=round(self.bay / P['BAY_S0'] * 100),
                grove=round(self.grove / P['GROVE_S0'] * 100),
                lv={h.id: h.lv for h in self.hhs},
            ))

    # ---------- 売買の意思決定(正典ルール2/3/4) ----------
    def buy_targets(self, h):
        """ルール3の順: 食料→生業の入力→文化財。{good:(qty,ceiling)}"""
        t = {}
        food_days = sum(h.pantry[g] for g in FOODS) / P['EAT']
        cheapest = min(h.belief[g] for g in ('veg', 'wheat', 'pres'))
        if food_days < P['PANTRY_FOOD_D']:
            starving = food_days < 1.5
            for g in ('veg', 'wheat', 'pres'):   # 貯蔵できる食料はパントリー目標まで
                qty = (P['PANTRY_FOOD_D'] - food_days) * P['EAT'] / 3
                # 天井=信念×1.5、ただし最安の代替食の2.2倍まで(多様性プレミアムは有限。
                # これが無いと買い損ね学習で信念が暴走し麦2.0の隣で魚を9で買う)
                ceil = 99.0 if starving else min(h.belief[g] * 1.5, cheapest * 2.2)
                t[g] = (qty, ceil)
        # 魚は即日腐敗: 蓄えでなく「今日の食卓の分」を毎日買う(魚市が心拍を刻む)
        if h.job != 'fisher':
            ceil = 99.0 if food_days < 1.5 else min(h.belief['fish'] * 1.5, cheapest * 2.2)
            t['fish'] = (P['EAT'] * 0.5, ceil)
        uv = P['USE_VALUE_CEILING']
        if h.job == 'saltworks' and h.pantry['char'] < P['SALT_CHAR'] * 5:
            ceil = (P['Y_SALT'] * h.belief['salt'] * 0.5 if uv else h.belief['char'] * 1.2)
            t['char'] = (P['SALT_CHAR'] * 10 - h.pantry['char'], ceil)
        if h.job == 'fisher':
            if h.pantry['salt'] < 3:
                ceil = (h.belief['pres'] * P['PR_SALT'] / P['PRES_SALT'] * 0.5 if uv
                        else h.belief['salt'] * 1.2)
                t['salt'] = (6 - h.pantry['salt'], ceil)
            if h.pantry['char'] < 2:
                ceil = ((P['PR_SMOKE'] - P['PR_SALT']) * h.belief['pres'] / P['SMOKE_CHAR'] * 0.5
                        if uv else h.belief['char'] * 1.2)
                t['char'] = (4 - h.pantry['char'], ceil)
        # 文化の維持フロー(暖・道具・食卓の塩)
        for g, dd, val in (('tools', P['D_TOOL'], 2.5), ('salt', P['D_SALT'], 2.5),
                           ('char', P['D_CHAR'], 2.0)):
            if g in t: continue
            if h.pantry[g] < dd * P['PANTRY_CULT_D'] * 0.5:
                ceil = (val if uv else h.belief[g] * 1.2)
                t[g] = (dd * P['PANTRY_CULT_D'] - h.pantry[g], ceil)
        return t

    def sell_offers_qty(self, h):
        """ルール4: 自分の産物の余剰を少しずつ売る"""
        out = {}
        my = dict(fisher='fish', veg='veg', wheat='wheat', woodshop='tools',
                  charburner='char', saltworks='salt')[h.job]
        keep = P['EAT'] * 2 if my in FOODS else 2.0
        if my == 'fish':
            # 魚は今日腐る: 食べる分以外は全部売る。さらに魚価が他の食料より十分
            # 高ければ自分の食べる分も売って安い食料を買う(ルール2の帰結。
            # 冬の漁師は高い魚を売って麦を食う=史実の漁村)
            keep_own = P['EAT']
            alt = min(h.belief['veg'], h.belief['wheat'], h.belief['pres'])
            if h.belief['fish'] > alt * 1.5:
                keep_own = P['EAT'] * 0.3
            surplus = max(0.0, h.pantry['fish'] - keep_own)
            if surplus > 1e-9:
                out[my] = min(surplus, P['HAUL'])
        else:
            # 貯蔵財は少しずつ売る(正典ルール4)。一括投げ売りは端境期の市を殺す
            surplus = max(0.0, h.pantry[my] - keep)
            if surplus > 1e-9:
                out[my] = min(surplus * 0.04 + 2.0, surplus, P['HAUL'])
        if h.job == 'fisher' and h.pantry['pres'] > P['EAT'] * P['PANTRY_FOOD_D']:
            out['pres'] = min(h.pantry['pres'] - P['EAT'] * P['PANTRY_FOOD_D'], P['HAUL'])
        return out

    def run(self, days):
        for _ in range(days):
            self.step()
        return self

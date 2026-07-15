# v8 統合シミュレーションエンジン (2026-07-15 Mir)
# v7(距離・環)からの精度向上:
#  1. 施設別・細分化文化Lv (productivity_ladder.md 大改訂): 職種別要求ラダー Lv0-6,
#     倍率 1.585^Lv (幾何), 昇格=30日連続供給 / 降格=60日欠乏 (ヒステリシス), 累積メンテ
#  2. 資源の有限性 (resources.md 3クラスモデル): 産出は残量に比例して細る。
#     生物系(漁場・森)のみロジスティック回復。鉱山系は2年窓の外(老いるだけ)
#  3. 輸出(木材・保存魚)と債務返済・利子
#  4. 信用限界カーブ (最終通告=ソフトGO) — 初見GO 4-5年目を目標に較正
#  5. 応募者プール (1+評判段階) — 初手大量招致の悪用テスト
# 限界(明示): 島単位の充足率で全世帯のLvを判定(世帯別財布なし)。布・鉄は輸入財としてのみ。
#             価格は固定(創発価格なし) — これはペーシング検証機であり市場検証機ではない。

import math

D_RING = {0: 0.10, 1: 0.50, 2: 1.20}
def h(D): return min(0.85, 0.05 + 0.45 * D)

BASE = dict(fish=10.0, fish_w=2.5, veg=6.0, wheat=720.0, wood=6.0,
            shop=4.0, char=4.0, salt=12.0)

P = dict(
    HH=9, CAPITAL=3000.0, PASSAGE=60.0, BUILD_L=5, KIT_L=40,
    FOOD_IMP=2.0, LUM_IMP=4.0, SALT_IMP=3.0, IRON_IMP=8.0,
    EXP_LOG=1.2, EXP_PRES=2.2,          # 輸出単価(本土は穀物豊富=麦安、木材・保存魚が主力)
    ROAD1_L=20, ROAD2_L=30,
    GRANT=150.0, GRANT_M=6,             # 支援金 M1-6
    FREE_M=18,                          # 無利子期間 M7-18
    IRATE=0.05 / 12,                    # 以後 月利
    CREDIT0=20000.0, CREDIT_G=1250.0, CREDIT_FREEZE=24,
    # 信用限界 = C0 + G*min(月,24)。第4回検出: 初見の債務曲線は凹型(1-3年で急伸→
    # 以後は利子のみ)なので、直線の限度では4年目に交差しない。支援期に限度が伸び
    # 月24で凍結(本国の忍耐が切れる)→初見はその後の利子と端境期輸入でじわり超える
    # 世帯あたり日次の文化財需要 (要求ラダーの維持フロー)
    D_TOOL=0.20, D_SALT=0.06, D_CHAR=0.12, D_IRON=0.04,
    # 資源プール (残量比例則: 産出 *= S/S0)
    FISH_S0=300_000.0, FISH_R=0.0012,   # 湾の魚 (ロジスティック回復)
    GROVE_S0=9_000.0, GROVE_R=0.0004,   # 港近郊(r0)の小さな木立
    FOREST_S0=250_000.0, FOREST_R=0.0004,  # 遠環(r1,r2)の大森林
    PR=0.8,                              # 塩蔵歩留まり
)

# 職種→ラダー列: きこり/炭焼き=樵系, 木工/塩=職人系, 麦/菜=農家, 漁=漁師
LADDER = {
    'farm':    ['food1', 'tool', 'salt', 'food2', 'char', 'iron'],
    'fish':    ['grain', 'tool', 'salt', 'char', 'food2', 'iron'],
    'lumber':  ['food1', 'tool', 'food2', 'salt', 'char', 'iron'],
    'artisan': ['food1', 'food2', 'salt', 'char', 'cloth', 'iron'],
}
JOBCLS = dict(fish='fish', veg='farm', wheat='farm', wood='lumber',
              char='lumber', shop='artisan', salt='artisan')
MULT = [1.585 ** i for i in range(8)]


class Sim:
    def __init__(self, plan, name, roads_m=None, iron_from=None, exports=True,
                 years=2, repay=False, salt_cut=None, overfish=False):
        self.name = name; self.plan = plan; self.years = years
        self.roads_m = roads_m or {}
        self.iron_from = iron_from       # この月から鉄製品を輸入(中盤アップグレードB)
        self.exports = exports; self.repay = repay
        self.salt_cut = salt_cut         # ラダー転落テスト: この月から塩生産停止
        self.overfish = overfish
        self.hhs = [dict(j='fish', r=0), dict(j='veg', r=0), dict(j='wheat', r=1)]
        self.pop = 28; self.cap = P['CAPITAL']; self.debt = 0.0
        self.lumber = P['KIT_L']; self.logs = 0.0
        self.wheat = 0.0; self.pres = 0.0; self.veg_pool = []
        self.tools = 0.0; self.saltst = 0.0; self.charst = 0.0
        self.fishS = P['FISH_S0']; self.groveS = P['GROVE_S0']; self.forestS = P['FOREST_S0']
        self.lv = {c: 0 for c in LADDER}           # 職種クラス別Lv
        self.up = {c: 0 for c in LADDER}           # 昇格ストリーク(日)
        self.down = {c: 0 for c in LADDER}         # 欠乏ストリーク(日)
        self.roads = {1: False, 2: False}
        self.go_month = None; self.rows = []; self.events = []

    def pay(self, c):
        u = min(self.cap, c); self.cap -= u; self.debt += c - u

    def earn(self, c):
        if self.repay and self.debt > 0:
            r = min(self.debt, c); self.debt -= r; c -= r
        self.cap += c

    def pf(self, ring):
        d = D_RING[ring] * (0.6 if self.roads.get(ring) else 1.0)
        return 1 - h(d)

    def mult(self, j):
        return MULT[self.lv[JOBCLS[j]]]

    def pool(self, m):
        # 応募者プール: 基礎1 + 評判段階(人口60ごと+1, 上限+3)
        # v8修正F5: 最終通告後=0 (本国が渡航費信用を凍結)。第1回検出——
        # 評判を人口だけで決めるとGO後も移民が来続け悪用が加速する
        if self.go_month is not None: return 0
        return 1 + min(3, self.pop // 60)

    def credit_limit(self, m):
        return P['CREDIT0'] + P['CREDIT_G'] * min(m, P['CREDIT_FREEZE'])

    def run(self):
        days = self.years * 360
        for day in range(1, days + 1):
            m = (day - 1) // 30 + 1; mm = (m - 1) % 12 + 1
            se = 'winter' if mm >= 10 else ('spring' if mm <= 3 else
                 'summer' if mm <= 6 else 'autumn')
            if day % 30 == 1:
                self.month_start(m, mm, se)
            self.daily(day, m, mm, se)
            if day % 30 == 0:
                self.month_end(m, mm, se)
        return self

    def month_start(self, m, mm, se):
        self.mo = dict(new=[], fish=0.0, veg=0.0, logs=0.0, tools=0.0,
                       harv=0.0, presq=0.0, imp=0.0, exp=0.0, ev=[])
        if m <= P['GRANT_M']:
            self.earn(P['GRANT']); self.mo['ev'].append('支援金')
        if m > P['FREE_M'] and self.debt > 0:
            self.debt *= 1 + P['IRATE']
        for ring, rm in self.roads_m.items():
            if m == rm and not self.roads[ring]:
                need = P['ROAD%d_L' % ring]; t = min(self.lumber, need)
                self.lumber -= t
                if need - t > 0: self.pay((need - t) * P['LUM_IMP'])
                self.roads[ring] = True; self.mo['ev'].append(f'道路→r{ring}')
        # 移民 (応募者プールが月次上限)
        arrivals = [a for a in self.plan.get(m, [])][: self.pool(m)]
        dropped = len(self.plan.get(m, [])) - len(arrivals)
        if dropped > 0:
            self.mo['ev'].append(f'応募枯れ{dropped}世帯却下')
        if se != 'winter':
            for j, r in arrivals:
                self.hhs.append(dict(j=j, r=r)); self.pop += P['HH']
                self.pay(P['PASSAGE'])
                t = min(self.lumber, P['BUILD_L']); self.lumber -= t
                if P['BUILD_L'] - t > 0: self.pay((P['BUILD_L'] - t) * P['LUM_IMP'])
                self.mo['new'].append(f'{j}@r{r}')
        elif arrivals:
            self.mo['ev'].append('冬=渡航なし')
        if self.iron_from and m == self.iron_from:
            self.mo['ev'].append('鉄輸入開始')
        if self.salt_cut and m == self.salt_cut:
            self.hhs = [x for x in self.hhs if x['j'] != 'salt']
            self.mo['ev'].append('★塩生産停止(転落テスト)')

    def daily(self, day, m, mm, se):
        cnt = lambda j: [x for x in self.hhs if x['j'] == j]
        nhh = len(self.hhs)
        # --- 生産 (残量比例: 産出 *= S/S0) ---
        fdep = self.fishS / P['FISH_S0']
        fb = BASE['fish_w'] if se == 'winter' else BASE['fish']
        f = sum(fb * self.mult('fish') * self.pf(x['r']) for x in cnt('fish')) * fdep
        if self.overfish: f *= 1.0  # 努力一定・枯渇は残量則が表現
        self.fishS = min(P['FISH_S0'],
                         self.fishS - f + P['FISH_R'] * self.fishS * (1 - fdep))
        v = (sum(BASE['veg'] * self.mult('veg') * self.pf(x['r']) for x in cnt('veg'))
             if 3 <= mm <= 10 else 0.0)
        lg = 0.0
        for x in cnt('wood'):
            if x['r'] == 0:
                dep = self.groveS / P['GROVE_S0']
                q = BASE['wood'] * self.mult('wood') * self.pf(0) * dep
                self.groveS = min(P['GROVE_S0'],
                                  self.groveS - q + P['GROVE_R'] * self.groveS * (1 - dep))
            else:
                dep = self.forestS / P['FOREST_S0']
                q = BASE['wood'] * self.mult('wood') * self.pf(x['r']) * dep
                self.forestS = min(P['FOREST_S0'],
                                   self.forestS - q + P['FOREST_R'] * self.forestS * (1 - dep))
            lg += q
        self.logs += lg
        # v8修正F2: 文化財ストックに上限(需要90日分)。第1回検出「道具の山」対策——
        # 上限なしだと数千荷積み上がり、供給を断っても数年落ちない=フローのテーゼが死ぬ。
        # 実ゲームでは価格暴落→転職圧で自然に止まる。ペーシング系では在庫キャップで代用。
        # 余剰は材木のまま在庫→輸出へ(生産者は余剰を売る=正典ルール4)
        shopcap = sum(BASE['shop'] * self.mult('shop') * self.pf(x['r']) for x in cnt('shop'))
        use = min(self.logs, shopcap); self.logs -= use
        self.lumber += use
        toolcap = nhh * P['D_TOOL'] * 90
        tk = min(max(0.0, self.lumber - 20), max(0.0, toolcap - self.tools), use)
        self.lumber -= tk; self.tools += tk
        charcap = (nhh * P['D_CHAR'] + len(cnt('salt'))) * 90
        ch = min(sum(BASE['char'] * self.mult('char') * self.pf(x['r']) for x in cnt('char')),
                 self.logs, max(0.0, charcap - self.charst))
        self.logs -= ch; self.charst += ch
        salt_fuel = 0.0
        sp = 0.0
        for x in cnt('salt'):
            fuel = min(self.charst, 1.0)   # 製塩は燃料必須 (chains監査の漏れ対応)
            if fuel > 0:
                self.charst -= fuel
                sp += BASE['salt'] * self.mult('salt') * self.pf(x['r']) * fuel
        self.saltst += sp
        # --- 食料消費: 混合食 (v8修正F1) ---
        # v8第1回検出: 優先順消費(魚→…→麦)だと魚が豊富な夏に誰も麦を食べず
        # 漁師のgrain要件が季節発振(Lv0↔3の鞭打ち)。世帯は好みで混ぜて食べる=
        # 手に入る種類を比例配分で消費する(多様性は嗜好であって残り物処理ではない)
        need = self.pop * 1.0
        kinds = set()
        if v > 0: self.veg_pool.append([day, v])
        self.veg_pool = [x for x in self.veg_pool if day - x[0] <= 45]
        # v8修正F9 (第2回検出): 全種を均等に食べると夏に保存食・麦が食い尽くされ
        # 冬の蓄えが立たない。「多様性のために貯蔵も食べる」と「備えを保つ」(正典
        # ルール3)の衝突 → 貯蔵財(保存魚・麦)は多様性の小口(需要の15%)だけ日常消費し、
        # フロー(魚・野菜)で足りない分だけ取り崩す。漁師の穀物要件も通年成立する
        vst = sum(x[1] for x in self.veg_pool)
        cap_ = dict(fish=f, veg=vst, pres=self.pres, wheat=self.wheat)
        eaten = {k: 0.0 for k in cap_}; rem = need
        for k in ('pres', 'wheat'):       # 貯蔵からの多様性小口
            u = min(cap_[k], need * 0.15); eaten[k] += u; rem -= u
        # v8修正F11 (第3回検出): 麦蔵が空の期間は穀物小口を輸入で賄う(パンの輸入)。
        # これが無いと漁師のgrain要件が麦の年次パルスに同期して発振(端境期に毎年転落)。
        # 序盤の債務柱「食料輸入」の一部が「端境期の穀物」として通年に薄く広がる
        if cap_['wheat'] < 1e-9:
            q = need * 0.15; rem -= q
            self.pay(q * P['FOOD_IMP']); self.mo['imp'] += q
            kinds.add('wheat')
        for _ in range(3):                # フローを水充填
            act = [k for k in ('fish', 'veg') if cap_[k] - eaten[k] > 1e-9]
            if not act or rem <= 1e-9: break
            share = rem / len(act)
            for k in act:
                u = min(cap_[k] - eaten[k], share)
                eaten[k] += u; rem -= u
        for k in ('pres', 'wheat'):       # 不足時のみ蔵を取り崩す
            if rem <= 1e-9: break
            u = min(cap_[k] - eaten[k], rem); eaten[k] += u; rem -= u
        for k, q in eaten.items():
            if q > 0: kinds.add('fish' if k == 'pres' else k)
        fs = f - eaten['fish']
        self.pres -= eaten['pres']; self.wheat -= eaten['wheat']
        vq = eaten['veg']
        for x in self.veg_pool:
            u = min(x[1], vq); x[1] -= u; vq -= u
        self.veg_pool = [x for x in self.veg_pool if x[1] > 1e-9]
        if rem > 1e-9:
            self.pay(rem * P['FOOD_IMP']); self.mo['imp'] += rem
            kinds.add('wheat')            # 輸入食=穀物扱い
        # --- 塩蔵 (余剰魚+塩・蔵は人口120日分まで) ---
        prc = min(fs, self.saltst * 8.0, max(0.0, self.pop * 120 - self.pres))
        self.saltst = min(self.saltst - prc / 8.0,
                          nhh * P['D_SALT'] * 90 + 50)
        self.pres += prc * P['PR']; self.mo['presq'] += prc * P['PR']
        # --- 文化財の維持フロー消費 → 充足判定 ---
        sat = {}
        td = nhh * P['D_TOOL']; u = min(self.tools, td); self.tools -= u
        sat['tool'] = u >= td * 0.95
        sd = nhh * P['D_SALT']; u = min(self.saltst, sd); self.saltst -= u
        sat['salt'] = u >= sd * 0.95
        cd = nhh * P['D_CHAR']; u = min(self.charst, cd); self.charst -= u
        sat['char'] = u >= cd * 0.95
        if self.iron_from and m >= self.iron_from:
            self.pay(nhh * P['D_IRON'] * P['IRON_IMP']); sat['iron'] = True
        else:
            sat['iron'] = False
        sat['cloth'] = False              # 畜産未実装 → 布は常に欠乏 (検出対象)
        sat['food1'] = len(kinds) >= 1
        sat['food2'] = len(kinds) >= 2
        sat['grain'] = 'wheat' in kinds
        # --- ラダー判定 (昇格30日連続 / 降格60日欠乏) ---
        for c, reqs in LADDER.items():
            cur = self.lv[c]
            keep = all(sat[reqs[i]] for i in range(cur))       # 累積メンテ
            nxt = sat[reqs[cur]] if cur < len(reqs) else False
            if keep and nxt:
                self.up[c] += 1; self.down[c] = 0
                # v8修正F3: 昇格窓を段位で伸ばす(45日×次Lv)。一律30日だと1年目に
                # Lv5到達=弧の崩壊(第1回検出)。累計約2.6年でLv6=5年アークに整合
                if self.up[c] >= 45 * (cur + 1):
                    self.lv[c] += 1; self.up[c] = 0
                    self.mo['ev'].append(f'▲{c} Lv{self.lv[c]}')
            elif keep:
                self.up[c] = 0; self.down[c] = 0
            else:
                self.up[c] = 0; self.down[c] += 1
                if self.down[c] >= 60 and cur > 0:
                    self.lv[c] -= 1; self.down[c] = 0
                    self.mo['ev'].append(f'▼{c} Lv{self.lv[c]}')
        # --- 麦収穫 ---
        if mm == 9 and day % 30 == 15:
            hv = sum(BASE['wheat'] * self.mult('wheat') * self.pf(x['r'])
                     for x in cnt('wheat'))
            self.wheat += hv; self.mo['harv'] = hv
        # --- 輸出 (余剰を少しずつ売る=正典ルール4。建材予備20は手元に残す) ---
        if self.exports:
            xl = max(0.0, self.lumber - 20) * 0.10; self.lumber -= xl
            self.earn(xl * P['EXP_LOG'])
            # v8修正 (第3回検出): 蔵の空白は冬でなく早春1-2月(野菜復帰前)に来る。
            # 蓄えの目標は冬60日でなく冬+端境期=150日分で見る
            winter_need = self.pop * 0.9 * 150
            xp = max(0.0, self.pres - max(0.0, winter_need - self.wheat)) * 0.02
            self.pres -= xp; self.earn(xp * P['EXP_PRES'])
            self.mo['exp'] += xl * P['EXP_LOG'] + xp * P['EXP_PRES']
        self.mo['fish'] += f; self.mo['veg'] += v; self.mo['logs'] += lg

    def month_end(self, m, mm, se):
        if self.go_month is None and self.debt > self.credit_limit(m):
            self.go_month = m
            self.mo['ev'].append(f'★最終通告(債務{self.debt:.0f}>限度{self.credit_limit(m):.0f})')
        self.rows.append(dict(
            m=m, se=se, pop=self.pop, lv=dict(self.lv),
            n=len(self.hhs), mo=self.mo,
            lum=self.lumber, wheat=self.wheat, pres=self.pres,
            cap=self.cap, debt=self.debt,
            fishS=self.fishS / P['FISH_S0'], groveS=self.groveS / P['GROVE_S0'],
            forestS=self.forestS / P['FOREST_S0']))

    def table(self, every=1):
        sn = dict(spring='春', summer='夏', autumn='秋', winter='冬')
        print(f"\n===== {self.name} =====")
        print(f"{'月':>3}{'季':>3}{'人口':>4} {'Lv農漁樵職':>10}{'漁獲':>6}{'野菜':>6}"
              f"{'丸太':>6}{'麦蔵':>6}{'保存':>6}{'輸入':>6}{'輸出':>6}"
              f"{'資金':>7}{'債務':>7}{'魚%':>4}{'木立%':>5}  出来事")
        for r in self.rows:
            if r['m'] % every: continue
            mo = r['mo']; lv = r['lv']
            ev = list(mo['ev'])
            if mo.get('harv'): ev.append(f"麦{mo['harv']:.0f}")
            if mo['new']: ev.append('+' + ','.join(mo['new']))
            lvs = f"{lv['farm']}{lv['fish']}{lv['lumber']}{lv['artisan']}"
            print(f"{r['m']:>3}{sn[r['se']]:>3}{r['pop']:>4} {lvs:>10}"
                  f"{mo['fish']:>6.0f}{mo['veg']:>6.0f}{mo['logs']:>6.0f}"
                  f"{r['wheat']:>6.0f}{r['pres']:>6.0f}{mo['imp']:>6.0f}{mo['exp']:>6.0f}"
                  f"{r['cap']:>7.0f}{r['debt']:>7.0f}"
                  f"{r['fishS']*100:>4.0f}{r['groveS']*100:>5.0f}  {' '.join(ev)}")
        last = self.rows[-1]
        print(f"最終: 人口{last['pop']} 世帯{last['n']} Lv{last['lv']} "
              f"資金{last['cap']:.0f} 債務{last['debt']:.0f} "
              f"GO={'M%d(%d年目)' % (self.go_month, (self.go_month-1)//12+1) if self.go_month else 'なし'}")
        counts = {}
        for x in self.hhs: counts[x['j']] = counts.get(x['j'], 0) + 1
        print(f"軒数: {counts}")

# v2: バグ修正版 (1)移民をviability査定でゲート (2)生産性をrates_and_balance.mdと整合
# 漁世帯(労働5): 1漁師=8人分/月(4荷/日,1荷=2人日) → 世帯40人月/月(夏), 冬25%=10
# 菜園世帯: 24人月/月 (M3-M10)   麦畑Lv1: 1枚=年間96人月をM9に一括収穫
P = dict(FISH_S=40.0, FISH_W=10.0, VEG=24.0, WHEAT=96.0, PR=0.8, IMP=6.0, HH=9)

def season(m):
    mm=(m-1)%12+1
    return 'spring' if mm<=3 else 'summer' if mm<=6 else 'autumn' if mm<=9 else 'winter'

def run(label, plan, wheat, prescap, gate=0.90):
    hh={'fish':1,'veg':1,'wheat':1,'wood':0,'salt':0}; pop=28
    stores=0.0; debt=0.0; grants=5; last_suff=1.0
    rows=[]
    for m in range(1,25):
        se=season(m); mm=(m-1)%12+1
        # 移民: viability査定(前月の充足>=gate) かつ 冬でない かつ プレイヤーが区画を開いた月
        if m>=2 and se!='winter' and last_suff>=gate and plan.get(m):
            hh[plan[m]]=hh.get(plan[m],0)+1; pop+=P['HH']
        fish=hh['fish']*(P['FISH_W'] if se=='winter' else P['FISH_S'])
        veg =hh['veg']*(P['VEG'] if 3<=mm<=10 else 0.0)
        fresh=fish+veg
        harv=0.0
        if mm==9:
            harv=wheat.get(1 if m<=12 else 2,0)*P['WHEAT']; stores+=harv
        need=pop*1.0
        ef=min(fresh,need); rem=need-ef
        es=min(stores,rem); stores-=es; rem-=es
        imp=rem
        if imp>0:
            if grants>0: grants-=1
            else: debt+=imp*P['IMP']
        surplus=fresh-ef
        pres=min(surplus,prescap.get(m,0.0))*P['PR']; stores+=pres
        last_suff=(need-imp)/need if need>0 else 1.0
        rows.append((m,se,pop,round(fresh),round(need),round(harv),round(stores),round(imp),round(debt)))
    print(f"\n=== {label} ===")
    print(f"{'月':>3}{'季':>7}{'人口':>5}{'生鮮':>6}{'必要':>6}{'麦':>5}{'貯蔵':>6}{'輸入':>6}{'債務':>7}")
    for r in rows:
        print(f"{r[0]:>3}{r[1]:>7}{r[2]:>5}{r[3]:>6}{r[4]:>6}{r[5]:>5}{r[6]:>6}{r[7]:>6}{r[8]:>7}{' ←' if r[7]>0 else ''}")
    print(f"最終: 人口{rows[-1][2]} 債務{rows[-1][8]} 貯蔵{rows[-1][6]}")
    return rows

# 初見: 拡張優先(woodだらけ)・麦1枚・保存遅い・区画開きまくり(移民多)
plan1={2:'fish',3:'wood',4:'wood',5:'veg',6:'wood',7:'fish',8:'wood',9:'wood',
       14:'wood',15:'fish',16:'wood',17:'wood',18:'veg',19:'wood',20:'wood',21:'wood'}
run("初見: 拡張優先・麦1枚・保存M8から6", plan1, {1:1,2:1}, {m:(6 if m>=8 else 0) for m in range(1,25)})

# 2周目: 食料優先・麦2→3枚・保存M6から12・秋の区画を控えめ
plan2={2:'fish',3:'veg',4:'fish',5:'salt',6:'veg',7:'fish',8:'wood',
       14:'fish',15:'veg',16:'wood',17:'fish',18:'wood',20:'wood'}
pres2={m:(12 if m>=6 else 0) for m in range(1,25)}; pres2.update({m:20 for m in range(13,25)})
run("2周目: 食料優先・麦2→3枚・保存強化・秋は区画控えめ", plan2, {1:2,2:3}, pres2)

# 熟練: 麦3枚・保存M5から16・冬前の移民ほぼ停止(区画を開かない)
plan3={2:'veg',3:'fish',4:'salt',5:'veg',6:'fish',
       14:'fish',15:'veg',16:'wood',17:'wood'}
pres3={m:(16 if m>=5 else 0) for m in range(1,25)}; pres3.update({m:24 for m in range(13,25)})
run("熟練: 麦3枚・保存早期大・秋の移民を止める", plan3, {1:3,2:3}, pres3)

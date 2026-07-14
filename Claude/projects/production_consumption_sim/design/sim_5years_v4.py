# v4: 日次×5年(1800日)・監査反映版
# 入り: 魚=当日限り / 野菜=日持ち45日 / 麦=年1収穫∞ / 保存(塩要・塩は塩田まで輸入)
#       建材=初期40束→製材所まで輸入 / 渡航費=スポンサー移民60/戸 / 支援アーク(6ヶ月無償→24ヶ月無利子→月利1.5%)
#       信用限界は5年目標から調整
import math
P=dict(FISH_S=40.0,FISH_W=10.0,VEG=24.0,WHEAT_PD=2880.0,PR=0.8,
       FOOD_IMP=6.0,LUMBER_IMP=4.0,SALT_IMP=0.25,PASSAGE=60.0,
       HH=9,BUILD_LUMBER=5,KIT_LUMBER=40,CREDIT=9000.0)

def sim(label,plan,wheat_by_year,pres_cap_by_month,sawmill_m,salt_m,verbose=False):
    hh=dict(fish=1,veg=1,wheat=1,wood=0,other=0); pop=28
    veg_store=[]  # (day, amount) 日持ち45日
    stores=0.0; debt=0.0; lumber=P['KIT_LUMBER']
    go_day=None; last_suff=1.0; log=[]
    for day in range(1,1801):
        m=(day-1)//30+1; mm=(m-1)%12+1; year=(m-1)//12+1
        season='winter' if mm>=10 else ('spring' if mm<=3 else 'summer' if mm<=6 else 'autumn')
        # 月初: 船(移民/支援/建設)
        if day%30==1 and m>=2:
            job=plan.get(m)
            if job and season!='winter' and last_suff>=0.9:
                hh[job]=hh.get(job,0)+1; pop+=P['HH']
                debt+=P['PASSAGE']                      # 渡航費(スポンサー)
                need_l=P['BUILD_LUMBER']
                if m<sawmill_m:                          # 製材所前は建材輸入
                    take=min(lumber,need_l); lumber-=take
                    debt+=(need_l-take)*P['LUMBER_IMP']
        # 生産(日次)
        fish=hh['fish']*(P['FISH_W'] if season=='winter' else P['FISH_S'])
        veg=hh['veg']*(P['VEG'] if 3<=mm<=10 else 0.0)
        if veg>0: veg_store.append([day,veg])
        if mm==9 and day%30==15:                        # M9中旬に麦収穫
            stores+=wheat_by_year.get(year,0)*P['WHEAT_PD']
        need=pop*1.0
        # 食う順: 魚(当日限り)→野菜(45日)→貯蔵(麦+保存)
        eat=min(fish,need); rem=need-eat; fish_sur=fish-eat
        veg_store=[v for v in veg_store if day-v[0]<=45]
        for v in veg_store:
            if rem<=0: break
            u=min(v[1],rem); v[1]-=u; rem-=u
        veg_store=[v for v in veg_store if v[1]>1e-9]
        u=min(stores,rem); stores-=u; rem-=u
        imported=rem
        if imported>0:
            if m<=6: pass                                # 無償支援期
            else: debt+=imported*P['FOOD_IMP']           # 無利子(〜24ヶ月)/以後利子は月末に
        # 保存(魚余剰→保存食・塩コスト)
        cap=pres_cap_by_month.get(m,0.0)
        pr=min(fish_sur,cap)
        if pr>0:
            stores+=pr*P['PR']
            if m<salt_m: debt+=pr*P['SALT_IMP']          # 塩田前は塩輸入
        # 月末: 利子・記録
        if day%30==0:
            if m>24: debt*=1.015
            last_suff=1.0 if need==0 else max(0.0,1.0-imported/need)
            if verbose and (mm in(1,9,10,12) or imported>0):
                log.append((m,season,pop,round(need),round(imported),round(stores),round(debt)))
            if debt>P['CREDIT'] and go_day is None:
                go_day=m
    yrs=lambda mo:f"{(mo-1)//12+1}年目M{(mo-1)%12+1}"
    print(f"{label:34s} 最終人口{pop:>4} 債務{debt:>7.0f} 限界{P['CREDIT']:.0f} GO={yrs(go_day) if go_day else 'なし'}")
    return debt,go_day

# 初見: スポンサーしまくり・麦1→1→2…・保存遅小・製材所M10・塩田なし
plan1={m:j for m,j in zip([2,3,4,5,6,7,8,9,14,15,16,17,18,19,20,21,26,27,28,29,30,31,32,33,38,39,40,41,42,43,44,45,50,51,52,53,54,55,56,57],
      ['fish','wood','other','veg','wood','fish','other','wood']*5)}
pres1={m:(6 if m>=8 else 0) for m in range(1,61)}
sim("初見: 乱開発・麦少・保存小・塩田なし",plan1,{1:1,2:1,3:2,4:2,5:2},pres1,sawmill_m=10,salt_m=999)

# 2周目: 麦2→3→4・保存M6から12→20・塩田2年目・製材所M6・移民は計画的
plan2={m:j for m,j in zip([2,3,4,5,6,7,14,15,16,17,18,26,27,28,29,38,39,40,50,51],
      ['fish','veg','fish','veg','wood','fish','fish','veg','wood','fish','veg','fish','veg','wood','fish','fish','veg','wood','fish','veg'])}
pres2={m:(12 if m>=6 else 0) for m in range(1,61)}; pres2.update({m:20 for m in range(13,61)})
sim("2周目: 計画開発・麦2→4・塩田y2",plan2,{1:2,2:3,3:4,4:4,5:4},pres2,sawmill_m=6,salt_m=13)

# 熟練: 麦3→4・保存M5から16→24・塩田M8・製材所M4・移民最小限
plan3={m:j for m,j in zip([2,3,4,5,14,15,16,26,27,38,39,50],
      ['veg','fish','veg','fish','fish','veg','wood','fish','veg','fish','veg','fish'])}
pres3={m:(16 if m>=5 else 0) for m in range(1,61)}; pres3.update({m:24 for m in range(13,61)})
sim("熟練: 最小移民・麦3→4・塩田y1",plan3,{1:3,2:4,3:4,4:4,5:4},pres3,sawmill_m=4,salt_m=8)

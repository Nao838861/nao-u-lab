# v7: 2年・月次・距離(環)入り統合シミュ
# 環: r0=港(D0.1) r1=近郊(D0.5) r2=遠地(D1.2)。適地スロットは計画側で尊重
# 距離税: h(D)=min(0.85, 0.05+0.45*D)→生産×(1-h)。道路で D_eff=0.6D
D_RING={0:0.10,1:0.50,2:1.20}
BASE=dict(fish=10.0,fish_w=2.5,veg=6.0,wheat=720.0,wood=6.0,shop=4.0,char=4.0,salt=12.0)
P=dict(TOOL_NEED=0.2,PR=0.8,FOOD_IMP=2.0,LUM_IMP=4.0,PASSAGE=60.0,HH=9,BUILD_L=5,
       KIT_L=40,CAPITAL=3000.0,ROAD1_L=20,ROAD2_L=30)
plan={2:('wood',1),3:('shop',0),4:('fish',0),5:('char',1),6:('salt',0),7:('veg',1),8:('fish',1),
      13:('veg',1),14:('wheat',2),15:('wheat',2),16:('fish',1),17:('wood',2),18:('veg',2),
      19:('fish',0),20:('wood',1),21:('char',1)}
roads={1:False,2:False}
def h(D): return min(0.85,0.05+0.45*D)
def pf(ring): return 1-h(D_RING[ring]*(0.6 if roads.get(ring) else 1.0))
hhs=[('fish',0),('veg',0),('wheat',1)]  # 種世帯
pop=28; cap=P['CAPITAL']; debt=0.0; lumber=P['KIT_L']; logs=0.0
wheat_s=0.0; pres_s=0.0; veg_pool=[]; lv=0.0; famine=False
def pay(c):
    global cap,debt
    u=min(cap,c); cap-=u; debt+=c-u
rows=[]
for day in range(1,721):
    m=(day-1)//30+1; mm=(m-1)%12+1
    se='winter' if mm>=10 else('spring' if mm<=3 else 'summer' if mm<=6 else 'autumn')
    if day%30==1:
        mo=dict(new=None,fish=0,veg=0,logs=0,tools=0,harv=0,pres=0,imp=0,tax=0,ev=[])
        # 道路投資
        if m==5 and not roads[1]:
            need=P['ROAD1_L']; t=min(lumber,need); lumber-=t
            if need-t>0: pay((need-t)*P['LUM_IMP'])
            roads[1]=True; mo['ev'].append("道路→近郊環(材木20)")
        if m==14 and not roads[2]:
            need=P['ROAD2_L']; t=min(lumber,need); lumber-=t
            if need-t>0: pay((need-t)*P['LUM_IMP'])
            roads[2]=True; mo['ev'].append("道路→遠地環(材木30)")
        # 移民(応募者プール: 1+pop/80。計画は1/月なので序盤は非拘束・初手爆発は不可)
        if m>=2 and se!='winter' and plan.get(m):
            j,r=plan[m]; hhs.append((j,r)); pop+=P['HH']; pay(P['PASSAGE'])
            nl=P['BUILD_L']; t=min(lumber,nl); lumber-=t
            if nl-t>0: pay((nl-t)*P['LUM_IMP'])
            mo['new']=f"{j}@r{r}"
    mult=1+3*lv
    cnt=lambda j:[x for x in hhs if x[0]==j]
    f=sum((BASE['fish_w'] if se=='winter' else BASE['fish'])*mult*pf(r) for j,r in hhs if j=='fish')
    v=sum(BASE['veg']*mult*pf(r) for j,r in hhs if j=='veg') if 3<=mm<=10 else 0.0
    lg=sum(BASE['wood']*mult*pf(r) for j,r in hhs if j=='wood'); logs+=lg
    shopcap=sum(BASE['shop']*mult*pf(r) for j,r in hhs if j=='shop')
    use=min(logs,shopcap); logs-=use
    lm=min(use,max(0,10-lumber)); lumber+=lm; tools=use-lm
    ch=min(sum(BASE['char']*mult*pf(r) for j,r in hhs if j=='char'),logs); logs-=ch
    saltok=len(cnt('salt'))>0 and len(cnt('char'))>0
    need_t=len(hhs)*P['TOOL_NEED']
    tgt=min(1.0,tools/need_t if need_t>0 else 0) if len(cnt('shop'))>0 else 0.0
    lv+=(tgt-lv)*0.033
    if mm==9 and day%30==15:
        hv=sum(BASE['wheat']*(1+3*lv)*pf(r) for j,r in hhs if j=='wheat')
        wheat_s+=hv; mo['harv']=hv
    if v>0: veg_pool.append([day,v])
    need=pop*1.0
    e=min(f,need); rem=need-e; fs=f-e
    veg_pool=[x for x in veg_pool if day-x[0]<=45]
    for x in veg_pool:
        if rem<=0:break
        u=min(x[1],rem); x[1]-=u; rem-=u
    veg_pool=[x for x in veg_pool if x[1]>1e-9]
    u=min(pres_s,rem); pres_s-=u; rem-=u
    u=min(wheat_s,rem); wheat_s-=u; rem-=u
    if rem>0: pay(rem*P['FOOD_IMP']); mo['imp']+=rem
    prc=min(fs,(BASE['salt']*mult if saltok else 0.0))
    pres_s+=prc*P['PR']; mo['pres']+=prc*P['PR']
    mo['fish']+=f; mo['veg']+=v; mo['logs']+=lg; mo['tools']+=tools
    if day%30==0:
        taxes=[h(D_RING[r]*(0.6 if roads.get(r) else 1.0)) for j,r in hhs]
        avg_tax=sum(taxes)/len(taxes)
        rows.append((m,se,pop,round(lv*100),mo,round(avg_tax*100),round(lumber),round(wheat_s),round(pres_s),round(cap),round(debt)))
sn=dict(spring='春',summer='夏',autumn='秋',winter='冬')
print(f"{'月':>2}{'季':>3}{'人口':>4}{'Lv%':>4}{'税%':>4}{'新規':>9}{'漁獲':>5}{'野菜':>5}{'丸太':>5}{'道具':>5}{'材木':>4}{'麦蔵':>6}{'保存':>5}{'輸入':>5}{'資金':>6}{'債務':>5}  出来事")
for r in rows:
    m,se,pop,lvp,mo,tax,lum,ws,ps,c,d=r
    ev=list(mo['ev'])
    if mo['harv']: ev.append(f"麦収穫{mo['harv']:.0f}")
    print(f"{m:>2}{sn[se]:>3}{pop:>4}{lvp:>4}{tax:>4}{(mo['new'] or '-'):>9}{mo['fish']:>5.0f}{mo['veg']:>5.0f}{mo['logs']:>5.0f}{mo['tools']:>5.0f}{lum:>4}{ws:>6}{ps:>5}{mo['imp']:>5.0f}{c:>6}{d:>5}  {' '.join(ev)}")
print(f"\n最終: 人口{pop} Lv{lv*100:.0f}% 平均距離税{rows[-1][5]}% 資金{cap:.0f} 債務{debt:.0f} 麦蔵{wheat_s:.0f} 保存{pres_s:.0f}")

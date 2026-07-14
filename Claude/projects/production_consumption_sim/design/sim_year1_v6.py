# v6: 最初の1年・Lv0開始・滑走路レース・全資源日次→月次レポート
# 仮置き: 木工所=20世帯分の道具/軒 / 麦=収穫時Lv / 塩輸入可 / 道具輸入不可
D=dict(FISH=10.0,FISH_W=2.5,VEG=6.0,WHEAT=720.0,      # Lv0基準(Lv1=×4)
  LOG=6.0,SHOP_CAP=4.0,TOOL_NEED=0.2,                  # きこり丸太/日, 木工所 道具4/日=20世帯
  CHAR=4.0,CHAR_LOG=4.0,SALT_PD=12.0,SALT_CHAR=2.0,    # 炭焼き, 塩職人(保存12pd/日に塩供給)
  PR=0.8,FOOD_IMP=2.0,LUM_IMP=4.0,SALT_IMP=0.5,PASSAGE=60.0,
  HH=9,BUILD_L=5,KIT_L=40,CAPITAL=2500.0)
plan={2:'wood',3:'shop',4:'fish',5:'char',6:'salt',7:'veg',8:'fish'}  # 計画開発
hh=dict(fish=1,veg=1,wheat=1,wood=0,shop=0,char=0,salt=0)
pop=28; cap=D['CAPITAL']; debt=0.0
lumber=D['KIT_L']; logs=0.0; charc=0.0; salt=0.0
wheat_s=0.0; pres_s=0.0; veg_pool=[]
lv=0.0  # 島の平均Lv(0..1)=道具充足率
def pay(c):
    global cap,debt
    use=min(cap,c); cap-=use; debt+=c-use
rows=[]
for day in range(1,361):
    m=(day-1)//30+1; mm=m
    se='winter' if mm>=10 else('spring' if mm<=3 else 'summer' if mm<=6 else 'autumn')
    if day%30==1:
        mo=dict(imp_food=0,imp_lum=0,imp_salt=0,pass_=0,built=None,
                fish=0,veg=0,logs=0,lum=0,tools=0,char=0,salt=0,pres=0,harv=0)
        j=plan.get(m)
        if j and se!='winter':
            hh[j]+=1; pop+=D['HH']; pay(D['PASSAGE']); mo['pass_']=D['PASSAGE']; mo['built']=j
            nl=D['BUILD_L']; t=min(lumber,nl); lumber-=t
            if nl-t>0: pay((nl-t)*D['LUM_IMP']); mo['imp_lum']+=nl-t
    mult=1+3*lv
    # 生産
    f=hh['fish']*(D['FISH_W'] if se=='winter' else D['FISH'])*mult
    v=hh['veg']*(D['VEG'] if 3<=mm<=10 else 0)*mult
    lg=hh['wood']*D['LOG']*mult; logs+=lg
    # 木工所: 丸太→(建材需要を先に)材木, 残り能力で道具
    shopcap=hh['shop']*D['SHOP_CAP']*mult
    use=min(logs,shopcap); logs-=use
    lum_make=min(use, max(0,10-lumber))   # 材木在庫10を維持
    lumber+=lum_make; tools=use-lum_make
    mo['lum']+=lum_make; mo['tools']+=tools
    # 炭焼き・塩
    ch=min(hh['char']*D['CHAR']*mult, logs); logs-=ch*1.0; charc+=ch
    saltcap=hh['salt']*D['SALT_PD']*mult
    ch_need=hh['salt']*D['SALT_CHAR']
    ch_use=min(charc,ch_need); charc-=ch_use
    salt_prod=saltcap*(ch_use/ch_need if ch_need>0 else 0)
    salt+=salt_prod*0.1  # 塩在庫(保存1pdに塩0.1)
    # Lv更新: 道具充足率(必要=全世帯×0.2/日)
    total_hh=sum(hh.values())
    need_tools=total_hh*D['TOOL_NEED']
    lv=min(1.0, (tools/need_tools) if need_tools>0 else 0) if hh['shop']>0 else 0.0
    # 麦収穫(M9・収穫時Lv)
    if mm==9 and day%30==15:
        h=hh['wheat']*D['WHEAT']*(1+3*lv); wheat_s+=h; mo['harv']=h
    # 消費
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
    if rem>0:
        pay(rem*D['FOOD_IMP']); mo['imp_food']+=rem
    # 保存(魚余剰→塩があれば)
    prcap=min(fs, hh['salt']*D['SALT_PD'])
    salt_need=prcap*0.1
    if salt_need>salt:
        buy=salt_need-salt; pay(buy*D['SALT_IMP']*10); mo['imp_salt']+=buy*10; salt=salt_need
    salt-=salt_need; pres_s+=prcap*D['PR']; mo['pres']+=prcap*D['PR']
    mo['fish']+=f; mo['veg']+=v; mo['logs']+=lg; mo['char']+=ch; mo['salt']+=salt_prod*0.1
    if day%30==0:
        rows.append((m,se,pop,dict(hh),round(lv*100),mo,round(lumber),round(wheat_s),round(pres_s),round(cap),round(debt)))
jn=dict(fish='漁',veg='菜',wheat='麦',wood='樵',shop='木工',char='炭',salt='塩')
sn=dict(spring='春',summer='夏',autumn='秋',winter='冬')
print(f"{'月':>2}{'季':>3}{'人口':>4}{'Lv%':>4} 漁/菜/麦/樵/工/炭/塩 {'漁獲':>5}{'野菜':>5}{'丸太':>5}{'道具':>5}{'材木蔵':>5}{'麦蔵':>6}{'保存':>5}{'輸入食':>5}{'資金':>6}{'債務':>5}  出来事")
for r in rows:
    m,se,pop,h,lvp,mo,lum,ws,ps,c,d=r
    ev=[]
    if mo['built']: ev.append(f"+{jn[mo['built']]}")
    if mo['harv']: ev.append(f"麦収穫{mo['harv']:.0f}")
    hs=f"{h['fish']}/{h['veg']}/{h['wheat']}/{h['wood']}/{h['shop']}/{h['char']}/{h['salt']}"
    print(f"{m:>2}{sn[se]:>3}{pop:>4}{lvp:>4} {hs:^17}{mo['fish']:>5.0f}{mo['veg']:>5.0f}{mo['logs']:>5.0f}{mo['tools']:>5.0f}{lum:>5}{ws:>6}{ps:>5}{mo['imp_food']:>5.0f}{c:>6}{d:>5}  {' '.join(ev)}")
print(f"\n最終: 人口{pop} Lv{lv*100:.0f}% 資金{cap:.0f} 債務{debt:.0f} 麦蔵{wheat_s:.0f} 保存{pres_s:.0f}")

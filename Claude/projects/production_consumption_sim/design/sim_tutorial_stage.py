# チュートリアル動的シミュ v3: 貨幣を厳密保存・会社の現金サイクルを正しく閉じる
# 会社: 島民から輸出品を買う(会社→島民) → 本国へ売る(本国→会社) = 現金が回る
# 食料: 生産者(漁/農)から島民が買う(島民→島民) + 会社の輸入食料(島民→会社)
FOOD_NEED=0.5; Y_FISH=4.0; Y_WOOD=3.0; WHEAT_YIELD=90.0; WHEAT_CYCLE=90; WF=0.6
WOOD_BUY=3.0; WOOD_SELL=4.2   # 会社は3.0で買い本国へ4.2で売る(マージン)

class HH:
    _n=0
    def __init__(s,head,ind,size,purse):
        HH._n+=1; s.head=head; s.ind=ind; s.size=size
        s.workers=max(1,round(size*WF)); s.purse=float(purse)
        s.pantry=size*FOOD_NEED*8; s.grain=0.0; s.wood=0.0; s.starve=0
    def need(s): return s.size*FOOD_NEED

fp=5.0; company=800.0
from_mainland=0.0   # 本国→島 の総注入(貨幣保存チェック用)
initial=800.0+sum([50,50,60])
hh=[HH('Fischer','fish',8,50),HH('Weber','wood',10,50),HH('Bauer','wheat',10,60)]
quota=None; qdone=False; wexq=0.0
def ship(d): return d>0 and d%12==0
names=['Schmidt','Muller','Wagner','Becker','Hoffmann','Koch','Richter']; inds=['wood','fish','wheat','wood','fish','wheat','wood']

print(f"{'日':>4}{'人口':>5}{'食料価':>7}{'市中金':>7}{'会社金':>7}{'飢戸':>5}{'食料充足':>8}  出来事")
for day in range(0,101):
    ev=[]
    if ship(day):
        i=(day//12-1)%len(names); h=HH(names[i],inds[i],7+(day//12)%4,35); hh.append(h)
        h.purse+=0; from_mainland+=35; ev.append(f"入植 {names[i]}({inds[i]})")
    support=60.0 if (day<36 and ship(day)) else 0.0  # 会社が輸入(信用)→市場へ

    harvest=(day>0 and day%WHEAT_CYCLE==0)
    fish_today=0.0
    for h in hh:
        if h.ind=='fish': h._f=h.workers*Y_FISH
        elif h.ind=='wood': h.wood+=h.workers*Y_WOOD
        elif h.ind=='wheat':
            h._f=0
            if harvest: h.grain+=WHEAT_YIELD; ev.append(f"{h.head}麦収穫+{WHEAT_YIELD:.0f}")
        if h.ind!='fish' and h.ind!='wheat': h._f=0
        if h.ind=='wheat' and not hasattr(h,'_f'): h._f=0

    # 供給: 漁の全魚 + 農家放出麦 + 支援
    for h in hh: h._rel = min(h.grain,3.0) if h.ind=='wheat' else 0.0
    supply = support + sum(getattr(h,'_f',0) for h in hh if h.ind=='fish') + sum(h._rel for h in hh)
    # 需要: 自給/パントリー後の不足
    needy=[]
    for h in hh:
        n=h.need()
        if h.ind=='fish': n=max(0,n-h._f)
        if h.ind=='wheat':
            u=min(n,h.grain); h.grain-=u; n-=u
        u=min(n,h.pantry); h.pantry-=u; n-=u
        if n>0.01: needy.append([h,n])
    demand=sum(n for _,n in needy)
    if supply+demand>0: fp*=(1+0.25*(demand-supply)/(supply+demand)); fp=max(1.0,min(15.0,fp))

    # 取引(貨幣厳密移動): 買い手→(生産者プール/会社)。供給按分。
    avail=supply; fed=0.0
    fish_income={}  # 生産者への収入
    total_paid_to_producers=0.0; total_paid_to_company=0.0
    prod_supply=sum(getattr(h,'_f',0) for h in hh if h.ind=='fish')+sum(h._rel for h in hh)
    for pair in needy:
        h,n=pair
        buy=min(n,avail,h.purse/fp if fp>0 else n)
        cost=buy*fp; h.purse-=cost; avail-=buy; fed+=buy
        # 収入配分: 支援分は会社、生産分は生産者へ
        if supply>0:
            to_comp=cost*(support/supply); to_prod=cost-to_comp
        else: to_comp=to_prod=0
        total_paid_to_company+=to_comp; total_paid_to_producers+=to_prod
        if n-buy>0.01: h.starve+=1
    company+=total_paid_to_company
    # 生産者へ按分
    if prod_supply>0:
        for h in hh:
            sh=(getattr(h,'_f',0) if h.ind=='fish' else h._rel)/prod_supply
            h.purse+=total_paid_to_producers*sh

    # 会社が木材を買い(会社→島民)、本国へ売る(本国→会社) ← 現金サイクルを閉じる
    for h in hh:
        if h.ind=='wood' and h.wood>0:
            pay=h.wood*WOOD_BUY
            if company>=pay:
                h.purse+=pay; company-=pay
                rev=h.wood*WOOD_SELL; company+=rev; from_mainland+=rev  # 本国売却
                if quota and not qdone: wexq+=h.wood
                h.wood=0
    if day==20 and quota is None: quota=('wood',120,55); ev.append("★御用:木材120荷を55日までに")
    if quota and not qdone and wexq>=quota[1]: qdone=True; ev.append(f"★御用達成(木材{wexq:.0f})")

    mk=sum(h.purse for h in hh); starv=sum(1 for h in hh if h.starve>0 and h.pantry<1 and h.purse<fp)
    ratio=fed/demand if demand>0 else 1.0
    if day%10==0 or ev:
        print(f"{day:>4}{sum(h.size for h in hh):>5}{fp:>7.1f}{mk:>7.0f}{company:>7.0f}{starv:>5}{ratio*100:>7.0f}%  {'; '.join(ev)}")

tot=sum(h.purse for h in hh)+company
print(f"\n=== まとめ ===")
print(f"人口{sum(h.size for h in hh)} 世帯{len(hh)} 市中金{sum(h.purse for h in hh):.0f} 会社金{company:.0f}")
print(f"貨幣保存: 実際{tot:.0f} = 期待{initial+from_mainland:.0f}? {'OK' if abs(tot-(initial+from_mainland))<1 else 'LEAK '+str(round(tot-(initial+from_mainland)))}")
print(f"延べ飢餓日{sum(h.starve for h in hh)} 御用{'達成' if qdone else '未達'}")

"""shot_log v01 headless player — Python simulation of the JS game logic."""
import math, json, sys, ctypes

W, H = 420, 620
LV2, LV3, GMAX = 44, 124, 200

# === mulberry32 PRNG (matches JS) ===
def mulberry32(seed):
    a = [seed & 0xFFFFFFFF]
    def rng():
        a[0] = (a[0] + 0x6D2B79F5) & 0xFFFFFFFF
        t = a[0]
        t = (ctypes.c_int32(t ^ (t >> 15)).value * ctypes.c_int32(t | 1).value) & 0xFFFFFFFF
        t = (t ^ (t + (ctypes.c_int32(t ^ (t >> 7)).value * ctypes.c_int32(t | 61).value) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296
    return rng

# === Enemy types ===
ETYPES = {
    'small':  dict(hp=1, r=9,  nRad=2, nAim=0, dropRate=0.3),
    'medium': dict(hp=1, r=13, nRad=3, nAim=1, dropRate=0.6),
    'large':  dict(hp=8, r=39, nRad=8, nAim=0, dropRate=1.0),  # JS: hp=12 (scaled 0.6× for headless TTK sim)
    'boss':   dict(hp=20,r=57, nRad=10,nAim=4, dropRate=1.0),
}

# === Path patterns (match JS exactly) ===
def pTopDown(x, endY):
    return [{'x':x,'y':-15,'t':0},{'x':x,'y':endY,'t':140},{'x':x,'y':H+20,'t':160}]

def pLineDown(x, endY, n, gap):
    return [{'path':pTopDown(x, endY-i*14),'delay':i*gap} for i in range(n)]

def pVForm(cx, sp, endY):
    p = []
    for i in range(-2,3):
        x = cx + i*sp
        sign = 1 if i >= 0 else -1
        if i == 0: sign = 1
        p.append({'path':[{'x':x,'y':-15,'t':0},{'x':x,'y':endY,'t':150},{'x':x+sign*80,'y':-30,'t':140}],'delay':abs(i)*10})
    return p

def pSideEntry(left, cy):
    x0 = -15 if left else W+15
    x1 = W*0.6 if left else W*0.4
    x2 = W+15 if left else -15
    return [{'x':x0,'y':cy-30,'t':0},{'x':x1,'y':cy,'t':110},{'x':x2,'y':cy-30,'t':110}]

def pSideSweep(left, y, n):
    return [{'path':pSideEntry(left, y+i*8),'delay':i*10} for i in range(n)]

def pDive(x, ty):
    xoff = 100 if x > W/2 else -100
    return [{'x':x,'y':-15,'t':0},{'x':x,'y':ty,'t':100},{'x':x,'y':ty-30,'t':40},{'x':x+xoff,'y':-30,'t':110}]

def pLarge(x):
    return [{'x':x,'y':-25,'t':0},{'x':x,'y':200,'t':160},{'x':x,'y':200,'t':80},{'x':x,'y':-40,'t':140}]

def pBoss(x):
    return [{'x':x,'y':-35,'t':0},{'x':x,'y':140,'t':180},{'x':x,'y':140,'t':400},{'x':x,'y':-40,'t':200}]

def s(arr, etype, extra_delay=0):
    return [dict(e, type=etype, delay=(e.get('delay',0))+extra_delay) for e in arr]

def build_waves():
    waves = []; t = 0
    # Phase 1
    waves.append({'t':t,'enemies':s(pLineDown(210,355,6,10),'small')})
    t+=120
    waves.append({'t':t,'enemies':s(pLineDown(80,360,6,8),'small')+s(pLineDown(210,350,6,8),'small',4)+s(pLineDown(340,360,6,8),'small',8)})
    t+=160
    waves.append({'t':t,'enemies':s(pSideSweep(True,190,20),'small')})
    t+=140
    waves.append({'t':t,'enemies':s(pSideSweep(False,260,20),'small')})
    t+=160
    waves.append({'t':t,'enemies':s(pVForm(W/2,30,280),'small')+s(pVForm(W/2-90,25,310),'small',20)+s(pVForm(W/2+90,25,310),'small',20)+s(pLineDown(80,370,6,10),'small',50)+s(pLineDown(210,360,6,10),'small',55)+s(pLineDown(340,370,6,10),'small',50)})
    t+=250
    # Phase 2
    waves.append({'t':t,'enemies':[{'path':pDive(40+i*24,390+i%3*8),'type':'small','t':i*10} for i in range(16)]})
    t+=180
    waves.append({'t':t,'enemies':s(pSideSweep(True,160,12),'medium')+s(pSideSweep(False,300,12),'small',30)+s(pLineDown(W/2,350,12,8),'small',60)})
    t+=260
    waves.append({'t':t,'enemies':s(pSideSweep(True,170,6),'medium')+s(pSideSweep(False,280,6),'medium',30)+s(pLineDown(70,360,10,7),'small',10)+s(pLineDown(350,360,10,7),'small',15)})
    t+=280
    # Phase 3
    waves.append({'t':t,'enemies':[{'path':pLarge(130),'type':'large','t':0},{'path':pLarge(290),'type':'large','t':20}]+s(pLineDown(50,350,8,8),'small',10)+s(pLineDown(210,340,8,8),'small',15)+s(pLineDown(370,350,8,8),'small',10)+s(pSideSweep(True,380,8),'medium',80)})
    t+=330
    waves.append({'t':t,'enemies':s(pVForm(W/2,35,290),'small')+s(pVForm(W/2,35,290),'small',50)+[{'path':pDive(40+i*40,400),'type':'small','t':60+i*10} for i in range(10)]+s(pSideSweep(True,340,8),'medium',100)+s(pSideSweep(False,200,8),'small',110)})
    t+=330
    waves.append({'t':t,'enemies':[{'path':pLarge(W/2),'type':'large','t':0}]+s(pSideSweep(True,170,10),'medium',20)+s(pSideSweep(False,330,10),'medium',40)+s(pLineDown(W/2-80,360,8,8),'small',60)+s(pLineDown(W/2+80,360,8,8),'small',65)})
    t+=320
    # Phase 4: boss
    waves.append({'t':t,'enemies':[{'path':pBoss(W/2),'type':'boss','t':0}]+s(pLineDown(60,370,8,8),'small',200)+s(pLineDown(360,370,8,8),'small',205)+s(pSideSweep(True,300,10),'small',280)+s(pSideSweep(False,200,10),'small',320)+s(pSideSweep(True,250,6),'medium',380)+s(pLineDown(140,350,8,8),'small',400)+s(pLineDown(280,350,8,8),'small',405)})
    t+=500
    # Phase 5
    waves.append({'t':t,'enemies':[{'path':pLarge(120),'type':'large','t':0},{'path':pLarge(300),'type':'large','t':20}]+s(pLineDown(50,360,10,7),'small')+s(pLineDown(150,350,10,7),'small',5)+s(pLineDown(270,350,10,7),'small',5)+s(pLineDown(370,360,10,7),'small')+s(pSideSweep(True,200,12),'medium',80)+s(pSideSweep(False,350,12),'medium',100)})
    t+=300
    waves.append({'t':t,'enemies':[{'path':pBoss(W/2-80),'type':'boss','t':0},{'path':pLarge(W/2+100),'type':'large','t':60}]+s(pSideSweep(True,160,16),'small',100)+s(pSideSweep(False,320,16),'small',120)+s(pSideSweep(True,280,8),'medium',250)+s(pLineDown(W/2,350,10,7),'small',300)+[{'path':pDive(40+i*48,400),'type':'small','t':350+i*12} for i in range(8)]})
    return waves

# === Game state ===
class Game:
    def __init__(self, seed=42):
        self.rng = mulberry32(seed)
        self.t = 0
        self.px, self.py, self.pr = W/2, H-60, 10
        self.bullets = []
        self.enemies = []
        self.ebullets = []
        self.items = []
        self.cooldown = 0
        self.gauge = 0
        self.score = 0
        self.waves = build_waves()
        self.waveIdx = 0
        self.waveT = 0
        self.over = False
        self.hits = 0  # times hit by ebullet
        self.items_collected = 0
        self.lvl_time = {1:0, 2:0, 3:0}

    def lvl(self):
        return 3 if self.gauge>=LV3 else 2 if self.gauge>=LV2 else 1

    def shoot(self):
        px, py = self.px, self.py
        lv = self.lvl()
        if lv == 1:
            self.bullets.append({'x':px,'y':py-12,'vx':0,'vy':-7,'life':65})
        elif lv == 2:
            self.bullets.append({'x':px-6,'y':py-12,'vx':0,'vy':-7,'life':65})
            self.bullets.append({'x':px+6,'y':py-12,'vx':0,'vy':-7,'life':65})
        else:
            self.bullets.append({'x':px,'y':py-12,'vx':0,'vy':-7,'life':65})
            self.bullets.append({'x':px-8,'y':py-10,'vx':-1.4,'vy':-6.8,'life':65})
            self.bullets.append({'x':px+8,'y':py-10,'vx':1.4,'vy':-6.8,'life':65})
        self.cooldown = 6 if lv==3 else 7 if lv==2 else 8

    def spawn_enemy(self, edef):
        cfg = ETYPES[edef['type']]
        path = edef['path']
        return dict(path=path, pathIdx=0, pathT=0, x=path[0]['x'], y=path[0]['y'],
                    hp=cfg['hp'], maxHp=cfg['hp'], r=cfg['r'], type=edef['type'],
                    nRad=cfg['nRad'], nAim=cfg['nAim'], dropRate=cfg['dropRate'],
                    flash=0, shotCd=0, dead=False, done=False)

    def spawn_revenge(self, x, y, nRad, nAim):
        base = self.rng() * math.pi * 2
        for i in range(nRad):
            a = base + i * (math.pi*2/nRad)
            self.ebullets.append({'x':x,'y':y,'vx':math.cos(a)*3.5,'vy':math.sin(a)*3.5,'r':3,'dead':False})
        for i in range(nAim):
            dx, dy = self.px - x, self.py - y
            d = math.sqrt(dx*dx+dy*dy) or 1
            spread = (i - ((nAim-1)/2)) * 0.25
            a = math.atan2(dy, dx) + spread
            self.ebullets.append({'x':x,'y':y,'vx':math.cos(a)*3.0,'vy':math.sin(a)*3.0,'r':3,'dead':False})

    def move_enemy(self, e):
        if e['pathIdx'] >= len(e['path'])-1:
            e['done'] = True; return
        p0, p1 = e['path'][e['pathIdx']], e['path'][e['pathIdx']+1]
        dur = p1['t'] or 1
        e['pathT'] += 1
        frac = min(1, e['pathT']/dur)
        sf = frac*frac*(3-2*frac)
        e['x'] = p0['x'] + (p1['x']-p0['x'])*sf
        e['y'] = p0['y'] + (p1['y']-p0['y'])*sf
        if e['pathT'] >= dur:
            e['pathIdx'] += 1; e['pathT'] = 0
        # large: slow drift + 12-way radial burst (NOT aimed; spectacle)
        if e['type'] == 'large' and 20 < e['y'] < H-20:
            dx = self.px - e['x']
            e['x'] += (1 if dx>0 else -1) * min(abs(dx), 0.4)
            e['x'] = max(e['r'], min(W-e['r'], e['x']))
            e['shotCd'] = (e.get('shotCd',80)) - 1
            if e['shotCd'] <= 0:
                e['shotN'] = e.get('shotN',0) + 1
                base = e['shotN'] * 0.13
                for i in range(12):
                    a = base + i * (math.pi*2/12)
                    self.ebullets.append({'x':e['x'],'y':e['y'],'vx':math.cos(a)*2.8,'vy':math.sin(a)*2.8,'r':5,'dead':False})
                e['shotCd'] = 80
        # boss: 5-way burst
        if e['type'] == 'boss' and 40 < e['y'] < H-40:
            e['shotCd'] = e.get('shotCd',0) - 1
            if e['shotCd'] <= 0:
                a = math.atan2(self.py-e['y'], self.px-e['x'])
                for i in range(-2,3):
                    self.ebullets.append({'x':e['x'],'y':e['y'],'vx':math.cos(a+i*0.18)*2.5,'vy':math.sin(a+i*0.18)*2.5,'r':4,'dead':False})
                e['shotCd'] = 40

    def step(self, dx, dy):
        """dx,dy in [-1,1]. Returns True if game continues."""
        if self.over: return False
        self.t += 1; self.waveT += 1
        self.lvl_time[self.lvl()] += 1
        # player move
        if dx != 0 and dy != 0: dx *= 0.707; dy *= 0.707
        self.px += dx * 3.5; self.py += dy * 3.5
        self.px = max(14, min(W-14, self.px))
        self.py = max(60, min(H-20, self.py))
        # auto-shoot
        if self.cooldown > 0: self.cooldown -= 1
        if self.cooldown <= 0: self.shoot()
        # bullets
        for b in self.bullets: b['x']+=b['vx']; b['y']+=b['vy']; b['life']-=1
        self.bullets = [b for b in self.bullets if b['life']>0 and -10<b['x']<W+10]
        # wave spawning
        while self.waveIdx < len(self.waves):
            w = self.waves[self.waveIdx]
            if self.waveT < w['t']: break
            for ed in w['enemies']:
                spawnAt = w['t'] + (ed.get('delay') or ed.get('t') or 0)
                if self.waveT == spawnAt:
                    self.enemies.append(self.spawn_enemy(ed))
            maxD = max((e.get('delay') or e.get('t') or 0) for e in w['enemies'])
            if self.waveT >= w['t'] + maxD: self.waveIdx += 1
            else: break
        if self.waveIdx >= len(self.waves) and not self.enemies and not self.ebullets:
            self.waves = build_waves(); self.waveIdx = 0; self.waveT = 0
        # enemies
        for e in self.enemies: self.move_enemy(e)
        self.enemies = [e for e in self.enemies if not e['done'] and not e['dead']]
        # hit detection
        for e in self.enemies:
            if e['dead']: continue
            for b in self.bullets:
                if b.get('dead'): continue
                er = e['r']*(0.5+0.5*e['hp']/e['maxHp']) if e['type'] in ('large','boss') else e['r']
                ddx, ddy = b['x']-e['x'], b['y']-e['y']
                if ddx*ddx+ddy*ddy < (er+3)**2:
                    b['dead'] = True; e['hp'] -= 1
                    if e['hp'] <= 0:
                        e['dead'] = True
                        self.score += 10 if e['type']=='boss' else 1
                        self.spawn_revenge(e['x'],e['y'],e['nRad'],e['nAim'])
                        if self.rng() < e['dropRate']:
                            n = 5 if e['type']=='boss' else 1
                            for ii in range(n):
                                self.items.append({'x':e['x']+(ii-1)*15,'y':e['y'],'vy':1.2,'dead':False})
                    break
        self.bullets = [b for b in self.bullets if not b.get('dead')]
        # items magnet + collect
        for it in self.items:
            if it['dead']: continue
            ddx, ddy = self.px-it['x'], self.py-it['y']
            dist = math.sqrt(ddx*ddx+ddy*ddy)
            if dist < 80 and dist > 0:
                pull = min(5, (80-dist)/80*5+1)
                it['x'] += ddx/dist*pull; it['y'] += ddy/dist*pull
            else:
                it['y'] += it['vy']
        for it in self.items:
            if it['dead']: continue
            ddx, ddy = it['x']-self.px, it['y']-self.py
            if ddx*ddx+ddy*ddy < (8+self.pr)**2:
                it['dead'] = True; self.gauge = min(GMAX, self.gauge+8)
                self.items_collected += 1
        self.items = [it for it in self.items if not it['dead'] and it['y']<H+10]
        # ebullets
        for b in self.ebullets: b['x']+=b['vx']; b['y']+=b['vy']
        self.ebullets = [b for b in self.ebullets if not b.get('dead') and -10<b['x']<W+10 and -10<b['y']<H+10]
        # collision: enemy body
        for e in self.enemies:
            if e['dead']: continue
            er = e['r']*(0.5+0.5*e['hp']/e['maxHp']) if e['type'] in ('large','boss') else e['r']
            ddx, ddy = e['x']-self.px, e['y']-self.py
            if ddx*ddx+ddy*ddy < (er+self.pr)**2:
                self.over = True; return False
        # collision: ebullet
        for b in self.ebullets:
            if b.get('dead'): continue
            ddx, ddy = b['x']-self.px, b['y']-self.py
            if ddx*ddx+ddy*ddy < (b['r']+self.pr)**2:
                b['dead'] = True
                if self.gauge <= 0:
                    self.over = True; return False
                else:
                    self.hits += 1
                    if self.gauge >= LV3: self.gauge = LV2
                    else: self.gauge = 0
        self.ebullets = [b for b in self.ebullets if not b.get('dead')]
        return True

# === AI Policies ===
def find_nearest_threat(g):
    """Find nearest enemy bullet or enemy to player."""
    best_d, best = 9999, None
    for b in g.ebullets:
        if b.get('dead'): continue
        d = math.sqrt((b['x']-g.px)**2+(b['y']-g.py)**2)
        if d < best_d: best_d, best = d, b
    for e in g.enemies:
        if e['dead']: continue
        d = math.sqrt((e['x']-g.px)**2+(e['y']-g.py)**2)
        if d < best_d: best_d, best = d, e
    return best_d, best

def find_nearest_item(g):
    best_d, best = 9999, None
    for it in g.items:
        if it['dead']: continue
        d = math.sqrt((it['x']-g.px)**2+(it['y']-g.py)**2)
        if d < best_d: best_d, best = d, it
    return best_d, best

def policy_center(g):
    """Stay near center, dodge threats."""
    dx, dy = 0, 0
    td, threat = find_nearest_threat(g)
    if threat and td < 60:
        dx = -1 if threat['x'] > g.px else 1
        dy = -1 if threat['y'] > g.py else 1
    else:
        if g.px < W/2 - 20: dx = 1
        elif g.px > W/2 + 20: dx = -1
        if g.py < H - 80: dy = 1
        elif g.py > H - 50: dy = -1
    return dx, dy

def policy_aggressive(g):
    """Move toward items, dodge only close threats."""
    dx, dy = 0, 0
    td, threat = find_nearest_threat(g)
    if threat and td < 40:
        dx = -1 if threat['x'] > g.px else 1
        dy = -1 if threat['y'] > g.py else 1
    else:
        id_, item = find_nearest_item(g)
        if item and id_ < 200:
            dx = 1 if item['x'] > g.px + 5 else -1 if item['x'] < g.px - 5 else 0
            dy = 1 if item['y'] > g.py + 5 else -1 if item['y'] < g.py - 5 else 0
        else:
            if g.py > H - 100: dy = -1
            if g.px < W/2 - 30: dx = 1
            elif g.px > W/2 + 30: dx = -1
    return dx, dy

def policy_defensive(g):
    """Stay at bottom, prioritize dodging."""
    dx, dy = 0, 0
    td, threat = find_nearest_threat(g)
    if threat and td < 80:
        dx = -1 if threat['x'] > g.px else 1
        dy = -1 if threat['y'] > g.py else 1
    if g.py < H - 60: dy = 1
    return dx, dy

def policy_sweeper(g):
    """Sweep left-right to cover width, dodge vertically."""
    dx, dy = 0, 0
    td, threat = find_nearest_threat(g)
    if threat and td < 50:
        dy = -1 if threat['y'] > g.py else 1
    # sweep
    phase = (g.t // 120) % 2
    target_x = 100 if phase == 0 else W - 100
    if g.px < target_x - 10: dx = 1
    elif g.px > target_x + 10: dx = -1
    if g.py < H - 80: dy = 1
    return dx, dy

POLICIES = {
    'center': policy_center,
    'aggressive': policy_aggressive,
    'defensive': policy_defensive,
    'sweeper': policy_sweeper,
}

# === Run ===
def run(policy_name, seed=42, max_frames=60*120):
    g = Game(seed)
    policy = POLICIES[policy_name]
    gauge_log = []
    while g.t < max_frames:
        dx, dy = policy(g)
        if not g.step(dx, dy): break
        if g.t % 60 == 0:
            gauge_log.append(g.gauge)
    return {
        'policy': policy_name,
        'seed': seed,
        'time_s': round(g.t/60, 1),
        'score': g.score,
        'hits': g.hits,
        'items': g.items_collected,
        'gauge_final': g.gauge,
        'lvl_pct': {k: round(v/max(g.t,1)*100,1) for k,v in g.lvl_time.items()},
        'gauge_per_sec': gauge_log,
    }

def main():
    seeds = [42, 123, 7777]
    print("="*70)
    print("shot_log v01 headless evaluation")
    print("="*70)
    for name in POLICIES:
        for seed in seeds:
            r = run(name, seed)
            print(f"\n[{r['policy']:12s}] seed={r['seed']:5d}  time={r['time_s']:5.1f}s  score={r['score']:3d}  "
                  f"hits={r['hits']}  items={r['items']}  gauge={r['gauge_final']}")
            print(f"  lvl%%: 1way={r['lvl_pct'][1]:.0f}%  2way={r['lvl_pct'][2]:.0f}%  3way={r['lvl_pct'][3]:.0f}%")
    # summary
    print("\n" + "="*70)
    print("SUMMARY (avg over seeds)")
    print("="*70)
    for name in POLICIES:
        results = [run(name, s) for s in seeds]
        avg_time = sum(r['time_s'] for r in results)/len(results)
        avg_score = sum(r['score'] for r in results)/len(results)
        avg_hits = sum(r['hits'] for r in results)/len(results)
        avg_items = sum(r['items'] for r in results)/len(results)
        avg_lv3 = sum(r['lvl_pct'][3] for r in results)/len(results)
        print(f"  {name:12s}: time={avg_time:5.1f}s  score={avg_score:5.1f}  hits={avg_hits:.1f}  items={avg_items:.1f}  3way={avg_lv3:.0f}%")

if __name__ == '__main__':
    main()

from pathlib import Path
import sys,collections,json,hashlib
import networkx as nx
OUT=Path(__file__).resolve().parent
WORK=OUT.parents[2]
REPO=WORK/'.tmp/MMC5Racing'
TEMP=REPO/'build/bg-capacity'
TEMP.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(REPO/'direct-runtime/minimap'))
from allocation import BANKS,course_words,audit
import hud_b2
BASE=REPO/'releases/MMC5Racing_WheelRouteStable_136x184.nes'
old=BASE.read_bytes();CHR=16+1048576
refs=collections.defaultdict(set); values={}; words=set()
for q,w,r in course_words(old,True):
 words.add((q,w))
 if r is not None:refs[r].add(q);values[r]=w
pinned={(q,values[r]) for r,qs in refs.items() if len(qs)>1 for q in qs}
pinned|={(q,w) for q,w,r in course_words(old,True) if r is None}
protected={0,1,62,126,190,255}
_,basefree=audit(old)
groups=[]
for q in range(4):
 g=collections.defaultdict(list)
 for qq,w in sorted(words):
  if qq==q:
   i=w&16383;g[old[CHR+(q*16384+i)*16:CHR+(q*16384+i+1)*16]].append(w)
 groups.append(g)

def solve(retired):
 reserved=set(basefree)|retired|{0,192}
 mapping={};stats=[]
 for q,g in enumerate(groups):
  fixed={w&16383 for qq,w in pinned if qq==q}
  if any(w>>8 in retired for qq,w in pinned if qq==q):return None
  def safe(i,mask):return q*64+i//256 not in BANKS and all((p*64+i//256) not in reserved for p in range(4) if mask>>p&1)
  pending=collections.defaultdict(list)
  for data,ws in g.items():
   mask=sum(1<<p for p in {w>>14 for w in ws})
   # Preserve groups already stored in immutable/protected locations if usable.
   targets=[w&16383 for w in ws if (w&16383) in fixed or q*64+(w>>8&63) in protected or w%256==0]
   target=next((i for i in targets if safe(i,mask)),None)
   if target is not None:
    for w in ws:mapping[q,w]=target
   else:pending[mask].append((data,ws))
  slots=collections.defaultdict(list)
  for i in range(256,16384):
   if i%256 and i not in fixed and q*64+i//256 not in protected|set(BANKS):slots[i//256].append(i)
  flow=nx.DiGraph()
  for mask,gs in pending.items():
   flow.add_edge('s',('m',mask),capacity=len(gs))
   for bank,ss in slots.items():
    if safe(ss[0],mask):flow.add_edge(('m',mask),('b',bank),capacity=len(gs))
  for bank,ss in slots.items():flow.add_edge(('b',bank),'t',capacity=len(ss))
  total,f=nx.maximum_flow(flow,'s','t')
  demand=sum(map(len,pending.values()))
  if total!=demand:return None
  for mask,gs in pending.items():
   for node,n in f['m',mask].items():
    bank=node[1]
    for _ in range(n):
     data,ws=gs.pop();target=slots[bank].pop()
     for w in ws:mapping[q,w]=target
  stats.append({'quarter':q,'patterns_packed':demand})
 return mapping,stats
retired={184,185,186,188}|set(hud_b2.EXTRA_RETIRED)
counts=collections.Counter(w>>8 for q,w in words)
for step in range(3):
 for n,c in sorted(counts.items(),key=lambda kv:kv[1]):
  if n in retired or n in (0,1,72,192,255):continue
  result=solve(retired|{n})
  if result:
   retired.add(n);print('added',n,'cost',c,flush=True);break
 else:break
print('retired',sorted(retired),flush=True)
result=solve(retired)
assert result
mapping,stats=result
rom=bytearray(old)
for (q,w),target in mapping.items():
 a=CHR+(q*16384+(w&16383))*16;b=CHR+(q*16384+target)*16
 rom[b:b+16]=old[a:a+16]
for r,qs in refs.items():
 w=values[r]
 if len(qs)>1:continue
 q=next(iter(qs));nw=(w&0xc000)|mapping[q,w]
 rom[r]=nw&255;rom[r+4096]=nw>>8
for bank in BANKS:
 at=CHR+bank*4096;rom[at:at+4096]=bytes([255])*4096
checks=0
for (q,w),(nq,nw) in zip(course_words(old),course_words(rom),strict=True):
 assert q==nq and w&0xc000==nw&0xc000
 a=CHR+(q*16384+(w&16383))*16;b=CHR+(q*16384+(nw&16383))*16
 assert old[a:a+16]==rom[b:b+16],(q,w,nw)
 checks+=1
for bank in protected:
 at=CHR+bank*4096;assert old[at:at+4096]==rom[at:at+4096],bank
safe=audit(rom)[1]
assert not any(q*64+(w>>8&63) in BANKS for q,w in course_words(rom))
report={'retired':sorted(retired),'safe':safe,'checks':checks,'stats':stats,'protected':sorted(protected),'sha256':hashlib.sha256(rom).hexdigest()}
(TEMP/'repacked.nes').write_bytes(rom)
(OUT/'allocation.json').write_text(json.dumps(report,indent=2))
print(report)

# Reuse the current minimap/HUD builder unchanged, substituting only allocation.
import importlib.util,os
spec=importlib.util.spec_from_file_location('minimap_build',REPO/'direct-runtime/minimap/build.py')
build=importlib.util.module_from_spec(spec);spec.loader.exec_module(build)
def reserved(target,extra_retired=()):
    assert bytes(target)==old
    target[:]=rom
    return report,list(safe)
build.reserve=reserved
candidate=TEMP/'HudB2_Repacked.nes'
candidate.write_bytes(old)
build.apply(candidate)
(OUT/'build-manifest.json').write_bytes((REPO/'build/minimap/player-manifest.json').read_bytes())
print('Candidate:',candidate)

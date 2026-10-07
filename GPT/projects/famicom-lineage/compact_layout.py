"""短い段間隔と可変幅のノードを使う、年代別の直角配線。"""
from collections import Counter,defaultdict
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

HERE=Path(__file__).resolve().parent

def compute(data,title_lines):
    nodes={n['id']:n for n in data['nodes']};edges=data['edges'];end_year=data.get('end_year',1987)
    # 配置条件の変更時も、別PCの古いキャッシュを使わない。
    signature=hashlib.sha256(('spacing-v5:'+json.dumps(data,sort_keys=True,ensure_ascii=False)).encode()).hexdigest()
    portable=HERE.parents[1]/'.tmp/graphviz-layout/portable/Graphviz-16.1.0-win64/bin/dot.exe'
    executable=shutil.which(os.environ.get('GRAPHVIZ_DOT','dot')) or (str(portable) if portable.is_file() else None)
    if not executable:
        cached=HERE/'output/layout.json'
        if cached.is_file():
            result=json.loads(cached.read_text(encoding='utf-8'))
            if result.get('signature')==signature:return dict(result,nodes=nodes)
        raise RuntimeError('配置の更新にはGraphvizが必要です。GRAPHVIZ_DOTでdotを指定してください。HTMLの閲覧には不要です。')
    outgoing=defaultdict(list);parents={};primary=[];secondary=[]
    for e in edges:
        outgoing[e['source']].append(e['target'])
        if e['target'] in parents:secondary.append(e)
        else:parents[e['target']]=e['source'];primary.append(e)
    years={};depth={}
    def year(i):
        if i not in years:years[i]=nodes[i]['year'] if not nodes[i]['external'] else min([year(c) for c in outgoing[i]] or [max(1983,nodes[i]['year'])])
        return years[i]
    def level(i):
        if i not in depth:
            p=parents.get(i);depth[i]=level(p)+1 if p and year(p)==year(i) else 0
        return depth[i]
    sizes={}
    for i,n in nodes.items():
        ls=title_lines(n['title']);w=max(76,min(124,16+max(sum(12 if ord(c)>255 else 6.3 for c in s) for s in ls)))
        sizes[i]=(w,34+len(ls)*14)
        year(i);level(i)
    buckets=defaultdict(list)
    for i in nodes:buckets[(years[i],depth[i])].append(i)
    ranks={};year_ranks={};rank=0
    def root(i):
        while i in parents:i=parents[i]
        return i
    for y in range(1983,end_year+1):
        # 年の先頭は再掲用の細い段。通常の作品はその直後から詰める。
        first=rank;rank+=1
        for stage in sorted(s for yy,s in buckets if yy==y):
            ids=sorted(buckets[(y,stage)],key=lambda i:(nodes[root(i)]['group'],root(i),parents.get(i,''),nodes[i]['date'],i))
            for start in range(0,len(ids),26):
                for i in ids[start:start+26]:ranks[i]=rank
                rank+=1
        year_ranks[y]=(first,rank-1)
    clones=[];secondary_ids={}
    for j,e in enumerate(secondary):
        i=f'r{j:03}';source=e['source'];target=e['target'];ranks[i]=ranks[target]-1;sizes[i]=sizes[source]
        clones.append((i,source));secondary_ids[(source,target)]=i
    lines=['digraph Lineage {','graph [rankdir=TB, splines=ortho, nodesep=0.12, ranksep=0.30, margin=0, pad=0, outputorder=edgesfirst];','node [shape=box, fixedsize=true, label=""];','edge [tailport=s, headport=n, arrowsize=.5];']
    for i,(w,h) in sizes.items():lines.append(f'{i} [width={w/72:.6f},height={h/72:.6f}];')
    for r in range(rank):
        ids=[i for i,value in ranks.items() if value==r]
        lines.append(f'a{r:03} [shape=point,width=.001,height=.001,style=invis];')
        lines.append('{rank=same; '+'; '.join([f'a{r:03}',*ids])+';}')
        if r:lines.append(f'a{r-1:03} -> a{r:03} [style=invis,weight=500,minlen=1];')
    for e in edges:
        a=secondary_ids.get((e['source'],e['target']),e['source']);b=e['target']
        lines.append(f'{a} -> {b} [constraint=false,weight={30 if e["sequel"] else 2}];')
    lines.append('}')
    out=HERE/'output';out.mkdir(exist_ok=True)
    (out/'compact-layout.dot').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    raw=subprocess.check_output([executable,'-Tjson',str(out/'compact-layout.dot')])
    graph=json.loads(raw)
    _,_,gw,gh=map(float,graph['bb'].split(','));left=100;header=135
    objects={o['name']:o for o in graph['objects'] if 'pos' in o};cards=[];positions={}
    node_of={i:i for i in nodes};node_of.update(dict(clones))
    for i,nid in node_of.items():
        o=objects[i];cx,cy=map(float,o['pos'].split(','));w=float(o['width'])*72;h=float(o['height'])*72
        x=left+cx-w/2;y=header+gh-cy-h/2
        cards.append(dict(id=i,node=nid,x=x,y=y,w=w,h=h,alias=i!=nid));positions[i]=(x+w/2,y,w,h)
    bands={}
    for y,(first,last) in year_ranks.items():
        ys=[c for c in cards if year(c['node'])==y and not c['alias']]
        top=min(c['y'] for c in ys)-15
        bottom=max(c['y']+c['h'] for c in ys)+15
        # 境界を隣の年との空きの中央に置き、年末の深い枝の余白を追加しない。
        bands[y]=[top,bottom]
    for y in range(1983,end_year):
        boundary=(bands[y][1]+bands[y+1][0])/2;bands[y][1]=boundary;bands[y+1][0]=boundary
    lookup={o['_gvid']:o['name'] for o in graph['objects']}
    routes={};arrows={}
    for e in graph.get('edges',[]):
        if e.get('style')=='invis':continue
        points=[(left+x,header+gh-y) for c in e.get('_draw_',[]) if c['op']=='b' for x,y in c['points']]
        clean=[]
        for point in points:
            if not clean or point!=clean[-1]:clean.append(point)
        routes[(lookup[e['tail']],lookup[e['head']])]=clean
        arrows[(lookup[e['tail']],lookup[e['head']])]=[(left+x,header+gh-y) for c in e.get('_hdraw_',[]) if c['op']=='P' for x,y in c['points']]
    paths=[]
    for e in edges:
        a=secondary_ids.get((e['source'],e['target']),e['source']);b=e['target'];pts=routes[(a,b)]
        # Graphvizは混雑時に側面へ接続する。北向きの端へ強制変更すると、
        # 矢印だけ上へ折り返して浮くため、実際の接続方向と矢印を保持する。
        paths.append(dict(edge=e,points=pts,arrow=arrows[(a,b)],source=a,target=b))
    return dict(nodes=nodes,cards=cards,paths=paths,bands=bands,width=int(gw+left+30),height=int(gh+header+30),components=[],
                shelf_x=0,primary_count=len(primary),secondary_count=len(secondary),signature=signature,engine='Graphviz compact ranks')

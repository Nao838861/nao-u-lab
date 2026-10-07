"""国内発売年を縦軸に揃えた系譜図をSVG・PNGへ出力する。"""
import argparse
from collections import Counter, defaultdict
import html
import json
import math
from pathlib import Path
import xml.etree.ElementTree as ET

HERE=Path(__file__).resolve().parent
COLORS=['#fbe4e4','#eee4fa','#e3f2fc','#def5ec','#e6edfc','#fff0d5','#ffeadc','#eaf2de','#edf0f4']
EDGE_COLORS={'lineage':'#227553','documented':'#2563b0','inferred':'#916238'}
BW=174; BH=110; PITCH=208; ROW=148; LEFT=180; HEADER=170

def validate(data):
    nodes={n['id']:n for n in data['nodes']}
    assert len(nodes)==len(data['nodes']), 'ID重複'
    incoming=Counter(); outgoing=defaultdict(list); pairs=set()
    for e in data['edges']:
        a,b=e['source'],e['target']
        assert a in nodes and b in nodes and a!=b and (a,b) not in pairs, '参照・重複'
        assert nodes[a]['year']<=nodes[b]['year'], '年の逆行'
        assert e['kind'] in EDGE_COLORS and e['reason'], '関係種別・説明'
        assert e['kind']!='documented' or e['sources'], '証言の出典'
        pairs.add((a,b)); incoming[b]+=1; outgoing[a].append(b)
    degrees=incoming.copy(); pending=[i for i in nodes if not degrees[i]]; visited=0
    while pending:
        a=pending.pop(); visited+=1
        for b in outgoing[a]:
            degrees[b]-=1
            if degrees[b]==0:pending.append(b)
    assert visited==len(nodes),'循環'
    exceptions=data['display_policy']['multiple_parent_exceptions']
    assert all(c<=exceptions.get(i,{}).get('max_parents',1) and c<=3 for i,c in incoming.items()), '影響元の本数'
    fc=[n for n in nodes.values() if not n['external']]
    assert all(1983<=n['year']<=1989 for n in fc),'対象年'
    assert len(fc)==data['stats']['fc_count'],'作品数'
    assert sum(len(n['releases']) for n in fc)==len(json.loads((HERE/'catalogue.json').read_text(encoding='utf-8'))['rows']),'一覧の取りこぼし'
    return nodes

def title_lines(title):
    familiar={'スーパーマリオブラザーズ':['スーパーマリオ','ブラザーズ'], 'スーパーマリオブラザーズ2':['スーパーマリオ','ブラザーズ2'], 'スーパーマリオブラザーズ3':['スーパーマリオ','ブラザーズ3'], 'ファイナルファンタジー':['ファイナル','ファンタジー'], 'ファイナルファンタジーII':['ファイナル','ファンタジーII']}
    if title in familiar:return familiar[title]
    width=lambda s:sum(1 if ord(c)>255 else .52 for c in s)
    count=max(1,math.ceil(width(title)/10)); target=width(title)/count
    lines=[]; line=''
    for c in title:
        if line and width(line+c)>target+.5 and len(lines)<count-1:lines.append(line.strip()); line=''
        line+=c
    if line:lines.append(line.strip())
    return lines

def layout(data):
    nodes=validate(data); children=defaultdict(list); parents={}; primary=[]; secondary=[]
    for e in data['edges']:
        b=e['target']
        if b not in parents:parents[b]=e['source']; children[e['source']].append(b); primary.append(e)
        else:secondary.append(e)
    extras=Counter(e['target'] for e in secondary)
    followers=defaultdict(list)
    for e in data['edges']:followers[e['source']].append(e['target'])
    years={}
    def display_year(i):
        if i in years:return years[i]
        n=nodes[i]
        years[i]=n['year'] if not n['external'] else min([display_year(c) for c in followers[i]] or [max(1983,n['year'])])
        return years[i]
    for i in nodes:display_year(i)
    active={e[k] for e in primary for k in ['source','target']}
    roots=sorted((i for i in active if i not in parents),key=lambda i:(nodes[i]['group'],nodes[i]['year'],nodes[i]['title']))
    for ids in children.values():ids.sort(key=lambda i:(nodes[i]['year'],nodes[i]['date'],nodes[i]['title']))
    widths={}; xpos={}; depth={}
    def measure(i):
        widths[i]=max(1,sum(measure(c) for c in children[i]))+extras[i]
        return widths[i]
    def place(i,start):
        slot=start+extras[i]
        for c in children[i]:place(c,slot); slot+=widths[c]
        xpos[i]=start+extras[i]+(widths[i]-extras[i])/2
    # 時代の重ならない小さな系統は同じ横位置を再利用する。
    # 年代が重なる系統は矩形の専用領域を確保し、線の追いやすさを維持する。
    total=0; components=[]; occupied=[]
    def descendants(i):
        yield i
        for c in children[i]:yield from descendants(c)
    for root in roots:measure(root)
    for root in sorted(roots,key=lambda i:(-widths[i],nodes[i]['year'],nodes[i]['title'])):
        subtree_years=[years[i] for i in descendants(root)]; first,last=min(subtree_years),max(subtree_years)
        candidates=sorted({0,*[end+.6 for start,end,lo,hi in occupied]})
        start=next(x for x in candidates if not any(max(x,a)<min(x+widths[root],b) and max(first,lo)<=min(last,hi) for a,b,lo,hi in occupied))
        place(root,start); components.append((root,start,widths[root])); occupied.append((start,start+widths[root],first,last))
        total=max(total,start+widths[root]+.6)
    def stage(i):
        if i in depth:return depth[i]
        p=parents.get(i)
        depth[i]=(stage(p)+2 if p and years[p]==years[i] else 0)+(2 if extras[i] and not p else 0)
        return depth[i]
    for i in active:stage(i)
    unlinked=defaultdict(list)
    for i,n in nodes.items():
        if i not in active:unlinked[years[i]].append(i)
    shelf_cols=16; shelf_x=total+1.1; bands={}; y=HEADER
    for year in range(1983,1990):
        levels=[depth[i]+1 for i in active if years[i]==year]
        height=80+max([1,math.ceil(len(unlinked[year])/shelf_cols),*levels])*ROW
        bands[year]=(y,y+height); y+=height
    positions={}; cards=[]
    def card(i,x,top,alias=False,node=None):
        cards.append(dict(id=i,node=node or i,x=x-BW/2,y=top,w=BW,h=BH,alias=alias)); positions[i]=(x,top)
    for i in sorted(active):card(i,LEFT+xpos[i]*PITCH,bands[years[i]][0]+65+depth[i]*ROW)
    for year,ids in unlinked.items():
        ids.sort(key=lambda i:(nodes[i]['external'],nodes[i]['date'],nodes[i]['title']))
        for j,i in enumerate(ids):card(i,LEFT+(shelf_x+j%shelf_cols+.5)*PITCH,bands[year][0]+65+(j//shelf_cols)*ROW)
    paths=[]; counts=Counter()
    for e in primary:
        a,b=e['source'],e['target']; ax,ay=positions[a]; bx,by=positions[b]
        bend=ay+BH+18+min(counts[a],4)*4; counts[a]+=1
        paths.append(dict(edge=e,points=[(ax,ay+BH),(ax,bend),(bx,bend),(bx,by-5)],source=a,target=b))
    for j,e in enumerate(secondary):
        target=e['target']; tx,ty=positions[target]
        ordinal=sum(prior['target']==target for prior in secondary[:j])
        x=tx+(-1 if ordinal==0 else 1)*PITCH; alias_id=f'r{j:03}'; top=ty-ROW
        card(alias_id,x,top,True,e['source']); bend=top+BH+18+ordinal*5
        paths.append(dict(edge=e,points=[(x,top+BH),(x,bend),(tx,bend),(tx,ty-5)],source=alias_id,target=target))
    return dict(nodes=nodes,cards=cards,paths=paths,bands=bands,width=math.ceil(LEFT+(shelf_x+shelf_cols+.5)*PITCH+80),height=y+60,
                components=components,shelf_x=LEFT+shelf_x*PITCH,primary_count=len(primary),secondary_count=len(secondary))

def verify(drawing,data):
    cards=drawing['cards']; hits=[]
    assert {c['node'] for c in cards if not c['alias']}==set(drawing['nodes']), '描画作品の取りこぼし'
    assert len(drawing['paths'])==len(data['edges']), '描画接続の取りこぼし'
    for c in cards:
        n=drawing['nodes'][c['node']]
        if not n['external'] and not c['alias']:
            top,bottom=drawing['bands'][n['year']]
            assert top<=c['y'] and c['y']+c['h']<=bottom, '発売年と背景の不一致'
    for j,a in enumerate(cards):
        for b in cards[j+1:]:
            if max(a['x'],b['x'])<min(a['x']+a['w'],b['x']+b['w'])-.1 and max(a['y'],b['y'])<min(a['y']+a['h'],b['y']+b['h'])-.1:raise ValueError('箱の重なり: '+a['id']+' '+b['id'])
    for p in drawing['paths']:
        assert p['points'][-1][1]>p['points'][0][1], '上向きの接続'
        for a,b in zip(p['points'],p['points'][1:]):
            assert a[0]==b[0] or a[1]==b[1], '非直角の線'
            for c in cards:
                if c['id'] in [p['source'],p['target']]:continue
                x,y,w,h=c['x'],c['y'],c['w'],c['h']
                vertical=a[0]==b[0] and x+.5<a[0]<x+w-.5 and max(min(a[1],b[1]),y+.5)<min(max(a[1],b[1]),y+h-.5)
                horizontal=a[1]==b[1] and y+.5<a[1]<y+h-.5 and max(min(a[0],b[0]),x+.5)<min(max(a[0],b[0]),x+w-.5)
                if vertical or horizontal:hits.append((p['source'],p['target'],c['id']))
    if hits:raise ValueError('接続線が別の箱を通ります: '+str(hits[:8]))
    return dict(node_count=len(data['nodes']),fc_count=data['stats']['fc_count'],external_count=data['stats']['external_count'],box_count=len(cards),
                repeated_reference_count=drawing['secondary_count'],edge_count=len(drawing['paths']),sequel_edge_count=sum(e['sequel'] for e in data['edges']),
                year_counts=data['stats']['year_counts'],node_overlap_count=0,edge_node_overlap_count=0,all_edges_solid=True,all_edges_downward=True,
                width=drawing['width'],height=drawing['height'],year_band_count=7,fc_year_band_placement=True)

def emit(d,data,font):
    w,h=d['width'],d['height']; svg=[]; commands=[]; esc=html.escape
    def rect(x,y,rw,rh,fill,stroke=None,radius=0,sw=1):
        svg.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{rw:.1f}" height="{rh:.1f}" rx="{radius}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="{sw}"' if stroke else '')+'/>'); commands.append(('rect',(x,y,rw,rh),fill,stroke,radius,sw))
    def text(x,y,value,size=16,color='#243348',bold=False,anchor='start'):
        svg.append(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{color}" text-anchor="{anchor}"'+(' font-weight="bold"' if bold else '')+f'>{esc(value)}</text>'); commands.append(('text',(x,y),value,size,color,bold,anchor))
    def line(points,color,width=1):
        svg.append('<polyline points="'+' '.join(f'{x:.1f},{y:.1f}' for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round"/>'); commands.append(('line',points,color,width))
    rect(0,0,w,h,'white')
    for year,(top,bottom) in d['bands'].items():
        rect(0,top,w,bottom-top,'#f8fafc' if year%2==0 else '#ffffff'); line([(0,top),(w,top)],'#cbd5e1',1.5)
        label=str(year); text(22,top+40,label,23,'#536579',True)
        count=data['stats']['year_counts'].get(str(year),0); text(22,top+65,f'{count}作品',12,'#64748b')
        for x in range(1200,w,1200):text(x,top+37,label,21,'#a5b1be')
    # 系統間の背景線は置かない。同じ列を別の時代の系統が再利用するため。
    shelf=d['shelf_x']; text(shelf,HEADER-18,'関係未判定の作品（発売順）',15,'#64748b',True); line([(shelf-20,HEADER),(shelf-20,h-30)],'#b9c5d0',1.5)
    for p in d['paths']:
        e=p['edge']; color=EDGE_COLORS[e['kind']]; thickness=3.8 if e['sequel'] else 1.5
        svg.append(f'<g><title>{esc(d["nodes"][e["source"]]["title"]+" → "+d["nodes"][e["target"]]["title"]+"："+e["reason"])}</title>')
        line(p['points'],'white',thickness+3); line(p['points'],color,thickness)
        x,y=p['points'][-1]; polygon=[(x,y+5),(x-4,y-3),(x+4,y-3)]
        svg.append('<polygon points="'+' '.join(f'{px:.1f},{py:.1f}' for px,py in polygon)+f'" fill="{color}"/>'); commands.append(('polygon',polygon,color)); svg.append('</g>')
    for c in d['cards']:
        n=d['nodes'][c['node']]; x,y=c['x'],c['y']; external=n['external']
        svg.append(f'<g id="{c["id"]}"><title>{esc(n["title"]+" / "+n["platform"]+" / "+n["date"]+(" / 同じ作品の再掲" if c["alias"] else ""))}</title>')
        rect(x,y,BW,BH,'white' if external else COLORS[n['group']], '#98a7b5' if external else '#60758a',12 if external else 2)
        if not external:rect(x,y,4,BH,'#7693ab' if n['platform']=='FDS' else '#b64d52')
        badge=n['platform']; badge_color='#7b8996' if external else ('#456b85' if badge=='FDS' else '#a54249')
        rect(x+9,y+8,max(26,len(badge)*7+10),17,'#f0f3f6' if external else 'white',radius=4); text(x+14,y+21,badge,10,badge_color,True)
        if c['alias']:text(x+BW-10,y+21,'再掲',10,'#78889a',anchor='end')
        lines=title_lines(n['title']); size=min(15,max(7,math.floor(62/max(1,len(lines)))-3)); spacing=size+3; start=y+33+(62-spacing*len(lines))/2+size
        for j,s in enumerate(lines):text(x+BW/2,start+j*spacing,s,size,'#445464' if external else '#1d3045',not external,'middle')
        subtitle='初出 '+str(n['year']) if external else n['date'].replace('-','.')
        if c['alias']:subtitle=('' if external else '発売 ')+subtitle+' の参照'
        text(x+BW/2,y+101,subtitle,10,'#738396',anchor='middle'); svg.append('</g>')
    text(LEFT,43,'ファミコンの系譜 1983–1989',30,'#203348',True); stats=data['stats']
    text(LEFT,73,f'FC・ディスク {stats["fc_count"]}作品 ／ 外部参考 {stats["external_count"]}作品 ／ 関係 {stats["edge_count"]}本',15)
    text(LEFT,99,'下ほど新しい国内発売年。影響元は原則1本。太線は続編。緑：継承　青：証言あり　茶：推定。',14,'#536579')
    text(LEFT,123,'矩形：FC・FDS ／ 白い角丸：外部参考（初出年を添えて影響先の近くに配置）。年内の上下は系譜を優先。',13,'#64748b')
    xml=f'<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="1989年までのファミコン作品の系譜図"><g font-family="{esc(font)}, sans-serif">\n'+ '\n'.join(svg)+'\n</g></svg>\n'
    ET.fromstring(xml); return xml,commands

def raster(commands,path,width,height,font_path,scale=1,offset=(0,0)):
    from PIL import Image,ImageDraw,ImageFont
    im=Image.new('RGB',(max(1,round(width*scale)),max(1,round(height*scale))),'white'); draw=ImageDraw.Draw(im); fonts={}; ox,oy=offset
    xy=lambda p:((p[0]-ox)*scale,(p[1]-oy)*scale)
    for op,*args in commands:
        if op=='rect':
            (x,y,w,h),fill,stroke,radius,sw=args
            if x+w<ox or x>ox+width or y+h<oy or y>oy+height:continue
            draw.rounded_rectangle([xy((x,y)),xy((x+w,y+h))],radius=radius*scale,fill=fill,outline=stroke,width=max(1,round(sw*scale)))
        elif op=='line':
            points,color,sw=args; draw.line([xy(p) for p in points],fill=color,width=max(1,round(sw*scale)),joint='curve')
        elif op=='polygon':
            points,color=args; draw.polygon([xy(p) for p in points],fill=color)
        elif op=='text':
            (x,y),value,size,color,bold,anchor=args
            if y<oy-50 or y>oy+height+50 or x<ox-500 or x>ox+width+500:continue
            key=(size,bold)
            if key not in fonts:
                selected=font_path.replace('meiryo.ttc','meiryob.ttc') if bold and Path(font_path.replace('meiryo.ttc','meiryob.ttc')).is_file() else font_path
                fonts[key]=ImageFont.truetype(selected,max(1,round(size*scale)))
            f=fonts[key]; px,py=xy((x,y)); tw=draw.textlength(value,font=f)
            if anchor=='middle':px-=tw/2
            elif anchor=='end':px-=tw
            draw.text((px,py),value,font=f,fill=color,anchor='ls')
    im.save(path,optimize=True); return im.size

def main():
    parser=argparse.ArgumentParser(description=__doc__); parser.add_argument('--font',default='Meiryo'); parser.add_argument('--font-path',default='C:/Windows/Fonts/meiryo.ttc'); parser.add_argument('--check',action='store_true')
    args=parser.parse_args(); data=json.loads((HERE/'dataset.json').read_text(encoding='utf-8')); d=layout(data); report=verify(d,data)
    if args.check:print(json.dumps(report,ensure_ascii=False)); return
    output=HERE/'output'; output.mkdir(exist_ok=True); svg,commands=emit(d,data,args.font); stem='famicom-through1989-timeline'
    (output/(stem+'.svg')).write_text(svg,encoding='utf-8'); (output/'famicom-first100-hierarchy.svg').write_text(svg,encoding='utf-8')
    w,h=d['width'],d['height']; scale=min(1,math.sqrt(60_000_000/(w*h)))
    report['png_size']=raster(commands,output/(stem+'.png'),w,h,args.font_path,scale)
    raster(commands,output/(stem+'-preview.png'),w,h,args.font_path,min(2200/w,1800/h))
    mario=next(c for c in d['cards'] if d['nodes'][c['node']]['title']=='スーパーマリオブラザーズ' and not c['alias'])
    raster(commands,output/(stem+'-detail.png'),1600,480,args.font_path,offset=(max(0,mario['x']-500),max(0,mario['y']-200)))
    for label,title in [('mario','スーパーマリオブラザーズ'),('rpg','ドラゴンクエスト')]:
        target=next(n['id'] for n in data['nodes'] if n['title']==title and not n['external']); parents={p['edge']['target']:p['edge']['source'] for p in d['paths'][:d['primary_count']]}; root=target
        while root in parents:root=parents[root]
        _,start,span=next(c for c in d['components'] if c[0]==root); x=max(0,LEFT+start*PITCH-30); cw=span*PITCH+60
        raster(commands,output/(stem+'-'+label+'.png'),cw,h,args.font_path,min(1,math.sqrt(24_000_000/(cw*h))),offset=(x,0))
    (output/'layout.json').write_text(json.dumps({k:v for k,v in d.items() if k!='nodes'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (output/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); print(json.dumps(report,ensure_ascii=False))

if __name__=='__main__':main()

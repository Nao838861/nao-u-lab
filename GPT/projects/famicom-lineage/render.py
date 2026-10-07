"""初期100タイトルの階層図をGraphvizで生成する。正本はdataset.json。"""
import argparse
import html
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
COLORS = ['#fbe4e4','#eee4fa','#e3f2fc','#def5ec','#e6edfc','#fff0d5','#ffeadc','#eaf2de','#edf0f4']
EDGE_COLORS = {'lineage':'#16724b','documented':'#1a5dba','inferred':'#8c5a22'}

def quote(value):
    return json.dumps(str(value),ensure_ascii=False)

def validate(data):
    nodes={n['title']:n for n in data['nodes']}
    if len(nodes)!=len(data['nodes']):
        raise ValueError('作品名が重複しています')
    fc=[n for n in nodes.values() if not n['external']]
    if len(fc)!=100 or {n['fc_index'] for n in fc}!=set(range(1,101)):
        raise ValueError('初期100タイトルの番号・件数が不正です')
    seen=set(); incoming={n:0 for n in nodes}; followers={n:[] for n in nodes}
    for edge in data['edges']:
        a,b=edge['source'],edge['target']
        if a not in nodes or b not in nodes or a==b or (a,b) in seen:
            raise ValueError(f'接続の参照・重複・自己参照が不正です: {a} -> {b}')
        if edge['kind'] not in EDGE_COLORS or not edge['reason']:
            raise ValueError(f'関係種別・説明が不正です: {a} -> {b}')
        if edge['kind']=='documented' and not edge['sources']:
            raise ValueError(f'証言ありの関係に出典がありません: {a} -> {b}')
        if nodes[a]['original_year']>nodes[b]['original_year']:
            raise ValueError(f'原作初出年が逆転しています: {a} -> {b}')
        seen.add((a,b)); incoming[b]+=1; followers[a].append(b)
    pending=[n for n,count in incoming.items() if count==0]; visited=0
    while pending:
        n=pending.pop(); visited+=1
        for nxt in followers[n]:
            incoming[nxt]-=1
            if incoming[nxt]==0: pending.append(nxt)
    if visited!=len(nodes): raise ValueError('関係に循環があります')
    if max(sum(e['target']==n for e in data['edges']) for n in nodes)>5:
        raise ValueError('影響元が5本を超える作品があります')
    return nodes

def title_lines(title):
    # 行の長さを抑えつつ単語途中の一文字だけの改行を避ける。
    if len(title)<=17: return [title]
    middle=len(title)//2
    splits=[i for i,c in enumerate(title) if c in ' ・（(' and 5<=i<=len(title)-5]
    cut=min(splits,key=lambda i:abs(i-middle)) if splits else middle
    return [title[:cut].strip(),title[cut:].strip()]

def dot_source(data,font):
    nodes=validate(data)
    ids={name:f'g{i:03}' for i,name in enumerate(nodes)}
    legend=('ファミコン初期100タイトルの系譜図\\n'
            '上：影響元 → 下：影響先　／　国内FC発売順 1983.07.15〜1986.01.04\\n'
            '緑実線：続編・先行版　　青実線：証言のある影響　　茶破線：推定\\n'
            f'FC 100本 ＋ 外部先行作品 {len(nodes)-100}本　／　関係 {len(data["edges"])}本\\n'
            '破線は試作の仮説。配置の段は年代ではありません。')
    lines=['digraph FamicomLineage {',
           f'graph [rankdir=TB, splines=ortho, nodesep=1.05, ranksep=2.1, pack=100, packmode="array_3", pad=0.7, bgcolor="white", outputorder=edgesfirst, concentrate=false, fontname={quote(font)}, fontsize=26, labelloc=t, label={quote(legend)}];',
           f'node [shape=plain, fontname={quote(font)}];',
           'edge [arrowsize=0.85, penwidth=1.8, tailport=s, headport=n];']
    active=set(e[k] for e in data['edges'] for k in ['source','target'])
    for name,n in nodes.items():
        title='<BR/>'.join(html.escape(s) for s in title_lines(name))
        subtitle=(f'外部先行作品 / 初出 {n["original_year"]}' if n['external'] else
                  f'#{n["fc_index"]:03}  FC {n["fc_date"].replace("-",".")} / 初出 {n["original_year"]}')
        fill=COLORS[n['group']]
        marker='外部' if n['external'] else 'FC'
        label=(f'<<TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="10" COLOR="#475569" BGCOLOR="{fill}">'
               f'<TR><TD WIDTH="275" HEIGHT="60"><FONT FACE="{html.escape(font)}" POINT-SIZE="18" COLOR="#152238"><B>{title}</B></FONT></TD></TR>'
               f'<TR><TD BORDER="1" SIDES="T" COLOR="#94a3b8" BGCOLOR="white"><FONT FACE="{html.escape(font)}" POINT-SIZE="11" COLOR="#475569">{html.escape(subtitle)}</FONT></TD></TR></TABLE>>')
        lines.append(f'{ids[name]} [label={label}, tooltip={quote(name+" / "+marker)}];')
    isolated=[ids[n] for n in nodes if n not in active]
    if isolated:
        lines.extend(['subgraph cluster_unlinked {',
                      f'label="この試作では影響関係を結ばなかった作品"; fontname={quote(font)}; fontsize=18; color="#cbd5e1";',
                      '{rank=same; '+'; '.join(isolated)+';}', '}'])
    for e in data['edges']:
        kind=e['kind']; color=EDGE_COLORS[kind]
        style='dashed' if kind=='inferred' else 'solid'
        weight=1 if kind=='inferred' else 4
        lines.append(f'{ids[e["source"]]} -> {ids[e["target"]]} [color="{color}", style="{style}", weight={weight}, tooltip={quote(e["reason"])}];')
    lines.append('}')
    # DOTの改行エスケープはJSONの文字列エスケープから戻す。
    return '\n'.join(lines).replace('\\\\n','\\n')+'\n'

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dot',default=os.environ.get('GRAPHVIZ_DOT','dot'),help='Graphviz dot実行ファイル')
    parser.add_argument('--font',default='Meiryo' if sys.platform=='win32' else 'Noto Sans CJK JP')
    parser.add_argument('--check',action='store_true',help='データ検証とDOT出力のみ')
    args=parser.parse_args()
    data=json.loads((HERE/'dataset.json').read_text(encoding='utf-8'))
    validate(data)
    out=HERE/'output'; out.mkdir(exist_ok=True)
    path=out/'famicom-first100-hierarchy.dot'
    path.write_text(dot_source(data,args.font),encoding='utf-8')
    if args.check:
        print('PASS: FC 100本、参照、重複、循環、初出年、最大5本、出典を検証しました')
        return
    executable=shutil.which(args.dot)
    if not executable and Path(args.dot).is_file(): executable=str(Path(args.dot).resolve())
    if not executable: raise SystemExit('Graphvizのdotが見つかりません。READMEの手順で導入するか、--dotで指定してください。')
    for fmt in ['svg','json']:
        subprocess.run([executable,f'-T{fmt}',str(path),'-o',str(out/f'famicom-first100-hierarchy.{fmt}'),'-Gdpi=110'],check=True)
    ET.parse(out/'famicom-first100-hierarchy.svg')
    # 136個の作品箱と138接続が出力され、箱同士が重ならないことを配置結果から確認。
    layout=json.loads((out/'famicom-first100-hierarchy.json').read_text(encoding='utf-8'))
    x1,y1,x2,y2=map(float,layout['bb'].split(','))
    # ベクター画像は原寸、PNGは75メガピクセル以内にして別PCのメモリ消費を抑える。
    area_inches=((x2-x1+100.8)/72)*((y2-y1+100.8)/72)
    png_dpi=min(110,math.floor(math.sqrt(75_000_000/area_inches)))
    subprocess.run([executable,'-Tpng',str(path),'-o',str(out/'famicom-first100-hierarchy.png'),f'-Gdpi={png_dpi}'],check=True)
    boxes=[o for o in layout['objects'] if 'pos' in o and o['name'].startswith('g')]
    if len(boxes)!=len(data['nodes']) or len(layout['edges'])!=len(data['edges']):
        raise ValueError('描画した作品・接続の件数がデータと一致しません')
    for i,a in enumerate(boxes):
        ax,ay=map(float,a['pos'].split(',')); aw,ah=float(a['width'])*72,float(a['height'])*72
        for b in boxes[i+1:]:
            bx,by=map(float,b['pos'].split(',')); bw,bh=float(b['width'])*72,float(b['height'])*72
            if abs(ax-bx)<(aw+bw)/2-1 and abs(ay-by)<(ah+bh)/2-1:
                raise ValueError(f'作品箱が重なっています: {a["name"]}, {b["name"]}')
    bounds={o['_gvid']:tuple(map(float,o['pos'].split(',')))+(float(o['width'])*72,float(o['height'])*72) for o in boxes}
    segment_count=0
    for edge in layout['edges']:
        for command in edge.get('_draw_',[]):
            if command['op']!='b': continue
            for a,b in zip(command['points'],command['points'][1:]):
                if a==b: continue
                segment_count+=1
                horizontal=abs(a[1]-b[1])<.1
                vertical=abs(a[0]-b[0])<.1
                if not (horizontal or vertical): raise ValueError('直角以外の接続線があります')
                for key,(x,y,w,h) in bounds.items():
                    if key in (edge['tail'],edge['head']): continue
                    hits_vertical=vertical and x-w/2+1<a[0]<x+w/2-1 and max(min(a[1],b[1]),y-h/2+1)<min(max(a[1],b[1]),y+h/2-1)
                    hits_horizontal=horizontal and y-h/2+1<a[1]<y+h/2-1 and max(min(a[0],b[0]),x-w/2+1)<min(max(a[0],b[0]),x+w/2-1)
                    if hits_vertical or hits_horizontal: raise ValueError(f'接続線が別の作品箱を通っています: {key}')
    from PIL import Image
    with Image.open(out/'famicom-first100-hierarchy.png') as im:
        im.load(); original_size=im.size
        im.thumbnail((2000,2000),Image.Resampling.LANCZOS)
        im.save(out/'famicom-first100-hierarchy-preview.png',optimize=True)
    version=subprocess.run([executable,'-V'],capture_output=True,text=True,check=True)
    report=dict(node_count=len(boxes),fc_count=100,edge_count=len(layout['edges']),node_overlap_count=0,
                edge_node_overlap_count=0,non_orthogonal_segment_count=0,segment_count=segment_count,
                png_size=original_size,png_dpi=png_dpi,graphviz=(version.stderr or version.stdout).strip(),font=args.font)
    (out/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))

if __name__=='__main__': main()

"""サーバーなしで開ける、データ内蔵のブラウザ閲覧ページを生成する。"""
import json
from pathlib import Path
import render

HERE=Path(__file__).resolve().parent

def build():
    data=json.loads((HERE/'dataset.json').read_text(encoding='utf-8'))
    drawing=render.layout(data)
    report=render.verify(drawing,data)
    payload={k:drawing[k] for k in ['nodes','cards','paths','bands','width','height']}
    payload['stats']=data['stats']
    for node in payload['nodes'].values():node['lines']=render.title_lines(node['title'])
    encoded=json.dumps(payload,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    template=(HERE/'viewer.html').read_text(encoding='utf-8')
    assert template.count('__LINEAGE_DATA__')==1
    result=template.replace('__LINEAGE_DATA__',encoded)
    (HERE/'index.html').write_text(result,encoding='utf-8')
    print(f'ブラウザ閲覧ページを生成: {report["node_count"]}作品・{report["edge_count"]}接続・{len(result.encode("utf-8")):,} bytes')

if __name__=='__main__':build()

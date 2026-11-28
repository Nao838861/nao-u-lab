"""data/dem.bin を 1/2 に間引いて data/dem.js (base64埋め込み) を作る。file:// でも開けるようにするため。"""
import base64, json, os
import numpy as np
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
m = json.load(open(os.path.join(D, 'dem.json'), encoding='utf-8'))
a = np.frombuffer(open(os.path.join(D, 'dem.bin'), 'rb').read(), dtype='<u2').reshape(m['height'], m['width'])
H2, W2 = m['height'] // 2, m['width'] // 2
b = a[:H2*2, :W2*2].reshape(H2, 2, W2, 2).astype(np.float32).mean(axis=(1, 3)).round().astype('<u2')
meta = dict(m, width=W2, height=H2)
js = 'window.DEM_META=' + json.dumps(meta, ensure_ascii=False) + ';\nwindow.DEM_B64="' + base64.b64encode(b.tobytes()).decode() + '";\n'
open(os.path.join(D, 'dem.js'), 'w', encoding='utf-8').write(js)
print(W2, H2, len(js))

"""dev.html（js/*.js をモジュールとして読む開発用）から、JS を埋め込んだ index.html を作る。
index.html は file:// で直接開ける（ローカルファイルのモジュール読み込みはブラウザが禁止するため）。"""
import os, re
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
rd = lambda p: open(os.path.join(R, p), encoding='utf-8').read()
def strip(src):
    src = re.sub(r"^import \{[^}]*\} from '\./[a-z]+\.js';\n", '', src, flags=re.M)
    return re.sub(r'^export ', '', src, flags=re.M)
units = '\n'.join(strip(rd('js/' + f)) for f in ['units.js', 'sim.js', 'scenario.js'])
main = strip(rd('js/main.js'))
html = rd('dev.html').replace('<script type="module" src="js/main.js"></script>',
    '<!-- 生成物: tools/build.py が js/units.js と js/main.js を埋め込む。編集は js/ 側で -->\n<script type="module">\n' + units + '\n' + main + '\n</script>')
assert '<script type="module">' in html
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(html)
print('index.html', len(html))

"""第二部の指示書から音声manifestと実装参照データを準備する。"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
doc = ROOT / '指示書2.md'
text = doc.read_text(encoding='utf-8')
# 暫定番号は維持する。第一部との取り違えを避け、実装IDにP2を付ける。
clean = re.sub(r'<!--.*?-->', '', text, flags=re.S)
sections = re.findall(r'^# (C\d+[ab]?) (.*?)\n(.*?)(?=^# |\Z)', clean, re.M | re.S)
base = json.loads((ROOT / 'narration/later-cuts.json').read_text(encoding='utf-8'))
manifest = {k: base[k] for k in ('model', 'voice', 'speed', 'responseFormat', 'commonInstructions')}
manifest.update(fps=60, tailPaddingSeconds=0.65, outputDirectory='narration/part2', reportFileName='duration-report.json',
                silenceCompaction={'preserveInternalSilence': True, 'maximumLeadingSilenceMs': 20, 'maximumTrailingSilenceMs': 100})
cuts = []
cursor = 0
for old, title, body in sections:
    audio = re.split(r'-\s*音声(?:案)?\s*\n', body, maxsplit=1)[1].strip()
    lines = [s.strip() for s in audio.splitlines() if s.strip()]
    spoken = ''.join(lines)
    cut = dict(id='P2' + old, sourceCut=old, title=title, text=spoken, ttsText=spoken,
               sentences=lines, instructions='原稿の全ての文を順番に読み、省略や言い換えをしないでください。',
               startFrame=cursor, durationFrames=round(len(spoken)/7*60), minimumDurationFrames=0)
    cursor += cut['durationFrames']
    cuts.append(cut)
    if old == 'C11':
        cut['ttsText'] = spoken.replace('65535', '六万五千五百三十五')
manifest['cuts'] = cuts
dest = ROOT / 'narration/part2-cuts.json'
if dest.exists():
    prev = {c['id']: c for c in json.loads(dest.read_text(encoding='utf-8'))['cuts']}
    for c in cuts:
        p = prev.get(c['id'], {})
        if p.get('text') == c['text']:
            for k in ('measuredDurationSeconds', 'durationFrames', 'startFrame'):
                if k in p: c[k] = p[k]
dest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

src = Path('D:/HomeBrew/MonoSH')
game = (src/'src/game.c').read_text(encoding='utf-8')
path = (src/'tools/houdini/export/enemy_path_0_tables_runtime.h').read_text(encoding='utf-8')
def array(source, name):
    match = re.search(r'\b'+name+r'\[[^]]*\]\s*=\s*\{([^}]+)', source, re.S)
    return [int(v) for v in re.findall(r'-?\d+', match[1])] if match else []
data = {'scale': array(game,'bgobj_z2sc'), 'size': array(game,'bgobj_z2size'),
        'enemy': {k: array(path, 'enemy_path_0_'+k) for k in ('sx','bot','sz','wz','zb')},
        'source': 'MonoSH/src/game.c + tools/houdini/export/enemy_path_0_tables_runtime.h'}
gy = (src/'src/bgobj_gy_tables.inc').read_text(encoding='utf-8').split('_bgobj_gy_14:')[1].split('_bgobj_gy_15:')[0]
data['groundY'] = [int(v) for line in gy.splitlines() if '.byte' in line for v in re.findall(r'\d+',line.split('.byte')[1])]
(ROOT/'src/part2Data.json').write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
print(f'{len(cuts)} cuts prepared; enemy arrays: '+str({k:len(v) for k,v in data['enemy'].items()}))

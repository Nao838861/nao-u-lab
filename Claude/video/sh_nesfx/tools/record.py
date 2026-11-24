"""Replay inputs.txt from power-on in the dedicated Mesen and record frames + audio register log.
usage: python tools/record.py rec/run1/inputs.txt rec/main [--frames N] [--no-png]"""
import argparse, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from mesen_run import run

p = argparse.ArgumentParser(); p.add_argument('inputs', type=Path); p.add_argument('out', type=Path)
p.add_argument('--frames', type=int, default=0); p.add_argument('--no-png', action='store_true')
a = p.parse_args(); out = a.out.resolve(); (out / 'png').mkdir(parents=True, exist_ok=True)
n = a.frames or len(a.inputs.read_text().split())
s = Path(__file__).with_name('record.lua').read_text(encoding='utf-8')
for k, v in {'@OUTDIR@': json.dumps(out.as_posix()), '@INPUTS@': json.dumps(a.inputs.resolve().as_posix()),
             '@MAXF@': str(n), '@PNG@': 'false' if a.no_png else 'true'}.items():
    s = s.replace(k, v)
(out / 'record_run.lua').write_text(s, encoding='utf-8')
r = run(out / 'record_run.lua', 1800)
print('exit', r.returncode)

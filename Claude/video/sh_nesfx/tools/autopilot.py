"""Savestate-free search for a no-death input list. Every attempt replays the committed inputs from power-on in a
fresh Mesen process (savestates of this mapper do not restore everything, so replays from them diverge).
usage: python tools/autopilot.py rec/ap1 --frames 9000 [--params '{...}']"""
import argparse, json, random, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from mesen_run import run

DEFAULT = {'mtn': 14, 'minpix': 4, 'far_max': 60, 'aim_dy': 0, 'jit': 6, 'repick': 90, 'zone_x': 40, 'zone_y': 48, 'near_th': 40, 'red_th': 2, 'dodge': 16, 'ty_min': 60, 'ty_max': 170}
p = argparse.ArgumentParser(); p.add_argument('out', type=Path); p.add_argument('--frames', type=int, default=9000)
p.add_argument('--chunk', type=int, default=900); p.add_argument('--start-at', type=int, default=480)
p.add_argument('--params', default='{}'); p.add_argument('--seed', type=int, default=1)
a = p.parse_args(); out = a.out.resolve(); out.mkdir(parents=True, exist_ok=True)
params = {**DEFAULT, **json.loads(a.params)}
tmpl = Path(__file__).with_name('autopilot.lua').read_text(encoding='utf-8')
committed_path = out / 'inputs.txt'
committed = [int(x) for x in committed_path.read_text().split()] if committed_path.exists() else []
if not committed:
    committed = [0] * a.start_at  # the game starts at power-on; START would switch to the boss
rng = random.Random(a.seed)
log = open(out / 'autopilot.jsonl', 'a')
last_death, back, retry = -1, 60, 0
while len(committed) < a.frames:
    start = len(committed); stop = min(a.frames, start + a.chunk)
    committed_path.write_text('\n'.join(map(str, committed)) + '\n')
    s = tmpl
    for k, v in {'@OUTDIR@': json.dumps(out.as_posix()), '@INPUTS@': json.dumps(committed_path.as_posix()),
                 '@START@': str(start), '@STOP@': str(stop), '@START_AT@': str(a.start_at),
                 '@SEED@': str(rng.randrange(1 << 30)),
                 '@PARAMS@': '{' + ','.join(f'{k}={v}' for k, v in {**params, 'retry': retry}.items()) + '}'}.items():
        s = s.replace(k, v)
    (out / 'attempt.lua').write_text(s, encoding='utf-8')
    t = time.time(); r = run(out / 'attempt.lua', 900)
    lines = (out / 'attempt.txt').read_text().split()
    death = int(lines[0]); got = [int(x) for x in lines[1:]]
    if death < 0:
        committed = got[:stop]; back = 60; last_death = -1; retry = 0
    else:
        # keep the part well before the death and retry from there; back off further if it keeps dying nearby
        near = abs(death - last_death) < 240
        back = min(back + 60, 600) if near else 60
        retry = min(retry + 1, 4) if near else 0
        last_death = death
        keep = max(a.start_at, death - back)
        committed = got[:keep]  # got starts with the committed inputs, so this also handles keep < start
    log.write(json.dumps({'start': start, 'stop': stop, 'death': death, 'committed': len(committed), 'back': back,
                          'sec': round(time.time() - t, 1)}) + '\n'); log.flush()
committed_path.write_text('\n'.join(map(str, committed[:a.frames])) + '\n')
print('done', len(committed))

"""Build the gameplay mp4 for posting: record_play.py --dump output + game audio.

Audio: BGM is played (libgme via ffmpeg) from the SPC700 state saved during the run, so the music continues from
the ROM's own driver state. Sound effects are rendered from the ROM's SE SPC states (music muted) and placed at the
fields where the game queued them. In the real game an SE briefly takes over music voices G/H; this mix keeps the
music voices playing under the SE.
"""
import argparse, json, struct, subprocess, wave
from pathlib import Path
import numpy as np

FX2 = Path('D:/AI/Nao_u_BOT/GPT/projects/monosh_fx2')
RES = FX2 / 'game/v001/results/native_audio_v2_20261009'
SE = {0: 'death', 1: 'boss_explosion', 2: 'stumble', 3: 'explosion', 4: 'reflect', 5: 'shot'}
SR = 32000
FPS = 60  # encode rate; the SNES runs at 60.0988 Hz (0.16% faster), negligible for a ~1 minute clip


def snapshot_spc(run: Path, dst: Path):
    state = dict(l.split('=', 1) for l in (run / 'snap.state').read_text().splitlines())
    num = lambda n: int(float(state['spc.' + n])) if state['spc.' + n] not in ('true', 'false') else int(state['spc.' + n] == 'true')
    spc = bytearray((FX2 / 'game/v001/audio/theme.spc').read_bytes())
    struct.pack_into('<H5B', spc, 0x25, num('pc'), num('a'), num('x'), num('y'), num('ps'), num('sp'))
    data = bytearray((run / 'snap.ram').read_bytes())
    data[0xf2] = num('dspReg')
    for i in range(4):
        data[0xf4 + i] = num(f'cpuRegs[{i}]')
    spc[0x100:0x10100] = data
    spc[0x10100:0x10180] = (run / 'snap.dsp').read_bytes()
    spc[0x101c0:0x10200] = data[0xffc0:]
    dst.write_bytes(spc)
    return int(state['field'])


def render(spc: Path, seconds: float) -> np.ndarray:
    wav = spc.with_suffix('.wav')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(spc), '-t', f'{seconds:.3f}', '-ar', str(SR), '-ac', '2', str(wav)], check=True)
    with wave.open(str(wav)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float32)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--run', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    p.add_argument('--start', type=int, default=0, help='first field to show (default: first monochrome field)')
    p.add_argument('--scale', type=int, default=6)
    a = p.parse_args()
    run = a.run.resolve()
    rows = [json.loads(l) for l in (run / 'log.jsonl').read_text().splitlines()]
    start = a.start or rows[-1]['mono_at'] + 1
    end = len(rows)
    dur = (end - start + 1) / FPS
    work = run / 'audio'; work.mkdir(exist_ok=True)
    snap_field = snapshot_spc(run, work / 'bgm_snap.spc')
    mix = np.zeros((int(dur * SR) + SR, 2), np.float32)
    bgm = render(work / 'bgm_snap.spc', dur - (snap_field - start) / FPS + 0.5)
    o = int((snap_field - start) / FPS * SR)
    mix[o:o + len(bgm)] += bgm[:len(mix) - o]
    clips = {k: render_se(work, name) for k, name in SE.items()}
    count = {}
    for r in rows:
        for v in r['sfx']:
            if r['f'] < start or v not in clips:
                continue
            o = int((r['f'] - start) / FPS * SR)
            c = clips[v][:len(mix) - o]
            mix[o:o + len(c)] += c
            count[SE[v]] = count.get(SE[v], 0) + 1
    mix = mix[:int(dur * SR)]
    fade = int(1.5 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    peak = float(np.abs(mix).max())
    if peak > 32000:
        mix *= 32000 / peak
    with wave.open(str(work / 'mix.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(mix.astype('<i2').tobytes())
    fs = 256 * 239 * 3
    w, h = 256 * a.scale, 180 * a.scale
    cmd = ['ffmpeg', '-y', '-v', 'error',
           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '256x239', '-framerate', str(FPS), '-ss', f'{(start - 1) / FPS:.4f}', '-i', str(run / 'frames.rgb'),
           '-i', str(work / 'mix.wav'),
           '-vf', f'crop=256:180:0:29,scale={w}:{h}:flags=neighbor,format=yuv420p',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-g', '120',
           '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', str(a.out)]
    subprocess.run(cmd, check=True)
    print(json.dumps({'start_field': start, 'end_field': end, 'seconds': round(dur, 2), 'bgm_from_field': snap_field,
                      'se_count': count, 'audio_peak_before_limit': round(peak), 'out': str(a.out), 'size': a.out.stat().st_size}))


def render_se(work: Path, name: str) -> np.ndarray:
    x = render_from(RES / f'se_{name}.spc', work / f'se_{name}.spc', 1.2)
    return x


def render_from(src: Path, dst: Path, seconds: float) -> np.ndarray:
    dst.write_bytes(src.read_bytes())
    return render(dst, seconds)


if __name__ == '__main__':
    main()

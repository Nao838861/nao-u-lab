"""Render game audio from the register-write log recorded by tools/record.lua (apu.txt: "<cpu cycle> <addr> <value>").

Model: 2A03 pulse x2 (sweep, envelope, length), triangle (linear counter), noise (LFSR), plus MMC5 pulse x2.
The game writes no DMC/PCM samples ($4011/$5011 unused), so those are omitted.
Each channel's output is integrated over the sample interval (box filter via cumulative sums) to limit aliasing.
Output time base: one emulated frame (from frames.jsonl) = 1/60 s, so audio stays locked to the 60fps video.
usage: python tools/apu_synth.py rec/main [--rate 48000]
"""
import argparse, json, wave
from pathlib import Path
import numpy as np

CPU = 1789773.0
DUTY = [np.array(s, float) for s in ([0, 1, 0, 0, 0, 0, 0, 0], [0, 1, 1, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 0, 0, 0], [1, 0, 0, 1, 1, 1, 1, 1])]
TRI = np.array(list(range(15, -1, -1)) + list(range(16)), float)
LEN = [10, 254, 20, 2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14, 12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30]
NOISE_P = [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068]


def lfsr(short):
    r, out = 1, []
    for _ in range(32767 if not short else 93):
        out.append(0.0 if r & 1 else 1.0)
        b = (r ^ (r >> (6 if short else 1))) & 1
        r = (r >> 1) | (b << 14)
    return np.array(out)


NOISE_SEQ = [lfsr(False), lfsr(True)]


class Seq:
    """Periodic step sequence with cumulative-sum integration."""
    def __init__(self, seq):
        self.seq = seq; self.L = len(seq); self.cs = np.concatenate([[0.0], np.cumsum(seq)]); self.S = self.cs[-1]

    def integ(self, p):  # integral of seq from 0 to p (p in steps)
        n = np.floor(p / self.L); r = p - n * self.L; i = np.floor(r).astype(int); f = r - i
        return n * self.S + self.cs[i] + f * self.seq[np.minimum(i, self.L - 1)]


SEQS = {('d', k): Seq(d) for k, d in enumerate(DUTY)}
SEQS['tri'] = Seq(TRI)
SEQS[('n', 0)] = Seq(NOISE_SEQ[0]); SEQS[('n', 1)] = Seq(NOISE_SEQ[1])


class Env:
    def __init__(self): self.start = False; self.div = 0; self.decay = 0; self.loop = False; self.const = False; self.vol = 0
    def clock(self):
        if self.start:
            self.start = False; self.decay = 15; self.div = self.vol
        elif self.div == 0:
            self.div = self.vol
            if self.decay: self.decay -= 1
            elif self.loop: self.decay = 15
        else: self.div -= 1
    def out(self): return self.vol if self.const else self.decay


class Pulse:
    def __init__(self, ch1=False, mmc5=False):
        self.env = Env(); self.duty = 0; self.t = 0; self.len = 0; self.halt = False; self.en = False
        self.ch1 = ch1; self.mmc5 = mmc5; self.phase = 0.0
        self.sw_en = False; self.sw_p = 0; self.sw_neg = False; self.sw_sh = 0; self.sw_div = 0; self.sw_rel = False
    def write(self, r, v):
        if r == 0:
            self.duty = v >> 6; self.halt = self.env.loop = bool(v & 0x20); self.env.const = bool(v & 0x10); self.env.vol = v & 15
        elif r == 1:
            self.sw_en = bool(v & 0x80); self.sw_p = (v >> 4) & 7; self.sw_neg = bool(v & 8); self.sw_sh = v & 7; self.sw_rel = True
        elif r == 2: self.t = (self.t & 0x700) | v
        elif r == 3:
            self.t = (self.t & 0xFF) | ((v & 7) << 8)
            if self.en: self.len = LEN[v >> 3]
            self.env.start = True; self.phase = 0.0
    def target(self):
        c = self.t >> self.sw_sh
        return self.t - c - (1 if self.ch1 else 0) if self.sw_neg else self.t + c
    def muted(self):
        if self.len == 0 or self.t < 8: return True
        return (not self.mmc5) and self.target() > 0x7FF
    def half(self):
        if self.len and not self.halt: self.len -= 1
        if self.mmc5: return
        if self.sw_div == 0 and self.sw_en and self.sw_sh and not self.muted(): self.t = max(0, self.target())
        if self.sw_div == 0 or self.sw_rel: self.sw_div = self.sw_p; self.sw_rel = False
        else: self.sw_div -= 1
    def render(self, n_cycles_edges):
        """n_cycles_edges: cycle offsets (from segment start) at sample boundaries -> mean output per sample"""
        if self.muted(): return np.zeros(len(n_cycles_edges) - 1), 0.0
        step = 1.0 / (2 * (self.t + 1))  # duty steps per CPU cycle
        p = self.phase + n_cycles_edges * step
        s = SEQS[('d', self.duty)]
        I = s.integ(p); avg = np.diff(I) / np.maximum(np.diff(p), 1e-12)
        return avg * self.env.out(), p[-1]


class Triangle:
    def __init__(self): self.t = 0; self.len = 0; self.lin = 0; self.lin_load = 0; self.ctrl = False; self.reload = False; self.en = False; self.phase = 0.0
    def write(self, r, v):
        if r == 0: self.ctrl = bool(v & 0x80); self.lin_load = v & 0x7F
        elif r == 2: self.t = (self.t & 0x700) | v
        elif r == 3:
            self.t = (self.t & 0xFF) | ((v & 7) << 8)
            if self.en: self.len = LEN[v >> 3]
            self.reload = True
    def quarter(self):
        if self.reload: self.lin = self.lin_load
        elif self.lin: self.lin -= 1
        if not self.ctrl: self.reload = False
    def half(self):
        if self.len and not self.ctrl: self.len -= 1
    def render(self, e):
        step = 1.0 / (self.t + 1)
        if self.len == 0 or self.lin == 0 or self.t < 2:
            # sequencer halts: output holds its current value
            v = TRI[int(self.phase) % 32]
            return np.full(len(e) - 1, v), self.phase
        p = self.phase + e * step
        I = SEQS['tri'].integ(p); return np.diff(I) / np.maximum(np.diff(p), 1e-12), p[-1]


class Noise:
    def __init__(self): self.env = Env(); self.mode = 0; self.per = 4; self.len = 0; self.halt = False; self.en = False; self.phase = 0.0
    def write(self, r, v):
        if r == 0: self.halt = self.env.loop = bool(v & 0x20); self.env.const = bool(v & 0x10); self.env.vol = v & 15
        elif r == 2: self.mode = v >> 7; self.per = NOISE_P[v & 15]
        elif r == 3:
            if self.en: self.len = LEN[v >> 3]
            self.env.start = True
    def half(self):
        if self.len and not self.halt: self.len -= 1
    def render(self, e):
        p = self.phase + e / self.per
        if self.len == 0: return np.zeros(len(e) - 1), p[-1]
        I = SEQS[('n', self.mode)].integ(p); return np.diff(I) / np.maximum(np.diff(p), 1e-12) * self.env.out(), p[-1]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('rec', type=Path); ap.add_argument('--rate', type=int, default=48000)
    ap.add_argument('--out', type=Path)
    a = ap.parse_args()
    ev = []
    for l in (a.rec / 'apu.txt').read_text().splitlines():
        if l.startswith('#'): continue
        c, ad, v = l.split(); ev.append((int(c), int(ad, 16), int(v, 16)))
    fr = [json.loads(l) for l in (a.rec / 'frames.jsonl').read_text().splitlines()]
    fc = np.array([f['c'] for f in fr], float)  # cycle at end of each frame
    t0 = fc[0] - (fc[1] - fc[0])
    # sample boundaries in video time -> CPU cycle (piecewise linear through frame ends; 1 frame = 1/60 s)
    nfr = len(fc); n = int(nfr / 60 * a.rate)
    vt = np.arange(n + 1) / a.rate * 60  # in frames
    knots = np.concatenate([[t0], fc])
    cyc = np.interp(vt, np.arange(nfr + 1), knots)

    p1, p2, tri, noi = Pulse(ch1=True), Pulse(), Triangle(), Noise()
    m1, m2 = Pulse(mmc5=True), Pulse(mmc5=True)
    apu = [p1, p2, tri, noi]
    out = {k: np.zeros(n) for k in ('p1', 'p2', 'tri', 'noi', 'm1', 'm2')}
    chans = {'p1': p1, 'p2': p2, 'tri': tri, 'noi': noi, 'm1': m1, 'm2': m2}
    # frame sequencer (4-step) and MMC5's own 240Hz clock
    QF = [7457, 14913, 22371, 29829]
    fs_start, fs_mode = 0.0, 0
    mmc_q = 7457.5
    ei = 0

    def apply(ad, v):
        nonlocal fs_start, fs_mode
        if 0x4000 <= ad <= 0x400F:
            ch = apu[(ad - 0x4000) // 4]; ch.write((ad - 0x4000) % 4, v)
        elif ad == 0x4015:
            for i, ch in enumerate(apu):
                ch.en = bool(v & (1 << i))
                if not ch.en: ch.len = 0
        elif 0x5000 <= ad <= 0x5007:
            ch = (m1, m2)[(ad - 0x5000) // 4]; r = (ad - 0x5000) % 4
            if r != 1: ch.write(r, v)
        elif ad == 0x5015:
            for i, ch in enumerate((m1, m2)):
                ch.en = bool(v & (1 << i))
                if not ch.en: ch.len = 0

    # event list: register writes and sequencer clocks, processed in time order; render between events
    end_c = cyc[-1]
    clocks = []
    def seq_events(start, mode):
        res, base = [], start
        steps = QF if mode == 0 else [7457, 14913, 22371, 37281]
        while base < end_c:
            for i, s in enumerate(steps):
                half = (i in (1, 3))
                res.append((base + s, 'apu', half))
            base += steps[-1] + (1 if mode == 0 else 1)
        return res
    clocks = seq_events(0, 0)
    k = 1
    while k * mmc_q < end_c: clocks.append((k * mmc_q, 'mmc', True)); k += 1
    events = [(c, 0, ('w', ad, v)) for c, ad, v in ev] + [(c, 1, ('q', kind, half)) for c, kind, half in clocks]
    events.sort(key=lambda e: (e[0], e[1]))
    cur = cyc[0]; si = 0
    for c, _, e in events:
        if c > cur:
            # render samples whose interval lies in [cur, c)
            sj = np.searchsorted(cyc, min(c, end_c), side='right') - 1
            if sj > si:
                edges = cyc[si:sj + 1] - cur
                for name, ch in chans.items():
                    vals, ph = ch.render(edges)
                    out[name][si:sj] = vals
                    ch.phase = ph if ch.__class__ is not Triangle or (ch.len and ch.lin and ch.t >= 2) else ch.phase
                # advance phase over the leftover partial interval up to c
                rem = c - cyc[sj]
                for ch in chans.values():
                    adv_ok = not (isinstance(ch, Triangle) and not (ch.len and ch.lin and ch.t >= 2))
                    if adv_ok:
                        step = 1.0 / ch.per if isinstance(ch, Noise) else 1.0 / (ch.t + 1) if isinstance(ch, Triangle) else 1.0 / (2 * (ch.t + 1))
                        ch.phase += rem * step
                si = sj
            else:
                for ch in chans.values():
                    adv_ok = not (isinstance(ch, Triangle) and not (ch.len and ch.lin and ch.t >= 2))
                    if adv_ok:
                        step = 1.0 / ch.per if isinstance(ch, Noise) else 1.0 / (ch.t + 1) if isinstance(ch, Triangle) else 1.0 / (2 * (ch.t + 1))
                        ch.phase += (c - cur) * step
            cur = c
        if c >= end_c: break
        if e[0] == 'w':
            if e[1] == 0x4017:
                pass  # 4-step mode assumed (game writes $40 = IRQ inhibit)
            apply(e[1], e[2])
        else:
            _, kind, half = e
            if kind == 'apu':
                p1.env.clock(); p2.env.clock(); noi.env.clock(); tri.quarter()
                if half: p1.half(); p2.half(); tri.half(); noi.half()
            else:
                m1.env.clock(); m2.env.clock(); m1.half(); m2.half()
    for o in out.values(): o[si:] = o[si:]  # tail stays zero
    pul = out['p1'] + out['p2']
    pulse_mix = np.where(pul > 0, 95.88 / (8128.0 / np.maximum(pul, 1e-9) + 100), 0.0)
    mp = out['m1'] + out['m2']
    mmc_mix = np.where(mp > 0, 95.88 / (8128.0 / np.maximum(mp, 1e-9) + 100), 0.0)
    tn = out['tri'] / 8227 + out['noi'] / 12241
    tnd = np.where(tn > 0, 159.79 / (1 / np.maximum(tn, 1e-9) + 100), 0.0)
    mix = pulse_mix + tnd + mmc_mix
    # first-order high-pass (~37Hz) like the console's output stage
    alpha = np.exp(-2 * np.pi * 37 / a.rate)
    y = np.empty_like(mix); prev_x = mix[0]; prev_y = 0.0
    # vectorized IIR via scipy-free loop in chunks
    from itertools import islice
    xd = np.diff(np.concatenate([[mix[0]], mix]))
    for i in range(len(mix)):
        prev_y = alpha * (prev_y + xd[i]); y[i] = prev_y
    y = y / max(1e-9, np.max(np.abs(y))) * 0.8
    pcm = (y * 32767).astype('<i2')
    dst = a.out or (a.rec / 'game_audio.wav')
    with wave.open(str(dst), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(a.rate); w.writeframes(pcm.tobytes())
    print('wrote', dst, f'{n / a.rate:.2f}s', 'peak scale', float(np.max(np.abs(mix))))


if __name__ == '__main__':
    main()

"""Mesen で記録した音源レジスターの書き込み (rec/audio/apu_writes.csv) から、チャンネルごとの音を再合成する。

対象: APU 矩形波1/2・三角波・ノイズ、MMC5 矩形波1/2。DPCM と MMC5 PCM は走行中に書き込みがないので扱わない。
エンベロープ・長さカウンター・スイープは 240Hz のフレームカウンターで近似する（説明用の再合成で、実機出力のサンプル一致ではない）。
出力: public/audio/ch_<name>.wav（各チャンネル単体）、ch_mix.wav（5ch の合計）
"""
from pathlib import Path
import csv
import wave
import numpy as np

R = Path(__file__).resolve().parents[1]
CPU = 1789773.0
SR = 48000
QUARTER = 7457  # CPU cycles per quarter frame (NTSC, 4-step)
DUTY = [np.array(d, float) for d in ([0, 1, 0, 0, 0, 0, 0, 0], [0, 1, 1, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 0, 0, 0], [1, 0, 0, 1, 1, 1, 1, 1])]
LEN = [10, 254, 20, 2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14, 12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30]
NOISE = [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068]
TRI = np.array(list(range(15, -1, -1)) + list(range(0, 16)), float)


class Env:
    def __init__(self):
        self.const = True; self.vol = 0; self.loop = False; self.start = False; self.div = 0; self.decay = 0

    def clock(self):
        if self.start:
            self.start = False; self.decay = 15; self.div = self.vol
        elif self.div == 0:
            self.div = self.vol
            if self.decay: self.decay -= 1
            elif self.loop: self.decay = 15
        else:
            self.div -= 1

    def level(self):
        return self.vol if self.const else self.decay


class Pulse:
    def __init__(self, sweep=True):
        self.env = Env(); self.duty = 0; self.timer = 0; self.length = 0; self.enabled = False; self.phase = 0.0
        self.sweep = sweep; self.sw_en = False; self.sw_period = 0; self.sw_neg = False; self.sw_shift = 0; self.sw_div = 0; self.sw_reload = False

    def write(self, reg, v):
        if reg == 0:
            self.duty = v >> 6; self.env.loop = bool(v & 0x20); self.env.const = bool(v & 0x10); self.env.vol = v & 15
        elif reg == 1 and self.sweep:
            self.sw_en = bool(v & 0x80); self.sw_period = (v >> 4) & 7; self.sw_neg = bool(v & 8); self.sw_shift = v & 7; self.sw_reload = True
        elif reg == 2:
            self.timer = (self.timer & 0x700) | v
        elif reg == 3:
            self.timer = (self.timer & 0xff) | ((v & 7) << 8)
            if self.enabled: self.length = LEN[v >> 3]
            self.env.start = True; self.phase = 0.0

    def half(self):
        if self.length and not self.env.loop: self.length -= 1
        if self.sweep and self.sw_en and self.sw_shift and self.sw_div == 0 and self.timer >= 8:
            d = self.timer >> self.sw_shift
            t = self.timer - d if self.sw_neg else self.timer + d
            if t <= 0x7ff: self.timer = t
        if self.sw_div == 0 or self.sw_reload:
            self.sw_div = self.sw_period; self.sw_reload = False
        else:
            self.sw_div -= 1

    def render(self, n):
        if not self.enabled or self.length == 0 or self.timer < 8:
            return np.zeros(n)
        f = CPU / (16 * (self.timer + 1))
        ph = self.phase + np.arange(n) * f / SR
        self.phase = (self.phase + n * f / SR) % 1.0
        return DUTY[self.duty][(np.floor(ph * 8) % 8).astype(int)] * self.env.level()


class Triangle:
    def __init__(self):
        self.timer = 0; self.length = 0; self.enabled = False; self.phase = 0.0; self.linear = 0; self.lin_reload = 0; self.control = False; self.reload = False

    def write(self, reg, v):
        if reg == 0: self.control = bool(v & 0x80); self.lin_reload = v & 0x7f
        elif reg == 2: self.timer = (self.timer & 0x700) | v
        elif reg == 3:
            self.timer = (self.timer & 0xff) | ((v & 7) << 8)
            if self.enabled: self.length = LEN[v >> 3]
            self.reload = True

    def quarter(self):
        if self.reload: self.linear = self.lin_reload
        elif self.linear: self.linear -= 1
        if not self.control: self.reload = False

    def half(self):
        if self.length and not self.control: self.length -= 1

    def render(self, n):
        if not self.enabled or self.length == 0 or self.linear == 0 or self.timer < 2:
            return np.zeros(n)
        f = CPU / (32 * (self.timer + 1))
        ph = self.phase + np.arange(n) * f / SR
        self.phase = (self.phase + n * f / SR) % 1.0
        return TRI[(np.floor(ph * 32) % 32).astype(int)]


class Noise:
    def __init__(self):
        self.env = Env(); self.mode = 0; self.period = 4; self.length = 0; self.enabled = False; self.lfsr = 1; self.acc = 0.0

    def write(self, reg, v):
        if reg == 0: self.env.loop = bool(v & 0x20); self.env.const = bool(v & 0x10); self.env.vol = v & 15
        elif reg == 2: self.mode = v >> 7; self.period = NOISE[v & 15]
        elif reg == 3:
            if self.enabled: self.length = LEN[v >> 3]
            self.env.start = True

    def half(self):
        if self.length and not self.env.loop: self.length -= 1

    def render(self, n):
        out = np.zeros(n)
        if not self.enabled or self.length == 0:
            return out
        step = CPU / SR / self.period
        lvl = self.env.level(); tap = 6 if self.mode else 1
        for i in range(n):
            self.acc += step
            while self.acc >= 1:
                self.acc -= 1
                fb = (self.lfsr ^ (self.lfsr >> tap)) & 1
                self.lfsr = (self.lfsr >> 1) | (fb << 14)
            out[i] = 0 if self.lfsr & 1 else lvl
        return out


def main():
    rows = [r for r in csv.DictReader(l for l in open(R / 'rec/audio/apu_writes.csv') if not l.startswith('#'))]
    ev = sorted((int(r['cycle']), int(r['addr']), int(r['value'])) for r in rows)
    ch = {'apu_pulse1': Pulse(), 'apu_pulse2': Pulse(), 'triangle': Triangle(), 'noise': Noise(), 'mmc5_pulse1': Pulse(False), 'mmc5_pulse2': Pulse(False)}
    start, end = ev[0][0], ev[-1][0]
    total = int((end - start) / CPU * SR) + SR
    bufs = {k: np.zeros(total) for k in ch}
    ei, cyc, pos, q = 0, start, 0, 0
    while cyc < end:
        nxt = cyc + QUARTER
        while ei < len(ev) and ev[ei][0] < nxt:
            _, a, v = ev[ei]; ei += 1
            if 0x4000 <= a <= 0x4003: ch['apu_pulse1'].write(a - 0x4000, v)
            elif 0x4004 <= a <= 0x4007: ch['apu_pulse2'].write(a - 0x4004, v)
            elif 0x4008 <= a <= 0x400b: ch['triangle'].write(a - 0x4008, v)
            elif 0x400c <= a <= 0x400f: ch['noise'].write(a - 0x400c, v)
            elif a == 0x4015:
                for b, k in enumerate(('apu_pulse1', 'apu_pulse2', 'triangle', 'noise')):
                    ch[k].enabled = bool(v >> b & 1)
                    if not ch[k].enabled: ch[k].length = 0
            elif 0x5000 <= a <= 0x5003: ch['mmc5_pulse1'].write(a - 0x5000, v)
            elif 0x5004 <= a <= 0x5007: ch['mmc5_pulse2'].write(a - 0x5004, v)
            elif a == 0x5015:
                for b, k in enumerate(('mmc5_pulse1', 'mmc5_pulse2')):
                    ch[k].enabled = bool(v >> b & 1)
                    if not ch[k].enabled: ch[k].length = 0
        # MMC5 の矩形波は長さカウンターを持つが、エンジン音は再生中ずっと鳴るので長さによる停止は扱わない
        for k in ('mmc5_pulse1', 'mmc5_pulse2'):
            if ch[k].enabled and ch[k].length == 0: ch[k].length = 1
        for k in ('apu_pulse1', 'apu_pulse2', 'noise', 'mmc5_pulse1', 'mmc5_pulse2'): ch[k].env.clock()
        ch['triangle'].quarter()
        if q % 2 == 1:
            for k in ('apu_pulse1', 'apu_pulse2', 'noise', 'mmc5_pulse1', 'mmc5_pulse2', 'triangle'): ch[k].half()
        n = int((nxt - start) / CPU * SR) - pos
        for k, c in ch.items(): bufs[k][pos:pos + n] = c.render(n)
        pos += n; cyc = nxt; q += 1
    out = R / 'public' / 'audio'; out.mkdir(parents=True, exist_ok=True)
    gain = {'apu_pulse1': 1, 'apu_pulse2': 1, 'triangle': 1, 'noise': 0.8, 'mmc5_pulse1': 1, 'mmc5_pulse2': 1}
    mix = np.zeros(total)

    def save(name, x):
        x = x - x.mean() if len(x) else x
        peak = np.abs(x).max() or 1
        data = (x / peak * 0.7 * 32767).astype('<i2')
        with wave.open(str(out / f'ch_{name}.wav'), 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())

    for k, b in bufs.items():
        if np.abs(b).max() > 0: save(k, b)
        mix += b * gain[k]
        print(k, 'active samples', int((b != 0).sum()))
    save('mix', mix)
    # 説明用に、各チャンネルの毎フレームの周波数・音量も出す
    print('seconds', total / SR)


if __name__ == '__main__':
    main()

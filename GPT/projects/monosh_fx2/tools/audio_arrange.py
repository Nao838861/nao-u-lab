"""公開採譜MIDIから、パートの役割ごとに8声へ割り振ったTAD用MMLを作る。

採譜の各トラックは原作のパートに対応する（録画と拍単位で照合済み）:
  ch0 主旋律（前半は和音） / ch4 主旋律の1オクターブ下のブラス / ch2・ch3 刻みの和音 /
  ch1 オクターブで跳ねるベース / ch5 後半のパッド / ch9 ドラム（キック2種・スネア・タム4種・ハット・クラッシュ）
声の割り振り（効果音はTADの仕様で G・H を一時的に借りる。どちらも消えても曲の骨格が残るパート）:
  A 主旋律（ch0 の最高音） / B ch4、ch4が休みの和音では ch0 の2番目 / C ch2 / D ch3 / E ベース /
  F キック・タム / G スネア・クラッシュ・ハット / H ch5、ch5が休みの和音では ch0 の3番目
同じ音高の連打は1音ずつ発音し（まとめない）、採譜の音の長さ（ゲート）を保つ。
"""
from collections import defaultdict

TPB = 48                     # TAD: ZenLen 192 → 四分音符48tick
NAMES = ['c', 'c+', 'd', 'd+', 'e', 'f', 'f+', 'g', 'g+', 'a', 'a+', 'b']


def midi_notes(path):
    import mido
    midi = mido.MidiFile(path, clip=True)
    tracks = []
    for track in midi.tracks:
        tick = 0; active = {}; notes = []
        for msg in track:
            tick += msg.time
            now = round(tick * TPB / midi.ticks_per_beat)
            if msg.type == 'note_on' and msg.velocity:
                active[msg.note] = now
            elif msg.type == 'note_off' or (msg.type == 'note_on' and not msg.velocity):
                if msg.note in active:
                    begin = active.pop(msg.note)
                    notes.append((begin, max(begin + 1, now), msg.note))
        tracks.append(sorted(notes))
    return tracks


def sounding(notes, at):
    return sorted(n for a, b, n in notes if a <= at < b)


def monophonic(events):
    """開始順に並べ、次の音が始まったら前の音を切る。"""
    events = sorted(events)
    out = []
    for begin, end, note in events:
        if out and out[-1][0] == begin:
            continue                                   # 同時に始まる音は先に選んだ方を残す
        if out and out[-1][1] > begin:
            out[-1] = (out[-1][0], begin, out[-1][2])
        out.append((begin, end, note))
    return [e for e in out if e[1] > e[0]]


def lanes(tracks, end):
    t0, bass, t2, t3, t4, t5, drums = (tracks + [[]] * 7)[:7]
    clip = lambda notes: [(a, min(b, end), n) for a, b, n in notes if a < end]
    t0, bass, t2, t3, t4, t5 = map(clip, (t0, bass, t2, t3, t4, t5))
    a, b, h = [], list(t4), list(t5)
    for begin, finish, note in t0:
        chord = sounding(t0, begin)
        rank = len(chord) - 1 - chord.index(note)       # 0=最高音
        if rank == 0:
            a.append((begin, finish, note))
        elif rank == 1 and not sounding(t4, begin):
            b.append((begin, finish, note))
        elif rank == 2 and not sounding(t5, begin):
            h.append((begin, finish, note))
    return {'A': monophonic(a), 'B': monophonic(b), 'C': monophonic(t2), 'D': monophonic(t3),
            'E': legato(monophonic(bass)), 'H': monophonic(h)}


def legato(events, gap=TPB):
    """ベース: 原作は低いオクターブが次の音まで鳴り続ける。次の音まで（1拍以内の隙間なら）伸ばす。"""
    out = []
    for i, (begin, end, note) in enumerate(events):
        nxt = events[i + 1][0] if i + 1 < len(events) else end
        out.append((begin, nxt if nxt - end <= gap else end, note))
    return out


def duration_tokens(token, duration):
    out = []
    while duration:
        n = min(192, duration)
        duration -= n
        out.append(f'{token}%{n}' + (' &' if duration and token != 'r' else ''))
    return ' '.join(out)


def note_token(note):
    return f'o{note // 12 - 1}{NAMES[note % 12]}'


def lane_tokens(events, end, high=None):
    """high=(境界の音, 低い側の楽器, 高い側の楽器) なら、音域で楽器を切り替える（高音の折り返し対策）。"""
    tokens = []; cursor = 0; current = high[1] if high else None
    for begin, finish, note in events:
        if begin > cursor:
            tokens.append(duration_tokens('r', begin - cursor))
        if high:
            want = high[2] if note > high[0] else high[1]
            if want != current:
                tokens.append('@' + want); current = want
        tokens.append(duration_tokens(note_token(note), finish - begin))
        cursor = finish
    if cursor < end:
        tokens.append(duration_tokens('r', end - cursor))
    return tokens


# ドラム: MIDIの音番号 → (声, 楽器, サンプルレートの番号, 発音の長さtick, 同時打音での優先度)
DRUM_MAP = {
    35: ('F', 'kick', 0, 14, 2), 36: ('F', 'kick2', 0, 12, 2),
    41: ('F', 'tom', 0, 20, 3), 43: ('F', 'tom', 1, 20, 3), 45: ('F', 'tom', 2, 20, 3), 47: ('F', 'tom', 3, 20, 3),
    38: ('G', 'snare', 0, 12, 3), 40: ('G', 'snare', 0, 12, 3), 49: ('G', 'crash', 0, 36, 4), 57: ('G', 'crash', 0, 36, 4),
    46: ('G', 'ohat', 0, 10, 2), 42: ('G', 'hat', 0, 4, 1), 44: ('G', 'hat', 0, 4, 1),
}


def drum_lanes(drums, end):
    hits = defaultdict(dict)
    for begin, _, note in drums:
        if begin >= end or note not in DRUM_MAP:
            continue
        voice, inst, rate, length, prio = DRUM_MAP[note]
        current = hits[voice].get(begin)
        if current is None or prio > current[3]:
            hits[voice][begin] = (inst, rate, length, prio)
    return {voice: sorted(v.items()) for voice, v in hits.items()}


def drum_bar_patterns(events, end, prefix):
    """1小節（192tick）ごとの並びを共通サブルーチンへまとめる。"""
    patterns = {}; calls = []; subs = []
    for bar in range(0, end, 192):
        selected = [(t - bar, ev) for t, ev in events if bar <= t < bar + 192]
        tokens = []; cursor = 0
        for i, (begin, (inst, rate, length, _)) in enumerate(selected):
            if begin > cursor:
                tokens.append(duration_tokens('r', begin - cursor))
            nxt = selected[i + 1][0] if i + 1 < len(selected) else 192
            dur = min(nxt - begin, length)
            tokens.append(f'@{inst} s{rate},%{dur}')
            if nxt - begin > dur:
                tokens.append(duration_tokens('r', nxt - begin - dur))
            cursor = nxt
        if cursor < 192:
            tokens.append(duration_tokens('r', 192 - cursor))
        pattern = ' '.join(tokens)
        if pattern not in patterns:
            name = f'{prefix}{len(patterns)}'
            patterns[pattern] = name
            subs.append(f'!{name} {pattern}')
        calls.append('!' + patterns[pattern])
    return subs, calls


# 声ごとの楽器・音量・定位。原作サントラの主旋律にビブラートはない（±8セント以内）
VOICES = {
    'A': dict(inst='lead', volume=96, pan=64, extra='', high=(84, 'lead', 'lead_hi')),
    'B': dict(inst='brass', volume=68, pan=56, extra=''),
    'C': dict(inst='square', volume=62, pan=46, extra=''),
    'D': dict(inst='saw', volume=58, pan=82, extra=''),
    'E': dict(inst='bass', volume=176, pan=64, extra=''),
    'H': dict(inst='pad', volume=72, pan=74, extra=''),
}
DRUM_VOLUME = {'F': (196, 64), 'G': (176, 60)}


def song(tracks, beats=640, tempo=154, title='Space Harrier - native SFC arrangement v2'):
    end = beats * TPB
    lines = ['; 音符参照: JK150 / SixtyTunes (VGMusic)。パートの役割ごとに8声へ割り振ったSFC編曲。',
             f'#Title {title}', '#Composer Hiroshi Kawaguchi',
             '#ZenLen 192', f'#Tempo {tempo}', '#MainVolume 96', '#EchoLength 0']
    insts = sorted({v['inst'] for v in VOICES.values()} | {v['high'][2] for v in VOICES.values() if v.get('high')}
                   | {m[1] for m in DRUM_MAP.values()})
    lines += [f'@{name} {name}' for name in insts]
    for voice, events in sorted(lanes(tracks, end).items()):
        spec = VOICES[voice]
        lines.append(f'{voice} @{spec["inst"]} V{spec["volume"]} p{spec["pan"]} {spec["extra"]} L'.replace('  ', ' '))
        tokens = lane_tokens(events, end, spec.get('high'))
        if spec.get('high'):
            tokens.append('@' + spec['high'][1])            # ループ先頭と同じ楽器で終える
        for i in range(0, len(tokens), 16):
            lines.append(voice + ' ' + ' '.join(tokens[i:i + 16]))
    for voice, events in sorted(drum_lanes(tracks[6], end).items()):
        subs, calls = drum_bar_patterns(events, end, f'drum{voice}')
        lines += subs
        volume, pan = DRUM_VOLUME[voice]
        lines.append(f'{voice} V{volume} p{pan} L')
        for i in range(0, len(calls), 16):
            lines.append(voice + ' ' + ' '.join(calls[i:i + 16]))
    return '\n'.join(lines) + '\n'


# TAD のサンプル定義（tools/audio_instruments の周期・レートに合わせる）
# 主旋律の減衰は原作サントラの伸ばした音（0.3秒で-7dB、0.9秒で-21dB）にSNESのADSRを合わせた（誤差0.7dB）
ENVELOPES = {
    'lead': 'adsr 15 1 5 16', 'lead_hi': 'adsr 15 1 5 16', 'brass': 'adsr 13 1 5 16', 'bass': 'adsr 15 4 5 11', 'pad': 'adsr 10 2 6 6',
    # 刻みの和音は原作では矩形波（SSG）で、鳴っている間は音量が一定
    'square': 'adsr 15 7 7 0', 'saw': 'adsr 15 7 6 2',
}
OCTAVES = {'lead': (2, 6), 'lead_hi': (5, 6), 'brass': (2, 6), 'bass': (0, 3), 'pad': (3, 6), 'square': (2, 6), 'saw': (2, 6)}
# 原作のタム回しの音程（録画で 約65Hz・85Hz・110Hz・147Hz）。サンプルは16000Hzで120Hz
TOM_RATES = [8700, 11300, 14700, 19600]


def brr_samples(info):
    entries = []
    for name, spec in info.items():
        if 'period' in spec:
            low, high = OCTAVES[name]
            entries.append({'name': name, 'source': {'type': 'wav', 'source': f'samples/{name}.wav',
                'evaluator': 'default', 'loop_point': spec['loop'], 'loop_filter': 'reset_filter'},
                'ignore_gaussian_overflow': False,
                'pitches': {'type': 'octave', 'frequency': 32000 / spec['period'], 'first_octave': low,
                            'last_octave': high}, 'envelope': ENVELOPES[name]})
        else:
            rates = TOM_RATES if name == 'tom' else [spec['rate']]
            entries.append({'name': name, 'source': {'type': 'wav', 'source': f'samples/{name}.wav',
                'evaluator': 'default'}, 'ignore_gaussian_overflow': False,
                'pitches': {'type': 'samples', 'sample_rates': rates}, 'envelope': 'gain F127'})
    return entries

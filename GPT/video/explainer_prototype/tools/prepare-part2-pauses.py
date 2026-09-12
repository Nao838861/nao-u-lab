"""未加工音声の単語時刻と原稿の句読点から、保護する無音区間を選ぶ。

既存のPCM無音補正器と同じ候補列を使う。句読点の間は元の長さ、
それ以外の文中無音は110ms上限。原稿やWAVが変わったら再実行する。
"""
import difflib
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'narration/part2-cuts.json'
manifest = json.loads(DEST.read_text(encoding='utf-8'))
audio_dir = ROOT / 'public' / manifest['outputDirectory']

js = """
import {readFile} from 'node:fs/promises';
import {analyzePcmWavSilence} from './tools/compact-narration-silence.mjs';
const m=JSON.parse(await readFile('narration/part2-cuts.json','utf8'));
const result={};
for(const c of m.cuts){
 const wav=await readFile('public/'+m.outputDirectory+'/raw/'+c.id+'.wav');
 const a=analyzePcmWavSilence(wav,{windowMs:5,thresholdDb:-44});
 result[c.id]={duration:a.durationSeconds,spans:a.spans.filter(s=>s.durationMs>=60)};
}
console.log(JSON.stringify(result));
"""
proc = subprocess.run(['node', '--input-type=module'], input=js, text=True,
                      encoding='utf-8', cwd=ROOT, capture_output=True, check=True)
analyses = json.loads(proc.stdout)

def norm(text):
    return re.sub(r'[^\wぁ-んァ-ン一-龯]', '', text.lower())

report = {}
for cut in manifest['cuts']:
    cid = cut['id']
    raw_hash = hashlib.sha256((audio_dir/'raw'/f'{cid}.wav').read_bytes()).hexdigest()
    tr = json.loads((audio_dir/'raw/transcripts'/f'{cid}.json').read_text(encoding='utf-8'))
    assert tr['audioHash'] == raw_hash and tr['sourceText'] == cut['ttsText'], (cid, 'stale raw transcript')
    source = norm(cut['ttsText'])
    spoken = ''
    times = []
    for word in tr['words']:
        chars = norm(word['word'])
        spoken += chars
        times.extend([(word['start'], word['end'])] * len(chars))
    matcher = difflib.SequenceMatcher(None, source, spoken, autojunk=False)
    assert matcher.ratio() >= .82, (cid, '原稿照合を先に確認する', matcher.ratio())
    mapping = {}
    for a, b, size in matcher.get_matching_blocks():
        for i in range(size):
            mapping[a+i] = times[b+i]
    spans = analyses[cid]['spans']
    targets = {}
    boundaries = []
    pos = 0
    for char in cut['ttsText']:
        if char in '、。！？':
            if pos == 0 or pos == len(source):
                continue
            left = next((mapping[p][1] for p in range(pos-1, max(-1,pos-9), -1) if p in mapping), None)
            right = next((mapping[p][0] for p in range(pos, min(len(source),pos+8)) if p in mapping), None)
            assert left is not None and right is not None, (cid, 'unmapped punctuation',pos)
            lo, hi = sorted((left, right))
            # ASRは無音端を厳密には返さないため、前後0.25秒まで候補を許す。
            candidates = [(i,s) for i,s in enumerate(spans)
                          if s['startFrame'] != 0 and s['endSeconds'] < analyses[cid]['duration']-.001
                          and s['endSeconds'] >= lo-.25 and s['startSeconds'] <= hi+.25]
            if candidates:
                i, span = min(candidates, key=lambda v: abs((v[1]['startSeconds']+v[1]['endSeconds'])/2-(lo+hi)/2))
                targets[str(i)] = span['durationMs']
                boundaries.append({'punctuation':char,'position':pos,'candidate':i,'start':span['startSeconds'],'end':span['endSeconds']})
            else:
                # 元々間がない句読点に人工的な無音は足さない。
                boundaries.append({'punctuation':char,'position':pos,'candidate':None,'timeRange':[lo,hi]})
        pos += len(norm(char))
    cut['silenceCompaction'] = {
        'windowMs':5, 'thresholdDb':-44, 'minimumSilenceMs':60,
        'preserveInternalSilence':False, 'maximumInternalSilenceMs':110,
        'sentenceSilenceThresholdMs':9999,
        'maximumLeadingSilenceMs':20, 'maximumTrailingSilenceMs':80,
        'pauseTargetMsByCandidateIndex':targets,
    }
    report[cid] = {'rawHash':raw_hash, 'similarity':round(matcher.ratio(),3),
                   'punctuation':boundaries, 'spans':spans}
DEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
(audio_dir/'pause-map.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print({c:len({b['candidate'] for b in v['punctuation'] if b['candidate'] is not None}) for c,v in report.items()})

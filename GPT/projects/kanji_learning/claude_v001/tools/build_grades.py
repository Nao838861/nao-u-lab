"""小1〜小6の学年別データ（web/grades/g1.json〜g6.json）を作る。

使い方:
  python tools/build_grades.py <データフォルダ>

データフォルダに置くもの（取得元は README.md）:
  kanjivg.xml                    KanjiVG（筆画と部品の階層）
  kanjidic2-en-*.json            KANJIDIC2（学年・読み）     ※jmdict-simplified 版
  jmdict-eng-common-*.json       JMdict の常用語
  JmdictFurigana.txt             語ごとのふりがな割り当て

部品への分け方・名前はミチムラ式の公開資料から読み取った規則による推定（design_log.md）。
- 唱える順は書き順（KanjiVG の筆順で、その部品の最初の画の順）。
- へん・かんむり等は部首名（位置で名前が変わる：木→左なら きへん）。
- 小学校で習う漢字の部品は読みで呼ぶ（訓を優先、例外は ON_NAME）。
- 習う漢字でも、成り立ちどおり名前の付く部品だけで割り切れるものは分ける（働＝亻・重・力。重は 千 が 里 をはさむので分けない）。
- 小学校で習わない字・名前のない形は、さらに分けるか、画（たて・よこ・ノ…）で呼ぶ。
"""
import glob
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

DATA = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'web', 'grades')

# ---- 部首名（要素, 位置）。位置 None はどこでも。公開資料の例：さんずい・つちへん・うしへん・ゆみへん・ほうへん・
# かいへん・日（にち）へん・のぶん・れんが・しんにょう・ふるとり・おおざと・こざとへん・おいかんむり・しょうかんむり。
RADICAL = {
    ('亻', None): 'にんべん', ('氵', None): 'さんずい', ('扌', None): 'てへん', ('忄', None): 'りっしんべん',
    ('犭', None): 'けものへん', ('礻', None): 'しめすへん', ('衤', None): 'ころもへん', ('糹', None): 'いとへん',
    ('纟', None): 'いとへん', ('訁', None): 'ごんべん', ('釒', None): 'かねへん', ('飠', None): 'しょくへん',
    ('冫', None): 'にすい', ('彳', None): 'ぎょうにんべん', ('阝', 'left'): 'こざとへん', ('阝', 'right'): 'おおざと',
    ('阝', None): 'おおざと',
    ('木', 'left'): 'きへん', ('火', 'left'): 'ひへん', ('日', 'left'): 'にちへん', ('月', 'left'): 'にくづき',
    ('口', 'left'): 'くちへん', ('土', 'left'): 'つちへん', ('女', 'left'): 'おんなへん', ('子', 'left'): 'こへん',
    ('弓', 'left'): 'ゆみへん', ('方', 'left'): 'ほうへん', ('車', 'left'): 'くるまへん', ('馬', 'left'): 'うまへん',
    ('魚', 'left'): 'うおへん', ('貝', 'left'): 'かいへん', ('足', 'left'): 'あしへん', ('⻊', None): 'あしへん',
    ('舟', 'left'): 'ふねへん', ('歹', 'left'): 'かばねへん', ('牛', 'left'): 'うしへん', ('牜', None): 'うしへん',
    ('耳', 'left'): 'みみへん', ('酉', 'left'): 'とりへん', ('角', 'left'): 'つのへん', ('矢', 'left'): 'やへん',
    ('山', 'left'): 'やまへん', ('巾', 'left'): 'はばへん', ('石', 'left'): 'いしへん', ('目', 'left'): 'めへん',
    ('禾', None): 'のぎへん', ('米', 'left'): 'こめへん', ('糸', 'left'): 'いとへん', ('言', 'left'): 'ごんべん',
    ('金', 'left'): 'かねへん', ('食', 'left'): 'しょくへん', ('王', 'left'): 'おうへん', ('玉', 'left'): 'おうへん',
    ('示', 'left'): 'しめすへん', ('衣', 'left'): 'ころもへん', ('片', 'left'): 'かたへん', ('立', 'left'): 'たつへん',
    ('白', 'left'): 'しろへん', ('皿', 'left'): 'さらへん', ('田', 'left'): 'たへん', ('止', 'left'): 'とめへん',
    ('歯', 'left'): 'はへん', ('骨', 'left'): 'ほねへん', ('革', 'left'): 'かわへん', ('毛', 'left'): 'けへん',
    ('竹', 'top'): 'たけかんむり', ('⺮', None): 'たけかんむり', ('艹', None): 'くさかんむり', ('宀', None): 'うかんむり',
    ('冖', None): 'わかんむり', ('亠', None): 'なべぶた', ('雨', 'top'): 'あめかんむり', ('⻗', None): 'あめかんむり',
    ('穴', 'top'): 'あなかんむり', ('癶', None): 'はつがしら', ('罒', None): 'あみがしら', ('爫', None): 'つめかんむり',
    ('耂', None): 'おいかんむり', ('⺌', None): 'しょうかんむり', ('⺍', None): 'つかんむり', ('虍', None): 'とらかんむり',
    ('覀', None): 'にし', ('夂', None): 'ふゆがしら', ('人', 'top'): 'ひとやね', ('𠆢', None): 'ひとやね',
    ('尸', None): 'しかばね', ('广', None): 'まだれ', ('厂', None): 'がんだれ', ('疒', None): 'やまいだれ',
    ('辶', None): 'しんにょう', ('⻌', None): 'しんにょう', ('廴', None): 'えんにょう', ('走', 'nyo'): 'そうにょう',
    ('門', 'kamae'): 'もんがまえ', ('門', None): 'もんがまえ', ('囗', None): 'くにがまえ', ('勹', None): 'つつみがまえ',
    ('匚', None): 'はこがまえ', ('冂', None): 'けいがまえ', ('气', None): 'きがまえ', ('行', 'kamae'): 'ぎょうがまえ',
    ('戈', 'right'): 'ほこがまえ', ('刂', None): 'りっとう', ('攵', None): 'のぶん', ('攴', None): 'のぶん',
    ('欠', 'right'): 'あくび', ('殳', None): 'るまた', ('頁', None): 'おおがい', ('隹', None): 'ふるとり',
    ('灬', None): 'れんが', ('儿', None): 'ひとあし', ('彡', None): 'さんづくり', ('卩', None): 'ふしづくり',
    ('⺋', None): 'ふしづくり', ('廾', None): 'にじゅうあし', ('豕', None): 'いのこ',
    ('犬', 'left'): 'けものへん', ('阜', 'left'): 'こざとへん', ('邑', 'right'): 'おおざと', ('水', 'left'): 'さんずい',
    ('手', 'left'): 'てへん', ('人', 'left'): 'にんべん', ('心', 'left'): 'りっしんべん', ('刀', 'right'): 'りっとう',
    ('辵', None): 'しんにょう', ('艸', None): 'くさかんむり', ('网', 'top'): 'あみがしら', ('老', 'top'): 'おいかんむり',
    ('爪', 'top'): 'つめかんむり', ('肉', 'left'): 'にくづき',     ('冰', None): 'にすい', ('彡', 'right'): 'さんづくり', ('攴', 'right'): 'のぶん',
}
# 訓よりも音で呼ぶほうが一般的な字（公開例：にち（日）・いち（一）・ほう（方）・さん（三））。
ON_NAME = set('一二三四五六七八九十百千万日方才公丁工王寸士毎文氏予可未由己円天正生会気休校先年')
# 学年の一覧にない字で、部品として名前を付けて扱うもの（考案者の部品一覧の「中学」欄）。
REGISTERED = {'又': 'また', '巾': 'はば', '斤': 'おの', '斗': 'と', '舟': 'ふね', '且': 'かつ', '占': 'うらなう',
              '亜': 'あ', '介': 'かい', '及': 'およぶ', '呂': 'ろ', '吏': 'り', '与': 'あたえる', '是': 'ぜ'}
BASIC_EXTRA = set('言止心父母米食刀戸午牛馬鳥羽角毛弓矢北西方長半行門用里' '央曲祭皿重申身世皮平面羊')
STROKE = {'㇐': 'よこ', '㇑': 'たて', '㇒': 'ノ', '㇓': 'ノ', '㇔': 'てん', '㇏': 'はらい', '㇀': 'はね',
          '㇕': 'かぎ', '㇆': 'かぎ', '㇖': 'よこかぎ', '㇄': 'たておれ', '㇙': 'たてはね', '㇚': 'たてはね',
          '㇟': 'まげはね', '㇂': 'そりはね', '㇇': 'ク', '㇛': 'く', '㇉': 'おれまげ', '㇈': 'おれまげはね',
          '㇋': 'おれ', '㇌': 'おれ', '㇅': 'かぎかぎ', '㇗': 'たておれ', '㇜': 'くはね', '㇞': 'おれ', '㇊': 'おれ', '㇍': 'かぎ', '㇢': 'そりはね', '㇣': 'よこまげ', '㇎': 'おれ', '㇘': 'たておれはね', '㇁': 'そりはね', '㇃': 'こころのそりはね', '㇡': 'おれまげはね', '一': 'よこ'}


def hira(s):
    return ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c for c in s)


# ---- 読み込み
kd = json.load(open(glob.glob(os.path.join(DATA, 'kanjidic2-en-*.json'))[0], encoding='utf-8'))
KD = {c['literal']: c for c in kd['characters']}
GRADE = {c['literal']: c['misc']['grade'] for c in kd['characters'] if c['misc'].get('grade') and c['misc']['grade'] <= 6}


def readings(ch, kind):
    groups = (KD.get(ch, {}).get('readingMeaning') or {}).get('groups') or []
    return [r['value'] for g in groups for r in g['readings'] if r['type'] == kind]


def kun_list(ch):
    return [k for k in readings(ch, 'ja_kun') if not k.startswith('-') and not k.endswith('-')]


# ---- 語例データ（読みの選択にも使う）
common = json.load(open(glob.glob(os.path.join(DATA, 'jmdict-eng-common-*.json'))[0], encoding='utf-8'))
COMMON = set()
for w in common['words']:
    for k in w['kanji']:
        if k.get('common'):
            for r in w['kana']:
                if r.get('common') and ('*' in r['appliesToKanji'] or k['text'] in r['appliesToKanji']):
                    COMMON.add((k['text'], r['text']))
FREQ = {}
_jm = open(os.path.join(DATA, 'JMdict_e'), encoding='utf-8').read()
for blk in re.findall(r'<k_ele>(.*?)</k_ele>', _jm, flags=re.S):
    keb = re.search(r'<keb>(.*?)</keb>', blk).group(1)
    pri = re.findall(r'<ke_pri>(.*?)</ke_pri>', blk)
    nf = [int(p[2:]) for p in pri if p.startswith('nf')]
    rank = min(nf) if nf else (30 if pri else 60)
    FREQ[keb] = min(FREQ.get(keb, 99), rank)
del _jm
FURI = {}
for line in open(os.path.join(DATA, 'JmdictFurigana.txt'), encoding='utf-8-sig'):
    parts = line.rstrip('\n').split('|')
    if len(parts) == 3 and (parts[0], parts[1]) in COMMON:
        segs = {}
        ok = True
        for s in parts[2].split(';'):
            if not s:
                continue
            idx, rd = s.split(':', 1)
            if '-' in idx:
                ok = False  # 熟字訓（今日など）は使わない
                break
            segs[int(idx)] = rd
        if ok:
            FURI.setdefault(parts[0], []).append((parts[1], segs))



USE = {}
for text, lst in FURI.items():
    for reading, segs in lst:
        for i, rd in segs.items():
            if i < len(text):
                USE[(text[i], rd)] = USE.get((text[i], rd), 0) + 1


def best_kun(ch):
    """語の中で一番よく使われる訓（例：重 は「え」ではなく「おも（い）」）。"""
    kun = kun_list(ch)
    if not kun:
        return None
    return max(kun, key=lambda k: (USE.get((ch, k.split('.')[0]), 0), -kun.index(k)))


def reading_name(ch):
    if ch in REGISTERED:
        return REGISTERED[ch]
    kun, on = best_kun(ch), readings(ch, 'ja_on')
    if kun and on and USE.get((ch, kun.split('.')[0]), 0) < 2 and ch not in BASIC:
        kun = None
    if ch in ON_NAME or not kun:
        return hira(on[0]) if on else ch
    return kun.replace('.', '')


xml = open(os.path.join(DATA, 'kanjivg.xml'), encoding='utf-8').read().replace('kvg:', 'kvg_')
xml = re.sub(r'<!DOCTYPE.*?\]>', '', xml, flags=re.S)
root = ET.fromstring(xml)
VG = {}
for k in root.findall('kanji'):
    kid = k.get('id')
    if '-' in kid:
        continue
    g = k.find('g')
    if g is not None and g.get('kvg_element'):
        VG[g.get('kvg_element')] = g


# ---- 部品へ分ける
# まだ習っていない形は、カタカナに見えればカタカナで呼ぶ（公開例：強＝…ム…、左＝一・ノ・エ、空＝ウ・ル・エ）。
KATA = {'厶': 'ム', '丷': 'ソ', '工': 'エ', '㐅': 'メ', '乂': 'メ', '儿': 'ル', '彐': 'ヨ', '⺕': 'ヨ', '⺈': 'ク', '了': '「子」の一なし'}


def path_points(d):
    """KanjiVG の d を大まかに点列にする（位置判定用）。"""
    toks = re.findall(r'[MmCcSsLlHhVvZz]|[-+]?(?:\d*\.\d+|\d+\.?\d*)', d)
    pts, i, cmd, x, y = [], 0, '', 0.0, 0.0
    while i < len(toks):
        if re.match(r'[A-Za-z]', toks[i]):
            cmd = toks[i]; i += 1; continue
        rel = cmd.islower(); c = cmd.upper()
        n = {'M': 2, 'L': 2, 'C': 6, 'S': 4, 'H': 1, 'V': 1}.get(c, 2)
        vals = [float(v) for v in toks[i:i + n]]; i += n
        if c == 'H':
            x = vals[0] + (x if rel else 0)
        elif c == 'V':
            y = vals[0] + (y if rel else 0)
        else:
            nx, ny = vals[-2] + (x if rel else 0), vals[-1] + (y if rel else 0)
            if c in 'CS':
                pts.append((vals[-4] + (x if rel else 0), vals[-3] + (y if rel else 0)))
            x, y = nx, ny
            if c == 'M':
                cmd = 'l' if rel else 'L'
        pts.append((x, y))
    return pts


def bbox(paths):
    ps = [p for d in paths for p in path_points(d.get('d'))]
    xs, ys = [p[0] for p in ps], [p[1] for p in ps]
    return min(xs), min(ys), max(xs), max(ys)


PARENT = {}


def position(node, whole):
    """KanjiVG に位置がない時は形から判定する（遊の 方 は斿の左＝ほうへん）。
    親の部品の中で最初に書き、親の左半分に収まり、縦に長い時だけ「左」とみなす。"""
    pos = node.get('kvg_position')
    if pos:
        return pos
    parent = PARENT.get(id(node))
    if parent is None or list(parent)[0] is not node:
        return None
    x0, y0, x1, y1 = bbox(strokes_of(node))
    X0, Y0, X1, Y1 = bbox(strokes_of(parent))
    if (x1 - X0) < (X1 - X0) * .5 and (y1 - y0) > (Y1 - Y0) * .6:
        return 'left'
    return None


def strokes_of(node):
    return [p for p in node.iter('path')]


def radical_name(node, whole=None):
    e = node.get('kvg_element')
    pos = position(node, whole) if whole else node.get('kvg_position')
    for key in [(e, pos), (e, None)]:
        if key in RADICAL:
            return RADICAL[key]
    orig = node.get('kvg_original')
    if orig and node.get('kvg_variant') == 'true':
        for key in [(orig, pos), (orig, None)]:
            if key in RADICAL and key[0] not in GRADE:
                return RADICAL[key]
        if (orig, pos) in RADICAL:
            return RADICAL[(orig, pos)]
    return None


BASIC = {c for c, g in GRADE.items() if g == 1} | BASIC_EXTRA


def learned(e, grade):
    """この学年までに部品として名前を持っている字か。"""
    if e in GRADE:
        return GRADE[e] <= grade
    return e in REGISTERED and grade >= 3  # 中学の字の部品は2年のカードで初めて出る（点＝たて・よこ・くち）


def nameable(node, grade):
    if node.tag == 'path':
        return False
    e = node.get('kvg_element')
    if not e or node.get('kvg_part'):
        return False
    return bool(radical_name(node) or learned(e, grade) or e in KATA or splittable(node, grade))


def splittable(node, grade):
    kids = list(node)
    if len(kids) < 2 or any(k.tag == 'path' for k in kids):
        return False
    # 部品が別の部品をはさむ（kvg:part）形は分けない（例：重＝千が里をはさむ）。
    if any(k.get('kvg_part') for k in kids):
        return False
    return all(nameable(k, grade) for k in kids)


def units(node, grade, whole, top=False):
    """[{'n': 名前, 'ps': [pathノード…], 'part': kvg:part の部品名 or None, 'stroke': 画か}] を返す。"""
    if node.tag == 'path':
        t = (node.get('kvg_type') or '')[:1]
        return [{'n': STROKE.get(t, 'せん'), 'ps': [node], 'part': None, 'stroke': True}]
    e = node.get('kvg_element')
    if not top:
        part = e if node.get('kvg_part') else None
        r = radical_name(node, whole)
        if r:
            return [{'n': r, 'ps': strokes_of(node), 'part': part, 'stroke': False}]
        if e and learned(e, grade) and (part or e in BASIC or not splittable(node, grade)):
            return [{'n': reading_name(e), 'ps': strokes_of(node), 'part': part, 'stroke': False}]
        if e in KATA and not (e in GRADE and learned(e, grade)):
            return [{'n': KATA[e], 'ps': strokes_of(node), 'part': part, 'stroke': False}]
    out = []
    for k in node:
        out += units(k, grade, whole)
    return out


def arrange(us, order):
    """kvg:part で分かれた同じ部品（例：囗・門・千）を一つにまとめ、最初の画の順（書き順）に並べる。"""
    merged = []
    for u in us:
        same = next((m for m in merged if u['part'] and m['part'] == u['part']), None)
        if same:
            same['ps'] += u['ps']
        else:
            merged.append(dict(u, ps=list(u['ps'])))
    for m in merged:
        m['ps'].sort(key=lambda p: order[id(p)])
    merged.sort(key=lambda m: order[id(m['ps'][0])])
    # 同じ画が続く時は一つにまとめる（公開例：ノノ、たてたて）
    out = []
    for m in merged:
        prev = out[-1] if out else None
        if prev and m['stroke'] and prev['stroke'] and prev['n'] == prev['base'] * len(prev['ps']) and m['n'] == prev['base'] and len(prev['ps']) < 3:
            prev['n'] += m['n']; prev['ps'] += m['ps']
        else:
            out.append(dict(m, base=m['n']))
    return out


def decompose(ch, grade=None):
    g = VG[ch]
    for par in g.iter():
        for k in par:
            PARENT[id(k)] = par
    paths = strokes_of(g)
    order = {id(p): i for i, p in enumerate(paths)}
    us = arrange(units(g, grade or GRADE.get(ch, 6), bbox(paths), top=True), order)
    return [p.get('d') for p in paths], [dict({'n': u['n'], 's': [order[id(p)] for p in u['ps']]}, **({'k': 1} if u['stroke'] else {})) for u in us]


def word_segments(text, segs, target, grade):
    """表示用：[[文字, ふりがな or None, 答えか]]。学年より上の漢字はひらがなで出す。"""
    out = []
    for i, c in enumerate(text):
        if c == target:
            out.append([c, segs.get(i), True])
        elif c in GRADE and GRADE[c] <= grade:
            out.append([c, None, False])
        elif i in segs:
            out.append([segs[i], None, False])
        else:
            out.append([c, None, False])
    return out


def on_matches(seg, ons):
    for on in ons:
        h = hira(on)
        if seg == h or (len(seg) == len(h) and seg[:-1] == h[:-1] and seg[-1] == 'っ'):
            return True
    return False


def pick_words(ch, grade):
    cands = []
    for text, lst in FURI.items():
        if ch not in text or len(text) > 4:
            continue
        for reading, segs in lst:
            i = text.index(ch)
            if i not in segs:
                continue
            others = [c for c in text if c != ch and '一' <= c <= '鿿']
            above = sum(1 for c in others if GRADE.get(c, 9) > grade)
            # 一字だけの語（送りがなもない）は手がかりにならないので後回し
            lone = 15 if len(text) == 1 else 0
            cands.append((above * 100 + FREQ.get(text, 60) + lone + len(text), len(text), text, reading, segs))
    cands.sort(key=lambda x: (x[0], x[1], x[2]))
    ons = readings(ch, 'ja_on')
    on_word = next((c for c in cands if len(c[2]) >= 2 and all('一' <= x <= '鿿' for x in c[2]) and on_matches(c[4][c[2].index(ch)], ons)), None)
    ex, seen = [], {on_word[2]} if on_word else set()
    for c in cands:
        if c[2] in seen or c[0] >= 100:
            continue
        seen.add(c[2]); ex.append(word_segments(c[2], c[4], ch, grade))
        if len(ex) >= 2:
            break
    k = best_kun(ch)
    kun = [k] if k and USE.get((ch, k.split('.')[0]), 0) >= 2 else []
    title = {
        'word': word_segments(on_word[2], on_word[4], ch, grade) if on_word else None,
        'on': ons[0] if ons else None,
        'kun': kun[0].replace('.', '_') if kun else None,
    }
    if title['word']:
        for seg in title['word']:
            if seg[2]:
                seg[1] = None  # 答えの字は表示側でカタカナ（音）に置き換える
    return title, ex


# ---- 出力
os.makedirs(OUT, exist_ok=True)
report = []
for grade in range(1, 7):
    chars = sorted([c for c, g in GRADE.items() if g == grade], key=lambda c: ord(c))
    kanji, parts = [], {}
    for ch in chars:
        if ch not in VG:
            report.append(f'字形なし {ch}')
            continue
        paths, us = decompose(ch)
        title, ex = pick_words(ch, grade)
        kanji.append({'c': ch, 'p': paths, 'u': us, 't': title, 'x': ex})
        for u in us:
            if u['n'] not in parts:
                parts[u['n']] = dict({'d': [paths[i] for i in u['s']]}, **({'k': 1} if u.get('k') else {}))
    with open(os.path.join(OUT, f'g{grade}.json'), 'w', encoding='utf-8') as f:
        json.dump({'grade': grade, 'kanji': kanji, 'parts': parts}, f, ensure_ascii=False, separators=(',', ':'))
    report.append(f'{grade}年 {len(kanji)}字 部品{len(parts)}種')
# 公開資料の唱え方との照合
OFFICIAL = {'働': 'にんべん、おもい、ちから', '温': 'さんずい、にち、さら', '強': 'ゆみへん、ム、むし',
            '教': 'おいかんむり、こ、のぶん', '点': 'たて、よこ、くち、れんが', '泳': 'さんずい、てん、水の上を左にまげる',
            '照': 'にちへん、かたな、くち、れんが', '遊': 'ほうへん、ノ、いち、こ、しんにょう'}
for ch, want in OFFICIAL.items():
    got = '、'.join(u['n'] for u in decompose(ch)[1])
    report.append(f'{"一致" if got == want else "不一致"} {ch}: 公式「{want}」 生成「{got}」')
open(os.path.join(OUT, 'build_report.txt'), 'w', encoding='utf-8').write('\n'.join(report) + '\n')
print('\n'.join(report).encode('utf-8', 'replace').decode('utf-8'), file=open(os.devnull, 'w'))

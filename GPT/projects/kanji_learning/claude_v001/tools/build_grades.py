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
    ('舟', 'left'): 'ふねへん', ('歹', 'left'): 'いちたへん', ('牛', 'left'): 'うしへん', ('牜', None): 'うしへん',
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
    ('耂', None): 'おいかんむり', ('⺌', None): 'しょうかんむり', ('⺍', None): 'つかんむり', ('虍', None): 'とらがしら',
    ('覀', None): 'にし', ('夂', None): 'すいにょう', ('人', 'top'): 'ひとやね', ('𠆢', None): 'ひとやね',
    ('尸', None): 'しかばね', ('广', None): 'まだれ', ('厂', None): 'がんだれ', ('疒', None): 'やまいだれ',
    ('辶', None): 'しんにょう', ('⻌', None): 'しんにょう', ('廴', None): 'えんにょう', ('走', 'nyo'): 'そうにょう',
    ('門', 'kamae'): 'もんがまえ', ('門', None): 'もんがまえ', ('囗', None): 'くにがまえ', ('勹', None): 'つつみがまえ',
    ('匚', None): 'はこがまえ', ('冂', None): 'どうがまえ', ('气', None): 'きがまえ', ('行', 'kamae'): 'ぎょうがまえ',
    ('戈', 'right'): 'ほこがまえ', ('刂', None): 'りっとう', ('攵', None): 'のぶん', ('攴', None): 'のぶん',
    ('欠', 'right'): 'あくび', ('殳', None): 'るまた', ('頁', None): 'おおがい', ('隹', None): 'ふるとり',
    ('灬', None): 'れんが', ('儿', None): 'ひとあし', ('彡', None): 'さんづくり', ('卩', None): 'ふしづくり',
    ('⺋', None): 'ふしづくり', ('廾', None): 'にじゅうあし', ('豕', None): 'ぶた',
    ('犬', 'left'): 'けものへん', ('阜', 'left'): 'こざとへん', ('邑', 'right'): 'おおざと', ('水', 'left'): 'さんずい',
    ('手', 'left'): 'てへん', ('人', 'left'): 'にんべん', ('心', 'left'): 'りっしんべん', ('刀', 'right'): 'りっとう',
    ('辵', None): 'しんにょう', ('艸', None): 'くさかんむり', ('网', 'top'): 'あみがしら', ('老', 'top'): 'おいかんむり',
    ('爪', 'top'): 'つめかんむり', ('肉', 'left'): 'にくづき',     ('冰', None): 'にすい', ('彡', 'right'): 'さんづくり', ('攴', 'right'): 'のぶん',
}
# 訓よりも音で呼ぶほうが一般的な字（公開例：にち（日）・いち（一）・ほう（方）・さん（三））。
ON_NAME = set('一二三四五六七八九十百千万日方才公丁工王寸士毎文氏予可未由己円天正生会気休校先年')
# ---- ミチムラ式の公式資料（ご案内パンフレット2025「学年別 基本漢字と部品の一覧表」「部品カード」）
# 基本漢字：書けるように練習する字。部品に分けずに読みで呼ぶ（●内の配当学年の字も、この学年で基本漢字として扱う）。
BASIC_BY_GRADE = {
    1: '一二三五七八九十月火水木土日山川田上下大中小目耳手女子人入年文正王立竹虫雨赤丁寸',
    2: '言止心父母米食刀戸午牛馬鳥羽角毛弓矢北西方長半行門用里豆由予欠氏周未良士可己至又巾斤斗舟且占',
    3: '央曲祭皿重申身世皮平面羊求束失非永示比干尺亜介及呂吏与',
    4: '以衣果司臣井単飛必不支我亡牙丘臼',
    5: '久再史脈片矛',
    6: '骨冊垂革呉斉',
}
# 部品カードの名前（要素→名前）。位置で名前が変わる部首は RADICAL 側。
OFFICIAL_PART = {
    '亠': 'なべぶた', '冂': 'どうがまえ', '𠆢': 'ひとやね', '亻': 'にんべん', '宀': 'うかんむり', '艹': 'くさかんむり',
    '冖': 'わかんむり', '⺍': 'つかんむり', '寸': 'すん', '幺': 'いとがしら', '凵': 'うけばこ', '气': 'きがまえ',
    '丷': 'ソ', '龶': 'あおの上', '龰': 'あしの下',
    '灬': 'れんが', '辶': 'しんにょう', '⻌': 'しんにょう', '氵': 'さんずい', '囗': 'くにがまえ', '夂': 'すいにょう',
    '巾': 'はば', '毋': 'ははのかん', '士': 'さむらい', '禾': 'のぎへん', '攵': 'のぶん', '彳': 'ぎょうにんべん',
    '頁': 'おおがい', '耂': 'おいかんむり', '斤': 'おのづくり', '⺌': 'しょうかんむり', '彡': 'さんづくり',
    '广': 'まだれ', '厂': 'がんだれ', '又': 'また', '刂': 'りっとう', '隹': 'ふるとり', '⺕': 'けいがしら',
    '己': 'おのれ', '欠': 'あくび', '罒': 'あみがしら', '礻': 'しめすへん', '豕': 'ぶた', '廾': 'にじゅうあし',
    '斗': 'とます', '开': 'とりいの形', '⺶': '羊の一本なし',
    '扌': 'てへん', '⺷': 'ひつじ', '尸': 'しかばね', '氺': 'したみず', '殳': 'るまた', '酉': 'ひよみのとり',
    '歹': 'いちたへん', '牜': 'うしへん', '艮': 'こんづくり', '弋': 'しきがまえ', '戈': 'ほこがまえ', '飠': 'しょくへん',
    '乚': 'おつにょう', '冫': 'にすい', '卩': 'ふしづくり', '⺋': 'ふしづくり', '聿': 'ふでづくり', '癶': 'はつがしら',
    '干': 'いちじゅう', '疒': 'やまいだれ', '匚': 'はこがまえ', '匸': 'はこがまえ', '廴': 'えんにょう', '非': 'あらず',
    '廿': 'にじゅう', '戊': 'たれたほこ', '其': 'その',
    '勹': 'つつみがまえ', '覀': 'にし', '衤': 'ころもへん', '戋': '三本のほこ', '㑒': 'けんの右',
    '忄': 'りっしんべん', '几': 'つくえ', '冓': '組み立てるコウ', '丬': 'しょうへん', '㔾': 'まげたふしづくり',
    '犭': 'けものへん', '韋': 'なめしがわ', '耒': 'すきへん', '巛': 'かわ', '咼': '過ぎるの右',
    '虍': 'とらがしら', '⺪': 'ひき', '疋': 'ひき', '尢': 'だいのまげあし', '业': 'なみの下',
    # 常用外の字の部品（考案者ブログの例：地＝なり、場＝なかれ、色＝ともえ、級＝およぶ、宮＝口ノ口）
    '也': 'なり', '巴': 'ともえ', '勿': 'なかれ', '乍': 'さく', '袁': 'えん', '亥': 'がい', '甫': 'ほ',
}
# 部品が部品カードに登場する学年（それより前の学年の字では使わない）
PART_GRADE = {}
for _g, _es in {1: '亠冂儿𠆢幺凵气囗丷亻宀艹⺍冖寸龶龰', 2: '灬辶⻌氵夂巾毋士禾攵彳頁耂斤⺌彡广厂又刂隹⺕己欠罒礻豕廾斗开⺶也巴勿乍袁',
                3: '扌⺷尸氺阝殳酉歹牜艮弋戈飠乚冫卩⺋聿癶干疒匚匸廴非廿戊其', 4: '勹覀衤戋㑒冊', 5: '忄几冓丬㔾犭韋耒巛咼',
                6: '虍⺪疋尢业亥甫'}.items():
    for _e in _es:
        PART_GRADE[_e] = _g
SIG_GRADE = {'たてぼうココ': 3, 'ころもの下': 3, 'ながいの下': 3, 'ソニ人': 3, '立の下が冂': 3, 'むかしの上': 3,
             'さむいの中': 3, 'ふくの右': 3, 'あおの上': 1, '羊の一本なし': 2}
# 部品カードの独自部品のうち、字形データに要素名がないもの：画の形の並びで見分ける。
SIGNATURE = {
    '㇑㇕㇐㇕㇐': 'たてぼうココ', '㇒㇙㇒㇏': 'ころもの下', '㇐㇙㇒㇏': 'ながいの下', '㇔㇒㇐㇐㇒㇏': 'ソニ人',
    '㇑㇐㇔㇒㇑㇆': '立の下が冂', '㇐㇑㇐㇐': 'あおの上', '㇔㇒㇐㇐㇑': '羊の一本なし', '㇐㇑㇑㇐': 'むかしの上', '㇐㇑㇑㇐㇐㇒㇏': 'さむいの中', '㇆㇑㇇㇏': 'ふくの右',
}
# カタカナの部品（1年：エカケタトナノハヒフムメロ、2年：アオクコセホマヨラリレン、3年：ユ、4年：ヌ）
KATA = {'厶': 'ム', '工': 'エ', '㐅': 'メ', '乂': 'メ', '彐': 'ヨ', '⺈': 'ク', '𠂊': 'ク', '卜': 'ト', '𠂇': 'ナ',
        'ナ': 'ナ', '匕': 'ヒ', '八': 'ハ', '夕': 'タ', '了': '「子」の一なし'}
# 公式の唱えに出てくる画の名前（ノ・たて・よこ・てん）と、カタカナの形の画。これ以外の画の名前は公式資料にない。
STROKE_OK = {'㇒': 'ノ', '㇓': 'ノ', '㇑': 'たて', '㇐': 'いち', '㇔': 'てん', '㇇': 'フ', '㇙': 'レ', '㇄': 'たてまげ', '㇗': 'たてまげ'}
# 中学の基本漢字で、部品カードとは別に名前で呼ぶもの
REGISTERED = {'舟': 'ふね', '且': 'かつ', '占': 'うらなう', '亜': 'あ', '介': 'かい', '及': 'およぶ', '呂': '口ノ口',
              '吏': 'り', '与': 'あたえる'}
VG_CHAR = ['']
CUR_GRADE = [6]
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


# 読みの自動選択が不自然な字の呼び名（子どもがふつう呼ぶ読み）
NAME_OVERRIDE = {'空': 'そら', '寺': 'てら', '森': 'もり', '林': 'はやし', '音': 'おと', '来': 'くる', '明': 'あかるい',
                 '画': 'が', '姉': 'あね', '妹': 'いもうと', '弟': 'おとうと', '家': 'いえ', '市': 'し', '形': 'かたち',
                 '細': 'ほそい', '点': 'てん', '交': 'まじわる', '休': 'やすむ', '池': 'いけ', '絵': 'え', '船': 'ふね',
                 '夜': 'よる', '羽': 'はね', '角': 'つの'}


def reading_name(ch):
    if ch in NAME_OVERRIDE:
        return NAME_OVERRIDE[ch]
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


BASIC = {c for cs in BASIC_BY_GRADE.values() for c in cs}


def basic_upto(grade):
    return {c for g, cs in BASIC_BY_GRADE.items() if g <= grade for c in cs}


def learned(e, grade):
    return e in GRADE and GRADE[e] <= grade


def types_of(strokes):
    return ''.join((p.get('kvg_type') or '?')[0] for p in strokes)


def part_name(node, whole):
    """公式の部品カードの名前（位置で変わるものを含む）。"""
    e = node.get('kvg_element')
    if e == '艮' and types_of(strokes_of(node)).endswith('㇔'):
        return '食のへなし'
    if e in ('儿',) and node.get('kvg_original') != '八':
        return 'ひとあし' if (node.get('kvg_position') == 'bottom' or PARENT.get(id(node)) is not None and PARENT[id(node)].get('kvg_position') == 'bottom') else 'ル'
    if e == '冊' and VG_CHAR[0] != '冊':
        return '横につき出さない冊'
    if e == '勹' and types_of(strokes_of(node)) == '㇆㇒':
        return 'カ'  # 別の下：字形データでは 勹 だが、書き順も形も カ（つつみがまえは ノ が先で、中を包む）
    if e in KATA and e not in OFFICIAL_PART:
        return None  # カタカナの部品（魚の上＝ク）
    if max(PART_GRADE.get(e, 0), PART_GRADE.get(node.get('kvg_original'), 0)) > CUR_GRADE[0]:
        return None
    if e in OFFICIAL_PART:
        return OFFICIAL_PART[e]
    if e == '阝' or (node.get('kvg_original') == '阜') or (node.get('kvg_original') == '邑'):
        if CUR_GRADE[0] < 3:
            return None
    return radical_name(node, whole)


ATOMIC = {}


def atomic(e, grade):
    """基本漢字でない既習字のうち、基本漢字と部品では唱えられないもの（力＝ちから、口＝くち）。"""
    if e not in VG:
        return True
    if (e, grade) not in ATOMIC:
        saved = VG_CHAR[0], CUR_GRADE[0]
        _, us = decompose(e, grade)
        VG_CHAR[0], CUR_GRADE[0] = saved
        ATOMIC[(e, grade)] = any(u.get('z') for u in us)
    return ATOMIC[(e, grade)]


def single_stroke(p):
    t = (p.get('kvg_type') or '?')[0]
    if t in STROKE_OK:
        return STROKE_OK[t], 1.5, False
    return STROKE.get(t, 'せん'), 10, True


def candidates(g, grade, whole, order):
    """[(画の集合, 名前, コスト, 公式にない画か)]"""
    cands = []
    groups = {}
    for n in g.iter('g'):
        if n is g:
            continue
        e = n.get('kvg_element')
        s = frozenset(order[id(p)] for p in strokes_of(n))
        if not s:
            continue
        if n.get('kvg_part'):  # 囗・門 のように分かれて書かれる部品はまとめる
            groups.setdefault(e, set()).update(s)
            continue
        name, cost = None, None
        pn = part_name(n, whole)
        if pn:
            name, cost = pn, 1
        elif e in KATA:
            name, cost = KATA[e], 1
        elif e in basic_upto(grade):
            name, cost = reading_name(e), 1
        elif e in REGISTERED:
            name, cost = REGISTERED[e], 1
        elif e and learned(e, grade):
            # 基本漢字でない既習字：1・2年の字はまとめて読みで呼ぶ（観＝…みる、固＝くにがまえ、ふるい）。
            # 3年以上の字は分ける（働＝にんべん、おもい、ちから で 動 を使わない、照 で 昭 を使わない）。
            # 公式の3例（働・照・観）から推した規則。分けられない字（力・口）はどの学年でも読みで呼ぶ。
            name, cost = reading_name(e), (1 if GRADE[e] <= 2 or atomic(e, grade) else 4.5)
        if name:
            cands.append((s, name, cost, False))
        # ミチムラ式独自の部品：兄弟の部品の並びが画の形と一致するもの
        kids = list(n)
        for i in range(len(kids)):
            acc = []
            for j in range(i, len(kids)):
                acc += [kids[j]] if kids[j].tag == 'path' else strokes_of(kids[j])
                idx = sorted(order[id(p)] for p in acc)
                if idx != list(range(idx[0], idx[0] + len(idx))):
                    continue
                sig = types_of(sorted(acc, key=lambda p: order[id(p)]))
                if sig in SIGNATURE and SIG_GRADE.get(SIGNATURE[sig], 3) <= grade:
                    cands.append((frozenset(idx), SIGNATURE[sig], 1.01, False))
    # 字全体の画の並びの中の独自部品（商＝立の下が冂：字形データでは 立 と 冏 にまたがる）
    allp = sorted(strokes_of(g), key=lambda p: order[id(p)])
    for i in range(len(allp)):
        for j in range(i + 4, min(len(allp), i + 7) + 1):
            sig = types_of(allp[i:j])
            if sig in SIGNATURE and SIG_GRADE.get(SIGNATURE[sig], 3) <= grade:
                cands.append((frozenset(range(i, j)), SIGNATURE[sig], 1.01, False))
    for e, s in groups.items():
        if e not in OFFICIAL_PART and e not in '門行':
            continue
        if PART_GRADE.get(e, 0) > grade:
            continue
        nm = OFFICIAL_PART.get(e) or (reading_name(e) if e in basic_upto(grade) else None)
        if nm:
            cands.append((frozenset(s), nm, 1, False))
    return cands


def decompose(ch, grade=None):
    g = VG[ch]
    VG_CHAR[0] = ch
    for par in g.iter():
        for k in par:
            PARENT[id(k)] = par
    paths = strokes_of(g)
    order = {id(p): i for i, p in enumerate(paths)}
    grade = grade or GRADE.get(ch, 6)
    CUR_GRADE[0] = grade
    whole = bbox(paths)
    cands = candidates(g, grade, whole, order)
    for i, p in enumerate(paths):
        nm, cost, bad = single_stroke(p)
        cands.append((frozenset([i]), nm, cost, bad))
    by_first = {}
    for c in cands:
        by_first.setdefault(min(c[0]), []).append(c)
    n = len(paths)
    full = frozenset(range(n))
    memo = {}

    def best(covered):
        if covered == full:
            return (0, 0, ())
        if covered in memo:
            return memo[covered]
        i = min(full - covered)
        res = None
        for c in by_first.get(i, []):
            if c[0] & covered:
                continue
            sub = best(covered | c[0])
            cand = (sub[0] + c[2], sub[1] + 1, (c,) + sub[2])
            if res is None or cand[:2] < res[:2]:
                res = cand
        memo[covered] = res or (999, 99, ())
        return memo[covered]

    _, _, chosen = best(frozenset())
    units = sorted(chosen, key=lambda c: min(c[0]))
    # 同じ画の名前が続く時はまとめる（公開例：ノノ）
    out = []
    for s, nm, cost, bad in units:
        prev = out[-1] if out else None
        if prev and prev['k'] and cost == 1.5 and nm == 'ノ' and prev['base'] == nm and len(prev['s']) < 3 and prev['n'] == nm * len(prev['s']):
            prev['n'] += nm; prev['s'] += sorted(s)
        else:
            out.append({'n': nm, 's': sorted(s), 'k': cost >= 1.5 and len(s) == 1, 'base': nm, 'bad': bad})
    res = []
    for u in out:
        d = {'n': u['n'], 's': u['s']}
        if u['k']:
            d['k'] = 1
        if u['bad']:
            d['z'] = 1
        res.append(d)
    return [p.get('d') for p in paths], res


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


def hira_to_kata(s):
    return ''.join(chr(ord(c) + 0x60) if 'ぁ' <= c <= 'ゖ' else c for c in s)


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
        'on': (hira_to_kata(on_word[4][on_word[2].index(ch)]) if on_word else (ons[0] if ons else None)),
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
        item = {'c': ch, 'p': paths, 'u': us, 't': title, 'x': ex}
        if ch in BASIC:  # 基本漢字は部品に分けず、形を書いておぼえる
            item['u'] = [{'n': reading_name(ch), 's': list(range(len(paths)))}]
            item['b'] = 1
        elif any(u.get('z') for u in us):
            item['z'] = 1  # 公式資料にない画の名前が入る（出題しない）
        kanji.append(item)
        us = item['u']
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
# 考案者ブログで部品が分かる字（その部品が唱えに入っているか）
OFFICIAL_PARTS = {'館': 'たてぼうココ', '宮': '口ノ口', '表': 'ころもの下', '農': 'ながいの下', '商': '立の下が冂',
                  '勝': 'ソニ人', '地': 'なり', '場': 'なかれ', '色': 'ともえ', '度': 'にじゅう', '期': 'その',
                  '級': 'およぶ', '近': 'おのづくり', '家': 'ぶた', '毎': 'ははのかん', '夏': 'すいにょう', '書': 'けいがしら',
                  '式': 'しきがまえ', '感': 'ほこがまえ', '球': 'したみず', '医': 'はこがまえ', '庭': 'えんにょう',
                  '物': 'うしへん', '飲': 'しょくへん', '階': 'こざとへん', '都': 'おおざと', '曜': 'ふるとり'}
for ch, want in OFFICIAL_PARTS.items():
    got = [u['n'] for u in decompose(ch)[1]]
    report.append(f'{"部品一致" if want in got else "部品不一致"} {ch}: 公式の部品「{want}」 生成「{"、".join(got)}」')
for ch, want in OFFICIAL.items():
    got = '、'.join(u['n'] for u in decompose(ch)[1])
    report.append(f'{"一致" if got == want else "不一致"} {ch}: 公式「{want}」 生成「{got}」')
open(os.path.join(OUT, 'build_report.txt'), 'w', encoding='utf-8').write('\n'.join(report) + '\n')
print('\n'.join(report).encode('utf-8', 'replace').decode('utf-8'), file=open(os.devnull, 'w'))

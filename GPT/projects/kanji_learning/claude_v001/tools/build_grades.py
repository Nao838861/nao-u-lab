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
import unicodedata
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
    ('穴', 'top'): 'あなかんむり', ('癶', None): 'はつがしら', ('罒', None): 'あみがしら', ('爫', None): 'つめかんむり', ('⺤', None): 'つめかんむり',
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
# 部品クイズで、字の読みで呼ぶ部品にそえる一般の部首名（ユーザー指示：言＝いう（ごんべん）、木＝き（きへん））。
# 部首になると形が大きく変わるもの（水→さんずい、心→りっしんべん、手→てへん など）や、
# 意味の違う部首（月→にくづき）は、同じ部品だと思わせないように入れない。
HEN_NOTE = {
    '言': 'ごんべん', '木': 'きへん', '火': 'ひへん', '日': 'にちへん', '口': 'くちへん', '土': 'つちへん',
    '女': 'おんなへん', '子': 'こへん', '弓': 'ゆみへん', '方': 'ほうへん', '車': 'くるまへん', '馬': 'うまへん',
    '魚': 'うおへん', '貝': 'かいへん', '足': 'あしへん', '舟': 'ふねへん', '牛': 'うしへん', '耳': 'みみへん',
    '酉': 'とりへん', '角': 'つのへん', '矢': 'やへん', '山': 'やまへん', '巾': 'はばへん', '石': 'いしへん',
    '目': 'めへん', '米': 'こめへん', '糸': 'いとへん', '金': 'かねへん', '食': 'しょくへん', '王': 'おうへん',
    '片': 'かたへん', '立': 'たつへん', '白': 'しろへん', '田': 'たへん', '止': 'とめへん', '歯': 'はへん',
    '骨': 'ほねへん', '革': 'かわへん', '毛': 'けへん', '竹': 'たけかんむり', '雨': 'あめかんむり',
    '穴': 'あなかんむり', '欠': 'あくび', '走': 'そうにょう', '戈': 'ほこがまえ', '頁': 'おおがい',
    '隹': 'ふるとり', '門': 'もんがまえ', '行': 'ぎょうがまえ',
}
NAME_SRC = {}  # 部品の名前 → その名前で呼んだ字（読みで呼ぶ部品だけ）
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
             'さむいの中': 3, 'ふくの右': 3, 'あおの上': 1, '羊の一本なし': 2, 'ソ': 1, 'つかんむり': 1}
# 部品カードの独自部品のうち、字形データに要素名がないもの：画の形の並びで見分ける。
SIGNATURE = {
    '㇑㇕㇐㇕㇐': 'たてぼうココ', '㇒㇙㇒㇏': 'ころもの下', '㇐㇙㇒㇏': 'ながいの下', '㇔㇒㇐㇐㇒㇏': 'ソニ人',
    '㇑㇐㇔㇒㇑㇆': '立の下が冂', '㇐㇑㇐㇐': 'あおの上', '㇔㇒': 'ソ', '㇔㇔㇒': 'つかんむり', '㇔㇒㇐㇐㇑': '羊の一本なし', '㇐㇑㇑㇐': 'むかしの上', '㇐㇑㇑㇐㇐㇒㇏': 'さむいの中', '㇆㇑㇇㇏': 'ふくの右',
}
# カタカナの部品（1年：エカケタトナノハヒフムメロ、2年：アオクコセホマヨラリレン、3年：ユ、4年：ヌ）
KATA = {'厶': 'ム', '工': 'エ', '㐅': 'メ', '乂': 'メ', '彐': 'ヨ', '⺈': 'ク', '𠂊': 'ク', '卜': 'ト', '𠂇': 'ナ',
        'ナ': 'ナ', '匕': 'ヒ', '八': 'ハ', '夕': 'タ', 'マ': 'マ', '了': '「子」の一なし'}
# 公式の唱えに出てくる画の名前（ノ・たて・よこ・てん）と、カタカナの形の画。これ以外の画の名前は公式資料にない。
STROKE_OK = {'㇒': 'ノ', '㇓': 'ノ', '㇑': 'たて', '㇐': 'いち', '㇔': 'てん', '㇇': 'フ', '㇙': 'レ', '㇄': 'たてまげ', '㇗': 'たてまげ'}
# 中学の基本漢字で、部品カードとは別に名前で呼ぶもの
REGISTERED = {'舟': 'ふね', '且': 'かつ', '占': 'うらなう', '亜': 'あ', '介': 'かい', '及': 'およぶ', '呂': '口ノ口',
              '吏': 'り', '与': 'あたえる'}
# 手で決めた唱え（字形データの部品の記録が崩れている字）。(名前, 画の番号) を書き順に。
# 飛：9画を、同じ線のくり返しをまとめて6つ（公式の「ノノ」と同じまとめ方）。
MANUAL = {'飛': [('おれまげはね', [0]), ('ノてん', [1, 2]), ('たて', [3]), ('ノノ', [4, 5]), ('おれまげはね', [6]), ('ノてん', [7, 8])]}
VG_CHAR = ['']
CUR_GRADE = [6]
STROKE = {'㇐': 'よこ', '㇑': 'たて', '㇒': 'ノ', '㇓': 'ノ', '㇔': 'てん', '㇏': 'はらい', '㇀': 'ななめ',
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



# 都道府県名（固有名詞のため常用語の辞書に入っていない。4年の配当漢字の語例に使う）
PREF = '熊本:くま,もと 埼玉:さい,たま 茨城:いばら,き 栃木:とち,ぎ 愛媛:え,ひめ 新潟:にい,がた 岐阜:ぎ,ふ 奈良:な,ら '        '滋賀:し,が 沖縄:おき,なわ 鹿児島:か,ご,しま 岡山:おか,やま 長崎:なが,さき 宮崎:みや,ざき 山梨:やま,なし '        '富山:と,やま 香川:か,がわ 佐賀:さ,が 大阪:おお,さか 福岡:ふく,おか 静岡:しず,おか 群馬:ぐん,ま 徳島:とく,しま '        '宮城:みや,ぎ 神奈川:か,な,がわ 福井:ふく,い 石川:いし,かわ 岩手:いわ,て 秋田:あき,た 山形:やま,がた '        '福島:ふく,しま 千葉:ち,ば 長野:なが,の 三重:み,え 京都:きょう,と 兵庫:ひょう,ご 鳥取:とっ,とり 島根:しま,ね '        '広島:ひろ,しま 山口:やま,ぐち 高知:こう,ち 大分:おお,いた 青森:あお,もり 北海道:ほっ,かい,どう 東京:とう,きょう'
for _w in PREF.split():
    _t, _r = _w.split(':')
    _rs = _r.split(',')
    if len(_rs) != len(_t) or not all(_rs):
        continue
    FURI.setdefault(_t, []).append((''.join(_rs), dict(enumerate(_rs))))
    FREQ[_t] = 5

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
                 '夜': 'よる', '羽': 'はね', '角': 'つの',
                 # 基本漢字（読みの自動選択が、語の中だけで使う形や古い読みになっていたもの）
                 '上': 'うえ', '食': 'たべる', '午': 'ご', '半': 'はん', '門': 'もん', '用': 'よう', '周': 'しゅう',
                 '面': 'めん', '尺': 'しゃく', '以': 'い', '果': 'か', '単': 'たん', '支': 'ささえる', '我': 'われ',
                 '亡': 'ぼう', '脈': 'みゃく', '冊': 'さつ', '呉': 'ご', '斉': 'せい', '由': 'ゆう',
                 '本': 'ほん', '象': 'ぞう', '平': 'へい', '私': 'わたし'}


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
    # 字の名前から作る へん（くちへん・きへん…）は、字全体の左半分の時だけ。
    # 器 の左上の口は「上の段の左」であって へん ではないので くち のまま。
    par = PARENT.get(id(node))
    if pos == 'left' and par is not None and id(par) in PARENT and not par.get('kvg_element'):
        pos = None  # 親が名前のない段（器の上の段）の時は へん ではない。照の日（昭の左）は にちへん のまま
    if e == '人' and pos == 'left' and '㇑' not in types_of(strokes_of(node)):
        pos = None  # 卒・座の上の 人人：左の人も はらい の形で、にんべん（ノ＋たて）ではない
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
    par = PARENT.get(id(node))
    if e is None and types_of(strokes_of(node)) == '㇒㇏' and '欠' in (VG_CHAR[0], par.get('kvg_element') if par is not None else None):
        return 'ひと'  # 欠の下（ノ・はらい）は人の形。父・校の下（交わる形）は人ではないので、欠の中だけ
    if e == '良' and types_of(strokes_of(node)).endswith('㇔'):
        return '食のへなし'  # 朗の左：良の最後が点（公式部品カード6年）
    if e == '鳥' and len(strokes_of(node)) == 7:
        return 'とりのれんがなし'  # 島：鳥の下の4つの点がない形
    if e == '月' and types_of(strokes_of(node)) in ('㇒㇇㇔㇔', '㇒㇆㇔㇔'):
        return '一本多いタ'  # 然・祭の左上：字形データでは 月（肉）だが、形はタに一本多い（考案者ブログ：祭＝一本多いタ）
    if e in ('卩', '⺋') and types_of(strokes_of(node)) == '㇇㇔':
        return 'マ'  # 領 の 令 の下：字形データでは 卩 だが、形は マ
    if e == '一' and types_of(strokes_of(node)) == '㇔':
        return 'てん'  # 令 の中：字形データでは 一 だが、点の形で描かれている
    if e == '勹' and types_of(strokes_of(node)) == '㇆㇒':
        return 'カ'  # 別の下：字形データでは 勹 だが、書き順も形も カ（つつみがまえは ノ が先で、中を包む）
    if e in KATA and e not in OFFICIAL_PART:
        return None  # カタカナの部品（魚の上＝ク）
    if max(PART_GRADE.get(e, 0), PART_GRADE.get(node.get('kvg_original'), 0)) > CUR_GRADE[0]:
        return None
    if e in OFFICIAL_PART:
        # 字形データの誤り対策：部品の画数より極端に少ない時はその部品と呼ばない（飛の 廾 が1画など）
        if e in VG and len(strokes_of(node)) < len(strokes_of(VG[e])) - 1:
            return None
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
            NAME_SRC.setdefault(name, e)
        elif e in REGISTERED:
            name, cost = REGISTERED[e], 1
        elif e and learned(e, grade):
            # 基本漢字でない既習字：1・2年の字はまとめて読みで呼ぶ（観＝…みる、固＝くにがまえ、ふるい）。
            # 3年以上の字は分ける（働＝にんべん、おもい、ちから で 動 を使わない、照 で 昭 を使わない）。
            # 公式の3例（働・照・観）から推した規則。分けられない字（力・口）はどの学年でも読みで呼ぶ。
            name, cost = reading_name(e), (1 if GRADE[e] <= 2 or atomic(e, grade) else 4.5)
            NAME_SRC.setdefault(name, e)
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
                if sig in ('㇔㇒', '㇔㇔㇒'):
                    ss = sorted(acc, key=lambda p: order[id(p)])
                    cx = [(bbox([q])[0] + bbox([q])[2]) / 2 for q in ss]
                    if not cx[-2] < cx[-1]:
                        continue  # ソ は 点が左・ノが右（父の上のように逆なら ソ ではない）
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
        nm = OFFICIAL_PART.get(e) or {'行': 'ぎょうがまえ', '門': 'もんがまえ'}.get(e) or (reading_name(e) if e in basic_upto(grade) else None)
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


# 小学生がよく聞く語（tools/kid_words.txt。手で選んだもの）。読みは JmdictFurigana の全語から取る。
KID = {}
for _line in open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kid_words.txt'), encoding='utf-8'):
    _p = _line.split()
    if _p and not _p[0].startswith('#'):
        KID[_p[0]] = _p[1:]
_need = {w for ws in KID.values() for w in ws}
FURI_ALL = {}
for line in open(os.path.join(DATA, 'JmdictFurigana.txt'), encoding='utf-8-sig'):
    parts = line.rstrip(chr(10)).split('|')
    if len(parts) == 3 and parts[0] in _need:
        segs, ok = {}, True
        for sg in parts[2].split(';'):
            if not sg:
                continue
            idx, rd = sg.split(':', 1)
            if '-' in idx:
                ok = False
                break
            segs[int(idx)] = rd
        if ok:
            lst = FURI_ALL.setdefault(parts[0], [])
            # 常用語の読みを先に（一日＝いちにち など）
            (lst.insert(0, (parts[1], segs)) if (parts[0], parts[1]) in COMMON else lst.append((parts[1], segs)))
for _t, _lst in FURI.items():
    if _t in _need and _t not in FURI_ALL:
        FURI_ALL[_t] = _lst
KID_MISSING = []
KID_AUTO = []
KID_OTHER = []


def title_furi(word, segs, ch):
    """タイトルの語：答えの字は読みを消し、訓で読むほかの字には読みを添える（シ合 → 合（あい））。"""
    for i, seg in enumerate(word):
        if seg[2]:
            seg[1] = None
        elif seg[0] in GRADE and not on_matches(segs.get(i, ''), readings(seg[0], 'ja_on')):
            seg[1] = segs.get(i)
    return word


def pick_kid(ch, grade):
    words = []
    for w in KID.get(ch, []):
        ents = [(r, sg) for r, sg in FURI_ALL.get(w, []) if w.index(ch) in sg] if ch in w else []
        if len(w) == 1 and ents:  # 一字の語（音＝おと／ね）は、語の中でよく使う読みを選ぶ
            nm, ons_ = reading_name(ch), readings(ch, 'ja_on')
            ents.sort(key=lambda e: (e[1][0] != nm, on_matches(e[1][0], ons_), -USE.get((ch, e[1][0]), 0)))
        ent = ents[0] if ents else None
        if ent is None:
            KID_MISSING.append(f'{ch}:{w}')
            continue
        words.append((w, ent[0], ent[1]))
    if not words:
        return None
    ons = readings(ch, 'ja_on')
    is_on = lambda x: len(x[0]) >= 2 and on_matches(x[2][x[0].index(ch)], ons)
    # 漢字だけの音の語を優先し、なければ かなを含む音の語（ご飯＝ごハン）
    tw = next((x for x in words if is_on(x) and all('一' <= c <= '鿿' for c in x[0])), None) or next((x for x in words if is_on(x)), None)
    # 訓は語の中から取る（音＝おと、省く＝はぶ_く）。答えの字が語の先頭で訓読みの語だけを見る。
    kun = None
    for w, r, sg in words:
        i = w.index(ch)
        if i == 0 and not on_matches(sg[i], ons) and all(not ('一' <= c <= '鿿') and c != '々' for c in w[1:]):
            kun = sg[i] + ('_' + w[1:] if len(w) > 1 else '')
            break
    if tw:
        title = {'word': title_furi(word_segments(tw[0], tw[2], ch, grade), tw[2], ch), 'on': hira_to_kata(tw[2][tw[0].index(ch)]), 'kun': kun}
        rest, n = [x for x in words if x is not tw], 2
    elif kun:
        title, rest, n = {'word': None, 'on': None, 'kun': kun}, words, 3
    else:
        tw = next((x for x in words if len(x[0]) >= 2), words[0])
        title = {'word': title_furi(word_segments(tw[0], tw[2], ch, grade), tw[2], ch), 'on': tw[2][tw[0].index(ch)], 'kun': None}
        rest, n = [x for x in words if x is not tw], 3
    # 読みがいろいろ見えるように：タイトルと違う読みの語を先に、同じ読みは後に（漁＝ギョ業 → 漁師 りょう）
    def rd_of(x):
        return x[2][x[0].index(ch)]
    tr = rd_of(tw) if tw else None
    usable = [x for x in rest if len(x[0]) >= 2]
    picked, seen_rd = [], {tr}
    for x in usable:
        if rd_of(x) not in seen_rd:
            picked.append(x); seen_rd.add(rd_of(x))
    for x in usable:
        if x not in picked:
            picked.append(x)
    picked = picked[:n]
    # 手で選んだ語の読みが一つだけの時は、ほかの読みのよく使う語を辞書から一つ足す
    all_rd = {rd_of(x) for x in words if len(x[0]) >= 2} | ({tr} if tr else set())
    if False and len(all_rd) <= 1:  # 自動で足すのはやめた（子ども向けでない語が混じる）。手で kid_words.txt に足す
        other = []
        for text, lst in FURI.items():
            if ch not in text or not (2 <= len(text) <= 3) or FREQ.get(text, 60) > 20:
                continue
            if any(GRADE.get(c, 9) > grade for c in text if c != ch and '一' <= c <= '鿿'):
                continue
            for reading, sg in lst:
                i = text.index(ch)
                if i in sg and sg[i] not in all_rd and not (sg[i][1:] == next(iter(all_rd or {''}))[1:]):
                    other.append((FREQ.get(text, 60), len(text), text, sg))
                    break
        if other:
            _, _, text, sg = sorted(other)[0]
            picked = picked[:max(0, n - 1)] + [(text, None, sg)]
            KID_OTHER.append(f'{ch}:{text}({sg[text.index(ch)]})')
    ex = [word_segments(w, sg, ch, grade) for w, r, sg in picked]
    # 足りない時は辞書から補う：よく使う語（頻度上位）で、ほかの字がその学年までに習う字だけのもの
    used = {w for w, _, _ in words}
    if len(ex) < 1:
        more = []
        for text, lst in FURI.items():
            if ch not in text or text in used or not (2 <= len(text) <= 4) or FREQ.get(text, 60) > 24:
                continue
            others = [c for c in text if c != ch and '一' <= c <= '鿿']
            if any(GRADE.get(c, 9) > grade for c in others):
                continue
            for reading, sg in lst:
                if text.index(ch) in sg:
                    more.append((FREQ.get(text, 60), len(text), text, sg))
                    break
        for _, _, text, sg in sorted(more)[:1]:
            ex.append(word_segments(text, sg, ch, grade))
            KID_AUTO.append(f'{ch}:{text}')
    return title, ex


def pick_words(ch, grade):
    if ch in KID:
        got = pick_kid(ch, grade)
        if got:
            return got
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
            if len(text) == 1:
                continue  # 一字だけの語（「□」だけ）は手がかりにならない
            lone = 0
            cands.append((above * 100 + FREQ.get(text, 60) + lone + len(text), len(text), text, reading, segs))
    cands.sort(key=lambda x: (x[0], x[1], x[2]))
    ons = readings(ch, 'ja_on')
    def all_on(c):
        """語のほかの字も音読みか（試合＝シ・あい より 試験＝シ・ケン。読み違えにくい）。"""
        return all(on_matches(c[4].get(i, ''), readings(x, 'ja_on')) for i, x in enumerate(c[2]) if x != ch)
    on_cands = [c for c in cands if len(c[2]) >= 2 and all('一' <= x <= '鿿' for x in c[2]) and on_matches(c[4][c[2].index(ch)], ons)]
    on_word = next((c for c in on_cands if all_on(c) and c[0] < 100), None) or next(iter(on_cands), None)
    kun_title = False
    if on_word is None:
        # 音の語がない字（熊・埼・岡…）：一番よく使う語をタイトルにし、その語の中の読みで示す（くま本 の くま）
        on_word = next((c for c in cands if len(c[2]) >= 2 and c[0] < 100), None)
        kun_title = on_word is not None and not on_matches(on_word[4][on_word[2].index(ch)], ons)
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
        'on': ((on_word[4][on_word[2].index(ch)] if kun_title else hira_to_kata(on_word[4][on_word[2].index(ch)]))
               if on_word else (ons[0] if ons else None)),
        'kun': kun[0].replace('.', '_') if kun else None,
    }
    if kun_title:
        seg = title['on']
        bases = [k.split('.')[0] for k in kun_list(ch)]
        base = next((b for b in bases if b == seg or (b[1:] == seg[1:] and unicodedata.normalize('NFD', seg[0])[0] == b[0])), seg)
        if title['kun']:
            # 訓の語しかない字（崎・届・皿）は、タイトルを訓だけにする（語例で使い方を見せる）
            if on_word[2] not in [''.join(x[0] for x in e) for e in ex]:
                ex = [word_segments(on_word[2], on_word[4], ch, grade)] + ex[:1]
            title['word'], title['on'] = None, None
        else:
            title['on'] = base  # 本ばこ → の はこ（語の中のにごりはタイトルの読みでは外す）
            title['wr'] = seg
    if title['word']:
        for i, seg in enumerate(title['word']):
            if seg[2]:
                seg[1] = None  # 答えの字は表示側でカタカナ（音）に置き換える
            elif seg[0] in GRADE and not on_matches(on_word[4].get(i, ''), readings(seg[0], 'ja_on')):
                seg[1] = on_word[4].get(i)  # 訓で読むほかの字には読みを添える（シ合 → シ合（あい））
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
        if ch in MANUAL:  # 字形データの記録が崩れている字は、画の形を見て手で決めた唱え
            item['u'] = [dict({'n': n, 's': ss}, **({'k': 1} if len(ss) <= 2 else {})) for n, ss in MANUAL[ch]]
            item['nd'] = 1  # ダミーの選択肢を出さない（ユーザー指示：飛）
            us = item['u']
        if ch in BASIC:
            pass  # 基本漢字も、ほかの字と同じように部品・画を唱えて組む（ユーザー指示。書き順だけ選ぶ形は意味が薄かった）
        elif any(u.get('z') for u in us):
            item['z'] = 1  # 公式資料にない画の名前が入る（出題しない）
        kanji.append(item)
        us = item['u']
        for u in us:
            if u['n'] not in parts:
                parts[u['n']] = dict({'d': [paths[i] for i in u['s']]}, **({'k': 1} if u.get('k') else {}))
                note = HEN_NOTE.get(NAME_SRC.get(u['n']))
                if note and note != u['n']:
                    parts[u['n']]['r'] = note
    # 教科書の順（あれば）：その順に並べ、回の名前を付ける（光村図書 4年）
    tb = {}
    for line in open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'textbook_order.txt'), encoding='utf-8'):
        p = line.split()
        if len(p) == 3 and p[0] == str(grade):
            for ch in p[2]:
                tb[ch] = (len(tb), p[1])
    extra = {}
    if tb:
        kanji.sort(key=lambda k: tb.get(k['c'], (9999, ''))[0])
        for k in kanji:
            if k['c'] in tb:
                k['ss'] = tb[k['c']][1]
        extra = {'book': '光村図書'}
    with open(os.path.join(OUT, f'g{grade}.json'), 'w', encoding='utf-8') as f:
        json.dump(dict({'grade': grade, 'kanji': kanji, 'parts': parts}, **extra), f, ensure_ascii=False, separators=(',', ':'))
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
report.append(f'ほかの読みとして辞書から足した語 {len(KID_OTHER)}：' + ' '.join(KID_OTHER))
report.append(f'辞書から補った語例 {len(KID_AUTO)}：' + ' '.join(KID_AUTO))
report.append(f'語例リストで辞書にない語 {len(KID_MISSING)}：' + ' '.join(KID_MISSING))
open(os.path.join(OUT, 'build_report.txt'), 'w', encoding='utf-8').write('\n'.join(report) + '\n')
print('\n'.join(report).encode('utf-8', 'replace').decode('utf-8'), file=open(os.devnull, 'w'))

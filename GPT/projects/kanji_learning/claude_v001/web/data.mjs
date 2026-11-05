// 部品の分け方・名前はミチムラ式の公開資料に合わせる（出典は ../design_log.md）。
// - 唱える順は書き順。位置の言葉（ひだりに等）は付けない。へんの位置は「〜へん」という名前自体が示す。
// - 部首は部首名（にんべん・さんずい・きへん…）。漢字の部品はその読み（訓を優先：おもい・ちから・たつ…）。
// - 習った漢字でも、成り立ちどおり基本の漢字に分けられるものは分ける（働＝にんべん・おもい・ちから。動はまとめない）。
// 公式カードで唱え方を確認できたのは CHANT_CHECKED の字だけ。他は上の規則からの推定。字源の説明ではない。
export const PARTS = {
  wood: ['木', 'きへん'], talent: ['才', 'さい'], public: ['公', 'こう'],
  every: ['毎', 'まい'], hand: ['扌', 'てへん'], axe: ['斤', 'おの'],
  water: ['氵', 'さんずい'], blue: ['青', 'あお'], person: ['亻', 'にんべん'],
  word: ['言', 'いう'], heavy: ['重', 'おもい'], power: ['力', 'ちから'], stand: ['立', 'たつ'],
  valley: ['谷', 'たに'], middle: ['中', 'なか'], fire: ['火', 'ひへん'],
  nail: ['丁', 'ちょう'], now: ['今', 'いま'], heart: ['心', 'こころ'],
};
export const LESSONS = [
  {char:'材', reading:'ざい', word:'材料', wordReading:'ざいりょう', sentence:'工作の［ざい］料をあつめる。', meaning:'ものを作る、もとになるもの。', parts:['wood','talent'], layout:'lr', mnemonic:'左に きへん、右に 才（さい）。', family:'木のなかま', tag:'つくる', color:'orange'},
  {char:'松', reading:'まつ', word:'松の木', wordReading:'まつのき', sentence:'庭に［まつ］の木がある。', meaning:'細い葉をもつ、冬も緑の木。', parts:['wood','public'], layout:'lr', mnemonic:'左に きへん、右に 公（こう）。', family:'木のなかま', tag:'しぜん', color:'green'},
  {char:'清', reading:'せい', word:'清流', wordReading:'せいりゅう', sentence:'すきとおった［せい］流をながめる。', meaning:'水などが、きれいにすんでいること。', parts:['water','blue'], layout:'lr', mnemonic:'左に さんずい、右に 青（あお）。', family:'水のなかま', tag:'しぜん', color:'blue'},
  {char:'梅', reading:'うめ', word:'梅の花', wordReading:'うめのはな', sentence:'春に［うめ］の花がさく。', meaning:'春に花がさき、実は梅ぼしになる木。', parts:['wood','every'], layout:'lr', mnemonic:'左に きへん、右に 毎（まい）。', family:'木のなかま', tag:'しぜん', color:'pink'},
  {char:'折', reading:'お', word:'折り紙', wordReading:'おりがみ', sentence:'紙を半分に［お］る。', meaning:'曲げたり、たたんだりすること。', parts:['hand','axe'], layout:'lr', mnemonic:'てへん、おの。', family:'手のなかま', tag:'つくる', color:'orange'},
  {char:'信', reading:'しん', word:'信用', wordReading:'しんよう', sentence:'友だちを［しん］用する。', meaning:'本当だと思って、たよりにすること。', parts:['person','word'], layout:'lr', mnemonic:'左に にんべん、右に 言（いう）。', family:'人のなかま', tag:'くらし', color:'blue'},
  {char:'働', reading:'はたら', word:'働く', wordReading:'はたらく', sentence:'お店で［はたら］く。', meaning:'仕事をしたり、力をつかったりすること。', parts:['person','heavy','power'], split:[2,9,2], layout:'lr', mnemonic:'にんべん、おもい、ちから。', family:'人のなかま', tag:'くらし', color:'orange'},
  {char:'泣', reading:'な', word:'泣く', wordReading:'なく', sentence:'かなしくて［な］く。', meaning:'なみだを流すこと。', parts:['water','stand'], layout:'lr', mnemonic:'左に さんずい、右に 立（たつ）。', family:'水のなかま', tag:'きもち', color:'blue'},
  {char:'浴', reading:'あ', word:'浴びる', wordReading:'あびる', sentence:'シャワーを［あ］びる。', meaning:'水や光などを、体に受けること。', parts:['water','valley'], layout:'lr', mnemonic:'左に さんずい、右に 谷（たに）。', family:'水のなかま', tag:'くらし', color:'blue'},
  {char:'仲', reading:'なか', word:'仲間', wordReading:'なかま', sentence:'［なか］間といっしょに遊ぶ。', meaning:'いっしょに何かをする人とのつながり。', parts:['person','middle'], layout:'lr', mnemonic:'左に にんべん、右に 中（なか）。', family:'人のなかま', tag:'くらし', color:'green'},
  {char:'灯', reading:'とう', word:'点灯', wordReading:'てんとう', sentence:'あかりを点［とう］する。', meaning:'あたりを明るくする、あかり。', parts:['fire','nail'], layout:'lr', mnemonic:'左に ひへん、右に 丁（ちょう）。', family:'火のなかま', tag:'くらし', color:'orange'},
  {char:'念', reading:'ねん', word:'念願', wordReading:'ねんがん', sentence:'［ねん］願の自転車を手に入れた。', meaning:'心の中で、強く思うこと。', parts:['now','heart'], layout:'tb', mnemonic:'上に 今（いま）、下に 心（こころ）。', family:'心のなかま', tag:'きもち', color:'pink'},
];
// 公式カードの画像で唱え方を確かめた字（kanji.cloud「ミチムラ式漢字カードの説明と使い方」掲載の4年生146）。
export const CHANT_CHECKED = {'働': 'にんべん（亻）、おもい（重）、ちから（力）'};
export const BY_CHAR = Object.fromEntries(LESSONS.map(l=>[l.char,l]));

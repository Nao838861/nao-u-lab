// 史実シナリオ：武将の判断ルール＋イベント（解説カード）＋もしも（if）
import { setOrder, rout, isBroken } from './sim.js';

const H = (h, m = 0) => h * 3600 + m * 60;

// 部隊ごとの能力（q=戦闘力倍率, fort=陣地の守りの堅さ, morale=初期士気, msens=損害に対する士気の脆さ, retreat=敗走先）
export const PARAMS = {
  ishida: { fixedHQ: true, q: 1.25, fort: 2.2, homeR: 400, msens: 0.7, retreat: [136.4579, 35.3740] },
  sakon: { q: 1.4, fort: 1.8, msens: 0.6, retreat: [136.4470, 35.3890] },
  gamo: { q: 1.2, fort: 2.8, msens: 0.9, noRout: true, retreat: [136.4470, 35.3890] },
  shimazu: { q: 2.2, fort: 1.8, morale: 0.95, msens: 0.5, noRout: true },
  toyohisa: { q: 2.0, fort: 1.8, morale: 0.95, msens: 0.5, noRout: true },
  konishi: { q: 0.8, fort: 1.9, homeR: 400, morale: 0.82, msens: 1.1, retreat: [136.4400, 35.3850] },
  ukita: { q: 1.0, fort: 1.3, msens: 1.3, retreat: [136.4320, 35.3690] },
  otani: { q: 1.7, fort: 1.4, morale: 0.95, retreat: [136.4320, 35.3580] },
  otani2: { q: 1.3, fort: 1.3, retreat: [136.4320, 35.3620] },
  hiratsuka: { q: 1.6, fort: 1.3, morale: 0.95, retreat: [136.4320, 35.3580] },
  kobayakawa: { q: 0.65, morale: 0.8 },
  wakisaka: { q: 0.9 }, kutsuki: { q: 0.9 }, ogawa: { q: 0.9 }, akaza: { q: 0.9 },
  mori: { retreat: [136.5440, 35.3350] }, kikkawa: { retreat: [136.5440, 35.3350] }, ankokuji: { retreat: [136.5440, 35.3350] },
  natsuka: { retreat: [136.5440, 35.3350] }, chosokabe: { retreat: [136.5440, 35.3330] },
  ieyasu: { q: 1.0, fort: 1.2, morale: 0.95 },
  fukushima: { q: 1.2 }, ii: { q: 1.3, speed: 1.0 }, tadayoshi: { q: 1.0 }, honda: { q: 1.6, speed: 1.1 },
  kuroda: { q: 1.2 }, hosokawa: { q: 1.1 }, kato: { q: 1.1 }, todo: { q: 1.1 }, kyogoku: { q: 1.0 },
};

// もしも（if）の選択肢。先頭が通説。3つ目の要素で分類する: 'alt'＝異説（史料の読み方の違い。起きたことは同じ）。
// 分類なし（通説以外）＝もしも（起きたことそのものを変える）。画面ではこの2つを分けて並べる
export const OPTIONS = [
  { id: 'kobaya', label: '小早川秀秋', choices: [['history', '正午、問鉄砲を受けて寝返る'], ['early', '開戦まもなく寝返る（白峰旬らの説）', 'alt'], ['neutral', '最後まで松尾山で傍観'], ['west', '西軍として東軍に攻めかかる']] },
  { id: 'four', label: '脇坂ら4隊', choices: [['history', '小早川に続いて寝返る'], ['loyal', '西軍に留まり大谷隊を助ける']] },
  { id: 'kikkawa', label: '吉川広家', choices: [['history', '道を塞ぎ、南宮山の毛利勢は動かず'], ['open', '道を開け、毛利勢が家康の背後を突く']] },
  { id: 'shimazu', label: '島津義弘', choices: [['history', '要請を断り孤高、最後に敵中突破'], ['fight', '三成の要請に応じて参戦']] },
  { id: 'open', label: '開戦', choices: [['history', '井伊直政・松平忠吉の抜け駆け'], ['fukushima', '先鋒・福島正則が一番に攻める']] },
];
export const DEFAULT_OPTS = Object.fromEntries(OPTIONS.map((o) => [o.id, 'history']));

// ── イベント（解説カード）。tag: 史実＝諸史料が一致 / 通説＝広く流布するが史料的検討の余地 / 逸話＝後世の軍記・伝承 / 異説 / うんちく / もしも
export const EVENTS = {
  intro: { map: 'intro', title: '関ヶ原、夜明け', tag: 'うんちく', cam: 'overview',
    body: '慶長5年9月15日（1600年10月21日）。関ヶ原は今の岐阜県の西端、琵琶湖の東にある。前夜、西軍は大垣城を出て関ヶ原へ移った。東軍も赤坂から西へ進み、夜明けの盆地で両軍が向かい合う。' },
  fuwa: { map: 'fuwa', title: 'なぜ関ヶ原なのか', tag: 'うんちく', cam: 'top',
    body: '関ヶ原は三つの街道が交わる交通の要。古代には不破関が置かれ、壬申の乱の戦場にもなった。家康が陣を置いた桃配山は、大海人皇子が兵に桃を配ったという伝説の地だ。' },
  hidetada: { map: 'hidetada', title: '来ない3万8千', tag: '史実', cam: 'east', focus: ['ieyasu'],
    body: '徳川の主力3万8千を率いる秀忠は、信濃の上田城で真田昌幸に足止めされ、この日に間に合わなかった。家康のまわりにいるのは、豊臣恩顧の大名たちが中心だ。' },
  otsu: { map: 'otsu', title: 'もう一つの戦場、大津城', tag: '史実',
    body: '同じ頃、近江の大津城では京極高次が籠城し、立花宗茂ら西軍の精鋭1万以上を引きつけていた。彼らもまた、関ヶ原には来られなかった。' },
  fog: { title: '霧が晴れはじめる', tag: '通説', cam: 'overview',
    body: '午前8時頃、霧が薄れはじめる。100m先も見えない霧の中で、両軍は息をひそめて互いを探り合っていた。' },
  nukegake: { title: '先陣は誰か——井伊直政の抜け駆け', tag: '通説', focus: ['ii', 'tadayoshi'], slow: true,
    body: '先鋒は福島正則のはずだった。だが井伊直政は、家康の四男・松平忠吉を連れて福島隊の脇をすり抜け、「物見だ」と言い張って宇喜多隊に鉄砲を撃ちかけた。徳川の手で口火を切るための抜け駆けだった。' },
  fukushima_first: { title: 'もしも：福島正則が先陣', tag: 'もしも', focus: ['fukushima'], body: '予定どおり先鋒の福島正則が、一番に宇喜多隊へ攻めかかる。' },
  fukushima_clash: { title: '福島正則 vs 宇喜多秀家', tag: '通説', focus: ['fukushima', 'ukita'], slow: true,
    body: '先を越された福島隊が、宇喜多隊へ猛然と襲いかかる。宇喜多の先鋒・明石全登も一歩も引かず、福島隊の旗は何度も押し戻された。' },
  ishida_attack: { title: '石田隊へ殺到する東軍', tag: '通説', focus: ['ishida', 'kuroda', 'hosokawa'], slow: true,
    body: '黒田・細川・加藤・田中らが、三成の笹尾山へ殺到する。三成を憎む豊臣恩顧の大名たちだ。前衛の島左近・蒲生郷舎が柵を盾に迎え撃つ。' },
  otani_front: { title: '藤堂・京極 vs 大谷隊', tag: '通説', focus: ['todo', 'kyogoku', 'otani2'],
    body: '藤堂高虎・京極高知が大谷隊に攻めかかる。南西の松尾山では、小早川の1万5千がまだ動かない。' },
  gamo_merge: { title: '蒲生郷舎、石田本隊へ退く', tag: '戦況', focus: ['gamo', 'ishida'], slow: true,
    body: '猛攻を受け続けた蒲生郷舎の前衛は、兵の多くを失い、笹尾山の三成本隊へ退いた。' },
  ishida_fence: { title: '笹尾山の二重の柵', tag: '通説', focus: ['ishida', 'sakon', 'kuroda'], slow: true,
    body: '笹尾山の斜面には竹の柵が二重に結われ、その内側から鉄砲が火を噴く。石田隊約6千に対し、攻め手は2万近い。頼みは柵と高所だ。' },
  sakon_voice: { title: '鬼左近の「かかれ」', tag: '逸話', focus: ['sakon'],
    body: '島左近は柵の外へ打って出ては敵を押し返した。「かかれ、かかれ」という大音声は、戦のあと何年も黒田家の兵の夢に出て、彼らをうなされさせたという。' },
  ishida_hold: { title: '持ちこたえる石田隊', tag: 'うんちく', focus: ['ishida'],
    body: '東軍の攻撃が集中しても、石田隊は崩れない。正面が持ちこたえるうちに、松尾山と南宮山の味方が敵の側面と背後を突けば勝てる。午前の戦いは、むしろ西軍が押していた。' },
  ishida_hold_early: { title: '持ちこたえる石田隊', tag: '異説', focus: ['ishida'],
    body: '石田隊はまだ持ちこたえている。だが朝のうちに小早川が寝返り、南西の大谷隊はすでに崩れた。三成に残る望みは、南宮山の毛利勢と島津だけだ。' },
  ieyasu_reserve: { title: '家康本陣は戦わない', tag: '通説', focus: ['ieyasu'],
    body: '家康直属の3万は、この日ほとんど戦っていない。血を流したのは福島・黒田ら豊臣恩顧の大名たちだった。徳川の兵を温存し、彼らに手柄を立てさせて味方に縛りつけたともいわれる。' },
  ishida_isolated: { title: '孤立する笹尾山', tag: '通説', focus: ['ishida'], slow: true,
    body: '小西・宇喜多の両隊が崩れ、笹尾山の南に並んでいた味方の陣が空いた。三成の馬印はまだ笹尾山にある。東軍と向き合う石田隊を支える味方は、もう少ない。' },
  sakon_last: { title: '島左近の最期', tag: '逸話', focus: ['ishida'],
    body: '島左近の最期ははっきりしない。最後に再び打って出て討ち死にしたとも、落ち延びたとも伝わる。遺体は見つからず、各地に「左近の墓」が残る。' },
  breakout_ieyasu: { title: '家康本陣の目の前を', tag: '通説', focus: ['shimazu', 'ieyasu'], slow: true,
    body: '島津勢は家康本陣の目の前をかすめて駆け抜けた。3万の本陣は動かない。勝ちが決まった後で、死に物狂いの島津とぶつかるのを避けたのだろう。' },
  epi_capture: { title: 'その後①：三成、捕らわる', tag: '史実', focus: ['ishida'], slow: true,
    body: '伊吹山中へ逃れた三成は、6日後、近江の古橋村の山中で捕らえられた。腹をこわし、すっかり弱っていたという。' },
  epi_gate: { title: 'その後②：大津城の門前で', tag: '逸話', focus: ['ishida'], slow: true,
    body: '大津城の門前に晒された三成を、福島正則が「そのざまは何だ」と罵った。三成は「そなたを生け捕りにできなかったのが残念だ」と言い返したという。黒田長政は馬を下り、自分の羽織を着せかけた。' },
  epi_kaki: { title: 'その後③：干し柿の逸話', tag: '逸話', focus: ['ishida'], slow: true,
    body: '処刑場へ向かう途中、三成は湯を所望した。代わりに出された干し柿を「痰の毒だ」と断り、「これから死ぬ者が毒を気にするのか」と笑われると、「大志ある者は最期まで命を惜しむものだ」と答えたという。' },
  epi_execution: { title: 'その後④：六条河原', tag: '史実', focus: ['ishida'], slow: true,
    body: '10月1日、三成は小西行長・安国寺恵瓊とともに京の六条河原で斬られた。41歳。居城の佐和山城は、すでに小早川らに落とされていた。' },
  sakon: { title: '島左近、撃たれる', tag: '通説', focus: ['sakon', 'kuroda'], slow: true,
    body: '黒田隊は鉄砲隊を側面の丘に回し、島左近を横から撃たせた。左近は深手を負い、柵の内へ運ばれた。' },
  taiho: { title: '石田隊の大筒', tag: '通説', focus: ['ishida'],
    body: '石田隊が大筒（大砲）を撃ち放つ。笹尾山の前は硝煙に包まれた。' },
  noroshi: { title: '狼煙、上がる', tag: '通説', focus: ['ishida', 'kobayakawa', 'mori'], cam: 'overview', slow: true,
    body: '三成は笹尾山から狼煙を上げ、松尾山の小早川と南宮山の毛利勢に合図を送った。いま動けば挟み撃ちで勝てる。だが、どちらも動かない。' },
  // 「もしも」で条件を変えた回の狼煙。その回の展開と矛盾しない文面にする
  noroshi_early: { title: '狼煙、上がる', tag: '異説', focus: ['ishida', 'mori'], cam: 'overview', slow: true,
    body: '三成は狼煙を上げ、南宮山の毛利勢に合図を送った。松尾山の小早川は、すでに敵に回っている。頼みの毛利勢も、動かない。' },
  noroshi_open: { title: '狼煙、上がる', tag: 'もしも', focus: ['ishida', 'kobayakawa', 'mori'], cam: 'overview', slow: true,
    body: '三成は狼煙を上げ、松尾山と南宮山に合図を送った。松尾山は動かない。だが南宮山では、毛利勢が山を下る支度を始めた。' },
  noroshi_early_open: { title: '狼煙、上がる', tag: 'もしも', focus: ['ishida', 'mori'], cam: 'overview', slow: true,
    body: '三成は狼煙を上げ、南宮山の毛利勢に合図を送った。小早川はすでに敵に回ったが、南宮山では毛利勢が山を下る支度を始めた。' },
  bento: { title: '宰相殿の空弁当', tag: '逸話', focus: ['mori', 'kikkawa'], slow: true,
    body: '南宮山の毛利秀元は、前に陣取る吉川広家が動かないため山を下りられない。吉川はひそかに東軍と通じていたのだ。催促の使者に、秀元は「いま兵に弁当を食べさせている」と答えるしかなかった。世にいう「宰相殿の空弁当」である。' },
  mori_descend: { title: 'もしも：毛利勢、下山', tag: 'もしも', focus: ['mori', 'kikkawa', 'ikeda', 'asano'], slow: true,
    body: '吉川広家が道を開けた。南宮山の毛利秀元・長宗我部盛親ら2万8千が山を下り、家康の背後を押さえる池田輝政・浅野幸長らに襲いかかる。' },
  shimazu_envoy: { title: '島津、動かず', tag: '逸話', focus: ['shimazu'], slow: true,
    body: '三成の使者が馬上から加勢を求めると、島津勢は「無礼者」と怒鳴り返した。島津豊久は「今日はそれぞれが自分の戦をするまで」と突き放す。' },
  mitsunari_visit: { title: '三成みずから島津陣へ', tag: '逸話', focus: ['shimazu', 'ishida'],
    body: '三成が自ら島津義弘の陣へ出向き、出陣を頼んだという逸話がある。義弘は応じなかった。画面の馬印は笹尾山に残る石田本隊を示す。' },
  shimazu_join: { title: 'もしも：島津、参戦', tag: 'もしも', focus: ['shimazu', 'toyohisa'], slow: true,
    body: '島津義弘が三成の要請に応じた。「鬼島津」の精兵が正面の東軍に斬り込む。' },
  ieyasu_move: { title: '家康、本陣を前へ', tag: '通説', focus: ['ieyasu'],
    body: '戦が膠着するなか、家康は桃配山から陣場野へ本陣を進め、諸隊を励ました。' },
  tsume: { title: '爪を噛む家康', tag: '逸話', focus: ['ieyasu', 'kobayakawa'],
    body: '寝返るはずの小早川が、なかなか動かない。苛立った家康は爪を噛みながら「せがれめに謀られたか」とつぶやいたという。' },
  toi_deppo: { title: '問鉄砲', tag: '通説', focus: ['kobayakawa', 'ieyasu'], slow: true, cam: 'matsuo',
    body: '業を煮やした家康は、松尾山へ鉄砲を撃ちかけさせ、秀秋に決断を迫った。世にいう「問鉄砲」だ。後世の作り話だとする説もある。' },
  kobaya_betray: { title: '小早川秀秋、寝返る', tag: '通説', focus: ['kobayakawa', 'hiratsuka', 'otani'], slow: true, cam: 'matsuo',
    body: '松尾山の小早川勢1万5千が山を駆け下り、大谷隊へ襲いかかった。勝敗の天秤が、大きく傾く。' },
  kobaya_early: { title: '異説：開戦まもなく小早川が寝返る', tag: '異説', focus: ['kobayakawa', 'otani'], slow: true, cam: 'matsuo',
    body: '小早川は開戦まもなく山を下り、西軍に襲いかかった。問鉄砲はなかったとする説にもとづく展開で、戦いは早く決着に向かう。' },
  kobaya_neutral: { title: 'もしも：小早川、動かず', tag: 'もしも', focus: ['kobayakawa'], slow: true, cam: 'matsuo',
    body: '問鉄砲にも秀秋は動かない。松尾山の1万5千は最後まで傍観を決めこむ。' },
  kobaya_west: { title: 'もしも：小早川、東軍を攻める', tag: 'もしも', focus: ['kobayakawa', 'todo'], slow: true, cam: 'matsuo',
    body: '秀秋は西軍として松尾山を下り、藤堂・京極隊の側面に襲いかかった。' },
  otani_push: { title: '大谷吉継、裏切りを撃退', tag: '通説', focus: ['otani', 'hiratsuka', 'kobayakawa'], slow: true,
    body: '小早川の裏切りを読んでいた吉継は、備えの兵でこれを迎え撃ち、何度も押し返した。数では大きく劣りながらの奮戦だった。' },
  four_betray: { title: '脇坂・朽木・小川・赤座も寝返る', tag: '通説', focus: ['wakisaka', 'ogawa', 'otani'], slow: true,
    body: '大谷隊の脇を固めていた脇坂・朽木・小川・赤座の4隊までが寝返り、大谷隊に襲いかかる。挟まれた大谷隊は、もう支えきれない。' },
  four_loyal: { title: 'もしも：4隊は踏みとどまる', tag: 'もしも', focus: ['wakisaka', 'otani'], body: '脇坂ら4隊は寝返らず、大谷隊とともに小早川勢を迎え撃つ。' },
  hiratsuka_die: { title: '平塚為広・戸田勝成、討死', tag: '通説', focus: ['hiratsuka'],
    body: '大谷隊とともに戦った平塚為広・戸田勝成が討死した。為広は討ち取った敵の首に辞世の歌を添えて、吉継に送ったという。' },
  yoshitsugu: { title: '大谷吉継、自害', tag: '通説', focus: ['otani'], slow: true,
    body: '隊の崩壊を見て、吉継は自害した。家臣の湯浅五助は主の首を敵に渡さぬよう埋め、自らも討たれた。首の在処は、ついに明かされなかった。' },
  konishi_flee: { title: '小西隊、崩れる', tag: '通説', focus: ['konishi'],
    body: '大谷隊が崩れて側面が開き、小西隊も崩れた。行長は伊吹山中へ逃れたが、のちに捕らえられる。' },
  ukita_flee: { title: '宇喜多隊、総崩れ', tag: '通説', focus: ['ukita'], slow: true,
    body: '西軍最大の宇喜多隊も崩れた。秀家は「金吾（秀秋）めを斬る」と小早川勢へ突っ込もうとして、家臣に止められた。のちに八丈島へ流され、そこで長い余生を送る。' },
  mitsunari_flee: { title: '石田隊が崩れ、三成が笹尾山を離れる', tag: '通説', focus: ['ishida'], slow: true,
    body: '石田隊が崩れ、三成は笹尾山を離れた。ここからは一隊としての足取りを追えない。画面では本陣の北で隊の表示が消える。その後、三成は伊吹山方面に逃れたと伝わる。' },
  shimazu_shoot: { title: '味方であっても撃つ', tag: '逸話', focus: ['shimazu'], slow: true,
    body: '崩れた西軍の兵が島津の陣へ逃げ込もうとする。島津勢は陣が乱れるのを嫌い、味方であろうと容赦なく撃ちかけた。' },
  shimazu_alone: { title: '取り残された島津', tag: '逸話', focus: ['shimazu', 'toyohisa'], slow: true,
    body: '西軍は総崩れになり、戦場に残る西軍は島津の1,500だけになった。まわりは勝ちに沸く東軍7万。66歳の義弘は家康の本陣へ斬り込んで死ぬつもりだったが、甥の豊久が「生きて薩摩へ帰られよ」と止めたという。' },
  pursuit: { title: '追手、迫る', tag: '通説', focus: ['honda', 'tadayoshi', 'ii', 'shimazu'], slow: true,
    body: '井伊直政・松平忠吉・本多忠勝が馬を飛ばして追う。狙うは義弘の首。勝負の決まった戦場に残った、最後の大手柄だ。' },
  sute_again: { title: 'また一組、残る', tag: '通説', focus: ['shimazu'], slow: true,
    body: '追手が追いつくたびに、次の組が道に座りこむ。追う側は進むほどに、先頭を駆ける大将が撃たれていく。' },
  toyohisa_stand: { title: '豊久、踏みとどまる', tag: '通説', focus: ['toyohisa', 'shimazu'], slow: true,
    body: '追手がまた迫る。甥の豊久は手勢とともに道に踏みとどまり、追手の前に立ちふさがった。伯父を逃がすための、最後の大きな捨て奸だった。' },
  shimazu_legacy: { title: '前へ逃げた島津、その後', tag: 'うんちく', focus: ['shimazu'], slow: true,
    body: '敵に背を見せず、前へ逃げた島津に家康は手を焼いた。島津家は領地を守り抜き、260年後、その薩摩が徳川の幕府を倒す。鹿児島では今も、鎧姿でこの日を偲んで歩く「妙円寺詣り」が続いている。' },
  breakout: { title: '島津の退き口——前へ退く', tag: '通説', focus: ['shimazu', 'toyohisa', 'ieyasu'], slow: true,
    body: '義弘が選んだ退路は、後ろの伊吹山ではなく前だった。山へ逃げれば、逃げ惑う味方と追う敵に呑まれて全滅する。勝ちに浮かれた敵のど真ん中を突き抜け、伊勢街道から薩摩を目指す。' },
  sutegamari: { title: '捨て奸（すてがまり）', tag: '通説', focus: ['sute1', 'shimazu'], slow: true,
    body: '追手が迫ると、島津は数人から数十人をその場に残す。残った兵は座り込んで鉄砲を構え、馬上の大将を狙い撃つ。生きて帰る望みはない。全滅するまで撃ち続け、そのあいだに本隊が逃げる。これが「捨て奸」だ。' },
  ii_wound: { title: '井伊直政、撃たれる', tag: '通説', focus: ['ii'], slow: true,
    body: '捨て奸の一発が、先頭を駆ける井伊直政を撃ち抜いた。直政は落馬し、この傷がもとで2年後に世を去る。' },
  honda_fall: { title: '本多忠勝、落馬', tag: '逸話', focus: ['honda'], slow: true,
    body: '本多忠勝の馬が撃たれ、忠勝は地面に投げ出された。生涯の戦で傷一つ負わなかったと伝わる猛将も、ここで足が止まる。' },
  toyohisa_die: { title: '島津豊久、討死', tag: '通説', focus: ['toyohisa'], slow: true,
    body: '豊久は烏頭坂のあたりで討たれた。31歳。' },
  chojuin: { title: '長寿院盛淳、身代わりに', tag: '通説', focus: ['shimazu'], slow: true,
    body: '家老の長寿院盛淳は、義弘の陣羽織をまとって「我こそ島津兵庫頭」と名乗り、追手を引きつけて討死した。' },
  shimazu_escape: { title: '島津義弘、逃げ切る', tag: '通説', focus: ['shimazu'], slow: true,
    body: '追手を振り切った義弘は、伊勢から大坂を経て、海路で薩摩へ帰り着いた。関ヶ原に入った約1,500のうち、帰れたのは80余人だったという。' },
  nangu_withdraw: { title: '南宮山の諸隊、戦わずに退く', tag: '史実', focus: ['mori', 'chosokabe'], cam: 'nangu',
    body: '南宮山の毛利秀元らは、一戦も交えずに退いた。吉川の内通で守ったはずの毛利家は、戦後に120万石から約30万石へ減らされる。' },
  east_win: { title: '東軍の勝利', tag: '史実', cam: 'overview', slow: true,
    body: '西軍の主力が崩れ、天下分け目の戦いは東軍の勝利に終わった。勝負は、わずか半日で決した。' },
  west_win: { title: 'もしも：西軍の勝利', tag: 'もしも', cam: 'overview', slow: true, body: '東軍が崩れた。歴史は別の道を歩みはじめる。' },
  draw: { title: '日没——決着つかず', tag: 'もしも', cam: 'overview', slow: true, body: '日が暮れ、両軍は兵を収めた。勝敗は翌日以降に持ち越される。' },
  kubi: { title: '勝って兜の緒を締めよ', tag: '逸話', focus: ['ieyasu'], slow: true,
    body: '戦いのあと、家康は首実検の場で初めて兜をかぶり、緒を締めながら「勝って兜の緒を締めよ」と言ったという。' },
};

// 敗走メッセージ（固有イベントのない部隊用）
export function routText(S, e) {
  const u = S.byId[e.unit];
  const by = (e.by || []).slice(0, 4).join('・');
  const cause = e.why === 'loss' ? '兵の多くを失い' : e.why === 'collapse' ? '味方の総崩れに巻き込まれ' : '士気が持たずに';
  const dir = u.origSide === 'W' ? (u.retreat ? '後方の山へ' : '西へ') : '東へ';
  return { title: `${u.name}隊、崩れる`, tag: '戦況', focus: [u.id], slow: true, pause: true,
    body: `${by ? by + 'の攻撃を受けて、' : ''}${u.name}隊が${cause}崩れた。残る約${Math.round(u.n).toLocaleString()}人が${dir}退いていく（死傷 約${Math.round(u.killed).toLocaleString()}人）。` };
}

// ── 判断ルール ──
export function makeBrain(opts = DEFAULT_OPTS) {
  const O = { ...DEFAULT_OPTS, ...opts };
  const rules = [];
  const at = (t, id, fn) => rules.push({ id, when: (S) => S.t >= t, fn });
  const when = (id, cond, fn) => rules.push({ id, when: cond, fn });
  const attack = (S, id, target) => setOrder(S, id, { type: 'attack', target });
  const U = (S, id) => S.byId[id];
  const broken = (S, ...ids) => ids.every((id) => isBroken(S.byId[id]));
  const near = (S, a, b, d) => Math.hypot(U(S, a).x - U(S, b).x, U(S, a).z - U(S, b).z) < d;

  at(H(7, 30), 'intro', (S) => S.emit('intro'));
  at(H(7, 36), 'fuwa', (S) => S.emit('fuwa'));
  at(H(7, 43), 'hidetada', (S) => S.emit('hidetada'));
  at(H(7, 50), 'otsu', (S) => S.emit('otsu'));
  at(H(7, 56), 'fog', (S) => S.emit('fog'));
  // 島津は最初から孤高
  at(H(7, 30), 'shimazu_stance', (S) => {
    if (O.shimazu === 'history') { setOrder(S, 'shimazu', { type: 'aloof' }); setOrder(S, 'toyohisa', { type: 'aloof' }); }
  });
  // 開戦
  at(H(8, 0), 'open', (S) => {
    if (O.open === 'history') { attack(S, 'ii', 'ukita'); attack(S, 'tadayoshi', 'ukita'); S.emit('nukegake'); }
    else { attack(S, 'fukushima', 'ukita'); S.emit('fukushima_first'); }
  });
  at(H(8, 6), 'fukushima', (S) => {
    attack(S, 'fukushima', 'ukita');
    if (O.open === 'history') S.emit('fukushima_clash');
    else { attack(S, 'ii', 'ukita'); attack(S, 'tadayoshi', 'ukita'); }
  });
  at(H(8, 12), 'ishida_attack', (S) => {
    attack(S, 'kuroda', 'sakon'); attack(S, 'takenaka', 'sakon'); attack(S, 'hosokawa', 'gamo');
    attack(S, 'kato', 'ishida'); attack(S, 'tanaka', 'ishida'); attack(S, 'kanamori', 'gamo');
    S.emit('ishida_attack');
  });
  at(H(8, 18), 'otani_front', (S) => {
    attack(S, 'todo', 'otani2'); attack(S, 'kyogoku', 'otani2'); attack(S, 'terazawa', 'ukita');
    attack(S, 'tsutsui', 'konishi'); attack(S, 'oda', 'konishi'); attack(S, 'furuta', 'konishi'); attack(S, 'ikoma', 'konishi');
    S.emit('otani_front');
  });
  at(H(8, 35), 'ishida_fence', (S) => S.emit('ishida_fence'));
  when('sakon_voice', (S) => S.t >= H(9, 15) && !isBroken(U(S, 'sakon')) && U(S, 'sakon').fighting, (S) => S.emit('sakon_voice'));
  at(H(10, 25), 'ishida_hold', (S) => { if (!isBroken(U(S, 'ishida'))) S.emit(O.kobaya === 'early' ? 'ishida_hold_early' : 'ishida_hold'); });
  when('ieyasu_reserve', (S) => S.t >= H(12, 50) && !isBroken(U(S, 'ieyasu')), (S) => S.emit('ieyasu_reserve'));
  when('ishida_isolated', (S) => isBroken(U(S, 'ukita')) && isBroken(U(S, 'konishi')) && !isBroken(U(S, 'ishida')), (S) => {
    // 両隣の戦線がなくなれば、正面を固めた陣の防御補正を解く。
    U(S, 'ishida').fort = 1;
    S.emit('ishida_isolated');
  });
  when('sakon_last', (S) => S.fired.has('mitsunari_flee') && S.t >= (S.flags.sakonLastAt ||= S.t + 150), (S) => S.emit('sakon_last'));
  when('breakout_ieyasu', (S) => U(S, 'shimazu').order.type === 'path' && Math.hypot(U(S, 'shimazu').x - U(S, 'ieyasu').x, U(S, 'shimazu').z - U(S, 'ieyasu').z) < 520, (S) => S.emit('breakout_ieyasu'));
  when('sakon', (S) => S.t >= H(9, 50) && U(S, 'sakon').fighting && !isBroken(U(S, 'sakon')), (S) => {
    const u = U(S, 'sakon'); u.morale -= 0.35; u.q *= 0.6; S.emit('sakon');
  });
  at(H(10, 12), 'taiho', (S) => { S.flags.cannon = S.t; S.emit('taiho'); });
  at(H(10, 40), 'noroshi', (S) => {
    S.flags.noroshi = S.t;
    const early = O.kobaya === 'early', open = O.kikkawa === 'open';
    S.emit(early && open ? 'noroshi_early_open' : early ? 'noroshi_early' : open ? 'noroshi_open' : 'noroshi');
  });
  at(H(11, 0), 'mori', (S) => {
    if (O.kikkawa === 'history') S.emit('bento');
    else {
      for (const id of ['kikkawa', 'mori', 'ankokuji', 'natsuka', 'chosokabe']) setOrder(S, id, { type: 'hold' });
      attack(S, 'kikkawa', 'yamauchi'); attack(S, 'mori', 'ikeda'); attack(S, 'ankokuji', 'asano');
      attack(S, 'natsuka', 'asano'); attack(S, 'chosokabe', 'asano');
      attack(S, 'ikeda', 'mori'); attack(S, 'asano', 'ankokuji'); attack(S, 'yamauchi', 'kikkawa'); attack(S, 'arima', 'kikkawa');
      S.emit('mori_descend');
    }
  });
  at(H(11, 15), 'envoy', (S) => {
    if (O.shimazu === 'history') S.emit('shimazu_envoy');
    else { attack(S, 'shimazu', 'ii'); attack(S, 'toyohisa', 'tadayoshi'); S.emit('shimazu_join'); }
  });
  at(H(11, 30), 'ieyasu_move', (S) => {
    // 床几場（最後陣跡 136.465098, 35.365809）を隊の前面に置き、3万の兵はその後ろ（東）に広がるよう中心を東北東へずらす
    const [x, z] = S.xz(136.4690, 35.3668);
    setOrder(S, 'ieyasu', { type: 'move', x, z }); U(S, 'ieyasu').speed = 0.7; S.emit('ieyasu_move');
  });
  at(H(11, 37), 'mitsunari_visit', (S) => { if (O.shimazu === 'history') S.emit('mitsunari_visit'); });
  at(H(11, 48), 'tsume', (S) => { if (O.kobaya === 'history' || O.kobaya === 'neutral') S.emit('tsume'); });
  // 小早川
  const betray = (S) => {
    const k = U(S, 'kobayakawa'); k.side = 'E'; k.speed = 1.1;
    // 松尾山を下った本隊は大谷方面で戦う。四隊が西軍に残る分岐ではその反撃にも応じる。
    setOrder(S, k.id, { type: 'attack', target: 'hiratsuka',
      targets: ['hiratsuka', 'otani', 'otani2', ...(O.four === 'loyal' ? ['wakisaka', 'kutsuki', 'ogawa', 'akaza'] : [])] });
    S.flags.betrayT = S.t;
  };
  if (O.kobaya === 'history') {
    at(H(12, 0), 'toi', (S) => S.emit('toi_deppo'));
    at(H(12, 6), 'betray', (S) => { betray(S); S.emit('kobaya_betray'); });
  } else if (O.kobaya === 'early') {
    at(H(8, 25), 'betray', (S) => { betray(S); S.emit('kobaya_early'); });
  } else if (O.kobaya === 'neutral') {
    at(H(12, 0), 'toi', (S) => S.emit('toi_deppo'));
    at(H(12, 6), 'kneutral', (S) => S.emit('kobaya_neutral'));
  } else if (O.kobaya === 'west') {
    at(H(12, 0), 'kwest', (S) => { U(S, 'kobayakawa').q = 0.9; U(S, 'kobayakawa').speed = 1.1; attack(S, 'kobayakawa', 'todo'); S.emit('kobaya_west'); });
  }
  when('otani_push', (S) => S.flags.betrayT && S.t >= S.flags.betrayT + 900 && !isBroken(U(S, 'otani')), (S) => S.emit('otani_push'));
  // 脇坂ら4隊
  when('four', (S) => S.flags.betrayT && S.t >= S.flags.betrayT + 1500, (S) => {
    if (O.four === 'history') {
      for (const id of ['wakisaka', 'kutsuki', 'ogawa', 'akaza']) { U(S, id).side = 'E'; U(S, id).speed = 1.0; }
      attack(S, 'wakisaka', 'otani'); attack(S, 'kutsuki', 'otani'); attack(S, 'ogawa', 'hiratsuka'); attack(S, 'akaza', 'otani');
      for (const id of ['otani', 'otani2', 'hiratsuka']) U(S, id).morale -= 0.2;
      S.emit('four_betray');
    } else {
      attack(S, 'wakisaka', 'kobayakawa'); attack(S, 'ogawa', 'kobayakawa'); attack(S, 'kutsuki', 'kobayakawa'); attack(S, 'akaza', 'kobayakawa');
      S.emit('four_loyal');
    }
  });
  // 西軍の崩壊の連鎖
  when('shimazu_shoot', (S) => O.shimazu === 'history' && S.t >= H(12, 0) && S.units.some((u) => u.side === 'W' && u.status === 'rout' && u.contacts.includes(U(S, 'shimazu'))),
    (S) => S.emit('shimazu_shoot'));
  when('shimazu_shoot_late', (S) => O.shimazu === 'history' && S.flags.breakoutReady && !S.fired.has('shimazu_shoot'), (S) => S.emit('shimazu_shoot'));
  // ───── 島津の退き口 ─────
  // 西軍が崩れると、島津は敵中に取り残される。前へ（家康本陣の前→関ヶ原宿→伊勢街道）突き抜けて逃げる。
  // 追手（井伊・松平忠吉・本多）は騎馬で島津より少し速く、放っておけば追いつく。
  // 追手が迫るたびに、島津は追手との間に捨て奸を一組残す。捨て奸は追手の大将を撃ち、1〜2分で全滅する。
  // そのあいだに本隊が距離を稼ぎ、追手がまた詰める——を繰り返す。最後は豊久が殿に残り、長寿院が身代わりになる。
  const CHASERS = ['ii', 'tadayoshi', 'honda'];
  const V_SHIMAZU = 1.5, V_CHASE = 2.1;   // m/s
  const SUTE_MARGIN = 130;                  // 追手が本隊に接する130m手前で捨て奸を残す
  const rearOf = (S) => U(S, 'shimazu');   // 列の最後尾は義弘の本隊（豊久は列の前を進み、最後に殿として引き返す）
  // 道（route）の上で、u に最も近い先の経由点
  const nextOnRoute = (R, u) => {
    let i = 0;
    for (let k = 1; k < R.length; k++) if (Math.hypot(R[k][0] - u.x, R[k][1] - u.z) < Math.hypot(R[i][0] - u.x, R[i][1] - u.z)) i = k;
    if (i < R.length - 1 && Math.hypot(R[i + 1][0] - u.x, R[i + 1][1] - u.z) < Math.hypot(R[i + 1][0] - R[i][0], R[i + 1][1] - R[i][1])) i++;
    return i;
  };
  when('breakout', (S) => O.shimazu === 'history' && broken(S, 'ishida', 'ukita', 'konishi') && !isBroken(U(S, 'shimazu')), (S) => {
    S.flags.breakoutReady = true; S.emit('shimazu_alone');
  });
  when('breakout_go', (S) => S.flags.breakoutReady && S.fired.has('shimazu_shoot') && S.t >= (S.flags.breakoutAt ||= S.t + 300), (S) => {
    const P = (lo, la) => S.xz(lo, la);
    // 島津陣から田を突っ切って家康本陣（陣場野）の前をかすめ、関ヶ原宿で伊勢街道に入って南へ
    // （data/geo.json の伊勢街道を 40m の許容で間引き、折り返しのとげを除いたもの。街道を引き直したら合わせる）
    const route = [P(136.4625, 35.3650), P(136.4672, 35.3629), P(136.4680, 35.3621), P(136.4685, 35.3571), P(136.4692, 35.3558), P(136.4715, 35.3548),
      P(136.4739, 35.3526), P(136.4786, 35.3539), P(136.4817, 35.3530), P(136.4815, 35.3489), P(136.4817, 35.3454), P(136.4840, 35.3428),
      P(136.4856, 35.3413), P(136.4892, 35.3377), P(136.4899, 35.3347), P(136.4946, 35.3321), P(136.4944, 35.3306)];
    setOrder(S, 'shimazu', { type: 'path', pts: route.slice(), i: 0, speed: V_SHIMAZU });
    setOrder(S, 'toyohisa', { type: 'path', pts: route.slice(), i: 0, speed: V_SHIMAZU * 1.01 }); // 豊久の隊は列の前を進む
    S.flags.breakoutT = S.t; S.flags.route = route;
    S.emit('breakout', { shimazuN: Math.round(U(S, 'shimazu').n) });
  });
  // 追撃開始。追手はまず島津と同じ道筋に入る（島津へ一直線に向かうと家康本隊にぶつかって進めない）
  when('pursuit', (S) => S.flags.breakoutT && S.t >= S.flags.breakoutT + 90, (S) => {
    S.flags.chasing = Object.fromEntries(CHASERS.map((id) => [id, true]));
    for (const id of CHASERS) U(S, id).speed = V_CHASE;
    S.emit('pursuit');
  });
  // 追手の動き: 遠ければ道をたどり、間近なら直接斬りかかる
  rules.push({ id: 'chase', repeat: true, when: (S) => S.flags.chasing && U(S, 'shimazu').status !== 'gone', fn: (S) => {
    const R = S.flags.route, s = U(S, 'shimazu'), rear = rearOf(S);
    for (const id of CHASERS) {
      if (!S.flags.chasing[id]) continue;
      const u = U(S, id);
      if (isBroken(u)) { S.flags.chasing[id] = false; continue; }
      if (S.t < (u.stunUntil || 0)) continue;            // 落馬などで一時止まっている
      const d = Math.hypot(rear.x - u.x, rear.z - u.z);
      if (d < 260) { if (u.order.type !== 'attack' || u.order.target !== rear.id) attack(S, id, rear.id); u.speed = V_CHASE; continue; }
      const o = u.order;
      if (o.type === 'path' && o.chase && o.i < o.pts.length) continue;
      const i0 = nextOnRoute(R, u), i1 = Math.max(i0 + 1, Math.min(R.length, (s.order.i || 0) + 1));
      setOrder(S, id, { type: 'path', pts: R.slice(i0, i1), i: 0, speed: V_CHASE, chase: true });
    }
  } });
  // 捨て奸: 追手が迫った瞬間に、追手と列の最後尾のあいだへ一組残す
  rules.push({ id: 'sute_drop', repeat: true, when: (S) => S.flags.chasing && !S.flags.rearStand && U(S, 'shimazu').order.type === 'path' && S.t >= (S.flags.suteCool || 0), fn: (S) => {
    const s = U(S, 'shimazu'), rear = rearOf(S);
    let best = null, bd = 1e9;
    for (const id of CHASERS) {
      const u = U(S, id);
      if (!S.flags.chasing[id] || isBroken(u)) continue;
      const d = Math.hypot(u.x - rear.x, u.z - rear.z);
      if (d < bd) { bd = d; best = u; }
    }
    if (!best || bd > best.r + s.r + 25 + SUTE_MARGIN) return;
    // 追手の目の前にまだ生きた捨て奸がいれば、次は残さない
    if (S.units.some((u) => u.hidden && u.used && u.status !== 'gone' && Math.hypot(u.x - best.x, u.z - best.z) < best.r + 70)) return;
    const d = S.units.find((u) => u.hidden && u.status === 'gone' && !u.used);
    if (!d || s.n < 120) return;
    const k = Math.max(20, Math.min(50, Math.round(s.n * 0.08)));   // 本隊から20〜50人
    s.n -= k;
    const ux = (best.x - rear.x) / bd, uz = (best.z - rear.z) / bd;
    const face = (Math.atan2(ux, -uz) * 180 / Math.PI + 360) % 360;   // 追手の方を向く
    Object.assign(d, { used: true, n: k, n0: k, killed: 0, status: 'hold', morale: 1, morale0: 1, q: 2.5, fort: 1, frail: 8, noRout: true, msens: 0.3,
      x: rear.x + ux * (s.r + 60), z: rear.z + uz * (s.r + 60), face, homeFace: face, r: 14 });
    d.hx = d.x; d.hz = d.z; d.order = { type: 'hold' };
    const x0 = d.x, z0 = d.z; d.def0x = () => x0; d.def0z = () => z0;
    S.flags.suteCool = S.t + 60; S.flags.suteCount = (S.flags.suteCount || 0) + 1;
    S.emit('sute:' + d.id, { unit: d.id, n: k });
  } });
  // 捨て奸を片づけた追手は、隊を立て直すのにしばらく止まる
  rules.push({ id: 'sute_cleared', repeat: true, when: (S) => S.flags.chasing && S.units.some((u) => u.hidden && u.used && u.status === 'gone' && !u.cleared), fn: (S) => {
    for (const g of S.units) {
      if (!(g.hidden && g.used && g.status === 'gone' && !g.cleared)) continue;
      g.cleared = true;
      for (const id of CHASERS) { const u = U(S, id); if (S.flags.chasing[id] && Math.hypot(u.x - g.x, u.z - g.z) < u.r + 60) { u.stunUntil = Math.max(u.stunUntil || 0, S.t + 40); setOrder(S, id, { type: 'hold' }); } }
    }
  } });
  when('sutegamari', (S) => S.fired.has('sute:sute1'), (S) => S.emit('sutegamari'));
  when('sute_again', (S) => (S.flags.suteCount || 0) >= 9, (S) => S.emit('sute_again'));
  // 追手の大将が撃たれるのは、捨て奸か殿と接している時
  const vsRearguard = (u) => u.contacts.some((c) => (c.hidden || c.blocker || c.id === 'toyohisa') && c.side !== u.side);
  when('ii_wound', (S) => S.flags.chasing && (S.flags.suteCount || 0) >= 6 && vsRearguard(U(S, 'ii')), (S) => {
    const ii = U(S, 'ii');
    ii.morale -= 0.3; S.flags.chasing.ii = false; setOrder(S, 'ii', { type: 'hold' }); // 大将を撃たれた井伊隊は追撃をやめる
    S.emit('ii_wound');
  });
  when('honda_fall', (S) => S.flags.chasing && (S.flags.suteCount || 0) >= 4 && vsRearguard(U(S, 'honda')), (S) => {
    const h = U(S, 'honda'); h.morale -= 0.1; h.stunUntil = S.t + 120; setOrder(S, 'honda', { type: 'hold' }); // 馬を替えて、また追う
    S.emit('honda_fall');
  });
  // 豊久、殿に残る: 道の終わり近くで追手がまた迫った時
  when('toyohisa_stand', (S) => S.flags.chasing && U(S, 'toyohisa').order.type === 'path' && (U(S, 'shimazu').order.i >= 15 || (U(S, 'shimazu').order.i >= 11 &&
    CHASERS.some((id) => S.flags.chasing[id] && Math.hypot(U(S, id).x - U(S, 'toyohisa').x, U(S, id).z - U(S, 'toyohisa').z) < 320))), (S) => {
    // 列の前から本隊の後ろへ引き返し、追手の前に立ちふさがる
    const t = U(S, 'toyohisa'), s = U(S, 'shimazu');
    let best = null, bd = 1e9;
    for (const id of CHASERS) { const u = U(S, id); if (!S.flags.chasing[id]) continue; const d = Math.hypot(u.x - s.x, u.z - s.z); if (d < bd) { bd = d; best = u; } }
    const ux = best ? (best.x - s.x) / bd : 0, uz = best ? (best.z - s.z) / bd : 1;
    const x0 = s.x + ux * (s.r + t.r + 15), z0 = s.z + uz * (s.r + t.r + 15);
    setOrder(S, 'toyohisa', { type: 'move', x: x0, z: z0 }); t.speed = 4;
    Object.assign(t, { blocker: true, noRout: true, fort: 1, frail: 5, face: (Math.atan2(ux, -uz) * 180 / Math.PI + 360) % 360 });
    t.def0x = () => x0; t.def0z = () => z0;
    S.flags.rearStand = S.t;
    S.emit('toyohisa_stand');
  });
  // 豊久は追手と4分戦うか、兵が尽きたら討たれる
  when('toyohisa_die', (S) => { if (!S.flags.rearStand) return false; const t = U(S, 'toyohisa'); if (t.fighting) S.flags.tyFight = (S.flags.tyFight || 0) + 2; return t.n < 60 || S.flags.tyFight >= 240; }, (S) => {
    const t = U(S, 'toyohisa'); t.killed += t.n; t.n = 0; t.status = 'gone'; S.emit('toyohisa_die');
  });
  // 長寿院盛淳: 追撃のさなか、義弘の陣羽織をまとって名乗りを上げ、大きめの一隊で追手を引きつける
  when('chojuin', (S) => (S.flags.suteCount || 0) >= 10 && !S.flags.rearStand && U(S, 'shimazu').order.type === 'path', (S) => {
    const s = U(S, 'shimazu'), d = S.units.find((u) => u.hidden && u.status === 'gone' && !u.used);
    let best = null, bd = 1e9;
    for (const id of CHASERS) { const u = U(S, id); if (!S.flags.chasing[id]) continue; const dd = Math.hypot(u.x - s.x, u.z - s.z); if (dd < bd) { bd = dd; best = u; } }
    const k = Math.round(s.n * 0.10); s.n -= k;
    if (d && best) {
      const ux = (best.x - s.x) / bd, uz = (best.z - s.z) / bd, face = (Math.atan2(ux, -uz) * 180 / Math.PI + 360) % 360;
      Object.assign(d, { used: true, n: k, n0: k, killed: 0, status: 'hold', morale: 1, morale0: 1, q: 2.5, fort: 1, frail: 4, noRout: true, msens: 0.3,
        x: s.x + ux * (s.r + 25), z: s.z + uz * (s.r + 25), face, homeFace: face, r: 20 });
      d.hx = d.x; d.hz = d.z; d.order = { type: 'hold' };
      const x0 = d.x, z0 = d.z; d.def0x = () => x0; d.def0z = () => z0;
      S.flags.suteCool = S.t + 120;
    } else s.killed += k;
    S.emit('chojuin');
  });
  when('shimazu_escape', (S) => { const o = U(S, 'shimazu').order; return o.type === 'path' && o.i >= o.pts.length; }, (S) => {
    // 義弘は逃げ切った。追手は、まだ道に踏みとどまる豊久へ向かう
    const ty = U(S, 'toyohisa'), tyAlive = S.flags.rearStand && ty.status !== 'gone';
    if (S.flags.chasing) for (const id of CHASERS) { const on = S.flags.chasing[id]; S.flags.chasing[id] = false; if (isBroken(U(S, id))) continue; if (on && tyAlive) attack(S, id, 'toyohisa'); else setOrder(S, id, { type: 'hold' }); }
    const s = U(S, 'shimazu'); s.status = 'gone';
    S.emit('shimazu_escape', { n: Math.round(s.n + (U(S, 'toyohisa').status === 'gone' || isBroken(U(S, 'toyohisa')) ? 0 : U(S, 'toyohisa').n)) });
  });
  when('shimazu_legacy', (S) => S.fired.has('shimazu_escape') && S.t >= S.log.find((e) => e.id === 'shimazu_escape').t + 60, (S) => S.emit('shimazu_legacy'));
  // 勝敗
  when('east_win', (S) => !S.result && broken(S, 'ishida', 'ukita', 'konishi', 'otani') &&
    (O.kobaya !== 'west' || isBroken(U(S, 'kobayakawa'))), (S) => {
    S.result = { winner: 'E', t: S.t }; S.emit('east_win');
  });
  when('west_win', (S) => !S.result && (isBroken(U(S, 'ieyasu')) || eastFrontBroken(S)), (S) => {
    S.result = { winner: 'W', t: S.t }; S.emit('west_win');
    for (const u of S.units) if (u.side === 'E' && !isBroken(u) && u.id !== 'ieyasu') rout(S, u, 'collapse');
  });
  when('nangu_withdraw', (S) => S.result && S.result.winner === 'E' && S.t >= S.result.t + 1500, (S) => {
    for (const id of ['mori', 'kikkawa', 'ankokuji', 'natsuka', 'chosokabe']) {
      const u = U(S, id); if (isBroken(u)) continue;
      const to = u.retreat; u.status = 'rout'; u.order = { type: 'flee', x: to[0], z: to[1] }; u.speed = 0.9;
    }
    S.emit('nangu_withdraw');
  });
  when('mop', (S) => S.result && S.result.winner === 'E', (S) => {
    // 残る西軍への掃討
    for (const u of S.units) if (u.side === 'E' && u.order.type === 'hold' && !['ieyasu', 'ikeda', 'asano', 'yamauchi', 'arima', 'ii', 'tadayoshi', 'honda', 'kobayakawa'].includes(u.id)) {
      const e = S.units.find((w) => w.side === 'W' && !isBroken(w) && w.order.type !== 'aloof' && w.order.type !== 'idle' && w.order.type !== 'path' && Math.hypot(w.x - u.x, w.z - u.z) < 1500);
      if (e) setOrder(S, u.id, { type: 'attack', target: e.id });
    }
  });
  when('kubi', (S) => S.result && S.result.winner === 'E' && S.t >= Math.max(H(15, 0), S.result.t + 2400) && (S.fired.has('shimazu_escape') || O.shimazu !== 'history' || S.t > H(16, 0)), (S) => {
    S.emit('kubi'); S.flags.kubiT = S.t;
  });
  // その後（三成の最期まで）
  ['epi_capture', 'epi_gate', 'epi_kaki', 'epi_execution'].forEach((id, i) => {
    when(id, (S) => S.flags.kubiT && S.t >= S.flags.kubiT + 180 * (i + 1), (S) => { S.emit(id); if (id === 'epi_execution') S.flags.overAt = S.t + 120; });
  });
  when('over', (S) => S.flags.overAt && S.t >= S.flags.overAt, (S) => { S.over = true; });
  when('end_w', (S) => S.result && S.result.winner === 'W' && S.t >= S.result.t + 2400, (S) => { S.over = true; });
  when('draw', (S) => !S.result && S.t >= H(17, 0) - 4, (S) => { S.result = { winner: 'D', t: S.t }; S.emit('draw'); S.over = true; });

  // 蒲生郷舎は石田隊の前衛として最後まで踏みとどまり、本隊とともに崩れる
  when('gamo_merge', (S) => !isBroken(U(S, 'gamo')) && !isBroken(U(S, 'ishida')) && U(S, 'gamo').n < 0.4 * U(S, 'gamo').n0, (S) => {
    const g = U(S, 'gamo'), i = U(S, 'ishida');
    S.emit('gamo_merge', { n: Math.round(g.n) });
    i.n += g.n; i.morale = Math.min(i.morale0, i.morale + 0.05); g.n = 0; g.status = 'gone';
  });
  when('gamo_fall', (S) => isBroken(U(S, 'ishida')) && !isBroken(U(S, 'gamo')), (S) => { U(S, 'gamo').noRout = false; rout(S, U(S, 'gamo'), 'collapse'); });
  // 大谷隊の壊滅で西軍の南翼が開く
  when('flank', (S) => isBroken(U(S, 'otani')), (S) => { for (const id of ['ukita', 'konishi']) U(S, id).morale -= 0.15; });
  for (const [uid, ev] of Object.entries(ROUT_EVENTS)) when('re_' + uid, (S) => S.fired.has('rout:' + uid) || (S.byId[uid].status === 'gone'), (S) => S.emit(ev));
  const brain = (S) => {
    for (const r of rules) if ((r.repeat || !S.fired.has('rule:' + r.id)) && r.when(S)) { if (!r.repeat) S.fired.add('rule:' + r.id); r.fn(S); }
  };
  return brain;
}

function eastFrontBroken(S) {
  const ids = ['fukushima', 'ii', 'tadayoshi', 'kuroda', 'hosokawa', 'kato', 'tanaka', 'todo', 'kyogoku', 'terazawa', 'tsutsui', 'ikeda', 'asano'];
  let n0 = 0, b = 0;
  for (const id of ids) { const u = S.byId[id]; n0 += u.n0; if (isBroken(u)) b += u.n0; }
  return b / n0 > 0.6;
}

// 敗走イベントに固有カードを割り当てる
export const ROUT_EVENTS = { otani: 'yoshitsugu', hiratsuka: 'hiratsuka_die', konishi: 'konishi_flee', ukita: 'ukita_flee', ishida: 'mitsunari_flee' };

// 退却後の標的選び（寝返り部隊は近い西軍を、東軍は島津・南宮山を避ける）
export function retarget(S, u) {
  let best = null, bd = 2200;
  for (const e of S.units) {
    if (e.side === u.side || isBroken(e)) continue;
    if (e.order.type === 'aloof' || e.order.type === 'idle' || e.order.type === 'path') continue;
    const d = Math.hypot(e.x - u.x, e.z - u.z);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}


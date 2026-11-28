// 史実シナリオ：武将の判断ルール＋イベント（解説カード）＋もしも（if）
import { setOrder, rout, isBroken } from './sim.js';

const H = (h, m = 0) => h * 3600 + m * 60;

// 部隊ごとの能力（q=戦闘力倍率, fort=陣地の守りの堅さ, morale=初期士気, msens=損害に対する士気の脆さ, retreat=敗走先）
export const PARAMS = {
  ishida: { q: 1.25, fort: 2.2, homeR: 400, msens: 0.7, retreat: [136.4470, 35.3890] },
  sakon: { q: 1.4, fort: 1.8, retreat: [136.4470, 35.3890] },
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

// もしも（if）の選択肢。先頭が史実（通説）。
export const OPTIONS = [
  { id: 'kobaya', label: '小早川秀秋', choices: [['history', '正午、問鉄砲を受けて寝返る（通説）'], ['early', '開戦まもなく寝返る（新説）'], ['neutral', '最後まで松尾山で傍観'], ['west', '西軍として東軍に攻めかかる']] },
  { id: 'four', label: '脇坂ら4隊', choices: [['history', '小早川に続いて寝返る'], ['loyal', '西軍に留まり大谷隊を助ける']] },
  { id: 'kikkawa', label: '吉川広家', choices: [['history', '道を塞ぎ、南宮山の毛利勢は動かず'], ['open', '道を開け、毛利勢が家康の背後を突く']] },
  { id: 'shimazu', label: '島津義弘', choices: [['history', '要請を断り孤高、最後に敵中突破'], ['fight', '三成の要請に応じて参戦']] },
  { id: 'open', label: '開戦', choices: [['history', '井伊直政・松平忠吉の抜け駆け'], ['fukushima', '先鋒・福島正則が一番に攻める']] },
];
export const DEFAULT_OPTS = Object.fromEntries(OPTIONS.map((o) => [o.id, 'history']));

// ── イベント（解説カード）。tag: 史実＝諸史料が一致 / 通説＝広く流布するが史料的検討の余地 / 逸話＝後世の軍記・伝承 / 異説 / うんちく / もしも
export const EVENTS = {
  intro: { title: '関ヶ原、夜明け', tag: 'うんちく', cam: 'overview',
    body: '慶長5年9月15日（1600年10月21日）。前夜からの雨の中、石田三成ら西軍は大垣城を出て夜のうちに関ヶ原へ移り、西側の山々に陣を敷いた。東軍もこれを追って盆地に入る。盆地には深い霧が立ちこめていた。' },
  fuwa: { title: 'なぜ関ヶ原なのか', tag: 'うんちく', cam: 'top',
    body: '関ヶ原は古代の三関の一つ「不破関」が置かれた交通の要衝で、中山道・北国脇往還・伊勢街道がここで交わる。672年の壬申の乱でも戦場になった。家康が最初に陣を置いた桃配山は、大海人皇子が兵に桃を配ったという伝承の地。' },
  hidetada: { title: '来ない3万8千', tag: '史実', cam: 'east', focus: ['ieyasu'],
    body: '徳川の主力のうち約3万8千は、家康の子・秀忠が率いて中山道を進んでいたが、信濃の上田城で真田昌幸に足止めされ、この日の合戦に間に合わなかった。家康の手元の兵の多くは、豊臣恩顧の大名たちだった。' },
  otsu: { title: 'もう一つの戦場、大津城', tag: '史実',
    body: '同じ頃、近江の大津城では東軍の京極高次（京極高知の兄）が籠城し、立花宗茂ら西軍1万以上を引きつけていた。大津城は15日に開城したが、この西軍の精鋭は関ヶ原に間に合わなかった。' },
  fog: { title: '霧が晴れはじめる', tag: '通説', cam: 'overview',
    body: '辰の刻（午前8時頃）、霧が薄れはじめる。100m先も見えないほどの濃霧の中で、両軍は互いの位置を探り合っていた。' },
  nukegake: { title: '先陣は誰か——井伊直政の抜け駆け', tag: '通説', focus: ['ii', 'tadayoshi'], slow: true,
    body: '先鋒は福島正則と決められていた。しかし井伊直政は、初陣同然の娘婿・松平忠吉を連れて福島隊の脇をすり抜ける。福島家の可児才蔵に咎められると「物見（偵察）だ」と言って前に出て、宇喜多隊に鉄砲を撃ちかけた。家康の子に一番槍の功を立てさせるためとされる。' },
  fukushima_first: { title: 'もしも：福島正則が先陣', tag: 'もしも', focus: ['fukushima'], body: '予定どおり先鋒の福島正則が、一番に宇喜多隊へ攻めかかる。' },
  fukushima_clash: { title: '福島正則 vs 宇喜多秀家', tag: '通説', focus: ['fukushima', 'ukita'], slow: true,
    body: '先を越された福島隊が宇喜多隊に猛然と攻めかかる。宇喜多の先鋒・明石全登（掃部）との戦いは激しく、福島隊は何度も押し戻されて旗が後退したと伝わる。' },
  ishida_attack: { title: '石田隊へ殺到する東軍', tag: '通説', focus: ['ishida', 'kuroda', 'hosokawa'], slow: true,
    body: '黒田長政・細川忠興・加藤嘉明・田中吉政・竹中重門らが、三成の笹尾山へ攻めかかる。三成への恨みを抱く豊臣恩顧の大名が多かった。前衛の島左近・蒲生郷舎が柵を盾にこれを迎え撃つ。' },
  otani_front: { title: '藤堂・京極 vs 大谷隊', tag: '通説', focus: ['todo', 'kyogoku', 'otani2'],
    body: '藤堂高虎・京極高知が大谷隊の前面に攻めかかる。戦場の南西では、松尾山の小早川勢がまだ動かずにいる。' },
  gamo_merge: { title: '蒲生郷舎、石田本隊へ退く', tag: '戦況', focus: ['gamo', 'ishida'], slow: true,
    body: '細川忠興・金森長近らの猛攻を受け続けた蒲生郷舎の前衛は、兵の多くを失い、残る兵を率いて笹尾山の石田本隊へ引き下がった。以後は三成の本陣とともに戦う。' },
  sakon: { title: '島左近、撃たれる', tag: '通説', focus: ['sakon', 'kuroda'], slow: true,
    body: '黒田隊は鉄砲隊の一部を側面の丘に回し、島左近の隊を横から撃たせた。左近は重傷を負って退いたとされる。「鬼左近」の最期には諸説あり、生き延びたという伝承も残る。' },
  taiho: { title: '石田隊の大筒', tag: '通説', focus: ['ishida'],
    body: '石田隊は大筒（大砲）を持ち出して東軍に撃ちかけたと伝わる。笹尾山の前は、鉄砲と大筒の硝煙に包まれた。' },
  noroshi: { title: '狼煙、上がる', tag: '通説', focus: ['ishida', 'kobayakawa', 'mori'], cam: 'overview', slow: true,
    body: '三成は笹尾山から狼煙を上げ、松尾山の小早川と南宮山の毛利勢に参戦を促した。挟み撃ちが成れば西軍の勝ちである。しかし、どちらも動かなかった。' },
  bento: { title: '宰相殿の空弁当', tag: '逸話', focus: ['mori', 'kikkawa'], slow: true,
    body: '南宮山の毛利秀元は、前に陣取る吉川広家が動かないため下山できない。吉川は黒田長政を通じて東軍と内通し、毛利家の所領を守る約束を取りつけていた。参戦を催促する長束正家・安国寺恵瓊の使者に、秀元は「いま兵に弁当を食べさせている」と答えたという。秀元の官職（参議＝宰相）にちなんで「宰相殿の空弁当」と呼ばれる。' },
  mori_descend: { title: 'もしも：毛利勢、下山', tag: 'もしも', focus: ['mori', 'kikkawa', 'ikeda', 'asano'], slow: true,
    body: '吉川広家が道を開けた。南宮山の毛利秀元・長宗我部盛親ら2万8千が山を下り、家康の背後を押さえる池田輝政・浅野幸長らに襲いかかる。' },
  shimazu_envoy: { title: '島津、動かず', tag: '逸話', focus: ['shimazu'], slow: true,
    body: '三成の使者・八十島助左衛門が島津の陣に来て加勢を求めた。馬から下りずに口上を述べたため、島津勢は無礼だと怒鳴り返したという。島津豊久は「今日はそれぞれが自分の戦をするまで」と突き放した。前夜の夜襲の献策を三成が退けたことが、確執の原因とも語られる（後世の軍記による）。' },
  mitsunari_visit: { title: '三成みずから島津陣へ', tag: '逸話', focus: ['shimazu', 'ishida'],
    body: '三成自身が馬を飛ばして島津陣を訪れ、出陣を頼んだ。答えは同じだった。島津勢は兵約1,500。陣に近づく者は敵味方を問わず寄せつけず、孤高を保つ。' },
  shimazu_join: { title: 'もしも：島津、参戦', tag: 'もしも', focus: ['shimazu', 'toyohisa'], slow: true,
    body: '島津義弘が三成の要請に応じた。「鬼島津」の精兵が正面の東軍に斬り込む。' },
  ieyasu_move: { title: '家康、本陣を前へ', tag: '通説', focus: ['ieyasu'],
    body: '戦況が膠着するなか、家康は桃配山から陣場野へ本陣を進め、諸隊を督励した。' },
  tsume: { title: '爪を噛む家康', tag: '逸話', focus: ['ieyasu', 'kobayakawa'],
    body: '約束どおり寝返るはずの小早川秀秋が、なかなか動かない。苛立った家康は、若い頃からの癖である爪噛みをしながら「せがれめに謀られたか」とつぶやいたと伝わる。' },
  toi_deppo: { title: '問鉄砲', tag: '通説', focus: ['kobayakawa', 'ieyasu'], slow: true, cam: 'matsuo',
    body: '業を煮やした家康は、松尾山に向けて鉄砲を撃ちかけさせ、秀秋に決断を迫ったという（問鉄砲）。ただし近年は、当時の手紙など一次史料に基づき、小早川は開戦と同時に寝返っていて問鉄砲はなかったとする説（白峰旬ら）も出ている。「もしも」の「新説」で、その展開を試せる。' },
  kobaya_betray: { title: '小早川秀秋、寝返る', tag: '通説', focus: ['kobayakawa', 'hiratsuka', 'otani'], slow: true, cam: 'matsuo',
    body: '松尾山の小早川勢1万5千余が山を駆け下り、西軍の大谷隊へ襲いかかった。勝敗の天秤が大きく傾く。' },
  kobaya_early: { title: '新説：開戦まもなく小早川が寝返る', tag: '異説', focus: ['kobayakawa', 'otani'], slow: true, cam: 'matsuo',
    body: '合戦直後に書かれた手紙などでは、小早川は開戦と同時に西軍を攻め、戦いは短時間で決着したと読める。問鉄砲の話は後世の軍記にしか見えない、というのがこの説の根拠である。' },
  kobaya_neutral: { title: 'もしも：小早川、動かず', tag: 'もしも', focus: ['kobayakawa'], slow: true, cam: 'matsuo',
    body: '問鉄砲にも秀秋は動かない。松尾山の1万5千は最後まで傍観を決めこむ。' },
  kobaya_west: { title: 'もしも：小早川、東軍を攻める', tag: 'もしも', focus: ['kobayakawa', 'todo'], slow: true, cam: 'matsuo',
    body: '秀秋は西軍として松尾山を下り、藤堂・京極隊の側面に襲いかかった。' },
  otani_push: { title: '大谷吉継、裏切りを撃退', tag: '通説', focus: ['otani', 'hiratsuka', 'kobayakawa'], slow: true,
    body: '小早川の裏切りを予期していた吉継は、松尾山に備えていた兵で小早川勢を迎え撃ち、何度も押し返した。兵の数では大きく劣りながらの奮戦だった。' },
  four_betray: { title: '脇坂・朽木・小川・赤座も寝返る', tag: '通説', focus: ['wakisaka', 'ogawa', 'otani'], slow: true,
    body: '大谷隊の備えの内側にいた脇坂安治・朽木元綱・小川祐忠・赤座直保の4隊が、一斉に大谷隊へ攻めかかる。脇坂は事前に東軍に通じていたとされる。挟まれた大谷隊はもはや支えきれない。' },
  four_loyal: { title: 'もしも：4隊は踏みとどまる', tag: 'もしも', focus: ['wakisaka', 'otani'], body: '脇坂ら4隊は寝返らず、大谷隊とともに小早川勢を迎え撃つ。' },
  hiratsuka_die: { title: '平塚為広・戸田勝成、討死', tag: '通説', focus: ['hiratsuka'],
    body: '大谷隊とともに戦った平塚為広・戸田勝成が相次いで討死した。為広は討ち取った敵の首に辞世の歌を添えて吉継に送ったと伝わる。' },
  yoshitsugu: { title: '大谷吉継、自害', tag: '通説', focus: ['otani'], slow: true,
    body: '隊が崩れたのを見て、吉継は自害した。家臣の湯浅五助が主の首を敵に渡さぬよう埋め、その後討ち取られたという。五助を討った藤堂家の藤堂高刑は、首の在処を秘す約束を守ったと伝わる。' },
  konishi_flee: { title: '小西隊、崩れる', tag: '通説', focus: ['konishi'],
    body: '大谷隊の壊滅で側面が開き、小西行長の隊が崩れた。行長は伊吹山中へ逃れたが、のちに捕らえられた。' },
  ukita_flee: { title: '宇喜多隊、総崩れ', tag: '通説', focus: ['ukita'], slow: true,
    body: '西軍最大の宇喜多隊も支えきれずに崩れた。秀家は「金吾（秀秋）めを討ち果たす」と小早川勢へ斬り込もうとして、家臣に止められたという。秀家は落ち延びて薩摩の島津家に匿われ、のちに八丈島へ流された。' },
  mitsunari_flee: { title: '石田隊、潰走——三成は伊吹山へ', tag: '史実', focus: ['ishida'], slow: true,
    body: '最後まで粘った石田隊も崩れ、三成は伊吹山中へ逃れた。数日後、田中吉政の手の者に捕らえられ、10月1日に京の六条河原で小西行長・安国寺恵瓊とともに処刑された。' },
  shimazu_shoot: { title: '味方であっても撃つ', tag: '逸話', focus: ['shimazu'], slow: true,
    body: '崩れた西軍の兵が島津の陣に逃げ込もうとした。島津勢は陣が乱れるのを嫌い、味方であろうと近づく者に容赦なく鉄砲を撃ちかけたという。' },
  breakout: { title: '島津の退き口——前へ退く', tag: '通説', focus: ['shimazu', 'toyohisa', 'ieyasu'], slow: true,
    body: '西軍が崩れ、島津勢は東軍のただ中に取り残された。義弘は退路を後ろの伊吹山ではなく前に求めた。敵の正面を突き破り、家康本陣の前をかすめて伊勢街道を南へ駆け抜ける。' },
  sutegamari: { title: '捨て奸（すてがまり）', tag: '通説', focus: ['sute1', 'shimazu', 'tadayoshi'], slow: true,
    body: '追いすがる東軍に対し、島津勢は数人ずつを道に残して座り込ませ、鉄砲で狙撃させては死ぬまで足止めさせた。残った者が全滅すると、また次の組を残す。「捨て奸」と呼ばれる壮絶な撤退戦法である。' },
  ii_wound: { title: '井伊直政、撃たれる', tag: '通説', focus: ['ii', 'shimazu'], slow: true,
    body: '島津を追った井伊直政は、島津兵（柏木源藤と伝わる）の鉄砲を受けて落馬した。この傷がもとで直政は2年後に没したとされる。松平忠吉も負傷した。' },
  honda_fall: { title: '本多忠勝、落馬', tag: '逸話', focus: ['honda', 'shimazu'],
    body: '本多忠勝も追撃に加わったが、乗馬を撃たれて落馬したという。生涯の戦いで傷一つ負わなかったと伝わる猛将である。' },
  toyohisa_die: { title: '島津豊久、討死', tag: '通説', focus: ['toyohisa'], slow: true,
    body: '殿（しんがり）をつとめた甥の豊久が、烏頭坂（うとうざか）付近で討死した。伯父の義弘を逃がすための戦いだった。' },
  chojuin: { title: '長寿院盛淳、身代わりに', tag: '通説', focus: ['shimazu'],
    body: '家老の長寿院盛淳は、義弘から拝領した陣羽織を着て「島津兵庫頭（義弘）である」と名乗り、敵を引きつけて討死した。' },
  shimazu_escape: { title: '島津義弘、戦場を離脱', tag: '通説', focus: ['shimazu'], slow: true,
    body: '義弘は伊勢街道から伊賀・大坂を経て、海路で薩摩へ帰り着いた。関ヶ原に入った約1,500のうち、帰国できたのは80余人だったという。島津家はその後の交渉で所領を守り抜いた。' },
  nangu_withdraw: { title: '南宮山の諸隊、戦わずに退く', tag: '史実', focus: ['mori', 'chosokabe'], cam: 'nangu',
    body: '本戦が決着し、南宮山の毛利秀元・長宗我部盛親・長束正家・安国寺恵瓊らは一戦も交えずに退いた。吉川広家の内通で守ったはずの毛利家は、戦後に120万石から周防・長門の約30万石に減らされた。' },
  east_win: { title: '東軍の勝利', tag: '史実', cam: 'overview', slow: true,
    body: '西軍の主力が崩れ、天下分け目の戦いは東軍の勝利に終わった。戦いが続いたのはおよそ半日だった。' },
  west_win: { title: 'もしも：西軍の勝利', tag: 'もしも', cam: 'overview', slow: true, body: '東軍が崩れた。歴史は別の道を歩みはじめる。' },
  draw: { title: '日没——決着つかず', tag: 'もしも', cam: 'overview', slow: true, body: '日が暮れ、両軍は兵を収めた。勝敗は翌日以降に持ち越される。' },
  kubi: { title: '勝って兜の緒を締めよ', tag: '逸話', focus: ['ieyasu'], slow: true,
    body: '戦いのあと、家康は藤川台で首実検を行った。このとき初めて兜をかぶり、緒を締めながら「勝って兜の緒を締めよ」と言ったと伝わる。小早川秀秋は戦後に備前・美作を与えられたが、2年後に21歳で没した。' },
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
  when('sakon', (S) => S.t >= H(9, 50) && U(S, 'sakon').fighting && !isBroken(U(S, 'sakon')), (S) => {
    const u = U(S, 'sakon'); u.morale -= 0.35; u.q *= 0.6; S.emit('sakon');
  });
  at(H(10, 12), 'taiho', (S) => { S.flags.cannon = S.t; S.emit('taiho'); });
  at(H(10, 40), 'noroshi', (S) => { S.flags.noroshi = S.t; S.emit('noroshi'); });
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
    const [x, z] = S.xz(136.4760, 35.3668);
    setOrder(S, 'ieyasu', { type: 'move', x, z }); U(S, 'ieyasu').speed = 0.7; S.emit('ieyasu_move');
  });
  at(H(11, 37), 'mitsunari_visit', (S) => { if (O.shimazu === 'history') S.emit('mitsunari_visit'); });
  at(H(11, 48), 'tsume', (S) => { if (O.kobaya === 'history' || O.kobaya === 'neutral') S.emit('tsume'); });
  // 小早川
  const betray = (S) => {
    const k = U(S, 'kobayakawa'); k.side = 'E'; k.speed = 1.1;
    attack(S, 'kobayakawa', 'hiratsuka');
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
  // 島津の退き口
  when('breakout', (S) => O.shimazu === 'history' && broken(S, 'ishida', 'ukita', 'konishi') && !isBroken(U(S, 'shimazu')), (S) => {
    S.flags.breakoutReady = true;
  });
  when('breakout_go', (S) => S.flags.breakoutReady && S.fired.has('shimazu_shoot') && S.t >= (S.flags.breakoutAt ||= S.t + 300), (S) => {
    const P = (lo, la) => S.xz(lo, la);
    const route = [P(136.4668, 35.3672), P(136.4720, 35.3640), P(136.4752, 35.3608), P(136.4745, 35.3540), P(136.4770, 35.3478), P(136.4815, 35.3380), P(136.4850, 35.3300)];
    setOrder(S, 'shimazu', { type: 'path', pts: route.slice(), i: 0, speed: 1.35 });
    setOrder(S, 'toyohisa', { type: 'path', pts: route.slice(0, 5), i: 0, speed: 1.25 });
    S.flags.breakoutT = S.t;
    S.emit('breakout', { shimazuN: Math.round(U(S, 'shimazu').n) });
  });
  when('pursuit', (S) => S.flags.breakoutT && S.t >= S.flags.breakoutT + 420, (S) => {
    attack(S, 'ii', 'shimazu'); attack(S, 'tadayoshi', 'shimazu'); attack(S, 'honda', 'shimazu');
    for (const id of ['ii', 'tadayoshi', 'honda']) U(S, id).speed = 1.5;
  });
  when('sutegamari', (S) => S.fired.has('sute:sute1'), (S) => S.emit('sutegamari'));
  // 捨て奸: 退却中、数人ずつを道に残して死ぬまで足止めさせる（その兵は戻らない）
  rules.push({ id: 'sute_loop', repeat: true, when: (S) => S.flags.breakoutT && U(S, 'shimazu').order.type === 'path' && S.t >= (S.flags.suteNext ||= S.flags.breakoutT + 600), fn: (S) => {
    S.flags.suteNext = S.t + 300;
    const s = U(S, 'shimazu');
    const d = S.units.find((u) => u.hidden && u.status === 'gone' && !u.used);
    if (!d || s.n < 60) return;
    const k = Math.round(s.n * 0.12);
    s.n -= k;
    // 本隊の真後ろ（来た方向）に残し、追手の方を向かせる
    const back = (s.face + 180) % 360, rad = back * Math.PI / 180;
    Object.assign(d, { used: true, n: k, n0: k, killed: 0, status: 'hold', morale: 1, morale0: 1, q: 2.2, fort: 1.3, noRout: true, msens: 0.3,
      x: s.x + Math.sin(rad) * 60, z: s.z - Math.cos(rad) * 60, face: back, homeFace: back, r: 22 });
    d.hx = d.x; d.hz = d.z; d.order = { type: 'hold' };
    const x0 = d.x, z0 = d.z; d.def0x = () => x0; d.def0z = () => z0;
    S.emit('sute:' + d.id, { unit: d.id, n: k });
  } });
  when('ii_wound', (S) => S.flags.breakoutT && S.t >= S.flags.breakoutT + 1000 && (U(S, 'ii').fighting || S.t >= S.flags.breakoutT + 1600), (S) => {
    const ii = U(S, 'ii'), td = U(S, 'tadayoshi');
    ii.morale -= 0.3; setOrder(S, 'ii', { type: 'hold' }); td.morale -= 0.1; // 井伊隊は止まるが、忠吉・本多は追い続ける
    S.emit('ii_wound');
  });
  when('honda_fall', (S) => S.fired.has('ii_wound') && S.t >= S.flags.breakoutT + 1300, (S) => {
    U(S, 'honda').morale -= 0.1; S.emit('honda_fall');
  });
  when('toyohisa_stop', (S) => { const o = U(S, 'toyohisa').order; return o.type === 'path' && o.i >= o.pts.length; }, (S) => {
    setOrder(S, 'toyohisa', { type: 'hold' }); U(S, 'toyohisa').fort = 1.0; U(S, 'toyohisa').msens = 3; U(S, 'toyohisa').noRout = false;
  });
  when('toyohisa_die', (S) => S.flags.breakoutT && (isBroken(U(S, 'toyohisa')) || S.t > S.flags.breakoutT + 3000), (S) => {
    const t = U(S, 'toyohisa'); t.killed += t.n * 0.9; t.n *= 0.1; t.status = 'gone'; S.emit('toyohisa_die');
  });
  when('chojuin', (S) => S.flags.breakoutT && near(S, 'shimazu', 'toyohisa', 3000) && U(S, 'shimazu').order.type === 'path' && U(S, 'shimazu').order.i >= 5, (S) => {
    const s = U(S, 'shimazu'); const k = s.n * 0.25; s.n -= k; s.killed += k; S.emit('chojuin');
  });
  when('shimazu_escape', (S) => { const o = U(S, 'shimazu').order; return o.type === 'path' && o.i >= o.pts.length; }, (S) => {
    for (const id of ['tadayoshi', 'honda']) setOrder(S, id, { type: 'hold' });
    const s = U(S, 'shimazu'); s.status = 'gone'; S.emit('shimazu_escape', { n: Math.round(s.n + (isBroken(U(S, 'toyohisa')) ? 0 : U(S, 'toyohisa').n)) });
  });
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
    for (const u of S.units) if (u.side === 'E' && u.order.type === 'hold' && !['ieyasu', 'ikeda', 'asano', 'yamauchi', 'arima', 'ii', 'tadayoshi', 'honda'].includes(u.id)) {
      const e = S.units.find((w) => w.side === 'W' && !isBroken(w) && w.order.type !== 'aloof' && w.order.type !== 'idle' && w.order.type !== 'path' && Math.hypot(w.x - u.x, w.z - u.z) < 1500);
      if (e) setOrder(S, u.id, { type: 'attack', target: e.id });
    }
  });
  when('kubi', (S) => S.result && S.result.winner === 'E' && S.t >= Math.max(H(15, 0), S.result.t + 2400) && (S.fired.has('shimazu_escape') || O.shimazu !== 'history' || S.t > H(16, 0)), (S) => {
    S.emit('kubi'); S.over = true;
  });
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


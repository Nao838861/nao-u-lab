// 関ヶ原での役回りをもとにした人物紹介用の創作値。合戦の計算とは独立している。
// 武勇＝一騎打ち・先陣の強さ、采配＝兵の動かし方と戦の組み立て、政治＝内政・交渉・統治、魅力＝人を惹きつけ従わせる力
const traits = ['武勇', '采配', '政治', '魅力'];
const ratings = {
  ishida:     [57, 87, 95, 62],
  sakon:      [94, 90, 55, 82],
  gamo:       [88, 74, 50, 64],
  shimazu:    [93, 92, 68, 90],
  toyohisa:   [95, 76, 45, 80],
  konishi:    [69, 80, 82, 70],
  ukita:      [81, 80, 58, 76],
  otani:      [65, 86, 86, 85],
  otani2:     [78, 70, 55, 62],
  hiratsuka:  [86, 77, 58, 72],
  // 図鑑で一人ずつ見せる時の値
  yoshiharu:  [78, 70, 52, 64],
  kinoshita:  [76, 70, 55, 60],
  toda:       [84, 76, 66, 80],
  tamehiro:   [88, 76, 60, 72],
  wakisaka:   [87, 72, 62, 60],
  kutsuki:    [63, 70, 64, 52],
  ogawa:      [70, 67, 60, 50],
  akaza:      [74, 62, 50, 48],
  kobayakawa: [71, 62, 66, 40],
  mori:       [67, 72, 74, 66],
  kikkawa:    [72, 82, 88, 64],
  ankokuji:   [44, 78, 90, 58],
  natsuka:    [58, 74, 94, 50],
  chosokabe:  [80, 72, 55, 62],
  ieyasu:     [73, 96, 99, 90],
  fukushima:  [96, 82, 60, 74],
  ii:         [95, 88, 82, 78],
  tadayoshi:  [83, 67, 62, 74],
  honda:      [98, 89, 52, 86],
  kuroda:     [84, 90, 86, 72],
  takenaka:   [65, 77, 70, 62],
  hosokawa:   [84, 85, 80, 58],
  kato:       [89, 80, 80, 64],
  tanaka:     [74, 80, 88, 72],
  tsutsui:    [74, 70, 56, 55],
  ikoma:      [72, 72, 72, 63],
  kanamori:   [80, 82, 84, 74],
  furuta:     [74, 68, 66, 60],
  oda:        [64, 66, 78, 80],
  todo:       [82, 90, 93, 70],
  kyogoku:    [77, 74, 74, 66],
  terazawa:   [70, 76, 85, 60],
  ikeda:      [77, 85, 87, 82],
  asano:      [85, 79, 76, 72],
  yamauchi:   [69, 77, 80, 82],
  arima:      [71, 69, 72, 66],
};

export const officerRatings = ratings, officerTraits = traits;

// 合同隊のファイル順は部隊名の表記順と同じ。能力は隊単位で、肖像は一人ずつ表示する。
const jointFaces = { otani2: ['otani2.jpg', 'kinoshita.jpg'], hiratsuka: ['toda.jpg', 'hiratsuka.jpg'] };
export function officerPortraitHTML(def, lazy = false) {
  const files = jointFaces[def.id] ?? [def.portrait ?? def.id + '.jpg'];
  const names = def.name.split('・');
  const portraits = files.map((file, i) => {
    const img = `<img ${lazy ? 'loading="lazy" ' : ''}src="img/faces/${file}" alt="${names[i]}の肖像（想像図）">`;
    return files.length === 1 ? img : `<span class="portrait-person">${img}<span>${names[i]}</span></span>`;
  }).join('');
  return files.length === 1 ? portraits : `<span class="portrait-pair">${portraits}</span>`;
}

export function officerProfile(def) {
  const stats = ratings[def.id];
  if (!stats) return '';
  const joint = def.name.includes('・');
  const rows = traits.map((name, i) => `<div class="rating"><span>${name}</span><i aria-hidden="true"><u style="width:${stats[i]}%"></u></i><b>${stats[i]}</b></div>`).join('');
  return `<div class="officer-profile"><div class="portrait-slot"><span>肖像準備中</span></div>
    <div class="ratings"><small>${joint ? '合同隊の評価' : '武将の能力'} ／ 創作値・100点満点</small>${rows}</div></div>`;
}

export function loadOfficerPortrait(container, def) {
  const slot = container.querySelector('.portrait-slot');
  if (!slot) return;
  slot.innerHTML = officerPortraitHTML(def);
}

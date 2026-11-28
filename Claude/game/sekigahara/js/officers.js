// 関ヶ原での役回りをもとにした人物紹介用の創作値。合戦の計算とは独立している。
const traits = ['采配', '武勇', '軍略', '折衝'];
const ratings = {
  ishida:     [84, 57, 89, 83],
  sakon:      [91, 94, 85, 58],
  gamo:       [77, 88, 71, 54],
  shimazu:    [94, 93, 86, 62],
  toyohisa:   [78, 95, 72, 48],
  konishi:    [79, 69, 83, 94],
  ukita:      [87, 81, 73, 68],
  otani:      [91, 65, 95, 85],
  otani2:     [72, 78, 68, 60],
  hiratsuka:  [81, 86, 74, 59],
  wakisaka:   [76, 87, 68, 70],
  kutsuki:    [65, 63, 75, 81],
  ogawa:      [72, 70, 63, 74],
  akaza:      [64, 74, 61, 62],
  kobayakawa: [66, 71, 57, 69],
  mori:       [71, 67, 72, 74],
  kikkawa:    [78, 72, 86, 95],
  ankokuji:   [62, 44, 83, 96],
  natsuka:    [71, 58, 76, 84],
  chosokabe:  [74, 80, 69, 63],
  ieyasu:     [97, 73, 94, 98],
  fukushima:  [89, 96, 71, 55],
  ii:         [92, 95, 81, 76],
  tadayoshi:  [70, 83, 63, 66],
  honda:      [93, 98, 82, 61],
  kuroda:     [88, 84, 92, 93],
  takenaka:   [70, 65, 82, 75],
  hosokawa:   [87, 84, 82, 80],
  kato:       [83, 89, 75, 67],
  tanaka:     [78, 74, 81, 83],
  tsutsui:    [71, 74, 68, 67],
  ikoma:      [73, 72, 70, 75],
  kanamori:   [83, 80, 81, 77],
  furuta:     [69, 74, 66, 70],
  oda:        [62, 64, 70, 91],
  todo:       [88, 82, 91, 90],
  kyogoku:    [76, 77, 71, 79],
  terazawa:   [75, 70, 77, 84],
  ikeda:      [86, 77, 82, 86],
  asano:      [82, 85, 75, 74],
  yamauchi:   [75, 69, 78, 89],
  arima:      [69, 71, 68, 75],
};

export function officerProfile(def) {
  const stats = ratings[def.id];
  if (!stats) return '';
  const joint = def.name.includes('・');
  const rows = traits.map((name, i) => `<div class="rating"><span>${name}</span><i aria-hidden="true"><u style="width:${stats[i]}%"></u></i><b>${stats[i]}</b></div>`).join('');
  return `<div class="officer-profile"><div class="portrait-slot"><span>肖像準備中</span></div>
    <div class="ratings"><small>${joint ? '合同隊の評価・代表肖像' : '武将の能力'} ／ 創作値・100点満点</small>${rows}</div></div>`;
}

export function loadOfficerPortrait(container, def) {
  const slot = container.querySelector('.portrait-slot');
  if (!slot) return;
  const image = new Image();
  image.alt = def.name.includes('・') ? '合同隊の代表肖像（想像図）' : def.name + 'の肖像（想像図）';
  image.onload = () => slot.replaceChildren(image);
  image.src = 'img/faces/' + (def.portrait ?? def.id + '.jpg');
}

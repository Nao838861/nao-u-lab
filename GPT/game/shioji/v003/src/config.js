export const VERSION = 'v003.1.2-tutorialorder';

export const GRID = { width: 24, height: 19, tileW: 68, tileH: 34 };
export const DAY_SECONDS = 1.6;
export const SPEEDS = [0, 1, 2, 4];
export const ROAD_COST = 6;

export const GOODS = {
  log: { name: '丸太', short: '丸太', color: '#9b5f32', dark: '#5b3422', capacity: 28 },
  boards: { name: '木製品', short: '木製品', color: '#e0a653', dark: '#8a552b', capacity: 30 },
  food: { name: '食料', short: '食料', color: '#c7c85a', dark: '#66743f', capacity: 40 },
  tools: { name: '工具', short: '工具', color: '#aab8bd', dark: '#59666f', capacity: 24 },
  stone: { name: '切石', short: '切石', color: '#b7b2a5', dark: '#6d6a67', capacity: 40 },
};

export const BUILDINGS = {
  port: {
    name: '勅許会社港', category: 'fixed', w: 4, h: 3, cost: 0,
    description: '本国との荷が実際に出入りする港です。',
  },
  market: {
    name: '朝市', category: 'fixed', w: 3, h: 3, cost: 0,
    description: '暮らしの品を小口で扱います。大量の材木は集めません。',
  },
  logger: {
    name: '木こり仕事場', category: 'production', w: 3, h: 3, cost: 120,
    description: '森に住み込み、丸太を出荷場へ積みます。',
    inputCaps: {}, outputCaps: { log: 32 }, forestMin: 5,
    interval: 3.2, output: { good: 'log', base: 7, perGrade: 2 },
  },
  woodshop: {
    name: '木工房', category: 'production', w: 3, h: 3, cost: 180,
    description: '丸太を木製品へ加工します。',
    inputCaps: { log: 26 }, outputCaps: { boards: 30 },
    interval: 2.8, input: { good: 'log', amount: 6 }, output: { good: 'boards', base: 5, perGrade: 2 },
  },
  warehouse: {
    name: '中継倉庫', category: 'logistics', w: 3, h: 3, cost: 260,
    description: '産地と港の間で荷を受け止めます。',
    storageCaps: { log: 40, boards: 40, food: 30, tools: 20, stone: 30 },
  },
};

export const UPGRADE_REQUIREMENTS = {
  logger: [
    null,
    { boards: 4 },
    { boards: 8, tools: 2 },
    { boards: 12, tools: 3, stone: 5 },
    { boards: 20, tools: 5, stone: 14 },
  ],
  woodshop: [
    null,
    { boards: 4 },
    { boards: 9, tools: 2 },
    { boards: 14, tools: 4, stone: 6 },
    { boards: 22, tools: 6, stone: 16 },
  ],
  warehouse: [
    null,
    { boards: 8 },
    { boards: 12, tools: 3 },
    { boards: 18, tools: 4, stone: 8 },
    { boards: 26, tools: 6, stone: 18 },
  ],
};

export const GRADE_NAMES = ['野外仕事場', '掘っ立て小屋', '木造工房', '増築工房', '石造工房'];

export const BUILD_TOOLS = [
  { id: 'road', name: '道', icon: '╱', category: 'roads', cost: `${ROAD_COST}/区画` },
  { id: 'logger', name: '木こり', icon: '♜', category: 'production', cost: BUILDINGS.logger.cost },
  { id: 'woodshop', name: '木工房', icon: '⌂', category: 'production', cost: BUILDINGS.woodshop.cost },
  { id: 'warehouse', name: '倉庫', icon: '▤', category: 'logistics', cost: BUILDINGS.warehouse.cost },
];

export const TUTORIAL = [
  {
    id: 'road', title: '雑木林まで道を通す',
    detail: '黄色い道標から、森の手前の道標まで道を延ばしてください。道を選び、始点と終点を結びます。',
    advisor: 'まず町外れの道を森まで繋ぎましょう。荷車は完成した道の上だけを走ります。',
  },
  {
    id: 'logger', title: '森に木こり仕事場を開く',
    detail: '「生産」から木こりを選び、森の中で道に接する3×3の土地へ置きます。',
    advisor: '道沿いの森へ仕事場を。建てた瞬間は立派な家ではなく、野外の作業場から始まります。',
  },
  {
    id: 'logs', title: '最初の丸太を見届ける',
    detail: '木こりの道路側にある出荷場へ、丸太が平積みされるまで待ちます。',
    advisor: '切った丸太は、まず木こりの出荷場へ積まれます。ここが満杯なら搬出が滞っています。',
  },
  {
    id: 'woodshop', title: '道沿いに木工房を置く',
    detail: '木こりと港を結ぶ道の途中へ木工房を置きます。市場の隣である必要はありません。',
    advisor: '木工房は市場ではなく、丸太が届き港へ出しやすい道沿いが好都合です。',
  },
  {
    id: 'haul', title: '一荷の丸太を追う',
    detail: '丸太を積んだ荷車が木工房へ着くまで見届けます。「荷を追う」で経路を追跡できます。',
    advisor: '荷車が出ました。急がず一台を追えば、道が何をしているか見えてきます。',
  },
  {
    id: 'upgrade', title: '木工房を等級1へ増築する',
    detail: '木工房を選び、出荷場の木製品4を使って「増築を予約」します。',
    advisor: '最初の木製品は工房自身へ使いましょう。屋根が掛かれば生産も速くなります。',
  },
  {
    id: 'port', title: '木製品を港へ運ぶ',
    detail: '増築後の木製品は港の輸出ヤードへ向かいます。港の平積みが増えるまで見届けます。',
    advisor: '今度の木製品は港へ。船が来るまで輸出ヤードに積まれ、勝手には消えません。',
  },
  {
    id: 'export', title: '定期船へ木製品を積む',
    detail: '次の定期船は港の輸出ヤードからだけ荷を積みます。輸出代金が会社資金へ入ります。',
    advisor: '船が積むのは、港に届いた荷だけです。出港時の帳簿と山の減り方を一緒にご覧ください。',
  },
  {
    id: 'warehouse', title: '中継倉庫を建てる',
    detail: '「物流」から中継倉庫を選び、道に接する場所へ建てます。森と町の間の荷を受け止めます。',
    advisor: '輸出が始まった島では、荷を一か所へ寄せず中継できます。まず倉庫を一つ建てましょう。',
  },
  {
    id: 'warehouse-check', title: '倉庫の働きを確認する',
    detail: '建てた中継倉庫をクリックし、入荷・保管・出荷の欄を確認してください。',
    advisor: '倉庫は数字だけの箱ではありません。荷車がどこから来て、どこへ出るかをここで確認できます。',
  },
  {
    id: 'complete', title: '第一章達成 — 流れが島をつくる',
    detail: '輸出と中継の流れができました。森、町、港の間に次の流れを作れます。',
    advisor: '一荷の道筋と倉庫の役割を確認できました。ここからは量を増やし、上位等級へ進めます。',
  },
];

export const FIXED = {
  port: { x: 2, y: 14, entrance: { x: 6, y: 15 }, grade: 3 },
  market: { x: 7, y: 12, entrance: { x: 8, y: 15 }, grade: 2 },
  roadHead: { x: 13, y: 11 },
  forestGate: { x: 15, y: 9 },
  suggestedLogger: { x: 16, y: 7 },
  suggestedWoodshop: { x: 11, y: 8 },
};

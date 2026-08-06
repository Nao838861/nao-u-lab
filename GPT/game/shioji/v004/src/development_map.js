const BRANCHES = Object.freeze([
  Object.freeze({
    id: 'harbor',
    label: '港と流通',
    note: '島外との入口から、現物を島内へ運ぶ',
    nodes: Object.freeze([
      Object.freeze({ id: 'port', label: '港', detail: '本国注文と島外取引の入口', state: 'foundation' }),
      Object.freeze({ id: 'market', label: '市場', detail: '世帯が売買し、会社も買い上げる' }),
      Object.freeze({ id: 'warehouse', label: '倉庫', detail: '会社の現物を保管する' }),
    ]),
  }),
  Object.freeze({
    id: 'food',
    label: '食と暮らし',
    note: '日々の食料から、豊かな食卓へ',
    nodes: Object.freeze([
      Object.freeze({ id: 'fisher', label: '漁師', detail: '魚を獲る' }),
      Object.freeze({ id: 'veg', label: '野菜畑', detail: '野菜を育てる' }),
      Object.freeze({ id: 'wheat', label: '麦畑', detail: '麦を育てる' }),
      Object.freeze({ id: 'future-kitchen', label: '保存食工房', detail: '将来案：食を長く蓄える', state: 'future' }),
    ]),
  }),
  Object.freeze({
    id: 'wood',
    label: '森と手仕事',
    note: '丸太を加工し、暮らしと運搬を支える',
    nodes: Object.freeze([
      Object.freeze({ id: 'logger', label: '木こり', detail: '森から丸太を得る' }),
      Object.freeze({ id: 'woodshop', label: '木工房', detail: '丸太から木製品を作る' }),
      Object.freeze({ id: 'cartwright', label: '荷車工房', detail: '木製品と丸太から荷車を作る' }),
      Object.freeze({ id: 'future-shipwright', label: '造船所', detail: '将来案：島外への輸送力を広げる', state: 'future' }),
    ]),
  }),
  Object.freeze({
    id: 'earth',
    label: '地と火',
    note: '地中資源と火を、次の産業へつなぐ',
    nodes: Object.freeze([
      Object.freeze({ id: 'quarryman', label: '採石場', detail: '石材を切り出す' }),
      Object.freeze({ id: 'charburner', label: '炭焼き小屋', detail: '丸太から木炭を作る' }),
      Object.freeze({ id: 'future-mine', label: '鉱山開発', detail: '将来案：鉄鉱石と石炭を掘る', state: 'future' }),
      Object.freeze({ id: 'future-iron-cart', label: '鉄製荷車', detail: '将来案：鉄材で16荷を運ぶ', state: 'future' }),
      Object.freeze({ id: 'future-horse-cart', label: '馬車', detail: '将来案：32荷を速く運ぶ', state: 'future' }),
    ]),
  }),
]);

export function developmentMapView(model) {
  const built = new Map();
  for (const building of model?.buildings ?? []) {
    built.set(building.type, (built.get(building.type) ?? 0) + 1);
  }
  return BRANCHES.map(branch => ({
    ...branch,
    nodes: branch.nodes.map(node => {
      const count = built.get(node.id) ?? 0;
      const state = node.state === 'future' ? 'future'
        : count > 0 || node.state === 'foundation' ? 'active' : 'available';
      return { ...node, count, state };
    }),
  }));
}

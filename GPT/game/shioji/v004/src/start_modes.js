export const START_MODES = Object.freeze({
  tutorial: Object.freeze({
    id: 'tutorial',
    label: 'チュートリアルから',
    shortLabel: 'チュートリアル（未開拓）',
    description: 'ガイドは準備中です。現在は未開拓島から同じ条件で始めます。',
    blank: true,
  }),
  sandbox: Object.freeze({
    id: 'sandbox',
    label: 'ゼロから開拓',
    shortLabel: '未開拓サンドボックス',
    description: '市場・蔵・港だけがある島で、建物と道を自分で配置します。',
    blank: true,
  }),
  test: Object.freeze({
    id: 'test',
    label: 'テスト配置で観察',
    shortLabel: '安定テスト都市',
    description: 'これまでと同じ、人口・道路・産業が動いている検証済み都市です。',
    blank: false,
  }),
});

export function parseStartMode(search = '') {
  const mode = new URLSearchParams(search).get('mode');
  return Object.hasOwn(START_MODES, mode) ? mode : null;
}

export function urlForStartMode(currentUrl, mode) {
  if (!Object.hasOwn(START_MODES, mode)) throw new RangeError(`unknown start mode: ${mode}`);
  const url = new URL(currentUrl);
  url.searchParams.set('mode', mode);
  return url.href;
}

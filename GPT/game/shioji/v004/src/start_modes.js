export const SPRING_START_CALENDAR_OFFSET_DAYS = 60;

export const START_MODES = Object.freeze({
  tutorial: Object.freeze({
    id: 'tutorial',
    label: 'エレナと開拓する',
    shortLabel: 'チュートリアル',
    description: '256×256の島を母港から開き、実際の統計に沿う書状と目標を手がかりに開拓します。',
    blank: true,
  }),
  sandbox: Object.freeze({
    id: 'sandbox',
    label: '自分で島を営む',
    shortLabel: '自由プレイ',
    description: '256×256の島を母港から開き、隊商路線や産業を自由に育てます。',
    blank: false,
  }),
  'big-island': Object.freeze({
    id: 'big-island',
    label: '大きな島（試験）',
    shortLabel: '大きな島（試験）',
    description: '256×256のB2地図で、母港から開拓を試します。',
    blank: false,
  }),
  test: Object.freeze({
    id: 'test',
    label: '見本の町を眺める',
    shortLabel: '見本の町',
    description: 'これまでと同じ、人口・道路・産業が動く検証済みの「見本の町」です。',
    blank: false,
  }),
  caravan: Object.freeze({
    id: 'caravan',
    label: '二つの市場',
    shortLabel: '二つの市場',
    description: '母港と漁郷が荷車道で結ばれた島で、隊商路線を試します。',
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
  url.searchParams.delete('resume');
  url.searchParams.set('mode', mode);
  return url.href;
}

const TYPE_PRESENTATION = Object.freeze({
  operation: ['操作', 'neutral'], departure: ['出発', 'neutral'], arrival: ['到着', 'good'],
  transaction: ['市場取引', 'neutral'], docking: ['船が接岸', 'good'], handling: ['港で荷役', 'neutral'],
  birth: ['出生', 'good'], death: ['死亡・離散', 'bad'], job_move: ['転職・移住', 'warn'],
  inheritance: ['相続・分家', 'warn'], blocked: ['接続不能', 'bad'], notice: ['島からの報せ', 'neutral'],
});

function noticeTitle(message = '') {
  if (message.includes('★本国より注文状')) return ['本国から注文状', 'order'];
  if (message.includes('最終通告')) return ['会社へ最終通告', 'bad'];
  if (message.includes('餓え') || message.startsWith('☠')) return ['餓死', 'bad'];
  if (message.includes('▲Lv')) return ['文化Lv上昇', 'good'];
  if (message.includes('道が繋がっていません')) return ['道が繋がっていません', 'bad'];
  return TYPE_PRESENTATION.notice;
}

export function presentEvent(event) {
  const [title, tone] = event.type === 'notice'
    ? noticeTitle(event.message)
    : TYPE_PRESENTATION[event.type] ?? ['未分類イベント', 'neutral'];
  const details = event.message ?? (event.goods
    ? `${event.goods} ${Math.round((event.qty ?? 0) * 10) / 10}`
    : event.op ? `${event.op.type}${event.ok === false ? '（失敗）' : ''}` : '');
  return {
    ...event,
    title,
    tone,
    details,
    important: ['bad', 'warn', 'order'].includes(tone)
      || ['docking', 'birth', 'death', 'job_move', 'inheritance', 'blocked'].includes(event.type),
  };
}

export function hasEventPresentation(type) {
  return Boolean(TYPE_PRESENTATION[type]);
}

export const OBSERVED_EVENT_TYPES = Object.freeze(Object.keys(TYPE_PRESENTATION));

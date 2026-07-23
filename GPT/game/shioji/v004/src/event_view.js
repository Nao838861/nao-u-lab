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

function familyName(message = '') {
  const name = message.match(/^☠\s*([^家]+)家/)?.[1];
  return name ? `${name}さんの一家` : 'ひとつの家族';
}

function elenaSpeechFor(event, tone) {
  if (event.type === 'docking') {
    return '本国からの船が港に着きました。荷下ろしが始まります。';
  }
  if (event.type === 'birth') {
    return '新しい子どもが生まれました。家族が増えても食料が足りるか、確かめておきましょう。';
  }
  if (event.type === 'death') {
    const family = familyName(event.message);
    return event.message?.includes('離散')
      ? `${family}が島を離れました。次の家族を失わないよう、市場の食料と道を確かめましょう。`
      : `${family}で、食べ物を得られず亡くなった方がいます。市場へ食料が届くよう、漁家か菜園を増やしましょう。`;
  }
  if (event.type === 'job_move') {
    return '仕事を替えた家族が、新しい家へ移りました。空いた家と仕事の変化を見ておきましょう。';
  }
  if (event.type === 'inheritance') {
    return 'ひとつの家族から、新しい世帯が分かれました。新しい家族が住む家と仕事が必要です。';
  }
  if (event.type === 'blocked') {
    return '道が切れて、荷を運べない建物があります。市場からその建物まで、道をつなぎ直しましょう。';
  }
  if (event.type === 'notice' && tone === 'bad' && event.message?.includes('道が繋がっていません')) {
    return '道が切れて、荷を運べない建物があります。市場からその建物まで、道をつなぎ直しましょう。';
  }
  return '';
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
    elenaSpeech: elenaSpeechFor(event, tone),
    important: ['bad', 'warn', 'order'].includes(tone)
      || ['docking', 'birth', 'death', 'job_move', 'inheritance', 'blocked'].includes(event.type),
  };
}

export function hasEventPresentation(type) {
  return Boolean(TYPE_PRESENTATION[type]);
}

export const OBSERVED_EVENT_TYPES = Object.freeze(Object.keys(TYPE_PRESENTATION));

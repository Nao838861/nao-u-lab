import { JOB_LABELS } from './config.js?v=v004.39.0-goods-discovery';

const TYPE_PRESENTATION = Object.freeze({
  operation: ['操作', 'neutral'], departure: ['出発', 'neutral'], arrival: ['到着', 'good'],
  transaction: ['市場取引', 'neutral'], docking: ['船が接岸', 'good'], handling: ['港で荷役', 'neutral'],
  birth: ['出生', 'good'], death: ['死亡・離散', 'bad'], job_move: ['転職・移住', 'warn'],
  inheritance: ['相続・分家', 'warn'], blocked: ['接続不能', 'bad'], notice: ['島からの報せ', 'neutral'],
});

export const EVENT_DISPLAY_POLICY = Object.freeze({
  operation: Object.freeze({ keep: false, reason: '操作結果は操作した場所と状態表示に即時反映される' }),
  departure: Object.freeze({ keep: false, reason: '日常の移動開始は盤面の人と荷車で見える' }),
  arrival: Object.freeze({ keep: false, reason: '日常の移動完了は盤面と在庫へ反映される' }),
  transaction: Object.freeze({ keep: false, reason: '日常売買は市場・台帳・統計で確認できる' }),
  docking: Object.freeze({ keep: false, reason: '定期船の接岸は港の船と荷役表示で見える' }),
  handling: Object.freeze({ keep: false, reason: '一荷ごとの荷役は港の船荷と注文残量で見える' }),
  birth: Object.freeze({ keep: true, reason: '人口が変わる節目で、食料判断に影響する' }),
  death: Object.freeze({ keep: true, reason: '取り返せない人口減を発生時に知らせる' }),
  job_move: Object.freeze({ keep: true, reason: '産業構成と空き家が変わる' }),
  inheritance: Object.freeze({ keep: true, reason: '新世帯と住居需要が生まれる' }),
  blocked: Object.freeze({ keep: true, reason: '物流停止に対してプレイヤーの修正が要る' }),
  notice: Object.freeze({ keep: true, reason: '節目だけを内容で選別する' }),
});

const SIGNIFICANT_NOTICE = /^(★|☠)|注文|最終通告|期限切れ|餓え|離散|食料支援|道が繋がっていません|森が禿げた/;

export function shouldPresentEvent(event) {
  const policy = EVENT_DISPLAY_POLICY[event?.type];
  if (!policy?.keep) return false;
  if (event.type !== 'notice') return true;
  return SIGNIFICANT_NOTICE.test(event.message ?? '');
}

function noticeTitle(message = '') {
  if (message.includes('★本国より注文状')) return ['本国から注文状', 'order'];
  if (message.includes('最終通告')) return ['会社へ最終通告', 'bad'];
  if (message.includes('餓え') || message.startsWith('☠')) return ['餓死', 'bad'];
  if (message.includes('▲Lv')) return ['文化Lv上昇', 'good'];
  if (message.includes('道が繋がっていません')) return ['道が繋がっていません', 'bad'];
  return TYPE_PRESENTATION.notice;
}

function eventHousehold(event, model = null) {
  return model?.households?.find(household => household.id === event.householdId) ?? null;
}

function householdSubject(event, model = null) {
  const household = eventHousehold(event, model);
  const familyName = household?.familyName ?? event.familyName
    ?? event.message?.match(/^☠\s*([^家]+)家/)?.[1] ?? null;
  const job = household?.job ?? event.job ?? event.toJob ?? event.fromJob ?? null;
  const jobLabel = JOB_LABELS[job] ?? job ?? '住民';
  return familyName ? `${jobLabel}の${familyName}家` : `${jobLabel}の家族`;
}

export function eventPlaceLabel(event, model = null) {
  const household = eventHousehold(event, model);
  const buildingId = event?.buildingId ?? household?.buildingId;
  const building = model?.buildings?.find(row => row.id === buildingId);
  if (building) return `${JOB_LABELS[building.type] ?? building.type}の近く`;
  if (!Number.isFinite(event?.x) || !Number.isFinite(event?.y)
    || !Number.isFinite(model?.width) || !Number.isFinite(model?.height)) {
    return '島からの知らせ';
  }
  const horizontal = event.x < model.width * 0.38 ? '西'
    : event.x > model.width * 0.62 ? '東' : '';
  const vertical = event.y < model.height * 0.38 ? '北'
    : event.y > model.height * 0.62 ? '南' : '';
  const direction = `${vertical}${horizontal}` || '中央';
  return `島の${direction}${direction === '中央' ? '' : '側'}`;
}

function elenaSpeechFor(event, tone, model = null) {
  if (event.type === 'docking') {
    return '本国からの船が港に着きました。荷下ろしが始まります。';
  }
  if (event.type === 'birth') {
    return '新しい子どもが生まれました。家族が増えても食料が足りるか、確かめておきましょう。';
  }
  if (event.type === 'death') {
    const family = householdSubject(event, model);
    return event.message?.includes('離散')
      ? `${family}が島を離れました。次の家族を失わないよう、市場の食料と道を確かめましょう。`
      : `${family}で、食べ物を得られず亡くなった方がいます。市場へ食料が届くよう、漁師か野菜畑を増やしましょう。`;
  }
  if (event.type === 'job_move') {
    return `${householdSubject(event, model)}が新しい仕事へ移りました。空いた家と仕事の変化を見ておきましょう。`;
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

export function presentEvent(event, model = null) {
  let [title, tone] = event.type === 'notice'
    ? noticeTitle(event.message)
    : TYPE_PRESENTATION[event.type] ?? ['未分類イベント', 'neutral'];
  const subject = event.householdId !== undefined ? householdSubject(event, model) : null;
  if (event.type === 'death' && subject) title = `${subject}で死亡・離散`;
  else if (event.type === 'birth' && subject) title = `${subject}に子ども`;
  else if (event.type === 'job_move' && subject) title = `${subject}が転職・移住`;
  const details = subject && event.message ? `${subject} — ${event.message}` : event.message ?? (event.goods
    ? `${event.goods} ${Math.round((event.qty ?? 0) * 10) / 10}`
    : event.op ? `${event.op.type}${event.ok === false ? '（失敗）' : ''}`
      : eventPlaceLabel(event, model));
  return {
    ...event,
    title,
    tone,
    details,
    elenaSpeech: elenaSpeechFor(event, tone, model),
    important: ['bad', 'warn', 'order'].includes(tone)
      || ['docking', 'birth', 'death', 'job_move', 'inheritance', 'blocked'].includes(event.type),
  };
}

export function hasEventPresentation(type) {
  return Boolean(TYPE_PRESENTATION[type]);
}

export const OBSERVED_EVENT_TYPES = Object.freeze(Object.keys(TYPE_PRESENTATION));

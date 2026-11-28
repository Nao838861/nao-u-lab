// 筋書きテスト（採用した通説の流れが版の更新で崩れないかの検査。史料照合ではない）: node tools/sim_test.mjs [--if kobaya=neutral,...] [--trace]
import fs from 'node:fs';
import { UNITS } from '../js/units.js';
import { createSim, stepSim, prepare, hhmm, sideTotals, isBroken } from '../js/sim.js';
import { PARAMS, makeBrain, retarget, DEFAULT_OPTS } from '../js/scenario.js';

const M = JSON.parse(fs.readFileSync(new URL('../data/dem.json', import.meta.url)));
const CLON = (M.west + M.east) / 2, CLAT = (M.north + M.south) / 2;
const xz = (lon, lat) => [(lon - CLON) / (M.east - M.west) * M.meters_x, (CLAT - lat) / (M.north - M.south) * M.meters_y];

export function run(opts = {}, trace = false) {
  const S = prepare(createSim(UNITS, xz, PARAMS, { hx: M.meters_x / 2, hz: M.meters_y / 2 }));
  S.retarget = retarget;
  const brain = makeBrain({ ...DEFAULT_OPTS, ...opts });
  const ev = [];
  S.listeners.push((e) => ev.push(`${hhmm(e.t)} ${e.id}${e.n !== undefined ? ' n=' + e.n : ''}`));
  let lastTrace = 0;
  while (!S.over && S.t < 17 * 3600 + 60) {
    stepSim(S, brain);
    if (trace && S.t - lastTrace >= 1800) {
      lastTrace = S.t;
      console.log('--', hhmm(S.t), S.units.filter((u) => !['mori','kikkawa','ankokuji','natsuka','chosokabe','ikeda','asano','yamauchi','arima'].includes(u.id))
        .map((u) => `${u.name.slice(0, 4)}${u.side}:${Math.round(u.n)}/${u.morale.toFixed(2)}${u.status === 'rout' ? 'R' : u.status === 'gone' ? 'G' : ''}`).join(' '));
    }
  }
  return { S, ev };
}

const args = process.argv.slice(2);
const opt = {};
const i = args.indexOf('--if');
if (i >= 0) for (const kv of args[i + 1].split(',')) { const [k, v] = kv.split('='); opt[k] = v; }
const { S, ev } = run(opt, args.includes('--trace'));
console.log(ev.filter((e) => !e.includes('gone:')).join('\n'));
const T = sideTotals(S);
console.log(`結果: ${S.result?.winner} @${S.result ? hhmm(S.result.t) : '-'}  西軍損害 ${Math.round(T.W.killed)} / 東軍損害 ${Math.round(T.E.killed)}`);
if (!Object.keys(opt).length) {
  const t = (id) => { const e = S.log.find((x) => x.id === id); return e ? e.t / 3600 : null; };
  const checks = [
    ['小早川寝返り 12:00±30分', Math.abs(t('kobaya_betray') - 12.1) <= 0.5],
    ['大谷吉継の自害 12:40〜13:50', t('yoshitsugu') >= 12.66 && t('yoshitsugu') <= 13.84],
    ['東軍勝利 13:00〜14:45', t('east_win') >= 13 && t('east_win') <= 14.75],
    ['宇喜多潰走は小西潰走より後', t('ukita_flee') >= t('konishi_flee')],
    ['石田隊は正午まで持ちこたえる', t('mitsunari_flee') >= 12.5],
    ['島津の退き口が起きる', t('breakout') !== null],
    ['島津の生還 30〜400', (() => { const e = S.log.find((x) => x.id === 'shimazu_escape'); return e && e.n >= 30 && e.n <= 400; })()],
    ['豊久討死', t('toyohisa_die') !== null],
    ['井伊負傷', t('ii_wound') !== null],
    ['南宮山は戦わず（毛利の損害0）', S.byId.mori.killed < 1],
    ['島左近は撃たれてから崩れる', t('sakon') !== null && t('sakon') <= (t('rout:sakon') ?? 99)],
    ['小西隊は小早川の寝返り後に崩れる', t('konishi_flee') >= t('kobaya_betray')],
    ['島津は退き口まで無傷に近い（9割以上）', (() => { const e = S.log.find((x) => x.id === 'breakout'); return e && e.shimazuN >= 0.9 * 900; })()],
  ];
  let ok = 0;
  for (const [name, pass] of checks) { console.log(pass ? 'PASS' : 'FAIL', name); if (pass) ok++; }
  console.log(`${ok}/${checks.length}`);
  process.exitCode = ok === checks.length ? 0 : 1;
}

// 武将図鑑：顔と能力の一覧 → クリックで一人ずつの読み物
import { officerRatings, officerTraits } from './officers.js';
import { ZUKAN, FATE } from './episodes.js';

const ZK_SIDE = { W: '西軍', E: '東軍' };
const zkEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const zkAge = (z) => (z.born ? 1600 - z.born + 1 : null);
const zkAfter = (z) => (z.died ? z.died - 1600 : null);
const zkTotal = (id) => (officerRatings[id] || []).reduce((a, b) => a + b, 0);

// 並べ替え：key は値を返す（null は末尾）、show は札に大きく出す文字
const ZK_SORTS = [
  { id: 'total', label: '総合', key: (d) => zkTotal(d.id), show: (d) => zkTotal(d.id), lead: '総合' },
  ...officerTraits.map((t, i) => ({ id: 't' + i, label: t, key: (d) => officerRatings[d.id]?.[i], show: (d) => officerRatings[d.id]?.[i], lead: t })),
  { id: 'n', label: '兵数', key: (d) => d.n, show: (d) => d.n.toLocaleString(), lead: '兵', tail: '人' },
  { id: 'young', label: '若い順', key: (d) => { const a = zkAge(ZUKAN[d.id]); return a == null ? null : -a; }, show: (d) => zkAge(ZUKAN[d.id]) ?? '?', tail: '歳' },
  { id: 'old', label: '年長順', key: (d) => zkAge(ZUKAN[d.id]), show: (d) => zkAge(ZUKAN[d.id]) ?? '?', tail: '歳' },
  { id: 'life', label: 'その後の人生', key: (d) => zkAfter(ZUKAN[d.id]), show: (d) => { const y = zkAfter(ZUKAN[d.id]); return y == null ? '?' : y === 0 ? 'この年に没' : 'あと' + y + '年'; }, lead: '関ヶ原の後' },
  { id: 'fate', label: '戦後の明暗', key: (d) => ZUKAN[d.id].fate * 1000 + zkTotal(d.id), show: (d) => FATE[ZUKAN[d.id].fate], lead: '戦後' },
];
const ZK_FILTERS = [
  { id: 'all', label: '全員', f: () => true },
  { id: 'W', label: '西軍', f: (d) => d.side === 'W' },
  { id: 'E', label: '東軍', f: (d) => d.side === 'E' },
  { id: 'betray', label: '寝返り', f: (d) => d.betray },
  { id: 'idle', label: '戦わず', f: (d) => d.idle },
  { id: 'dead', label: '関ヶ原で散る', f: (d) => ZUKAN[d.id].fate <= 1 },
];

const zkRatingRows = (id) => {
  const s = officerRatings[id];
  return officerTraits.map((t, i) => `<div class="rating"><span>${t}</span><i aria-hidden="true"><u style="width:${s[i]}%"></u></i><b>${s[i]}</b></div>`).join('');
};
const zkFace = (d) => 'img/faces/' + (d.portrait ?? d.id + '.jpg');

export function initZukan({ units, onOpen, onLocate }) {
  const list = units.filter((d) => ZUKAN[d.id] && officerRatings[d.id]);
  const root = document.createElement('div');
  root.id = 'zukan';
  root.hidden = true;
  root.tabIndex = -1;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', '武将図鑑');
  root.innerHTML = `<div class="zk-head">
      <h2>武将図鑑 <small>関ヶ原に集った${list.length}隊</small></h2>
      <div class="zk-row"><span>並べ替え</span><div class="zk-chips" data-k="sort">${ZK_SORTS.map((s) => `<button data-v="${s.id}">${s.label}</button>`).join('')}</div></div>
      <div class="zk-row"><span>しぼりこみ</span><div class="zk-chips" data-k="filter">${ZK_FILTERS.map((s) => `<button data-v="${s.id}">${s.label}</button>`).join('')}</div></div>
      <button class="zk-x" title="閉じる (Esc)">×</button>
    </div>
    <div class="zk-grid"></div>
    <p class="zk-note">能力値はこの再現のための創作値。顔は伝来の肖像や逸話をもとにした想像図。</p>
    <div class="zk-pop" hidden><article></article></div>`;
  document.body.appendChild(root);
  const grid = root.querySelector('.zk-grid'), pop = root.querySelector('.zk-pop'), art = pop.querySelector('article');
  const st = { sort: 'total', filter: 'all', order: [], cur: null };

  function render() {
    const S = ZK_SORTS.find((s) => s.id === st.sort), F = ZK_FILTERS.find((f) => f.id === st.filter);
    const rows = list.filter(F.f).map((d) => ({ d, k: S.key(d) }));
    rows.sort((a, b) => (a.k == null) - (b.k == null) || (b.k ?? 0) - (a.k ?? 0) || zkTotal(b.d.id) - zkTotal(a.d.id));
    st.order = rows.map((r) => r.d);
    root.querySelectorAll('.zk-chips button').forEach((b) => b.classList.toggle('on', st[b.parentElement.dataset.k] === b.dataset.v));
    grid.innerHTML = rows.map(({ d }, i) => {
      const z = ZUKAN[d.id];
      const val = S.show(d);
      return `<button class="zk-card ${d.side}" data-id="${d.id}">
        <span class="zk-face"><img loading="lazy" src="${zkFace(d)}" alt=""><i class="sd ${d.side}">${d.side === 'W' ? '西' : '東'}</i><em>${i + 1}</em>
          ${d.betray ? '<i class="zk-tag b">寝返り</i>' : d.idle ? '<i class="zk-tag i">戦わず</i>' : z.fate <= 1 ? '<i class="zk-tag d">散る</i>' : ''}</span>
        <span class="zk-body"><b>${zkEsc(d.name)}</b><small>${zkEsc(z.catch)}</small>
          <span class="zk-val">${S.lead ? `<span>${S.lead}</span>` : ''}<strong${S.id === 'fate' ? ` class="zk-fate f${z.fate}"` : ''}>${zkEsc(val)}</strong>${S.tail ? `<span>${S.tail}</span>` : ''}</span>
          <span class="zk-mini">${officerRatings[d.id].map((v, j) => `<i class="${S.id === 't' + j ? 'on' : ''}">${officerTraits[j]}<b>${v}</b></i>`).join('')}</span></span>
      </button>`;
    }).join('') || '<p class="zk-empty">該当する武将はいません。</p>';
  }

  function show(id) {
    const d = list.find((u) => u.id === id); if (!d) return;
    const z = ZUKAN[id], a = zkAge(z);
    st.cur = id;
    const idx = st.order.findIndex((u) => u.id === id);
    const prev = st.order[(idx - 1 + st.order.length) % st.order.length], next = st.order[(idx + 1) % st.order.length];
    const life = `${z.born ?? '?'}〜${z.died ?? '?'}`;
    art.className = d.side;
    art.tabIndex = -1;
    art.innerHTML = `<button class="zk-x" title="閉じる">×</button>
      <div class="zk-left">
        <img src="${zkFace(d)}" alt="${zkEsc(d.name)}の肖像（想像図）">
        <div class="ratings">${zkRatingRows(id)}</div>
        <dl>
          <dt>陣営</dt><dd>${ZK_SIDE[d.side]}${d.betray ? '（合戦中に寝返り）' : d.idle ? '（戦わず）' : ''}</dd>
          <dt>生没年</dt><dd>${life}</dd>
          <dt>関ヶ原で</dt><dd>${a ? a + '歳（数え）' : '年齢不詳'}</dd>
          <dt>兵数</dt><dd>${d.n.toLocaleString()}（通説）</dd>
          <dt>陣所</dt><dd>${zkEsc(d.place)}</dd>
          <dt>戦後</dt><dd><i class="zk-fate f${z.fate}">${FATE[z.fate]}</i></dd>
        </dl>
      </div>
      <div class="zk-right">
        <p class="zk-yomi">${zkEsc(z.yomi)}</p>
        <h3>${zkEsc(d.name)}</h3>
        <p class="zk-catch">${zkEsc(z.catch)}</p>
        ${z.ep.map((e) => `<section><h4><i class="tag tag-${e.tag}">${e.tag}</i>${zkEsc(e.t)}</h4><p>${zkEsc(e.b)}</p></section>`).join('')}
        <section class="zk-after"><h4>その後</h4><p>${zkEsc(z.after)}</p></section>
        <div class="zk-nav">
          <button data-go="${prev.id}">← ${zkEsc(prev.name)}</button>
          <button class="zk-locate">戦場でこの隊を見る</button>
          <button data-go="${next.id}">${zkEsc(next.name)} →</button>
        </div>
      </div>`;
    pop.hidden = false;
    art.scrollTop = 0;
    art.querySelector('.zk-x').onclick = () => hidePop();
    art.querySelectorAll('[data-go]').forEach((b) => { b.onclick = () => show(b.dataset.go); });
    art.querySelector('.zk-locate').onclick = () => { close(); onLocate?.(id); };
    art.focus?.();
  }
  function hidePop() { pop.hidden = true; st.cur = null; grid.querySelector(`[data-id="${CSS.escape(st.lastId ?? '')}"]`)?.focus(); }

  root.querySelectorAll('.zk-chips button').forEach((b) => {
    b.onclick = () => { st[b.parentElement.dataset.k] = b.dataset.v; render(); };
  });
  grid.onclick = (e) => { const c = e.target.closest('.zk-card'); if (c) { st.lastId = c.dataset.id; show(c.dataset.id); } };
  pop.onclick = (e) => { if (e.target === pop) hidePop(); };
  root.querySelector('.zk-head .zk-x').onclick = () => close();
  root.addEventListener('keydown', (e) => {
    e.stopPropagation(); // 図鑑を開いている間は戦場の操作キー（WASD・スペース）を止める
    if (e.key === 'Escape') { if (!pop.hidden) hidePop(); else close(); }
    else if (!pop.hidden && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const i = st.order.findIndex((u) => u.id === st.cur);
      if (i >= 0) show(st.order[(i + (e.key === 'ArrowRight' ? 1 : -1) + st.order.length) % st.order.length].id);
    }
  });

  function open(id) {
    onOpen?.();
    render();
    root.hidden = false;
    root.focus();
    if (id) show(id);
  }
  function close() { pop.hidden = true; root.hidden = true; }
  return { open, close };
}
